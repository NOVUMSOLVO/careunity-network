/**
 * Security Monitoring Service
 *
 * This service monitors security-related events and triggers alerts
 * when suspicious activities are detected.
 */

import { Request } from 'express';
import { db } from '../db';
import { logger } from '../utils/logger';
import { WebSocketService } from './websocket-service';
import auditService from './audit-service';
import { emailService } from '../utils/email';

// Types
interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: SecurityAlertType;
  severity: AlertSeverity;
  source: string;
  message: string;
  details: Record<string, any>;
  status: AlertStatus;
}

type SecurityAlertType =
  | 'failed_login'
  | 'account_locked'
  | 'password_changed'
  | 'permission_changed'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'unusual_login_location'
  | 'data_access_anomaly'
  | 'api_abuse'
  | 'csrf_attack'
  | 'xss_attempt'
  | 'sql_injection_attempt'
  | 'sensitive_data_access';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'false_positive';

// Configuration
interface SecurityMonitoringConfig {
  enabled: boolean;
  alertThresholds: {
    failedLoginAttempts: number;
    apiRateLimit: number;
    sensitiveDataAccess: number;
  };
  notifyEmail: boolean;
  notifyWebSocket: boolean;
  notifyLog: boolean;
  adminEmails: string[];
}

// Default configuration
const DEFAULT_CONFIG: SecurityMonitoringConfig = {
  enabled: true,
  alertThresholds: {
    failedLoginAttempts: 5,
    apiRateLimit: 100,
    sensitiveDataAccess: 10
  },
  notifyEmail: true,
  notifyWebSocket: true,
  notifyLog: true,
  adminEmails: ['admin@careunity.com']
};

// In-memory storage for alerts and tracking
let config: SecurityMonitoringConfig = { ...DEFAULT_CONFIG };
const alerts: SecurityAlert[] = [];
const failedLoginAttempts: Record<string, { count: number, lastAttempt: Date }> = {};
const apiRequests: Record<string, { count: number, lastRequest: Date }> = {};
const sensitiveDataAccess: Record<string, { count: number, lastAccess: Date }> = {};

/**
 * Initialize the security monitoring service
 * @param customConfig Custom configuration
 */
export function initSecurityMonitoring(customConfig?: Partial<SecurityMonitoringConfig>): void {
  config = { ...DEFAULT_CONFIG, ...customConfig };
  logger.info('Security monitoring service initialized');
}

/**
 * Track failed login attempts
 * @param username Username
 * @param ipAddress IP address
 * @param userAgent User agent
 */
export function trackFailedLogin(username: string, ipAddress: string, userAgent: string): void {
  if (!config.enabled) return;

  const key = `${username}:${ipAddress}`;
  const now = new Date();

  if (!failedLoginAttempts[key]) {
    failedLoginAttempts[key] = { count: 0, lastAttempt: now };
  }

  failedLoginAttempts[key].count++;
  failedLoginAttempts[key].lastAttempt = now;

  // Check if threshold is exceeded
  if (failedLoginAttempts[key].count >= config.alertThresholds.failedLoginAttempts) {
    createAlert({
      type: 'brute_force_attempt',
      severity: 'high',
      source: 'login',
      message: `Multiple failed login attempts for user ${username}`,
      details: {
        username,
        ipAddress,
        userAgent,
        attempts: failedLoginAttempts[key].count
      }
    });

    // Reset counter after alert
    failedLoginAttempts[key].count = 0;
  }
}

/**
 * Track API requests
 * @param req Express request
 */
export function trackApiRequest(req: Request): void {
  if (!config.enabled) return;

  const ipAddress = req.ip;
  const endpoint = req.path;
  const method = req.method;
  const now = new Date();
  const key = `${ipAddress}:${endpoint}:${method}`;

  if (!apiRequests[key]) {
    apiRequests[key] = { count: 0, lastRequest: now };
  }

  apiRequests[key].count++;
  apiRequests[key].lastRequest = now;

  // Reset counter if last request was more than 1 hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (apiRequests[key].lastRequest < oneHourAgo) {
    apiRequests[key].count = 1;
    apiRequests[key].lastRequest = now;
    return;
  }

  // Check if threshold is exceeded
  if (apiRequests[key].count >= config.alertThresholds.apiRateLimit) {
    createAlert({
      type: 'api_abuse',
      severity: 'medium',
      source: 'api',
      message: `API rate limit exceeded for ${endpoint}`,
      details: {
        ipAddress,
        endpoint,
        method,
        requests: apiRequests[key].count,
        timeWindow: '1 hour'
      }
    });

    // Reset counter after alert
    apiRequests[key].count = 0;
  }
}

/**
 * Track sensitive data access
 * @param userId User ID
 * @param resourceType Resource type
 * @param resourceId Resource ID
 * @param action Action
 */
export function trackSensitiveDataAccess(
  userId: number,
  resourceType: string,
  resourceId: string | number,
  action: string
): void {
  if (!config.enabled) return;

  const now = new Date();
  const key = `${userId}:${resourceType}`;

  if (!sensitiveDataAccess[key]) {
    sensitiveDataAccess[key] = { count: 0, lastAccess: now };
  }

  sensitiveDataAccess[key].count++;
  sensitiveDataAccess[key].lastAccess = now;

  // Reset counter if last access was more than 1 hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (sensitiveDataAccess[key].lastAccess < oneHourAgo) {
    sensitiveDataAccess[key].count = 1;
    sensitiveDataAccess[key].lastAccess = now;
    return;
  }

  // Check if threshold is exceeded
  if (sensitiveDataAccess[key].count >= config.alertThresholds.sensitiveDataAccess) {
    createAlert({
      type: 'sensitive_data_access',
      severity: 'high',
      source: 'data_access',
      message: `Unusual access pattern for sensitive data: ${resourceType}`,
      details: {
        userId,
        resourceType,
        resourceId,
        action,
        accessCount: sensitiveDataAccess[key].count,
        timeWindow: '1 hour'
      }
    });

    // Reset counter after alert
    sensitiveDataAccess[key].count = 0;
  }
}

/**
 * Create a security alert
 * @param alertData Alert data
 */
export function createAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'status'>): void {
  if (!config.enabled) return;

  const alert: SecurityAlert = {
    id: generateAlertId(),
    timestamp: new Date(),
    status: 'new',
    ...alertData
  };

  // Store alert
  alerts.push(alert);

  // Log alert
  if (config.notifyLog) {
    logger.warn(`Security Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, {
      alert: {
        type: alert.type,
        source: alert.source,
        details: alert.details
      }
    });
  }

  // Send email notification
  if (config.notifyEmail && config.adminEmails.length > 0) {
    sendAlertEmail(alert);
  }

  // Send WebSocket notification
  if (config.notifyWebSocket) {
    sendAlertWebSocket(alert);
  }

  // Create audit log entry
  auditService.createAuditLog({
    eventType: 'security_alert',
    userId: alert.details.userId || 0,
    username: alert.details.username || 'system',
    ipAddress: alert.details.ipAddress || '',
    userAgent: alert.details.userAgent || '',
    resourceType: alert.source,
    resourceId: alert.id,
    action: alert.type,
    details: {
      severity: alert.severity,
      message: alert.message,
      ...alert.details
    }
  });
}

/**
 * Generate a unique alert ID
 * @returns Alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Send alert email
 * @param alert Security alert
 */
function sendAlertEmail(alert: SecurityAlert): void {
  try {
    const subject = `[CareUnity] Security Alert: ${alert.severity.toUpperCase()} - ${alert.type}`;

    const body = `
      <h2>Security Alert</h2>
      <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
      <p><strong>Type:</strong> ${alert.type}</p>
      <p><strong>Source:</strong> ${alert.source}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
      <h3>Details:</h3>
      <pre>${JSON.stringify(alert.details, null, 2)}</pre>
    `;

    for (const email of config.adminEmails) {
      emailService.sendEmail({
        to: email,
        subject: subject,
        html: body
      });
    }
  } catch (error) {
    logger.error('Failed to send alert email:', error);
  }
}

/**
 * Send alert via WebSocket
 * @param alert Security alert
 */
function sendAlertWebSocket(alert: SecurityAlert): void {
  try {
    const websocketService = (global as any).websocketService as WebSocketService;

    if (websocketService) {
      websocketService.broadcast('security_alert', {
        id: alert.id,
        timestamp: alert.timestamp,
        type: alert.type,
        severity: alert.severity,
        source: alert.source,
        message: alert.message
      });
    }
  } catch (error) {
    logger.error('Failed to send alert via WebSocket:', error);
  }
}

/**
 * Get all security alerts
 * @param limit Maximum number of alerts to return
 * @param offset Offset for pagination
 * @returns Security alerts
 */
export function getAlerts(limit: number = 100, offset: number = 0): SecurityAlert[] {
  return alerts
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(offset, offset + limit);
}

/**
 * Update alert status
 * @param alertId Alert ID
 * @param status New status
 * @returns Updated alert
 */
export function updateAlertStatus(alertId: string, status: AlertStatus): SecurityAlert | null {
  const alert = alerts.find(a => a.id === alertId);

  if (alert) {
    alert.status = status;
    return alert;
  }

  return null;
}

export default {
  initSecurityMonitoring,
  trackFailedLogin,
  trackApiRequest,
  trackSensitiveDataAccess,
  createAlert,
  getAlerts,
  updateAlertStatus
};
