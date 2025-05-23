/**
 * Redis Cache Service
 * 
 * This service provides distributed caching capabilities using Redis for the CareUnity application.
 * It includes TTL support, cache invalidation, and cache statistics.
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config';

// Types
interface RedisCacheOptions {
  url?: string;
  defaultTtl?: number; // Time to live in seconds
  keyPrefix?: string;
  enableCompression?: boolean;
  compressionThreshold?: number; // in bytes
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

// Default options
const DEFAULT_OPTIONS: RedisCacheOptions = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultTtl: 300, // 5 minutes
  keyPrefix: 'careunity:',
  enableCompression: true,
  compressionThreshold: 1024 // 1KB
};

// Redis client
let redisClient: RedisClientType;

// Cache statistics
const stats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0
};

// Compression utilities
import { gzipSync, gunzipSync } from 'zlib';

/**
 * Compress data if it exceeds the threshold
 */
function compressData(data: string, threshold: number): { data: string | Buffer, compressed: boolean } {
  if (data.length > threshold) {
    try {
      const compressed = gzipSync(Buffer.from(data));
      return { data: compressed, compressed: true };
    } catch (error) {
      logger.error('Error compressing data:', error);
      return { data, compressed: false };
    }
  }
  return { data, compressed: false };
}

/**
 * Decompress data if it was compressed
 */
function decompressData(data: Buffer, compressed: boolean): string {
  if (compressed) {
    try {
      return gunzipSync(data).toString();
    } catch (error) {
      logger.error('Error decompressing data:', error);
      return '';
    }
  }
  return data.toString();
}

/**
 * Initialize the Redis cache
 */
export async function initRedisCache(options: RedisCacheOptions = {}): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    redisClient = createClient({
      url: mergedOptions.url,
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff with max delay of 10 seconds
          const delay = Math.min(Math.pow(2, retries) * 100, 10000);
          return delay;
        }
      }
    });
    
    // Set up event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
      stats.errors++;
    });
    
    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Reconnecting to Redis');
    });
    
    // Connect to Redis
    await redisClient.connect();
    
    logger.info(`Redis cache initialized with TTL: ${mergedOptions.defaultTtl}s, Prefix: ${mergedOptions.keyPrefix}`);
  } catch (error) {
    logger.error('Failed to initialize Redis cache:', error);
    throw error;
  }
}

/**
 * Get the full key with prefix
 */
function getFullKey(key: string, options: RedisCacheOptions): string {
  return `${options.keyPrefix || DEFAULT_OPTIONS.keyPrefix}${key}`;
}

/**
 * Get a value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const fullKey = getFullKey(key, DEFAULT_OPTIONS);
    const cachedData = await redisClient.get(fullKey);
    
    if (!cachedData) {
      stats.misses++;
      return null;
    }
    
    try {
      // Check if the data is compressed
      const data = JSON.parse(cachedData);
      
      if (data && typeof data === 'object' && data._compressed) {
        // Decompress the data
        const decompressed = decompressData(Buffer.from(data.value, 'base64'), true);
        stats.hits++;
        return JSON.parse(decompressed) as T;
      } else {
        stats.hits++;
        return data as T;
      }
    } catch (error) {
      // If parsing fails, return the raw data
      stats.hits++;
      return cachedData as unknown as T;
    }
  } catch (error) {
    logger.error(`Error getting cache key ${key}:`, error);
    stats.errors++;
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const fullKey = getFullKey(key, DEFAULT_OPTIONS);
    const valueStr = JSON.stringify(value);
    
    // Check if compression should be applied
    if (DEFAULT_OPTIONS.enableCompression && valueStr.length > (DEFAULT_OPTIONS.compressionThreshold || 0)) {
      const { data, compressed } = compressData(valueStr, DEFAULT_OPTIONS.compressionThreshold || 0);
      
      if (compressed) {
        // Store compressed data with a flag
        const compressedData = {
          _compressed: true,
          value: Buffer.isBuffer(data) ? data.toString('base64') : data
        };
        
        if (ttl) {
          await redisClient.setEx(fullKey, ttl, JSON.stringify(compressedData));
        } else {
          await redisClient.setEx(fullKey, DEFAULT_OPTIONS.defaultTtl || 300, JSON.stringify(compressedData));
        }
      } else {
        // Store uncompressed data
        if (ttl) {
          await redisClient.setEx(fullKey, ttl, valueStr);
        } else {
          await redisClient.setEx(fullKey, DEFAULT_OPTIONS.defaultTtl || 300, valueStr);
        }
      }
    } else {
      // Store uncompressed data
      if (ttl) {
        await redisClient.setEx(fullKey, ttl, valueStr);
      } else {
        await redisClient.setEx(fullKey, DEFAULT_OPTIONS.defaultTtl || 300, valueStr);
      }
    }
    
    stats.sets++;
    return true;
  } catch (error) {
    logger.error(`Error setting cache key ${key}:`, error);
    stats.errors++;
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function del(keys: string | string[]): Promise<number> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const fullKeys = keysArray.map(key => getFullKey(key, DEFAULT_OPTIONS));
    
    const count = await redisClient.del(fullKeys);
    stats.deletes += count;
    
    return count;
  } catch (error) {
    logger.error(`Error deleting cache keys:`, error);
    stats.errors++;
    return 0;
  }
}

/**
 * Check if a key exists in cache
 */
export async function has(key: string): Promise<boolean> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const fullKey = getFullKey(key, DEFAULT_OPTIONS);
    const exists = await redisClient.exists(fullKey);
    
    return exists === 1;
  } catch (error) {
    logger.error(`Error checking cache key ${key}:`, error);
    stats.errors++;
    return false;
  }
}

/**
 * Flush the entire cache (only keys with the configured prefix)
 */
export async function flush(): Promise<void> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    // Get all keys with the prefix
    const keys = await redisClient.keys(`${DEFAULT_OPTIONS.keyPrefix}*`);
    
    if (keys.length > 0) {
      const count = await redisClient.del(keys);
      stats.deletes += count;
    }
    
    logger.info(`Flushed ${keys.length} keys from Redis cache`);
  } catch (error) {
    logger.error('Error flushing Redis cache:', error);
    stats.errors++;
  }
}

/**
 * Get cache statistics
 */
export function getStats(): CacheStats & { hitRatio: number } {
  const hitRatio = stats.hits / (stats.hits + stats.misses) || 0;
  
  return {
    ...stats,
    hitRatio
  };
}

/**
 * Get all cache keys with the configured prefix
 */
export async function getKeys(pattern: string = '*'): Promise<string[]> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const fullPattern = `${DEFAULT_OPTIONS.keyPrefix}${pattern}`;
    const keys = await redisClient.keys(fullPattern);
    
    // Remove the prefix from the keys
    return keys.map(key => key.replace(DEFAULT_OPTIONS.keyPrefix || '', ''));
  } catch (error) {
    logger.error('Error getting cache keys:', error);
    stats.errors++;
    return [];
  }
}

/**
 * Get multiple values from cache
 */
export async function mget<T>(keys: string[]): Promise<Record<string, T | null>> {
  if (!redisClient) {
    throw new Error('Redis cache not initialized');
  }
  
  try {
    const fullKeys = keys.map(key => getFullKey(key, DEFAULT_OPTIONS));
    const values = await redisClient.mGet(fullKeys);
    
    const result: Record<string, T | null> = {};
    
    keys.forEach((key, index) => {
      const value = values[index];
      
      if (value) {
        try {
          // Check if the data is compressed
          const data = JSON.parse(value);
          
          if (data && typeof data === 'object' && data._compressed) {
            // Decompress the data
            const decompressed = decompressData(Buffer.from(data.value, 'base64'), true);
            result[key] = JSON.parse(decompressed) as T;
            stats.hits++;
          } else {
            result[key] = data as T;
            stats.hits++;
          }
        } catch (error) {
          // If parsing fails, return the raw data
          result[key] = value as unknown as T;
          stats.hits++;
        }
      } else {
        result[key] = null;
        stats.misses++;
      }
    });
    
    return result;
  } catch (error) {
    logger.error('Error getting multiple cache keys:', error);
    stats.errors++;
    return {};
  }
}

/**
 * Cache decorator for async functions
 */
export function cached<T, A extends any[]>(
  keyPrefix: string,
  fn: (...args: A) => Promise<T>,
  ttl?: number
) {
  return async (...args: A): Promise<T> => {
    // Create a cache key based on function arguments
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    
    // Try to get from cache
    const cachedValue = await get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Execute the function
    const result = await fn(...args);
    
    // Cache the result
    await set(key, result, ttl);
    
    return result;
  };
}

/**
 * Close the Redis connection
 */
export async function close(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

export default {
  initRedisCache,
  get,
  set,
  del,
  has,
  flush,
  getStats,
  getKeys,
  mget,
  cached,
  close
};
