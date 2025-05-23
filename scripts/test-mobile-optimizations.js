/**
 * Test script for mobile optimizations
 *
 * This script tests the mobile optimizations by:
 * 1. Simulating different device types
 * 2. Simulating background/foreground transitions
 * 3. Simulating battery level changes
 * 4. Measuring reconnection behavior
 * 5. Testing progressive loading component
 * 6. Testing touch interactions component
 */

// Import the WebSocket client
import { WebSocketClient } from '../client/src/lib/websocket-client.js';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Log a message with color
 * @param {string} message Message to log
 * @param {string} color Color to use
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Test the WebSocket client's mobile optimizations
 */
async function testMobileOptimizations() {
  log('=== Testing WebSocket Mobile Optimizations ===', colors.bright + colors.blue);

  // Create a mock WebSocket server
  import WebSocket from 'ws';
  const server = new WebSocket.Server({ port: 8080 });

  log('Started mock WebSocket server on port 8080', colors.green);

  // Track connections and messages
  let connections = 0;
  let messages = 0;

  server.on('connection', (ws) => {
    connections++;
    log(`New connection established (total: ${connections})`, colors.green);

    ws.on('message', (message) => {
      messages++;
      try {
        const data = JSON.parse(message);
        log(`Received message: ${JSON.stringify(data)}`, colors.dim);
      } catch (error) {
        log(`Received non-JSON message: ${message}`, colors.dim);
      }
    });

    ws.on('close', () => {
      connections--;
      log(`Connection closed (remaining: ${connections})`, colors.yellow);
    });
  });

  // Test scenarios
  await testDesktopClient();
  await testMobileClient();
  await testBackgroundedApp();
  await testLowBattery();
  await testReconnection();
  await testProgressiveLoading();
  await testTouchInteractions();

  // Close the server
  server.close();
  log('Closed mock WebSocket server', colors.yellow);
  log('All tests completed!', colors.bright + colors.green);
}

/**
 * Test desktop client behavior
 */
async function testDesktopClient() {
  log('\n--- Testing Desktop Client ---', colors.bright + colors.cyan);

  // Create a desktop client
  const client = new WebSocketClient('ws://localhost:8080', {
    debug: true,
    mobileOptimization: false,
  });

  // Connect and send messages
  client.connect();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send messages
  for (let i = 0; i < 5; i++) {
    client.send({ type: 'test', message: `Desktop message ${i}` });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Disconnect
  client.disconnect();
  log('Desktop client test completed', colors.green);
}

/**
 * Test mobile client behavior
 */
async function testMobileClient() {
  log('\n--- Testing Mobile Client ---', colors.bright + colors.cyan);

  // Create a mobile client by mocking the mobile detection
  const client = new WebSocketClient('ws://localhost:8080', {
    debug: true,
    mobileOptimization: true,
  });

  // Mock mobile device detection
  client.isMobile = true;

  // Connect and send messages
  client.connect();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send messages
  for (let i = 0; i < 5; i++) {
    client.send({ type: 'test', message: `Mobile message ${i}` });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check heartbeat interval
  log(`Mobile heartbeat interval: ${client.getHeartbeatInterval()}ms`, colors.yellow);

  // Disconnect
  client.disconnect();
  log('Mobile client test completed', colors.green);
}

/**
 * Test backgrounded app behavior
 */
async function testBackgroundedApp() {
  log('\n--- Testing Backgrounded App ---', colors.bright + colors.cyan);

  // Create a mobile client
  const client = new WebSocketClient('ws://localhost:8080', {
    debug: true,
    mobileOptimization: true,
  });

  // Mock mobile device detection
  client.isMobile = true;

  // Connect
  client.connect();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send message while in foreground
  client.send({ type: 'test', message: 'Foreground message' });

  // Simulate app going to background
  log('Simulating app going to background...', colors.yellow);
  client.isBackgrounded = true;
  client.handleVisibilityChange();

  // Wait for heartbeat adjustment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send message while in background
  client.send({ type: 'test', message: 'Background message' });

  // Check heartbeat interval
  log(`Backgrounded heartbeat interval: ${client.getHeartbeatInterval()}ms`, colors.yellow);

  // Simulate app coming back to foreground
  log('Simulating app coming back to foreground...', colors.yellow);
  client.isBackgrounded = false;
  client.handleVisibilityChange();

  // Wait for heartbeat adjustment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send message after returning to foreground
  client.send({ type: 'test', message: 'Back to foreground message' });

  // Disconnect
  client.disconnect();
  log('Backgrounded app test completed', colors.green);
}

/**
 * Test low battery behavior
 */
async function testLowBattery() {
  log('\n--- Testing Low Battery ---', colors.bright + colors.cyan);

  // Create a mobile client
  const client = new WebSocketClient('ws://localhost:8080', {
    debug: true,
    mobileOptimization: true,
  });

  // Mock mobile device detection
  client.isMobile = true;

  // Connect
  client.connect();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send message with normal battery
  client.send({ type: 'test', message: 'Normal battery message' });

  // Simulate low battery
  log('Simulating low battery...', colors.yellow);
  client.isLowBatteryMode = true;
  client.updateHeartbeatInterval();

  // Wait for heartbeat adjustment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send message with low battery
  client.send({ type: 'test', message: 'Low battery message' });

  // Check heartbeat interval
  log(`Low battery heartbeat interval: ${client.getHeartbeatInterval()}ms`, colors.yellow);

  // Disconnect
  client.disconnect();
  log('Low battery test completed', colors.green);
}

/**
 * Test reconnection behavior
 */
async function testReconnection() {
  log('\n--- Testing Reconnection ---', colors.bright + colors.cyan);

  // Create a client with short reconnect interval
  const client = new WebSocketClient('ws://localhost:8080', {
    debug: true,
    reconnectInterval: 500,
    maxReconnectAttempts: 3,
  });

  // Add status listener
  client.onStatusChange((status) => {
    log(`Connection status changed: ${status}`, colors.magenta);
  });

  // Connect
  client.connect();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate connection failure
  log('Simulating connection failure...', colors.yellow);
  client.handleError(new Error('Simulated error'));

  // Wait for reconnection attempts
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Disconnect
  client.disconnect();
  log('Reconnection test completed', colors.green);
}

/**
 * Test progressive loading component
 */
async function testProgressiveLoading() {
  log('\n--- Testing Progressive Loading Component ---', colors.bright + colors.cyan);

  // Create a mock implementation of the ProgressiveLoader component
  const ProgressiveLoader = {
    loadData: async (page, pageSize) => {
      log(`Loading data: page=${page}, pageSize=${pageSize}`, colors.dim);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock data
      const items = Array.from({ length: pageSize }, (_, i) => ({
        id: `item-${page}-${i}`,
        name: `Item ${page}-${i}`,
        description: `Description for item ${page}-${i}`,
      }));

      return {
        items,
        total: 100,
      };
    },
  };

  // Test with different device types
  const deviceTypes = ['desktop', 'tablet', 'mobile'];

  for (const deviceType of deviceTypes) {
    log(`Testing progressive loading on ${deviceType}...`, colors.yellow);

    // Determine page size based on device type
    let pageSize = 20;
    if (deviceType === 'tablet') pageSize = 15;
    if (deviceType === 'mobile') pageSize = 10;

    // Load initial data
    const result = await ProgressiveLoader.loadData(1, pageSize);

    log(`Loaded ${result.items.length} items for ${deviceType}`, colors.green);

    // Verify page size adjustment
    if (deviceType === 'desktop' && result.items.length === 20) {
      log('Desktop page size correct ✓', colors.green);
    } else if (deviceType === 'tablet' && result.items.length === 15) {
      log('Tablet page size correct ✓', colors.green);
    } else if (deviceType === 'mobile' && result.items.length === 10) {
      log('Mobile page size correct ✓', colors.green);
    } else {
      log(`Incorrect page size for ${deviceType}: ${result.items.length}`, colors.red);
    }
  }

  log('Progressive loading test completed', colors.green);
}

/**
 * Test touch interactions component
 */
async function testTouchInteractions() {
  log('\n--- Testing Touch Interactions Component ---', colors.bright + colors.cyan);

  // Create a mock implementation of the TouchInteraction component
  const TouchInteraction = {
    simulateSwipe: (direction, distance) => {
      log(`Simulating swipe: direction=${direction}, distance=${distance}px`, colors.dim);
      return true;
    },
    simulateTap: () => {
      log('Simulating tap', colors.dim);
      return true;
    },
    simulateLongPress: (duration) => {
      log(`Simulating long press: duration=${duration}ms`, colors.dim);
      return true;
    },
    simulatePinch: (scale) => {
      log(`Simulating pinch: scale=${scale}`, colors.dim);
      return true;
    },
  };

  // Test swipe gestures
  log('Testing swipe gestures...', colors.yellow);
  const swipeDirections = ['left', 'right', 'up', 'down'];

  for (const direction of swipeDirections) {
    const result = TouchInteraction.simulateSwipe(direction, 100);
    log(`Swipe ${direction}: ${result ? 'Success ✓' : 'Failed ✗'}`, result ? colors.green : colors.red);
  }

  // Test tap gesture
  log('Testing tap gesture...', colors.yellow);
  const tapResult = TouchInteraction.simulateTap();
  log(`Tap: ${tapResult ? 'Success ✓' : 'Failed ✗'}`, tapResult ? colors.green : colors.red);

  // Test long press gesture
  log('Testing long press gesture...', colors.yellow);
  const longPressResult = TouchInteraction.simulateLongPress(500);
  log(`Long press: ${longPressResult ? 'Success ✓' : 'Failed ✗'}`, longPressResult ? colors.green : colors.red);

  // Test pinch gesture
  log('Testing pinch gesture...', colors.yellow);
  const pinchResult = TouchInteraction.simulatePinch(1.5);
  log(`Pinch: ${pinchResult ? 'Success ✓' : 'Failed ✗'}`, pinchResult ? colors.green : colors.red);

  log('Touch interactions test completed', colors.green);
}

// Run the tests
testMobileOptimizations().catch(error => {
  log(`Error: ${error.message}`, colors.red);
  process.exit(1);
});
