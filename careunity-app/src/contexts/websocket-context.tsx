import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WebSocketContextType {
  connected: boolean;
  messages: any[];
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Create WebSocket connection
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
    const ws = new WebSocket(wsUrl);

    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setConnected(true);
    });

    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Connection closed
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    });

    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    });

    setSocket(ws);

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send messages
  const sendMessage = (message: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  };

  const value = {
    connected,
    messages,
    sendMessage,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
