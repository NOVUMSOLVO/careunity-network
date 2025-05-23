/**
 * Monitoring Service
 * 
 * Provides application performance monitoring and analytics functionality.
 * Features:
 * - Performance metrics collection
 * - Error tracking
 * - User analytics
 * - System health monitoring
 * - Custom event tracking
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { performance } from 'perf_hooks';
import os from 'os';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';

// Metrics storage
interface PerformanceMetric {
  id: string;
  timestamp: number;
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
}

interface ErrorMetric {
  id: string;
  timestamp: number;
  route: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  errorStack?: string;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
}

interface SystemMetric {
  id: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  pendingRequests: number;
}

interface UserAnalytic {
  id: string;
  timestamp: number;
  userId?: number;
  event: string;
  properties: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

// In-memory storage for metrics (in production, use a proper time-series database)
const metrics = {
  performance: [] as PerformanceMetric[],
  errors: [] as ErrorMetric[],
  system: [] as SystemMetric[],
  userAnalytics: [] as UserAnalytic[],
};

// Configuration
const config = {
  sampleRate: 1.0, // 1.0 = 100% of requests are sampled
  systemMetricsInterval: 60000, // 1 minute
  retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
  errorAlertThreshold: 5, // Alert after 5 errors of the same type
};

// Active connections counter
let activeConnections = 0;
let pendingRequests = 0;

/**
 * Initialize the monitoring service
 */
export const initMonitoring = () => {
  // Start collecting system metrics
  startSystemMetricsCollection();
  
  // Start cleanup job
  startMetricsCleanup();
  
  logger.info('Monitoring service initialized');
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  // Skip monitoring based on sample rate
  if (Math.random() > config.sampleRate) {
    return next();
  }
  
  // Track active connections
  activeConnections++;
  pendingRequests++;
  
  // Record start time
  const start = performance.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to capture response time
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Calculate response time
    const responseTime = performance.now() - start;
    
    // Update counters
    activeConnections = Math.max(0, activeConnections - 1);
    pendingRequests = Math.max(0, pendingRequests - 1);
    
    // Store metric
    const metric: PerformanceMetric = {
      id: uuid(),
      timestamp: Date.now(),
      route: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    
    metrics.performance.push(metric);
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} (${responseTime.toFixed(2)}ms)`);
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Error monitoring middleware
 */
export const errorMonitoring = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Store error metric
  const metric: ErrorMetric = {
    id: uuid(),
    timestamp: Date.now(),
    route: req.path,
    method: req.method,
    statusCode: res.statusCode || 500,
    errorMessage: err.message || 'Unknown error',
    errorStack: err.stack,
    userId: (req as any).user?.id,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  
  metrics.errors.push(metric);
  
  // Check for error threshold to trigger alerts
  const similarErrors = metrics.errors.filter(
    e => e.errorMessage === metric.errorMessage && 
    e.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
  );
  
  if (similarErrors.length >= config.errorAlertThreshold) {
    // In a real implementation, send alerts via email, Slack, etc.
    logger.error(`Alert: Error threshold reached for "${metric.errorMessage}"`);
  }
  
  // Continue to the next error handler
  next(err);
};

/**
 * Track user analytics event
 * @param userId User ID
 * @param event Event name
 * @param properties Event properties
 * @param req Express request object (optional)
 */
export const trackEvent = (
  userId: number | undefined,
  event: string,
  properties: Record<string, any>,
  req?: Request
) => {
  const analytic: UserAnalytic = {
    id: uuid(),
    timestamp: Date.now(),
    userId,
    event,
    properties,
    userAgent: req?.headers['user-agent'],
    ipAddress: req?.ip,
  };
  
  metrics.userAnalytics.push(analytic);
  
  // In a real implementation, you might want to batch these events
  // and send them to an analytics service
};

/**
 * Start collecting system metrics
 */
const startSystemMetricsCollection = () => {
  const collectSystemMetrics = () => {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    
    const cpuUsage = 100 - (totalIdle / totalTick) * 100;
    
    const metric: SystemMetric = {
      id: uuid(),
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      activeConnections,
      pendingRequests,
    };
    
    metrics.system.push(metric);
    
    // Log system alerts
    if (cpuUsage > 80) {
      logger.warn(`High CPU usage: ${cpuUsage.toFixed(2)}%`);
    }
    
    if (metric.memoryUsage > 1024) { // 1GB
      logger.warn(`High memory usage: ${metric.memoryUsage.toFixed(2)}MB`);
    }
  };
  
  // Collect initial metrics
  collectSystemMetrics();
  
  // Schedule regular collection
  setInterval(collectSystemMetrics, config.systemMetricsInterval);
};

/**
 * Start metrics cleanup job
 */
const startMetricsCleanup = () => {
  const cleanupMetrics = () => {
    const cutoff = Date.now() - config.retentionPeriod;
    
    metrics.performance = metrics.performance.filter(m => m.timestamp >= cutoff);
    metrics.errors = metrics.errors.filter(m => m.timestamp >= cutoff);
    metrics.system = metrics.system.filter(m => m.timestamp >= cutoff);
    metrics.userAnalytics = metrics.userAnalytics.filter(m => m.timestamp >= cutoff);
    
    logger.debug('Metrics cleanup completed');
  };
  
  // Schedule regular cleanup
  setInterval(cleanupMetrics, 24 * 60 * 60 * 1000); // Daily
};

/**
 * Get performance metrics
 * @param startTime Start time (timestamp)
 * @param endTime End time (timestamp)
 * @param route Filter by route (optional)
 * @param userId Filter by user ID (optional)
 */
export const getPerformanceMetrics = (
  startTime: number,
  endTime: number,
  route?: string,
  userId?: number
) => {
  let filteredMetrics = metrics.performance.filter(
    m => m.timestamp >= startTime && m.timestamp <= endTime
  );
  
  if (route) {
    filteredMetrics = filteredMetrics.filter(m => m.route === route);
  }
  
  if (userId) {
    filteredMetrics = filteredMetrics.filter(m => m.userId === userId);
  }
  
  return filteredMetrics;
};

/**
 * Get error metrics
 * @param startTime Start time (timestamp)
 * @param endTime End time (timestamp)
 * @param route Filter by route (optional)
 * @param userId Filter by user ID (optional)
 */
export const getErrorMetrics = (
  startTime: number,
  endTime: number,
  route?: string,
  userId?: number
) => {
  let filteredMetrics = metrics.errors.filter(
    m => m.timestamp >= startTime && m.timestamp <= endTime
  );
  
  if (route) {
    filteredMetrics = filteredMetrics.filter(m => m.route === route);
  }
  
  if (userId) {
    filteredMetrics = filteredMetrics.filter(m => m.userId === userId);
  }
  
  return filteredMetrics;
};

/**
 * Get system metrics
 * @param startTime Start time (timestamp)
 * @param endTime End time (timestamp)
 */
export const getSystemMetrics = (startTime: number, endTime: number) => {
  return metrics.system.filter(
    m => m.timestamp >= startTime && m.timestamp <= endTime
  );
};

/**
 * Get user analytics
 * @param startTime Start time (timestamp)
 * @param endTime End time (timestamp)
 * @param event Filter by event (optional)
 * @param userId Filter by user ID (optional)
 */
export const getUserAnalytics = (
  startTime: number,
  endTime: number,
  event?: string,
  userId?: number
) => {
  let filteredAnalytics = metrics.userAnalytics.filter(
    m => m.timestamp >= startTime && m.timestamp <= endTime
  );
  
  if (event) {
    filteredAnalytics = filteredAnalytics.filter(m => m.event === event);
  }
  
  if (userId) {
    filteredAnalytics = filteredAnalytics.filter(m => m.userId === userId);
  }
  
  return filteredAnalytics;
};

/**
 * Get current system health
 */
export const getSystemHealth = async () => {
  // Get latest system metric
  const latestSystemMetric = metrics.system.length > 0
    ? metrics.system[metrics.system.length - 1]
    : null;
  
  // Check database connection
  let dbStatus = 'healthy';
  try {
    await db.execute('SELECT 1');
  } catch (error) {
    dbStatus = 'unhealthy';
  }
  
  // Calculate average response time for the last minute
  const lastMinuteMetrics = metrics.performance.filter(
    m => m.timestamp > Date.now() - 60 * 1000
  );
  
  const avgResponseTime = lastMinuteMetrics.length > 0
    ? lastMinuteMetrics.reduce((sum, m) => sum + m.responseTime, 0) / lastMinuteMetrics.length
    : 0;
  
  // Calculate error rate for the last minute
  const lastMinuteErrors = metrics.errors.filter(
    m => m.timestamp > Date.now() - 60 * 1000
  );
  
  const errorRate = lastMinuteMetrics.length > 0
    ? (lastMinuteErrors.length / lastMinuteMetrics.length) * 100
    : 0;
  
  return {
    timestamp: Date.now(),
    status: dbStatus === 'healthy' && errorRate < 5 ? 'healthy' : 'degraded',
    cpuUsage: latestSystemMetric?.cpuUsage || 0,
    memoryUsage: latestSystemMetric?.memoryUsage || 0,
    activeConnections: activeConnections,
    pendingRequests: pendingRequests,
    avgResponseTime,
    errorRate,
    dbStatus,
    uptime: process.uptime(),
  };
};

export default {
  initMonitoring,
  performanceMonitoring,
  errorMonitoring,
  trackEvent,
  getPerformanceMetrics,
  getErrorMetrics,
  getSystemMetrics,
  getUserAnalytics,
  getSystemHealth,
};
