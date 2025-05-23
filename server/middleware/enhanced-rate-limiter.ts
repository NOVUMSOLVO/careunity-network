/**
 * Enhanced Rate Limiter Middleware
 * 
 * This middleware provides advanced rate limiting capabilities with different
 * strategies for different types of requests and endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis, IRateLimiterOptions } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { config } from '../config';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';

// Redis client for distributed rate limiting
let redisClient: Redis | null = null;

// Initialize Redis client if Redis is enabled
if (config.redis.enabled) {
  try {
    redisClient = new Redis(config.redis.url);
    logger.info('Redis client initialized for rate limiting');
  } catch (error) {
    logger.error('Failed to initialize Redis client for rate limiting:', error);
  }
}

// Rate limiter options
interface RateLimiterConfig {
  points: number;
  duration: number;
  blockDuration: number;
  keyPrefix: string;
}

// Rate limiter configurations for different endpoints
const rateLimiterConfigs: Record<string, RateLimiterConfig> = {
  // Authentication endpoints
  auth: {
    points: 5,
    duration: 60, // 5 requests per minute
    blockDuration: 300, // Block for 5 minutes if exceeded
    keyPrefix: 'rl:auth',
  },
  
  // API endpoints (general)
  api: {
    points: 100,
    duration: 60, // 100 requests per minute
    blockDuration: 60, // Block for 1 minute if exceeded
    keyPrefix: 'rl:api',
  },
  
  // Feedback endpoints
  feedback: {
    points: 10,
    duration: 60, // 10 requests per minute
    blockDuration: 120, // Block for 2 minutes if exceeded
    keyPrefix: 'rl:feedback',
  },
  
  // User management endpoints
  users: {
    points: 30,
    duration: 60, // 30 requests per minute
    blockDuration: 60, // Block for 1 minute if exceeded
    keyPrefix: 'rl:users',
  },
  
  // Service user endpoints
  serviceUsers: {
    points: 50,
    duration: 60, // 50 requests per minute
    blockDuration: 60, // Block for 1 minute if exceeded
    keyPrefix: 'rl:service-users',
  },
  
  // ML model endpoints
  mlModels: {
    points: 20,
    duration: 60, // 20 requests per minute
    blockDuration: 60, // Block for 1 minute if exceeded
    keyPrefix: 'rl:ml-models',
  },
};

// Create rate limiters
const rateLimiters: Record<string, RateLimiterMemory | RateLimiterRedis> = {};

// Initialize rate limiters
Object.entries(rateLimiterConfigs).forEach(([key, config]) => {
  const options: IRateLimiterOptions = {
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
    keyPrefix: config.keyPrefix,
  };
  
  if (redisClient) {
    // Use Redis-based rate limiter for distributed environments
    rateLimiters[key] = new RateLimiterRedis({
      ...options,
      storeClient: redisClient,
    });
    logger.info(`Redis-based rate limiter initialized for ${key}`);
  } else {
    // Fall back to memory-based rate limiter
    rateLimiters[key] = new RateLimiterMemory(options);
    logger.info(`Memory-based rate limiter initialized for ${key}`);
  }
});

/**
 * Get client IP address with support for proxies
 */
function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Create a rate limiter middleware
 * 
 * @param type The type of rate limiter to use
 * @param errorMessage Custom error message
 * @returns Express middleware function
 */
export function createRateLimiter(
  type: keyof typeof rateLimiters = 'api',
  errorMessage: string = 'Too many requests, please try again later'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the rate limiter
      const limiter = rateLimiters[type];
      if (!limiter) {
        logger.error(`Rate limiter type '${type}' not found`);
        return next();
      }
      
      // Use IP address as key, or user ID if authenticated
      const key = req.user?.id?.toString() || getClientIp(req);
      
      // Try to consume a point
      await limiter.consume(key);
      next();
    } catch (error: any) {
      // Calculate retry after time
      const retryAfter = Math.floor((error.msBeforeNext || 60000) / 1000);
      
      // Set retry-after header
      res.set('Retry-After', String(retryAfter));
      
      // Log rate limit exceeded
      logger.warn(`Rate limit exceeded for ${getClientIp(req)} on ${req.method} ${req.path}`);
      
      // Send error response
      next(ApiError.tooManyRequests(errorMessage, {
        retryAfter,
        requestId: req.headers['x-request-id'] || undefined
      }));
    }
  };
}

// Export pre-configured rate limiters for common routes
export const authRateLimiter = createRateLimiter(
  'auth',
  'Too many authentication attempts, please try again later'
);

export const apiRateLimiter = createRateLimiter(
  'api',
  'Too many requests, please try again later'
);

export const feedbackRateLimiter = createRateLimiter(
  'feedback',
  'Too many feedback submissions, please try again later'
);

export const usersRateLimiter = createRateLimiter(
  'users',
  'Too many user management requests, please try again later'
);

export const serviceUsersRateLimiter = createRateLimiter(
  'serviceUsers',
  'Too many service user requests, please try again later'
);

export const mlModelsRateLimiter = createRateLimiter(
  'mlModels',
  'Too many ML model requests, please try again later'
);

export default {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  feedbackRateLimiter,
  usersRateLimiter,
  serviceUsersRateLimiter,
  mlModelsRateLimiter,
};
