/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './error-handler';

/**
 * User interface for JWT payload
 */
export interface JwtUser {
  id: number;
  username: string;
  role: string;
}

/**
 * Extend Express Request interface to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

/**
 * Middleware to ensure the request is authenticated
 */
export function ensureAuthenticated() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw ApiError.unauthorized('No authentication token provided');
      }

      // Extract the token (Bearer token)
      const token = authHeader.split(' ')[1];

      if (!token) {
        throw ApiError.unauthorized('Invalid authentication token format');
      }

      // Verify the token
      const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
      const decoded = jwt.verify(token, secret) as JwtUser;

      // Add the user to the request object
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(ApiError.unauthorized('Invalid or expired token'));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware to ensure the user has the required role
 */
export function ensureRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
