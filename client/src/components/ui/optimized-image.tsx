/**
 * Optimized Image Component
 * 
 * A component that optimizes images for better performance:
 * - Lazy loading
 * - Responsive images with srcset
 * - WebP support with fallback
 * - Blur-up loading effect
 * - Proper aspect ratio
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The source URL of the image */
  src: string;
  
  /** Alternative text for the image */
  alt: string;
  
  /** Width of the image in pixels */
  width?: number;
  
  /** Height of the image in pixels */
  height?: number;
  
  /** Aspect ratio of the image (width/height) */
  aspectRatio?: number;
  
  /** Whether to lazy load the image */
  lazyLoad?: boolean;
  
  /** Responsive image sources for different screen sizes */
  srcSet?: string;
  
  /** WebP version of the image source */
  webpSrc?: string;
  
  /** WebP version of the srcSet */
  webpSrcSet?: string;
  
  /** Image sizes attribute for responsive images */
  sizes?: string;
  
  /** Whether to use blur-up loading effect */
  blurUp?: boolean;
  
  /** Low-quality image placeholder for blur-up effect */
  placeholderSrc?: string;
  
  /** Whether to use object-fit: cover */
  cover?: boolean;
  
  /** Whether to use object-fit: contain */
  contain?: boolean;
  
  /** Whether to fill the container */
  fill?: boolean;
  
  /** Whether to round the image */
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  
  /** Whether to add a border to the image */
  border?: boolean;
  
  /** Whether to add a shadow to the image */
  shadow?: boolean | 'sm' | 'md' | 'lg';
  
  /** Custom class name */
  className?: string;
  
  /** Function called when the image is loaded */
  onLoad?: () => void;
  
  /** Function called when the image fails to load */
  onError?: () => void;
}

/**
 * Optimized Image Component
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  lazyLoad = true,
  srcSet,
  webpSrc,
  webpSrcSet,
  sizes,
  blurUp = false,
  placeholderSrc,
  cover = false,
  contain = false,
  fill = false,
  rounded = false,
  border = false,
  shadow = false,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Calculate padding based on aspect ratio
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !imgRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Set the src attribute to load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          // Set the srcset attribute if available
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          // Disconnect the observer once the image is loaded
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px 0px', // Start loading when image is 200px from viewport
    });
    
    observer.observe(imgRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [lazyLoad]);
  
  // Determine rounded class
  const roundedClass = typeof rounded === 'boolean'
    ? rounded ? 'rounded-md' : ''
    : `rounded-${rounded}`;
  
  // Determine shadow class
  const shadowClass = typeof shadow === 'boolean'
    ? shadow ? 'shadow-md' : ''
    : `shadow-${shadow}`;
  
  // Determine object fit class
  const objectFitClass = cover
    ? 'object-cover'
    : contain
      ? 'object-contain'
      : 'object-none';
  
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fill && 'w-full h-full',
        roundedClass,
        border && 'border border-gray-200',
        shadowClass,
        className
      )}
      style={{
        width: fill ? '100%' : width ? `${width}px` : undefined,
        height: fill ? '100%' : height ? `${height}px` : undefined,
        paddingBottom: !height && paddingBottom ? paddingBottom : undefined,
      }}
    >
      {/* Blur-up placeholder */}
      {blurUp && placeholderSrc && !isLoaded && !isError && (
        <img
          src={placeholderSrc}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            objectFitClass,
            isLoaded ? 'opacity-0' : 'opacity-100 blur-sm scale-105'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Main image with WebP support */}
      <picture>
        {/* WebP source */}
        {webpSrc && (
          <source
            type="image/webp"
            srcSet={lazyLoad ? undefined : webpSrcSet || webpSrc}
            data-srcset={lazyLoad ? webpSrcSet || webpSrc : undefined}
            sizes={sizes}
          />
        )}
        
        {/* Original image source */}
        <img
          ref={imgRef}
          src={lazyLoad ? placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' : src}
          data-src={lazyLoad ? src : undefined}
          srcSet={lazyLoad ? undefined : srcSet}
          data-srcset={lazyLoad ? srcSet : undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFitClass,
            fill && 'absolute inset-0',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isError && 'hidden'
          )}
          loading={lazyLoad ? 'lazy' : undefined}
          {...props}
        />
      </picture>
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="sr-only">Image failed to load</span>
        </div>
      )}
    </div>
  );
}
