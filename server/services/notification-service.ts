/**
 * Notification Service
 * 
 * This service provides functionality for sending notifications to users
 * via WebSockets and storing them in the database.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { notifications } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Notification type enum
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

// Notification interface
export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  link?: string;
  data?: any;
}

// Create notification options
export interface CreateNotificationOptions {
  userId: number;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  data?: any;
}

/**
 * Notification service class
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  public async createNotification(options: CreateNotificationOptions): Promise<Notification> {
    const {
      userId,
      title,
      message,
      type = NotificationType.INFO,
      link,
      data,
    } = options;
    
    try {
      // Create notification ID
      const id = uuidv4();
      
      // Create notification object
      const notification: Notification = {
        id,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        link,
        data,
      };
      
      // Insert notification into database
      await db.insert(notifications).values({
        id,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        link,
        data: data ? JSON.stringify(data) : null,
      });
      
      // Send notification via WebSocket
      this.sendNotificationViaWebSocket(notification);
      
      logger.info(`Notification created for user ${userId}: ${title}`);
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Get notifications for a user
   */
  public async getNotifications(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    
    try {
      // Build query
      let query = db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId));
      
      // Add unread filter if needed
      if (unreadOnly) {
        query = query.where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ));
      }
      
      // Add order, limit, and offset
      query = query
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Execute query
      const results = await query;
      
      // Parse data field
      return results.map((notification) => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data as string) : null,
      }));
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   */
  public async markAsRead(id: string, userId: number): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.userId, userId)
          )
        );
      
      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  public async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        );
      
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   */
  public async deleteNotification(id: string, userId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.userId, userId)
          )
        );
      
      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  /**
   * Delete all notifications for a user
   */
  public async deleteAllNotifications(userId: number): Promise<number> {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.userId, userId));
      
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification via WebSocket
   */
  private sendNotificationViaWebSocket(notification: Notification): void {
    try {
      // Get WebSocket service from global
      const wsService = (global as any).wsService;
      
      if (!wsService) {
        logger.warn('WebSocket service not available');
        return;
      }
      
      // Send notification to user
      wsService.sendToUser(notification.userId.toString(), {
        type: 'notification',
        payload: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: notification.createdAt.toISOString(),
          link: notification.link,
          data: notification.data,
        },
      });
      
      logger.info(`Notification sent via WebSocket to user ${notification.userId}`);
    } catch (error) {
      logger.error('Error sending notification via WebSocket:', error);
    }
  }
  
  /**
   * Broadcast a notification to all users
   */
  public async broadcastNotification(
    options: Omit<CreateNotificationOptions, 'userId'> & { userIds?: number[] }
  ): Promise<Notification[]> {
    const { userIds, ...notificationOptions } = options;
    
    try {
      // Get all user IDs if not provided
      const targetUserIds = userIds || await this.getAllUserIds();
      
      // Create notifications for each user
      const notifications = await Promise.all(
        targetUserIds.map((userId) =>
          this.createNotification({
            ...notificationOptions,
            userId,
          })
        )
      );
      
      logger.info(`Broadcast notification sent to ${targetUserIds.length} users: ${options.title}`);
      
      return notifications;
    } catch (error) {
      logger.error('Error broadcasting notification:', error);
      throw error;
    }
  }
  
  /**
   * Get all user IDs
   */
  private async getAllUserIds(): Promise<number[]> {
    try {
      const users = await db.query.users.findMany({
        columns: {
          id: true,
        },
      });
      
      return users.map((user) => user.id);
    } catch (error) {
      logger.error('Error getting all user IDs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;
