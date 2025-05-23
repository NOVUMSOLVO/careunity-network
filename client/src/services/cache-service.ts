/**
 * Cache Service
 * 
 * A service for caching data in the browser to improve performance.
 * Supports:
 * - Memory cache
 * - LocalStorage cache
 * - IndexedDB cache
 * - Cache expiration
 * - Cache invalidation
 * - Cache compression
 */

import { compress, decompress } from '@/utils/compression';

// Cache storage types
export type CacheStorageType = 'memory' | 'localStorage' | 'indexedDB';

// Cache options
export interface CacheOptions {
  /** Storage type for the cache */
  storage?: CacheStorageType;
  
  /** Time-to-live in milliseconds */
  ttl?: number;
  
  /** Whether to compress the cached data */
  compress?: boolean;
  
  /** Version of the cache (for invalidation) */
  version?: string;
  
  /** Whether to use stale-while-revalidate strategy */
  staleWhileRevalidate?: boolean;
}

// Cache entry
interface CacheEntry<T> {
  /** The cached data */
  data: T;
  
  /** When the entry was created */
  createdAt: number;
  
  /** When the entry expires */
  expiresAt: number;
  
  /** Version of the cache */
  version: string;
  
  /** Whether the data is compressed */
  compressed: boolean;
}

// Default cache options
const DEFAULT_OPTIONS: CacheOptions = {
  storage: 'memory',
  ttl: 5 * 60 * 1000, // 5 minutes
  compress: false,
  version: '1.0.0',
  staleWhileRevalidate: false,
};

// Memory cache storage
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Cache Service
 */
export class CacheService {
  private options: CacheOptions;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly DB_NAME = 'careunity-cache';
  private readonly STORE_NAME = 'cache-store';
  
  /**
   * Create a new cache service
   */
  constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialize IndexedDB if needed
    if (this.options.storage === 'indexedDB') {
      this.initIndexedDB();
    }
  }
  
  /**
   * Initialize IndexedDB
   */
  private initIndexedDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }
    
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };
    });
    
    return this.dbPromise;
  }
  
  /**
   * Set a value in the cache
   */
  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const mergedOptions = { ...this.options, ...options };
    const { storage, ttl, compress: shouldCompress, version } = mergedOptions;
    
    // Prepare the cache entry
    const now = Date.now();
    const expiresAt = ttl ? now + ttl : Infinity;
    
    // Compress data if needed
    let data = value;
    let compressed = false;
    
    if (shouldCompress && value !== null && value !== undefined) {
      try {
        data = await compress(value);
        compressed = true;
      } catch (error) {
        console.error('Failed to compress data:', error);
        // Fall back to uncompressed data
      }
    }
    
    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      expiresAt,
      version: version || this.options.version || '1.0.0',
      compressed,
    };
    
    // Store the entry in the appropriate storage
    switch (storage) {
      case 'memory':
        memoryCache.set(key, entry);
        break;
        
      case 'localStorage':
        try {
          localStorage.setItem(key, JSON.stringify(entry));
        } catch (error) {
          console.error('Failed to store in localStorage:', error);
        }
        break;
        
      case 'indexedDB':
        try {
          const db = await this.initIndexedDB();
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          store.put({ key, ...entry });
        } catch (error) {
          console.error('Failed to store in IndexedDB:', error);
        }
        break;
    }
  }
  
  /**
   * Get a value from the cache
   */
  public async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const mergedOptions = { ...this.options, ...options };
    const { storage, version, staleWhileRevalidate } = mergedOptions;
    
    // Get the entry from the appropriate storage
    let entry: CacheEntry<T> | undefined | null;
    
    switch (storage) {
      case 'memory':
        entry = memoryCache.get(key) as CacheEntry<T> | undefined;
        break;
        
      case 'localStorage':
        try {
          const json = localStorage.getItem(key);
          if (json) {
            entry = JSON.parse(json) as CacheEntry<T>;
          }
        } catch (error) {
          console.error('Failed to retrieve from localStorage:', error);
        }
        break;
        
      case 'indexedDB':
        try {
          const db = await this.initIndexedDB();
          const transaction = db.transaction([this.STORE_NAME], 'readonly');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.get(key);
          
          entry = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        } catch (error) {
          console.error('Failed to retrieve from IndexedDB:', error);
        }
        break;
    }
    
    // If no entry found, return null
    if (!entry) {
      return null;
    }
    
    // Check if the entry is expired
    const now = Date.now();
    const isExpired = entry.expiresAt < now;
    
    // Check if the version matches
    const isVersionMismatch = entry.version !== (version || this.options.version || '1.0.0');
    
    // If expired or version mismatch, remove the entry and return null
    if (isExpired || isVersionMismatch) {
      if (!staleWhileRevalidate) {
        this.remove(key, { storage });
        return null;
      }
      // If using stale-while-revalidate, we'll return the stale data
    }
    
    // Decompress data if needed
    let data = entry.data;
    
    if (entry.compressed) {
      try {
        data = await decompress(entry.data);
      } catch (error) {
        console.error('Failed to decompress data:', error);
        return null;
      }
    }
    
    return data;
  }
  
  /**
   * Remove a value from the cache
   */
  public async remove(key: string, options?: CacheOptions): Promise<void> {
    const mergedOptions = { ...this.options, ...options };
    const { storage } = mergedOptions;
    
    switch (storage) {
      case 'memory':
        memoryCache.delete(key);
        break;
        
      case 'localStorage':
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Failed to remove from localStorage:', error);
        }
        break;
        
      case 'indexedDB':
        try {
          const db = await this.initIndexedDB();
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          store.delete(key);
        } catch (error) {
          console.error('Failed to remove from IndexedDB:', error);
        }
        break;
    }
  }
  
  /**
   * Clear all values from the cache
   */
  public async clear(options?: CacheOptions): Promise<void> {
    const mergedOptions = { ...this.options, ...options };
    const { storage } = mergedOptions;
    
    switch (storage) {
      case 'memory':
        memoryCache.clear();
        break;
        
      case 'localStorage':
        try {
          // Only clear keys that belong to our cache
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              try {
                const item = JSON.parse(localStorage.getItem(key) || '{}');
                if (item.version) {
                  localStorage.removeItem(key);
                }
              } catch (e) {
                // Not a valid cache item, skip
              }
            }
          }
        } catch (error) {
          console.error('Failed to clear localStorage:', error);
        }
        break;
        
      case 'indexedDB':
        try {
          const db = await this.initIndexedDB();
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          store.clear();
        } catch (error) {
          console.error('Failed to clear IndexedDB:', error);
        }
        break;
    }
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   */
  public async has(key: string, options?: CacheOptions): Promise<boolean> {
    const value = await this.get(key, options);
    return value !== null;
  }
}

// Create and export a default instance
export const cacheService = new CacheService();
