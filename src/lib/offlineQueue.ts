export type OfflineCommandType = 'BORROW_ASSET' | 'RETURN_ASSET' | 'UPDATE_TASK' | 'CREATE_INCIDENT';
export type OfflineCommandStatus = 'PENDING' | 'PROCESSING' | 'FAILED';

export interface OfflineCommand<TPayload = Record<string, unknown>> {
  id: string;
  type: OfflineCommandType;
  payload: TPayload;
  status: OfflineCommandStatus;
  attempts: number;
  idempotencyKey: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

const DATABASE_NAME = 'stem-lab-os';
const DATABASE_VERSION = 1;
const STORE_NAME = 'offline-commands';

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
      }
    };
  });
}

export async function enqueueOfflineCommand<TPayload>(input: {
  type: OfflineCommandType;
  payload: TPayload;
  idempotencyKey?: string;
}): Promise<OfflineCommand<TPayload>> {
  const now = new Date().toISOString();
  const command: OfflineCommand<TPayload> = {
    id: createId(),
    type: input.type,
    payload: input.payload,
    status: 'PENDING',
    attempts: 0,
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
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).index('status').getAll('PENDING');
    request.onsuccess = () => resolve((request.result ?? []) as OfflineCommand[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to read offline queue.'));
  });
  database.close();
  return commands.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

async function updateCommand(command: OfflineCommand): Promise<void> {
  const database = await openQueue();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(command);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to update offline command.'));
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
    const processingCommand = { ...command, status: 'PROCESSING' as const, updatedAt: new Date().toISOString() };
    await updateCommand(processingCommand);

    try {
      await executor(processingCommand);
      processed += 1;
      const database = await openQueue();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(processingCommand.id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Unable to remove synced command.'));
      });
      database.close();
    } catch (error) {
      failed += 1;
      await updateCommand({
        ...processingCommand,
        status: 'FAILED',
        attempts: processingCommand.attempts + 1,
        lastError: error instanceof Error ? error.message : 'Unknown sync error',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { processed, failed };
}
