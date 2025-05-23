import React, { useState, useRef, useEffect } from 'react';
import { useDevice } from '../../hooks/use-mobile';

// Swipe direction type
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

// Swipe event handler type
export type SwipeHandler = (direction: SwipeDirection, distance: number) => void;

// Touch interaction props
interface TouchInteractionProps {
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Handler for swipe gestures
   */
  onSwipe?: SwipeHandler;
  
  /**
   * Handler for tap gestures
   */
  onTap?: (event: React.TouchEvent | React.MouseEvent) => void;
  
  /**
   * Handler for long press gestures
   */
  onLongPress?: (event: React.TouchEvent | React.MouseEvent) => void;
  
  /**
   * Handler for pinch gestures
   */
  onPinch?: (scale: number) => void;
  
  /**
   * Minimum distance (in pixels) to trigger a swipe
   * @default 50
   */
  swipeThreshold?: number;
  
  /**
   * Duration (in milliseconds) to trigger a long press
   * @default 500
   */
  longPressDuration?: number;
  
  /**
   * Whether to disable all touch interactions
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether to stop propagation of touch events
   * @default true
   */
  stopPropagation?: boolean;
  
  /**
   * Whether to prevent default behavior of touch events
   * @default true on mobile, false on desktop
   */
  preventDefault?: boolean;
}

/**
 * Touch Interaction Component
 * 
 * This component adds touch interactions (swipe, tap, long press, pinch)
 * to its children, with optimizations for mobile devices.
 */
export function TouchInteraction({
  children,
  onSwipe,
  onTap,
  onLongPress,
  onPinch,
  swipeThreshold = 50,
  longPressDuration = 500,
  disabled = false,
  className = "",
  stopPropagation = true,
  preventDefault,
}: TouchInteractionProps) {
  // Device info
  const { isMobile, touchEnabled } = useDevice();
  
  // Default preventDefault based on device type
  const shouldPreventDefault = preventDefault !== undefined ? preventDefault : isMobile;
  
  // Touch state
  const [touching, setTouching] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const multiTouchRef = useRef<{ distance: number } | null>(null);
  
  // Clean up long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);
  
  // Handle touch start
  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (shouldPreventDefault) {
      event.preventDefault();
    }
    
    setTouching(true);
    
    // Single touch
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      
      // Set up long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress(event);
          // Clear touch state to prevent other gestures
          touchStartRef.current = null;
        }, longPressDuration);
      }
    }
    // Multi-touch (pinch)
    else if (event.touches.length === 2 && onPinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = getDistance(
        touch1.clientX,
        touch1.clientY,
        touch2.clientX,
        touch2.clientY
      );
      
      multiTouchRef.current = { distance };
    }
  };
  
  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Single touch (swipe)
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchMoveRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
    // Multi-touch (pinch)
    else if (event.touches.length === 2 && onPinch && multiTouchRef.current) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = getDistance(
        touch1.clientX,
        touch1.clientY,
        touch2.clientX,
        touch2.clientY
      );
      
      const scale = distance / multiTouchRef.current.distance;
      onPinch(scale);
      
      multiTouchRef.current = { distance };
    }
  };
  
  // Handle touch end
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (disabled) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    setTouching(false);
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Process gestures
    if (touchStartRef.current && touchMoveRef.current) {
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const endX = touchMoveRef.current.x;
      const endY = touchMoveRef.current.y;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Swipe gesture
      if (distance >= swipeThreshold && onSwipe) {
        // Determine swipe direction
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        let direction: SwipeDirection;
        
        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        onSwipe(direction, distance);
      }
      // Tap gesture (small movement)
      else if (distance < 10 && onTap) {
        const now = Date.now();
        const touchDuration = now - touchStartRef.current.time;
        
        // Only trigger tap for short touches (not long press)
        if (touchDuration < longPressDuration) {
          onTap(event);
        }
      }
    }
    // Tap with no movement
    else if (touchStartRef.current && !touchMoveRef.current && onTap) {
      const now = Date.now();
      const touchDuration = now - touchStartRef.current.time;
      
      // Only trigger tap for short touches (not long press)
      if (touchDuration < longPressDuration) {
        onTap(event);
      }
    }
    
    // Reset touch state
    touchStartRef.current = null;
    touchMoveRef.current = null;
    multiTouchRef.current = null;
  };
  
  // Handle mouse events for non-touch devices
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled || touchEnabled) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    setTouching(true);
    touchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
    
    // Set up long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress(event);
        // Clear touch state to prevent other gestures
        touchStartRef.current = null;
      }, longPressDuration);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (disabled || !touchStartRef.current || touchEnabled) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    touchMoveRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };
  
  const handleMouseUp = (event: React.MouseEvent) => {
    if (disabled || touchEnabled) return;
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    setTouching(false);
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Process click as tap
    if (touchStartRef.current && onTap) {
      const now = Date.now();
      const touchDuration = now - touchStartRef.current.time;
      
      // Only trigger tap for short touches (not long press)
      if (touchDuration < longPressDuration) {
        onTap(event);
      }
    }
    
    // Reset touch state
    touchStartRef.current = null;
    touchMoveRef.current = null;
  };
  
  return (
    <div
      className={`touch-interaction ${touching ? 'touching' : ''} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </div>
  );
}

// Helper function to calculate distance between two points
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
