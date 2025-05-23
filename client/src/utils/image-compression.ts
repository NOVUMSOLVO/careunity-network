/**
 * Image Compression Utilities
 * 
 * This module provides utilities for client-side image compression and optimization
 * before uploading to the server. It helps reduce bandwidth usage and improve
 * upload performance, especially on mobile devices or slow connections.
 */

/**
 * Options for image compression
 */
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  preserveExif?: boolean;
  orientation?: number;
  progressive?: boolean;
}

/**
 * Result of image compression
 */
export interface CompressedImageResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  dataUrl?: string;
}

/**
 * Compress an image file before upload
 * 
 * @param file The image file to compress
 * @param options Compression options
 * @returns Promise resolving to the compressed image result
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  // Default options
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    preserveExif = false,
    orientation = 1,
    progressive = true
  } = options;

  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('The provided file is not an image');
  }

  // Get the original file size
  const originalSize = file.size;

  // Create a FileReader to read the file
  const reader = new FileReader();

  // Create a promise to handle the FileReader
  const readerPromise = new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read the image file'));
    reader.readAsDataURL(file);
  });

  // Wait for the FileReader to complete
  const dataUrl = await readerPromise;

  // Create an Image element to load the image
  const img = new Image();

  // Create a promise to handle the Image loading
  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load the image'));
    img.src = dataUrl;
  });

  // Wait for the Image to load
  const loadedImg = await imagePromise;

  // Calculate the new dimensions while maintaining aspect ratio
  let width = loadedImg.width;
  let height = loadedImg.height;

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  // Create a canvas to draw the resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get the canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Handle image orientation
  if (orientation > 1) {
    ctx.save();

    // Set the origin to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply transformations based on orientation
    switch (orientation) {
      case 2: // horizontal flip
        ctx.scale(-1, 1);
        break;
      case 3: // 180° rotate
        ctx.rotate(Math.PI);
        break;
      case 4: // vertical flip
        ctx.scale(1, -1);
        break;
      case 5: // vertical flip + 90° rotate
        ctx.rotate(Math.PI / 2);
        ctx.scale(1, -1);
        break;
      case 6: // 90° rotate
        ctx.rotate(Math.PI / 2);
        break;
      case 7: // horizontal flip + 90° rotate
        ctx.rotate(Math.PI / 2);
        ctx.scale(-1, 1);
        break;
      case 8: // 270° rotate
        ctx.rotate(-Math.PI / 2);
        break;
    }

    // Move the origin back
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // Draw the image on the canvas
  ctx.drawImage(loadedImg, 0, 0, width, height);

  // Restore the context if we applied transformations
  if (orientation > 1) {
    ctx.restore();
  }

  // Convert the canvas to a Blob
  const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
  const qualityValue = format === 'png' ? undefined : quality;

  // Create a promise to handle the canvas.toBlob operation
  const blobPromise = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      qualityValue
    );
  });

  // Wait for the Blob to be created
  const blob = await blobPromise;

  // Create the result object
  const result: CompressedImageResult = {
    blob,
    width,
    height,
    originalSize,
    compressedSize: blob.size,
    compressionRatio: originalSize / blob.size,
    format,
    dataUrl: canvas.toDataURL(mimeType, qualityValue)
  };

  return result;
}

/**
 * Create a File object from a compressed image result
 * 
 * @param compressedImage The compressed image result
 * @param fileName The name for the new file
 * @returns A File object containing the compressed image
 */
export function createFileFromCompressedImage(
  compressedImage: CompressedImageResult,
  fileName: string
): File {
  const extension = compressedImage.format === 'jpeg' ? 'jpg' : compressedImage.format;
  const name = fileName.replace(/\.[^/.]+$/, '') + '.' + extension;
  
  return new File(
    [compressedImage.blob],
    name,
    {
      type: `image/${compressedImage.format}`,
      lastModified: Date.now()
    }
  );
}

/**
 * Extract EXIF orientation from an image file
 * 
 * @param file The image file
 * @returns Promise resolving to the orientation value (1-8) or 1 if not found
 */
export async function getImageOrientation(file: File): Promise<number> {
  // Only JPEG files have EXIF data
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return 1;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const view = new DataView(event.target?.result as ArrayBuffer);
      
      // Check for EXIF marker
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1);
        return;
      }
      
      const length = view.byteLength;
      let offset = 2;
      
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        
        // EXIF APP1 marker
        if (marker === 0xFFE1) {
          const exifOffset = offset + 6; // Skip 'Exif\0\0'
          
          // Get orientation tag
          try {
            const little = view.getUint16(exifOffset + 8, false) === 0x4949;
            offset = exifOffset + view.getUint32(exifOffset + 12, little);
            
            const tags = view.getUint16(exifOffset + 10, little);
            for (let i = 0; i < tags; i++) {
              const tag = view.getUint16(offset + (i * 12), little);
              if (tag === 0x0112) { // Orientation tag
                const orientation = view.getUint16(offset + (i * 12) + 8, little);
                resolve(orientation);
                return;
              }
            }
          } catch (e) {
            // If anything goes wrong, return default orientation
            resolve(1);
            return;
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      
      // Default orientation if not found
      resolve(1);
    };
    
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read only the first 64KB
  });
}

export default {
  compressImage,
  createFileFromCompressedImage,
  getImageOrientation
};
