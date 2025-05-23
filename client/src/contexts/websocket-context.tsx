import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketClient, ConnectionStatus } from '@/lib/websocket-client';

// Context type definition
type WebSocketContextType = {
  client: WebSocketClient | null;
  connected: boolean;
  connectionStatus: ConnectionStatus;
  lastMessage: any;
  sendMessage: (message: any) => boolean;
};

// Initialize context with defaults
const WebSocketContext = createContext<WebSocketContextType>({
  client: null,
  connected: false,
  connectionStatus: ConnectionStatus.DISCONNECTED,
  lastMessage: null,
  sendMessage: () => false,
});

// Define provider props
interface WebSocketProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps parts of the app that need WebSocket communication
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  // Store the WebSocket client
  const [client, setClient] = useState<WebSocketClient | null>(null);
  
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  
  // Store the last received message
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Initialize the WebSocket client
  useEffect(() => {
    // Create WebSocket URL
    const isProduction = process.env.NODE_ENV === 'production';
    let wsUrl: string;

    if (isProduction) {
      // In production, assume WebSocket is served on the same host/port as the HTTP/S server,
      // but on the /ws path.
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // In development, explicitly target the backend server (e.g., localhost:5000)
      // The README states the dev server runs on http://localhost:5000
      // Assuming WebSocket server is also there.
      const backendHost = 'localhost:5000'; // Or use an environment variable like process.env.REACT_APP_WEBSOCKET_HOST
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; // Or determine based on backend config
      wsUrl = `${protocol}//${backendHost}/ws`;
    }
    
    console.log(`Initializing WebSocket connection to ${wsUrl}`);
    
    // Create new client
    const newClient = new WebSocketClient(wsUrl);
    
    // Subscribe to messages
    const messageUnsubscribe = newClient.onMessage(message => {
      console.log('WebSocket message received:', message);
      setLastMessage(message);
    });
    
    // Subscribe to status changes
    const statusUnsubscribe = newClient.onStatusChange(status => {
      console.log('WebSocket status changed:', status);
      setConnectionStatus(status);
    });
    
    // Connect to the server
    newClient.connect();
    
    // Store the client
    setClient(newClient);
    
    // Clean up on unmount
    return () => {
      messageUnsubscribe();
      statusUnsubscribe();
      newClient.disconnect();
    };
  }, []);
  
  // Helper function to check if connected
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  
  // Helper function to send a message
  const sendMessage = (message: any): boolean => {
    if (!client || !connected) {
      console.warn('Cannot send message, WebSocket not connected');
      return false;
    }
    
    return client.send(message);
  };
  
  // Create the context value
  const contextValue: WebSocketContextType = {
    client,
    connected,
    connectionStatus,
    lastMessage,
    sendMessage,
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access the WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}