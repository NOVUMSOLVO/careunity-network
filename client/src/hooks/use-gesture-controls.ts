import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

type GestureType = 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | 'doubleTap' | 'longPress' | 'pinch' | 'spread';

interface GestureHandlers {
  swipeLeft?: () => void;
  swipeRight?: () => void;
  swipeUp?: () => void;
  swipeDown?: () => void;
  doubleTap?: () => void;
  longPress?: () => void;
  pinch?: (scale: number) => void;
  spread?: (scale: number) => void;
}

interface GestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  enableFeedback?: boolean;
  debug?: boolean;
}

/**
 * Hook for handling touch gestures in a React component
 * 
 * @param elementRef - Reference to the element to attach gesture handlers to
 * @param handlers - Object containing handlers for different gestures
 * @param options - Configuration options for gesture detection
 */
export function useGestureControls(
  elementRef: React.RefObject<HTMLElement>,
  handlers: GestureHandlers = {},
  options: GestureOptions = {}
) {
  const [activeGesture, setActiveGesture] = useState<GestureType | null>(null);
  const { toast } = useToast();
  
  // Default options
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    enableFeedback = true,
    debug = false
  } = options;
  
  // Refs to store touch data
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<number | null>(null);
  const initialTouchDistanceRef = useRef<number | null>(null);
  
  // Show feedback toast for gestures
  const showGestureFeedback = (gesture: GestureType) => {
    if (!enableFeedback) return;
    
    toast({
      title: 'Gesture Detected',
      description: `${gesture.charAt(0).toUpperCase() + gesture.slice(1)} gesture recognized`,
      duration: 1500,
    });
  };
  
  // Log debug information
  const logDebug = (...args: any[]) => {
    if (debug) {
      console.log('[Gesture Debug]', ...args);
    }
  };
  
  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Touch start handler
    const handleTouchStart = (e: TouchEvent) => {
      // Store initial touch data
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
      
      // Check for double tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < doubleTapDelay) {
        if (handlers.doubleTap) {
          handlers.doubleTap();
          setActiveGesture('doubleTap');
          showGestureFeedback('doubleTap');
        }
        lastTapRef.current = 0; // Reset to prevent triple tap being detected as double
      } else {
        lastTapRef.current = now;
      }
      
      // Start long press timer
      if (handlers.longPress) {
        longPressTimerRef.current = window.setTimeout(() => {
          handlers.longPress?.();
          setActiveGesture('longPress');
          showGestureFeedback('longPress');
          longPressTimerRef.current = null;
        }, longPressDelay);
      }
      
      // Handle multi-touch gestures (pinch/spread)
      if (e.touches.length === 2) {
        initialTouchDistanceRef.current = getTouchDistance(e.touches);
        logDebug('Initial touch distance:', initialTouchDistanceRef.current);
      }
    };
    
    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      // Clear long press timer if touch moves
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      // Handle pinch/spread gestures
      if (e.touches.length === 2 && initialTouchDistanceRef.current) {
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / initialTouchDistanceRef.current;
        
        if (scale < 0.8 && handlers.pinch) {
          handlers.pinch(scale);
          setActiveGesture('pinch');
          showGestureFeedback('pinch');
          logDebug('Pinch gesture', scale);
        } else if (scale > 1.2 && handlers.spread) {
          handlers.spread(scale);
          setActiveGesture('spread');
          showGestureFeedback('spread');
          logDebug('Spread gesture', scale);
        }
      }
    };
    
    // Touch end handler
    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      // Process swipe gestures
      if (touchStartRef.current) {
        const touchEnd = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
          time: Date.now()
        };
        
        const deltaX = touchEnd.x - touchStartRef.current.x;
        const deltaY = touchEnd.y - touchStartRef.current.y;
        const deltaTime = touchEnd.time - touchStartRef.current.time;
        
        // Only process quick movements as swipes (less than 300ms)
        if (deltaTime < 300) {
          // Horizontal swipe
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0 && handlers.swipeRight) {
              handlers.swipeRight();
              setActiveGesture('swipeRight');
              showGestureFeedback('swipeRight');
              logDebug('Swipe right', deltaX);
            } else if (deltaX < 0 && handlers.swipeLeft) {
              handlers.swipeLeft();
              setActiveGesture('swipeLeft');
              showGestureFeedback('swipeLeft');
              logDebug('Swipe left', deltaX);
            }
          }
          // Vertical swipe
          else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
            if (deltaY > 0 && handlers.swipeDown) {
              handlers.swipeDown();
              setActiveGesture('swipeDown');
              showGestureFeedback('swipeDown');
              logDebug('Swipe down', deltaY);
            } else if (deltaY < 0 && handlers.swipeUp) {
              handlers.swipeUp();
              setActiveGesture('swipeUp');
              showGestureFeedback('swipeUp');
              logDebug('Swipe up', deltaY);
            }
          }
        }
      }
      
      // Reset touch data
      touchStartRef.current = null;
      initialTouchDistanceRef.current = null;
      
      // Reset active gesture after a delay
      setTimeout(() => {
        setActiveGesture(null);
      }, 500);
    };
    
    // Attach event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    // Clean up event listeners
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    handlers, 
    swipeThreshold, 
    longPressDelay, 
    doubleTapDelay, 
    enableFeedback,
    debug,
    toast
  ]);
  
  return {
    activeGesture,
  };
}
