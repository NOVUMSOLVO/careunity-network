/**
 * Security Routes
 *
 * This file contains routes for security-related functionality,
 * including security settings, alerts, and monitoring.
 */

import express, { Request, Response } from 'express';
import { ensureAuthenticated } from '../middleware/auth';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import securityMonitoringService from '../services/security-monitoring-service';
import encryptionService from '../services/encryption-service';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { z } from 'zod';

const router = express.Router();

/**
 * Get security metrics
 */
router.get('/metrics', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user role
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get security metrics
    const metrics = {
      failedLoginAttempts: 25,
      accountLockouts: 3,
      suspiciousActivities: 12,
      dataAccessEvents: 156,
      apiRequests: 1243,
      activeUsers: 42,
      securityIncidents: 5,
      resolvedIncidents: 3
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error getting security metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get security alerts
 */
router.get('/alerts', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user role
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get security alerts
    const alerts = securityMonitoringService.getAlerts();

    res.json(alerts);
  } catch (error) {
    logger.error('Error getting security alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update alert status
 */
router.put('/alerts/:id', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const alertId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!['new', 'acknowledged', 'resolved', 'false_positive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get user role
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update alert status
    const updatedAlert = securityMonitoringService.updateAlertStatus(alertId, status);

    if (!updatedAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(updatedAlert);
  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get active sessions
 */
router.get('/sessions', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Mock sessions data (in a real app, this would come from a database)
    const sessions = [
      {
        id: 'session_1',
        device: 'Windows PC',
        browser: 'Chrome 91.0.4472.124',
        ipAddress: '192.168.1.1',
        location: 'New York, USA',
        timestamp: new Date().toISOString(),
        current: true
      },
      {
        id: 'session_2',
        device: 'iPhone 12',
        browser: 'Safari 14.1.1',
        ipAddress: '192.168.1.2',
        location: 'New York, USA',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        current: false
      },
      {
        id: 'session_3',
        device: 'MacBook Pro',
        browser: 'Firefox 89.0',
        ipAddress: '192.168.1.3',
        location: 'Boston, USA',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        current: false
      }
    ];

    res.json(sessions);
  } catch (error) {
    logger.error('Error getting sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Terminate session
 */
router.delete('/sessions/:id', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const sessionId = req.params.id;

    // In a real app, this would terminate the session in the database

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    logger.error('Error terminating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get two-factor authentication status
 */
router.get('/two-factor', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    res.json({
      enabled: !!user.totpEnabled,
      method: user.totpEnabled ? 'app' : null
    });
  } catch (error) {
    logger.error('Error getting 2FA status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Set up two-factor authentication
 */
router.post('/two-factor/setup', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { method } = req.body;

    // Validate method
    if (!['app', 'sms', 'email'].includes(method)) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate QR code URL
    const otpauth = authenticator.keyuri(user.username, 'CareUnity', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Store secret temporarily (in a real app, this would be stored in a temporary session)
    // For this example, we'll update the user record directly
    await db.update(users)
      .set({
        totpSecret: secret,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    res.json({
      secret,
      qrCodeUrl
    });
  } catch (error) {
    logger.error('Error setting up 2FA:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Verify two-factor authentication
 */
router.post('/two-factor/verify', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { method, code } = req.body;

    // Validate method and code
    if (!['app', 'sms', 'email'].includes(method)) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Verify code
    let isValid = false;

    if (method === 'app') {
      isValid = authenticator.verify({
        token: code,
        secret: user.totpSecret || ''
      });
    } else if (method === 'sms' || method === 'email') {
      // In a real app, this would verify the code sent via SMS or email
      isValid = code === '123456'; // Mock verification
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    });

    // Hash backup codes
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code.replace(/-/g, '')).digest('hex')
    );

    // Enable 2FA
    await db.update(users)
      .set({
        totpEnabled: true,
        backupCodes: hashedBackupCodes,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    res.json({
      enabled: true,
      backupCodes
    });
  } catch (error) {
    logger.error('Error verifying 2FA:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Disable two-factor authentication
 */
router.delete('/two-factor', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Disable 2FA
    await db.update(users)
      .set({
        totpEnabled: false,
        totpSecret: null,
        backupCodes: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    res.json({
      enabled: false
    });
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get security notifications
 */
router.get('/notifications', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Mock notifications (in a real app, these would come from a database)
    const notifications = [
      {
        id: 'notif_1',
        type: 'login_activity',
        severity: 'medium',
        title: 'New Login Detected',
        message: 'Your account was accessed from a new device in New York, USA.',
        timestamp: new Date().toISOString(),
        read: false,
        actionRequired: true,
        actionUrl: '/security/sessions',
        actionText: 'Review Sessions',
        details: {
          device: 'Windows PC',
          browser: 'Chrome 91.0.4472.124',
          ipAddress: '192.168.1.1',
          location: 'New York, USA'
        }
      },
      {
        id: 'notif_2',
        type: 'security_policy_update',
        severity: 'info',
        title: 'Security Policy Updated',
        message: 'Our security policy has been updated. Please review the changes.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
        actionUrl: '/security/policy',
        actionText: 'View Policy',
      }
    ];

    res.json(notifications);
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Mark notification as read
 */
router.put('/notifications/:id/read', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = req.params.id;

    // In a real app, this would mark the notification as read in the database

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
