/**
 * Cache Factory
 * 
 * This service provides a factory for creating cache instances based on configuration.
 * It supports both in-memory and Redis caching.
 */

import { logger } from '../utils/logger';
import { config } from '../config';
import * as memoryCache from './cache-service';
import * as redisCache from './redis-cache-service';

// Cache interface
export interface CacheService {
  get<T>(key: string): Promise<T | null> | T | null | undefined;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean> | boolean;
  del(keys: string | string[]): Promise<number> | number;
  has(key: string): Promise<boolean> | boolean;
  flush(): Promise<void> | void;
  getStats(): any;
  getKeys(pattern?: string): Promise<string[]> | string[];
  mget<T>(keys: string[]): Promise<Record<string, T | null>> | Record<string, T | null | undefined>;
  cached<T, A extends any[]>(
    keyPrefix: string,
    fn: (...args: A) => Promise<T>,
    ttl?: number
  ): (...args: A) => Promise<T>;
}

// Cache type
type CacheType = 'memory' | 'redis';

// Cache instances
const cacheInstances: Record<CacheType, CacheService | null> = {
  memory: null,
  redis: null
};

// Current cache type
let currentCacheType: CacheType = config.cache.type as CacheType || 'memory';

/**
 * Initialize the cache service
 */
export async function initializeCache(): Promise<CacheService> {
  try {
    if (currentCacheType === 'redis' && config.redis.enabled) {
      // Initialize Redis cache
      await redisCache.initRedisCache({
        url: config.redis.url,
        defaultTtl: config.redis.defaultTtl,
        keyPrefix: config.redis.keyPrefix,
        enableCompression: config.redis.enableCompression,
        compressionThreshold: config.redis.compressionThreshold
      });
      
      cacheInstances.redis = redisCache;
      logger.info('Redis cache initialized');
      
      return redisCache;
    } else {
      // Initialize memory cache
      memoryCache.initCache({
        ttl: config.cache.defaultTtl,
        checkPeriod: config.cache.checkPeriod,
        maxKeys: config.cache.maxKeys
      });
      
      cacheInstances.memory = memoryCache;
      
      // If Redis was requested but not enabled, log a warning
      if (currentCacheType === 'redis' && !config.redis.enabled) {
        logger.warn('Redis cache requested but not enabled. Falling back to memory cache.');
        currentCacheType = 'memory';
      } else {
        logger.info('Memory cache initialized');
      }
      
      return memoryCache;
    }
  } catch (error) {
    logger.error('Failed to initialize cache:', error);
    
    // Fall back to memory cache if Redis initialization fails
    if (currentCacheType === 'redis') {
      logger.warn('Falling back to memory cache due to Redis initialization failure');
      currentCacheType = 'memory';
      
      // Initialize memory cache
      memoryCache.initCache({
        ttl: config.cache.defaultTtl,
        checkPeriod: config.cache.checkPeriod,
        maxKeys: config.cache.maxKeys
      });
      
      cacheInstances.memory = memoryCache;
    }
    
    return memoryCache;
  }
}

/**
 * Get the cache service
 */
export function getCache(): CacheService {
  const cache = cacheInstances[currentCacheType];
  
  if (!cache) {
    throw new Error(`Cache not initialized. Call initializeCache() first.`);
  }
  
  return cache;
}

/**
 * Switch the cache type
 */
export async function switchCacheType(type: CacheType): Promise<CacheService> {
  if (type === currentCacheType) {
    return getCache();
  }
  
  currentCacheType = type;
  return await initializeCache();
}

/**
 * Close all cache connections
 */
export async function closeCache(): Promise<void> {
  try {
    if (cacheInstances.redis) {
      await redisCache.close();
      cacheInstances.redis = null;
    }
    
    logger.info('Cache connections closed');
  } catch (error) {
    logger.error('Error closing cache connections:', error);
    throw error;
  }
}

// Create a proxy to the current cache implementation
const cacheProxy = new Proxy({} as CacheService, {
  get(target, prop) {
    const cache = getCache();
    return cache[prop as keyof CacheService];
  }
});

export default cacheProxy;
