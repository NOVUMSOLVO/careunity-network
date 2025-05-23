/**
 * API Error Utility
 * 
 * This module provides standardized API error handling.
 */

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

  static validation(message: string = 'Validation error', details?: any) {
    return new ApiError(message, 400, 'validation_error', details);
  }

  static tooManyRequests(message: string = 'Too many requests', details?: any) {
    return new ApiError(message, 429, 'too_many_requests', details);
  }

  static serviceUnavailable(message: string = 'Service unavailable') {
    return new ApiError(message, 503, 'service_unavailable');
  }
}

export default ApiError;
