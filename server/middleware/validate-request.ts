/**
 * Request Validation Middleware
 * 
 * This middleware validates request data against Zod schemas.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../utils/logger';

/**
 * Validate request body against a schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        logger.debug('Request body validation failed', { error: validationError });
        
        return res.status(400).json({
          status: 'error',
          code: 'validation_error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
}

/**
 * Validate request params against a schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        logger.debug('Request params validation failed', { error: validationError });
        
        return res.status(400).json({
          status: 'error',
          code: 'validation_error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
}

/**
 * Validate request query against a schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        logger.debug('Request query validation failed', { error: validationError });
        
        return res.status(400).json({
          status: 'error',
          code: 'validation_error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
}

export default {
  validateBody,
  validateParams,
  validateQuery
};
