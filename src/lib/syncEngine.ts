// src/lib/syncEngine.ts
// Core synchronization engine: deviceId, LWW conflict resolution, Supabase sync.

import { SyncPayload, SyncableEntity } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// ─── Device Identity ──────────────────────────────────────────────────────────

const DEVICE_ID_KEY = 'stem_v3_device_id';

export function getDeviceId(): string {
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ─── SyncPayload Builder ──────────────────────────────────────────────────────

export function buildSyncPayload<T>(
  action: SyncPayload<T>['action'],
  entity: SyncPayload<T>['entity'],
  data: T,
): SyncPayload<T> {
  return {
    action,
    entity,
    data,
    clientTimestamp: Date.now(),
    deviceId: getDeviceId(),
  };
}

// ─── Last-Write-Wins Conflict Resolution ─────────────────────────────────────

/**
 * Resolves conflict between a local (optimistic) record and the server record.
 * Returns the record with the more recent `updatedAt` timestamp.
 * If timestamps are equal, server wins (conservative approach).
 */
export function resolveConflict<T extends SyncableEntity>(
  localRecord: T,
  serverRecord: T,
): { winner: T; hadConflict: boolean } {
  const localTs = new Date(localRecord.updatedAt).getTime();
  const serverTs = new Date(serverRecord.updatedAt).getTime();

  if (localTs > serverTs) {
    return { winner: localRecord, hadConflict: true };
  }
  return { winner: serverRecord, hadConflict: localTs !== serverTs };
}

/**
 * Merges a server payload into a local array using LWW.
 * For each server item, if the local version is newer, keep local; else use server.
 * New server items are appended.
 */
export function mergeWithServerData<T extends SyncableEntity>(
  localData: T[],
  serverData: T[],
): T[] {
  const localMap = new Map(localData.map((item) => [item.id, item]));

  for (const serverItem of serverData) {
    const localItem = localMap.get(serverItem.id);
    if (!localItem) {
      localMap.set(serverItem.id, serverItem);
    } else {
      const { winner } = resolveConflict(localItem, serverItem);
      localMap.set(serverItem.id, winner);
    }
  }

  return Array.from(localMap.values());
}

// ─── Supabase Table Map ───────────────────────────────────────────────────────

type SupabaseTable = 'tasks' | 'schedules' | 'assets' | 'borrow_logs' | 'incidents' | 'profiles' | 'outbox_events';

const ENTITY_TABLE_MAP: Record<SyncPayload<unknown>['entity'], SupabaseTable> = {
  task: 'tasks',
  schedule: 'schedules',
  asset: 'assets',
  loan: 'borrow_logs',
  incident: 'incidents',
  member: 'profiles',
  roster: 'outbox_events', // rosters don't have a dedicated table yet — queue via outbox
  consumable: 'outbox_events',
  merit_log: 'outbox_events',
};

// ─── Supabase Sync Push ───────────────────────────────────────────────────────

export interface SyncResult {
  success: boolean;
  error?: string;
  serverData?: unknown;
}

/**
 * Pushes a single SyncPayload to Supabase.
 * Uses upsert for CREATE/UPDATE, delete for DELETE.
 */
export async function pushSyncPayload<T extends Record<string, unknown>>(
  payload: SyncPayload<T>,
  workspaceId: string,
): Promise<SyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const table = ENTITY_TABLE_MAP[payload.entity];

  // Outbox entities are not directly writable from client — skip silently.
  if (table === 'outbox_events') {
    return { success: true };
  }

  try {
    if (payload.action === 'DELETE') {
      const payloadData = payload.data as unknown as { id?: string };
      const recordId = payloadData?.id;

      if (!recordId) {
        return { success: false, error: 'Missing record ID for DELETE operation' };
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', recordId)
        .eq('workspace_id', workspaceId);
      
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // CREATE or UPDATE — use upsert with version bump
    const record = {
      ...payload.data,
      workspace_id: workspaceId,
      updated_at: new Date(payload.clientTimestamp).toISOString(),
    };

    const { data, error } = await supabase
      .from(table)
      .upsert(record as Record<string, unknown>, { onConflict: 'id' })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, serverData: data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ─── Batch Sync (for offline queue flush) ────────────────────────────────────

export interface BatchSyncResult {
  processed: number;
  failed: number;
  conflicts: Array<{ id: string; entity: string }>;
}

export async function batchSync(
  payloads: Array<SyncPayload<Record<string, unknown>>>,
  workspaceId: string,
): Promise<BatchSyncResult> {
  let processed = 0;
  let failed = 0;
  const conflicts: BatchSyncResult['conflicts'] = [];

  for (const payload of payloads) {
    const result = await pushSyncPayload(payload, workspaceId);
    if (result.success) {
      processed += 1;
    } else {
      failed += 1;
      console.warn(`[SyncEngine] Failed to sync ${payload.entity}:`, result.error);
    }
  }

  return { processed, failed, conflicts };
}

// ─── Network Awareness ────────────────────────────────────────────────────────

type NetworkListener = (online: boolean) => void;
const networkListeners = new Set<NetworkListener>();

export function onNetworkChange(listener: NetworkListener): () => void {
  networkListeners.add(listener);
  const handleOnline = () => listener(true);
  const handleOffline = () => listener(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    networkListeners.delete(listener);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}