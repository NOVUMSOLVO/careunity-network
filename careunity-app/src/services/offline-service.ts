/**
 * Offline Service
 *
 * This service provides functionality for offline data storage and synchronization.
 * It uses IndexedDB to store data locally when the app is offline and syncs it
 * with the server when the connection is restored.
 *
 * Features:
 * - Offline data storage
 * - Request queueing for offline operations
 * - Automatic synchronization when online
 * - Conflict resolution for concurrent edits
 * - Cache management for offline access
 */

// Database name and version
const DB_NAME = 'careunityOfflineDB';
const DB_VERSION = 2; // Increased version for schema updates

// Store names
const STORES = {
  OFFLINE_DATA: 'offlineData',
  CACHE: 'cache',
  SYNC_QUEUE: 'syncQueue',
  CONFLICT_RESOLUTION: 'conflictResolution',
  ENTITY_VERSIONS: 'entityVersions',
};

// Sync operation status
export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
  SUPERSEDED = 'superseded',
}

// Sync operation type
export interface SyncOperation {
  id: number;
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  timestamp: string;
  status: SyncStatus;
  retries?: number;
  errorMessage?: string;
  entityId?: string;
  entityType?: string;
  entityVersion?: number;
  conflictResolution?: 'client' | 'server' | 'manual';
  serverData?: any;
  clientData?: any;
  resolvedData?: any;
  resolvedAt?: string;
  completedAt?: string;
}

// Cache item
export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
  entityType?: string;
  entityId?: string;
  version?: number;
}

// Offline data item
export interface OfflineDataItem {
  id: number;
  storeName: string;
  data: any;
  timestamp: number;
  entityId?: string;
  entityType?: string;
  version?: number;
}

// Entity version
export interface EntityVersion {
  entityType: string;
  entityId: string;
  version: number;
  lastModified: number;
  lastSynced?: number;
}

// Open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // Handle database upgrades based on old version
      if (oldVersion < 1) {
        // Create initial object stores (v1)
        if (!db.objectStoreNames.contains(STORES.OFFLINE_DATA)) {
          const offlineStore = db.createObjectStore(STORES.OFFLINE_DATA, { keyPath: 'id', autoIncrement: true });
          offlineStore.createIndex('storeName', 'storeName', { unique: false });
          offlineStore.createIndex('entityId', 'entityId', { unique: false });
          offlineStore.createIndex('entityType', 'entityType', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
          cacheStore.createIndex('entityType', 'entityType', { unique: false });
          cacheStore.createIndex('entityId', 'entityId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('url', 'url', { unique: false });
          syncStore.createIndex('entityId', 'entityId', { unique: false });
          syncStore.createIndex('entityType', 'entityType', { unique: false });
        }
      }

      if (oldVersion < 2) {
        // Add new stores for v2
        if (!db.objectStoreNames.contains(STORES.CONFLICT_RESOLUTION)) {
          const conflictStore = db.createObjectStore(STORES.CONFLICT_RESOLUTION, { keyPath: 'id', autoIncrement: true });
          conflictStore.createIndex('entityId', 'entityId', { unique: false });
          conflictStore.createIndex('entityType', 'entityType', { unique: false });
          conflictStore.createIndex('timestamp', 'timestamp', { unique: false });
          conflictStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.ENTITY_VERSIONS)) {
          const versionStore = db.createObjectStore(STORES.ENTITY_VERSIONS, { keyPath: ['entityType', 'entityId'] });
          versionStore.createIndex('version', 'version', { unique: false });
          versionStore.createIndex('lastModified', 'lastModified', { unique: false });
          versionStore.createIndex('entityType', 'entityType', { unique: false });
        }

        // Update existing stores with new indexes if needed
        if (db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = event.target.transaction.objectStore(STORES.SYNC_QUEUE);
          if (!syncStore.indexNames.contains('entityId')) {
            syncStore.createIndex('entityId', 'entityId', { unique: false });
          }
          if (!syncStore.indexNames.contains('entityType')) {
            syncStore.createIndex('entityType', 'entityType', { unique: false });
          }
          if (!syncStore.indexNames.contains('entityVersion')) {
            syncStore.createIndex('entityVersion', 'entityVersion', { unique: false });
          }
        }
      }
    };
  });
};

/**
 * Save data to be synced when online
 * @param url API endpoint
 * @param method HTTP method
 * @param data Data to be sent
 * @param headers HTTP headers
 * @param entityInfo Optional entity information for versioning
 * @returns The ID of the created sync operation
 */
export const saveForSync = async (
  url: string,
  method: string,
  data: any,
  headers: Record<string, string> = {},
  entityInfo?: { entityType: string; entityId: string }
): Promise<number> => {
  try {
    const db = await openDB();

    // Create the sync operation
    const syncOperation: Partial<SyncOperation> = {
      url,
      method,
      body: JSON.stringify(data),
      headers,
      timestamp: new Date().toISOString(),
      status: SyncStatus.PENDING,
      retries: 0
    };

    // If entity info is provided, handle versioning
    if (entityInfo) {
      const { entityType, entityId } = entityInfo;
      syncOperation.entityType = entityType;
      syncOperation.entityId = entityId;

      // Get current entity version
      const entityVersion = await getEntityVersion(entityType, entityId, db);
      syncOperation.entityVersion = entityVersion;

      // Update entity version
      await updateEntityVersion(entityType, entityId, entityVersion + 1, db);
    }

    // Add to sync queue
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const operationId = await store.add(syncOperation);

    await tx.complete;
    db.close();

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('syncData');
    }

    return operationId as number;
  } catch (error) {
    console.error('Error saving data for sync:', error);
    throw error;
  }
};

/**
 * Get the current version of an entity
 * @param entityType The entity type
 * @param entityId The entity ID
 * @param db The database connection
 * @returns The current version
 */
const getEntityVersion = async (
  entityType: string,
  entityId: string,
  db: IDBDatabase
): Promise<number> => {
  const tx = db.transaction(STORES.ENTITY_VERSIONS, 'readonly');
  const store = tx.objectStore(STORES.ENTITY_VERSIONS);

  try {
    const entityVersion = await store.get([entityType, entityId]);
    return entityVersion ? entityVersion.version : 0;
  } catch (error) {
    console.error('Error getting entity version:', error);
    return 0;
  }
};

/**
 * Cache data for offline use
 * @param key Cache key
 * @param data Data to cache
 * @param expiryTime Expiry time in milliseconds (default: 24 hours)
 */
export const cacheData = async (
  key: string,
  data: any,
  expiryTime: number = 24 * 60 * 60 * 1000
): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CACHE);

    await store.put({
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiryTime,
    });

    await tx.complete;
    db.close();
  } catch (error) {
    console.error('Error caching data:', error);
    throw error;
  }
};

/**
 * Get cached data
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CACHE, 'readonly');
    const store = tx.objectStore(STORES.CACHE);

    const result = await store.get(key);
    await tx.complete;
    db.close();

    if (result && result.expiry > Date.now()) {
      return result.data;
    }

    // Data is expired, clean it up
    if (result) {
      await clearExpiredCache();
    }

    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CACHE);
    const index = store.index('timestamp');

    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    const cursorRequest = index.openCursor(range);

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const value = cursor.value;
        if (value.expiry < now) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    await tx.complete;
    db.close();
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

/**
 * Save offline data
 * @param storeName Store name
 * @param data Data to save
 */
export const saveOfflineData = async (storeName: string, data: any): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.OFFLINE_DATA, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_DATA);

    await store.add({
      storeName,
      data,
      timestamp: Date.now(),
    });

    await tx.complete;
    db.close();
  } catch (error) {
    console.error('Error saving offline data:', error);
    throw error;
  }
};

/**
 * Get offline data
 * @param storeName Store name
 * @returns Offline data
 */
export const getOfflineData = async (storeName: string): Promise<any[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.OFFLINE_DATA, 'readonly');
    const store = tx.objectStore(STORES.OFFLINE_DATA);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const allData = request.result;
        const filteredData = allData
          .filter(item => item.storeName === storeName)
          .map(item => item.data);

        resolve(filteredData);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting offline data:', error);
    return [];
  }
};

/**
 * Sync all pending data with the server
 * @returns Promise that resolves with sync results
 */
export const syncPendingData = async (): Promise<{
  success: number;
  failed: number;
  conflicts: number;
  pending: number;
}> => {
  if (!navigator.onLine) {
    console.warn('Cannot sync while offline');
    return { success: 0, failed: 0, conflicts: 0, pending: 0 };
  }

  let success = 0;
  let failed = 0;
  let conflicts = 0;
  let pending = 0;

  try {
    const db = await openDB();

    // Get all pending operations
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const statusIndex = store.index('status');

    // Get all pending items
    const pendingItems = await statusIndex.getAll(SyncStatus.PENDING);

    if (pendingItems.length === 0) {
      db.close();
      return { success: 0, failed: 0, conflicts: 0, pending: 0 };
    }

    console.log(`Syncing ${pendingItems.length} pending items`);

    // Group operations by entity to detect conflicts
    const operationsByEntity: Record<string, SyncOperation[]> = {};

    // Group operations by entity
    for (const item of pendingItems) {
      if (item.entityType && item.entityId) {
        const entityKey = `${item.entityType}:${item.entityId}`;
        if (!operationsByEntity[entityKey]) {
          operationsByEntity[entityKey] = [];
        }
        operationsByEntity[entityKey].push(item as SyncOperation);
      } else {
        // If no entity info, process individually
        const result = await processSyncOperation(item as SyncOperation, db);
        if (result.status === SyncStatus.COMPLETED) {
          success++;
        } else if (result.status === SyncStatus.CONFLICT) {
          conflicts++;
        } else if (result.status === SyncStatus.FAILED) {
          failed++;
        } else {
          pending++;
        }
      }
    }

    // Process operations by entity
    for (const entityKey in operationsByEntity) {
      const operations = operationsByEntity[entityKey];

      // If multiple operations on same entity, handle potential conflicts
      if (operations.length > 1) {
        // Sort by timestamp (oldest first)
        operations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Process operations sequentially
        for (const operation of operations) {
          // Check if this operation has been superseded
          const currentStatus = await getOperationStatus(operation.id, db);
          if (currentStatus === SyncStatus.SUPERSEDED) {
            continue;
          }

          // Process the operation
          const result = await processSyncOperation(operation, db);

          if (result.status === SyncStatus.COMPLETED) {
            success++;

            // Mark older operations as superseded
            for (const op of operations) {
              if (op.id !== operation.id &&
                  op.status !== SyncStatus.COMPLETED &&
                  op.status !== SyncStatus.SUPERSEDED) {
                await updateOperationStatus(op.id, SyncStatus.SUPERSEDED, db, {
                  supersededBy: operation.id
                });
              }
            }
          } else if (result.status === SyncStatus.CONFLICT) {
            conflicts++;
          } else if (result.status === SyncStatus.FAILED) {
            failed++;
          } else {
            pending++;
          }
        }
      } else {
        // Single operation, no conflict
        const result = await processSyncOperation(operations[0], db);
        if (result.status === SyncStatus.COMPLETED) {
          success++;
        } else if (result.status === SyncStatus.CONFLICT) {
          conflicts++;
        } else if (result.status === SyncStatus.FAILED) {
          failed++;
        } else {
          pending++;
        }
      }
    }

    // Get remaining pending count
    const remainingPending = await statusIndex.count(SyncStatus.PENDING);
    pending = remainingPending;

    db.close();

    return { success, failed, conflicts, pending };
  } catch (error) {
    console.error('Error syncing pending data:', error);
    return { success, failed, conflicts, pending };
  }
};

/**
 * Process a single sync operation
 * @param operation The operation to process
 * @param db The database connection
 * @returns The updated operation
 */
const processSyncOperation = async (
  operation: SyncOperation,
  db: IDBDatabase
): Promise<SyncOperation> => {
  try {
    // Update status to processing
    await updateOperationStatus(operation.id, SyncStatus.PROCESSING, db);

    // Check for entity version conflicts if this is an entity operation
    if (operation.entityType && operation.entityId && operation.entityVersion) {
      const serverVersion = await getServerEntityVersion(
        operation.entityType,
        operation.entityId,
        operation.url
      );

      // If server version is higher than our version, we have a conflict
      if (serverVersion > operation.entityVersion) {
        // Create a conflict record
        await createConflictRecord(operation, serverVersion, db);

        // Update operation status to conflict
        await updateOperationStatus(operation.id, SyncStatus.CONFLICT, db, {
          serverVersion
        });

        return { ...operation, status: SyncStatus.CONFLICT, serverVersion };
      }
    }

    // Make the request
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: {
        'Content-Type': 'application/json',
        ...operation.headers,
      },
      body: operation.body,
    });

    if (response.ok) {
      // If successful, update the operation status
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If not JSON, get as text
        responseData = await response.text();
      }

      // Update entity version if this is an entity operation
      if (operation.entityType && operation.entityId) {
        await updateEntityVersion(
          operation.entityType,
          operation.entityId,
          (operation.entityVersion || 0) + 1,
          db
        );
      }

      // Update operation status
      await updateOperationStatus(operation.id, SyncStatus.COMPLETED, db, {
        responseData,
        completedAt: new Date().toISOString()
      });

      return { ...operation, status: SyncStatus.COMPLETED, responseData, completedAt: new Date().toISOString() };
    } else {
      // If failed, update the operation status
      const errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
      const retries = (operation.retries || 0) + 1;

      // If too many retries, mark as failed
      const newStatus = retries >= 5 ? SyncStatus.FAILED : SyncStatus.PENDING;

      await updateOperationStatus(operation.id, newStatus, db, {
        errorMessage,
        retries,
        lastRetry: new Date().toISOString()
      });

      return {
        ...operation,
        status: newStatus,
        errorMessage,
        retries,
        lastRetry: new Date().toISOString()
      };
    }
  } catch (error) {
    // If network error, update the operation status
    const errorMessage = error.message || 'Network error';
    const retries = (operation.retries || 0) + 1;

    // If too many retries, mark as failed
    const newStatus = retries >= 5 ? SyncStatus.FAILED : SyncStatus.PENDING;

    await updateOperationStatus(operation.id, newStatus, db, {
      errorMessage,
      retries,
      lastRetry: new Date().toISOString()
    });

    return {
      ...operation,
      status: newStatus,
      errorMessage,
      retries,
      lastRetry: new Date().toISOString()
    };
  }
};

/**
 * Get the current status of an operation
 * @param operationId The operation ID
 * @param db The database connection
 * @returns The operation status
 */
const getOperationStatus = async (
  operationId: number,
  db: IDBDatabase
): Promise<SyncStatus> => {
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
  const store = tx.objectStore(STORES.SYNC_QUEUE);

  try {
    const operation = await store.get(operationId);
    return operation ? operation.status : SyncStatus.PENDING;
  } catch (error) {
    console.error('Error getting operation status:', error);
    return SyncStatus.PENDING;
  }
};

/**
 * Update the status of an operation
 * @param operationId The operation ID
 * @param status The new status
 * @param db The database connection
 * @param additionalData Additional data to update
 */
const updateOperationStatus = async (
  operationId: number,
  status: SyncStatus,
  db: IDBDatabase,
  additionalData: Record<string, any> = {}
): Promise<void> => {
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
  const store = tx.objectStore(STORES.SYNC_QUEUE);

  try {
    const operation = await store.get(operationId);
    if (operation) {
      operation.status = status;

      // Add additional data
      Object.keys(additionalData).forEach(key => {
        operation[key] = additionalData[key];
      });

      await store.put(operation);
    }
  } catch (error) {
    console.error('Error updating operation status:', error);
  }
};

/**
 * Get the server version of an entity
 * @param entityType The entity type
 * @param entityId The entity ID
 * @param url The API URL
 * @returns The server version
 */
const getServerEntityVersion = async (
  entityType: string,
  entityId: string,
  url: string
): Promise<number> => {
  try {
    // Extract base URL without parameters
    const baseUrl = url.split('?')[0];
    const versionUrl = `${baseUrl}/version`;

    const response = await fetch(versionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.version || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting server entity version:', error);
    return 0;
  }
};

/**
 * Update the version of an entity
 * @param entityType The entity type
 * @param entityId The entity ID
 * @param version The new version
 * @param db The database connection
 */
const updateEntityVersion = async (
  entityType: string,
  entityId: string,
  version: number,
  db: IDBDatabase
): Promise<void> => {
  const tx = db.transaction(STORES.ENTITY_VERSIONS, 'readwrite');
  const store = tx.objectStore(STORES.ENTITY_VERSIONS);

  try {
    const entityVersion = await store.get([entityType, entityId]);

    if (entityVersion) {
      entityVersion.version = version;
      entityVersion.lastModified = Date.now();
      entityVersion.lastSynced = Date.now();
      await store.put(entityVersion);
    } else {
      await store.add({
        entityType,
        entityId,
        version,
        lastModified: Date.now(),
        lastSynced: Date.now()
      });
    }
  } catch (error) {
    console.error('Error updating entity version:', error);
  }
};

/**
 * Create a conflict record
 * @param operation The operation with a conflict
 * @param serverVersion The server version
 * @param db The database connection
 */
const createConflictRecord = async (
  operation: SyncOperation,
  serverVersion: number,
  db: IDBDatabase
): Promise<void> => {
  if (!operation.entityType || !operation.entityId) {
    return;
  }

  const tx = db.transaction(STORES.CONFLICT_RESOLUTION, 'readwrite');
  const store = tx.objectStore(STORES.CONFLICT_RESOLUTION);

  try {
    // Get server data
    const serverData = await fetchEntityData(operation.entityType, operation.entityId);

    // Get client data
    const clientData = JSON.parse(operation.body);

    await store.add({
      entityType: operation.entityType,
      entityId: operation.entityId,
      operationId: operation.id,
      serverVersion,
      clientVersion: operation.entityVersion,
      serverData,
      clientData,
      timestamp: Date.now(),
      status: 'pending',
      resolution: null,
      resolvedData: null,
      resolvedAt: null
    });
  } catch (error) {
    console.error('Error creating conflict record:', error);
  }
};

/**
 * Fetch entity data from the server
 * @param entityType The entity type
 * @param entityId The entity ID
 * @returns The entity data
 */
const fetchEntityData = async (
  entityType: string,
  entityId: string
): Promise<any> => {
  try {
    const response = await fetch(`/api/${entityType}/${entityId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Error fetching entity data:', error);
    return null;
  }
};

/**
 * Check if there are pending items to sync
 * @returns Promise that resolves to true if there are pending items
 */
export const hasPendingItems = async (): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);

    const count = await store.count();
    await tx.complete;
    db.close();

    return count > 0;
  } catch (error) {
    console.error('Error checking pending items:', error);
    return false;
  }
};

/**
 * Get the number of pending items to sync
 * @returns Promise that resolves to the number of pending items
 */
export const getPendingItemsCount = async (): Promise<number> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);

    const count = await store.count();
    await tx.complete;
    db.close();

    return count;
  } catch (error) {
    console.error('Error getting pending items count:', error);
    return 0;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CACHE);

    await store.clear();
    await tx.complete;
    db.close();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get all conflicts that need resolution
 * @returns Promise that resolves to an array of conflicts
 */
export const getConflicts = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CONFLICT_RESOLUTION, 'readonly');
    const store = tx.objectStore(STORES.CONFLICT_RESOLUTION);
    const index = store.index('status');

    const conflicts = await index.getAll('pending');
    await tx.complete;
    db.close();

    return conflicts;
  } catch (error) {
    console.error('Error getting conflicts:', error);
    return [];
  }
};

/**
 * Resolve a conflict
 * @param conflictId The conflict ID
 * @param resolution The resolution strategy ('client', 'server', or 'manual')
 * @param manualData Optional manual resolution data
 * @returns Promise that resolves when the conflict is resolved
 */
export const resolveConflict = async (
  conflictId: number,
  resolution: 'client' | 'server' | 'manual',
  manualData?: any
): Promise<boolean> => {
  try {
    const db = await openDB();

    // Get the conflict
    const conflictTx = db.transaction(STORES.CONFLICT_RESOLUTION, 'readwrite');
    const conflictStore = conflictTx.objectStore(STORES.CONFLICT_RESOLUTION);
    const conflict = await conflictStore.get(conflictId);

    if (!conflict) {
      console.error('Conflict not found:', conflictId);
      return false;
    }

    // Get the operation
    const opTx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const opStore = opTx.objectStore(STORES.SYNC_QUEUE);
    const operation = await opStore.get(conflict.operationId);

    if (!operation) {
      console.error('Operation not found:', conflict.operationId);
      return false;
    }

    // Determine the resolved data
    let resolvedData;
    if (resolution === 'client') {
      resolvedData = conflict.clientData;
    } else if (resolution === 'server') {
      resolvedData = conflict.serverData;
    } else {
      resolvedData = manualData;
    }

    // Update the conflict
    conflict.status = 'resolved';
    conflict.resolution = resolution;
    conflict.resolvedData = resolvedData;
    conflict.resolvedAt = new Date().toISOString();
    await conflictStore.put(conflict);
    await conflictTx.complete;

    // Update the operation
    if (resolution === 'server') {
      // If using server version, mark operation as completed
      operation.status = SyncStatus.COMPLETED;
      operation.completedAt = new Date().toISOString();
    } else {
      // If using client or manual version, update operation and retry
      operation.status = SyncStatus.PENDING;
      operation.body = JSON.stringify(resolvedData);
      operation.entityVersion = conflict.serverVersion; // Use server version to avoid further conflicts
    }

    await opStore.put(operation);
    await opTx.complete;

    // Update entity version
    if (operation.entityType && operation.entityId) {
      const versionTx = db.transaction(STORES.ENTITY_VERSIONS, 'readwrite');
      const versionStore = versionTx.objectStore(STORES.ENTITY_VERSIONS);

      await versionStore.put({
        entityType: operation.entityType,
        entityId: operation.entityId,
        version: conflict.serverVersion,
        lastModified: Date.now(),
        lastSynced: resolution === 'server' ? Date.now() : undefined
      });

      await versionTx.complete;
    }

    db.close();

    // If not using server version, trigger sync
    if (resolution !== 'server' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('syncData');
    }

    return true;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return false;
  }
};

/**
 * Get pending operations with their status
 * @returns Promise that resolves to an array of operations
 */
export const getPendingOperations = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);

    const operations = await store.getAll();
    await tx.complete;
    db.close();

    return operations;
  } catch (error) {
    console.error('Error getting pending operations:', error);
    return [];
  }
};

/**
 * Retry a failed operation
 * @param operationId The operation ID
 * @returns Promise that resolves when the operation is retried
 */
export const retryOperation = async (operationId: number): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);

    const operation = await store.get(operationId);
    if (!operation) {
      console.error('Operation not found:', operationId);
      return false;
    }

    // Reset status to pending
    operation.status = SyncStatus.PENDING;
    await store.put(operation);
    await tx.complete;
    db.close();

    // Trigger sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('syncData');
    }

    return true;
  } catch (error) {
    console.error('Error retrying operation:', error);
    return false;
  }
};

/**
 * Delete a failed operation
 * @param operationId The operation ID
 * @returns Promise that resolves when the operation is deleted
 */
export const deleteOperation = async (operationId: number): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);

    await store.delete(operationId);
    await tx.complete;
    db.close();

    return true;
  } catch (error) {
    console.error('Error deleting operation:', error);
    return false;
  }
};

// Export the offline service
const OfflineService = {
  saveForSync,
  cacheData,
  getCachedData,
  clearExpiredCache,
  saveOfflineData,
  getOfflineData,
  syncPendingData,
  hasPendingItems,
  getPendingItemsCount,
  clearAllCache,
  getConflicts,
  resolveConflict,
  getPendingOperations,
  retryOperation,
  deleteOperation
};

export default OfflineService;
