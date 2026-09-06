// src/hooks/useSupabaseCollection.ts
// Generic Supabase collection hook with:
// - Workspace-scoped queries
// - Optimistic updates + rollback on error
// - Realtime Postgres Changes subscription (INSERT / UPDATE / DELETE)
// - LWW merge when receiving realtime payloads

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SyncableEntity } from '../types';
import { mergeWithServerData } from '../lib/syncEngine';

interface UseSupabaseCollectionOptions {
  workspaceId?: string | null;
  /** Column name for workspace filter. Default: 'workspace_id' */
  workspaceColumn?: string;
  /** If true, subscribe to realtime changes on this table */
  realtime?: boolean;
  /** ORDER BY column */
  orderBy?: string;
  orderAscending?: boolean;
}

export function useSupabaseCollection<T extends { id: string }>(
  tableName: string,
  initialFallback: T[],
  options: UseSupabaseCollectionOptions = {},
) {
  const {
    workspaceId,
    workspaceColumn = 'workspace_id',
    realtime = true,
    orderBy = 'created_at',
    orderAscending = false,
  } = options;

  const [data, setData] = useState<T[]>(initialFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to avoid stale closure in realtime handler
  const dataRef = useRef<T[]>(initialFallback);
  useEffect(() => { dataRef.current = data; }, [data]);

  const fetcher = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*').order(orderBy, { ascending: orderAscending });

      if (workspaceId) {
        query = query.eq(workspaceColumn, workspaceId);
      }

      const { data: result, error: err } = await query;

      if (err) {
        setError(err.message);
      } else if (result) {
        // On first load, merge with any local data (LWW) to avoid overwriting optimistic updates
        setData((current) => {
          const hasSyncableFields = result.length > 0 && 'updated_at' in (result[0] ?? {});
          if (!hasSyncableFields || current === initialFallback) {
            return result as T[];
          }
          // Normalise DB snake_case updated_at → camelCase updatedAt for LWW merge
          const normalised = result.map((row: Record<string, unknown>) => ({
            ...row,
            updatedAt: row.updatedAt ?? row.updated_at ?? new Date(0).toISOString(),
          })) as unknown as Array<T & SyncableEntity>;
          const currentSyncable = current as unknown as Array<T & SyncableEntity>;
          return mergeWithServerData(currentSyncable, normalised) as unknown as T[];
        });
        setError(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [tableName, workspaceId, workspaceColumn, orderBy, orderAscending, initialFallback]);

  // Initial fetch
  useEffect(() => {
    void fetcher();
  }, [fetcher]);

  // Realtime subscription
  useEffect(() => {
    if (!realtime || !isSupabaseConfigured || !supabase) return;

    const channelName = workspaceId
      ? `realtime:${tableName}:${workspaceId}`
      : `realtime:${tableName}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(workspaceId ? { filter: `${workspaceColumn}=eq.${workspaceId}` } : {}),
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            const incoming = {
              ...newRecord,
              updatedAt: (newRecord as Record<string, unknown>).updated_at ?? new Date().toISOString(),
            } as T;
            setData((prev) => {
              const exists = prev.some((item) => item.id === incoming.id);
              return exists ? prev : [incoming, ...prev];
            });
          }

          if (eventType === 'UPDATE') {
            const incoming = {
              ...newRecord,
              updatedAt: (newRecord as Record<string, unknown>).updated_at ?? new Date().toISOString(),
            } as T & SyncableEntity;
            setData((prev) =>
              prev.map((item) => {
                if (item.id !== incoming.id) return item;
                // LWW: only replace if server is newer
                const local = item as unknown as SyncableEntity;
                const localTs = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
                const serverTs = new Date(incoming.updatedAt).getTime();
                return serverTs >= localTs ? (incoming as unknown as T) : item;
              }),
            );
          }

          if (eventType === 'DELETE') {
            const deletedId = (oldRecord as Record<string, unknown>).id as string | undefined;
            if (deletedId) {
              setData((prev) => prev.filter((item) => item.id !== deletedId));
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tableName, workspaceId, workspaceColumn, realtime]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const insertItem = async (newItem: Omit<Record<string, unknown>, 'id'>) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const payload = workspaceId
        ? { ...newItem, [workspaceColumn]: workspaceId }
        : newItem;
      const { data: inserted, error: err } = await supabase
        .from(tableName)
        .insert([payload])
        .select();

      if (err) {
        console.error(`[useSupabaseCollection] Error inserting into ${tableName}:`, err.message);
        return null;
      }
      if (inserted && inserted.length > 0) {
        setData((prev) => {
          const exists = prev.some((item) => item.id === (inserted[0] as T).id);
          return exists ? prev : [inserted[0] as T, ...prev];
        });
        return inserted[0];
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const updateItem = async (
    id: string | number,
    updatedFields: Partial<T>,
    idKey = 'id',
  ) => {
    // Optimistic update
    setData((prev) =>
      prev.map((item: Record<string, unknown>) =>
        item[idKey] === id ? { ...item, ...updatedFields } as T : item as T,
      ),
    );

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { error: err } = await supabase
        .from(tableName)
        .update({ ...updatedFields as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq(idKey, id);

      if (err) {
        console.error(`[useSupabaseCollection] Error updating ${tableName}:`, err.message);
        void fetcher(); // Rollback
      }
    } catch (e) {
      console.error(e);
      void fetcher();
    }
  };

  const deleteItem = async (id: string | number, idKey = 'id') => {
    // Optimistic delete
    setData((prev) => prev.filter((item: Record<string, unknown>) => item[idKey] !== id));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { error: err } = await supabase
        .from(tableName)
        .delete()
        .eq(idKey, id);

      if (err) {
        console.error(`[useSupabaseCollection] Error deleting from ${tableName}:`, err.message);
        void fetcher(); // Rollback
      }
    } catch (e) {
      console.error(e);
      void fetcher();
    }
  };

  return {
    data,
    setData,
    loading,
    error,
    insertItem,
    updateItem,
    deleteItem,
    refresh: fetcher,
  };
}