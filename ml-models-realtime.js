/**
 * ML Models Real-Time Updates
 *
 * This module provides real-time updates for ML models using WebSockets.
 * It handles connection management, reconnection, message processing,
 * and offline message queuing for synchronization when reconnected.
 */

class MLModelsRealTime {
  constructor(options = {}) {
    // Configuration
    this.options = {
      serverUrl: options.serverUrl || 'ws://localhost:8080',
      reconnectInterval: options.reconnectInterval || 3000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      debug: options.debug || true, // Enable debug mode for testing
      offlineQueueSize: options.offlineQueueSize || 100,
      syncInterval: options.syncInterval || 5000
    };

    // State
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.errorHandlers = [];
    this.lastPingTime = 0;
    this.pingInterval = null;
    this.reconnectTimeout = null;
    this.offlineQueue = [];
    this.syncTimeout = null;
    this.lastSyncTime = 0;
    this.connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected'

    // Initialize
    this.init();

    // Load offline queue from localStorage if available
    this.loadOfflineQueue();
  }

  // Initialize the module
  init() {
    this.log('Initializing ML Models Real-Time module');

    // Register default message handlers
    this.registerMessageHandler('update', this.handleUpdate.bind(this));
    this.registerMessageHandler('init', this.handleInit.bind(this));
    this.registerMessageHandler('subscribed', this.handleSubscribed.bind(this));
    this.registerMessageHandler('unsubscribed', this.handleUnsubscribed.bind(this));
    this.registerMessageHandler('error', this.handleError.bind(this));
    this.registerMessageHandler('pong', this.handlePong.bind(this));

    // Connect to the server
    this.connect();
  }

  // Connect to the WebSocket server
  connect() {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.log(`Connecting to ${this.options.serverUrl}`);
      this.connectionStatus = 'connecting';
      this.notifyStatusChange();

      this.socket = new WebSocket(this.options.serverUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.log('Connection error:', error);
      this.connectionStatus = 'disconnected';
      this.notifyStatusChange();
      this.scheduleReconnect();
    }
  }

  // Load offline queue from localStorage
  loadOfflineQueue() {
    try {
      const queueData = localStorage.getItem('mlModelsOfflineQueue');
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
        this.log(`Loaded ${this.offlineQueue.length} items from offline queue`);
      }
    } catch (error) {
      this.log('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // Save offline queue to localStorage
  saveOfflineQueue() {
    try {
      // Limit queue size
      if (this.offlineQueue.length > this.options.offlineQueueSize) {
        this.offlineQueue = this.offlineQueue.slice(-this.options.offlineQueueSize);
      }

      localStorage.setItem('mlModelsOfflineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      this.log('Error saving offline queue:', error);
    }
  }

  // Add a message to the offline queue
  addToOfflineQueue(message) {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }

    // Add to queue
    this.offlineQueue.push(message);
    this.saveOfflineQueue();

    this.log(`Added message to offline queue (${this.offlineQueue.length} items)`);

    // Dispatch event for offline queue update
    this.dispatchEvent('mlModelsOfflineQueueUpdate', {
      queueSize: this.offlineQueue.length,
      lastMessage: message
    });
  }

  // Process the offline queue when connected
  processOfflineQueue() {
    if (!this.connected || this.offlineQueue.length === 0) {
      return;
    }

    this.log(`Processing offline queue (${this.offlineQueue.length} items)`);

    // Process in batches to avoid overwhelming the connection
    const batchSize = 10;
    const batch = this.offlineQueue.slice(0, batchSize);

    // Send each message
    let successCount = 0;
    batch.forEach(message => {
      if (this.sendMessage(message)) {
        successCount++;
      }
    });

    // Remove sent messages from queue
    if (successCount > 0) {
      this.offlineQueue = this.offlineQueue.slice(successCount);
      this.saveOfflineQueue();

      this.log(`Processed ${successCount} items from offline queue, ${this.offlineQueue.length} remaining`);

      // Dispatch event for offline queue update
      this.dispatchEvent('mlModelsOfflineQueueUpdate', {
        queueSize: this.offlineQueue.length,
        processed: successCount
      });
    }

    // Schedule next batch if there are more items
    if (this.offlineQueue.length > 0) {
      this.syncTimeout = setTimeout(() => {
        this.processOfflineQueue();
      }, 1000); // Process next batch after 1 second
    }
  }

  // Notify status change
  notifyStatusChange() {
    this.dispatchEvent('mlModelsConnectionStatus', {
      status: this.connectionStatus,
      timestamp: new Date().toISOString()
    });
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.log('Disconnecting from server');

      // Clear ping interval
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Close the socket
      try {
        this.socket.close();
      } catch (error) {
        this.log('Error closing socket:', error);
      }

      this.socket = null;
      this.connected = false;
    }
  }

  // Schedule a reconnection attempt
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.options.reconnectInterval * Math.min(this.reconnectAttempts, 10);

      this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      this.log('Max reconnect attempts reached');
      this.notifyError({
        type: 'connection',
        message: 'Failed to connect after maximum attempts',
        reconnectAttempts: this.reconnectAttempts
      });
    }
  }

  // Start sending periodic pings to keep the connection alive
  startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.connected) {
        this.sendMessage({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
        this.lastPingTime = Date.now();
      }
    }, 30000); // Ping every 30 seconds
  }

  // Subscribe to updates for a specific model
  subscribeToModel(modelId, callback) {
    if (!modelId) {
      this.log('Invalid model ID for subscription');
      return false;
    }

    // Store the callback
    if (!this.subscriptions.has(modelId)) {
      this.subscriptions.set(modelId, new Set());
    }

    if (callback) {
      this.subscriptions.get(modelId).add(callback);
    }

    // Send subscription message if connected
    if (this.connected) {
      this.sendMessage({
        type: 'subscribe',
        data: { modelId }
      });
      this.log(`Subscribed to model ${modelId}`);
      return true;
    } else {
      this.log(`Will subscribe to model ${modelId} when connected`);
      return false;
    }
  }

  // Unsubscribe from updates for a specific model
  unsubscribeFromModel(modelId, callback) {
    if (!modelId) {
      this.log('Invalid model ID for unsubscription');
      return false;
    }

    // Remove the callback
    if (this.subscriptions.has(modelId)) {
      if (callback) {
        this.subscriptions.get(modelId).delete(callback);

        // If no more callbacks, remove the subscription
        if (this.subscriptions.get(modelId).size === 0) {
          this.subscriptions.delete(modelId);
        }
      } else {
        // Remove all callbacks
        this.subscriptions.delete(modelId);
      }
    }

    // Send unsubscription message if connected
    if (this.connected) {
      this.sendMessage({
        type: 'unsubscribe',
        data: { modelId }
      });
      this.log(`Unsubscribed from model ${modelId}`);
      return true;
    } else {
      this.log(`Will unsubscribe from model ${modelId} when connected`);
      return false;
    }
  }

  // Send feedback for a model
  sendFeedback(modelId, feedback) {
    if (!modelId || !feedback) {
      this.log('Invalid model ID or feedback');
      return false;
    }

    if (this.connected) {
      this.sendMessage({
        type: 'feedback',
        data: { modelId, feedback }
      });
      this.log(`Sent feedback for model ${modelId}`);
      return true;
    } else {
      this.log('Cannot send feedback: not connected');
      return false;
    }
  }

  // Register a handler for a specific message type
  registerMessageHandler(type, handler) {
    if (!type || typeof handler !== 'function') {
      this.log('Invalid message handler registration');
      return false;
    }

    this.messageHandlers.set(type, handler);
    return true;
  }

  // Register a connection handler
  onConnect(handler) {
    if (typeof handler === 'function') {
      this.connectionHandlers.push(handler);

      // If already connected, call the handler immediately
      if (this.connected) {
        try {
          handler();
        } catch (error) {
          this.log('Error in connection handler:', error);
        }
      }

      return true;
    }
    return false;
  }

  // Register a disconnection handler
  onDisconnect(handler) {
    if (typeof handler === 'function') {
      this.disconnectionHandlers.push(handler);
      return true;
    }
    return false;
  }

  // Register an error handler
  onError(handler) {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler);
      return true;
    }
    return false;
  }

  // Handle WebSocket open event
  handleOpen(event) {
    this.log('Connected to server');
    this.connected = true;
    this.reconnectAttempts = 0;
    this.connectionStatus = 'connected';

    // Start ping interval
    this.startPingInterval();

    // Resubscribe to models
    for (const modelId of this.subscriptions.keys()) {
      this.sendMessage({
        type: 'subscribe',
        data: { modelId }
      });
    }

    // Process offline queue
    if (this.offlineQueue.length > 0) {
      this.log(`Processing offline queue with ${this.offlineQueue.length} items`);
      setTimeout(() => {
        this.processOfflineQueue();
      }, 1000); // Wait a second before processing queue to ensure connection is stable
    }

    // Notify status change
    this.notifyStatusChange();

    // Notify connection handlers
    this.notifyConnectionHandlers();
  }

  // Handle WebSocket close event
  handleClose(event) {
    this.log(`Connection closed: ${event.code} ${event.reason}`);
    this.connected = false;
    this.connectionStatus = 'disconnected';

    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Clear sync timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }

    // Notify status change
    this.notifyStatusChange();

    // Notify disconnection handlers
    this.notifyDisconnectionHandlers();

    // Attempt to reconnect
    this.scheduleReconnect();
  }

  // Handle WebSocket error event
  handleSocketError(event) {
    this.log('WebSocket error:', event);

    this.notifyError({
      type: 'socket',
      message: 'WebSocket error',
      event
    });
  }

  // Handle WebSocket message event
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      this.log('Received message:', message);

      // Call the appropriate message handler
      if (message.type && this.messageHandlers.has(message.type)) {
        this.messageHandlers.get(message.type)(message);
      } else {
        this.log(`No handler for message type: ${message.type}`);
      }
    } catch (error) {
      this.log('Error processing message:', error);
      this.notifyError({
        type: 'message',
        message: 'Error processing message',
        error
      });
    }
  }

  // Send a message to the server
  sendMessage(message) {
    // If not connected, add to offline queue
    if (!this.connected || !this.socket) {
      this.log('Cannot send message: not connected, adding to offline queue');

      // Only queue certain message types
      const queueableTypes = ['feedback', 'update', 'metrics', 'log'];
      if (message.type && queueableTypes.includes(message.type)) {
        this.addToOfflineQueue(message);
        return true; // Return true to indicate message was handled (queued)
      }

      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.log('Error sending message:', error);

      // Try to queue the message if it's a type that can be queued
      const queueableTypes = ['feedback', 'update', 'metrics', 'log'];
      if (message.type && queueableTypes.includes(message.type)) {
        this.log('Adding failed message to offline queue');
        this.addToOfflineQueue(message);
      }

      this.notifyError({
        type: 'send',
        message: 'Error sending message',
        error
      });

      return false;
    }
  }

  // Get the current connection status
  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.offlineQueue.length,
      lastPingTime: this.lastPingTime,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }

  // Get the offline queue
  getOfflineQueue() {
    return [...this.offlineQueue];
  }

  // Clear the offline queue
  clearOfflineQueue() {
    this.offlineQueue = [];
    this.saveOfflineQueue();

    this.dispatchEvent('mlModelsOfflineQueueUpdate', {
      queueSize: 0,
      cleared: true
    });

    return true;
  }

  // Handle model update message
  handleUpdate(message) {
    const { updateType, data } = message;

    if (data && data.modelId && this.subscriptions.has(data.modelId)) {
      // Notify all subscribers
      const callbacks = this.subscriptions.get(data.modelId);
      callbacks.forEach(callback => {
        try {
          callback(updateType, data);
        } catch (error) {
          this.log(`Error in subscription callback for model ${data.modelId}:`, error);
        }
      });

      // Dispatch a custom event
      this.dispatchUpdateEvent(updateType, data);
    }
  }

  // Handle initialization message
  handleInit(message) {
    this.log('Received initialization data');

    // Dispatch a custom event
    this.dispatchEvent('mlModelsInit', message.data);
  }

  // Handle subscription confirmation
  handleSubscribed(message) {
    this.log(`Subscription confirmed for model ${message.data.modelId}`);
  }

  // Handle unsubscription confirmation
  handleUnsubscribed(message) {
    this.log(`Unsubscription confirmed for model ${message.data.modelId}`);
  }

  // Handle error message from server
  handleError(message) {
    this.log('Received error from server:', message);

    this.notifyError({
      type: 'server',
      message: message.data.message,
      data: message.data
    });
  }

  // Handle pong message (response to ping)
  handlePong(message) {
    const latency = Date.now() - this.lastPingTime;
    this.log(`Received pong, latency: ${latency}ms`);
  }

  // Notify connection handlers
  notifyConnectionHandlers() {
    this.connectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        this.log('Error in connection handler:', error);
      }
    });
  }

  // Notify disconnection handlers
  notifyDisconnectionHandlers() {
    this.disconnectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        this.log('Error in disconnection handler:', error);
      }
    });
  }

  // Notify error handlers
  notifyError(error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        this.log('Error in error handler:', err);
      }
    });

    // Dispatch a custom event
    this.dispatchEvent('mlModelsError', error);
  }

  // Dispatch a custom event
  dispatchEvent(eventName, data) {
    try {
      const event = new CustomEvent(eventName, {
        detail: data
      });
      document.dispatchEvent(event);
    } catch (error) {
      this.log(`Error dispatching event ${eventName}:`, error);
    }
  }

  // Dispatch a model update event
  dispatchUpdateEvent(updateType, data) {
    this.dispatchEvent('mlModelsUpdate', {
      updateType,
      data
    });
  }

  // Log a message if debug is enabled
  log(...args) {
    if (this.options.debug) {
      console.log('[ML Models Real-Time]', ...args);
    }
  }
}

// Create global instance
window.mlModelsRealTime = new MLModelsRealTime({
  debug: true,
  reconnectInterval: 2000,
  maxReconnectAttempts: 20,
  offlineQueueSize: 200,
  syncInterval: 3000
});

// Listen for connection status changes
document.addEventListener('mlModelsConnectionStatus', (event) => {
  console.log('Connection status changed:', event.detail);

  // Dispatch a custom event for the UI to update
  const statusEvent = new CustomEvent('realTimeConnectionStatus', {
    detail: event.detail
  });
  document.dispatchEvent(statusEvent);
});

// Listen for offline queue updates
document.addEventListener('mlModelsOfflineQueueUpdate', (event) => {
  console.log('Offline queue updated:', event.detail);

  // Dispatch a custom event for the UI to update
  const queueEvent = new CustomEvent('realTimeOfflineQueue', {
    detail: event.detail
  });
  document.dispatchEvent(queueEvent);
});
