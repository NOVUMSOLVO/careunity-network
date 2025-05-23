/**
 * Test ML Functionality
 * 
 * This script tests the functionality of the ML models in the browser.
 */

// Function to test error reporting
function testErrorReporting() {
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
}

// Function to test gesture controls
function testGestureControls() {
  console.log('Testing Gesture Controls...');
  
  if (!window.mlModelsGestures) {
    console.error('Gesture Controls module not loaded');
    return false;
  }
  
  try {
    // Show gesture feedback
    window.mlModelsGestures.showGestureFeedback('Test Gesture');
    
    console.log('Gesture controls tested successfully');
    return true;
  } catch (error) {
    console.error('Gesture controls test failed:', error);
    return false;
  }
}

// Function to test diagnostics panel
function testDiagnosticsPanel() {
  console.log('Testing Diagnostics Panel...');
  
  try {
    // Show diagnostics panel
    const diagnosticsPanel = document.getElementById('diagnostics-panel');
    const showDiagnosticsBtn = document.getElementById('show-diagnostics-btn');
    
    if (!diagnosticsPanel || !showDiagnosticsBtn) {
      console.error('Diagnostics panel elements not found');
      return false;
    }
    
    // Click the button to show diagnostics
    showDiagnosticsBtn.click();
    
    console.log('Diagnostics panel tested successfully');
    return true;
  } catch (error) {
    console.error('Diagnostics panel test failed:', error);
    return false;
  }
}

// Function to run all tests
function runAllTests() {
  console.log('Running all tests...');
  
  const results = {
    errorReporting: testErrorReporting(),
    gestureControls: testGestureControls(),
    diagnosticsPanel: testDiagnosticsPanel()
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

// Run tests when the page is loaded
window.addEventListener('load', function() {
  console.log('Test script loaded');
  
  // Add a button to run tests
  const debugElement = document.getElementById('debug');
  if (debugElement) {
    const testButton = document.createElement('button');
    testButton.textContent = 'Run Tests';
    testButton.style.cssText = 'background-color: #10b981; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;';
    testButton.onclick = function() {
      runAllTests();
    };
    
    debugElement.appendChild(testButton);
  }
});

// Expose test functions to the console
window.testML = {
  testErrorReporting,
  testGestureControls,
  testDiagnosticsPanel,
  runAllTests
};
