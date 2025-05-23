import { db } from '../db';
import { eq } from 'drizzle-orm';
import { devices, users, notifications } from '../schema';
import axios from 'axios';

interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface NotificationData {
  userId: number;
  type: 'appointment' | 'message' | 'care-plan' | 'alert' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

/**
 * Service for handling push notifications
 */
export class PushNotificationService {
  private readonly EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
  
  /**
   * Register a device token for a user
   */
  async registerDevice(userId: number, token: string, platform: string) {
    try {
      // Check if device already exists
      const existingDevice = await db.select()
        .from(devices)
        .where(eq(devices.token, token))
        .limit(1);
      
      if (existingDevice.length > 0) {
        // Update existing device
        await db.update(devices)
          .set({
            userId,
            platform,
            updatedAt: new Date(),
          })
          .where(eq(devices.token, token));
      } else {
        // Create new device
        await db.insert(devices).values({
          userId,
          token,
          platform,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }
  
  /**
   * Update push notification preferences for a user
   */
  async updatePreferences(userId: number, pushEnabled: boolean) {
    try {
      await db.update(users)
        .set({
          pushNotificationsEnabled: pushEnabled,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Error updating push preferences:', error);
      throw error;
    }
  }
  
  /**
   * Send a push notification to a specific user
   */
  async sendToUser(userId: number, notificationData: Omit<NotificationData, 'userId'>) {
    try {
      // Get user's devices
      const userDevices = await db.select()
        .from(devices)
        .where(eq(devices.userId, userId));
      
      // Get user's preferences
      const userPrefs = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (userPrefs.length === 0) {
        throw new Error('User not found');
      }
      
      // Check if user has push notifications enabled
      if (!userPrefs[0].pushNotificationsEnabled) {
        return false;
      }
      
      // Store notification in database
      const [notification] = await db.insert(notifications)
        .values({
          userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          actionUrl: notificationData.actionUrl,
          senderId: notificationData.sender?.id,
          read: false,
          createdAt: new Date(),
        })
        .returning();
      
      // Send push notification to all user's devices
      const pushPromises = userDevices.map(device => {
        const payload: PushNotificationPayload = {
          to: device.token,
          title: notificationData.title,
          body: notificationData.message,
          data: {
            id: notification.id,
            type: notificationData.type,
            actionUrl: notificationData.actionUrl,
            sender: notificationData.sender,
          },
          sound: true,
          badge: 1,
          channelId: 'default',
          priority: 'high',
        };
        
        return this.sendPushNotification(payload);
      });
      
      await Promise.all(pushPromises);
      
      return true;
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      throw error;
    }
  }
  
  /**
   * Send a push notification to multiple users
   */
  async sendToUsers(userIds: number[], notificationData: Omit<NotificationData, 'userId'>) {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.sendToUser(userId, notificationData))
      );
      
      return results.filter(Boolean).length;
    } catch (error) {
      console.error('Error sending push notification to users:', error);
      throw error;
    }
  }
  
  /**
   * Send a push notification to all users with a specific role
   */
  async sendToRole(role: string, notificationData: Omit<NotificationData, 'userId'>) {
    try {
      // Get all users with the specified role
      const usersWithRole = await db.select()
        .from(users)
        .where(eq(users.role, role));
      
      const userIds = usersWithRole.map(user => user.id);
      
      return this.sendToUsers(userIds, notificationData);
    } catch (error) {
      console.error('Error sending push notification to role:', error);
      throw error;
    }
  }
  
  /**
   * Send a push notification using the Expo push notification service
   */
  private async sendPushNotification(payload: PushNotificationPayload) {
    try {
      const response = await axios.post(this.EXPO_PUSH_ENDPOINT, payload, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
