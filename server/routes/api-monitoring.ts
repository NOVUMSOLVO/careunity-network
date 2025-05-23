/**
 * API Monitoring Routes
 *
 * Routes for accessing API monitoring data, metrics, and logs.
 */

import express from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import apiMonitoringService from '../services/api-monitoring-service';
import { config } from '../config';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

// Most routes require admin access
router.use(ensureRole(['admin', 'system_admin']));

/**
 * Get API metrics
 * GET /api/v2/api-monitoring/metrics
 * @tag API Monitoring
 * @summary Get current API metrics
 * @description Returns metrics about API usage, performance, and errors
 */
router.get('/metrics', (req, res) => {
  const metrics = apiMonitoringService.getMetrics();
  res.json({
    data: metrics,
    error: null,
  });
});

// Schema for logs query parameters
const logsQuerySchema = z.object({
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  method: z.string().optional(),
  path: z.string().optional(),
  statusCode: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  minResponseTime: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  maxResponseTime: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  userId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

/**
 * Get API logs
 * GET /api/v2/api-monitoring/logs
 * @tag API Monitoring
 * @summary Get API request logs
 * @description Returns detailed logs of API requests with filtering options
 */
router.get('/logs', validateQuery(logsQuerySchema), async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      method,
      path,
      statusCode,
      limit,
      offset,
    } = req.query;

    const logs = await apiMonitoringService.getLogs({
      startDate,
      endDate,
      method,
      path,
      statusCode,
      limit,
      offset,
    });

    res.json({
      data: logs,
      error: null,
      meta: {
        limit,
        offset,
        // In a real implementation, you would include total count
        total: logs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get API errors
 * GET /api/v2/api-monitoring/errors
 * @tag API Monitoring
 * @summary Get API errors
 * @description Returns logs of API requests that resulted in errors
 */
router.get('/errors', validateQuery(logsQuerySchema), async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      method,
      path,
      limit,
      offset,
    } = req.query;

    // Get logs with status code >= 400
    const logs = await apiMonitoringService.getLogs({
      startDate,
      endDate,
      method,
      path,
      statusCode: 400, // This is a placeholder, the actual implementation would filter for status >= 400
      limit,
      offset,
    });

    res.json({
      data: logs,
      error: null,
      meta: {
        limit,
        offset,
        total: logs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get slow API requests
 * GET /api/v2/api-monitoring/slow-requests
 * @tag API Monitoring
 * @summary Get slow API requests
 * @description Returns logs of API requests that took longer than the threshold to process
 */
router.get('/slow-requests', validateQuery(logsQuerySchema), async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      method,
      path,
      limit,
      offset,
    } = req.query;

    // Get logs with response time > threshold
    const threshold = config.monitoring?.api?.slowRequestThreshold ?? 1000; // 1 second

    const logs = await apiMonitoringService.getLogs({
      startDate,
      endDate,
      method,
      path,
      minResponseTime: threshold,
      limit,
      offset,
    });

    res.json({
      data: logs,
      error: null,
      meta: {
        limit,
        offset,
        total: logs.length,
        threshold,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get API usage by endpoint
 * GET /api/v2/api-monitoring/usage
 * @tag API Monitoring
 * @summary Get API usage by endpoint
 * @description Returns metrics about API usage grouped by endpoint
 */
router.get('/usage', (req, res) => {
  const metrics = apiMonitoringService.getMetrics();

  // Transform metrics into a more usable format
  const usage = Object.entries(metrics.requestsPerEndpoint).map(([endpoint, count]) => {
    const [method, path] = endpoint.split(' ');
    return {
      endpoint,
      method,
      path,
      count,
      errors: metrics.errorsPerEndpoint[endpoint] || 0,
      averageResponseTime: metrics.responseTimePerEndpoint[endpoint] ?
        metrics.responseTimePerEndpoint[endpoint] / count :
        0,
      errorRate: metrics.errorsPerEndpoint[endpoint] ?
        (metrics.errorsPerEndpoint[endpoint] / count) * 100 :
        0,
    };
  });

  // Sort by count descending
  usage.sort((a, b) => b.count - a.count);

  res.json({
    data: usage,
    error: null,
  });
});

/**
 * Get API status codes
 * GET /api/v2/api-monitoring/status-codes
 * @tag API Monitoring
 * @summary Get API status codes
 * @description Returns metrics about API response status codes
 */
router.get('/status-codes', (req, res) => {
  const metrics = apiMonitoringService.getMetrics();

  // Transform status codes into a more usable format
  const statusCodes = Object.entries(metrics.statusCodes).map(([code, count]) => {
    return {
      code: parseInt(code, 10),
      count,
      percentage: (count / metrics.totalRequests) * 100,
    };
  });

  // Sort by code
  statusCodes.sort((a, b) => a.code - b.code);

  res.json({
    data: statusCodes,
    error: null,
  });
});

/**
 * Get API monitoring configuration
 * GET /api/v2/api-monitoring/config
 * @tag API Monitoring
 * @summary Get API monitoring configuration
 * @description Returns the current configuration for API monitoring
 */
router.get('/config', (req, res) => {
  const monitoringConfig = config.monitoring?.api || {};

  res.json({
    data: {
      enabled: monitoringConfig.enabled ?? true,
      logLevel: monitoringConfig.logLevel ?? 'info',
      sampleRate: monitoringConfig.sampleRate ?? 1.0,
      excludePaths: monitoringConfig.excludePaths ?? [],
      slowRequestThreshold: monitoringConfig.slowRequestThreshold ?? 1000,
    },
    error: null,
  });
});

export default router;
