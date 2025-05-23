/**
 * CSRF Protection Middleware
 * 
 * Implements Cross-Site Request Forgery (CSRF) protection for the API.
 * Uses the double-submit cookie pattern for CSRF protection.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ApiError } from './error-handler';

// Configuration
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a random CSRF token
 * @returns Random token string
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF cookie
 * @param res Express response object
 * @param token CSRF token
 */
export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible from JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/'
  });
}

/**
 * Middleware to set CSRF token cookie
 */
export function csrfCookieMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate a new CSRF token
  const token = generateCsrfToken();
  
  // Set the CSRF token cookie
  setCsrfCookie(res, token);
  
  // Continue
  next();
}

/**
 * Middleware to verify CSRF token
 * Exempt GET, HEAD, OPTIONS requests as they should be idempotent
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get the CSRF token from the request header
  const csrfToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
  
  // Get the CSRF token from the cookie
  const csrfCookie = req.cookies[CSRF_COOKIE_NAME];
  
  // Verify that both tokens exist and match
  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
    return next(ApiError.forbidden('CSRF token validation failed'));
  }
  
  // Continue
  next();
}

/**
 * Middleware to refresh CSRF token
 */
export function refreshCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Generate a new CSRF token
  const token = generateCsrfToken();
  
  // Set the CSRF token cookie
  setCsrfCookie(res, token);
  
  // Add the token to the response body
  res.locals.csrfToken = token;
  
  // Continue
  next();
}

export default {
  csrfCookieMiddleware,
  csrfProtectionMiddleware,
  refreshCsrfToken,
  generateCsrfToken,
  setCsrfCookie
};
