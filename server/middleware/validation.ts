/**
 * Validation middleware for API requests
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendValidationError, sendServerError } from '../utils/api-response';

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return sendValidationError(
          res,
          {
            source: 'body',
            errors: result.error.errors,
            requestId: req.headers['x-request-id'] || undefined
          },
          'Invalid request body'
        );
      }

      // Add the validated data to the request object
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return sendServerError(
        res,
        'Server error during validation',
        { requestId: req.headers['x-request-id'] || undefined }
      );
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        return sendValidationError(
          res,
          {
            source: 'params',
            errors: result.error.errors,
            requestId: req.headers['x-request-id'] || undefined
          },
          'Invalid request parameters'
        );
      }

      // Add the validated data to the request object
      req.params = result.data as any;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return sendServerError(
        res,
        'Server error during validation',
        { requestId: req.headers['x-request-id'] || undefined }
      );
    }
  };
}

/**
 * Validate request query against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        return sendValidationError(
          res,
          {
            source: 'query',
            errors: result.error.errors,
            requestId: req.headers['x-request-id'] || undefined
          },
          'Invalid query parameters'
        );
      }

      // Add the validated data to the request object
      req.query = result.data as any;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return sendServerError(
        res,
        'Server error during validation',
        { requestId: req.headers['x-request-id'] || undefined }
      );
    }
  };
}

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
});
