/**
 * ML Models WebSocket Service
 * 
 * Provides real-time updates for ML models using WebSockets.
 */

import { create } from 'zustand';
import { isOnline } from '@/lib/network-status';

// WebSocket connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket message types
export enum MessageType {
  MODEL_UPDATED = 'model_updated',
  MODEL_PERFORMANCE_CHANGED = 'model_performance_changed',
  MODEL_DRIFT_DETECTED = 'model_drift_detected',
  MODEL_TRAINING_COMPLETED = 'model_training_completed',
  MODEL_DEPLOYED = 'model_deployed',
  PREDICTION_FEEDBACK = 'prediction_feedback',
  RETRAIN_SUGGESTED = 'retrain_suggested'
}

// WebSocket message interface
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: string;
}

// WebSocket store state
interface WebSocketState {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  messages: WebSocketMessage[];
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  clearMessages: () => void;
}

// Create WebSocket store
export const useMLModelsWebSocket = create<WebSocketState>((set, get) => {
  // WebSocket instance
  let socket: WebSocket | null = null;
  
  // Reconnection settings
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  
  // Create WebSocket connection
  const createWebSocket = () => {
    // Don't try to connect if offline
    if (!isOnline()) {
      set({ connectionState: ConnectionState.ERROR });
      console.log('Cannot connect to WebSocket: offline');
      return;
    }
    
    try {
      // Close existing connection if any
      if (socket) {
        socket.close();
      }
      
      // Set connecting state
      set({ connectionState: ConnectionState.CONNECTING });
      
      // Create new WebSocket connection
      // Use secure WebSocket if in production
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      socket = new WebSocket(`${protocol}//${host}/api/v2/ml-models/ws`);
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        set({ connectionState: ConnectionState.CONNECTED });
        reconnectAttempts = 0;
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        
        // Don't reconnect if we closed it intentionally
        if (get().connectionState !== ConnectionState.DISCONNECTED) {
          handleReconnect();
        }
      });
      
      // Connection error
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        set({ connectionState: ConnectionState.ERROR });
        handleReconnect();
      });
      
      // Message received
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          // Add timestamp if not provided
          if (!message.timestamp) {
            message.timestamp = new Date().toISOString();
          }
          
          // Update state with new message
          set((state) => ({
            lastMessage: message,
            messages: [...state.messages, message]
          }));
          
          // Log message
          console.log('WebSocket message received:', message);
          
          // Dispatch custom event for components to listen to
          window.dispatchEvent(new CustomEvent('ml-models-ws-message', {
            detail: message
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      set({ connectionState: ConnectionState.ERROR });
    }
  };
  
  // Handle reconnection
  const handleReconnect = () => {
    // Don't try to reconnect if we've reached the maximum attempts
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      set({ connectionState: ConnectionState.ERROR });
      return;
    }
    
    // Don't try to reconnect if offline
    if (!isOnline()) {
      set({ connectionState: ConnectionState.ERROR });
      console.log('Cannot reconnect to WebSocket: offline');
      return;
    }
    
    // Set reconnecting state
    set({ connectionState: ConnectionState.RECONNECTING });
    
    // Increment reconnect attempts
    reconnectAttempts++;
    
    // Clear existing timeout
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    
    // Set timeout for reconnection
    console.log(`Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
    reconnectTimeout = setTimeout(() => {
      createWebSocket();
    }, reconnectInterval);
  };
  
  // Return store methods and initial state
  return {
    connectionState: ConnectionState.DISCONNECTED,
    lastMessage: null,
    messages: [],
    
    // Connect to WebSocket
    connect: () => {
      createWebSocket();
    },
    
    // Disconnect from WebSocket
    disconnect: () => {
      if (socket) {
        set({ connectionState: ConnectionState.DISCONNECTED });
        socket.close();
        socket = null;
      }
      
      // Clear reconnect timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    },
    
    // Reconnect to WebSocket
    reconnect: () => {
      reconnectAttempts = 0;
      createWebSocket();
    },
    
    // Send message to WebSocket
    sendMessage: (message: Partial<WebSocketMessage>) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const fullMessage: WebSocketMessage = {
          type: message.type || MessageType.MODEL_UPDATED,
          payload: message.payload || {},
          timestamp: message.timestamp || new Date().toISOString()
        };
        
        socket.send(JSON.stringify(fullMessage));
      } else {
        console.error('Cannot send message: WebSocket not connected');
      }
    },
    
    // Clear messages
    clearMessages: () => {
      set({ messages: [] });
    }
  };
});

// Initialize WebSocket connection
export function initMLModelsWebSocket() {
  // Connect to WebSocket
  useMLModelsWebSocket.getState().connect();
  
  // Set up event listeners for online/offline events
  const handleOnline = () => {
    console.log('Online, reconnecting WebSocket');
    useMLModelsWebSocket.getState().reconnect();
  };
  
  const handleOffline = () => {
    console.log('Offline, disconnecting WebSocket');
    useMLModelsWebSocket.getState().disconnect();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    useMLModelsWebSocket.getState().disconnect();
  };
}
