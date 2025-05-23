/**
 * Offline Sync Utility
 * 
 * This utility provides functions for handling offline data synchronization.
 */

import { openDB, IDBPDatabase } from 'idb';

// Database name and version
const DB_NAME = 'careunityOfflineDB';
const DB_VERSION = 1;

// Store names
const SYNC_QUEUE_STORE = 'sync-queue';
const OFFLINE_DATA_STORE = 'offline-data';
const CACHE_STORE = 'cache';

// Operation status
export enum OperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  FAILED = 'failed',
  SUPERSEDED = 'superseded',
}

// Operation types
export interface SyncOperation {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers: Record<string, string>;
  timestamp: number;
  status: OperationStatus;
  retries: number;
  lastRetry?: number;
  errorMessage?: string;
  completedAt?: number;
  responseStatus?: number;
  responseData?: any;
  responseText?: string;
  failedAt?: number;
  supersededBy?: string;
}

export interface OfflineData {
  id: string;
  storeName: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  expiry?: number;
}

// Open the database
async function openDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create sync-queue store if it doesn't exist
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        syncQueueStore.createIndex('by-status', 'status');
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create offline-data store if it doesn't exist
      if (!db.objectStoreNames.contains(OFFLINE_DATA_STORE)) {
        const offlineDataStore = db.createObjectStore(OFFLINE_DATA_STORE, { keyPath: 'id' });
        offlineDataStore.createIndex('by-store', 'storeName');
        offlineDataStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create cache store if it doesn't exist
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        cacheStore.createIndex('by-expiry', 'expiry');
      }
    },
  });
}

/**
 * Queue an operation for background sync
 */
export async function queueOperation(
  url: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<SyncOperation> {
  const db = await openDatabase();

  // Create a unique ID for this operation
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  // Prepare the operation
  const operation: SyncOperation = {
    id,
    url,
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    timestamp: Date.now(),
    status: OperationStatus.PENDING,
    retries: 0,
  };

  // Store the operation
  await db.add(SYNC_QUEUE_STORE, operation);

  // Register for background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('syncData');
  }

  return operation;
}

/**
 * Get all pending operations
 */
export async function getPendingOperations(): Promise<SyncOperation[]> {
  const db = await openDatabase();
  const index = db.transaction(SYNC_QUEUE_STORE).store.index('by-status');
  return index.getAll(OperationStatus.PENDING);
}

/**
 * Get all operations
 */
export async function getAllOperations(): Promise<SyncOperation[]> {
  const db = await openDatabase();
  return db.getAll(SYNC_QUEUE_STORE);
}

/**
 * Get operation by ID
 */
export async function getOperation(id: string): Promise<SyncOperation | undefined> {
  const db = await openDatabase();
  return db.get(SYNC_QUEUE_STORE, id);
}

/**
 * Update operation status
 */
export async function updateOperationStatus(
  id: string,
  status: OperationStatus,
  details?: Partial<SyncOperation>
): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  const store = tx.store;

  const operation = await store.get(id);
  if (!operation) {
    throw new Error(`Operation with ID ${id} not found`);
  }

  await store.put({
    ...operation,
    status,
    ...details,
  });

  await tx.done;
}

/**
 * Store offline data
 */
export async function storeOfflineData(
  storeName: string,
  id: string,
  data: any,
  expiresIn?: number
): Promise<void> {
  const db = await openDatabase();
  const timestamp = Date.now();

  await db.put(OFFLINE_DATA_STORE, {
    id: `${storeName}:${id}`,
    storeName,
    data,
    timestamp,
    expiresAt: expiresIn ? timestamp + expiresIn : undefined,
  });
}

/**
 * Get offline data
 */
export async function getOfflineData(
  storeName: string,
  id: string
): Promise<any | undefined> {
  const db = await openDatabase();
  const entry = await db.get(OFFLINE_DATA_STORE, `${storeName}:${id}`);

  if (!entry) {
    return undefined;
  }

  // Check if data has expired
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    await db.delete(OFFLINE_DATA_STORE, entry.id);
    return undefined;
  }

  return entry.data;
}

/**
 * Get all offline data for a store
 */
export async function getAllOfflineData(storeName: string): Promise<any[]> {
  const db = await openDatabase();
  const index = db.transaction(OFFLINE_DATA_STORE).store.index('by-store');
  const entries = await index.getAll(storeName);

  // Filter out expired entries
  const now = Date.now();
  return entries
    .filter(entry => !entry.expiresAt || entry.expiresAt >= now)
    .map(entry => entry.data);
}

/**
 * Delete offline data
 */
export async function deleteOfflineData(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  await db.delete(OFFLINE_DATA_STORE, `${storeName}:${id}`);
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(OFFLINE_DATA_STORE, 'readwrite');
  await tx.store.clear();
  await tx.done;
}

/**
 * Cache data with an optional expiration
 */
export async function cacheData(
  key: string,
  value: any,
  expiryInMs?: number
): Promise<void> {
  const db = await openDatabase();
  const timestamp = Date.now();

  await db.put(CACHE_STORE, {
    key,
    value,
    timestamp,
    expiry: expiryInMs ? timestamp + expiryInMs : undefined,
  });
}

/**
 * Get cached data
 */
export async function getCachedData(key: string): Promise<any | undefined> {
  const db = await openDatabase();
  const entry = await db.get(CACHE_STORE, key);

  if (!entry) {
    return undefined;
  }

  // Check if data has expired
  if (entry.expiry && entry.expiry < Date.now()) {
    await db.delete(CACHE_STORE, entry.key);
    return undefined;
  }

  return entry.value;
}

/**
 * Delete cached data
 */
export async function deleteCachedData(key: string): Promise<void> {
  const db = await openDatabase();
  await db.delete(CACHE_STORE, key);
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(CACHE_STORE, 'readwrite');
  await tx.store.clear();
  await tx.done;
}
