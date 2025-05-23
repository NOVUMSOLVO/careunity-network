/**
 * Performance Alert Service
 * 
 * This service monitors performance metrics and triggers alerts when thresholds are exceeded.
 * It integrates with the monitoring service, query optimizer, and cache service to collect metrics.
 */

import { logger } from '../utils/logger';
import monitoringService from './monitoring-service';
import queryOptimizer from '../db/query-optimizer';
import cacheService from './cache-service';
import { WebSocketService } from './websocket-service';
import { sendEmail } from '../utils/email';

// Types
interface AlertThresholds {
  apiResponseTime: number;        // milliseconds
  slowQueryThreshold: number;     // milliseconds
  cpuUsageThreshold: number;      // percentage
  memoryUsageThreshold: number;   // percentage
  cacheHitRatioThreshold: number; // ratio (0-1)
  errorRateThreshold: number;     // percentage
}

interface AlertConfig {
  enabled: boolean;
  checkIntervalSeconds: number;
  thresholds: AlertThresholds;
  notifyEmail: boolean;
  notifyWebSocket: boolean;
  notifyLog: boolean;
  cooldownMinutes: number;
}

interface AlertEvent {
  id: string;
  timestamp: number;
  type: 'api' | 'database' | 'system' | 'cache' | 'error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details: Record<string, any>;
  acknowledged: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AlertConfig = {
  enabled: true,
  checkIntervalSeconds: 60,
  thresholds: {
    apiResponseTime: 500,        // 500ms
    slowQueryThreshold: 1000,    // 1000ms
    cpuUsageThreshold: 80,       // 80%
    memoryUsageThreshold: 80,    // 80%
    cacheHitRatioThreshold: 0.5, // 50%
    errorRateThreshold: 5        // 5%
  },
  notifyEmail: false,
  notifyWebSocket: true,
  notifyLog: true,
  cooldownMinutes: 15
};

// Store alerts in memory
const alerts: AlertEvent[] = [];
const lastAlertsByType: Record<string, number> = {};
let checkInterval: NodeJS.Timeout | null = null;

/**
 * Initialize the performance alert service
 */
export function initPerformanceAlerts(config: Partial<AlertConfig> = {}): void {
  const mergedConfig: AlertConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!mergedConfig.enabled) {
    logger.info('Performance alerts are disabled');
    return;
  }
  
  logger.info('Initializing performance alert service');
  
  // Start periodic checks
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  checkInterval = setInterval(() => {
    checkPerformanceMetrics(mergedConfig);
  }, mergedConfig.checkIntervalSeconds * 1000);
  
  logger.info(`Performance alerts will check every ${mergedConfig.checkIntervalSeconds} seconds`);
}

/**
 * Stop the performance alert service
 */
export function stopPerformanceAlerts(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  
  logger.info('Performance alert service stopped');
}

/**
 * Check performance metrics against thresholds
 */
async function checkPerformanceMetrics(config: AlertConfig): Promise<void> {
  try {
    const now = Date.now();
    
    // Check API response times
    checkApiResponseTimes(now, config);
    
    // Check slow queries
    checkSlowQueries(now, config);
    
    // Check system resources
    checkSystemResources(now, config);
    
    // Check cache performance
    checkCachePerformance(now, config);
    
    // Check error rates
    checkErrorRates(now, config);
  } catch (error) {
    logger.error('Error checking performance metrics:', error);
  }
}

/**
 * Check API response times
 */
function checkApiResponseTimes(now: number, config: AlertConfig): void {
  // Get recent performance metrics (last 5 minutes)
  const metrics = monitoringService.getPerformanceMetrics(
    now - 5 * 60 * 1000,
    now
  );
  
  if (metrics.length === 0) {
    return;
  }
  
  // Calculate average response time
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  
  // Check if threshold is exceeded
  if (avgResponseTime > config.thresholds.apiResponseTime) {
    // Group by route to find slow routes
    const routeMetrics: Record<string, { count: number, totalTime: number }> = {};
    
    metrics.forEach(metric => {
      if (!routeMetrics[metric.route]) {
        routeMetrics[metric.route] = { count: 0, totalTime: 0 };
      }
      
      routeMetrics[metric.route].count++;
      routeMetrics[metric.route].totalTime += metric.responseTime;
    });
    
    // Find routes exceeding threshold
    const slowRoutes = Object.entries(routeMetrics)
      .map(([route, data]) => ({
        route,
        avgTime: data.totalTime / data.count,
        count: data.count
      }))
      .filter(route => route.avgTime > config.thresholds.apiResponseTime)
      .sort((a, b) => b.avgTime - a.avgTime);
    
    if (slowRoutes.length > 0) {
      createAlert({
        type: 'api',
        severity: 'warning',
        message: `API response time threshold exceeded (${avgResponseTime.toFixed(2)}ms)`,
        details: {
          avgResponseTime,
          threshold: config.thresholds.apiResponseTime,
          slowRoutes
        }
      }, config);
    }
  }
}

/**
 * Check slow queries
 */
function checkSlowQueries(now: number, config: AlertConfig): void {
  // Get slow queries
  const slowQueries = queryOptimizer.getSlowQueries(config.thresholds.slowQueryThreshold);
  
  if (slowQueries.length > 0) {
    createAlert({
      type: 'database',
      severity: 'warning',
      message: `${slowQueries.length} slow queries detected`,
      details: {
        slowQueries: slowQueries.slice(0, 5), // Include top 5 slow queries
        threshold: config.thresholds.slowQueryThreshold
      }
    }, config);
  }
}

/**
 * Check system resources
 */
function checkSystemResources(now: number, config: AlertConfig): void {
  // Get recent system metrics (last 5 minutes)
  const metrics = monitoringService.getSystemMetrics(
    now - 5 * 60 * 1000,
    now
  );
  
  if (metrics.length === 0) {
    return;
  }
  
  // Calculate average CPU and memory usage
  const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
  const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
  
  // Check if CPU threshold is exceeded
  if (avgCpuUsage > config.thresholds.cpuUsageThreshold) {
    createAlert({
      type: 'system',
      severity: avgCpuUsage > 90 ? 'critical' : 'warning',
      message: `CPU usage threshold exceeded (${avgCpuUsage.toFixed(2)}%)`,
      details: {
        avgCpuUsage,
        threshold: config.thresholds.cpuUsageThreshold,
        samples: metrics.length
      }
    }, config);
  }
  
  // Check if memory threshold is exceeded
  if (avgMemoryUsage > config.thresholds.memoryUsageThreshold) {
    createAlert({
      type: 'system',
      severity: avgMemoryUsage > 90 ? 'critical' : 'warning',
      message: `Memory usage threshold exceeded (${avgMemoryUsage.toFixed(2)}%)`,
      details: {
        avgMemoryUsage,
        threshold: config.thresholds.memoryUsageThreshold,
        samples: metrics.length
      }
    }, config);
  }
}

/**
 * Check cache performance
 */
function checkCachePerformance(now: number, config: AlertConfig): void {
  // Get cache stats
  const stats = cacheService.getStats();
  
  // Calculate hit ratio
  const hitRatio = stats.hits / (stats.hits + stats.misses) || 0;
  
  // Check if hit ratio is below threshold
  if (hitRatio < config.thresholds.cacheHitRatioThreshold && (stats.hits + stats.misses) > 100) {
    createAlert({
      type: 'cache',
      severity: 'info',
      message: `Cache hit ratio below threshold (${(hitRatio * 100).toFixed(2)}%)`,
      details: {
        hitRatio,
        threshold: config.thresholds.cacheHitRatioThreshold,
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys
      }
    }, config);
  }
}

/**
 * Check error rates
 */
function checkErrorRates(now: number, config: AlertConfig): void {
  // Get recent error metrics (last 5 minutes)
  const errors = monitoringService.getErrorMetrics(
    now - 5 * 60 * 1000,
    now
  );
  
  // Get recent performance metrics (last 5 minutes)
  const metrics = monitoringService.getPerformanceMetrics(
    now - 5 * 60 * 1000,
    now
  );
  
  if (metrics.length === 0) {
    return;
  }
  
  // Calculate error rate
  const errorRate = (errors.length / metrics.length) * 100;
  
  // Check if error rate exceeds threshold
  if (errorRate > config.thresholds.errorRateThreshold) {
    // Group errors by route
    const routeErrors: Record<string, number> = {};
    
    errors.forEach(error => {
      routeErrors[error.route] = (routeErrors[error.route] || 0) + 1;
    });
    
    // Sort routes by error count
    const topErrorRoutes = Object.entries(routeErrors)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    createAlert({
      type: 'error',
      severity: errorRate > 10 ? 'critical' : 'warning',
      message: `Error rate threshold exceeded (${errorRate.toFixed(2)}%)`,
      details: {
        errorRate,
        threshold: config.thresholds.errorRateThreshold,
        totalErrors: errors.length,
        totalRequests: metrics.length,
        topErrorRoutes
      }
    }, config);
  }
}

/**
 * Create a new alert
 */
function createAlert(
  alert: Omit<AlertEvent, 'id' | 'timestamp' | 'acknowledged'>,
  config: AlertConfig
): void {
  const now = Date.now();
  const alertType = `${alert.type}:${alert.message}`;
  
  // Check cooldown period
  if (lastAlertsByType[alertType] && (now - lastAlertsByType[alertType]) < config.cooldownMinutes * 60 * 1000) {
    return;
  }
  
  // Update last alert timestamp
  lastAlertsByType[alertType] = now;
  
  // Create alert object
  const alertEvent: AlertEvent = {
    id: `${alert.type}-${now}`,
    timestamp: now,
    ...alert,
    acknowledged: false
  };
  
  // Add to alerts array
  alerts.push(alertEvent);
  
  // Keep only the last 100 alerts
  if (alerts.length > 100) {
    alerts.shift();
  }
  
  // Log alert
  if (config.notifyLog) {
    const logMethod = alertEvent.severity === 'critical' ? logger.error : 
                      alertEvent.severity === 'warning' ? logger.warn : 
                      logger.info;
    
    logMethod(`[Performance Alert] ${alertEvent.message}`);
  }
  
  // Send email notification
  if (config.notifyEmail) {
    sendEmailAlert(alertEvent);
  }
  
  // Send WebSocket notification
  if (config.notifyWebSocket) {
    sendWebSocketAlert(alertEvent);
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(alert: AlertEvent): Promise<void> {
  try {
    const subject = `[CareUnity] ${alert.severity.toUpperCase()} Performance Alert: ${alert.message}`;
    const body = `
      <h2>Performance Alert</h2>
      <p><strong>Type:</strong> ${alert.type}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
      <h3>Details</h3>
      <pre>${JSON.stringify(alert.details, null, 2)}</pre>
    `;
    
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject,
      html: body
    });
  } catch (error) {
    logger.error('Failed to send alert email:', error);
  }
}

/**
 * Send WebSocket alert
 */
function sendWebSocketAlert(alert: AlertEvent): void {
  try {
    const websocketService = (global as any).websocketService as WebSocketService;
    
    if (websocketService) {
      websocketService.broadcast('performance-alert', alert);
    }
  } catch (error) {
    logger.error('Failed to send WebSocket alert:', error);
  }
}

/**
 * Get all alerts
 */
export function getAlerts(limit: number = 50): AlertEvent[] {
  return alerts
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = alerts.find(a => a.id === alertId);
  
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  
  return false;
}

export default {
  initPerformanceAlerts,
  stopPerformanceAlerts,
  getAlerts,
  acknowledgeAlert
};
