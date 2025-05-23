/**
 * API Monitoring Service
 *
 * This service provides comprehensive monitoring for API requests and responses,
 * including performance metrics, error tracking, and usage statistics.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { config } from '../config';
import { logger } from '../utils/logger';

// Define interfaces for monitoring data
interface ApiRequestLog {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  body?: any;
  userId?: number;
  userAgent?: string;
  ip?: string;
  responseTime?: number;
  statusCode?: number;
  error?: any;
  correlationId: string;
}

interface ApiMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  requestsPerEndpoint: Record<string, number>;
  errorsPerEndpoint: Record<string, number>;
  responseTimePerEndpoint: Record<string, number>;
  statusCodes: Record<string, number>;
}

// In-memory storage for metrics (would use Redis in production)
let metrics: ApiMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  averageResponseTime: 0,
  requestsPerEndpoint: {},
  errorsPerEndpoint: {},
  responseTimePerEndpoint: {},
  statusCodes: {},
};

// Reset metrics periodically (e.g., hourly)
const resetMetricsInterval = 3600000; // 1 hour
setInterval(() => {
  logger.info('Resetting API metrics');
  metrics = {
    totalRequests: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    requestsPerEndpoint: {},
    errorsPerEndpoint: {},
    responseTimePerEndpoint: {},
    statusCodes: {},
  };
}, resetMetricsInterval);

/**
 * API Monitoring Service
 */
class ApiMonitoringService {
  private enabled: boolean;
  private logLevel: 'none' | 'error' | 'info' | 'debug';
  private sampleRate: number;
  private excludePaths: string[];
  private sensitiveHeaders: string[];
  private sensitiveBodyFields: string[];

  constructor() {
    // Load configuration
    this.enabled = config.monitoring?.api?.enabled ?? true;
    this.logLevel = config.monitoring?.api?.logLevel ?? 'info';
    this.sampleRate = config.monitoring?.api?.sampleRate ?? 1.0; // 1.0 = 100% of requests
    this.excludePaths = config.monitoring?.api?.excludePaths ?? [
      '/api/healthcheck',
      '/api/metrics',
      '/api/monitoring',
    ];
    this.sensitiveHeaders = config.monitoring?.api?.sensitiveHeaders ?? [
      'authorization',
      'cookie',
      'set-cookie',
    ];
    this.sensitiveBodyFields = config.monitoring?.api?.sensitiveBodyFields ?? [
      'password',
      'token',
      'secret',
      'apiKey',
    ];
  }

  /**
   * Initialize the API monitoring service
   */
  public initialize(): void {
    if (!this.enabled) {
      logger.info('API monitoring is disabled');
      return;
    }

    logger.info('Initializing API monitoring service', {
      logLevel: this.logLevel,
      sampleRate: this.sampleRate,
      excludePaths: this.excludePaths,
    });
  }

  /**
   * Middleware to monitor API requests and responses
   */
  public monitoringMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.enabled) {
      return next();
    }

    // Skip monitoring for excluded paths
    if (this.shouldExcludePath(req.path)) {
      return next();
    }

    // Apply sampling rate
    if (Math.random() > this.sampleRate) {
      return next();
    }

    // Generate correlation ID for request tracking
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.headers['x-correlation-id'] = correlationId;

    // Record start time
    const startTime = process.hrtime();

    // Create request log
    const requestLog: ApiRequestLog = {
      id: uuidv4(),
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      query: req.query,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'] as string,
      ip: req.ip,
      correlationId,
    };

    // Log request if debug level
    if (this.logLevel === 'debug') {
      logger.debug('API Request', { request: requestLog });
    }

    // Update metrics
    metrics.totalRequests++;
    const endpoint = `${req.method} ${req.path}`;
    metrics.requestsPerEndpoint[endpoint] = (metrics.requestsPerEndpoint[endpoint] || 0) + 1;

    // Capture response
    const originalSend = res.send;
    res.send = function(body): Response {
      // Calculate response time
      const hrTime = process.hrtime(startTime);
      const responseTimeMs = hrTime[0] * 1000 + hrTime[1] / 1000000;

      // Update request log with response data
      requestLog.responseTime = responseTimeMs;
      requestLog.statusCode = res.statusCode;

      // Update metrics
      metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTimeMs) / metrics.totalRequests;
      metrics.responseTimePerEndpoint[endpoint] = (metrics.responseTimePerEndpoint[endpoint] || 0) + responseTimeMs;
      metrics.statusCodes[res.statusCode] = (metrics.statusCodes[res.statusCode] || 0) + 1;

      if (res.statusCode >= 400) {
        metrics.totalErrors++;
        metrics.errorsPerEndpoint[endpoint] = (metrics.errorsPerEndpoint[endpoint] || 0) + 1;

        // Log error responses
        if (this.logLevel === 'error' || this.logLevel === 'info' || this.logLevel === 'debug') {
          logger.error('API Error Response', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseTime: responseTimeMs,
            correlationId,
            body: typeof body === 'string' ? body.substring(0, 200) : body,
          });
        }
      } else if (this.logLevel === 'info' || this.logLevel === 'debug') {
        // Log successful responses
        logger.info('API Response', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTime: responseTimeMs,
          correlationId,
        });
      }

      // Store request log in database (async) if the function is available
      if (typeof this.storeRequestLog === 'function') {
        this.storeRequestLog(requestLog).catch(err => {
          logger.error('Failed to store API request log', { error: err });
        });
      }

      // Call original send
      return originalSend.call(this, body);
    };

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  };

  /**
   * Get current API metrics
   */
  public getMetrics(): ApiMetrics {
    return { ...metrics };
  }

  /**
   * Get detailed API logs
   */
  public async getLogs(options: {
    startDate?: Date;
    endDate?: Date;
    method?: string;
    path?: string;
    statusCode?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiRequestLog[]> {
    // Implementation would depend on your database schema
    // This is a placeholder
    return [];
  }

  /**
   * Check if a path should be excluded from monitoring
   */
  private shouldExcludePath(path: string): boolean {
    return this.excludePaths.some(excludePath => {
      if (excludePath.endsWith('*')) {
        const prefix = excludePath.slice(0, -1);
        return path.startsWith(prefix);
      }
      return path === excludePath;
    });
  }

  /**
   * Sanitize request headers to remove sensitive information
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };

    for (const header of this.sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };

    for (const field of this.sensitiveBodyFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Store request log in database
   */
  private async storeRequestLog(log: ApiRequestLog): Promise<void> {
    // Implementation would depend on your database schema
    // This is a placeholder
    try {
      // In a real implementation, you would store this in your database
      // For example:
      // await db.insert(apiRequestLogs).values({
      //   id: log.id,
      //   timestamp: log.timestamp,
      //   method: log.method,
      //   path: log.path,
      //   // ... other fields
      // });

      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Storing API request log', { id: log.id });
      }
    } catch (error) {
      logger.error('Failed to store API request log', { error });
    }
  }
}

// Create and export singleton instance
const apiMonitoringService = new ApiMonitoringService();
export default apiMonitoringService;
