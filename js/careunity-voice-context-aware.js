/**
 * CareUnity Context-Aware Voice Commands
 * 
 * This module enhances the voice command system with context-awareness,
 * allowing voice commands to adapt based on the current app state,
 * user location, and previous interactions.
 */

(function() {
  // Initialize context tracking
  const CareUnityVoiceContext = {
    // Current context state
    currentContext: {
      page: null,
      section: null,
      carePlanId: null,
      reportId: null,
      patientId: null,
      taskId: null,
      lastCommand: null,
      lastInteraction: null,
      locationContext: null,
      timeContext: new Date()
    },
    
    // Context history (for more advanced context-aware suggestions)
    contextHistory: [],
    
    // Maximum history items to keep
    maxHistoryItems: 20,
    
    // Machine learning model for intent prediction
    intentModel: null,
    
    // Initialize the context system
    init: async function() {
      console.log('Initializing context-aware voice commands');
      
      // Track page changes
      this.setupPageTracking();
      
      // Setup location awareness if permitted
      this.setupLocationAwareness();
      
      // Load intent prediction model if available
      await this.loadIntentModel();
      
      // Listen for voice command events
      document.addEventListener('voiceCommandStarted', this.updateContextBeforeCommand.bind(this));
      document.addEventListener('voiceCommandExecuted', this.updateContextAfterCommand.bind(this));
      
      // Update time context periodically
      setInterval(() => {
        this.currentContext.timeContext = new Date();
        this.evaluateTimeBasedContexts();
      }, 60000); // Every minute
      
      return this;
    },
    
    // Setup tracking of page/section changes
    setupPageTracking: function() {
      // Track navigation events
      window.addEventListener('hashchange', this.updatePageContext.bind(this));
      window.addEventListener('popstate', this.updatePageContext.bind(this));
      
      // Track manual navigation via click events
      document.addEventListener('click', (e) => {
        // Check if the click was on a navigation element
        const navElement = e.target.closest('a, [data-nav]');
        if (navElement) {
          setTimeout(() => this.updatePageContext(), 100);
        }
      });
      
      // Initialize with current page context
      this.updatePageContext();
    },
    
    // Update the page context based on current URL and visible elements
    updatePageContext: function() {
      // Previous context for history
      const previousContext = {...this.currentContext};
      
      // Get page from URL
      const url = new URL(window.location.href);
      const pagePath = url.pathname.split('/').pop();
      
      this.currentContext.page = pagePath || 'index.html';
      
      // Extract IDs from URL parameters
      const params = new URLSearchParams(url.search);
      if (params.has('carePlanId')) this.currentContext.carePlanId = params.get('carePlanId');
      if (params.has('reportId')) this.currentContext.reportId = params.get('reportId');
      if (params.has('patientId')) this.currentContext.patientId = params.get('patientId');
      if (params.has('taskId')) this.currentContext.taskId = params.get('taskId');
      
      // Try to determine section from visible elements with IDs or data attributes
      const visibleSections = Array.from(document.querySelectorAll('[id][style*="display: block"], [data-section][style*="display: block"]'));
      if (visibleSections.length > 0) {
        const mainSection = visibleSections[0];
        this.currentContext.section = mainSection.id || mainSection.dataset.section;
      }
      
      // Add previous context to history if different
      if (previousContext.page !== this.currentContext.page || 
          previousContext.section !== this.currentContext.section) {
        this.addToHistory(previousContext);
      }
      
      // Announce context change for debugging
      console.log('Context updated:', this.currentContext);
      
      // Dispatch context change event for other modules
      document.dispatchEvent(new CustomEvent('voiceContextChanged', {
        detail: { context: this.currentContext }
      }));
    },
    
    // Setup location awareness
    setupLocationAwareness: function() {
      if ('geolocation' in navigator) {
        // Check if we have permission
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            this.startLocationTracking();
          }
          
          result.onchange = () => {
            if (result.state === 'granted') {
              this.startLocationTracking();
            } else {
              this.currentContext.locationContext = null;
            }
          };
        });
      }
    },
    
    // Start tracking location for context
    startLocationTracking: function() {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateLocationContext(position);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
      
      // Setup watching location changes when moving
      if (this.locationWatchId) {
        navigator.geolocation.clearWatch(this.locationWatchId);
      }
      
      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          this.updateLocationContext(position);
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, maximumAge: 60000 }
      );
    },
    
    // Update location context
    updateLocationContext: async function(position) {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Check if position has changed significantly
      if (this.currentContext.locationContext) {
        const lastPos = this.currentContext.locationContext;
        const distance = this.calculateDistance(
          latitude, longitude,
          lastPos.latitude, lastPos.longitude
        );
        
        // If not moved significantly, don't update
        if (distance < 10) { // Less than 10 meters
          return;
        }
      }
      
      // Basic location context
      this.currentContext.locationContext = {
        latitude, 
        longitude, 
        accuracy,
        timestamp: position.timestamp
      };
      
      // Try to determine if we're at a known location like a patient's home or facility
      try {
        const locationContext = await this.identifyLocation(latitude, longitude);
        if (locationContext) {
          this.currentContext.locationContext = {
            ...this.currentContext.locationContext,
            ...locationContext
          };
          
          console.log('Location context updated:', this.currentContext.locationContext);
          
          // Dispatch location context event
          document.dispatchEvent(new CustomEvent('voiceLocationContextChanged', {
            detail: { locationContext: this.currentContext.locationContext }
          }));
        }
      } catch (error) {
        console.error('Error identifying location:', error);
      }
    },
    
    // Calculate distance between coordinates using Haversine formula
    calculateDistance: function(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth radius in meters
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // Distance in meters
    },
    
    // Identify if the current location matches a known place
    identifyLocation: async function(latitude, longitude) {
      // Try to get care locations from IndexedDB
      const db = await this.getDatabase();
      if (!db) return null;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['careLocations'], 'readonly');
        const store = transaction.objectStore('careLocations');
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          const locations = event.target.result;
          
          // Find nearest location within threshold
          let nearestLocation = null;
          let minDistance = Infinity;
          
          for (const location of locations) {
            const distance = this.calculateDistance(
              latitude, longitude,
              location.latitude, location.longitude
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestLocation = location;
            }
          }
          
          // If within 100 meters, consider at this location
          if (minDistance < 100) {
            resolve({
              locationType: nearestLocation.type,
              locationName: nearestLocation.name,
              locationId: nearestLocation.id,
              patientId: nearestLocation.patientId,
              facilityId: nearestLocation.facilityId,
              distance: minDistance
            });
          } else {
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    // Get IndexedDB database
    getDatabase: function() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('CareUnityDB', 1);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          console.error('Error opening database:', event.target.error);
          resolve(null);
        };
      });
    },
    
    // Load machine learning model for intent prediction if available
    loadIntentModel: async function() {
      try {
        // Check if TensorFlow.js is available
        if (window.tf) {
          console.log('Loading voice intent model...');
          this.intentModel = await tf.loadLayersModel('/models/voice-intent/model.json');
          console.log('Voice intent model loaded');
        }
      } catch (error) {
        console.error('Error loading intent model:', error);
      }
    },
    
    // Update context before command execution
    updateContextBeforeCommand: function(event) {
      // Store previous state
      this.addToHistory({...this.currentContext});
      
      // Update with current command
      this.currentContext.lastCommand = event.detail.command;
    },
    
    // Update context after command execution
    updateContextAfterCommand: function(event) {
      // Update last interaction
      this.currentContext.lastInteraction = {
        command: event.detail.command,
        result: event.detail.result,
        timestamp: Date.now()
      };
      
      // Update page context in case the command changed the view
      setTimeout(() => this.updatePageContext(), 500);
    },
    
    // Check for time-based contexts (morning, afternoon, night shift, etc.)
    evaluateTimeBasedContexts: function() {
      const now = new Date();
      const hour = now.getHours();
      
      let timeOfDay;
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
      } else if (hour >= 17 && hour < 21) {
        timeOfDay = 'evening';
      } else {
        timeOfDay = 'night';
      }
      
      // Update time context
      this.currentContext.timeContext = {
        time: now,
        timeOfDay,
        isWeekend: now.getDay() === 0 || now.getDay() === 6
      };
    },
    
    // Add context to history
    addToHistory: function(context) {
      // Add timestamp
      const contextWithTimestamp = {
        ...context,
        timestamp: Date.now()
      };
      
      // Add to beginning of array
      this.contextHistory.unshift(contextWithTimestamp);
      
      // Trim history to max size
      if (this.contextHistory.length > this.maxHistoryItems) {
        this.contextHistory = this.contextHistory.slice(0, this.maxHistoryItems);
      }
    },
    
    // Get suggestions based on current context
    getContextualSuggestions: async function() {
      // Basic context-based suggestions
      const suggestions = [];
      
      // Page-specific suggestions
      if (this.currentContext.page === 'care-plans.html' || 
          this.currentContext.page === 'advanced-care-plan.html') {
        suggestions.push(
          { command: 'show all tasks', description: 'View all care plan tasks' },
          { command: 'add new task', description: 'Add a new task to this care plan' }
        );
        
        if (this.currentContext.carePlanId) {
          suggestions.push(
            { command: 'show monitoring data', description: 'View monitoring data for this care plan' },
            { command: 'show care plan history', description: 'View history of this care plan' }
          );
        }
      }
      
      // Location-specific suggestions
      if (this.currentContext.locationContext && this.currentContext.locationContext.patientId) {
        suggestions.push(
          { command: 'record visit', description: 'Record a visit for this patient' },
          { command: 'show patient details', description: 'View details for this patient' }
        );
      }
      
      // Time-specific suggestions
      if (this.currentContext.timeContext.timeOfDay === 'morning') {
        suggestions.push(
          { command: 'show today\'s schedule', description: 'View today\'s visit schedule' }
        );
      } else if (this.currentContext.timeContext.timeOfDay === 'evening') {
        suggestions.push(
          { command: 'complete daily report', description: 'Complete your daily report' }
        );
      }
      
      // Add ML-based suggestions if model is available
      if (this.intentModel) {
        try {
          const mlSuggestions = await this.getMachineLearningBasedSuggestions();
          suggestions.push(...mlSuggestions);
        } catch (error) {
          console.error('Error getting ML suggestions:', error);
        }
      }
      
      return suggestions;
    },
    
    // Get suggestions based on machine learning model
    getMachineLearningBasedSuggestions: async function() {
      // This would use TensorFlow.js to generate predictions
      // Simplified for demonstration
      return [
        { command: 'record vitals', description: 'Based on your history, you might want to record vitals now', confidence: 0.85 }
      ];
    }
  };
  
  // Initialize and expose globally
  window.CareUnityVoiceContext = CareUnityVoiceContext;
  
  // Auto-initialize when document is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => CareUnityVoiceContext.init(), 1000);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => CareUnityVoiceContext.init(), 1000);
    });
  }
})();
