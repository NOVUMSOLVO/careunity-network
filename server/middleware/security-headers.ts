/**
 * Security Headers Middleware
 * 
 * This middleware adds various security headers to protect against common web vulnerabilities.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Apply security headers to all responses
 */
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set Strict-Transport-Security
    // Ensures the browser only connects over HTTPS
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    
    // Set X-Content-Type-Options
    // Prevents browsers from interpreting files as a different MIME type
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Set X-Frame-Options
    // Protects against clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Set Referrer-Policy
    // Controls how much referrer information is included with requests
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set Permissions-Policy (formerly Feature-Policy)
    // Controls which browser features and APIs can be used
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Set X-XSS-Protection
    // Enables XSS filtering in browsers that support it
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Set X-Permitted-Cross-Domain-Policies
    // Controls loading of content in web clients like Adobe Flash or Acrobat
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Set Cache-Control
    // Controls how pages can be cached
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
    }
    
    next();
  };
}
