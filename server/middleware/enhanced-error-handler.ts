/**
 * Enhanced Error Handling Middleware
 * 
 * This middleware provides comprehensive error handling for the application,
 * with detailed error responses, logging, and monitoring.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/api-error';
import { sendError, sendValidationError, sendServerError } from '../utils/api-response';
import monitoringService from '../services/monitoring-service';
import { v4 as uuidv4 } from 'uuid';

// PostgreSQL error codes
type PgError = Error & { code?: string };

// JWT error types
type JwtError = Error & { name: string };

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Add request ID middleware
 * 
 * This middleware adds a unique request ID to each request,
 * which can be used for tracking and debugging.
 */
export function addRequestId(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * Request logging middleware
 * 
 * This middleware logs details about each request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;
  
  // Log request details
  logger.info(`Request started: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Log response details when the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`Request completed: ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });
  
  next();
}

/**
 * Not found handler middleware
 * 
 * This middleware handles 404 errors for routes that don't exist.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.headers['x-request-id'] as string;
  
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
  });
  
  sendError(
    res,
    'not_found',
    `Route not found: ${req.method} ${req.path}`,
    404,
    { requestId }
  );
}

/**
 * Enhanced error handler middleware
 * 
 * This middleware provides comprehensive error handling for the application.
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Get request ID for tracking
  const requestId = req.headers['x-request-id'] as string;
  
  // Log error details
  logger.error(`Error in ${req.method} ${req.path}: ${err.message}`, {
    requestId,
    method: req.method,
    path: req.path,
    error: err,
    stack: err.stack,
  });
  
  // Track error in monitoring service
  monitoringService.trackError(err, req);
  
  // Handle API errors
  if (err instanceof ApiError) {
    return sendError(
      res,
      err.code,
      err.message,
      err.statusCode,
      {
        ...err.details,
        requestId,
      }
    );
  }
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    
    return sendValidationError(
      res,
      {
        errors: err.errors,
        message: validationError.message,
        requestId,
      }
    );
  }
  
  // Handle JWT errors
  const jwtError = err as JwtError;
  if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
    return sendError(
      res,
      'unauthorized',
      jwtError.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
      401,
      { requestId }
    );
  }
  
  // Handle database errors
  if ((err as PgError).code) {
    const pgError = err as PgError;
    
    // Handle unique constraint violations
    if (pgError.code === '23505') {
      return sendError(
        res,
        'conflict',
        'A resource with this identifier already exists',
        409,
        { requestId }
      );
    }
    
    // Handle foreign key violations
    if (pgError.code === '23503') {
      return sendError(
        res,
        'bad_request',
        'Referenced resource does not exist',
        400,
        { requestId }
      );
    }
    
    // Handle other database errors
    return sendError(
      res,
      'database_error',
      'Database error occurred',
      500,
      {
        requestId,
        ...(process.env.NODE_ENV !== 'production' && {
          code: pgError.code,
          message: pgError.message,
        }),
      }
    );
  }
  
  // Handle other errors
  return sendServerError(
    res,
    'An unexpected error occurred',
    {
      requestId,
      ...(process.env.NODE_ENV !== 'production' && {
        message: err.message,
        stack: err.stack,
      }),
    }
  );
}

export default {
  addRequestId,
  requestLogger,
  notFoundHandler,
  errorHandler,
};
