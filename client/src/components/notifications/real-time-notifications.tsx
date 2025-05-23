/**
 * Real-time Notifications Component
 * 
 * This component displays real-time notifications received via WebSocket.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../contexts/websocket-context';
import { useOffline } from '../../contexts/offline-context';
import { logger } from '../../utils/logger';

// Notification types
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: any;
}

// Component props
interface RealTimeNotificationsProps {
  maxNotifications?: number;
  autoHideAfter?: number; // in milliseconds
  showUnreadCount?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Real-time notifications component
 */
export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({
  maxNotifications = 5,
  autoHideAfter = 5000,
  showUnreadCount = true,
  className = '',
  style = {},
}) => {
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Get WebSocket context
  const { isConnected, subscribe, lastMessage } = useWebSocket();
  
  // Get offline context
  const { isOnline } = useOffline();
  
  // Handle new notification
  const handleNewNotification = useCallback((message: any) => {
    if (message.type !== 'notification' || !message.payload) {
      return;
    }
    
    const { title, message: content, type, link, data } = message.payload;
    
    // Create new notification
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'Notification',
      message: content || 'You have a new notification',
      type: type || NotificationType.INFO,
      timestamp: new Date(),
      read: false,
      link,
      data,
    };
    
    // Add notification to state
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    
    // Update unread count
    setUnreadCount((prev) => prev + 1);
    
    // Auto-expand when receiving a notification
    setExpanded(true);
    
    // Log notification
    logger.info(`New notification received: ${newNotification.title}`);
    
    // Show browser notification if supported and page is not visible
    if ('Notification' in window && document.visibilityState !== 'visible') {
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [maxNotifications]);
  
  // Subscribe to notifications channel
  useEffect(() => {
    if (isConnected && isOnline) {
      const unsubscribe = subscribe('notifications', handleNewNotification);
      
      return () => {
        unsubscribe();
      };
    }
  }, [isConnected, isOnline, subscribe, handleNewNotification]);
  
  // Handle last message
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      handleNewNotification(lastMessage);
    }
  }, [lastMessage, handleNewNotification]);
  
  // Auto-hide notifications after a delay
  useEffect(() => {
    if (expanded && autoHideAfter > 0) {
      const timer = setTimeout(() => {
        setExpanded(false);
      }, autoHideAfter);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [expanded, notifications, autoHideAfter]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);
  
  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      const newNotifications = prev.filter((n) => n.id !== id);
      
      // Update unread count if the notification was unread
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      return newNotifications;
    });
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);
  
  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate to link if provided
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  }, [markAsRead]);
  
  // Render notification item
  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="notification-header">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-time">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      </div>
      <div className="notification-message">{notification.message}</div>
      <button
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification.id);
        }}
      >
        &times;
      </button>
    </div>
  );
  
  // Don't render if no notifications and not showing unread count
  if (notifications.length === 0 && !showUnreadCount) {
    return null;
  }
  
  return (
    <div
      className={`real-time-notifications ${expanded ? 'expanded' : 'collapsed'} ${className}`}
      style={style}
    >
      {/* Notification toggle button */}
      <button
        className={`notification-toggle ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="notification-icon">🔔</span>
        {showUnreadCount && unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
        )}
      </button>
      
      {/* Notification panel */}
      {expanded && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button className="mark-read-button" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="clear-button" onClick={clearNotifications}>
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map(renderNotificationItem)
            ) : (
              <div className="no-notifications">No notifications</div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .real-time-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .notification-toggle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #fff;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .notification-toggle:hover {
          background-color: #f5f5f5;
        }
        
        .notification-toggle.has-unread {
          background-color: #4f46e5;
          color: white;
        }
        
        .notification-icon {
          font-size: 18px;
        }
        
        .unread-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-panel {
          position: absolute;
          top: 50px;
          right: 0;
          width: 320px;
          max-height: 400px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .notification-panel-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .notification-panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .notification-actions {
          display: flex;
          gap: 8px;
        }
        
        .notification-actions button {
          background: none;
          border: none;
          font-size: 12px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
        }
        
        .notification-actions button:hover {
          color: #4f46e5;
          text-decoration: underline;
        }
        
        .notification-list {
          overflow-y: auto;
          max-height: 340px;
        }
        
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s ease;
        }
        
        .notification-item:hover {
          background-color: #f9fafb;
        }
        
        .notification-item.unread {
          background-color: #f0f7ff;
        }
        
        .notification-item.unread:hover {
          background-color: #e0f0ff;
        }
        
        .notification-item.info {
          border-left: 4px solid #3b82f6;
        }
        
        .notification-item.success {
          border-left: 4px solid #10b981;
        }
        
        .notification-item.warning {
          border-left: 4px solid #f59e0b;
        }
        
        .notification-item.error {
          border-left: 4px solid #ef4444;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .notification-title {
          font-weight: 600;
          font-size: 14px;
        }
        
        .notification-time {
          font-size: 12px;
          color: #6b7280;
        }
        
        .notification-message {
          font-size: 13px;
          color: #4b5563;
          word-break: break-word;
        }
        
        .notification-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #e5e7eb;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .notification-item:hover .notification-close {
          opacity: 1;
        }
        
        .no-notifications {
          padding: 16px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        
        @media (max-width: 640px) {
          .real-time-notifications {
            top: 10px;
            right: 10px;
          }
          
          .notification-panel {
            width: 300px;
            right: -10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RealTimeNotifications;
