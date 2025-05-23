/**
 * Offline storage utility using IndexedDB
 * Provides a simple API for storing and retrieving data offline
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface CareUnityDB extends DBSchema {
  'service-users': {
    key: number;
    value: any;
    indexes: { 'by-id': number };
  };
  'care-plans': {
    key: number;
    value: any;
    indexes: { 'by-id': number; 'by-service-user': number };
  };
  'appointments': {
    key: number;
    value: any;
    indexes: { 'by-id': number; 'by-service-user': number; 'by-date': string };
  };
  'staff': {
    key: number;
    value: any;
    indexes: { 'by-id': number; 'by-role': string };
  };
  'ml-models': {
    key: string;
    value: any;
    indexes: { 'by-id': string; 'by-type': string };
  };
  'care-notes': {
    key: number;
    value: any;
    indexes: { 'by-id': number; 'by-service-user': number; 'by-date': string };
  };
  'medications': {
    key: number;
    value: any;
    indexes: { 'by-id': number; 'by-service-user': number };
  };
  'pending-changes': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      entity: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      retries: number;
      status: 'pending' | 'processing' | 'completed' | 'error';
      errorMessage?: string;
    };
    indexes: { 'by-entity': string; 'by-timestamp': number; 'by-status': string };
  };
  'cached-responses': {
    key: string;
    value: {
      url: string;
      params: any;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
}

// Database name and version
const DB_NAME = 'care-unity-db';
const DB_VERSION = 1;

// Initialize the database
const initDB = async (): Promise<IDBPDatabase<CareUnityDB>> => {
  return openDB<CareUnityDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('service-users')) {
        const serviceUsersStore = db.createObjectStore('service-users', { keyPath: 'id' });
        serviceUsersStore.createIndex('by-id', 'id');
      }

      if (!db.objectStoreNames.contains('care-plans')) {
        const carePlansStore = db.createObjectStore('care-plans', { keyPath: 'id' });
        carePlansStore.createIndex('by-id', 'id');
        carePlansStore.createIndex('by-service-user', 'serviceUserId');
      }

      if (!db.objectStoreNames.contains('appointments')) {
        const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
        appointmentsStore.createIndex('by-id', 'id');
        appointmentsStore.createIndex('by-service-user', 'serviceUserId');
        appointmentsStore.createIndex('by-date', 'date');
      }

      if (!db.objectStoreNames.contains('staff')) {
        const staffStore = db.createObjectStore('staff', { keyPath: 'id' });
        staffStore.createIndex('by-id', 'id');
        staffStore.createIndex('by-role', 'role');
      }

      if (!db.objectStoreNames.contains('pending-changes')) {
        const pendingChangesStore = db.createObjectStore('pending-changes', { keyPath: 'id' });
        pendingChangesStore.createIndex('by-entity', 'entity');
        pendingChangesStore.createIndex('by-timestamp', 'timestamp');
      }

      if (!db.objectStoreNames.contains('cached-responses')) {
        db.createObjectStore('cached-responses', { keyPath: 'url' });
      }
    },
  });
};

// Get a database instance
let dbPromise: Promise<IDBPDatabase<CareUnityDB>>;

const getDB = (): Promise<IDBPDatabase<CareUnityDB>> => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

// Generic CRUD operations
export const offlineStorage = {
  // Store an item in a specific store
  async set<T>(storeName: keyof CareUnityDB, item: T): Promise<T> {
    const db = await getDB();
    await db.put(storeName, item);
    return item;
  },

  // Get an item by ID from a specific store
  async get<T>(storeName: keyof CareUnityDB, id: number | string): Promise<T | undefined> {
    const db = await getDB();
    return db.get(storeName, id);
  },

  // Get all items from a specific store
  async getAll<T>(storeName: keyof CareUnityDB): Promise<T[]> {
    const db = await getDB();
    return db.getAll(storeName);
  },

  // Delete an item by ID from a specific store
  async delete(storeName: keyof CareUnityDB, id: number | string): Promise<void> {
    const db = await getDB();
    await db.delete(storeName, id);
  },

  // Clear a specific store
  async clear(storeName: keyof CareUnityDB): Promise<void> {
    const db = await getDB();
    await db.clear(storeName);
  },

  // Get items by index
  async getByIndex<T>(
    storeName: keyof CareUnityDB,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await getDB();
    const index = db.transaction(storeName).store.index(indexName);
    return index.getAll(value);
  },

  // Cache API response
  async cacheResponse(
    url: string,
    params: any,
    data: any,
    expirationMinutes: number = 60
  ): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    const expiresAt = now + expirationMinutes * 60 * 1000;

    await db.put('cached-responses', {
      url,
      params,
      data,
      timestamp: now,
      expiresAt,
    });
  },

  // Get cached response
  async getCachedResponse(url: string): Promise<any | undefined> {
    const db = await getDB();
    const cached = await db.get('cached-responses', url);

    if (!cached) {
      return undefined;
    }

    // Check if the cache has expired
    if (cached.expiresAt < Date.now()) {
      await db.delete('cached-responses', url);
      return undefined;
    }

    return cached.data;
  },

  // Add a pending change
  async addPendingChange(
    entity: string,
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    const db = await getDB();
    const id = `${entity}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.add('pending-changes', {
      id,
      timestamp: Date.now(),
      entity,
      action,
      data,
      retries: 0,
      status: 'pending'
    });

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('syncData');
    } else {
      // If background sync is not supported, try to sync immediately
      this.syncPendingChanges();
    }

    return id;
  },

  // Get all pending changes
  async getPendingChanges(): Promise<any[]> {
    const db = await getDB();
    return db.getAllFromIndex('pending-changes', 'by-timestamp');
  },

  // Get pending changes by status
  async getPendingChangesByStatus(status: 'pending' | 'processing' | 'completed' | 'error'): Promise<any[]> {
    const db = await getDB();
    return db.getAllFromIndex('pending-changes', 'by-status', status);
  },

  // Get pending changes count
  async getPendingChangesCount(): Promise<number> {
    const db = await getDB();
    return db.count('pending-changes');
  },

  // Get pending changes count by status
  async getPendingChangesCountByStatus(status: 'pending' | 'processing' | 'completed' | 'error'): Promise<number> {
    const db = await getDB();
    return db.countFromIndex('pending-changes', 'by-status', status);
  },

  // Update pending change status
  async updatePendingChangeStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'error',
    errorMessage?: string
  ): Promise<void> {
    const db = await getDB();
    const change = await db.get('pending-changes', id);

    if (change) {
      change.status = status;
      if (errorMessage) {
        change.errorMessage = errorMessage;
      }
      await db.put('pending-changes', change);
    }
  },

  // Sync pending changes
  async syncPendingChanges(): Promise<{ success: number; failed: number }> {
    const pendingChanges = await this.getPendingChangesByStatus('pending');
    let success = 0;
    let failed = 0;

    for (const change of pendingChanges) {
      try {
        // Mark as processing
        await this.updatePendingChangeStatus(change.id, 'processing');

        // Determine API endpoint and method
        let url = `/api/${change.entity}`;
        let method = 'POST';

        if (change.action === 'update') {
          url = `${url}/${change.data.id}`;
          method = 'PUT';
        } else if (change.action === 'delete') {
          url = `${url}/${change.data.id}`;
          method = 'DELETE';
        }

        // Make API request
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: change.action === 'delete' ? undefined : JSON.stringify(change.data)
        });

        if (response.ok) {
          // Mark as completed
          await this.updatePendingChangeStatus(change.id, 'completed');
          success++;
        } else {
          // Mark as error
          const errorText = await response.text();
          await this.updatePendingChangeStatus(
            change.id,
            'error',
            `Server responded with ${response.status}: ${errorText}`
          );
          failed++;
        }
      } catch (error) {
        // Mark as error
        await this.updatePendingChangeStatus(
          change.id,
          'error',
          error instanceof Error ? error.message : 'Unknown error'
        );
        failed++;
      }
    }

    return { success, failed };
  },

  // Retry failed changes
  async retryFailedChanges(): Promise<{ success: number; failed: number }> {
    const failedChanges = await this.getPendingChangesByStatus('error');

    // Reset status to pending
    for (const change of failedChanges) {
      change.status = 'pending';
      change.retries += 1;
      await getDB().then(db => db.put('pending-changes', change));
    }

    // Sync again
    return this.syncPendingChanges();
  },

  // Delete a pending change
  async deletePendingChange(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pending-changes', id);
  },

  // Clear all pending changes
  async clearPendingChanges(): Promise<void> {
    const db = await getDB();
    await db.clear('pending-changes');
  },
};

export default offlineStorage;
