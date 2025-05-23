/**
 * Notifications API Routes
 * 
 * This file contains API routes for managing notifications.
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { notificationService, NotificationType } from '../../services/notification-service';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import { ensureAuthenticated } from '../../middleware/auth';
import { ApiError } from '../../utils/api-error';
import { logger } from '../../utils/logger';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated);

// Validation schemas
const notificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum([
    NotificationType.INFO,
    NotificationType.SUCCESS,
    NotificationType.WARNING,
    NotificationType.ERROR,
  ]).default(NotificationType.INFO),
  link: z.string().url().optional(),
  data: z.record(z.any()).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)).optional().default('20'),
  offset: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)).optional().default('0'),
  unreadOnly: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
});

/**
 * Get all notifications for the current user
 * GET /api/v1/notifications
 */
router.get('/', validateQuery(querySchema), async (req: Request, res: Response) => {
  try {
    const { limit, offset, unreadOnly } = req.query as z.infer<typeof querySchema>;
    const userId = req.user!.id;
    
    const notifications = await notificationService.getNotifications(userId, {
      limit,
      offset,
      unreadOnly,
    });
    
    return res.json({
      data: notifications,
      meta: {
        limit,
        offset,
        total: notifications.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    throw new ApiError('server_error', 'Failed to fetch notifications', 500);
  }
});

/**
 * Mark a notification as read
 * PUT /api/v1/notifications/:id/read
 */
router.put('/:id/read', validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as z.infer<typeof idParamSchema>;
    const userId = req.user!.id;
    
    const success = await notificationService.markAsRead(id, userId);
    
    if (!success) {
      throw new ApiError('not_found', 'Notification not found', 404);
    }
    
    return res.json({
      data: {
        id,
        read: true,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Error marking notification as read:', error);
    throw new ApiError('server_error', 'Failed to mark notification as read', 500);
  }
});

/**
 * Mark all notifications as read
 * PUT /api/v1/notifications/read-all
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const count = await notificationService.markAllAsRead(userId);
    
    return res.json({
      data: {
        count,
        message: `${count} notifications marked as read`,
      },
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw new ApiError('server_error', 'Failed to mark all notifications as read', 500);
  }
});

/**
 * Delete a notification
 * DELETE /api/v1/notifications/:id
 */
router.delete('/:id', validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as z.infer<typeof idParamSchema>;
    const userId = req.user!.id;
    
    const success = await notificationService.deleteNotification(id, userId);
    
    if (!success) {
      throw new ApiError('not_found', 'Notification not found', 404);
    }
    
    return res.json({
      data: {
        id,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Error deleting notification:', error);
    throw new ApiError('server_error', 'Failed to delete notification', 500);
  }
});

/**
 * Delete all notifications
 * DELETE /api/v1/notifications
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const count = await notificationService.deleteAllNotifications(userId);
    
    return res.json({
      data: {
        count,
        message: `${count} notifications deleted`,
      },
    });
  } catch (error) {
    logger.error('Error deleting all notifications:', error);
    throw new ApiError('server_error', 'Failed to delete all notifications', 500);
  }
});

/**
 * Send a notification to a user (admin only)
 * POST /api/v1/notifications/send
 */
router.post('/send', ensureAuthenticated(['admin']), validateBody(notificationSchema.extend({
  userId: z.number().int().positive(),
})), async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, link, data } = req.body;
    
    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      link,
      data,
    });
    
    return res.status(201).json({
      data: notification,
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw new ApiError('server_error', 'Failed to send notification', 500);
  }
});

/**
 * Broadcast a notification to all users (admin only)
 * POST /api/v1/notifications/broadcast
 */
router.post('/broadcast', ensureAuthenticated(['admin']), validateBody(notificationSchema.extend({
  userIds: z.array(z.number().int().positive()).optional(),
})), async (req: Request, res: Response) => {
  try {
    const { userIds, title, message, type, link, data } = req.body;
    
    const notifications = await notificationService.broadcastNotification({
      userIds,
      title,
      message,
      type,
      link,
      data,
    });
    
    return res.status(201).json({
      data: {
        count: notifications.length,
        message: `Notification broadcast to ${notifications.length} users`,
      },
    });
  } catch (error) {
    logger.error('Error broadcasting notification:', error);
    throw new ApiError('server_error', 'Failed to broadcast notification', 500);
  }
});

export default router;
