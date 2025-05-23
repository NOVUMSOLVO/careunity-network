/**
 * WebSocket Hook
 *
 * This hook provides a React interface for the WebSocket client.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient, ConnectionStatus } from '@/lib/websocket-client';

// Create a WebSocket client instance
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
};

// WebSocket client options
const wsOptions: WebSocketClientOptions = {
  autoReconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  debug: process.env.NODE_ENV === 'development',
  mobileOptimization: true,
  queueOfflineMessages: true,
  maxQueueSize: 100,
  connectionTimeout: 10000
};

const wsClient = new WebSocketClient(getWebSocketUrl(), wsOptions);

// WebSocket hook options
interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: any) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

/**
 * WebSocket hook
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, onMessage, onStatusChange } = options;

  // State
  const [status, setStatus] = useState<ConnectionStatus>(wsClient.getStatus());
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Refs to store the latest callback functions
  const onMessageRef = useRef(onMessage);
  const onStatusChangeRef = useRef(onStatusChange);

  // Update refs when props change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onStatusChangeRef.current = onStatusChange;
  }, [onMessage, onStatusChange]);

  // Message handler
  const handleMessage = useCallback((message: any) => {
    setLastMessage(message);
    if (onMessageRef.current) {
      onMessageRef.current(message);
    }
  }, []);

  // Status change handler
  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    if (onStatusChangeRef.current) {
      onStatusChangeRef.current(newStatus);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    wsClient.connect();
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);

  // Send a message
  const send = useCallback((message: any): boolean => {
    return wsClient.send(message);
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Subscribe to messages
    const unsubscribeMessage = wsClient.onMessage(handleMessage);

    // Subscribe to status changes
    const unsubscribeStatus = wsClient.onStatusChange(handleStatusChange);

    // Connect if autoConnect is true
    if (autoConnect) {
      connect();
    }

    // Clean up
    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
    };
  }, [autoConnect, connect, handleMessage, handleStatusChange]);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    send,
    isConnected: status === ConnectionStatus.CONNECTED,
    isConnecting: status === ConnectionStatus.CONNECTING || status === ConnectionStatus.RECONNECTING,
    isDisconnected: status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.FAILED
  };
}

/**
 * Hook for subscribing to real-time allocation updates
 */
export function useAllocationUpdates() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'update' && message.channel === 'allocation') {
        // Handle allocation updates
        const allocationUpdate = message.payload;

        setAllocations((prevAllocations) => {
          // Check if this allocation already exists
          const existingIndex = prevAllocations.findIndex(a => a.id === allocationUpdate.id);

          if (existingIndex >= 0) {
            // Update existing allocation
            const newAllocations = [...prevAllocations];
            newAllocations[existingIndex] = {
              ...newAllocations[existingIndex],
              ...allocationUpdate
            };
            return newAllocations;
          } else {
            // Add new allocation
            return [...prevAllocations, allocationUpdate];
          }
        });
      }
    }
  });

  // Subscribe to allocation updates when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'allocation' }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        send({
          type: 'unsubscribe',
          payload: { channel: 'allocation' }
        });
      }
    };
  }, [isConnected, send]);

  return {
    allocations,
    lastUpdate: lastMessage
  };
}

/**
 * Hook for subscribing to real-time caregiver location updates
 */
export function useCaregiverLocations() {
  const [locations, setLocations] = useState<Record<number, any>>({});
  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'update' && message.channel === 'caregiver_locations') {
        // Handle location updates
        const locationUpdate = message.payload;

        setLocations((prevLocations) => ({
          ...prevLocations,
          [locationUpdate.caregiverId]: {
            ...prevLocations[locationUpdate.caregiverId],
            ...locationUpdate
          }
        }));
      }
    }
  });

  // Subscribe to caregiver location updates when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'caregiver_locations' }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        send({
          type: 'unsubscribe',
          payload: { channel: 'caregiver_locations' }
        });
      }
    };
  }, [isConnected, send]);

  return {
    locations,
    lastUpdate: lastMessage
  };
}

/**
 * Hook for collaborative allocation
 */
export function useCollaborativeAllocation() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [userActions, setUserActions] = useState<any[]>([]);
  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'update' && message.channel === 'allocation') {
        // Handle user presence and actions
        if (message.payload.activeUsers) {
          setActiveUsers(message.payload.activeUsers);
        }

        if (message.payload.action) {
          setUserActions((prevActions) => [
            ...prevActions,
            message.payload.action
          ].slice(-20)); // Keep only the last 20 actions
        }
      }
    }
  });

  // Subscribe to allocation updates when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'allocation' }
      });

      // Announce presence
      send({
        type: 'allocation_update',
        payload: {
          action: 'join',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        // Announce departure
        send({
          type: 'allocation_update',
          payload: {
            action: 'leave',
            timestamp: new Date().toISOString()
          }
        });

        send({
          type: 'unsubscribe',
          payload: { channel: 'allocation' }
        });
      }
    };
  }, [isConnected, send]);

  // Function to broadcast an allocation action
  const broadcastAction = useCallback((action: string, data: any) => {
    if (isConnected) {
      send({
        type: 'allocation_update',
        payload: {
          action,
          data,
          timestamp: new Date().toISOString()
        }
      });
      return true;
    }
    return false;
  }, [isConnected, send]);

  return {
    activeUsers,
    userActions,
    broadcastAction,
    isConnected
  };
}

/**
 * Hook for real-time notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'notification') {
        // Add new notification
        setNotifications((prevNotifications) => [
          message.payload,
          ...prevNotifications
        ]);

        // Increment unread count
        setUnreadCount((prevCount) => prevCount + 1);
      } else if (message && message.type === 'performance-alert') {
        // Add performance alert as a notification
        const alert = message.payload;
        const notification = {
          id: alert.id,
          type: 'performance_alert',
          title: `${alert.severity.toUpperCase()} Performance Alert`,
          message: alert.message,
          timestamp: new Date(alert.timestamp).toISOString(),
          read: false,
          data: alert
        };

        setNotifications((prevNotifications) => [
          notification,
          ...prevNotifications
        ]);

        // Increment unread count
        setUnreadCount((prevCount) => prevCount + 1);
      }
    }
  });

  // Subscribe to notifications when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'notifications' }
      });

      // Also subscribe to performance alerts for admin users
      // In a real implementation, check user role before subscribing
      send({
        type: 'subscribe',
        payload: { channel: 'performance_alerts' }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        send({
          type: 'unsubscribe',
          payload: { channel: 'notifications' }
        });

        send({
          type: 'unsubscribe',
          payload: { channel: 'performance_alerts' }
        });
      }
    };
  }, [isConnected, send]);

  // Mark notifications as read
  const markAsRead = useCallback((notificationIds: string[]) => {
    if (isConnected) {
      send({
        type: 'mark_notifications_read',
        payload: { notificationIds }
      });

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - notificationIds.length));
    }
  }, [isConnected, send]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (isConnected) {
      send({
        type: 'mark_all_notifications_read',
        payload: {}
      });

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    }
  }, [isConnected, send]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected
  };
}

/**
 * Hook for real-time service user updates
 */
export function useServiceUserUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);

  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'update' && message.channel === 'service_users') {
        // Handle service user updates
        const update = message.payload;

        setUpdates((prevUpdates) => [
          update,
          ...prevUpdates
        ].slice(0, 50)); // Keep only the last 50 updates
      }
    }
  });

  // Subscribe to service user updates when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'service_users' }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        send({
          type: 'unsubscribe',
          payload: { channel: 'service_users' }
        });
      }
    };
  }, [isConnected, send]);

  // Subscribe to updates for a specific service user
  const subscribeToServiceUser = useCallback((serviceUserId: number) => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: {
          channel: 'service_users',
          filter: { serviceUserId }
        }
      });
    }
  }, [isConnected, send]);

  // Unsubscribe from updates for a specific service user
  const unsubscribeFromServiceUser = useCallback((serviceUserId: number) => {
    if (isConnected) {
      send({
        type: 'unsubscribe',
        payload: {
          channel: 'service_users',
          filter: { serviceUserId }
        }
      });
    }
  }, [isConnected, send]);

  return {
    updates,
    subscribeToServiceUser,
    unsubscribeFromServiceUser,
    isConnected
  };
}

/**
 * Hook for performance alerts
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState<number>(0);

  const { isConnected, send, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message && message.type === 'performance-alert') {
        const alert = message.payload;

        setAlerts((prevAlerts) => {
          // Check if this alert already exists
          const existingIndex = prevAlerts.findIndex(a => a.id === alert.id);

          if (existingIndex >= 0) {
            // Update existing alert
            const newAlerts = [...prevAlerts];
            newAlerts[existingIndex] = alert;

            // Update unacknowledged count
            if (prevAlerts[existingIndex].acknowledged !== alert.acknowledged) {
              setUnacknowledgedCount((prevCount) =>
                alert.acknowledged ? Math.max(0, prevCount - 1) : prevCount + 1
              );
            }

            return newAlerts;
          } else {
            // Add new alert
            if (!alert.acknowledged) {
              setUnacknowledgedCount((prevCount) => prevCount + 1);
            }

            return [alert, ...prevAlerts];
          }
        });
      }
    }
  });

  // Subscribe to performance alerts when connected
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'subscribe',
        payload: { channel: 'performance_alerts' }
      });
    }

    // Clean up
    return () => {
      if (isConnected) {
        send({
          type: 'unsubscribe',
          payload: { channel: 'performance_alerts' }
        });
      }
    };
  }, [isConnected, send]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    if (isConnected) {
      send({
        type: 'performance_alert_ack',
        payload: { alertId }
      });

      // Optimistically update local state
      setAlerts((prevAlerts) =>
        prevAlerts.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true }
            : alert
        )
      );

      // Update unacknowledged count
      setUnacknowledgedCount((prevCount) => Math.max(0, prevCount - 1));

      return true;
    }
    return false;
  }, [isConnected, send]);

  return {
    alerts,
    unacknowledgedCount,
    acknowledgeAlert,
    isConnected
  };
}
