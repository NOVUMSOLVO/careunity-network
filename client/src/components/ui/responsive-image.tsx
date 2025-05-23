/**
 * Responsive Image Component
 *
 * This component provides responsive image loading with lazy loading,
 * srcset support, modern format selection, and fallback options.
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Responsive image sizes with srcset
 * - Modern image formats (WebP, AVIF) with fallbacks
 * - Low-quality image placeholders (LQIP)
 * - Blur-up loading effect
 * - Aspect ratio preservation
 * - Error handling with fallback images
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLazyImage } from '@/hooks/use-lazy-loading';
import { cn } from '@/lib/utils';

// Types
export interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  sizes?: string;
  srcSet?: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
  fallbackSrc?: string;
  placeholderSrc?: string;
  aspectRatio?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  lazyLoad?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  containerClassName?: string;
  blurEffect?: boolean;
  lowQualityPlaceholder?: boolean;
  priority?: boolean; // For high-priority images above the fold
  usePicture?: boolean; // Whether to use picture element for format selection
}

/**
 * Generate a low quality placeholder image URL
 * Uses the image optimization API to generate a tiny, low-quality version for fast loading
 */
function generateLowQualityPlaceholder(src: string): string {
  // Check if src is a data URL or external URL
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src;
  }

  // Check if the URL already has query parameters
  const hasParams = src.includes('?');

  // Add quality and width parameters - keep it very small for quick loading
  return `${src}${hasParams ? '&' : '?'}quality=10&width=20&format=webp`;
}

/**
 * Check if the browser supports a specific image format
 */
function supportsImageFormat(format: 'webp' | 'avif'): boolean {
  // In SSR, assume no support
  if (typeof document === 'undefined') return false;

  // Use a cached result if available
  if (format === 'webp' && typeof supportsImageFormat.webp !== 'undefined') {
    return supportsImageFormat.webp;
  }
  if (format === 'avif' && typeof supportsImageFormat.avif !== 'undefined') {
    return supportsImageFormat.avif;
  }

  // For WebP support
  if (format === 'webp') {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      // Check for WebP support
      const result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      // Cache the result
      supportsImageFormat.webp = result;
      return result;
    }
    return false;
  }

  // For AVIF support - more complex, use a feature detection approach
  if (format === 'avif') {
    const img = new Image();
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    img.onload = () => {
      supportsImageFormat.avif = true;
    };
    img.onerror = () => {
      supportsImageFormat.avif = false;
    };

    // Return current best guess, will be updated after the check completes
    return false;
  }

  return false;
}

// Add static properties to the function for caching results
supportsImageFormat.webp = undefined as boolean | undefined;
supportsImageFormat.avif = undefined as boolean | undefined;

/**
 * Responsive Image Component
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  srcSet,
  webpSrcSet,
  avifSrcSet,
  fallbackSrc,
  placeholderSrc,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  lazyLoad = true,
  threshold = 0.1,
  rootMargin = '200px',
  onLoad,
  onError,
  className,
  containerClassName,
  blurEffect = true,
  lowQualityPlaceholder = true,
  priority = false,
  usePicture = true,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Generate low quality placeholder if enabled
  const lqip = lowQualityPlaceholder && !placeholderSrc ? generateLowQualityPlaceholder(src) : placeholderSrc;

  // Use lazy loading hook if enabled and not priority
  const { currentSrc, loaded, imgRef } = (!priority && lazyLoad)
    ? useLazyImage(src, {
        placeholder: lqip || '',
        threshold,
        rootMargin
      })
    : { currentSrc: src, loaded: false, imgRef: imageRef };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Update loaded state when lazy loading completes
  useEffect(() => {
    if (lazyLoad && loaded) {
      setIsLoaded(true);
    }
  }, [lazyLoad, loaded]);

  // For priority images, mark as loaded immediately
  useEffect(() => {
    if (priority) {
      setIsLoaded(true);
    }
  }, [priority]);

  // Calculate padding based on aspect ratio
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;

  // Common image props
  const imageProps = {
    alt,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'max-w-full h-auto',
      aspectRatio && 'absolute inset-0 w-full h-full',
      isLoaded ? 'opacity-100' : 'opacity-0',
      'transition-opacity duration-300',
      className
    ),
    style: {
      objectFit,
      objectPosition
    },
    ...props
  };

  // Determine if we should use the picture element
  // Only use it if we have modern format srcSets and the usePicture prop is true
  const shouldUsePicture = usePicture && (!!webpSrcSet || !!avifSrcSet);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio && 'w-full',
        containerClassName
      )}
      style={{ paddingBottom }}
    >
      {/* Placeholder image or background */}
      {(lqip || blurEffect) && !isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted',
            blurEffect && 'backdrop-blur-sm'
          )}
          style={
            lqip
              ? {
                  backgroundImage: `url(${lqip})`,
                  backgroundSize: objectFit,
                  backgroundPosition: objectPosition,
                  filter: 'blur(10px)',
                  transform: 'scale(1.1)'
                }
              : undefined
          }
          aria-hidden="true"
        />
      )}

      {shouldUsePicture ? (
        /* Picture element for modern format support */
        <picture>
          {/* AVIF format - best compression, newer browsers */}
          {avifSrcSet && (
            <source
              srcSet={isLoaded || priority ? avifSrcSet : undefined}
              sizes={sizes}
              type="image/avif"
            />
          )}

          {/* WebP format - good compression, wide support */}
          {webpSrcSet && (
            <source
              srcSet={isLoaded || priority ? webpSrcSet : undefined}
              sizes={sizes}
              type="image/webp"
            />
          )}

          {/* Original format (jpg/png) - fallback for all browsers */}
          <img
            ref={imgRef as React.RefObject<HTMLImageElement>}
            src={(!priority && lazyLoad) ? currentSrc : src}
            srcSet={isLoaded || priority ? srcSet : undefined}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            {...imageProps}
          />
        </picture>
      ) : (
        /* Standard img element when picture not needed */
        <img
          ref={imgRef as React.RefObject<HTMLImageElement>}
          src={(!priority && lazyLoad) ? currentSrc : src}
          srcSet={isLoaded || priority ? srcSet : undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...imageProps}
        />
      )}

      {/* Fallback image (shown on error) */}
      {hasError && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt}
          className={cn(
            'max-w-full h-auto',
            aspectRatio && 'absolute inset-0 w-full h-full',
            'opacity-100 transition-opacity duration-300',
            className
          )}
          style={{
            objectFit,
            objectPosition
          }}
        />
      )}
    </div>
  );
}

/**
 * Generate srcSet string from an array of image URLs and widths
 */
export function generateSrcSet(images: { url: string; width: number }[]): string {
  return images
    .sort((a, b) => a.width - b.width)
    .map(({ url, width }) => `${url} ${width}w`)
    .join(', ');
}

/**
 * Generate WebP or AVIF srcSet from original image URLs
 * @param srcSet Original srcSet string
 * @param format Target format ('webp' or 'avif')
 * @param quality Optional quality parameter (0-100)
 */
export function generateModernFormatSrcSet(
  srcSet: string,
  format: 'webp' | 'avif',
  quality?: number
): string {
  if (!srcSet) return '';

  // Parse the srcSet string
  const srcSetItems = srcSet.split(',').map(item => item.trim());

  // Convert each item to the modern format
  return srcSetItems
    .map(item => {
      const [url, descriptor] = item.split(' ');

      // Skip if already in the target format
      if (url.endsWith(`.${format}`)) {
        return item;
      }

      // Add format parameter to URL
      const hasParams = url.includes('?');
      const formatParam = `format=${format}`;
      const qualityParam = quality ? `quality=${quality}` : '';

      // Combine parameters
      let params = '';
      if (formatParam && qualityParam) {
        params = `${formatParam}&${qualityParam}`;
      } else {
        params = formatParam || qualityParam;
      }

      // Add parameters to URL
      const newUrl = hasParams
        ? `${url}&${params}`
        : `${url}?${params}`;

      return `${newUrl} ${descriptor}`;
    })
    .join(', ');
}

/**
 * Generate modern format variants (WebP and AVIF) from original images
 * @param images Array of image URLs and widths
 * @param options Options for format generation
 */
export function generateModernFormats(
  images: { url: string; width: number }[],
  options?: {
    webp?: { quality?: number };
    avif?: { quality?: number };
  }
): {
  original: string;
  webp: string;
  avif: string;
} {
  // Generate original srcSet
  const originalSrcSet = generateSrcSet(images);

  // Generate WebP srcSet
  const webpSrcSet = generateModernFormatSrcSet(
    originalSrcSet,
    'webp',
    options?.webp?.quality || 80
  );

  // Generate AVIF srcSet
  const avifSrcSet = generateModernFormatSrcSet(
    originalSrcSet,
    'avif',
    options?.avif?.quality || 70
  );

  return {
    original: originalSrcSet,
    webp: webpSrcSet,
    avif: avifSrcSet
  };
}

/**
 * Generate sizes string based on breakpoints
 */
export function generateSizes(breakpoints: { breakpoint: string; size: string }[]): string {
  // Sort breakpoints from largest to smallest
  const sortedBreakpoints = [...breakpoints].sort((a, b) => {
    const aValue = parseInt(a.breakpoint.replace(/\D/g, ''));
    const bValue = parseInt(b.breakpoint.replace(/\D/g, ''));
    return bValue - aValue;
  });

  // Generate sizes string
  return sortedBreakpoints
    .map(({ breakpoint, size }) => `(min-width: ${breakpoint}) ${size}`)
    .concat(['100vw']) // Default size
    .join(', ');
}

export default ResponsiveImage;
