/**
 * TouchTarget Component
 * 
 * A component that ensures interactive elements have appropriate touch target sizes
 * following WCAG 2.5.5 (Target Size) guidelines.
 * 
 * The minimum recommended touch target size is 44x44 pixels.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-mobile';

export interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The content to be wrapped with the touch target
   */
  children: React.ReactNode;
  
  /**
   * The minimum size of the touch target in pixels (default: 44)
   */
  size?: number;
  
  /**
   * Whether to apply the minimum size only on touch devices
   */
  onlyForTouch?: boolean;
  
  /**
   * Whether to make the touch target inline or block
   */
  inline?: boolean;
  
  /**
   * Whether to center the content within the touch target
   */
  centered?: boolean;
  
  /**
   * Whether to apply the minimum size only on mobile devices
   */
  onlyForMobile?: boolean;
  
  /**
   * Custom class name for the touch target
   */
  className?: string;
}

/**
 * TouchTarget Component
 * 
 * Wraps interactive elements to ensure they have appropriate touch target sizes.
 */
export const TouchTarget = forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ 
    children, 
    size = 44, 
    onlyForTouch = true, 
    inline = false, 
    centered = true,
    onlyForMobile = false,
    className,
    ...props 
  }, ref) => {
    const { touchEnabled, isMobile } = useDevice();
    
    // Determine if we should apply the minimum size
    const shouldApplyMinSize = 
      (onlyForTouch ? touchEnabled : true) && 
      (onlyForMobile ? isMobile : true);
    
    return (
      <div
        ref={ref}
        className={cn(
          inline ? 'inline-flex' : 'flex',
          centered && 'items-center justify-center',
          className
        )}
        style={{
          minWidth: shouldApplyMinSize ? `${size}px` : undefined,
          minHeight: shouldApplyMinSize ? `${size}px` : undefined,
          touchAction: 'manipulation', // Prevents double-tap to zoom
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';

/**
 * TouchTargetButton Component
 * 
 * A button with appropriate touch target size.
 */
export interface TouchTargetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  onlyForTouch?: boolean;
  onlyForMobile?: boolean;
  centered?: boolean;
  className?: string;
  innerClassName?: string;
}

export const TouchTargetButton = forwardRef<HTMLButtonElement, TouchTargetButtonProps>(
  ({ 
    children, 
    size = 44, 
    onlyForTouch = true, 
    onlyForMobile = false,
    centered = true,
    className,
    innerClassName,
    ...props 
  }, ref) => {
    const { touchEnabled, isMobile } = useDevice();
    
    // Determine if we should apply the minimum size
    const shouldApplyMinSize = 
      (onlyForTouch ? touchEnabled : true) && 
      (onlyForMobile ? isMobile : true);
    
    return (
      <button
        ref={ref}
        className={cn(
          'relative',
          centered && 'flex items-center justify-center',
          className
        )}
        style={{
          minWidth: shouldApplyMinSize ? `${size}px` : undefined,
          minHeight: shouldApplyMinSize ? `${size}px` : undefined,
          touchAction: 'manipulation', // Prevents double-tap to zoom
        }}
        {...props}
      >
        <span className={innerClassName}>{children}</span>
      </button>
    );
  }
);

TouchTargetButton.displayName = 'TouchTargetButton';

/**
 * TouchTargetLink Component
 * 
 * A link with appropriate touch target size.
 */
export interface TouchTargetLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: number;
  onlyForTouch?: boolean;
  onlyForMobile?: boolean;
  centered?: boolean;
  className?: string;
  innerClassName?: string;
}

export const TouchTargetLink = forwardRef<HTMLAnchorElement, TouchTargetLinkProps>(
  ({ 
    children, 
    size = 44, 
    onlyForTouch = true, 
    onlyForMobile = false,
    centered = true,
    className,
    innerClassName,
    ...props 
  }, ref) => {
    const { touchEnabled, isMobile } = useDevice();
    
    // Determine if we should apply the minimum size
    const shouldApplyMinSize = 
      (onlyForTouch ? touchEnabled : true) && 
      (onlyForMobile ? isMobile : true);
    
    return (
      <a
        ref={ref}
        className={cn(
          'relative',
          centered && 'flex items-center justify-center',
          className
        )}
        style={{
          minWidth: shouldApplyMinSize ? `${size}px` : undefined,
          minHeight: shouldApplyMinSize ? `${size}px` : undefined,
          touchAction: 'manipulation', // Prevents double-tap to zoom
        }}
        {...props}
      >
        <span className={innerClassName}>{children}</span>
      </a>
    );
  }
);

TouchTargetLink.displayName = 'TouchTargetLink';
