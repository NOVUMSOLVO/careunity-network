/**
 * Cache Service
 *
 * This service provides caching capabilities for the CareUnity application.
 * It includes in-memory caching with TTL, cache invalidation, and cache statistics.
 */

import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

// Types
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  checkPeriod?: number; // Period to check for expired keys in seconds
  maxKeys?: number; // Maximum number of keys in cache
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
}

interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
}

// Default options
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 300, // 5 minutes
  checkPeriod: 600, // 10 minutes
  maxKeys: 1000
};

// Cache instance
let cacheInstance: NodeCache;

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

/**
 * Initialize the cache with options
 */
export const initCache = (options: CacheOptions = {}): void => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  cacheInstance = new NodeCache({
    stdTTL: mergedOptions.ttl,
    checkperiod: mergedOptions.checkPeriod,
    maxKeys: mergedOptions.maxKeys,
    useClones: false // For better performance
  });

  logger.info(`Cache initialized with TTL: ${mergedOptions.ttl}s, Max keys: ${mergedOptions.maxKeys}`);

  // Setup event listeners
  cacheInstance.on('expired', (key, value) => {
    logger.debug(`Cache key expired: ${key}`);
  });

  cacheInstance.on('del', (key, value) => {
    stats.deletes++;
    logger.debug(`Cache key deleted: ${key}`);
  });

  cacheInstance.on('flush', () => {
    logger.info('Cache flushed');
  });
};

/**
 * Get a value from cache
 */
export const get = <T>(key: string): T | undefined => {
  if (!cacheInstance) {
    initCache();
  }

  const value = cacheInstance.get<T>(key);

  if (value === undefined) {
    stats.misses++;
    return undefined;
  }

  stats.hits++;
  return value;
};

/**
 * Set a value in cache
 */
export const set = <T>(key: string, value: T, ttl?: number): boolean => {
  if (!cacheInstance) {
    initCache();
  }

  const success = cacheInstance.set(key, value, ttl);

  if (success) {
    stats.sets++;
    logger.debug(`Cache key set: ${key}, TTL: ${ttl || DEFAULT_OPTIONS.ttl}s`);
  }

  return success;
};

/**
 * Delete a value from cache
 */
export const del = (keys: string | string[]): number => {
  if (!cacheInstance) {
    initCache();
  }

  const count = cacheInstance.del(keys);
  logger.debug(`Deleted ${count} cache keys`);

  return count;
};

/**
 * Check if a key exists in cache
 */
export const has = (key: string): boolean => {
  if (!cacheInstance) {
    initCache();
  }

  return cacheInstance.has(key);
};

/**
 * Flush the entire cache
 */
export const flush = (): void => {
  if (!cacheInstance) {
    initCache();
  }

  cacheInstance.flushAll();
  logger.info('Cache flushed');
};

/**
 * Get cache statistics
 */
export const getStats = (): any => {
  if (!cacheInstance) {
    initCache();
  }

  const cacheStats = cacheInstance.getStats();

  return {
    ...cacheStats,
    ...stats,
    hitRatio: stats.hits / (stats.hits + stats.misses) || 0
  };
};

/**
 * Get all cache keys
 */
export const getKeys = (): string[] => {
  if (!cacheInstance) {
    initCache();
  }

  return cacheInstance.keys();
};

/**
 * Get multiple values from cache
 */
export const mget = <T>(keys: string[]): Record<string, T> => {
  if (!cacheInstance) {
    initCache();
  }

  return cacheInstance.mget<T>(keys);
};

/**
 * Set multiple values in cache
 */
export const mset = <T>(keyValuePairs: Array<{ key: string, val: T, ttl?: number }>): boolean => {
  if (!cacheInstance) {
    initCache();
  }

  const success = cacheInstance.mset(keyValuePairs);

  if (success) {
    stats.sets += keyValuePairs.length;
    logger.debug(`Set ${keyValuePairs.length} cache keys`);
  }

  return success;
};

/**
 * Cache decorator for async functions
 */
export const cached = <T, A extends any[]>(
  keyPrefix: string,
  fn: (...args: A) => Promise<T>,
  ttl?: number
) => {
  return async (...args: A): Promise<T> => {
    // Create a cache key based on function arguments
    const key = `${keyPrefix}:${JSON.stringify(args)}`;

    // Try to get from cache
    const cachedValue = get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    // Execute the function
    const result = await fn(...args);

    // Cache the result
    set(key, result, ttl);

    return result;
  };
};

/**
 * Clear cache by type
 */
export const clear = (type: 'all' | 'api' | 'db' | 'user' = 'all'): void => {
  if (!cacheInstance) {
    initCache();
  }

  if (type === 'all') {
    flush();
    return;
  }

  // Get all keys with the specified prefix
  const keys = cacheInstance.keys().filter(key => key.startsWith(`${type}:`));

  if (keys.length > 0) {
    del(keys);
    logger.info(`Cleared ${keys.length} cache keys with type: ${type}`);
  }
};

// Export as both default and named export for compatibility
export default {
  initCache,
  get,
  set,
  del,
  has,
  flush,
  getStats,
  getKeys,
  mget,
  mset,
  cached,
  clear
};

// Export as a service object for the performance dashboard
export const cacheService = {
  getStats,
  clear
};
