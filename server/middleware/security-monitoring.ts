/**
 * Security Monitoring Middleware
 * 
 * This middleware integrates the security monitoring service with Express.
 * It tracks API requests and detects suspicious activities.
 */

import { Request, Response, NextFunction } from 'express';
import securityMonitoringService from '../services/security-monitoring-service';

/**
 * Middleware to track API requests
 */
export function trackApiRequests(req: Request, res: Response, next: NextFunction): void {
  // Track the API request
  securityMonitoringService.trackApiRequest(req);
  
  // Continue
  next();
}

/**
 * Middleware to detect suspicious activities
 */
export function detectSuspiciousActivities(req: Request, res: Response, next: NextFunction): void {
  // Check for suspicious query parameters
  const suspiciousParams = ['<script>', 'javascript:', 'onerror=', 'onload=', 'SELECT', 'UNION', '--', '/*', '*/'];
  
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      for (const param of suspiciousParams) {
        if (value.toLowerCase().includes(param.toLowerCase())) {
          securityMonitoringService.createAlert({
            type: 'xss_attempt',
            severity: 'high',
            source: 'query_params',
            message: `Suspicious query parameter detected: ${key}`,
            details: {
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              path: req.path,
              method: req.method,
              parameter: key,
              value: value
            }
          });
          break;
        }
      }
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-host', 'x-forwarded-server', 'x-http-host-override'];
  
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      securityMonitoringService.createAlert({
        type: 'suspicious_activity',
        severity: 'medium',
        source: 'headers',
        message: `Suspicious header detected: ${header}`,
        details: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method,
          header: header,
          value: req.headers[header]
        }
      });
    }
  }
  
  // Check for suspicious user agent
  const suspiciousUserAgents = ['sqlmap', 'nikto', 'nessus', 'nmap', 'burp', 'hydra', 'wget', 'curl'];
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  for (const agent of suspiciousUserAgents) {
    if (userAgent.includes(agent)) {
      securityMonitoringService.createAlert({
        type: 'suspicious_activity',
        severity: 'medium',
        source: 'user_agent',
        message: `Suspicious user agent detected: ${agent}`,
        details: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method
        }
      });
      break;
    }
  }
  
  // Continue
  next();
}

/**
 * Middleware to track failed login attempts
 */
export function trackFailedLogins(req: Request, res: Response, next: NextFunction): void {
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Check if this is a login request
    if (req.path === '/api/auth/login' && req.method === 'POST' && res.statusCode === 401) {
      // Extract username from request body
      const username = req.body?.username || 'unknown';
      
      // Track failed login attempt
      securityMonitoringService.trackFailedLogin(
        username,
        req.ip,
        req.headers['user-agent'] || 'unknown'
      );
    }
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  // Continue
  next();
}

/**
 * Middleware to track sensitive data access
 */
export function trackSensitiveDataAccess(req: Request, res: Response, next: NextFunction): void {
  // Check if this is a request for sensitive data
  const sensitiveEndpoints = [
    { pattern: /\/api\/users\/\d+/, type: 'user', idParam: 'id' },
    { pattern: /\/api\/service-users\/\d+/, type: 'service_user', idParam: 'id' },
    { pattern: /\/api\/care-plans\/\d+/, type: 'care_plan', idParam: 'id' },
    { pattern: /\/api\/appointments\/\d+/, type: 'appointment', idParam: 'id' },
    { pattern: /\/api\/notes\/\d+/, type: 'note', idParam: 'id' },
    { pattern: /\/api\/risk-assessments\/\d+/, type: 'risk_assessment', idParam: 'id' }
  ];
  
  for (const endpoint of sensitiveEndpoints) {
    if (endpoint.pattern.test(req.path)) {
      // Extract resource ID from path
      const match = req.path.match(/\/(\d+)$/);
      const resourceId = match ? match[1] : 'unknown';
      
      // Track sensitive data access
      if (req.user) {
        securityMonitoringService.trackSensitiveDataAccess(
          req.user.id,
          endpoint.type,
          resourceId,
          req.method
        );
      }
      
      break;
    }
  }
  
  // Continue
  next();
}

export default {
  trackApiRequests,
  detectSuspiciousActivities,
  trackFailedLogins,
  trackSensitiveDataAccess
};
