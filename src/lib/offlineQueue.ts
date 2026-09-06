// src/lib/offlineQueue.ts
// IndexedDB-backed Outbox Pattern for offline mutation queue.
// All write operations are stored here while offline, then flushed when network returns.

export type OfflineCommandType =
  | 'BORROW_ASSET'
  | 'RETURN_ASSET'
  | 'UPDATE_TASK'
  | 'CREATE_TASK'
  | 'DELETE_TASK'
  | 'CREATE_SCHEDULE'
  | 'UPDATE_SCHEDULE'
  | 'DELETE_SCHEDULE'
  | 'CREATE_INCIDENT'
  | 'UPDATE_INCIDENT'
  | 'UPDATE_MEMBER'
  | 'CREATE_ROSTER'
  | 'UPDATE_ROSTER'
  | 'UPSERT_CONSUMABLE'
  | 'RECORD_MERIT';

export type OfflineCommandStatus = 'PENDING' | 'PROCESSING' | 'FAILED';

export interface OfflineCommand<TPayload = Record<string, unknown>> {
  id: string;
  type: OfflineCommandType;
  payload: TPayload;
  status: OfflineCommandStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

const DATABASE_NAME = 'stem-lab-os';
const DATABASE_VERSION = 2; // bumped from 1 → 2 for new store indices
const STORE_NAME = 'offline-commands';
const MAX_ATTEMPTS = 3;

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openQueue(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is unavailable in this environment.'));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Unable to open offline queue.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

export async function enqueueOfflineCommand<TPayload>(input: {
  type: OfflineCommandType;
  payload: TPayload;
  idempotencyKey?: string;
  maxAttempts?: number;
}): Promise<OfflineCommand<TPayload>> {
  const now = new Date().toISOString();
  const command: OfflineCommand<TPayload> = {
    id: createId(),
    type: input.type,
    payload: input.payload,
    status: 'PENDING',
    attempts: 0,
    maxAttempts: input.maxAttempts ?? MAX_ATTEMPTS,
    idempotencyKey: input.idempotencyKey ?? createId(),
    createdAt: now,
    updatedAt: now,
  };
  const database = await openQueue();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(command);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to enqueue command.'));
  });
  database.close();
  return command;
}

export async function listPendingCommands(): Promise<OfflineCommand[]> {
  const database = await openQueue();
  const commands = await new Promise<OfflineCommand[]>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .index('status')
      .getAll('PENDING');
    request.onsuccess = () => resolve((request.result ?? []) as OfflineCommand[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to read offline queue.'));
  });
  database.close();
  return commands.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function listAllCommands(): Promise<OfflineCommand[]> {
  const database = await openQueue();
  const commands = await new Promise<OfflineCommand[]>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .getAll();
    request.onsuccess = () => resolve((request.result ?? []) as OfflineCommand[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to list queue.'));
  });
  database.close();
  return commands;
}

async function updateCommand(command: OfflineCommand): Promise<void> {
  const database = await openQueue();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(command);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Unable to update offline command.'));
  });
  database.close();
}

async function removeCommand(id: string): Promise<void> {
  const database = await openQueue();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to remove synced command.'));
  });
  database.close();
}

export async function flushOfflineCommands(
  executor: (command: OfflineCommand) => Promise<void>,
): Promise<{ processed: number; failed: number }> {
  const pendingCommands = await listPendingCommands();
  let processed = 0;
  let failed = 0;

  for (const command of pendingCommands) {
    // Skip commands that have exceeded retry limit
    if (command.attempts >= command.maxAttempts) {
      failed += 1;
      continue;
    }

    const processingCommand: OfflineCommand = {
      ...command,
      status: 'PROCESSING',
      updatedAt: new Date().toISOString(),
    };
    await updateCommand(processingCommand);

    try {
      await executor(processingCommand);
      processed += 1;
      await removeCommand(processingCommand.id);
    } catch (error) {
      failed += 1;
      const nextAttempts = processingCommand.attempts + 1;
      await updateCommand({
        ...processingCommand,
        // If still under limit, revert to PENDING for next flush; else mark FAILED
        status: nextAttempts < command.maxAttempts ? 'PENDING' : 'FAILED',
        attempts: nextAttempts,
        lastError: error instanceof Error ? error.message : 'Unknown sync error',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { processed, failed };
}

/** Returns count of commands in PENDING or FAILED state. */
export async function getPendingCount(): Promise<number> {
  const pending = await listPendingCommands();
  return pending.length;
}

/** Clears all FAILED commands (gives up on them). */
export async function clearFailedCommands(): Promise<number> {
  const database = await openQueue();
  const all = await new Promise<OfflineCommand[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result ?? []) as OfflineCommand[]);
    request.onerror = () => reject(request.error);
  });

  const failed = all.filter((c) => c.status === 'FAILED');
  for (const cmd of failed) {
    await removeCommand(cmd.id);
  }
  database.close();
  return failed.length;
}
