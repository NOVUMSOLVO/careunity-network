/**
 * Performance Monitoring API Routes
 *
 * These routes provide access to performance metrics and optimization recommendations
 * for the CareUnity application.
 */

import express from 'express';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import queryOptimizer from '../db/query-optimizer';
import cacheService from '../services/cache-service';
import { z } from 'zod';
import monitoringService from '../services/monitoring-service';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(ensureAuthenticated());
router.use(ensureRole(['admin']));

// Time range schema for filtering metrics
const timeRangeSchema = z.object({
  startTime: z.string().regex(/^\d+$/, "Start time must be a timestamp").transform(val => parseInt(val, 10)),
  endTime: z.string().regex(/^\d+$/, "End time must be a timestamp").transform(val => parseInt(val, 10)).optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional()
});

/**
 * Get query performance metrics
 * GET /api/v2/performance/queries
 */
router.get('/queries', validateQuery(timeRangeSchema), async (req, res) => {
  // Get query metrics
  const metrics = queryOptimizer.getQueryMetrics();

  res.json({
    metrics,
    totalQueries: metrics.length,
    averageExecutionTime: metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length || 0,
    totalRowsReturned: metrics.reduce((sum, m) => sum + m.rowsReturned, 0)
  });
});

/**
 * Get slow queries
 * GET /api/v2/performance/slow-queries
 */
router.get('/slow-queries', async (req, res) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 500;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  // Get slow queries
  const slowQueries = queryOptimizer.getSlowQueries(threshold, limit);

  res.json({
    queries: slowQueries,
    count: slowQueries.length,
    threshold
  });
});

/**
 * Get index recommendations
 * GET /api/v2/performance/index-recommendations
 */
router.get('/index-recommendations', async (req, res) => {
  // Get index recommendations
  const recommendations = await queryOptimizer.analyzeAndRecommendIndexes();

  res.json({
    recommendations,
    count: recommendations.length
  });
});

/**
 * Get cache statistics
 * GET /api/v2/performance/cache-stats
 */
router.get('/cache-stats', async (req, res) => {
  // Get cache statistics
  const stats = cacheService.getStats();

  res.json({
    stats,
    keys: cacheService.getKeys().length,
    hitRatio: stats.hits / (stats.hits + stats.misses) || 0
  });
});

/**
 * Clear cache
 * POST /api/v2/performance/clear-cache
 */
router.post('/clear-cache', async (req, res) => {
  // Clear cache
  cacheService.flush();

  res.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

/**
 * Get API performance metrics
 * GET /api/v2/performance/api
 */
router.get('/api', validateQuery(timeRangeSchema), async (req, res) => {
  const { startTime, endTime = Date.now(), interval = 'hour' } = req.query;

  // Get API metrics from monitoring service
  const metrics = monitoringService.getPerformanceMetrics(
    startTime as number,
    endTime as number
  );

  // Group by route and calculate averages
  const routeMetrics = metrics.reduce((acc, metric) => {
    const route = metric.route;
    if (!acc[route]) {
      acc[route] = {
        route,
        count: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        statusCodes: {}
      };
    }

    acc[route].count++;
    acc[route].totalResponseTime += metric.responseTime;
    acc[route].minResponseTime = Math.min(acc[route].minResponseTime, metric.responseTime);
    acc[route].maxResponseTime = Math.max(acc[route].maxResponseTime, metric.responseTime);

    // Count status codes
    const statusCode = metric.statusCode.toString();
    acc[route].statusCodes[statusCode] = (acc[route].statusCodes[statusCode] || 0) + 1;

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.values(routeMetrics).forEach((metric: any) => {
    metric.avgResponseTime = metric.totalResponseTime / metric.count;
  });

  // Group by time interval
  const timeSeriesData = groupByTimeInterval(metrics, interval as string);

  res.json({
    summary: {
      totalRequests: metrics.length,
      avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length || 0,
      p95ResponseTime: calculatePercentile(metrics.map(m => m.responseTime), 95),
      successRate: metrics.filter(m => m.statusCode >= 200 && m.statusCode < 300).length / metrics.length * 100
    },
    routeMetrics: Object.values(routeMetrics),
    timeSeriesData
  });
});

/**
 * Get system metrics
 * GET /api/v2/performance/system
 */
router.get('/system', validateQuery(timeRangeSchema), async (req, res) => {
  const { startTime, endTime = Date.now(), interval = 'hour' } = req.query;

  // Get system metrics from monitoring service
  const metrics = monitoringService.getSystemMetrics(
    startTime as number,
    endTime as number
  );

  // Group by time interval
  const timeSeriesData = groupByTimeInterval(metrics, interval as string);

  res.json({
    summary: {
      avgCpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length || 0,
      avgMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length || 0,
      maxActiveConnections: Math.max(...metrics.map(m => m.activeConnections)),
      avgPendingRequests: metrics.reduce((sum, m) => sum + m.pendingRequests, 0) / metrics.length || 0
    },
    timeSeriesData
  });
});

// Helper function to group metrics by time interval
function groupByTimeInterval(metrics: any[], interval: string) {
  const result: Record<string, any> = {};

  metrics.forEach(metric => {
    const timestamp = metric.timestamp;
    let intervalKey: string;

    switch (interval) {
      case 'hour':
        intervalKey = new Date(timestamp).toISOString().slice(0, 13) + ':00:00Z';
        break;
      case 'day':
        intervalKey = new Date(timestamp).toISOString().slice(0, 10) + 'T00:00:00Z';
        break;
      case 'week':
        const date = new Date(timestamp);
        const day = date.getUTCDay();
        const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(date.setUTCDate(diff));
        intervalKey = weekStart.toISOString().slice(0, 10) + 'T00:00:00Z';
        break;
      case 'month':
        intervalKey = new Date(timestamp).toISOString().slice(0, 7) + '-01T00:00:00Z';
        break;
      default:
        intervalKey = new Date(timestamp).toISOString();
    }

    if (!result[intervalKey]) {
      result[intervalKey] = {
        timestamp: intervalKey,
        count: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        activeConnections: 0
      };
    }

    result[intervalKey].count++;

    if (metric.responseTime !== undefined) {
      result[intervalKey].totalResponseTime += metric.responseTime;
    }

    if (metric.cpuUsage !== undefined) {
      result[intervalKey].cpuUsage += metric.cpuUsage;
    }

    if (metric.memoryUsage !== undefined) {
      result[intervalKey].memoryUsage += metric.memoryUsage;
    }

    if (metric.activeConnections !== undefined) {
      result[intervalKey].activeConnections = Math.max(
        result[intervalKey].activeConnections,
        metric.activeConnections
      );
    }
  });

  // Calculate averages
  Object.values(result).forEach((item: any) => {
    if (item.totalResponseTime) {
      item.avgResponseTime = item.totalResponseTime / item.count;
    }
    if (item.cpuUsage) {
      item.cpuUsage = item.cpuUsage / item.count;
    }
    if (item.memoryUsage) {
      item.memoryUsage = item.memoryUsage / item.count;
    }
  });

  return Object.values(result).sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// Helper function to calculate percentile
function calculatePercentile(values: number[], percentile: number) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[index];
}

export default router;
