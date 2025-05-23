import express from 'express';
import { notificationController } from '../controllers/notification-controller';
import { ensureAuthenticated as isAuthenticated } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Register device for push notifications
router.post('/register-device', notificationController.registerDevice);

// Update push notification preferences
router.post('/preferences', notificationController.updatePreferences);

// Get notifications for the current user
router.get('/', notificationController.getNotifications);

// Mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

// Send a test notification (for development)
router.post('/test', notificationController.sendTestNotification);

export default router;
