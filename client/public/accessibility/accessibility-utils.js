/**
 * CareUnity Network Accessibility Utilities
 * 
 * This file contains utility functions for improving accessibility throughout
 * the CareUnity Network application, working with the enhanced service worker.
 */

(function() {
  'use strict';
  
  // Check if service worker is available
  if ('serviceWorker' in navigator) {
    // Helper function to communicate with service worker
    function sendToServiceWorker(message) {
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
        };
        
        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      });
    }
    
    // Get the user's accessibility preferences from service worker
    window.getAccessibilityPreferences = async function(userId = 'default') {
      try {
        const response = await sendToServiceWorker({
          type: 'GET_ACCESSIBILITY_PREFERENCES',
          userId: userId
        });
        
        return response.preferences;
      } catch (error) {
        console.error('Error getting accessibility preferences:', error);
        return null;
      }
    };
    
    // Update accessibility preferences
    window.updateAccessibilityPreferences = async function(preferences, userId = 'default') {
      try {
        const response = await sendToServiceWorker({
          type: 'UPDATE_ACCESSIBILITY_PREFERENCES',
          userId: userId,
          preferences: preferences
        });
        
        // If preferences were updated successfully, apply them
        if (response.success) {
          applyAccessibilityPreferences(preferences);
        }
        
        return response.success;
      } catch (error) {
        console.error('Error updating accessibility preferences:', error);
        return false;
      }
    };
    
    // Apply accessibility preferences to the UI
    function applyAccessibilityPreferences(preferences) {
      const docElement = document.documentElement;
      
      // Apply high contrast mode
      if (preferences.highContrast) {
        docElement.classList.add('high-contrast');
      } else {
        docElement.classList.remove('high-contrast');
      }
      
      // Apply large text mode
      if (preferences.largeText) {
        docElement.classList.add('large-text');
        // Set a minimum font size
        docElement.style.setProperty('--base-font-size', `${preferences.fontSize || 16}px`);
      } else {
        docElement.classList.remove('large-text');
        docElement.style.removeProperty('--base-font-size');
      }
      
      // Apply reduced motion preferences
      if (preferences.reduceMotion) {
        docElement.classList.add('reduced-motion');
      } else {
        docElement.classList.remove('reduced-motion');
      }
      
      // Apply keyboard navigation focus indicators
      if (preferences.focusIndicators) {
        docElement.classList.add('focus-indicators');
      } else {
        docElement.classList.remove('focus-indicators');
      }
      
      // Apply screen reader optimizations
      if (preferences.screenReaderOptimized) {
        docElement.classList.add('screen-reader-optimized');
      } else {
        docElement.classList.remove('screen-reader-optimized');
      }
      
      // Dispatch an event so other parts of the application can respond
      window.dispatchEvent(new CustomEvent('accessibilityPreferencesChanged', {
        detail: preferences
      }));
    }
    
    // Initialize accessibility settings on page load
    async function initializeAccessibility() {
      const preferences = await window.getAccessibilityPreferences();
      if (preferences) {
        applyAccessibilityPreferences(preferences);
      }
      
      // Add event listener for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ACCESSIBILITY_PREFERENCES_UPDATED') {
          applyAccessibilityPreferences(event.data.preferences);
        }
      });
    }
    
    // Call when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAccessibility);
    } else {
      initializeAccessibility();
    }
    
    // Helper functions for ARIA management
    window.a11y = {
      // Update ARIA live region with a message
      announce: function(message, priority = 'polite') {
        let liveRegion = document.getElementById('a11y-announcer');
        
        // Create the live region if it doesn't exist
        if (!liveRegion) {
          liveRegion = document.createElement('div');
          liveRegion.id = 'a11y-announcer';
          liveRegion.setAttribute('aria-live', priority);
          liveRegion.setAttribute('aria-atomic', 'true');
          liveRegion.setAttribute('class', 'sr-only');
          document.body.appendChild(liveRegion);
        }
        
        // Update the live region content
        liveRegion.textContent = '';
        // Force browser to register the change
        setTimeout(() => {
          liveRegion.textContent = message;
        }, 50);
      },
      
      // Set focus to an element with a proper announcement
      focusElement: function(element, announcement = '') {
        if (element && typeof element.focus === 'function') {
          element.focus();
          
          if (announcement) {
            this.announce(announcement);
          }
        }
      }
    };
    
    // Add keyboard navigation helpers
    document.addEventListener('keydown', function(e) {
      // If preferences include keyboard navigation support
      const isUsingKeyboard = document.documentElement.classList.contains('focus-indicators');
      
      if (isUsingKeyboard) {
        // Add visual class to body when tab key is used
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
        
        // Enhanced keyboard shortcuts for accessibility menu
        if (e.altKey && e.key === 'a') {
          // Find and toggle the accessibility menu
          const accessibilityMenu = document.getElementById('accessibility-menu');
          if (accessibilityMenu) {
            accessibilityMenu.classList.toggle('show');
            window.a11y.announce('Accessibility menu toggled', 'assertive');
          }
        }
      }
    });
    
    // Add mouse detection to remove keyboard navigation indicators
    document.addEventListener('mousedown', function() {
      document.body.classList.remove('keyboard-navigation');
    });
    
    console.log('CareUnity Network Accessibility Utilities loaded');
  }
})();
