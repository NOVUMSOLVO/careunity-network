/**
 * Push Notification Service
 * 
 * Provides push notification functionality for the mobile app.
 * Features:
 * - Push notification registration
 * - Notification handling
 * - Notification preferences
 * - Background notification processing
 * - Deep linking
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import axios from 'axios';

// Storage keys
const STORAGE_KEYS = {
  NOTIFICATION_TOKEN: 'notification_token',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  NOTIFICATION_HISTORY: 'notification_history',
};

// Notification categories
export enum NotificationCategory {
  APPOINTMENT = 'appointment',
  TASK = 'task',
  CARE_PLAN = 'care_plan',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

// Notification preference interface
export interface NotificationPreference {
  category: NotificationCategory;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  importance: Notifications.AndroidImportance;
}

// Notification history item interface
export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  data: any;
  category: NotificationCategory;
  timestamp: number;
  read: boolean;
}

// Default notification preferences
const DEFAULT_PREFERENCES: Record<NotificationCategory, NotificationPreference> = {
  [NotificationCategory.APPOINTMENT]: {
    category: NotificationCategory.APPOINTMENT,
    enabled: true,
    sound: true,
    vibration: true,
    importance: Notifications.AndroidImportance.HIGH,
  },
  [NotificationCategory.TASK]: {
    category: NotificationCategory.TASK,
    enabled: true,
    sound: true,
    vibration: true,
    importance: Notifications.AndroidImportance.HIGH,
  },
  [NotificationCategory.CARE_PLAN]: {
    category: NotificationCategory.CARE_PLAN,
    enabled: true,
    sound: true,
    vibration: true,
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  [NotificationCategory.MESSAGE]: {
    category: NotificationCategory.MESSAGE,
    enabled: true,
    sound: true,
    vibration: true,
    importance: Notifications.AndroidImportance.HIGH,
  },
  [NotificationCategory.SYSTEM]: {
    category: NotificationCategory.SYSTEM,
    enabled: true,
    sound: false,
    vibration: false,
    importance: Notifications.AndroidImportance.LOW,
  },
};

/**
 * Configure notification settings
 */
export const configureNotifications = async () => {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const category = notification.request.content.data?.category as NotificationCategory || NotificationCategory.SYSTEM;
      const preferences = await getNotificationPreferences();
      
      // Check if notifications for this category are enabled
      if (!preferences[category]?.enabled) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: preferences[category]?.sound || false,
        shouldSetBadge: true,
        priority: preferences[category]?.importance || Notifications.AndroidImportance.DEFAULT,
      };
    },
  });
  
  // Create notification channels for Android
  if (Platform.OS === 'android') {
    await createNotificationChannels();
  }
};

/**
 * Create notification channels for Android
 */
const createNotificationChannels = async () => {
  if (Platform.OS !== 'android') return;
  
  // Appointment channel
  await Notifications.setNotificationChannelAsync('appointments', {
    name: 'Appointments',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: true,
  });
  
  // Task channel
  await Notifications.setNotificationChannelAsync('tasks', {
    name: 'Tasks',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: true,
  });
  
  // Care plan channel
  await Notifications.setNotificationChannelAsync('care_plans', {
    name: 'Care Plans',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: true,
  });
  
  // Message channel
  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: true,
  });
  
  // System channel
  await Notifications.setNotificationChannelAsync('system', {
    name: 'System',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: false,
  });
};

/**
 * Register for push notifications
 * @returns Expo push token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Check if device is physical (not simulator/emulator)
    if (!Device.isDevice) {
      console.log('Push notifications are not available on simulator/emulator');
      return null;
    }
    
    // Check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If permission not granted, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If permission not granted, return null
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Save token to storage
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, token);
    
    // Register token with server
    await registerTokenWithServer(token);
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Register token with server
 * @param token Expo push token
 */
const registerTokenWithServer = async (token: string) => {
  try {
    const response = await axios.post(`${API_URL}/notifications/register-device`, {
      token,
      platform: Platform.OS,
      deviceId: Device.deviceName,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error registering token with server:', error);
    throw error;
  }
};

/**
 * Get notification preferences
 * @returns Notification preferences
 */
export const getNotificationPreferences = async (): Promise<Record<NotificationCategory, NotificationPreference>> => {
  try {
    const preferencesString = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
    
    if (!preferencesString) {
      // If no preferences found, use defaults
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    
    return JSON.parse(preferencesString);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Update notification preferences
 * @param category Notification category
 * @param preferences Updated preferences
 */
export const updateNotificationPreferences = async (
  category: NotificationCategory,
  preferences: Partial<NotificationPreference>
): Promise<void> => {
  try {
    const allPreferences = await getNotificationPreferences();
    
    allPreferences[category] = {
      ...allPreferences[category],
      ...preferences,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(allPreferences));
    
    // Update Android channel if needed
    if (Platform.OS === 'android') {
      const channelId = category.toString();
      
      await Notifications.setNotificationChannelAsync(channelId, {
        name: channelId.charAt(0).toUpperCase() + channelId.slice(1),
        importance: allPreferences[category].importance,
        vibrationPattern: allPreferences[category].vibration ? [0, 250, 250, 250] : [0],
        sound: allPreferences[category].sound,
      });
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Get notification history
 * @returns Notification history
 */
export const getNotificationHistory = async (): Promise<NotificationHistoryItem[]> => {
  try {
    const historyString = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
};

/**
 * Add notification to history
 * @param notification Notification to add
 */
export const addNotificationToHistory = async (notification: Notifications.Notification): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    
    const historyItem: NotificationHistoryItem = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data || {},
      category: notification.request.content.data?.category as NotificationCategory || NotificationCategory.SYSTEM,
      timestamp: Date.now(),
      read: false,
    };
    
    // Add to beginning of array
    history.unshift(historyItem);
    
    // Limit history to 100 items
    const limitedHistory = history.slice(0, 100);
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error adding notification to history:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param id Notification ID
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    
    const updatedHistory = history.map(item => {
      if (item.id === id) {
        return { ...item, read: true };
      }
      return item;
    });
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Clear notification history
 */
export const clearNotificationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notification history:', error);
    throw error;
  }
};

/**
 * Schedule a local notification
 * @param title Notification title
 * @param body Notification body
 * @param data Notification data
 * @param trigger Notification trigger
 * @param category Notification category
 * @returns Notification ID
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data: any = {},
  trigger: Notifications.NotificationTriggerInput = null,
  category: NotificationCategory = NotificationCategory.SYSTEM
): Promise<string> => {
  try {
    const preferences = await getNotificationPreferences();
    
    // Check if notifications for this category are enabled
    if (!preferences[category]?.enabled) {
      return '';
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, category },
        sound: preferences[category]?.sound || false,
        vibrate: preferences[category]?.vibration ? [0, 250, 250, 250] : undefined,
        priority: preferences[category]?.importance || Notifications.AndroidImportance.DEFAULT,
        ...(Platform.OS === 'android' && { channelId: category.toString() }),
      },
      trigger,
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled notification
 * @param id Notification ID
 */
export const cancelScheduledNotification = async (id: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling scheduled notification:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all scheduled notifications:', error);
    throw error;
  }
};

export default {
  configureNotifications,
  registerForPushNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationHistory,
  addNotificationToHistory,
  markNotificationAsRead,
  clearNotificationHistory,
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
};
