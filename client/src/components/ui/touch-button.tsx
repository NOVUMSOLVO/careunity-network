/**
 * TouchButton Component
 * 
 * A button component optimized for touch interactions on mobile devices.
 * Features:
 * - Larger touch target (min 44px)
 * - Touch feedback effects
 * - Haptic feedback (when supported)
 * - Accessible for screen readers
 * - Ripple effect on touch
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTouchEnabled } from '@/hooks/use-mobile';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Whether to show ripple effect on touch */
  ripple?: boolean;
  /** Whether to use haptic feedback when supported */
  haptic?: boolean;
  /** Additional class names */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** Icon to display before the button text */
  startIcon?: React.ReactNode;
  /** Icon to display after the button text */
  endIcon?: React.ReactNode;
  /** Whether the button is full width */
  fullWidth?: boolean;
  /** Whether the button is rounded */
  rounded?: boolean;
  /** Whether the button is elevated with shadow */
  elevated?: boolean;
}

export function TouchButton({
  variant = 'default',
  size = 'md',
  ripple = true,
  haptic = true,
  className,
  children,
  startIcon,
  endIcon,
  fullWidth = false,
  rounded = false,
  elevated = false,
  disabled,
  onClick,
  ...props
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);
  const isTouchEnabled = useTouchEnabled();

  // Handle touch/click start
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Add ripple effect if enabled
    if (ripple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      
      // Get touch/click position
      let x, y;
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      // Calculate ripple size
      const size = Math.max(rect.width, rect.height) * 2;
      
      // Add new ripple
      const id = rippleIdRef.current++;
      setRipples(prev => [...prev, { id, x, y, size }]);
      
      // Trigger haptic feedback if supported
      if (haptic && isTouchEnabled && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10); // Short vibration
        } catch (error) {
          // Ignore errors if vibration is not supported
        }
      }
    }
  };

  // Handle touch/click end
  const handleTouchEnd = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, 600); // Match the CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Base styles
  const baseStyles = cn(
    // Common styles
    'relative inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
    
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',
    
    // Size variants
    {
      'text-xs px-2 py-1 min-h-[32px] min-w-[32px]': size === 'sm',
      'text-sm px-4 py-2 min-h-[44px] min-w-[44px]': size === 'md',
      'text-base px-6 py-3 min-h-[56px] min-w-[56px]': size === 'lg',
      'p-2 min-h-[44px] min-w-[44px] aspect-square': size === 'icon',
    },
    
    // Variant styles
    {
      'bg-gray-100 hover:bg-gray-200 text-gray-900': variant === 'default',
      'bg-primary hover:bg-primary-dark text-white': variant === 'primary',
      'bg-secondary hover:bg-secondary-dark text-white': variant === 'secondary',
      'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-900': variant === 'outline',
      'bg-transparent hover:bg-gray-100 text-gray-900': variant === 'ghost',
      'bg-destructive hover:bg-destructive-dark text-white': variant === 'destructive',
    },
    
    // Full width
    fullWidth && 'w-full',
    
    // Rounded
    rounded ? 'rounded-full' : 'rounded-md',
    
    // Elevated
    elevated && 'shadow-md hover:shadow-lg',
    
    // Active/pressed state
    isPressed && 'transform scale-95',
    
    // Custom classes
    className
  );

  return (
    <button
      ref={buttonRef}
      className={baseStyles}
      disabled={disabled}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effect container */}
      {ripple && (
        <span className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
          {ripples.map(({ id, x, y, size }) => (
            <span
              key={id}
              className="absolute bg-white bg-opacity-30 rounded-full animate-ripple pointer-events-none"
              style={{
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
              }}
            />
          ))}
        </span>
      )}
      
      {/* Button content */}
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
}
