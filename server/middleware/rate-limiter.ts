/**
 * Rate Limiter Middleware
 *
 * Limits the number of requests a client can make in a given time period
 * to protect against brute force attacks and DoS attacks.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sendError } from '../utils/api-response';

// Create different rate limiters for different routes
const authLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60, // per 1 minute
  blockDuration: 300, // Block for 5 minutes if exceeded
});

const apiLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 1 minute
  blockDuration: 60, // Block for 1 minute if exceeded
});

const feedbackLimiter = new RateLimiterMemory({
  points: 10, // 10 submissions
  duration: 60, // per 1 minute
  blockDuration: 120, // Block for 2 minutes if exceeded
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
 * Rate limiter middleware factory
 * @param limiter The rate limiter to use
 * @param errorMessage Custom error message
 * @returns Express middleware function
 */
export function createRateLimiter(limiter: RateLimiterMemory, errorMessage: string = 'Too many requests, please try again later') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP address as key, or user ID if authenticated
      const key = req.user?.id?.toString() || getClientIp(req);

      await limiter.consume(key);
      next();
    } catch (error) {
      // Calculate retry after time
      const retryAfter = Math.floor((error as any).msBeforeNext / 1000) || 60;

      // Set retry-after header
      res.set('Retry-After', String(retryAfter));

      // Send standardized error response
      sendError(
        res,
        'rate_limit_exceeded',
        errorMessage,
        429,
        {
          retryAfter,
          requestId: req.headers['x-request-id'] || undefined
        }
      );
    }
  };
}

// Export pre-configured rate limiters for common routes
export const authRateLimiter = createRateLimiter(
  authLimiter,
  'Too many authentication attempts, please try again later'
);

export const apiRateLimiter = createRateLimiter(
  apiLimiter,
  'Too many requests, please try again later'
);

export const feedbackRateLimiter = createRateLimiter(
  feedbackLimiter,
  'Too many feedback submissions, please try again later'
);
