/**
 * Image Optimizer Service
 * 
 * This service provides image optimization capabilities for the CareUnity application.
 * It includes resizing, format conversion, and compression.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { config } from '../config';
import cdnService from './cdn-service';

// Types
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  progressive?: boolean;
  withMetadata?: boolean;
  background?: string;
}

interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}

/**
 * Optimize an image file
 */
export async function optimizeImage(
  inputPath: string,
  outputPath?: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    // Get image info
    const imageInfo = await getImageInfo(inputPath);
    
    // Determine output path if not provided
    const finalOutputPath = outputPath || generateOutputPath(inputPath, options.format);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(finalOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine optimal format if not specified
    const format = options.format || determineOptimalFormat(imageInfo);
    
    // Determine optimal dimensions if not specified
    const { width, height } = determineOptimalDimensions(imageInfo, options);
    
    // Create Sharp instance
    let image = sharp(inputPath);
    
    // Resize if needed
    if (width || height) {
      image = image.resize({
        width,
        height,
        fit: options.fit || 'cover',
        position: options.position || 'centre',
        background: options.background || { r: 255, g: 255, b: 255, alpha: 1 }
      });
    }
    
    // Set format and quality
    switch (format) {
      case 'jpeg':
        image = image.jpeg({
          quality: options.quality || 80,
          progressive: options.progressive !== false,
          force: true
        });
        break;
      case 'png':
        image = image.png({
          quality: options.quality || 80,
          progressive: options.progressive !== false,
          force: true
        });
        break;
      case 'webp':
        image = image.webp({
          quality: options.quality || 80,
          force: true
        });
        break;
      case 'avif':
        image = image.avif({
          quality: options.quality || 80,
          force: true
        });
        break;
    }
    
    // Set metadata options
    if (options.withMetadata) {
      image = image.withMetadata();
    }
    
    // Save the optimized image
    await image.toFile(finalOutputPath);
    
    // Get optimized image info
    const optimizedInfo = await getImageInfo(finalOutputPath);
    
    // Log optimization results
    const originalSize = imageInfo.size;
    const optimizedSize = optimizedInfo.size;
    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;
    
    logger.info(`Image optimized: ${inputPath} -> ${finalOutputPath}`);
    logger.info(`Original: ${formatBytes(originalSize)} (${imageInfo.width}x${imageInfo.height}, ${imageInfo.format})`);
    logger.info(`Optimized: ${formatBytes(optimizedSize)} (${optimizedInfo.width}x${optimizedInfo.height}, ${optimizedInfo.format})`);
    logger.info(`Savings: ${formatBytes(savings)} (${savingsPercentage.toFixed(2)}%)`);
    
    return finalOutputPath;
  } catch (error) {
    logger.error(`Failed to optimize image ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Optimize an image and upload to CDN
 */
export async function optimizeAndUploadImage(
  inputPath: string,
  key?: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    // Optimize the image
    const optimizedPath = await optimizeImage(inputPath, undefined, options);
    
    // Upload to CDN if enabled
    if (cdnService.isEnabled()) {
      const cdnUrl = await cdnService.uploadFile(optimizedPath, key, {
        contentType: `image/${options.format || path.extname(optimizedPath).substring(1)}`,
        isPublic: true
      });
      
      // Clean up the optimized file
      fs.unlinkSync(optimizedPath);
      
      return cdnUrl;
    }
    
    // If CDN is not enabled, return the local path
    return optimizedPath.replace(/^.*[\\\/]public/, '');
  } catch (error) {
    logger.error(`Failed to optimize and upload image ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Generate responsive image variants
 */
export async function generateResponsiveImages(
  inputPath: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: ImageOptimizationOptions = {}
): Promise<string[]> {
  try {
    // Get image info
    const imageInfo = await getImageInfo(inputPath);
    
    // Filter out widths larger than the original image
    const filteredWidths = widths.filter(width => width <= imageInfo.width);
    
    // If all widths are larger than the original, use the original width
    if (filteredWidths.length === 0) {
      filteredWidths.push(imageInfo.width);
    }
    
    // Generate variants
    const outputPaths: string[] = [];
    
    for (const width of filteredWidths) {
      const outputPath = generateOutputPath(
        inputPath,
        options.format,
        `${width}w`
      );
      
      await optimizeImage(inputPath, outputPath, {
        ...options,
        width,
        height: Math.round(width * (imageInfo.height / imageInfo.width))
      });
      
      outputPaths.push(outputPath);
    }
    
    return outputPaths;
  } catch (error) {
    logger.error(`Failed to generate responsive images for ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Generate responsive images and upload to CDN
 */
export async function generateResponsiveImagesAndUpload(
  inputPath: string,
  key?: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: ImageOptimizationOptions = {}
): Promise<string[]> {
  try {
    // Generate responsive images
    const responsiveImagePaths = await generateResponsiveImages(inputPath, widths, options);
    
    // Upload to CDN if enabled
    if (cdnService.isEnabled()) {
      const cdnUrls: string[] = [];
      
      for (const imagePath of responsiveImagePaths) {
        const width = parseInt(path.basename(imagePath).split('_')[1].replace('w', ''));
        const imageKey = key ? `${key.replace(/\.[^/.]+$/, '')}_${width}w${path.extname(key)}` : undefined;
        
        const cdnUrl = await cdnService.uploadFile(imagePath, imageKey, {
          contentType: `image/${options.format || path.extname(imagePath).substring(1)}`,
          isPublic: true
        });
        
        cdnUrls.push(cdnUrl);
        
        // Clean up the optimized file
        fs.unlinkSync(imagePath);
      }
      
      return cdnUrls;
    }
    
    // If CDN is not enabled, return the local paths
    return responsiveImagePaths.map(p => p.replace(/^.*[\\\/]public/, ''));
  } catch (error) {
    logger.error(`Failed to generate and upload responsive images for ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Get image information
 */
export async function getImageInfo(imagePath: string): Promise<ImageInfo> {
  try {
    const stats = fs.statSync(imagePath);
    const metadata = await sharp(imagePath).metadata();
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || '',
      size: stats.size,
      hasAlpha: metadata.hasAlpha || false
    };
  } catch (error) {
    logger.error(`Failed to get image info for ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Generate output path for optimized image
 */
function generateOutputPath(
  inputPath: string,
  format?: string,
  suffix?: string
): string {
  const dir = path.dirname(inputPath);
  const ext = format ? `.${format}` : path.extname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));
  
  // Add suffix if provided
  const outputName = suffix ? `${name}_${suffix}${ext}` : `${name}${ext}`;
  
  return path.join(dir, outputName);
}

/**
 * Determine optimal format based on image info
 */
function determineOptimalFormat(imageInfo: ImageInfo): 'jpeg' | 'png' | 'webp' | 'avif' {
  // If the browser supports WebP, use it
  if (true) { // In a real implementation, check browser support
    return 'webp';
  }
  
  // If the image has alpha channel, use PNG
  if (imageInfo.hasAlpha) {
    return 'png';
  }
  
  // Otherwise, use JPEG
  return 'jpeg';
}

/**
 * Determine optimal dimensions based on image info and options
 */
function determineOptimalDimensions(
  imageInfo: ImageInfo,
  options: ImageOptimizationOptions
): { width?: number; height?: number } {
  // If both width and height are specified, use them
  if (options.width && options.height) {
    return { width: options.width, height: options.height };
  }
  
  // If only width is specified, calculate height to maintain aspect ratio
  if (options.width) {
    const aspectRatio = imageInfo.height / imageInfo.width;
    return {
      width: options.width,
      height: Math.round(options.width * aspectRatio)
    };
  }
  
  // If only height is specified, calculate width to maintain aspect ratio
  if (options.height) {
    const aspectRatio = imageInfo.width / imageInfo.height;
    return {
      width: Math.round(options.height * aspectRatio),
      height: options.height
    };
  }
  
  // If neither width nor height is specified, use original dimensions
  return { width: imageInfo.width, height: imageInfo.height };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  optimizeImage,
  optimizeAndUploadImage,
  generateResponsiveImages,
  generateResponsiveImagesAndUpload,
  getImageInfo
};
