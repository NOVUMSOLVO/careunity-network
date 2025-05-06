import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import websocketClient from '@/lib/websocket-client';

// Define the shape of our context
interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (message: any) => boolean;
}

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
  sendMessage: () => false,
});

// Provider component
interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    // Set up event listeners when the component mounts
    const disconnectHandler = websocketClient.on('connect', () => {
      setIsConnected(true);
    });

    const messageHandler = websocketClient.on('message', (data: any) => {
      setLastMessage(data);
    });

    const closeHandler = websocketClient.on('disconnect', () => {
      setIsConnected(false);
    });

    // Try to connect if not already connected
    websocketClient.connect();

    // Clean up event listeners when the component unmounts
    return () => {
      disconnectHandler();
      messageHandler();
      closeHandler();
    };
  }, []);

  // Function to send a message
  const sendMessage = (message: any): boolean => {
    return websocketClient.send(message);
  };

  // Create the context value object
  const contextValue: WebSocketContextType = {
    isConnected,
    lastMessage,
    sendMessage,
  };

  // Provide the context to children
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook for easy consumption of the context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};