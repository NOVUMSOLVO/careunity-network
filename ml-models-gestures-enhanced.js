/**
 * ML Models Gesture Controls - Enhanced Version
 * 
 * This module provides gesture controls for ML models with progressive enhancement:
 * - Detects device capabilities and adapts accordingly
 * - Provides fallbacks for unsupported features
 * - Includes detailed error reporting
 */

(function() {
  // Feature detection
  const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const supportsPointer = 'PointerEvent' in window;
  const supportsPassiveEvents = (function() {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() { supportsPassive = true; return true; }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {}
    return supportsPassive;
  })();
  
  // Error reporting
  const errors = [];
  function reportError(message, error) {
    console.error(`[Gesture Controls] ${message}`, error);
    errors.push({
      message,
      error,
      timestamp: new Date().toISOString()
    });
    
    // Dispatch error event
    const errorEvent = new CustomEvent('mlModelsGestureError', {
      detail: { message, error, timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(errorEvent);
  }
  
  // Determine optimal gesture implementation based on device capabilities
  function determineImplementation() {
    if (supportsTouch) {
      return supportsPointer ? 'pointer' : 'touch';
    }
    return 'mouse';
  }
  
  const implementation = determineImplementation();
  console.log(`[Gesture Controls] Using ${implementation} implementation`);
  
  // Base gesture controls class
  class BaseGestureControls {
    constructor() {
      this.enabled = true;
      this.elements = {};
      this.gestures = {};
      this.errors = errors;
      this.capabilities = {
        touch: supportsTouch,
        pointer: supportsPointer,
        passiveEvents: supportsPassiveEvents
      };
      
      // Create feedback element
      this.createFeedbackElement();
    }
    
    // Create gesture feedback element
    createFeedbackElement() {
      try {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'gesture-feedback';
        feedbackElement.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 15px 25px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 500;
          z-index: 1000;
          display: none;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transition: opacity 0.3s;
          opacity: 0;
        `;
        
        document.body.appendChild(feedbackElement);
        this.feedbackElement = feedbackElement;
      } catch (error) {
        reportError('Failed to create feedback element', error);
      }
    }
    
    // Show gesture feedback
    showGestureFeedback(text, duration = 1500) {
      try {
        if (!this.feedbackElement) return;
        
        this.feedbackElement.textContent = text;
        this.feedbackElement.style.display = 'flex';
        
        // Fade in
        setTimeout(() => {
          this.feedbackElement.style.opacity = '1';
        }, 10);
        
        // Fade out after duration
        setTimeout(() => {
          this.feedbackElement.style.opacity = '0';
          
          // Hide after fade out
          setTimeout(() => {
            this.feedbackElement.style.display = 'none';
          }, 300);
        }, duration);
      } catch (error) {
        reportError('Failed to show gesture feedback', error);
      }
    }
    
    // Register an element for gesture control
    registerElement(elementId, gestureHandlers) {
      try {
        const element = document.getElementById(elementId);
        if (!element) {
          reportError(`Element with ID "${elementId}" not found`);
          return false;
        }
        
        this.elements[elementId] = {
          element,
          gestureHandlers,
          state: {
            scale: 1,
            rotation: 0,
            translateX: 0,
            translateY: 0
          }
        };
        
        return true;
      } catch (error) {
        reportError(`Failed to register element ${elementId}`, error);
        return false;
      }
    }
    
    // Register a global gesture handler
    registerGesture(gestureType, handler) {
      try {
        this.gestures[gestureType] = handler;
        return true;
      } catch (error) {
        reportError(`Failed to register gesture ${gestureType}`, error);
        return false;
      }
    }
    
    // Trigger global gesture handler
    triggerGlobalGesture(gestureType, gestureData) {
      try {
        if (this.gestures[gestureType]) {
          this.gestures[gestureType](gestureData);
          return true;
        }
        
        // Dispatch a custom event
        const event = new CustomEvent('mlModelGesture', {
          detail: {
            gestureType,
            gestureData
          }
        });
        document.dispatchEvent(event);
        
        return false;
      } catch (error) {
        reportError(`Failed to trigger global gesture ${gestureType}`, error);
        return false;
      }
    }
    
    // Enable gesture controls
    enable() {
      this.enabled = true;
    }
    
    // Disable gesture controls
    disable() {
      this.enabled = false;
    }
    
    // Get error log
    getErrorLog() {
      return this.errors;
    }
  }
  
  // Touch-based implementation
  class TouchGestureControls extends BaseGestureControls {
    constructor() {
      super();
      this.touchState = {
        active: false,
        startTime: 0,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        distance: 0,
        scale: 1,
        rotation: 0,
        longPressTimer: null,
        touchCount: 0,
        touches: []
      };
      
      // Initialize touch event listeners
      this.initTouchEvents();
    }
    
    // Initialize touch event listeners
    initTouchEvents() {
      try {
        // Use passive: false for events that might prevent default
        const options = supportsPassiveEvents ? { passive: false } : false;
        
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), options);
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), options);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), options);
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), options);
        
        console.log('[Gesture Controls] Touch events initialized');
      } catch (error) {
        reportError('Failed to initialize touch events', error);
      }
    }
    
    // Handle touch start event
    handleTouchStart(event) {
      // Basic implementation - can be expanded as needed
      if (!this.enabled) return;
      
      // Store touch information
      this.touchState.active = true;
      this.touchState.startTime = Date.now();
      
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
      }
    }
    
    // Handle touch move event
    handleTouchMove(event) {
      // Basic implementation - can be expanded as needed
      if (!this.enabled || !this.touchState.active) return;
      
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;
      }
    }
    
    // Handle touch end event
    handleTouchEnd(event) {
      // Basic implementation - can be expanded as needed
      if (!this.enabled) return;
      
      // Calculate touch duration
      const touchDuration = Date.now() - this.touchState.startTime;
      
      // Reset touch state
      this.touchState.active = false;
    }
    
    // Handle touch cancel event
    handleTouchCancel(event) {
      // Reset touch state
      this.touchState.active = false;
    }
  }
  
  // Mouse-based implementation (fallback)
  class MouseGestureControls extends BaseGestureControls {
    constructor() {
      super();
      this.mouseState = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
      };
      
      // Initialize mouse event listeners
      this.initMouseEvents();
    }
    
    // Initialize mouse event listeners
    initMouseEvents() {
      try {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        console.log('[Gesture Controls] Mouse events initialized');
      } catch (error) {
        reportError('Failed to initialize mouse events', error);
      }
    }
    
    // Handle mouse down event
    handleMouseDown(event) {
      // Basic implementation
      if (!this.enabled) return;
      
      this.mouseState.active = true;
      this.mouseState.startX = event.clientX;
      this.mouseState.startY = event.clientY;
    }
    
    // Handle mouse move event
    handleMouseMove(event) {
      // Basic implementation
      if (!this.enabled || !this.mouseState.active) return;
      
      this.mouseState.currentX = event.clientX;
      this.mouseState.currentY = event.clientY;
    }
    
    // Handle mouse up event
    handleMouseUp(event) {
      // Basic implementation
      if (!this.enabled) return;
      
      this.mouseState.active = false;
    }
  }
  
  // Create the appropriate implementation based on device capabilities
  let gestureControls;
  
  try {
    if (implementation === 'touch' || implementation === 'pointer') {
      gestureControls = new TouchGestureControls();
    } else {
      gestureControls = new MouseGestureControls();
    }
    
    // Expose the gesture controls globally
    window.mlModelsGestures = gestureControls;
    console.log('[Gesture Controls] Successfully initialized');
  } catch (error) {
    reportError('Failed to initialize gesture controls', error);
    
    // Create a minimal fallback
    window.mlModelsGestures = new BaseGestureControls();
    console.warn('[Gesture Controls] Using minimal fallback implementation');
  }
})();
