// src/hooks/useSyncedState.ts
// Unified state hook that bridges:
//   1. Supabase (authoritative server)   — online primary source
//   2. IndexedDB (offline cache)         — persists while offline
//   3. localStorage (UI prefs fallback)  — legacy compatibility
//
// Strategy:
//   - Online:  read/write Supabase; mirror to IndexedDB cache
//   - Offline: read IndexedDB; queue writes in offlineQueue; flush on reconnect

import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncableEntity, SyncStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  mergeWithServerData,
  buildSyncPayload,
  pushSyncPayload,
  isOnline,
  onNetworkChange,
} from '../lib/syncEngine';
import {
  enqueueOfflineCommand,
  flushOfflineCommands,
  getPendingCount,
  OfflineCommandType,
} from '../lib/offlineQueue';

// ─── IndexedDB Cache Layer ────────────────────────────────────────────────────

const CACHE_DB_NAME = 'stem-lab-cache';
const CACHE_DB_VERSION = 1;

function openCacheDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      // We store each entity collection as its own object store
    };
  });
}

async function ensureCacheStore(storeName: string): Promise<IDBDatabase> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    // Open with incremented version to create the store if missing
    const existing = window.indexedDB.open(CACHE_DB_NAME);
    existing.onsuccess = () => {
      const currentDb = existing.result;
      if (currentDb.objectStoreNames.contains(storeName)) {
        resolve(currentDb);
        return;
      }
      const nextVersion = currentDb.version + 1;
      currentDb.close();
      const upgrade = window.indexedDB.open(CACHE_DB_NAME, nextVersion);
      upgrade.onupgradeneeded = () => {
        upgrade.result.createObjectStore(storeName, { keyPath: 'id' });
      };
      upgrade.onsuccess = () => resolve(upgrade.result);
      upgrade.onerror = () => reject(upgrade.error);
    };
    existing.onerror = () => reject(existing.error);
  });
  return db;
}

async function readCache<T>(storeName: string): Promise<T[]> {
  try {
    const db = await ensureCacheStore(storeName);
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve((req.result ?? []) as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function writeCache<T>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await ensureCacheStore(storeName);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      for (const item of items) store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[useSyncedState] Cache write failed:', err);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSyncedStateOptions<T> {
  /** Supabase table name */
  tableName: string;
  /** Store name for IndexedDB cache (typically same as tableName) */
  cacheKey: string;
  /** Workspace scope */
  workspaceId: string | null;
  /** Column for workspace filter */
  workspaceColumn?: string;
  /** Entity type for SyncPayload routing */
  entity: ReturnType<typeof buildSyncPayload>['entity'];
  /** Offline queue command type for writes */
  writeCommandType: OfflineCommandType;
  /** Initial data (shown before first fetch, e.g. seeded demo data) */
  fallback: T[];
  /** Whether to enable realtime subscription */
  realtime?: boolean;
}

interface SyncedStateResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  syncStatus: SyncStatus;
  pendingCount: number;
  loading: boolean;
  upsertItem: (item: T) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  flushNow: () => Promise<void>;
}

export function useSyncedState<T extends SyncableEntity>({
  tableName,
  cacheKey,
  workspaceId,
  workspaceColumn = 'workspace_id',
  entity,
  writeCommandType,
  fallback,
  realtime = true,
}: UseSyncedStateOptions<T>): SyncedStateResult<T> {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [pendingCount, setPendingCount] = useState(0);
  const dataRef = useRef<T[]>(fallback);
  useEffect(() => { dataRef.current = data; }, [data]);

  // ─── Load from Cache (offline bootstrap) ───────────────────────────────────
  useEffect(() => {
    void (async () => {
      const cached = await readCache<T>(cacheKey);
      if (cached.length > 0) {
        setData(cached);
      }
      setLoading(false);
    })();
  }, [cacheKey]);

  // ─── Fetch from Supabase ────────────────────────────────────────────────────
  const fetchFromServer = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !isOnline()) return;

    try {
      let query = supabase.from(tableName).select('*').order('updated_at', { ascending: false });
      if (workspaceId) query = query.eq(workspaceColumn, workspaceId);

      const { data: rows, error } = await query;
      if (error || !rows) {
        console.warn(`[useSyncedState] Fetch error on ${tableName}:`, error?.message);
        return;
      }

      // Normalise updated_at → updatedAt
      const normalised = rows.map((row: Record<string, unknown>) => ({
        ...row,
        updatedAt: (row.updatedAt as string | undefined) ?? (row.updated_at as string | undefined) ?? new Date(0).toISOString(),
        version: (row.version as number | undefined) ?? 0,
      })) as T[];

      // LWW merge with local data
      setData((current) => {
        const merged = mergeWithServerData(current, normalised);
        void writeCache(cacheKey, merged);
        return merged;
      });

      setSyncStatus('synced');
    } catch (err) {
      console.error(`[useSyncedState] Server fetch failed for ${tableName}:`, err);
    }
  }, [tableName, workspaceId, workspaceColumn, cacheKey]);

  useEffect(() => {
    void fetchFromServer();
  }, [fetchFromServer]);

  // ─── Realtime Subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!realtime || !isSupabaseConfigured || !supabase || !workspaceId) return;

    const channelName = `synced:${tableName}:${workspaceId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `${workspaceColumn}=eq.${workspaceId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const incoming = {
              ...newRecord,
              updatedAt: (newRecord as Record<string, unknown>).updated_at ?? new Date().toISOString(),
              version: (newRecord as Record<string, unknown>).version ?? 0,
            } as T;

            setData((prev) => {
              let next: T[];
              if (eventType === 'INSERT') {
                next = prev.some((i) => i.id === incoming.id) ? prev : [incoming, ...prev];
              } else {
                next = prev.map((item) => {
                  if (item.id !== incoming.id) return item;
                  const localTs = new Date(item.updatedAt).getTime();
                  const serverTs = new Date(incoming.updatedAt).getTime();
                  return serverTs >= localTs ? incoming : item;
                });
              }
              void writeCache(cacheKey, next);
              return next;
            });
          }

          if (eventType === 'DELETE') {
            const deletedId = (oldRecord as Record<string, unknown>).id as string;
            setData((prev) => {
              const next = prev.filter((i) => i.id !== deletedId);
              void writeCache(cacheKey, next);
              return next;
            });
          }
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [tableName, workspaceId, workspaceColumn, cacheKey, realtime]);

  // ─── Network Change Listener ────────────────────────────────────────────────
  const flush = useCallback(async () => {
    if (!workspaceId) return;

    const result = await flushOfflineCommands(async (command) => {
      const payload = buildSyncPayload(
        command.type.includes('CREATE') ? 'CREATE' : command.type.includes('DELETE') ? 'DELETE' : 'UPDATE',
        entity,
        command.payload as Record<string, unknown>,
      );
      const syncResult = await pushSyncPayload(payload, workspaceId);
      if (!syncResult.success) throw new Error(syncResult.error ?? 'Sync failed');
    });

    const count = await getPendingCount();
    setPendingCount(count);
    setSyncStatus(count === 0 ? 'synced' : 'pending');

    if (result.processed > 0) {
      // Refresh from server after flushing to ensure consistency
      void fetchFromServer();
    }
  }, [workspaceId, entity, fetchFromServer]);

  useEffect(() => {
    const unsubscribe = onNetworkChange((online) => {
      if (online) {
        setSyncStatus('pending');
        void flush();
        void fetchFromServer();
      } else {
        setSyncStatus('offline');
      }
    });

    // Initial pending count
    void getPendingCount().then(setPendingCount);

    return unsubscribe;
  }, [flush, fetchFromServer]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const upsertItem = useCallback(async (item: T) => {
    // Optimistic update
    setData((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists ? prev.map((i) => (i.id === item.id ? item : i)) : [item, ...prev];
      void writeCache(cacheKey, next);
      return next;
    });

    if (!isOnline() || !workspaceId) {
      // Queue for later
      await enqueueOfflineCommand({
        type: writeCommandType,
        payload: item as unknown as Record<string, unknown>,
        idempotencyKey: `${item.id}-${item.updatedAt}`,
      });
      setPendingCount((c) => c + 1);
      setSyncStatus('pending');
      return;
    }

    // Push to Supabase directly
    const payload = buildSyncPayload('UPDATE', entity, item as unknown as Record<string, unknown>);
    const result = await pushSyncPayload(payload, workspaceId);
    if (!result.success) {
      // Fallback to queue
      await enqueueOfflineCommand({
        type: writeCommandType,
        payload: item as unknown as Record<string, unknown>,
        idempotencyKey: `${item.id}-${item.updatedAt}`,
      });
      setPendingCount((c) => c + 1);
      setSyncStatus('pending');
    }
  }, [cacheKey, workspaceId, entity, writeCommandType]);

  const deleteItem = useCallback(async (id: string) => {
    const deleted = dataRef.current.find((i) => i.id === id);
    // Optimistic delete
    setData((prev) => {
      const next = prev.filter((i) => i.id !== id);
      void writeCache(cacheKey, next);
      return next;
    });

    if (!isOnline() || !workspaceId || !deleted) {
      await enqueueOfflineCommand({
        type: writeCommandType,
        payload: { id } as Record<string, unknown>,
        idempotencyKey: `del-${id}-${Date.now()}`,
      });
      setPendingCount((c) => c + 1);
      setSyncStatus('pending');
      return;
    }

    const payload = buildSyncPayload('DELETE', entity, { id } as Record<string, unknown>);
    const result = await pushSyncPayload(payload, workspaceId);
    if (!result.success && deleted) {
      // Rollback
      setData((prev) => {
        const next = [deleted, ...prev];
        void writeCache(cacheKey, next);
        return next;
      });
    }
  }, [cacheKey, workspaceId, entity, writeCommandType]);

  return {
    data,
    setData,
    syncStatus,
    pendingCount,
    loading,
    upsertItem,
    deleteItem,
    flushNow: flush,
  };
}
