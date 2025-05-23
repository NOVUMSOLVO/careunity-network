/**
 * Performance Metrics Service
 * 
 * This service collects, stores, and analyzes performance metrics for the CareUnity application.
 * It provides APIs for retrieving metrics and generating performance reports.
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import os from 'os';
import { db } from '../db';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

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

interface QueryMetric {
  id: string;
  timestamp: number;
  query: string;
  params: any;
  executionTime: number;
  source: string;
}

interface SystemMetric {
  id: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  pendingRequests: number;
}

interface CacheMetric {
  id: string;
  timestamp: number;
  cacheType: string;
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

// In-memory storage for metrics
// In production, these would be stored in a database or time-series database
const metrics = {
  performance: [] as PerformanceMetric[],
  queries: [] as QueryMetric[],
  system: [] as SystemMetric[],
  cache: [] as CacheMetric[],
};

// Configuration
const config = {
  sampleRate: 1.0, // 1.0 = 100% of requests are sampled
  systemMetricsInterval: 60000, // 1 minute
  retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
  errorAlertThreshold: 5, // Alert after 5 errors of the same type
  slowQueryThreshold: 500, // 500ms
  maxMetricsPerType: 10000, // Maximum number of metrics to store in memory
};

// Active connections counter
let activeConnections = 0;
let pendingRequests = 0;

// Interval ID for system metrics collection
let systemMetricsIntervalId: NodeJS.Timeout | null = null;

/**
 * Initialize the performance metrics service
 */
export function initializePerformanceMetrics() {
  // Start collecting system metrics
  startSystemMetricsCollection();
  
  // Start cleanup job
  startMetricsCleanup();
  
  logger.info('Performance metrics service initialized');
}

/**
 * Shutdown the performance metrics service
 */
export function shutdownPerformanceMetrics() {
  if (systemMetricsIntervalId) {
    clearInterval(systemMetricsIntervalId);
    systemMetricsIntervalId = null;
  }
  
  logger.info('Performance metrics service shutdown');
}

/**
 * Performance monitoring middleware
 */
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
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
      id: uuidv4(),
      timestamp: Date.now(),
      route: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    
    addMetric('performance', metric);
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} (${responseTime.toFixed(2)}ms)`);
    }
    
    // Call original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
}

/**
 * Track database query performance
 */
export function trackQueryPerformance(query: string, params: any, source: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const executionTime = performance.now() - start;
      
      const metric: QueryMetric = {
        id: uuidv4(),
        timestamp: Date.now(),
        query,
        params,
        executionTime,
        source,
      };
      
      addMetric('queries', metric);
      
      // Log slow queries
      if (executionTime > config.slowQueryThreshold) {
        logger.warn(`Slow query: ${query} (${executionTime.toFixed(2)}ms)`);
      }
      
      return executionTime;
    },
  };
}

/**
 * Track cache performance
 */
export function trackCachePerformance(cacheType: string, hits: number, misses: number, size: number, evictions: number) {
  const metric: CacheMetric = {
    id: uuidv4(),
    timestamp: Date.now(),
    cacheType,
    hits,
    misses,
    size,
    evictions,
  };
  
  addMetric('cache', metric);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(startTime?: number, endTime?: number) {
  return filterMetricsByTimeRange('performance', startTime, endTime);
}

/**
 * Get query metrics
 */
export function getQueryMetrics(startTime?: number, endTime?: number) {
  return filterMetricsByTimeRange('queries', startTime, endTime);
}

/**
 * Get system metrics
 */
export function getSystemMetrics(startTime?: number, endTime?: number) {
  return filterMetricsByTimeRange('system', startTime, endTime);
}

/**
 * Get cache metrics
 */
export function getCacheMetrics(startTime?: number, endTime?: number) {
  return filterMetricsByTimeRange('cache', startTime, endTime);
}

/**
 * Get slow queries
 */
export function getSlowQueries(threshold: number = config.slowQueryThreshold) {
  return metrics.queries
    .filter(metric => metric.executionTime > threshold)
    .sort((a, b) => b.executionTime - a.executionTime);
}

/**
 * Start collecting system metrics
 */
function startSystemMetricsCollection() {
  systemMetricsIntervalId = setInterval(() => {
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
      id: uuidv4(),
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      activeConnections,
      pendingRequests,
    };
    
    addMetric('system', metric);
  }, config.systemMetricsInterval);
}

/**
 * Start metrics cleanup job
 */
function startMetricsCleanup() {
  setInterval(() => {
    const now = Date.now();
    const cutoff = now - config.retentionPeriod;
    
    // Clean up old metrics
    for (const type in metrics) {
      (metrics as any)[type] = (metrics as any)[type].filter(
        (metric: any) => metric.timestamp >= cutoff
      );
    }
    
    // Enforce maximum metrics per type
    for (const type in metrics) {
      if ((metrics as any)[type].length > config.maxMetricsPerType) {
        (metrics as any)[type] = (metrics as any)[type].slice(
          (metrics as any)[type].length - config.maxMetricsPerType
        );
      }
    }
  }, 3600000); // Run every hour
}

/**
 * Add a metric to the in-memory storage
 */
function addMetric(type: keyof typeof metrics, metric: any) {
  metrics[type].push(metric);
  
  // Enforce maximum metrics per type
  if (metrics[type].length > config.maxMetricsPerType) {
    metrics[type].shift();
  }
}

/**
 * Filter metrics by time range
 */
function filterMetricsByTimeRange(type: keyof typeof metrics, startTime?: number, endTime?: number) {
  if (!startTime && !endTime) {
    return metrics[type];
  }
  
  return metrics[type].filter(metric => {
    if (startTime && metric.timestamp < startTime) {
      return false;
    }
    
    if (endTime && metric.timestamp > endTime) {
      return false;
    }
    
    return true;
  });
}

// Export the service
export const performanceMetricsService = {
  initialize: initializePerformanceMetrics,
  shutdown: shutdownPerformanceMetrics,
  middleware: performanceMonitoringMiddleware,
  trackQuery: trackQueryPerformance,
  trackCache: trackCachePerformance,
  getPerformanceMetrics,
  getQueryMetrics,
  getSystemMetrics,
  getCacheMetrics,
  getSlowQueries,
};
