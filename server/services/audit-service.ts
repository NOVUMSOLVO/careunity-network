/**
 * Security Audit Logging Service
 * 
 * Provides security audit logging functionality.
 * Features:
 * - Audit log generation for security-related events
 * - Tamper-evident logging
 * - Compliance with security standards
 * - Searchable audit trail
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// Audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_ENABLE = 'two_factor_enable',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  TWO_FACTOR_SUCCESS = 'two_factor_success',
  TWO_FACTOR_FAILURE = 'two_factor_failure',
  
  // User management events
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ROLE_CHANGE = 'user_role_change',
  
  // Data access events
  DATA_ACCESS = 'data_access',
  DATA_EXPORT = 'data_export',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  
  // System events
  SYSTEM_CONFIGURATION_CHANGE = 'system_configuration_change',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  
  // Integration events
  INTEGRATION_ACCESS = 'integration_access',
  INTEGRATION_CONFIGURATION_CHANGE = 'integration_configuration_change',
}

// Audit log entry interface
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details: Record<string, any>;
  hash?: string;
  previousEntryHash?: string;
}

// In-memory cache of the last audit log hash
let lastAuditLogHash: string | null = null;

/**
 * Initialize the audit service
 */
export const initAuditService = async () => {
  try {
    // Get the hash of the last audit log entry
    const lastEntry = await db.select({
      id: 'audit_logs.id',
      hash: 'audit_logs.hash',
    })
    .from('audit_logs')
    .orderBy('audit_logs.timestamp', 'desc')
    .limit(1);
    
    if (lastEntry.length > 0) {
      lastAuditLogHash = lastEntry[0].hash;
    }
    
    logger.info('Audit service initialized');
  } catch (error) {
    logger.error('Error initializing audit service:', error);
  }
};

/**
 * Create an audit log entry
 * @param eventType Audit event type
 * @param userId User ID (if available)
 * @param username Username (if available)
 * @param ipAddress IP address (if available)
 * @param userAgent User agent (if available)
 * @param resourceType Resource type (if applicable)
 * @param resourceId Resource ID (if applicable)
 * @param action Action description
 * @param details Additional details
 * @returns Created audit log entry
 */
export const createAuditLog = async (
  eventType: AuditEventType,
  userId?: number,
  username?: string,
  ipAddress?: string,
  userAgent?: string,
  resourceType?: string,
  resourceId?: string,
  action?: string,
  details: Record<string, any> = {}
): Promise<AuditLogEntry> => {
  try {
    const timestamp = new Date().toISOString();
    
    // Create the audit log entry
    const entry: Omit<AuditLogEntry, 'hash' | 'previousEntryHash'> = {
      id: uuid(),
      timestamp,
      eventType,
      userId,
      username,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      action: action || eventType,
      details,
    };
    
    // Calculate hash for tamper evidence
    const entryString = JSON.stringify(entry);
    const previousHash = lastAuditLogHash || '';
    const hash = crypto.createHash('sha256')
      .update(entryString + previousHash)
      .digest('hex');
    
    // Add hash to entry
    const completeEntry: AuditLogEntry = {
      ...entry,
      hash,
      previousEntryHash: lastAuditLogHash || undefined,
    };
    
    // Store in database
    await db.insert('audit_logs').values(completeEntry);
    
    // Update last hash
    lastAuditLogHash = hash;
    
    return completeEntry;
  } catch (error) {
    logger.error('Error creating audit log:', error);
    throw error;
  }
};

/**
 * Create an audit log from a request
 * @param req Express request
 * @param eventType Audit event type
 * @param action Action description
 * @param details Additional details
 * @returns Created audit log entry
 */
export const createAuditLogFromRequest = async (
  req: Request,
  eventType: AuditEventType,
  action?: string,
  details: Record<string, any> = {}
): Promise<AuditLogEntry> => {
  const userId = (req as any).user?.id;
  const username = (req as any).user?.username;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];
  
  // Extract resource type and ID from URL
  const urlParts = req.path.split('/').filter(Boolean);
  let resourceType: string | undefined;
  let resourceId: string | undefined;
  
  if (urlParts.length >= 2) {
    resourceType = urlParts[0];
    resourceId = urlParts[1];
  } else if (urlParts.length === 1) {
    resourceType = urlParts[0];
  }
  
  return createAuditLog(
    eventType,
    userId,
    username,
    ipAddress,
    userAgent,
    resourceType,
    resourceId,
    action,
    details
  );
};

/**
 * Authentication audit middleware
 */
export const authAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to capture response
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Only audit authentication endpoints
    if (req.path.includes('/auth/login') || req.path.includes('/auth/logout')) {
      const eventType = req.path.includes('/login')
        ? (res.statusCode === 200 ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILURE)
        : AuditEventType.LOGOUT;
      
      const details: Record<string, any> = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
      };
      
      // Add username for login attempts
      if (req.path.includes('/login') && req.body?.username) {
        details.attemptedUsername = req.body.username;
      }
      
      // Create audit log
      createAuditLogFromRequest(req, eventType, undefined, details)
        .catch(error => logger.error('Error creating auth audit log:', error));
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Data access audit middleware
 */
export const dataAccessAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip for non-data endpoints
  if (req.path.startsWith('/api/v2/monitoring') || 
      req.path.startsWith('/api/v2/health') ||
      req.method === 'OPTIONS') {
    return next();
  }
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to capture response
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Determine event type based on HTTP method
    let eventType: AuditEventType;
    
    switch (req.method) {
      case 'GET':
        eventType = AuditEventType.DATA_ACCESS;
        break;
      case 'POST':
        eventType = AuditEventType.DATA_MODIFICATION;
        break;
      case 'PUT':
      case 'PATCH':
        eventType = AuditEventType.DATA_MODIFICATION;
        break;
      case 'DELETE':
        eventType = AuditEventType.DATA_DELETION;
        break;
      default:
        eventType = AuditEventType.DATA_ACCESS;
    }
    
    // Only audit successful requests
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const details: Record<string, any> = {
        method: req.method,
        path: req.path,
        query: req.query,
      };
      
      // Create audit log
      createAuditLogFromRequest(req, eventType, undefined, details)
        .catch(error => logger.error('Error creating data access audit log:', error));
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Get audit logs
 * @param startTime Start time (ISO string)
 * @param endTime End time (ISO string)
 * @param eventType Filter by event type (optional)
 * @param userId Filter by user ID (optional)
 * @param resourceType Filter by resource type (optional)
 * @param resourceId Filter by resource ID (optional)
 * @param limit Maximum number of logs to return (default: 100)
 * @param offset Offset for pagination (default: 0)
 * @returns Audit logs and count
 */
export const getAuditLogs = async (
  startTime: string,
  endTime: string,
  eventType?: AuditEventType,
  userId?: number,
  resourceType?: string,
  resourceId?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ logs: AuditLogEntry[]; total: number }> => {
  try {
    // Build query
    let query = db.select()
      .from('audit_logs')
      .where('audit_logs.timestamp', '>=', startTime)
      .where('audit_logs.timestamp', '<=', endTime);
    
    // Apply filters
    if (eventType) {
      query = query.where('audit_logs.event_type', '=', eventType);
    }
    
    if (userId) {
      query = query.where('audit_logs.user_id', '=', userId);
    }
    
    if (resourceType) {
      query = query.where('audit_logs.resource_type', '=', resourceType);
    }
    
    if (resourceId) {
      query = query.where('audit_logs.resource_id', '=', resourceId);
    }
    
    // Get total count
    const countResult = await db.select({
      count: { value: 'audit_logs.id', fn: 'count' }
    })
    .from('audit_logs')
    .where('audit_logs.timestamp', '>=', startTime)
    .where('audit_logs.timestamp', '<=', endTime);
    
    const total = countResult[0].count.value;
    
    // Get logs with pagination
    const logs = await query
      .orderBy('audit_logs.timestamp', 'desc')
      .limit(limit)
      .offset(offset);
    
    return { logs, total };
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    throw error;
  }
};

/**
 * Verify audit log integrity
 * @param startTime Start time (ISO string)
 * @param endTime End time (ISO string)
 * @returns Verification result
 */
export const verifyAuditLogIntegrity = async (
  startTime: string,
  endTime: string
): Promise<{ valid: boolean; invalidEntries: string[] }> => {
  try {
    // Get logs in chronological order
    const logs = await db.select()
      .from('audit_logs')
      .where('audit_logs.timestamp', '>=', startTime)
      .where('audit_logs.timestamp', '<=', endTime)
      .orderBy('audit_logs.timestamp', 'asc');
    
    const invalidEntries: string[] = [];
    let previousHash: string | null = null;
    
    // Verify each log entry
    for (const log of logs) {
      // Check if previous hash matches
      if (previousHash !== null && log.previousEntryHash !== previousHash) {
        invalidEntries.push(log.id);
        continue;
      }
      
      // Calculate hash
      const entryWithoutHash = { ...log };
      delete entryWithoutHash.hash;
      delete entryWithoutHash.previousEntryHash;
      
      const entryString = JSON.stringify(entryWithoutHash);
      const previousHashValue = log.previousEntryHash || '';
      const calculatedHash = crypto.createHash('sha256')
        .update(entryString + previousHashValue)
        .digest('hex');
      
      // Check if calculated hash matches stored hash
      if (calculatedHash !== log.hash) {
        invalidEntries.push(log.id);
      }
      
      previousHash = log.hash;
    }
    
    return {
      valid: invalidEntries.length === 0,
      invalidEntries,
    };
  } catch (error) {
    logger.error('Error verifying audit log integrity:', error);
    throw error;
  }
};

export default {
  initAuditService,
  createAuditLog,
  createAuditLogFromRequest,
  authAuditMiddleware,
  dataAccessAuditMiddleware,
  getAuditLogs,
  verifyAuditLogIntegrity,
};
