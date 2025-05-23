/**
 * API Response Utilities
 * 
 * This module provides standardized response formatting for API endpoints.
 */

import { Response } from 'express';

/**
 * Standard API response format
 */
export interface ApiResponseFormat<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

/**
 * Send a success response
 * 
 * @param res Express response object
 * @param data Response data
 * @param statusCode HTTP status code (default: 200)
 * @param meta Additional metadata
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponseFormat<T>['meta']
): void {
  const response: ApiResponseFormat<T> = {
    data,
    error: null,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 * 
 * @param res Express response object
 * @param data Response data
 * @param meta Additional metadata
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: ApiResponseFormat<T>['meta']
): void {
  sendSuccess(res, data, 201, meta);
}

/**
 * Send a no content response (204)
 * 
 * @param res Express response object
 */
export function sendNoContent(res: Response): void {
  res.status(204).end();
}

/**
 * Send an error response
 * 
 * @param res Express response object
 * @param code Error code
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 * @param details Additional error details
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): void {
  const response: ApiResponseFormat<null> = {
    data: null,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
}

/**
 * Send a bad request error (400)
 * 
 * @param res Express response object
 * @param message Error message
 * @param details Additional error details
 */
export function sendBadRequest(
  res: Response,
  message: string = 'Bad request',
  details?: any
): void {
  sendError(res, 'bad_request', message, 400, details);
}

/**
 * Send an unauthorized error (401)
 * 
 * @param res Express response object
 * @param message Error message
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): void {
  sendError(res, 'unauthorized', message, 401);
}

/**
 * Send a forbidden error (403)
 * 
 * @param res Express response object
 * @param message Error message
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): void {
  sendError(res, 'forbidden', message, 403);
}

/**
 * Send a not found error (404)
 * 
 * @param res Express response object
 * @param message Error message
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  sendError(res, 'not_found', message, 404);
}

/**
 * Send a conflict error (409)
 * 
 * @param res Express response object
 * @param message Error message
 * @param details Additional error details
 */
export function sendConflict(
  res: Response,
  message: string = 'Resource conflict',
  details?: any
): void {
  sendError(res, 'conflict', message, 409, details);
}

/**
 * Send a validation error (400)
 * 
 * @param res Express response object
 * @param details Validation error details
 * @param message Error message
 */
export function sendValidationError(
  res: Response,
  details: any,
  message: string = 'Validation error'
): void {
  sendError(res, 'validation_error', message, 400, details);
}

/**
 * Send a server error (500)
 * 
 * @param res Express response object
 * @param message Error message
 * @param details Additional error details
 */
export function sendServerError(
  res: Response,
  message: string = 'Internal server error',
  details?: any
): void {
  sendError(res, 'internal_error', message, 500, details);
}
