/**
 * CDN Middleware
 * 
 * This middleware redirects static asset requests to a CDN if enabled.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import cdnService from '../services/cdn-service';
import path from 'path';
import fs from 'fs';

// Types
interface CdnMiddlewareOptions {
  enabled?: boolean;
  paths?: string[];
  excludePaths?: string[];
  maxAge?: number;
}

// Default options
const DEFAULT_OPTIONS: CdnMiddlewareOptions = {
  enabled: true,
  paths: ['/static', '/assets', '/images', '/uploads'],
  excludePaths: ['/favicon.ico'],
  maxAge: 31536000 // 1 year in seconds
};

/**
 * Create CDN middleware
 */
export function cdnMiddleware(options: CdnMiddlewareOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // If CDN service is not enabled or middleware is disabled, return a pass-through middleware
  if (!cdnService.isEnabled() || !mergedOptions.enabled) {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
  
  // Return the actual middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the request is for a static asset
      const isStaticAsset = mergedOptions.paths?.some(path => req.path.startsWith(path));
      const isExcluded = mergedOptions.excludePaths?.some(path => req.path === path);
      
      if (!isStaticAsset || isExcluded) {
        return next();
      }
      
      // Get the CDN URL for the asset
      const cdnUrl = cdnService.processCdnUrl(req.path);
      
      // Redirect to the CDN URL
      res.redirect(cdnUrl);
    } catch (error) {
      logger.error('Error in CDN middleware:', error);
      next();
    }
  };
}

/**
 * Create CDN upload middleware for handling file uploads
 */
export function cdnUploadMiddleware(options: {
  fieldName: string;
  destination: string;
  allowedTypes?: string[];
  maxSize?: number;
  generateKey?: (req: Request, file: Express.Multer.File) => string;
}): (req: Request, res: Response, next: NextFunction) => void {
  const {
    fieldName,
    destination,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB
    generateKey
  } = options;
  
  // If CDN service is not enabled, return a pass-through middleware
  if (!cdnService.isEnabled()) {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
  
  // Return the actual middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the request has a file
      if (!req.file) {
        return next();
      }
      
      const file = req.file;
      
      // Check file type
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          allowedTypes
        });
      }
      
      // Check file size
      if (maxSize && file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          maxSize
        });
      }
      
      // Generate a key for the file
      const key = generateKey
        ? generateKey(req, file)
        : `${destination}/${Date.now()}-${file.originalname}`;
      
      // Upload the file to the CDN
      const cdnUrl = await cdnService.uploadFile(file.path, key, {
        contentType: file.mimetype,
        isPublic: true
      });
      
      // Add the CDN URL to the request
      req.body.cdnUrl = cdnUrl;
      
      // Clean up the temporary file
      fs.unlinkSync(file.path);
      
      next();
    } catch (error) {
      logger.error('Error in CDN upload middleware:', error);
      next(error);
    }
  };
}

/**
 * Create CDN asset processor middleware for HTML responses
 */
export function cdnAssetProcessorMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  // If CDN service is not enabled, return a pass-through middleware
  if (!cdnService.isEnabled()) {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
  
  // Return the actual middleware
  return (req: Request, res: Response, next: NextFunction) => {
    // Save the original send method
    const originalSend = res.send;
    
    // Override the send method
    res.send = function(body?: any): Response {
      // Only process HTML responses
      if (typeof body === 'string' && res.getHeader('content-type')?.toString().includes('text/html')) {
        // Replace static asset URLs with CDN URLs
        body = body.replace(
          /(src|href)=["'](\/(static|assets|images|uploads)\/[^"']+)["']/g,
          (match: string, attr: string, url: string) => {
            const cdnUrl = cdnService.processCdnUrl(url);
            return `${attr}="${cdnUrl}"`;
          }
        );
        
        // Replace inline style background images
        body = body.replace(
          /url\(['"]?(\/(static|assets|images|uploads)\/[^"')]+)['"]?\)/g,
          (match: string, url: string) => {
            const cdnUrl = cdnService.processCdnUrl(url);
            return `url('${cdnUrl}')`;
          }
        );
      }
      
      // Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
}

export default {
  cdnMiddleware,
  cdnUploadMiddleware,
  cdnAssetProcessorMiddleware
};
