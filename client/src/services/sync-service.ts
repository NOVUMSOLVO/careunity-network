/**
 * Sync Service
 *
 * This service provides functionality for offline data synchronization.
 * It uses IndexedDB to store data locally when the app is offline and syncs it
 * with the server when the connection is restored.
 *
 * Features:
 * - Queue operations when offline
 * - Process operations when online
 * - Retry failed operations
 * - Conflict resolution
 * - Background sync via service worker
 */

import { v4 as uuid } from 'uuid';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { apiClient } from '../lib/api-client';
import {
  ConflictResolutionService,
  ConflictType,
  ConflictStrategy,
  ConflictData
} from './conflict-resolution-service';

// Database name and version
const DB_NAME = 'careunityOfflineDB';
const DB_VERSION = 1;

// Define the database schema
interface SyncDB extends DBSchema {
  'sync-queue': {
    key: string;
    value: SyncOperation;
    indexes: { 'by-status': string; 'by-timestamp': number };
  };
  'offline-data': {
    key: string;
    value: {
      id: string;
      storeName: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-store': string };
  };
  'cache': {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      expiry: number | null;
    };
    indexes: { 'by-expiry': number };
  };
}

// Define types for sync operations
export interface SyncOperation {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'error' | 'completed' | 'conflict';
  errorMessage?: string;
  entityType?: string;
  entityId?: string | number;
  conflictType?: ConflictType;
  conflictData?: {
    clientData: any;
    serverData: any;
    clientTimestamp: number;
    serverTimestamp: number;
  };
  resolutionStrategy?: ConflictStrategy;
  resolvedAt?: string;
}

// Maximum number of retries for failed operations
const MAX_RETRIES = 5;

// Initialize the database
const initDB = async (): Promise<IDBPDatabase<SyncDB>> => {
  return openDB<SyncDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create sync queue store if it doesn't exist
      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncQueueStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-status', 'status');
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create offline data store if it doesn't exist
      if (!db.objectStoreNames.contains('offline-data')) {
        const offlineDataStore = db.createObjectStore('offline-data', { keyPath: 'id' });
        offlineDataStore.createIndex('by-store', 'storeName');
      }

      // Create cache store if it doesn't exist
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('by-expiry', 'expiry');
      }
    },
  });
};

// Get a database instance
let dbPromise: Promise<IDBPDatabase<SyncDB>>;

const getDB = (): Promise<IDBPDatabase<SyncDB>> => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

/**
 * Service for handling offline data synchronization
 */
const SyncService = {
  // Create an instance of the conflict resolution service
  conflictResolver: new ConflictResolutionService(),
  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    // Ensure the database is initialized
    await getDB();

    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_COMPLETED') {
            this.processPendingOperations();
          }
        });

        // Register for background sync if available
        if ('sync' in registration) {
          registration.sync.register('syncData');
        }
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }

    // Attempt to process the queue on startup if online
    if (navigator.onLine) {
      this.processPendingOperations();
    }

    // Set up periodic sync check
    setInterval(() => {
      if (navigator.onLine) {
        this.processPendingOperations();
      }
    }, 60000); // Check every minute

    console.log('[SyncService] Initialized');
  },

  /**
   * Handle online event
   */
  handleOnline(): void {
    console.log('[SyncService] Device is online, processing pending operations');
    this.processPendingOperations();

    // Notify the service worker to sync data
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          registration.sync.register('syncData');
        }
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('sync:online'));
  },

  /**
   * Handle offline event
   */
  handleOffline(): void {
    console.log('[SyncService] Device is offline');
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('sync:offline'));
  },

  /**
   * Queue an operation for synchronization
   * @param url API endpoint
   * @param method HTTP method
   * @param data Request body data
   * @param headers HTTP headers
   * @param entityType Type of entity being modified
   * @param entityId ID of entity being modified
   * @returns Operation ID
   */
  async queueOperation(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any,
    headers: Record<string, string> = {},
    entityType?: string,
    entityId?: string | number
  ): Promise<string> {
    const db = await getDB();

    const operationId = uuid();
    const operation: SyncOperation = {
      id: operationId,
      url,
      method,
      body: data ? JSON.stringify(data) : undefined,
      headers,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
      entityType,
      entityId
    };

    // Add to sync queue
    await db.add('sync-queue', operation);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('sync:operation-queued', {
      detail: { operation }
    }));

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processPendingOperations();
    }

    return operationId;
  },

  /**
   * Process pending operations in the sync queue
   */
  async processPendingOperations(): Promise<void> {
    // If offline, don't try to process
    if (!navigator.onLine) {
      return;
    }

    const db = await getDB();

    // Get all pending operations
    const pendingOperations = await db.getAllFromIndex('sync-queue', 'by-status', 'pending');

    if (pendingOperations.length === 0) {
      return;
    }

    console.log(`[SyncService] Processing ${pendingOperations.length} pending operations`);

    // Sort by timestamp (oldest first)
    const sortedOperations = [...pendingOperations].sort((a, b) => a.timestamp - b.timestamp);

    // Process each operation
    for (const operation of sortedOperations) {
      // Update status to processing
      operation.status = 'processing';
      await db.put('sync-queue', operation);

      try {
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
          // If successful, mark as completed
          operation.status = 'completed';
          await db.put('sync-queue', operation);

          // After a successful sync, we can clean up completed operations
          setTimeout(() => this.cleanupCompletedOperations(), 5000);

          // Dispatch success event
          window.dispatchEvent(new CustomEvent('sync:operation-completed', {
            detail: { operation }
          }));
        } else if (response.status === 409) {
          // Conflict detected
          console.log('[SyncService] Conflict detected for operation:', operation);

          // Get server data
          const serverData = await response.json();

          // Parse client data
          const clientData = operation.body ? JSON.parse(operation.body) : {};

          // Detect conflict type
          const conflictType = this.conflictResolver.detectConflictType(operation, {
            status: response.status,
            data: serverData
          });

          // Create conflict data
          const conflictData: ConflictData = {
            type: conflictType,
            resourceId: String(operation.entityId || ''),
            resourceType: operation.entityType || '',
            clientData,
            serverData: serverData.data || serverData,
            clientTimestamp: operation.timestamp,
            serverTimestamp: serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : Date.now(),
            operationId: operation.id
          };

          // Update operation with conflict info
          operation.status = 'conflict';
          operation.conflictType = conflictType;
          operation.conflictData = {
            clientData,
            serverData: serverData.data || serverData,
            clientTimestamp: operation.timestamp,
            serverTimestamp: serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : Date.now()
          };
          await db.put('sync-queue', operation);

          // Try to resolve the conflict automatically
          try {
            const resolution = await this.conflictResolver.resolveConflict(conflictData);

            if (resolution.resolved) {
              // Update operation with resolution info
              operation.status = 'completed';
              operation.resolutionStrategy = resolution.strategy;
              operation.resolvedAt = new Date().toISOString();
              await db.put('sync-queue', operation);

              console.log(`[SyncService] Conflict resolved automatically using ${resolution.strategy} strategy`);

              // Dispatch resolution event
              window.dispatchEvent(new CustomEvent('sync:conflict-resolved', {
                detail: { operation, resolution }
              }));
            } else {
              // Dispatch conflict event for manual resolution
              window.dispatchEvent(new CustomEvent('sync:conflict-detected', {
                detail: { operation, conflictData }
              }));
            }
          } catch (error) {
            console.error('[SyncService] Error resolving conflict:', error);

            // Dispatch conflict event for manual resolution
            window.dispatchEvent(new CustomEvent('sync:conflict-detected', {
              detail: { operation, conflictData, error }
            }));
          }
        } else {
          // If failed, mark as error
          operation.status = 'error';
          operation.errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
          operation.retries += 1;
          await db.put('sync-queue', operation);

          // Dispatch error event
          window.dispatchEvent(new CustomEvent('sync:operation-failed', {
            detail: { operation, error: operation.errorMessage }
          }));
        }
      } catch (error) {
        // If network error, mark as error
        operation.status = 'error';
        operation.errorMessage = error instanceof Error ? error.message : String(error);
        operation.retries += 1;
        await db.put('sync-queue', operation);

        // Dispatch error event
        window.dispatchEvent(new CustomEvent('sync:operation-failed', {
          detail: { operation, error: operation.errorMessage }
        }));
      }
    }
  },

  /**
   * Clean up completed operations
   */
  async cleanupCompletedOperations(): Promise<void> {
    const db = await getDB();

    // Get all completed operations
    const completedOperations = await db.getAllFromIndex('sync-queue', 'by-status', 'completed');

    // Delete each completed operation
    for (const operation of completedOperations) {
      await db.delete('sync-queue', operation.id);
    }

    if (completedOperations.length > 0) {
      console.log(`[SyncService] Cleaned up ${completedOperations.length} completed operations`);
    }
  },

  /**
   * Retry failed operations
   */
  async retryFailedOperations(): Promise<void> {
    const db = await getDB();

    // Get all error operations
    const errorOperations = await db.getAllFromIndex('sync-queue', 'by-status', 'error');

    // Reset status to pending for operations that haven't exceeded max retries
    for (const operation of errorOperations) {
      if (operation.retries < MAX_RETRIES) {
        operation.status = 'pending';
        await db.put('sync-queue', operation);
      }
    }

    // Process pending operations
    if (navigator.onLine) {
      this.processPendingOperations();
    }
  },

  /**
   * Get all pending operations
   * @returns Array of pending operations
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex('sync-queue', 'by-status', 'pending');
  },

  /**
   * Get all operations with error status
   * @returns Array of operations with errors
   */
  async getErrorOperations(): Promise<SyncOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex('sync-queue', 'by-status', 'error');
  },

  /**
   * Get all operations with conflict status
   * @returns Array of operations with conflicts
   */
  async getConflictOperations(): Promise<SyncOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex('sync-queue', 'by-status', 'conflict');
  },

  /**
   * Resolve a conflict manually
   * @param operationId ID of the operation with conflict
   * @param strategy Conflict resolution strategy to use
   * @returns Result of the conflict resolution
   */
  async resolveConflict(operationId: string, strategy: ConflictStrategy): Promise<boolean> {
    const db = await getDB();

    // Get the operation
    const operation = await db.get('sync-queue', operationId);

    if (!operation || operation.status !== 'conflict' || !operation.conflictData) {
      console.error('[SyncService] Cannot resolve conflict: Operation not found or not in conflict state');
      return false;
    }

    try {
      // Create conflict data
      const conflictData: ConflictData = {
        type: operation.conflictType!,
        resourceId: String(operation.entityId || ''),
        resourceType: operation.entityType || '',
        clientData: operation.conflictData.clientData,
        serverData: operation.conflictData.serverData,
        clientTimestamp: operation.conflictData.clientTimestamp,
        serverTimestamp: operation.conflictData.serverTimestamp,
        operationId: operation.id
      };

      // Resolve the conflict
      const resolution = await this.conflictResolver.resolveConflict(conflictData, strategy);

      if (resolution.resolved) {
        // Update operation with resolution info
        operation.status = 'completed';
        operation.resolutionStrategy = resolution.strategy;
        operation.resolvedAt = new Date().toISOString();
        await db.put('sync-queue', operation);

        console.log(`[SyncService] Conflict resolved manually using ${resolution.strategy} strategy`);

        // Dispatch resolution event
        window.dispatchEvent(new CustomEvent('sync:conflict-resolved', {
          detail: { operation, resolution }
        }));

        return true;
      } else {
        console.error('[SyncService] Failed to resolve conflict:', resolution.error);
        return false;
      }
    } catch (error) {
      console.error('[SyncService] Error resolving conflict:', error);
      return false;
    }
  },

  /**
   * Get count of pending operations
   * @returns Number of pending operations
   */
  async getPendingOperationsCount(): Promise<number> {
    const db = await getDB();
    return (await db.getAllFromIndex('sync-queue', 'by-status', 'pending')).length;
  },

  /**
   * Check if there are any pending operations
   * @returns True if there are pending operations
   */
  async hasPendingOperations(): Promise<boolean> {
    return (await this.getPendingOperationsCount()) > 0;
  },

  /**
   * Get count of operations with error status
   * @returns Number of operations with errors
   */
  async getErrorOperationsCount(): Promise<number> {
    const db = await getDB();
    return (await db.getAllFromIndex('sync-queue', 'by-status', 'error')).length;
  },

  /**
   * Clear all operations from the sync queue
   */
  async clearSyncQueue(): Promise<void> {
    const db = await getDB();
    await db.clear('sync-queue');
    console.log('[SyncService] Sync queue cleared');
  }
};

export default SyncService;
