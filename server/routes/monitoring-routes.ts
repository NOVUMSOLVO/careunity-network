/**
 * Monitoring API Routes
 *
 * Provides endpoints for accessing monitoring and analytics data.
 */

import express from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import monitoringService from '../services/monitoring-service';

const router = express.Router();

// All routes require authentication and admin role
router.use(ensureAuthenticated());
router.use(ensureRole(['admin', 'system_admin']));

// Time range query schema
const timeRangeSchema = z.object({
  startTime: z.string().regex(/^\d+$/, "Start time must be a timestamp").transform(val => parseInt(val, 10)),
  endTime: z.string().regex(/^\d+$/, "End time must be a timestamp").transform(val => parseInt(val, 10)),
  route: z.string().optional(),
  userId: z.string().regex(/^\d+$/, "User ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  event: z.string().optional(),
});

/**
 * Get system health
 * GET /api/v2/monitoring/health
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = await monitoringService.getSystemHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

/**
 * Get performance metrics
 * GET /api/v2/monitoring/performance
 */
router.get('/performance', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime, route, userId } = req.query;

    const metrics = monitoringService.getPerformanceMetrics(
      startTime as number,
      endTime as number,
      route as string | undefined,
      userId as number | undefined
    );

    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * Get error metrics
 * GET /api/v2/monitoring/errors
 */
router.get('/errors', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime, route, userId } = req.query;

    const metrics = monitoringService.getErrorMetrics(
      startTime as number,
      endTime as number,
      route as string | undefined,
      userId as number | undefined
    );

    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * Get system metrics
 * GET /api/v2/monitoring/system
 */
router.get('/system', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const metrics = monitoringService.getSystemMetrics(
      startTime as number,
      endTime as number
    );

    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * Get user analytics
 * GET /api/v2/monitoring/analytics
 */
router.get('/analytics', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime, event, userId } = req.query;

    const analytics = monitoringService.getUserAnalytics(
      startTime as number,
      endTime as number,
      event as string | undefined,
      userId as number | undefined
    );

    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

/**
 * Get performance summary
 * GET /api/v2/monitoring/performance/summary
 */
router.get('/performance/summary', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const metrics = monitoringService.getPerformanceMetrics(
      startTime as number,
      endTime as number
    );

    // Calculate summary statistics
    const totalRequests = metrics.length;

    const avgResponseTime = totalRequests > 0
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
      : 0;

    // Calculate percentiles
    const sortedResponseTimes = metrics
      .map(m => m.responseTime)
      .sort((a, b) => a - b);

    const p50 = totalRequests > 0
      ? sortedResponseTimes[Math.floor(totalRequests * 0.5)]
      : 0;

    const p90 = totalRequests > 0
      ? sortedResponseTimes[Math.floor(totalRequests * 0.9)]
      : 0;

    const p95 = totalRequests > 0
      ? sortedResponseTimes[Math.floor(totalRequests * 0.95)]
      : 0;

    const p99 = totalRequests > 0
      ? sortedResponseTimes[Math.floor(totalRequests * 0.99)]
      : 0;

    // Count by status code
    const statusCodes = metrics.reduce((acc, m) => {
      const statusCode = m.statusCode.toString();
      acc[statusCode] = (acc[statusCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by route
    const routes = metrics.reduce((acc, m) => {
      acc[m.route] = (acc[m.route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 5 slowest routes
    const routeAvgTimes = metrics.reduce((acc, m) => {
      if (!acc[m.route]) {
        acc[m.route] = { total: 0, count: 0 };
      }
      acc[m.route].total += m.responseTime;
      acc[m.route].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const slowestRoutes = Object.entries(routeAvgTimes)
      .map(([route, { total, count }]) => ({
        route,
        avgResponseTime: total / count,
        count,
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 5);

    res.json({
      totalRequests,
      avgResponseTime,
      percentiles: {
        p50,
        p90,
        p95,
        p99,
      },
      statusCodes,
      topRoutes: Object.entries(routes)
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      slowestRoutes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get error summary
 * GET /api/v2/monitoring/errors/summary
 */
router.get('/errors/summary', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const errors = monitoringService.getErrorMetrics(
      startTime as number,
      endTime as number
    );

    // Count by error message
    const errorMessages = errors.reduce((acc, e) => {
      acc[e.errorMessage] = (acc[e.errorMessage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by route
    const routes = errors.reduce((acc, e) => {
      acc[e.route] = (acc[e.route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by status code
    const statusCodes = errors.reduce((acc, e) => {
      const statusCode = e.statusCode.toString();
      acc[statusCode] = (acc[statusCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalErrors: errors.length,
      topErrorMessages: Object.entries(errorMessages)
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topErrorRoutes: Object.entries(routes)
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      statusCodes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user analytics summary
 * GET /api/v2/monitoring/analytics/summary
 */
router.get('/analytics/summary', validateQuery(timeRangeSchema), (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const analytics = monitoringService.getUserAnalytics(
      startTime as number,
      endTime as number
    );

    // Count by event
    const events = analytics.reduce((acc, a) => {
      acc[a.event] = (acc[a.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by user
    const users = analytics.reduce((acc, a) => {
      if (a.userId) {
        acc[a.userId] = (acc[a.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Count unique users
    const uniqueUsers = new Set(analytics.map(a => a.userId).filter(Boolean)).size;

    res.json({
      totalEvents: analytics.length,
      uniqueUsers,
      topEvents: Object.entries(events)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      mostActiveUsers: Object.entries(users)
        .map(([userId, count]) => ({ userId: parseInt(userId), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
