/**
 * Audit Log API Routes
 *
 * Provides endpoints for accessing security audit logs.
 */

import express from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import auditService, { AuditEventType } from '../services/audit-service';

const router = express.Router();

// All routes require authentication and admin role
router.use(ensureAuthenticated());
router.use(ensureRole(['admin', 'system_admin']));

// Audit log query schema
const auditLogQuerySchema = z.object({
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Start time must be an ISO date string"),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "End time must be an ISO date string"),
  eventType: z.nativeEnum(AuditEventType).optional(),
  userId: z.string().regex(/^\d+$/, "User ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  offset: z.string().regex(/^\d+$/, "Offset must be a positive integer").transform(val => parseInt(val, 10)).optional(),
});

// Audit log integrity query schema
const auditLogIntegrityQuerySchema = z.object({
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Start time must be an ISO date string"),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "End time must be an ISO date string"),
});

/**
 * Get audit logs
 * GET /api/v2/audit/logs
 */
router.get('/logs', validateQuery(auditLogQuerySchema), async (req, res, next) => {
  try {
    const {
      startTime,
      endTime,
      eventType,
      userId,
      resourceType,
      resourceId,
      limit = 100,
      offset = 0,
    } = req.query;

    const result = await auditService.getAuditLogs(
      startTime as string,
      endTime as string,
      eventType as AuditEventType | undefined,
      userId as number | undefined,
      resourceType as string | undefined,
      resourceId as string | undefined,
      limit as number,
      offset as number
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get audit log event types
 * GET /api/v2/audit/event-types
 */
router.get('/event-types', (req, res) => {
  const eventTypes = Object.values(AuditEventType);

  res.json(eventTypes);
});

/**
 * Verify audit log integrity
 * GET /api/v2/audit/verify
 */
router.get('/verify', validateQuery(auditLogIntegrityQuerySchema), async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const result = await auditService.verifyAuditLogIntegrity(
      startTime as string,
      endTime as string
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get audit log summary
 * GET /api/v2/audit/summary
 */
router.get('/summary', validateQuery(auditLogQuerySchema), async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    // Get all logs for the period
    const { logs } = await auditService.getAuditLogs(
      startTime as string,
      endTime as string,
      undefined,
      undefined,
      undefined,
      undefined,
      10000 // Get a large number of logs for accurate summary
    );

    // Count by event type
    const eventTypeCounts = logs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by user
    const userCounts = logs.reduce((acc, log) => {
      if (log.userId) {
        const key = `${log.userId}:${log.username || 'unknown'}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Count by resource type
    const resourceTypeCounts = logs.reduce((acc, log) => {
      if (log.resourceType) {
        acc[log.resourceType] = (acc[log.resourceType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Count by IP address
    const ipAddressCounts = logs.reduce((acc, log) => {
      if (log.ipAddress) {
        acc[log.ipAddress] = (acc[log.ipAddress] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Format user counts
    const topUsers = Object.entries(userCounts)
      .map(([key, count]) => {
        const [userId, username] = key.split(':');
        return {
          userId: parseInt(userId),
          username,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Format event type counts
    const eventTypes = Object.entries(eventTypeCounts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count);

    // Format resource type counts
    const resourceTypes = Object.entries(resourceTypeCounts)
      .map(([resourceType, count]) => ({ resourceType, count }))
      .sort((a, b) => b.count - a.count);

    // Format IP address counts
    const topIpAddresses = Object.entries(ipAddressCounts)
      .map(([ipAddress, count]) => ({ ipAddress, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count authentication events
    const authEvents = logs.filter(log =>
      log.eventType === AuditEventType.LOGIN_SUCCESS ||
      log.eventType === AuditEventType.LOGIN_FAILURE ||
      log.eventType === AuditEventType.LOGOUT ||
      log.eventType === AuditEventType.TWO_FACTOR_SUCCESS ||
      log.eventType === AuditEventType.TWO_FACTOR_FAILURE
    );

    const authEventCounts = {
      loginSuccess: authEvents.filter(log => log.eventType === AuditEventType.LOGIN_SUCCESS).length,
      loginFailure: authEvents.filter(log => log.eventType === AuditEventType.LOGIN_FAILURE).length,
      logout: authEvents.filter(log => log.eventType === AuditEventType.LOGOUT).length,
      twoFactorSuccess: authEvents.filter(log => log.eventType === AuditEventType.TWO_FACTOR_SUCCESS).length,
      twoFactorFailure: authEvents.filter(log => log.eventType === AuditEventType.TWO_FACTOR_FAILURE).length,
    };

    res.json({
      totalLogs: logs.length,
      eventTypes,
      topUsers,
      resourceTypes,
      topIpAddresses,
      authEventCounts,
      timeRange: {
        startTime,
        endTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Export audit logs
 * GET /api/v2/audit/export
 */
router.get('/export', validateQuery(auditLogQuerySchema), async (req, res, next) => {
  try {
    const {
      startTime,
      endTime,
      eventType,
      userId,
      resourceType,
      resourceId,
    } = req.query;

    // Get all logs for the period
    const { logs } = await auditService.getAuditLogs(
      startTime as string,
      endTime as string,
      eventType as AuditEventType | undefined,
      userId as number | undefined,
      resourceType as string | undefined,
      resourceId as string | undefined,
      100000 // Get a large number of logs for export
    );

    // Create audit log for the export
    await auditService.createAuditLogFromRequest(
      req,
      AuditEventType.DATA_EXPORT,
      'Export audit logs',
      {
        startTime,
        endTime,
        eventType,
        userId,
        resourceType,
        resourceId,
        count: logs.length,
      }
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString()}.json"`);

    // Send logs as JSON
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
