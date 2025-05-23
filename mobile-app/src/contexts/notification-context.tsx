import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from './auth-context';

export interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'care-plan' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  pushToken: string | null;
  requestPushPermissions: () => Promise<boolean>;
  isPushEnabled: boolean;
  togglePushNotifications: (enabled: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Load notifications from storage on initial load
  useEffect(() => {
    if (user) {
      loadNotifications();
      checkPushSettings();
    }
  }, [user]);

  // Register for push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  // Listen for incoming notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as any;
      
      // Create a notification object from the received push notification
      const newNotification: Notification = {
        id: notification.request.identifier,
        type: data.type || 'system',
        title: notification.request.content.title || '',
        message: notification.request.content.body || '',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: data.actionUrl,
        sender: data.sender,
      };
      
      addNotificationToState(newNotification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Load notifications from storage
  const loadNotifications = async () => {
    if (user) {
      try {
        const storedNotifications = await AsyncStorage.getItem(`notifications_${user.id}`);
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  };

  // Save notifications to storage
  const saveNotifications = async (notificationsToSave: Notification[]) => {
    if (user) {
      try {
        await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    }
  };

  // Check push notification settings
  const checkPushSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('push_notifications_enabled');
      setIsPushEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking push settings:', error);
    }
  };

  // Register for push notifications
  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Push notifications are not available in the simulator');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // If not determined, ask for permission
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      // If not granted, exit
      if (finalStatus !== 'granted') {
        return;
      }
      
      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      const token = tokenData.data;
      setPushToken(token);
      
      // Register token with server
      if (isAuthenticated && token) {
        await axios.post(`${API_URL}/api/notifications/register-device`, {
          token,
          platform: Platform.OS,
        });
      }
      
      // Configure Android channel
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Request push notification permissions
  const requestPushPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.log('Push notifications are not available in the simulator');
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  };

  // Toggle push notifications
  const togglePushNotifications = async (enabled: boolean) => {
    try {
      setIsPushEnabled(enabled);
      await AsyncStorage.setItem('push_notifications_enabled', enabled.toString());
      
      if (enabled && !pushToken) {
        await registerForPushNotifications();
      }
      
      // Update server with preference
      if (isAuthenticated) {
        await axios.post(`${API_URL}/api/notifications/preferences`, {
          pushEnabled: enabled,
        });
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
    }
  };

  // Generate a unique ID for notifications
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Add notification to state and storage
  const addNotificationToState = (notification: Notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev];
      saveNotifications(updated);
      return updated;
    });
    
    setUnreadCount(prev => prev + 1);
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    addNotificationToState(newNotification);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      );
      saveNotifications(updated);
      return updated;
    });
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      saveNotifications(updated);
      return updated;
    });
    
    setUnreadCount(0);
  };

  // Clear a notification
  const clearNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      saveNotifications(updated);
      return updated;
    });
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    
    if (user) {
      AsyncStorage.removeItem(`notifications_${user.id}`);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
    pushToken,
    requestPushPermissions,
    isPushEnabled,
    togglePushNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
