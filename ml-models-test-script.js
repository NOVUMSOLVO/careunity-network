/**
 * ML Models Test Script
 * 
 * This script tests the functionality of the ML models in the ml-models-test.html page.
 * It verifies that the various components are working correctly.
 */

// Wait for the page to fully load
window.addEventListener('load', function() {
  console.log('ML Models Test Script loaded');
  
  // Test functions
  const tests = {
    // Test error reporting functionality
    testErrorReporting: function() {
      console.log('Testing Error Reporting...');
      
      if (!window.mlModelsErrorReporter) {
        console.error('Error Reporter module not loaded');
        return false;
      }
      
      try {
        // Report a test error
        window.mlModelsErrorReporter.reportError('test', {
          message: 'Test error message',
          error: new Error('Test error')
        });
        
        console.log('Error reported successfully');
        return true;
      } catch (error) {
        console.error('Error reporting test failed:', error);
        return false;
      }
    },
    
    // Test gesture controls functionality
    testGestureControls: function() {
      console.log('Testing Gesture Controls...');
      
      if (!window.mlModelsGestures) {
        console.error('Gesture Controls module not loaded');
        return false;
      }
      
      try {
        // Show gesture feedback
        window.mlModelsGestures.showGestureFeedback('Test Gesture');
        
        // Register a test element
        const testElement = document.createElement('div');
        testElement.id = 'test-gesture-element';
        document.body.appendChild(testElement);
        
        window.mlModelsGestures.registerElement('test-gesture-element', {
          swipe: function(direction) {
            console.log('Swipe detected:', direction);
          }
        });
        
        console.log('Gesture controls tested successfully');
        return true;
      } catch (error) {
        console.error('Gesture controls test failed:', error);
        return false;
      }
    },
    
    // Test real-time updates functionality
    testRealTimeUpdates: function() {
      console.log('Testing Real-Time Updates...');
      
      if (!window.mlModelsRealTime) {
        console.error('Real-Time Updates module not loaded');
        return false;
      }
      
      try {
        // Get connection status
        const status = window.mlModelsRealTime.getConnectionStatus();
        console.log('Real-time connection status:', status);
        
        // Subscribe to a test model
        window.mlModelsRealTime.subscribeToModel('test-model', function(updateType, data) {
          console.log('Model update received:', updateType, data);
        });
        
        console.log('Real-time updates tested successfully');
        return true;
      } catch (error) {
        console.error('Real-time updates test failed:', error);
        return false;
      }
    },
    
    // Test offline database functionality
    testOfflineDB: function() {
      console.log('Testing Offline Database...');
      
      if (!window.mlModelsOfflineDB) {
        console.error('Offline DB module not loaded');
        return false;
      }
      
      try {
        // Create a test model
        const testModel = {
          id: 'test-model-' + Date.now(),
          name: 'Test Model',
          version: '1.0',
          type: 'test'
        };
        
        // Cache the model
        window.mlModelsOfflineDB.cacheModel(testModel)
          .then(function(result) {
            console.log('Model cached successfully:', result);
          })
          .catch(function(error) {
            console.error('Error caching model:', error);
          });
        
        console.log('Offline database tested successfully');
        return true;
      } catch (error) {
        console.error('Offline database test failed:', error);
        return false;
      }
    },
    
    // Test voice commands functionality
    testVoiceCommands: function() {
      console.log('Testing Voice Commands...');
      
      if (!window.mlModelsVoice) {
        console.error('Voice Commands module not loaded');
        return false;
      }
      
      try {
        // Show voice feedback
        window.mlModelsVoice.showFeedback('Test Voice Command');
        
        // Register a test command
        window.mlModelsVoice.registerCommand('test command', function(match) {
          console.log('Test command detected:', match);
        });
        
        console.log('Voice commands tested successfully');
        return true;
      } catch (error) {
        console.error('Voice commands test failed:', error);
        return false;
      }
    },
    
    // Test notifications functionality
    testNotifications: function() {
      console.log('Testing Notifications...');
      
      if (!window.mlModelsNotifications) {
        console.error('Notifications module not loaded');
        return false;
      }
      
      try {
        // Show a test notification (this will only work if notifications are allowed)
        window.mlModelsNotifications.showNotification('Test Notification', {
          body: 'This is a test notification',
          requireInteraction: false
        });
        
        console.log('Notifications tested successfully');
        return true;
      } catch (error) {
        console.error('Notifications test failed:', error);
        return false;
      }
    },
    
    // Run all tests
    runAllTests: function() {
      console.log('Running all tests...');
      
      const results = {
        errorReporting: this.testErrorReporting(),
        gestureControls: this.testGestureControls(),
        realTimeUpdates: this.testRealTimeUpdates(),
        offlineDB: this.testOfflineDB(),
        voiceCommands: this.testVoiceCommands(),
        notifications: this.testNotifications()
      };
      
      console.log('Test results:', results);
      
      // Update the debug panel with results
      const debugInfoElement = document.getElementById('debug-info');
      if (debugInfoElement) {
        debugInfoElement.innerHTML += '<h3>Test Results</h3>';
        
        for (const [test, result] of Object.entries(results)) {
          const color = result ? 'green' : 'red';
          const status = result ? '✓' : '✗';
          debugInfoElement.innerHTML += `<p style="color: ${color}">${status} ${test}</p>`;
        }
      }
      
      return results;
    }
  };
  
  // Add a button to run tests
  const debugElement = document.getElementById('debug');
  if (debugElement) {
    const testButton = document.createElement('button');
    testButton.textContent = 'Run Tests';
    testButton.style.cssText = 'background-color: #10b981; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;';
    testButton.onclick = function() {
      tests.runAllTests();
    };
    
    debugElement.appendChild(testButton);
  }
  
  // Expose tests to global scope for manual testing
  window.mlModelsTests = tests;
});
