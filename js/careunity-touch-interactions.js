// CareUnity Mobile - Touch Interactions

// Configuration for touch interactions
const TOUCH_CONFIG = {
  // Minimum distance to recognize as a swipe (in pixels)
  swipeThreshold: 50,
  
  // Maximum time for a swipe to be recognized (in milliseconds)
  swipeTimeout: 300,
  
  // Minimum time to recognize a long press (in milliseconds)
  longPressThreshold: 500,
  
  // Prevent default touch behavior (e.g., scrolling)
  preventDefault: false,
  
  // Threshold for tap recognition (in pixels)
  tapThreshold: 10
};

/**
 * TouchInteractions class to handle mobile gestures
 */
class TouchInteractions {
  /**
   * Constructor
   * @param {HTMLElement} element - Element to attach touch events to
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...TOUCH_CONFIG, ...options };
    
    // Internal state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.longPressTimer = null;
    this.isSwiping = false;
    this.isLongPressing = false;
    
    // Event handlers
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    
    // Event callbacks
    this.callbacks = {
      tap: null,
      doubleTap: null,
      longPress: null,
      swipeLeft: null,
      swipeRight: null,
      swipeUp: null,
      swipeDown: null
    };
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize touch events
   */
  init() {
    // Add event listeners
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: !this.options.preventDefault });
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: !this.options.preventDefault });
    this.element.addEventListener('touchend', this.onTouchEnd, { passive: !this.options.preventDefault });
    this.element.addEventListener('touchcancel', this.onTouchEnd, { passive: !this.options.preventDefault });
    
    // Handle double tap detection
    this.lastTapTime = 0;
  }
  
  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch start event
   */
  onTouchStart(event) {
    const touch = event.touches[0];
    
    // Store start position and time
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    
    // Reset end position
    this.touchEndX = 0;
    this.touchEndY = 0;
    
    // Reset flags
    this.isSwiping = false;
    this.isLongPressing = false;
    
    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      this.isLongPressing = true;
      this.handleLongPress();
    }, this.options.longPressThreshold);
    
    // Prevent default if needed
    if (this.options.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch move event
   */
  onTouchMove(event) {
    // Clear long press timer if moved too far
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);
    
    if (deltaX > this.options.tapThreshold || deltaY > this.options.tapThreshold) {
      clearTimeout(this.longPressTimer);
      this.isLongPressing = false;
      this.isSwiping = true;
    }
    
    // Update current position
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
    
    // Prevent default if needed
    if (this.options.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch end event
   */
  onTouchEnd(event) {
    // Clear long press timer
    clearTimeout(this.longPressTimer);
    
    // Get touch duration
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Set end position if not set (in case touchmove wasn't triggered)
    if (this.touchEndX === 0 && this.touchEndY === 0 && event.changedTouches && event.changedTouches[0]) {
      this.touchEndX = event.changedTouches[0].clientX;
      this.touchEndY = event.changedTouches[0].clientY;
    }
    
    // Calculate delta
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Handle swipe if duration is within threshold
    if (touchDuration < this.options.swipeTimeout && this.isSwiping) {
      // Determine swipe direction
      if (absX > absY && absX > this.options.swipeThreshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      } else if (absY > this.options.swipeThreshold) {
        // Vertical swipe
        if (deltaY > 0) {
          this.handleSwipeDown();
        } else {
          this.handleSwipeUp();
        }
      }
    } 
    // Handle tap if not swiping and not long pressing
    else if (!this.isSwiping && !this.isLongPressing && 
             absX < this.options.tapThreshold && 
             absY < this.options.tapThreshold) {
      // Check for double tap
      const now = Date.now();
      const timeSinceLastTap = now - this.lastTapTime;
      
      if (timeSinceLastTap < 300) {
        this.handleDoubleTap();
        this.lastTapTime = 0; // Reset to prevent triple tap being detected as double
      } else {
        this.handleTap();
        this.lastTapTime = now;
      }
    }
    
    // Prevent default if needed
    if (this.options.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Register event handlers
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {TouchInteractions} - Returns this for chaining
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    } else {
      console.warn(`Unsupported event: ${event}`);
    }
    
    return this;
  }
  
  /**
   * Handle tap event
   */
  handleTap() {
    if (typeof this.callbacks.tap === 'function') {
      this.callbacks.tap({
        type: 'tap',
        target: this.element,
        x: this.touchStartX,
        y: this.touchStartY
      });
    }
  }
  
  /**
   * Handle double tap event
   */
  handleDoubleTap() {
    if (typeof this.callbacks.doubleTap === 'function') {
      this.callbacks.doubleTap({
        type: 'doubleTap',
        target: this.element,
        x: this.touchStartX,
        y: this.touchStartY
      });
    }
  }
  
  /**
   * Handle long press event
   */
  handleLongPress() {
    if (typeof this.callbacks.longPress === 'function') {
      this.callbacks.longPress({
        type: 'longPress',
        target: this.element,
        x: this.touchStartX,
        y: this.touchStartY
      });
    }
  }
  
  /**
   * Handle swipe left event
   */
  handleSwipeLeft() {
    if (typeof this.callbacks.swipeLeft === 'function') {
      this.callbacks.swipeLeft({
        type: 'swipeLeft',
        target: this.element,
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchEndX,
        endY: this.touchEndY,
        deltaX: this.touchEndX - this.touchStartX,
        deltaY: this.touchEndY - this.touchStartY
      });
    }
  }
  
  /**
   * Handle swipe right event
   */
  handleSwipeRight() {
    if (typeof this.callbacks.swipeRight === 'function') {
      this.callbacks.swipeRight({
        type: 'swipeRight',
        target: this.element,
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchEndX,
        endY: this.touchEndY,
        deltaX: this.touchEndX - this.touchStartX,
        deltaY: this.touchEndY - this.touchStartY
      });
    }
  }
  
  /**
   * Handle swipe up event
   */
  handleSwipeUp() {
    if (typeof this.callbacks.swipeUp === 'function') {
      this.callbacks.swipeUp({
        type: 'swipeUp',
        target: this.element,
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchEndX,
        endY: this.touchEndY,
        deltaX: this.touchEndX - this.touchStartX,
        deltaY: this.touchEndY - this.touchStartY
      });
    }
  }
  
  /**
   * Handle swipe down event
   */
  handleSwipeDown() {
    if (typeof this.callbacks.swipeDown === 'function') {
      this.callbacks.swipeDown({
        type: 'swipeDown',
        target: this.element,
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchEndX,
        endY: this.touchEndY,
        deltaX: this.touchEndX - this.touchStartX,
        deltaY: this.touchEndY - this.touchStartY
      });
    }
  }
  
  /**
   * Destroy the instance and clean up
   */
  destroy() {
    // Remove event listeners
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    this.element.removeEventListener('touchcancel', this.onTouchEnd);
    
    // Clear timer
    clearTimeout(this.longPressTimer);
    
    // Reset callbacks
    Object.keys(this.callbacks).forEach(key => {
      this.callbacks[key] = null;
    });
  }
}

// Export for module systems
if (typeof window !== 'undefined') {
  window.TouchInteractions = TouchInteractions;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TouchInteractions;
}
