/**
 * CDN Service
 * 
 * This service provides CDN integration for static assets in the CareUnity application.
 * It supports uploading files to S3-compatible storage and generating CDN URLs.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';

// Types
interface CdnOptions {
  enabled?: boolean;
  url?: string;
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  maxAge?: number; // Cache control max age in seconds
}

interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

// Default options
const DEFAULT_OPTIONS: CdnOptions = {
  enabled: config.cdn.enabled,
  url: config.cdn.url,
  bucket: config.cdn.bucket,
  region: config.cdn.region,
  accessKey: config.cdn.accessKey,
  secretKey: config.cdn.secretKey,
  maxAge: 31536000 // 1 year
};

// S3 client
let s3Client: S3Client | null = null;

// Current options
let currentOptions: CdnOptions = DEFAULT_OPTIONS;

/**
 * Initialize the CDN service
 */
export function initCdnService(options: CdnOptions = {}): void {
  currentOptions = { ...DEFAULT_OPTIONS, ...options };
  
  if (!currentOptions.enabled) {
    logger.info('CDN service is disabled');
    return;
  }
  
  if (!currentOptions.bucket || !currentOptions.accessKey || !currentOptions.secretKey) {
    logger.warn('CDN service is enabled but missing required configuration');
    currentOptions.enabled = false;
    return;
  }
  
  try {
    s3Client = new S3Client({
      region: currentOptions.region,
      credentials: {
        accessKeyId: currentOptions.accessKey,
        secretAccessKey: currentOptions.secretKey
      }
    });
    
    logger.info('CDN service initialized');
  } catch (error) {
    logger.error('Failed to initialize CDN service:', error);
    currentOptions.enabled = false;
  }
}

/**
 * Check if the CDN service is enabled
 */
export function isEnabled(): boolean {
  return currentOptions.enabled === true && s3Client !== null;
}

/**
 * Upload a file to the CDN
 */
export async function uploadFile(
  filePath: string,
  key?: string,
  options: UploadOptions = {}
): Promise<string> {
  if (!isEnabled()) {
    throw new Error('CDN service is not enabled');
  }
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath);
    
    // Generate a key if not provided
    const fileKey = key || generateKey(filePath);
    
    // Determine content type
    const contentType = options.contentType || mime.lookup(filePath) || 'application/octet-stream';
    
    // Upload the file
    const command = new PutObjectCommand({
      Bucket: currentOptions.bucket,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: options.cacheControl || `max-age=${currentOptions.maxAge}`,
      ACL: options.isPublic ? 'public-read' : undefined,
      Metadata: options.metadata
    });
    
    await s3Client!.send(command);
    
    // Return the CDN URL
    return getCdnUrl(fileKey);
  } catch (error) {
    logger.error(`Failed to upload file ${filePath} to CDN:`, error);
    throw error;
  }
}

/**
 * Upload a buffer to the CDN
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  options: UploadOptions = {}
): Promise<string> {
  if (!isEnabled()) {
    throw new Error('CDN service is not enabled');
  }
  
  try {
    // Determine content type
    const contentType = options.contentType || mime.lookup(key) || 'application/octet-stream';
    
    // Upload the buffer
    const command = new PutObjectCommand({
      Bucket: currentOptions.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: options.cacheControl || `max-age=${currentOptions.maxAge}`,
      ACL: options.isPublic ? 'public-read' : undefined,
      Metadata: options.metadata
    });
    
    await s3Client!.send(command);
    
    // Return the CDN URL
    return getCdnUrl(key);
  } catch (error) {
    logger.error(`Failed to upload buffer to CDN:`, error);
    throw error;
  }
}

/**
 * Delete a file from the CDN
 */
export async function deleteFile(key: string): Promise<void> {
  if (!isEnabled()) {
    throw new Error('CDN service is not enabled');
  }
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: currentOptions.bucket,
      Key: key
    });
    
    await s3Client!.send(command);
    
    logger.debug(`Deleted file ${key} from CDN`);
  } catch (error) {
    logger.error(`Failed to delete file ${key} from CDN:`, error);
    throw error;
  }
}

/**
 * Generate a signed URL for a file
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!isEnabled()) {
    throw new Error('CDN service is not enabled');
  }
  
  try {
    const command = new PutObjectCommand({
      Bucket: currentOptions.bucket,
      Key: key
    });
    
    const signedUrl = await getSignedUrl(s3Client!, command, { expiresIn });
    
    return signedUrl;
  } catch (error) {
    logger.error(`Failed to generate signed URL for ${key}:`, error);
    throw error;
  }
}

/**
 * Get the CDN URL for a file
 */
export function getCdnUrl(key: string): string {
  if (!currentOptions.url) {
    throw new Error('CDN URL is not configured');
  }
  
  // Ensure the URL ends with a slash
  const baseUrl = currentOptions.url.endsWith('/')
    ? currentOptions.url
    : `${currentOptions.url}/`;
  
  // Ensure the key doesn't start with a slash
  const normalizedKey = key.startsWith('/') ? key.substring(1) : key;
  
  return `${baseUrl}${normalizedKey}`;
}

/**
 * Generate a unique key for a file
 */
export function generateKey(filePath: string): string {
  const fileName = path.basename(filePath);
  const extension = path.extname(fileName);
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(`${fileName}${timestamp}`).digest('hex').substring(0, 8);
  
  return `uploads/${timestamp}-${hash}${extension}`;
}

/**
 * Process a URL to use CDN if enabled
 */
export function processCdnUrl(url: string): string {
  if (!isEnabled() || !url) {
    return url;
  }
  
  // If the URL is already absolute, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If the URL is for a static asset, convert it to a CDN URL
  if (url.startsWith('/static/') || url.startsWith('/assets/') || url.startsWith('/images/')) {
    // Remove the leading slash
    const key = url.startsWith('/') ? url.substring(1) : url;
    return getCdnUrl(key);
  }
  
  return url;
}

export default {
  initCdnService,
  isEnabled,
  uploadFile,
  uploadBuffer,
  deleteFile,
  getSignedFileUrl,
  getCdnUrl,
  generateKey,
  processCdnUrl
};
