/**
 * Swipeable Component
 * 
 * A component that supports swipe gestures for mobile interactions.
 * Features:
 * - Horizontal swipe detection
 * - Swipe to dismiss/delete
 * - Swipe to reveal actions
 * - Configurable thresholds and animations
 * - Accessibility support
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTouchEnabled } from '@/hooks/use-mobile';

export interface SwipeableProps {
  /** The content to be rendered inside the swipeable container */
  children: React.ReactNode;
  /** Actions to reveal when swiping left (usually delete/remove) */
  leftActions?: React.ReactNode;
  /** Actions to reveal when swiping right (usually secondary actions) */
  rightActions?: React.ReactNode;
  /** Callback when swiped left beyond threshold */
  onSwipeLeft?: () => void;
  /** Callback when swiped right beyond threshold */
  onSwipeRight?: () => void;
  /** Threshold to trigger swipe action as percentage (0-1) */
  threshold?: number;
  /** Whether to allow dismissing the item by swiping */
  dismissible?: boolean;
  /** Whether to disable swiping */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Class names for the left actions container */
  leftActionsClassName?: string;
  /** Class names for the right actions container */
  rightActionsClassName?: string;
}

export function Swipeable({
  children,
  leftActions,
  rightActions,
  onSwipeLeft,
  onSwipeRight,
  threshold = 0.4,
  dismissible = false,
  disabled = false,
  className,
  leftActionsClassName,
  rightActionsClassName,
}: SwipeableProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isTouchEnabled = useTouchEnabled();

  // Reset state when disabled changes
  useEffect(() => {
    if (disabled) {
      setOffset(0);
      setIsSwiping(false);
    }
  }, [disabled]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isDismissed) return;
    
    setIsSwiping(true);
    
    // Get starting position
    if ('touches' in e) {
      startXRef.current = e.touches[0].clientX;
      currentXRef.current = e.touches[0].clientX;
    } else {
      startXRef.current = e.clientX;
      currentXRef.current = e.clientX;
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!isSwiping || disabled || isDismissed) return;
    
    // Get current position
    if ('touches' in e) {
      currentXRef.current = e.touches[0].clientX;
    } else if ('clientX' in e) {
      currentXRef.current = e.clientX;
    }
    
    // Calculate offset
    const newOffset = currentXRef.current - startXRef.current;
    
    // Apply constraints if no actions on that side
    if ((newOffset > 0 && !rightActions) || (newOffset < 0 && !leftActions)) {
      setOffset(newOffset * 0.2); // Reduced movement when no actions
    } else {
      setOffset(newOffset);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isSwiping || disabled || isDismissed) return;
    
    setIsSwiping(false);
    
    // Get container width for threshold calculation
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const thresholdDistance = containerWidth * threshold;
    
    // Check if swipe exceeds threshold
    if (offset > thresholdDistance && rightActions) {
      // Swiped right beyond threshold
      if (dismissible) {
        setOffset(containerWidth);
        setIsDismissed(true);
      } else {
        setOffset(rightActions ? 80 : 0); // Show right actions or reset
      }
      if (onSwipeRight) onSwipeRight();
    } else if (offset < -thresholdDistance && leftActions) {
      // Swiped left beyond threshold
      if (dismissible) {
        setOffset(-containerWidth);
        setIsDismissed(true);
      } else {
        setOffset(leftActions ? -80 : 0); // Show left actions or reset
      }
      if (onSwipeLeft) onSwipeLeft();
    } else {
      // Reset position if threshold not met
      setOffset(0);
    }
  };

  // Reset the component
  const reset = () => {
    setOffset(0);
    setIsDismissed(false);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden touch-pan-y",
        isDismissed && "animate-fade-out",
        className
      )}
      ref={containerRef}
    >
      {/* Left actions container */}
      {leftActions && (
        <div 
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end",
            leftActionsClassName
          )}
          style={{ 
            right: `${Math.abs(Math.min(offset, 0))}px`,
            opacity: Math.min(Math.abs(offset) / 80, 1)
          }}
        >
          {leftActions}
        </div>
      )}
      
      {/* Right actions container */}
      {rightActions && (
        <div 
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start",
            rightActionsClassName
          )}
          style={{ 
            left: `${Math.max(offset, 0)}px`,
            opacity: Math.min(Math.abs(offset) / 80, 1)
          }}
        >
          {rightActions}
        </div>
      )}
      
      {/* Main content container */}
      <div
        className={cn(
          "relative transition-transform",
          isSwiping && "transition-none",
          !isTouchEnabled && "hover:cursor-grab active:cursor-grabbing"
        )}
        style={{ 
          transform: `translateX(${offset}px)`,
          touchAction: "pan-y"
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={isTouchEnabled ? undefined : handleTouchStart}
        onMouseMove={isTouchEnabled ? undefined : handleTouchMove}
        onMouseUp={isTouchEnabled ? undefined : handleTouchEnd}
        onMouseLeave={isTouchEnabled ? undefined : handleTouchEnd}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {children}
      </div>
    </div>
  );
}
