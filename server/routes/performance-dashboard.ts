/**
 * Performance Dashboard Routes
 * 
 * This file contains routes for the performance dashboard API.
 * These routes provide access to performance metrics and analytics.
 */

import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { performanceMetricsService } from '../services/performance-metrics-service';
import { cacheService } from '../services/cache-service';
import { logger } from '../utils/logger';

const router = express.Router();

// Ensure all routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

// Schema for time range query parameters
const timeRangeSchema = z.object({
  startTime: z.coerce.number().optional(),
  endTime: z.coerce.number().optional(),
  interval: z.enum(['minute', 'hour', 'day']).optional(),
});

/**
 * Get performance metrics
 * GET /api/v2/performance/metrics
 */
router.get('/metrics', validateRequest({ query: timeRangeSchema }), async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    const metrics = performanceMetricsService.getPerformanceMetrics(
      startTime as number | undefined,
      endTime as number | undefined
    );
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error retrieving performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
    });
  }
});

/**
 * Get query metrics
 * GET /api/v2/performance/queries
 */
router.get('/queries', validateRequest({ query: timeRangeSchema }), async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    const metrics = performanceMetricsService.getQueryMetrics(
      startTime as number | undefined,
      endTime as number | undefined
    );
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error retrieving query metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve query metrics',
    });
  }
});

/**
 * Get slow queries
 * GET /api/v2/performance/slow-queries
 */
router.get('/slow-queries', validateRequest({
  query: z.object({
    threshold: z.coerce.number().optional(),
  }),
}), async (req, res) => {
  try {
    const { threshold } = req.query;
    
    const slowQueries = performanceMetricsService.getSlowQueries(
      threshold as number | undefined
    );
    
    res.json({
      success: true,
      data: slowQueries,
    });
  } catch (error) {
    logger.error('Error retrieving slow queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve slow queries',
    });
  }
});

/**
 * Get system metrics
 * GET /api/v2/performance/system
 */
router.get('/system', validateRequest({ query: timeRangeSchema }), async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    const metrics = performanceMetricsService.getSystemMetrics(
      startTime as number | undefined,
      endTime as number | undefined
    );
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error retrieving system metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics',
    });
  }
});

/**
 * Get cache metrics
 * GET /api/v2/performance/cache
 */
router.get('/cache', validateRequest({ query: timeRangeSchema }), async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    const metrics = performanceMetricsService.getCacheMetrics(
      startTime as number | undefined,
      endTime as number | undefined
    );
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error retrieving cache metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache metrics',
    });
  }
});

/**
 * Get cache statistics
 * GET /api/v2/performance/cache-stats
 */
router.get('/cache-stats', async (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error retrieving cache statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics',
    });
  }
});

/**
 * Clear cache
 * POST /api/v2/performance/clear-cache
 */
router.post('/clear-cache', validateRequest({
  body: z.object({
    cacheType: z.enum(['all', 'api', 'db', 'user']).optional(),
  }),
}), async (req, res) => {
  try {
    const { cacheType = 'all' } = req.body;
    
    await cacheService.clear(cacheType);
    
    res.json({
      success: true,
      message: `Cache ${cacheType} cleared successfully`,
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

export default router;
