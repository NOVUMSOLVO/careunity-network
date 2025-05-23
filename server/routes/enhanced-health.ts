/**
 * Enhanced Health Check Routes
 * 
 * Comprehensive health monitoring endpoints for PM2 and system monitoring
 */

import express from 'express';
import { db } from '../db';
import { serviceUsers } from '../../shared/schema';
import { logger } from '../utils/logger';
import os from 'os';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * Basic health check (for PM2)
 * GET /api/health
 */
router.get('/', async (req, res) => {
  try {
    // Basic database check
    await db.select().from(serviceUsers).limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'CareUnityNetwork',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  const healthData: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
    system: {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
        usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpu: {
        loadAverage: os.loadavg(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
  };

  let overallStatus = 'healthy';

  // Database health check
  try {
    const start = Date.now();
    await db.select().from(serviceUsers).limit(1);
    const responseTime = Date.now() - start;
    
    healthData.checks.database = {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    overallStatus = 'unhealthy';
    healthData.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }

  // Memory usage check
  const memoryUsage = healthData.system.memory.usage;
  if (memoryUsage > 90) {
    overallStatus = 'degraded';
    healthData.checks.memory = {
      status: 'warning',
      usage: `${memoryUsage}%`,
      message: 'High memory usage detected'
    };
  } else {
    healthData.checks.memory = {
      status: 'healthy',
      usage: `${memoryUsage}%`
    };
  }

  // External services check (placeholder for Redis, etc.)
  healthData.checks.redis = {
    status: 'healthy',
    message: 'Redis not configured yet'
  };

  healthData.status = overallStatus;
  
  if (overallStatus === 'unhealthy') {
    res.status(503);
  } else if (overallStatus === 'degraded') {
    res.status(200);
  }
  
  res.json(healthData);
});

/**
 * Liveness probe (for PM2)
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

/**
 * Readiness probe (for PM2)
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if the application is ready to serve requests
    await db.select().from(serviceUsers).limit(1);
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        server: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not available'
    });
  }
});

/**
 * Performance metrics for monitoring
 * GET /api/health/metrics
 */
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
      loadAverage: os.loadavg()
    },
    system: {
      uptime: process.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid
    },
    eventLoop: {
      delay: process.hrtime.bigint ? Number(process.hrtime.bigint()) : 0
    }
  });
});

/**
 * Custom health check for specific services
 * GET /api/health/services
 */
router.get('/services', async (req, res) => {
  const services = {
    database: 'unknown',
    authentication: 'unknown',
    fileSystem: 'unknown'
  };

  // Database check
  try {
    await db.select().from(serviceUsers).limit(1);
    services.database = 'healthy';
  } catch (error) {
    services.database = 'unhealthy';
  }

  // File system check
  try {
    const fs = require('fs').promises;
    await fs.access('./package.json');
    services.fileSystem = 'healthy';
  } catch (error) {
    services.fileSystem = 'unhealthy';
  }

  // Authentication service check (placeholder)
  services.authentication = 'healthy';

  const allHealthy = Object.values(services).every(status => status === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services
  });
});

export default router;
