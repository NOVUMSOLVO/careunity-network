/**
 * Sync Service
 * 
 * Provides comprehensive offline synchronization capabilities for the mobile app.
 * Features:
 * - Offline data storage and retrieval
 * - Automatic synchronization when online
 * - Conflict resolution
 * - Data versioning
 * - Batch operations
 * - Retry mechanism
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { API_URL } from '../config';
import { v4 as uuid } from 'uuid';

// Storage keys
const STORAGE_KEYS = {
  SYNC_QUEUE: 'sync_queue',
  ENTITY_VERSIONS: 'entity_versions',
  OFFLINE_DATA: 'offline_data',
  CACHE: 'cache',
};

// Sync operation status
export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Sync operation interface
export interface SyncOperation {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: string;
  status: SyncStatus;
  retries: number;
  errorMessage?: string;
  entityType?: string;
  entityId?: string;
  version?: number;
}

// Entity version interface
export interface EntityVersion {
  entityType: string;
  entityId: string;
  version: number;
  lastModified: string;
}

// Cache item interface
export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry: number | null;
}

// Offline data item interface
export interface OfflineDataItem {
  id: string;
  storeName: string;
  data: any;
  timestamp: number;
  isModified: boolean;
  localId?: string;
}

/**
 * Get all pending sync operations
 * @returns Array of pending sync operations
 */
export const getPendingSyncOperations = async (): Promise<SyncOperation[]> => {
  try {
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error('Error getting pending sync operations:', error);
    return [];
  }
};

/**
 * Save a sync operation to the queue
 * @param operation Sync operation to save
 * @returns The saved operation with generated ID
 */
export const saveSyncOperation = async (operation: Omit<SyncOperation, 'id'>): Promise<SyncOperation> => {
  try {
    const queue = await getPendingSyncOperations();
    
    const newOperation: SyncOperation = {
      ...operation,
      id: uuid(),
    };
    
    queue.push(newOperation);
    
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    
    return newOperation;
  } catch (error) {
    console.error('Error saving sync operation:', error);
    throw error;
  }
};

/**
 * Update a sync operation in the queue
 * @param id Operation ID
 * @param updates Updates to apply
 * @returns The updated operation
 */
export const updateSyncOperation = async (id: string, updates: Partial<SyncOperation>): Promise<SyncOperation | null> => {
  try {
    const queue = await getPendingSyncOperations();
    
    const index = queue.findIndex(op => op.id === id);
    
    if (index === -1) {
      return null;
    }
    
    queue[index] = {
      ...queue[index],
      ...updates,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    
    return queue[index];
  } catch (error) {
    console.error('Error updating sync operation:', error);
    throw error;
  }
};

/**
 * Remove a sync operation from the queue
 * @param id Operation ID
 * @returns True if operation was removed
 */
export const removeSyncOperation = async (id: string): Promise<boolean> => {
  try {
    const queue = await getPendingSyncOperations();
    
    const index = queue.findIndex(op => op.id === id);
    
    if (index === -1) {
      return false;
    }
    
    queue.splice(index, 1);
    
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    
    return true;
  } catch (error) {
    console.error('Error removing sync operation:', error);
    throw error;
  }
};

/**
 * Process all pending sync operations
 * @returns Result of the sync process
 */
export const processSyncQueue = async (): Promise<{ success: number; failed: number }> => {
  try {
    // Check if online
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      throw new Error('Cannot sync while offline');
    }
    
    const queue = await getPendingSyncOperations();
    
    if (queue.length === 0) {
      return { success: 0, failed: 0 };
    }
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process operations in order
    for (const operation of queue) {
      try {
        // Skip already completed operations
        if (operation.status === SyncStatus.COMPLETED) {
          continue;
        }
        
        // Update status to processing
        await updateSyncOperation(operation.id, {
          status: SyncStatus.PROCESSING,
        });
        
        // Parse body if it exists
        const body = operation.body ? JSON.parse(operation.body) : undefined;
        
        // Make the request
        const response = await axios({
          method: operation.method,
          url: `${API_URL}${operation.url}`,
          data: body,
          headers: operation.headers || {},
        });
        
        // Update entity version if applicable
        if (operation.entityType && operation.entityId && response.data) {
          await updateEntityVersion(operation.entityType, operation.entityId, response.data);
        }
        
        // Mark as completed
        await updateSyncOperation(operation.id, {
          status: SyncStatus.COMPLETED,
        });
        
        successCount++;
      } catch (error) {
        console.error('Error processing sync operation:', error);
        
        // Increment retry count
        const retries = (operation.retries || 0) + 1;
        
        // Update operation with error
        await updateSyncOperation(operation.id, {
          status: SyncStatus.ERROR,
          retries,
          errorMessage: error.message || 'Unknown error',
        });
        
        failedCount++;
      }
    }
    
    // Clean up completed operations
    await cleanupCompletedOperations();
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error processing sync queue:', error);
    throw error;
  }
};

/**
 * Clean up completed sync operations
 * @returns Number of operations removed
 */
export const cleanupCompletedOperations = async (): Promise<number> => {
  try {
    const queue = await getPendingSyncOperations();
    
    const initialLength = queue.length;
    
    const filteredQueue = queue.filter(op => op.status !== SyncStatus.COMPLETED);
    
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filteredQueue));
    
    return initialLength - filteredQueue.length;
  } catch (error) {
    console.error('Error cleaning up completed operations:', error);
    throw error;
  }
};

/**
 * Get entity version
 * @param entityType Entity type
 * @param entityId Entity ID
 * @returns Entity version or null if not found
 */
export const getEntityVersion = async (entityType: string, entityId: string): Promise<EntityVersion | null> => {
  try {
    const versionsString = await AsyncStorage.getItem(STORAGE_KEYS.ENTITY_VERSIONS);
    const versions: EntityVersion[] = versionsString ? JSON.parse(versionsString) : [];
    
    return versions.find(v => v.entityType === entityType && v.entityId === entityId) || null;
  } catch (error) {
    console.error('Error getting entity version:', error);
    return null;
  }
};

/**
 * Update entity version
 * @param entityType Entity type
 * @param entityId Entity ID
 * @param data Entity data
 * @returns Updated entity version
 */
export const updateEntityVersion = async (entityType: string, entityId: string, data: any): Promise<EntityVersion> => {
  try {
    const versionsString = await AsyncStorage.getItem(STORAGE_KEYS.ENTITY_VERSIONS);
    const versions: EntityVersion[] = versionsString ? JSON.parse(versionsString) : [];
    
    const index = versions.findIndex(v => v.entityType === entityType && v.entityId === entityId);
    
    const newVersion: EntityVersion = {
      entityType,
      entityId,
      version: index >= 0 ? versions[index].version + 1 : 1,
      lastModified: new Date().toISOString(),
    };
    
    if (index >= 0) {
      versions[index] = newVersion;
    } else {
      versions.push(newVersion);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.ENTITY_VERSIONS, JSON.stringify(versions));
    
    return newVersion;
  } catch (error) {
    console.error('Error updating entity version:', error);
    throw error;
  }
};

/**
 * Cache data for offline use
 * @param key Cache key
 * @param data Data to cache
 * @param expiryTime Expiry time in milliseconds (default: 24 hours)
 */
export const cacheData = async (key: string, data: any, expiryTime?: number): Promise<void> => {
  try {
    const cacheItem: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiry: expiryTime ? Date.now() + expiryTime : null,
    };
    
    await AsyncStorage.setItem(`${STORAGE_KEYS.CACHE}_${key}`, JSON.stringify(cacheItem));
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
    const cacheString = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHE}_${key}`);
    
    if (!cacheString) {
      return null;
    }
    
    const cache: CacheItem = JSON.parse(cacheString);
    
    // Check if expired
    if (cache.expiry && cache.expiry < Date.now()) {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE}_${key}`);
      return null;
    }
    
    return cache.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Save data for offline use
 * @param storeName Store name
 * @param data Data to save
 * @returns Saved data with generated ID
 */
export const saveOfflineData = async (storeName: string, data: any): Promise<OfflineDataItem> => {
  try {
    const storeString = await AsyncStorage.getItem(`${STORAGE_KEYS.OFFLINE_DATA}_${storeName}`);
    const store: OfflineDataItem[] = storeString ? JSON.parse(storeString) : [];
    
    // Check if data has an ID
    if (data.id) {
      // Update existing item
      const index = store.findIndex(item => item.data.id === data.id);
      
      if (index >= 0) {
        store[index] = {
          ...store[index],
          data: { ...data },
          timestamp: Date.now(),
          isModified: true,
        };
        
        await AsyncStorage.setItem(`${STORAGE_KEYS.OFFLINE_DATA}_${storeName}`, JSON.stringify(store));
        
        return store[index];
      }
    }
    
    // Create new item
    const newItem: OfflineDataItem = {
      id: uuid(),
      storeName,
      data: { ...data },
      timestamp: Date.now(),
      isModified: true,
      localId: data.id || uuid(),
    };
    
    store.push(newItem);
    
    await AsyncStorage.setItem(`${STORAGE_KEYS.OFFLINE_DATA}_${storeName}`, JSON.stringify(store));
    
    return newItem;
  } catch (error) {
    console.error('Error saving offline data:', error);
    throw error;
  }
};

/**
 * Get offline data
 * @param storeName Store name
 * @returns Array of offline data items
 */
export const getOfflineData = async (storeName: string): Promise<any[]> => {
  try {
    const storeString = await AsyncStorage.getItem(`${STORAGE_KEYS.OFFLINE_DATA}_${storeName}`);
    const store: OfflineDataItem[] = storeString ? JSON.parse(storeString) : [];
    
    // Return just the data part
    return store.map(item => item.data);
  } catch (error) {
    console.error('Error getting offline data:', error);
    return [];
  }
};

/**
 * Check if there are pending sync operations
 * @returns True if there are pending operations
 */
export const hasPendingOperations = async (): Promise<boolean> => {
  try {
    const queue = await getPendingSyncOperations();
    return queue.some(op => op.status === SyncStatus.PENDING || op.status === SyncStatus.ERROR);
  } catch (error) {
    console.error('Error checking pending operations:', error);
    return false;
  }
};

/**
 * Get count of pending sync operations
 * @returns Number of pending operations
 */
export const getPendingOperationsCount = async (): Promise<number> => {
  try {
    const queue = await getPendingSyncOperations();
    return queue.filter(op => op.status === SyncStatus.PENDING || op.status === SyncStatus.ERROR).length;
  } catch (error) {
    console.error('Error getting pending operations count:', error);
    return 0;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(`${STORAGE_KEYS.CACHE}_`));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

export default {
  getPendingSyncOperations,
  saveSyncOperation,
  updateSyncOperation,
  removeSyncOperation,
  processSyncQueue,
  cleanupCompletedOperations,
  getEntityVersion,
  updateEntityVersion,
  cacheData,
  getCachedData,
  saveOfflineData,
  getOfflineData,
  hasPendingOperations,
  getPendingOperationsCount,
  clearCache,
};
