/**
 * WebSocket client utility for the application.
 * This handles WebSocket connections and reconnection logic.
 */

// Custom WebSocket connection setup for HMR and application events
class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Record<string, Function[]> = {};
  private isConnecting = false;

  /**
   * Initialize the WebSocket connection
   */
  public connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Using relative path for WebSocket connection to avoid localhost issues
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect the WebSocket
   */
  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Send a message through the WebSocket
   */
  public send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Subscribe to a WebSocket event
   */
  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen() {
    console.log("WebSocket connection established");
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connect');
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.socket = null;
    this.isConnecting = false;
    this.emit('disconnect', event);
    
    // Only reconnect if it wasn't a clean close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event) {
    console.error("WebSocket error:", error);
    this.isConnecting = false;
    this.emit('error', error);
  }

  /**
   * Handle WebSocket messages
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      this.emit('message', data);
      
      // Also emit specific event types
      if (data && data.type) {
        this.emit(data.type, data.payload);
      }
    } catch (error) {
      // Handle non-JSON messages
      this.emit('message', event.data);
    }
  }

  /**
   * Emit events to listeners
   */
  private emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in WebSocket ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectTimer || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    
    console.log(`Scheduling WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

// Create a singleton instance
export const websocketClient = new WebSocketClient();

// Auto-connect when the module is imported
if (typeof window !== 'undefined') {
  // Delay connection slightly to allow the application to initialize
  setTimeout(() => {
    websocketClient.connect();
  }, 500);
}

export default websocketClient;