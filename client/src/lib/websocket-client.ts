/**
 * WebSocket client utility
 * Handles connection, reconnection and message dispatching
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

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeouts: number[] = [1000, 1500, 2250, 3000, 5000]; // Increasing timeouts
  private reconnectTimer: number | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  
  /**
   * Create a new WebSocket client
   * @param url WebSocket URL to connect to
   */
  constructor(url: string) {
    this.url = url;
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
      console.log('WebSocket already connected');
      return;
    }
    
    try {
      this.setStatus(ConnectionStatus.CONNECTING);
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.setStatus(ConnectionStatus.FAILED);
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }
  
  /**
   * Send a message to the WebSocket server
   * @param message Message to send
   */
  send(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message, WebSocket is not connected');
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
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
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;
    this.setStatus(ConnectionStatus.CONNECTED);
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
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
        console.error('Error in message handler:', error);
      }
    });
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code);
    
    if (this.status !== ConnectionStatus.DISCONNECTED) {
      this.attemptReconnect();
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    // Don't set failed here, let the close handler determine the final state
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      this.setStatus(ConnectionStatus.FAILED);
      return;
    }
    
    const delay = this.reconnectTimeouts[this.reconnectAttempts] || 5000;
    
    console.log(`Scheduling WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    this.setStatus(ConnectionStatus.RECONNECTING);
    
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
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
        console.error('Error in status handler:', error);
      }
    });
  }
}