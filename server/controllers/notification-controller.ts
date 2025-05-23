import { Request, Response } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { notifications } from '../schema';
import { pushNotificationService } from '../services/push-notification-service';

/**
 * Controller for handling notification-related requests
 */
export class NotificationController {
  /**
   * Register a device for push notifications
   */
  async registerDevice(req: Request, res: Response) {
    try {
      const { token, platform } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      
      await pushNotificationService.registerDevice(userId, token, platform || 'unknown');
      
      return res.status(200).json({ message: 'Device registered successfully' });
    } catch (error) {
      console.error('Error registering device:', error);
      return res.status(500).json({ message: 'Failed to register device' });
    }
  }
  
  /**
   * Update push notification preferences
   */
  async updatePreferences(req: Request, res: Response) {
    try {
      const { pushEnabled } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      await pushNotificationService.updatePreferences(userId, !!pushEnabled);
      
      return res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({ message: 'Failed to update preferences' });
    }
  }
  
  /**
   * Get notifications for the current user
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt);
      
      return res.status(200).json(userNotifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return res.status(500).json({ message: 'Failed to get notifications' });
    }
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Ensure the notification belongs to the user
      const [notification] = await db.select()
        .from(notifications)
        .where(eq(notifications.id, parseInt(id)))
        .limit(1);
      
      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, parseInt(id)));
      
      return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  }
  
  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
      
      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  }
  
  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Ensure the notification belongs to the user
      const [notification] = await db.select()
        .from(notifications)
        .where(eq(notifications.id, parseInt(id)))
        .limit(1);
      
      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      await db.delete(notifications)
        .where(eq(notifications.id, parseInt(id)));
      
      return res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ message: 'Failed to delete notification' });
    }
  }
  
  /**
   * Delete all notifications for the current user
   */
  async deleteAllNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      await db.delete(notifications)
        .where(eq(notifications.userId, userId));
      
      return res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return res.status(500).json({ message: 'Failed to delete all notifications' });
    }
  }
  
  /**
   * Send a test notification to the current user (for development)
   */
  async sendTestNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      await pushNotificationService.sendToUser(userId, {
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification from the server.',
      });
      
      return res.status(200).json({ message: 'Test notification sent' });
    } catch (error) {
      console.error('Error sending test notification:', error);
      return res.status(500).json({ message: 'Failed to send test notification' });
    }
  }
}

// Export singleton instance
export const notificationController = new NotificationController();
