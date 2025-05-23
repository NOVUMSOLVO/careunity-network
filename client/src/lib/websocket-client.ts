/**
 * Enhanced WebSocket client utility
 * Handles connection, reconnection and message dispatching
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Battery-optimized connection management for mobile devices
 * - Connection state management
 * - Message queuing during disconnections
 * - Heartbeat mechanism to detect stale connections
 */

type MessageHandler = (message: any) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

// WebSocket client options
export interface WebSocketClientOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
  mobileOptimization?: boolean;
  queueOfflineMessages?: boolean;
  maxQueueSize?: number;
  connectionTimeout?: number;
}

// Default options
const DEFAULT_OPTIONS: WebSocketClientOptions = {
  autoReconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  debug: false,
  mobileOptimization: true,
  queueOfflineMessages: true,
  maxQueueSize: 100,
  connectionTimeout: 10000
};

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private options: WebSocketClientOptions;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts: number = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private connectionTimer: number | null = null;
  private messageQueue: any[] = [];
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private isMobile: boolean = false;
  private isBackgrounded: boolean = false;
  private lastActivity: number = Date.now();
  private isLowBatteryMode: boolean = false;

  /**
   * Create a new WebSocket client
   * @param url WebSocket URL to connect to
   * @param options WebSocket client options
   */
  constructor(url: string, options: Partial<WebSocketClientOptions> = {}) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Check if we're on a mobile device
    if (typeof window !== 'undefined') {
      this.isMobile = 'ontouchstart' in window ||
                      navigator.maxTouchPoints > 0 ||
                      (navigator as any).msMaxTouchPoints > 0;

      // Listen for visibility change events to optimize for backgrounded apps
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Listen for battery status if available
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          this.isLowBatteryMode = battery.level <= 0.15;

          battery.addEventListener('levelchange', () => {
            this.isLowBatteryMode = battery.level <= 0.15;
            this.log(`Battery level changed: ${battery.level}, low battery mode: ${this.isLowBatteryMode}`);

            // Adjust heartbeat interval based on battery level
            this.updateHeartbeatInterval();
          });
        });
      }
    }
  }

  /**
   * Get the current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.log('WebSocket already connected');
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    try {
      this.setStatus(ConnectionStatus.CONNECTING);
      this.log(`Connecting to ${this.url}`);
      this.socket = new WebSocket(this.url);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      // Set connection timeout
      this.connectionTimer = window.setTimeout(() => {
        if (this.status === ConnectionStatus.CONNECTING) {
          this.log('Connection timeout');
          this.disconnect();
          this.attemptReconnect();
        }
      }, this.options.connectionTimeout);
    } catch (error) {
      this.log('Failed to create WebSocket:', error);
      this.setStatus(ConnectionStatus.FAILED);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.clearTimers();

    if (this.socket) {
      // Remove event handlers to avoid memory leaks
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;

      // Close the connection
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }

      this.socket = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Send a message to the WebSocket server
   * @param message Message to send
   * @returns Whether the message was sent or queued successfully
   */
  send(message: any): boolean {
    // Update last activity timestamp
    this.lastActivity = Date.now();

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.sendMessage(message);
    } else if (this.options.queueOfflineMessages) {
      this.queueMessage(message);
      return true;
    } else {
      this.log('Cannot send message, WebSocket is not connected');
      return false;
    }
  }

  /**
   * Send a message directly to the WebSocket server
   * @param message Message to send
   * @returns Whether the message was sent successfully
   */
  private sendMessage(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (this.options.queueOfflineMessages) {
        this.queueMessage(message);
        return true;
      }
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageStr);
      this.log(`Sent message: ${messageStr.substring(0, 100)}${messageStr.length > 100 ? '...' : ''}`);
      return true;
    } catch (error) {
      this.log('Error sending message:', error);

      if (this.options.queueOfflineMessages) {
        this.queueMessage(message);
        return true;
      }

      return false;
    }
  }

  /**
   * Queue a message to be sent when the connection is restored
   * @param message Message to queue
   */
  private queueMessage(message: any): void {
    // Don't queue heartbeat messages
    if (message && message.type === 'heartbeat') {
      return;
    }

    // Enforce queue size limit
    if (this.messageQueue.length >= this.options.maxQueueSize!) {
      this.messageQueue.shift(); // Remove oldest message
    }

    this.messageQueue.push(message);
    this.log(`Queued message (queue size: ${this.messageQueue.length})`);
  }

  /**
   * Subscribe to messages
   * @param handler Function to call when a message is received
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to connection status changes
   * @param handler Function to call when connection status changes
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Call immediately with current status
    handler(this.status);
    return () => this.statusHandlers.delete(handler);
  }

  /**
   * Process queued messages
   */
  private processQueue(): void {
    if (this.messageQueue.length === 0 || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.log(`Processing message queue (${this.messageQueue.length} messages)`);

    // Create a copy of the queue and clear it
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    // Send queued messages
    for (const message of queue) {
      this.sendMessage(message);
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.log('WebSocket connection established');
    this.reconnectAttempts = 0;
    this.setStatus(ConnectionStatus.CONNECTED);

    // Clear connection timeout
    if (this.connectionTimer !== null) {
      window.clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // Start heartbeat
    this.startHeartbeat();

    // Process queued messages
    this.processQueue();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    // Update last activity timestamp
    this.lastActivity = Date.now();

    let data = event.data;

    // Try to parse JSON
    try {
      data = JSON.parse(data);
    } catch {
      // Keep as string if not valid JSON
    }

    // Notify all message handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.log('Error in message handler:', error);
      }
    });
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log('WebSocket connection closed:', event.code, event.reason);

    // Clear timers
    this.clearTimers();

    // Don't attempt to reconnect if this was a clean close
    if (this.status !== ConnectionStatus.DISCONNECTED && event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    } else {
      this.setStatus(ConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.log('WebSocket error:', event);
    this.setStatus(ConnectionStatus.FAILED);

    // Disconnect and reconnect
    this.disconnect();
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (!this.options.autoReconnect ||
        this.reconnectTimer !== null ||
        this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
      if (this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
        this.log(`Failed to reconnect after ${this.options.maxReconnectAttempts} attempts`);
        this.setStatus(ConnectionStatus.FAILED);
      }
      return;
    }

    // Calculate backoff delay with jitter
    const delay = Math.min(
      this.options.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts),
      30000
    ) * (0.9 + Math.random() * 0.2); // Add jitter

    this.log(`Scheduling WebSocket reconnection in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts})`);
    this.setStatus(ConnectionStatus.RECONNECTING);

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    // Calculate heartbeat interval based on device and battery status
    const interval = this.getHeartbeatInterval();

    this.heartbeatTimer = window.setInterval(() => {
      // Check if connection is stale
      const timeSinceLastActivity = Date.now() - this.lastActivity;

      if (timeSinceLastActivity > interval * 2) {
        this.log('Connection appears stale, reconnecting...');
        this.disconnect();
        this.attemptReconnect();
        return;
      }

      // Send heartbeat
      this.send({ type: 'heartbeat', timestamp: new Date().toISOString() });
    }, interval);

    this.log(`Started heartbeat (interval: ${interval}ms)`);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Update heartbeat interval based on current conditions
   */
  private updateHeartbeatInterval(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.heartbeatTimer !== null) {
      this.stopHeartbeat();
      this.startHeartbeat();
    }
  }

  /**
   * Get heartbeat interval based on device and battery status
   */
  private getHeartbeatInterval(): number {
    let interval = this.options.heartbeatInterval!;

    // Increase interval for mobile devices to save battery
    if (this.options.mobileOptimization && this.isMobile) {
      interval *= 1.5;

      // Further increase interval if the app is backgrounded
      if (this.isBackgrounded) {
        interval *= 3;
      }

      // Further increase interval if battery is low
      if (this.isLowBatteryMode) {
        interval *= 2;
      }
    }

    return interval;
  }

  /**
   * Set the connection status and notify handlers
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status;

    // Notify all status handlers
    this.statusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        this.log('Error in status handler:', error);
      }
    });
  }

  /**
   * Handle visibility change event
   */
  private handleVisibilityChange = (): void => {
    this.isBackgrounded = document.visibilityState === 'hidden';
    this.log(`App ${this.isBackgrounded ? 'backgrounded' : 'foregrounded'}`);

    if (this.options.mobileOptimization && this.isMobile) {
      if (this.isBackgrounded) {
        // Increase heartbeat interval when backgrounded
        this.updateHeartbeatInterval();
      } else {
        // App came to foreground, reconnect if needed
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          this.connect();
        } else {
          // Update heartbeat interval
          this.updateHeartbeatInterval();
        }
      }
    }
  };

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.log('Device came online');

    // Reconnect if not already connected
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect();
    }
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.log('Device went offline');

    // Disconnect but don't attempt to reconnect yet
    this.disconnect();
  };

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.connectionTimer !== null) {
      window.clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  /**
   * Log a message if debug is enabled
   * @param message Message to log
   * @param args Additional arguments
   */
  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[WebSocketClient] ${message}`, ...args);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.disconnect();

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    // Clear listeners
    this.messageHandlers.clear();
    this.statusHandlers.clear();
  }
}