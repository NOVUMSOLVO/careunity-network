/**
 * Content Security Policy Middleware
 *
 * Implements Content Security Policy (CSP) headers to protect against
 * cross-site scripting (XSS), clickjacking, and other code injection attacks.
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Apply security headers including Content Security Policy
 */
export function securityHeaders() {
  return [
    // Set Content Security Policy
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for development
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://via.placeholder.com', 'https://ui-avatars.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://api.openai.com', 'wss://*'],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    }),

    // Prevent clickjacking
    helmet.frameguard({ action: 'deny' }),

    // Disable MIME type sniffing
    helmet.noSniff(),

    // Set X-XSS-Protection header
    helmet.xssFilter(),

    // Hide X-Powered-By header
    helmet.hidePoweredBy(),

    // HTTP Strict Transport Security
    helmet.hsts({
      maxAge: 15552000, // 180 days in seconds
      includeSubDomains: true,
      preload: true,
    }),

    // Prevent browsers from performing DNS prefetching
    helmet.dnsPrefetchControl({ allow: false }),

    // Referrer Policy
    helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin',
    }),

    // Permissions Policy (formerly Feature Policy)
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      );
      next();
    },

    // Cross-Origin Resource Policy
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      next();
    },

    // Cross-Origin Opener Policy
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      next();
    },

    // Cross-Origin Embedder Policy
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    },
  ];
}

/**
 * Apply security headers for development environment
 * Less restrictive than production
 */
export function developmentSecurityHeaders() {
  return [
    // Set Content Security Policy for development
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://*'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        connectSrc: ["'self'", 'https://*', 'ws://*', 'wss://*'],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    }),

    // Prevent clickjacking
    helmet.frameguard({ action: 'sameorigin' }),

    // Disable MIME type sniffing
    helmet.noSniff(),

    // Set X-XSS-Protection header
    helmet.xssFilter(),

    // Hide X-Powered-By header
    helmet.hidePoweredBy(),
  ];
}
