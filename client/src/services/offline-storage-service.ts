/**
 * Offline Storage Service
 * 
 * This service provides IndexedDB storage for offline data management.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Database schema interface
 */
interface CareUnityDB extends DBSchema {
  // Pending API requests to be synced when online
  pendingRequests: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      body: string;
      timestamp: number;
      attempts: number;
      lastAttempt?: number;
    };
    indexes: { 'by-timestamp': number };
  };
  
  // Cached API responses
  cachedResponses: {
    key: string;
    value: {
      url: string;
      response: any;
      timestamp: number;
      expiresAt?: number;
    };
    indexes: { 'by-timestamp': number };
  };
  
  // Offline data for different entity types
  serviceUsers: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  
  carePlans: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  
  tasks: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  
  appointments: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  
  notes: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  
  // User settings and preferences
  settings: {
    key: string;
    value: any;
  };
}

/**
 * Offline storage service class
 */
export class OfflineStorageService {
  private db: IDBPDatabase<CareUnityDB> | null = null;
  private dbName = 'careunity-offline-db';
  private dbVersion = 1;
  
  /**
   * Initialize the database
   */
  public async initialize(): Promise<void> {
    try {
      this.db = await openDB<CareUnityDB>(this.dbName, this.dbVersion, {
        upgrade: (db, oldVersion, newVersion, transaction) => {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('pendingRequests')) {
            const pendingRequestsStore = db.createObjectStore('pendingRequests', { keyPath: 'id' });
            pendingRequestsStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('cachedResponses')) {
            const cachedResponsesStore = db.createObjectStore('cachedResponses', { keyPath: 'url' });
            cachedResponsesStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('serviceUsers')) {
            const serviceUsersStore = db.createObjectStore('serviceUsers', { keyPath: 'id' });
            serviceUsersStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('carePlans')) {
            const carePlansStore = db.createObjectStore('carePlans', { keyPath: 'id' });
            carePlansStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('tasks')) {
            const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
            tasksStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('appointments')) {
            const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
            appointmentsStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
            notesStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
        },
      });
      
      logger.info('IndexedDB initialized successfully');
    } catch (error) {
      logger.error('Error initializing IndexedDB:', error);
      throw error;
    }
  }
  
  /**
   * Add a pending request to be synced when online
   */
  public async addPendingRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: any
  ): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }
    
    const id = uuidv4();
    const timestamp = Date.now();
    
    const pendingRequest = {
      id,
      url,
      method,
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      timestamp,
      attempts: 0,
    };
    
    await this.db!.add('pendingRequests', pendingRequest);
    logger.info(`Added pending request: ${method} ${url}`);
    
    return id;
  }
  
  /**
   * Get all pending requests
   */
  public async getPendingRequests(): Promise<any[]> {
    if (!this.db) {
      await this.initialize();
    }
    
    return this.db!.getAllFromIndex('pendingRequests', 'by-timestamp');
  }
  
  /**
   * Remove a pending request
   */
  public async removePendingRequest(id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    await this.db!.delete('pendingRequests', id);
    logger.info(`Removed pending request: ${id}`);
  }
  
  /**
   * Update a pending request's attempt count
   */
  public async updatePendingRequestAttempt(id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    const request = await this.db!.get('pendingRequests', id);
    
    if (request) {
      request.attempts += 1;
      request.lastAttempt = Date.now();
      await this.db!.put('pendingRequests', request);
      logger.info(`Updated pending request attempt: ${id} (${request.attempts})`);
    }
  }
  
  /**
   * Cache an API response
   */
  public async cacheResponse(
    url: string,
    response: any,
    expiresIn?: number
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    const timestamp = Date.now();
    const expiresAt = expiresIn ? timestamp + expiresIn * 1000 : undefined;
    
    const cachedResponse = {
      url,
      response,
      timestamp,
      expiresAt,
    };
    
    await this.db!.put('cachedResponses', cachedResponse);
    logger.info(`Cached response for: ${url}`);
  }
  
  /**
   * Get a cached response
   */
  public async getCachedResponse(url: string): Promise<any | null> {
    if (!this.db) {
      await this.initialize();
    }
    
    const cached = await this.db!.get('cachedResponses', url);
    
    if (!cached) {
      return null;
    }
    
    // Check if the cached response has expired
    if (cached.expiresAt && cached.expiresAt < Date.now()) {
      await this.db!.delete('cachedResponses', url);
      logger.info(`Expired cached response for: ${url}`);
      return null;
    }
    
    logger.info(`Retrieved cached response for: ${url}`);
    return cached.response;
  }
  
  /**
   * Store an entity in the offline database
   */
  public async storeEntity<T extends { id: string }>(
    storeName: keyof CareUnityDB,
    entity: T
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    // Add timestamp for indexing
    const entityWithTimestamp = {
      ...entity,
      timestamp: Date.now(),
    };
    
    await this.db!.put(storeName as any, entityWithTimestamp);
    logger.info(`Stored entity in ${storeName}: ${entity.id}`);
  }
  
  /**
   * Get an entity from the offline database
   */
  public async getEntity<T>(
    storeName: keyof CareUnityDB,
    id: string
  ): Promise<T | null> {
    if (!this.db) {
      await this.initialize();
    }
    
    return this.db!.get(storeName as any, id);
  }
  
  /**
   * Get all entities from the offline database
   */
  public async getAllEntities<T>(storeName: keyof CareUnityDB): Promise<T[]> {
    if (!this.db) {
      await this.initialize();
    }
    
    return this.db!.getAll(storeName as any);
  }
  
  /**
   * Delete an entity from the offline database
   */
  public async deleteEntity(
    storeName: keyof CareUnityDB,
    id: string
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    await this.db!.delete(storeName as any, id);
    logger.info(`Deleted entity from ${storeName}: ${id}`);
  }
  
  /**
   * Clear all data from the offline database
   */
  public async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    const stores = [
      'pendingRequests',
      'cachedResponses',
      'serviceUsers',
      'carePlans',
      'tasks',
      'appointments',
      'notes',
      'settings',
    ];
    
    for (const store of stores) {
      await this.db!.clear(store as any);
    }
    
    logger.info('Cleared all offline data');
  }
}

// Export a singleton instance
export const offlineStorageService = new OfflineStorageService();

export default offlineStorageService;
