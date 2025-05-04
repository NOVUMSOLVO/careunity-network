import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useToast } from './use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  sticky?: boolean;
  createdAt: Date;
  actionLabel?: string;
  actionFn?: () => void;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Remove notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = uuid();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Use Toast for displaying the notification
    toast({
      variant: notification.type === 'error' ? 'destructive' : 'default',
      title: notification.title,
      description: notification.message,
      action: notification.actionLabel && notification.actionFn ? {
        label: notification.actionLabel,
        onClick: notification.actionFn
      } : undefined,
    });

    // Auto remove non-sticky notifications after their duration
    if (!notification.sticky && notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [removeNotification, toast]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clean up expired notifications
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setNotifications(prev => 
        prev.filter(notification => {
          if (notification.sticky) return true;
          if (!notification.duration) return true;
          
          const expiryTime = new Date(notification.createdAt);
          expiryTime.setMilliseconds(expiryTime.getMilliseconds() + notification.duration);
          return now < expiryTime;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Helper functions for common notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
      ...options,
    });
  }, [addNotification]);
};

export const useErrorNotification = () => {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
      ...options,
    });
  }, [addNotification]);
};

export const useWarningNotification = () => {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options,
    });
  }, [addNotification]);
};

export const useInfoNotification = () => {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options,
    });
  }, [addNotification]);
};