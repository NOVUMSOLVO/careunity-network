/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  sendError,
  sendValidationError,
  sendConflict,
  sendBadRequest,
  sendServerError,
  sendNotFound
} from '../utils/api-response';

// PostgreSQL error codes
type PgError = Error & { code?: string };

/**
 * Custom API error class
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, 'bad_request', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'unauthorized');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'forbidden');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404, 'not_found');
  }

  static conflict(message: string, details?: any) {
    return new ApiError(message, 409, 'conflict', details);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500, 'internal_error');
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Log request details for better debugging
  console.error(`Request: ${req.method} ${req.path}`);

  // Add request ID for tracking if available
  const requestId = req.headers['x-request-id'] || '';

  // Handle API errors
  if (err instanceof ApiError) {
    return sendError(
      res,
      err.code,
      err.message,
      err.statusCode,
      {
        ...err.details,
        requestId: requestId || undefined
      }
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return sendValidationError(
      res,
      {
        errors: err.errors,
        requestId: requestId || undefined
      },
      'Validation error'
    );
  }

  // Handle database errors
  if ((err as PgError).code) {
    const pgError = err as PgError;

    // Handle unique constraint violations
    if (pgError.code === '23505') {
      return sendConflict(
        res,
        'A resource with this identifier already exists',
        { requestId: requestId || undefined }
      );
    }

    // Handle foreign key violations
    if (pgError.code === '23503') {
      return sendBadRequest(
        res,
        'Referenced resource does not exist',
        {
          code: 'foreign_key_violation',
          requestId: requestId || undefined
        }
      );
    }
  }

  // Handle other errors
  return sendServerError(
    res,
    'An unexpected error occurred',
    {
      requestId: requestId || undefined,
      // Only include error details in development
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack,
        message: err.message
      })
    }
  );
}

/**
 * Not found middleware
 */
export function notFoundHandler(req: Request, res: Response) {
  sendNotFound(
    res,
    `Route not found: ${req.method} ${req.path}`
  );
}
