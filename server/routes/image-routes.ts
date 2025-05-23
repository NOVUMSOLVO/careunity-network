/**
 * Image Optimization API Routes
 * 
 * These routes provide on-demand image optimization capabilities for the CareUnity application.
 * Features include:
 * - Resizing
 * - Format conversion (JPEG, PNG, WebP, AVIF)
 * - Quality adjustment
 * - Cropping and positioning
 * - Caching of optimized images
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import sharp from 'sharp';
import { validateQuery } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import imageOptimizerService from '../services/image-optimizer';
import cacheService from '../services/cache-service';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = express.Router();

// Define validation schema for image optimization parameters
const imageOptimizationSchema = z.object({
  // Source image path (required)
  src: z.string().min(1),
  
  // Dimensions
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  
  // Format options
  format: z.enum(['jpeg', 'jpg', 'png', 'webp', 'avif']).optional(),
  quality: z.coerce.number().min(1).max(100).optional(),
  
  // Fit and positioning
  fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).optional(),
  position: z.string().optional(),
  
  // Additional options
  background: z.string().optional(),
  progressive: z.coerce.boolean().optional(),
  withMetadata: z.coerce.boolean().optional(),
  
  // Cache control
  cache: z.coerce.boolean().default(true),
  cacheTtl: z.coerce.number().optional()
});

// Cache configuration
const CACHE_ENABLED = true;
const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
const CACHE_PREFIX = 'image-optimizer:';

/**
 * Optimize an image on-demand
 * GET /api/v2/images/optimize
 */
router.get('/optimize', validateQuery(imageOptimizationSchema), async (req, res, next) => {
  try {
    const params = req.query as z.infer<typeof imageOptimizationSchema>;
    
    // Generate a cache key based on the request parameters
    const cacheKey = CACHE_PREFIX + JSON.stringify(params);
    
    // Check if the optimized image is already cached
    if (CACHE_ENABLED && params.cache) {
      const cachedImage = await cacheService.get(cacheKey);
      if (cachedImage) {
        // Set appropriate headers for cached image
        res.set('Content-Type', `image/${params.format || 'jpeg'}`);
        res.set('Cache-Control', `public, max-age=${params.cacheTtl || DEFAULT_CACHE_TTL}`);
        res.set('X-Cache', 'HIT');
        
        // Return the cached image
        return res.send(cachedImage);
      }
    }
    
    // Resolve the source image path
    const srcPath = path.resolve(process.cwd(), 'client/public', params.src.replace(/^\//, ''));
    
    // Check if the source image exists
    if (!fs.existsSync(srcPath)) {
      throw ApiError.notFound(`Image not found: ${params.src}`);
    }
    
    // Create a Sharp instance for the source image
    let image = sharp(srcPath);
    
    // Apply transformations based on parameters
    
    // Resize if width or height is specified
    if (params.width || params.height) {
      image = image.resize({
        width: params.width,
        height: params.height,
        fit: params.fit || 'cover',
        position: params.position || 'centre',
        background: params.background ? { r: 255, g: 255, b: 255, alpha: 1 } : undefined
      });
    }
    
    // Convert to the requested format
    if (params.format) {
      switch (params.format) {
        case 'jpeg':
        case 'jpg':
          image = image.jpeg({
            quality: params.quality || 80,
            progressive: params.progressive !== false
          });
          break;
        case 'png':
          image = image.png({
            quality: params.quality || 80,
            progressive: params.progressive !== false
          });
          break;
        case 'webp':
          image = image.webp({
            quality: params.quality || 80
          });
          break;
        case 'avif':
          image = image.avif({
            quality: params.quality || 70
          });
          break;
      }
    }
    
    // Preserve metadata if requested
    if (params.withMetadata) {
      image = image.withMetadata();
    }
    
    // Get the optimized image buffer
    const imageBuffer = await image.toBuffer();
    
    // Cache the optimized image if caching is enabled
    if (CACHE_ENABLED && params.cache) {
      await cacheService.set(cacheKey, imageBuffer, params.cacheTtl || DEFAULT_CACHE_TTL);
    }
    
    // Set appropriate headers
    res.set('Content-Type', `image/${params.format || 'jpeg'}`);
    res.set('Cache-Control', `public, max-age=${params.cacheTtl || DEFAULT_CACHE_TTL}`);
    res.set('X-Cache', 'MISS');
    
    // Send the optimized image
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * Get information about an image
 * GET /api/v2/images/info
 */
router.get('/info', validateQuery(z.object({
  src: z.string().min(1)
})), async (req, res, next) => {
  try {
    const { src } = req.query as { src: string };
    
    // Resolve the source image path
    const srcPath = path.resolve(process.cwd(), 'client/public', src.replace(/^\//, ''));
    
    // Check if the source image exists
    if (!fs.existsSync(srcPath)) {
      throw ApiError.notFound(`Image not found: ${src}`);
    }
    
    // Get image information
    const imageInfo = await imageOptimizerService.getImageInfo(srcPath);
    
    // Return the image information
    res.json(imageInfo);
  } catch (error) {
    next(error);
  }
});

export default router;
