/**
 * Enhanced WebSocket Service
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Battery-optimized connection management for mobile devices
 * - Connection state management
 * - Message queuing during disconnections
 * - Typed event system
 * - Heartbeat mechanism to detect stale connections
 */

import { useDevice } from '@/hooks/use-mobile';

// WebSocket message types
export enum MessageType {
  AUTH = 'authenticate',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  HEARTBEAT = 'heartbeat',
  ALLOCATION_UPDATE = 'allocation_update',
  VISIT_UPDATE = 'visit_update',
  CAREGIVER_LOCATION = 'caregiver_location',
  MODEL_UPDATED = 'model_updated',
  MODEL_PERFORMANCE = 'model_performance',
  NOTIFICATION = 'notification',
  ERROR = 'error'
}

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket message interface
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: string;
}

// WebSocket service options
export interface WebSocketServiceOptions {
  url: string;
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
const DEFAULT_OPTIONS: WebSocketServiceOptions = {
  url: '',
  autoReconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  debug: false,
  mobileOptimization: true,
  queueOfflineMessages: true,
  maxQueueSize: 100,
  connectionTimeout: 10000
};

/**
 * Enhanced WebSocket Service
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private options: WebSocketServiceOptions;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private connectionTimer: number | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private isMobile: boolean = false;
  private isBackgrounded: boolean = false;
  private lastActivity: number = Date.now();
  private isLowBatteryMode: boolean = false;
  
  /**
   * Create a new WebSocket service
   * @param options WebSocket service options
   */
  constructor(options: WebSocketServiceOptions) {
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
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket) {
      this.disconnect();
    }
    
    this.setConnectionState(ConnectionState.CONNECTING);
    
    try {
      this.log(`Connecting to ${this.options.url}`);
      this.socket = new WebSocket(this.options.url);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen;
      this.socket.onclose = this.handleClose;
      this.socket.onerror = this.handleError;
      this.socket.onmessage = this.handleMessage;
      
      // Set connection timeout
      this.connectionTimer = window.setTimeout(() => {
        if (this.connectionState === ConnectionState.CONNECTING) {
          this.log('Connection timeout');
          this.disconnect();
          this.reconnect();
        }
      }, this.options.connectionTimeout);
    } catch (error) {
      this.log('Connection error:', error);
      this.setConnectionState(ConnectionState.ERROR);
      this.reconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.clearTimers();
    
    if (this.socket) {
      // Remove event handlers to avoid memory leaks
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      
      // Close the connection
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      
      this.socket = null;
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }
  
  /**
   * Reconnect to the WebSocket server with exponential backoff
   */
  private reconnect(): void {
    if (!this.options.autoReconnect || 
        this.reconnectTimer !== null || 
        this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
      return;
    }
    
    this.setConnectionState(ConnectionState.RECONNECTING);
    
    // Calculate backoff delay with jitter
    const delay = Math.min(
      this.options.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts),
      30000
    ) * (0.9 + Math.random() * 0.2); // Add jitter
    
    this.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Send a message to the WebSocket server
   * @param type Message type
   * @param payload Message payload
   */
  public send(type: MessageType, payload: any = {}): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    
    // Update last activity timestamp
    this.lastActivity = Date.now();
    
    if (this.isConnected()) {
      this.sendMessage(message);
    } else if (this.options.queueOfflineMessages) {
      this.queueMessage(message);
    }
  }
  
  /**
   * Send a message directly to the WebSocket server
   * @param message WebSocket message
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (this.options.queueOfflineMessages) {
        this.queueMessage(message);
      }
      return;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      this.log(`Sent message: ${message.type}`);
    } catch (error) {
      this.log('Error sending message:', error);
      
      if (this.options.queueOfflineMessages) {
        this.queueMessage(message);
      }
    }
  }
  
  /**
   * Queue a message to be sent when the connection is restored
   * @param message WebSocket message
   */
  private queueMessage(message: WebSocketMessage): void {
    // Don't queue heartbeat messages
    if (message.type === MessageType.HEARTBEAT) {
      return;
    }
    
    // Enforce queue size limit
    if (this.messageQueue.length >= this.options.maxQueueSize!) {
      this.messageQueue.shift(); // Remove oldest message
    }
    
    this.messageQueue.push(message);
    this.log(`Queued message: ${message.type} (queue size: ${this.messageQueue.length})`);
  }
  
  /**
   * Process queued messages
   */
  private processQueue(): void {
    if (this.messageQueue.length === 0 || !this.isConnected()) {
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
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Set the connection state and notify listeners
   * @param state New connection state
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.notifyStateListeners();
    }
  }
  
  /**
   * Notify state listeners of connection state change
   */
  private notifyStateListeners(): void {
    for (const listener of this.stateListeners) {
      try {
        listener(this.connectionState);
      } catch (error) {
        this.log('Error in state listener:', error);
      }
    }
  }
  
  /**
   * Add a connection state listener
   * @param listener Connection state listener
   */
  public addStateListener(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    
    // Return a function to remove the listener
    return () => {
      this.stateListeners.delete(listener);
    };
  }
  
  /**
   * Add an event listener
   * @param type Event type
   * @param listener Event listener
   */
  public addEventListener(type: MessageType, listener: (data: any) => void): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    
    this.eventListeners.get(type)!.add(listener);
    
    // Return a function to remove the listener
    return () => {
      const listeners = this.eventListeners.get(type);
      if (listeners) {
        listeners.delete(listener);
        
        if (listeners.size === 0) {
          this.eventListeners.delete(type);
        }
      }
    };
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen = (): void => {
    this.log('Connection established');
    this.setConnectionState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Clear connection timeout
    if (this.connectionTimer !== null) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Process queued messages
    this.processQueue();
  };
  
  /**
   * Handle WebSocket close event
   */
  private handleClose = (event: CloseEvent): void => {
    this.log(`Connection closed: ${event.code} ${event.reason}`);
    this.setConnectionState(ConnectionState.DISCONNECTED);
    
    // Clear timers
    this.clearTimers();
    
    // Reconnect if not a clean close
    if (event.code !== 1000 && event.code !== 1001) {
      this.reconnect();
    }
  };
  
  /**
   * Handle WebSocket error event
   */
  private handleError = (event: Event): void => {
    this.log('WebSocket error:', event);
    this.setConnectionState(ConnectionState.ERROR);
    
    // Disconnect and reconnect
    this.disconnect();
    this.reconnect();
  };
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      this.log(`Received message: ${message.type}`);
      
      // Update last activity timestamp
      this.lastActivity = Date.now();
      
      // Notify event listeners
      this.notifyEventListeners(message);
    } catch (error) {
      this.log('Error parsing message:', error);
    }
  };
  
  /**
   * Notify event listeners of a message
   * @param message WebSocket message
   */
  private notifyEventListeners(message: WebSocketMessage): void {
    const listeners = this.eventListeners.get(message.type);
    
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(message.payload);
        } catch (error) {
          this.log('Error in event listener:', error);
        }
      }
    }
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
        this.reconnect();
        return;
      }
      
      // Send heartbeat
      this.send(MessageType.HEARTBEAT);
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
    if (this.isConnected() && this.heartbeatTimer !== null) {
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
        if (!this.isConnected() && this.connectionState !== ConnectionState.CONNECTING) {
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
    if (!this.isConnected() && this.connectionState !== ConnectionState.CONNECTING) {
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
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimer !== null) {
      clearTimeout(this.connectionTimer);
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
      console.log(`[WebSocketService] ${message}`, ...args);
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
    this.eventListeners.clear();
    this.stateListeners.clear();
  }
}

// Create and export a default instance
export const websocketService = new WebSocketService({
  url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
  debug: process.env.NODE_ENV === 'development',
  mobileOptimization: true
});
