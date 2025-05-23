/**
 * ML Models Gesture Controls
 *
 * This module provides advanced gesture controls for interacting with ML models
 * on mobile devices, including pinch-to-zoom, long-press, and multi-touch gestures.
 */

class MLModelsGestureControls {
  constructor() {
    this.enabled = true;
    this.elements = {};
    this.gestures = {};
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

    // Gesture configuration
    this.config = {
      longPressDelay: 700, // ms
      doubleTapDelay: 300, // ms
      swipeThreshold: 50, // px
      pinchThreshold: 0.1, // scale difference
      rotateThreshold: 15, // degrees
      preventDefaultEvents: true
    };

    // Initialize
    this.init();
  }

  // Initialize gesture controls
  init() {
    // Add global event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // Add gesture feedback element
    this.createGestureFeedbackElement();

    console.log('ML Models Gesture Controls initialized');
  }

  // Create gesture feedback element
  createGestureFeedbackElement() {
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
    this.gestureFeedbackElement = feedbackElement;
  }

  // Show gesture feedback
  showGestureFeedback(text, duration = 1500) {
    if (!this.gestureFeedbackElement) return;

    this.gestureFeedbackElement.textContent = text;
    this.gestureFeedbackElement.style.display = 'flex';

    // Fade in
    setTimeout(() => {
      this.gestureFeedbackElement.style.opacity = '1';
    }, 10);

    // Fade out after duration
    setTimeout(() => {
      this.gestureFeedbackElement.style.opacity = '0';

      // Hide after fade out
      setTimeout(() => {
        this.gestureFeedbackElement.style.display = 'none';
      }, 300);
    }, duration);
  }

  // Register an element for gesture control
  registerElement(elementId, gestureHandlers) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
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
  }

  // Register a global gesture handler
  registerGesture(gestureType, handler) {
    this.gestures[gestureType] = handler;
    return true;
  }

  // Handle touch start event
  handleTouchStart(event) {
    if (!this.enabled) return;

    // Store touch information
    this.touchState.active = true;
    this.touchState.startTime = Date.now();
    this.touchState.touchCount = event.touches.length;
    this.touchState.touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    }));

    // For single touch
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchState.startX = touch.clientX;
      this.touchState.startY = touch.clientY;
      this.touchState.currentX = touch.clientX;
      this.touchState.currentY = touch.clientY;

      // Start long press timer
      this.touchState.longPressTimer = setTimeout(() => {
        if (this.touchState.active && this.touchState.touchCount === 1) {
          const elementInfo = this.getElementAtPoint(this.touchState.currentX, this.touchState.currentY);
          if (elementInfo) {
            this.triggerGestureHandler(elementInfo, 'longPress', {
              x: this.touchState.currentX,
              y: this.touchState.currentY
            });
          } else {
            this.triggerGlobalGesture('longPress', {
              x: this.touchState.currentX,
              y: this.touchState.currentY
            });
          }

          this.showGestureFeedback('Long Press');
        }
      }, this.config.longPressDelay);
    }
    // For multi-touch
    else if (event.touches.length === 2) {
      // Calculate initial distance for pinch
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.touchState.distance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );

      // Calculate initial angle for rotation
      this.touchState.rotation = this.getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
    }

    // Find the element at the touch point
    const elementInfo = this.getElementAtPoint(this.touchState.startX, this.touchState.startY);
    if (elementInfo) {
      this.triggerGestureHandler(elementInfo, 'touchStart', {
        touches: this.touchState.touches,
        touchCount: this.touchState.touchCount
      });
    }

    // Prevent default if configured
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
  }

  // Handle touch move event
  handleTouchMove(event) {
    if (!this.enabled || !this.touchState.active) return;

    // Update touch information
    this.touchState.touchCount = event.touches.length;

    // Update touches array
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const existingTouchIndex = this.touchState.touches.findIndex(t => t.id === touch.identifier);

      if (existingTouchIndex >= 0) {
        this.touchState.touches[existingTouchIndex].currentX = touch.clientX;
        this.touchState.touches[existingTouchIndex].currentY = touch.clientY;
      }
    }

    // For single touch
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchState.currentX = touch.clientX;
      this.touchState.currentY = touch.clientY;

      // Check if moved enough to cancel long press
      const moveDistance = this.getDistance(
        this.touchState.startX, this.touchState.startY,
        this.touchState.currentX, this.touchState.currentY
      );

      if (moveDistance > 10 && this.touchState.longPressTimer) {
        clearTimeout(this.touchState.longPressTimer);
        this.touchState.longPressTimer = null;
      }
    }
    // For multi-touch
    else if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];

      // Calculate current distance for pinch
      const currentDistance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );

      // Calculate scale change
      const prevScale = this.touchState.scale || 1;
      this.touchState.scale = currentDistance / this.touchState.distance;

      // Calculate current angle for rotation
      const currentRotation = this.getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );

      // Calculate rotation change
      const rotationDelta = currentRotation - this.touchState.rotation;
      this.touchState.rotation = currentRotation;

      // Find the element at the center point
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const elementInfo = this.getElementAtPoint(centerX, centerY);

      // Handle pinch gesture
      if (Math.abs(this.touchState.scale - prevScale) > this.config.pinchThreshold) {
        if (elementInfo) {
          this.triggerGestureHandler(elementInfo, 'pinch', {
            scale: this.touchState.scale,
            center: { x: centerX, y: centerY }
          });
        } else {
          this.triggerGlobalGesture('pinch', {
            scale: this.touchState.scale,
            center: { x: centerX, y: centerY }
          });
        }

        // Show feedback for significant pinch
        if (Math.abs(this.touchState.scale - prevScale) > 0.05) {
          this.showGestureFeedback(this.touchState.scale > prevScale ? 'Zoom In' : 'Zoom Out');
        }
      }

      // Handle rotation gesture
      if (Math.abs(rotationDelta) > this.config.rotateThreshold) {
        if (elementInfo) {
          this.triggerGestureHandler(elementInfo, 'rotate', {
            rotation: rotationDelta,
            center: { x: centerX, y: centerY }
          });
        } else {
          this.triggerGlobalGesture('rotate', {
            rotation: rotationDelta,
            center: { x: centerX, y: centerY }
          });
        }

        // Show feedback for significant rotation
        if (Math.abs(rotationDelta) > 5) {
          this.showGestureFeedback(`Rotate ${rotationDelta > 0 ? 'Clockwise' : 'Counter-Clockwise'}`);
        }
      }
    }

    // Find the element at the current touch point
    const elementInfo = this.getElementAtPoint(this.touchState.currentX, this.touchState.currentY);
    if (elementInfo) {
      this.triggerGestureHandler(elementInfo, 'touchMove', {
        touches: this.touchState.touches,
        touchCount: this.touchState.touchCount,
        deltaX: this.touchState.currentX - this.touchState.startX,
        deltaY: this.touchState.currentY - this.touchState.startY
      });
    }

    // Prevent default if configured
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
  }

  // Handle touch end event
  handleTouchEnd(event) {
    if (!this.enabled) return;

    // Clear long press timer
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
      this.touchState.longPressTimer = null;
    }

    // Calculate touch duration
    const touchDuration = Date.now() - this.touchState.startTime;

    // Calculate distance moved
    const moveDistance = this.getDistance(
      this.touchState.startX, this.touchState.startY,
      this.touchState.currentX, this.touchState.currentY
    );

    // Calculate direction
    const deltaX = this.touchState.currentX - this.touchState.startX;
    const deltaY = this.touchState.currentY - this.touchState.startY;

    // Find the element at the touch point
    const elementInfo = this.getElementAtPoint(this.touchState.currentX, this.touchState.currentY);

    // Handle tap
    if (moveDistance < 10 && touchDuration < 300) {
      if (elementInfo) {
        this.triggerGestureHandler(elementInfo, 'tap', {
          x: this.touchState.currentX,
          y: this.touchState.currentY
        });
      } else {
        this.triggerGlobalGesture('tap', {
          x: this.touchState.currentX,
          y: this.touchState.currentY
        });
      }
    }
    // Handle swipe
    else if (moveDistance > this.config.swipeThreshold && touchDuration < 300) {
      // Determine swipe direction
      let direction = '';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      if (elementInfo) {
        this.triggerGestureHandler(elementInfo, 'swipe', {
          direction,
          distance: moveDistance,
          deltaX,
          deltaY
        });
      } else {
        this.triggerGlobalGesture('swipe', {
          direction,
          distance: moveDistance,
          deltaX,
          deltaY
        });
      }

      this.showGestureFeedback(`Swipe ${direction}`);
    }

    // Reset touch state
    this.touchState.active = false;
    this.touchState.scale = 1;
    this.touchState.touchCount = 0;

    // Prevent default if configured
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
  }

  // Handle touch cancel event
  handleTouchCancel(event) {
    // Clear long press timer
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
      this.touchState.longPressTimer = null;
    }

    // Reset touch state
    this.touchState.active = false;
    this.touchState.scale = 1;
    this.touchState.touchCount = 0;

    // Prevent default if configured
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
  }

  // Get element at point
  getElementAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // Check if the element or its parents are registered
    for (const [id, info] of Object.entries(this.elements)) {
      if (element === info.element || element.closest(`#${id}`)) {
        return info;
      }
    }

    return null;
  }

  // Trigger gesture handler for an element
  triggerGestureHandler(elementInfo, gestureType, gestureData) {
    if (elementInfo.gestureHandlers && elementInfo.gestureHandlers[gestureType]) {
      elementInfo.gestureHandlers[gestureType](gestureData);
      return true;
    }
    return false;
  }

  // Trigger global gesture handler
  triggerGlobalGesture(gestureType, gestureData) {
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
  }

  // Calculate distance between two points
  getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // Calculate angle between two points (in degrees)
  getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }

  // Enable gesture controls
  enable() {
    this.enabled = true;
  }

  // Disable gesture controls
  disable() {
    this.enabled = false;
  }
}

// Create global instance
try {
  window.mlModelsGestures = new MLModelsGestureControls();
  console.log('ML Models Gesture Controls initialized successfully');
} catch (error) {
  console.error('Error initializing ML Models Gesture Controls:', error);
}
