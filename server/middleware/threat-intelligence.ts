/**
 * Threat Intelligence Middleware
 * 
 * This middleware integrates the threat intelligence service with Express.
 * It checks incoming requests against known threats and takes appropriate action.
 */

import { Request, Response, NextFunction } from 'express';
import threatIntelligenceService from '../services/threat-intelligence-service';
import securityMonitoringService from '../services/security-monitoring-service';
import { logger } from '../utils/logger';

// Configuration
interface ThreatIntelligenceMiddlewareConfig {
  enabled: boolean;
  blockHighSeverity: boolean;
  logAllThreats: boolean;
  alertOnMediumSeverity: boolean;
  ipHeaderName: string;
}

// Default configuration
const DEFAULT_CONFIG: ThreatIntelligenceMiddlewareConfig = {
  enabled: true,
  blockHighSeverity: true,
  logAllThreats: true,
  alertOnMediumSeverity: true,
  ipHeaderName: 'x-forwarded-for'
};

// Current configuration
let config: ThreatIntelligenceMiddlewareConfig = { ...DEFAULT_CONFIG };

/**
 * Initialize the threat intelligence middleware
 * @param customConfig Custom configuration
 */
export function initThreatIntelligenceMiddleware(customConfig?: Partial<ThreatIntelligenceMiddlewareConfig>): void {
  config = { ...DEFAULT_CONFIG, ...customConfig };
  logger.info('Threat intelligence middleware initialized');
}

/**
 * Middleware to check IP addresses against threat intelligence
 */
export function checkIPThreatIntelligence(req: Request, res: Response, next: NextFunction): void {
  if (!config.enabled) {
    return next();
  }
  
  try {
    // Get client IP address
    const ipHeader = req.headers[config.ipHeaderName];
    const clientIP = ipHeader 
      ? (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader).split(',')[0].trim()
      : req.ip;
    
    // Check IP against threat intelligence
    const threatIndicator = threatIntelligenceService.checkIP(clientIP);
    
    if (threatIndicator) {
      // Add threat information to request
      (req as any).threatInfo = threatIndicator;
      
      // Log the threat
      if (config.logAllThreats) {
        logger.warn(`Threat detected: ${clientIP} (${threatIndicator.severity})`, {
          ip: clientIP,
          threat: threatIndicator,
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent']
        });
      }
      
      // Create security alert for medium and high severity threats
      if ((threatIndicator.severity === 'medium' && config.alertOnMediumSeverity) || 
          threatIndicator.severity === 'high' || 
          threatIndicator.severity === 'critical') {
        securityMonitoringService.createAlert({
          type: 'suspicious_activity',
          severity: threatIndicator.severity === 'critical' ? 'critical' : 
                   threatIndicator.severity === 'high' ? 'high' : 'medium',
          source: 'threat_intelligence',
          message: `Malicious IP address detected: ${clientIP}`,
          details: {
            ip: clientIP,
            threatType: threatIndicator.type,
            threatSource: threatIndicator.source,
            confidence: threatIndicator.confidence,
            description: threatIndicator.description,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent']
          }
        });
      }
      
      // Block high severity threats if configured
      if (config.blockHighSeverity && 
          (threatIndicator.severity === 'high' || threatIndicator.severity === 'critical')) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been identified as a security threat.'
        });
      }
    }
    
    // Continue to next middleware
    next();
  } catch (error) {
    logger.error('Error in threat intelligence middleware:', error);
    next();
  }
}

/**
 * Middleware to check domains against threat intelligence
 */
export function checkDomainThreatIntelligence(req: Request, res: Response, next: NextFunction): void {
  if (!config.enabled) {
    return next();
  }
  
  try {
    // Get referrer domain
    const referrer = req.headers.referer || req.headers.referrer;
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer as string);
        const referrerDomain = referrerUrl.hostname;
        
        // Check domain against threat intelligence
        const threatIndicator = threatIntelligenceService.checkDomain(referrerDomain);
        
        if (threatIndicator) {
          // Add threat information to request
          (req as any).threatInfo = threatIndicator;
          
          // Log the threat
          if (config.logAllThreats) {
            logger.warn(`Threat detected: ${referrerDomain} (${threatIndicator.severity})`, {
              domain: referrerDomain,
              threat: threatIndicator,
              path: req.path,
              method: req.method,
              userAgent: req.headers['user-agent']
            });
          }
          
          // Create security alert for medium and high severity threats
          if ((threatIndicator.severity === 'medium' && config.alertOnMediumSeverity) || 
              threatIndicator.severity === 'high' || 
              threatIndicator.severity === 'critical') {
            securityMonitoringService.createAlert({
              type: 'suspicious_activity',
              severity: threatIndicator.severity === 'critical' ? 'critical' : 
                      threatIndicator.severity === 'high' ? 'high' : 'medium',
              source: 'threat_intelligence',
              message: `Malicious domain detected: ${referrerDomain}`,
              details: {
                domain: referrerDomain,
                threatType: threatIndicator.type,
                threatSource: threatIndicator.source,
                confidence: threatIndicator.confidence,
                description: threatIndicator.description,
                path: req.path,
                method: req.method,
                userAgent: req.headers['user-agent']
              }
            });
          }
        }
      } catch (error) {
        // Invalid URL, ignore
      }
    }
    
    // Continue to next middleware
    next();
  } catch (error) {
    logger.error('Error in domain threat intelligence middleware:', error);
    next();
  }
}

/**
 * Middleware to check for suspicious user agents
 */
export function checkSuspiciousUserAgents(req: Request, res: Response, next: NextFunction): void {
  if (!config.enabled) {
    return next();
  }
  
  try {
    const userAgent = req.headers['user-agent'] || '';
    
    // List of suspicious user agents
    const suspiciousUserAgents = [
      'sqlmap',
      'nikto',
      'nessus',
      'nmap',
      'masscan',
      'zgrab',
      'gobuster',
      'dirbuster',
      'wpscan',
      'hydra',
      'medusa',
      'brutus',
      'burpsuite',
      'zap',
      'metasploit',
      'nuclei',
      'w3af',
      'acunetix',
      'appscan',
      'netsparker',
      'qualys',
      'python-requests',
      'go-http-client',
      'curl',
      'wget',
      'libwww-perl'
    ];
    
    // Check if user agent contains any suspicious strings
    const matchedAgent = suspiciousUserAgents.find(agent => 
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );
    
    if (matchedAgent) {
      // Log the suspicious user agent
      logger.warn(`Suspicious user agent detected: ${userAgent}`, {
        userAgent,
        matchedPattern: matchedAgent,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      // Create security alert
      securityMonitoringService.createAlert({
        type: 'suspicious_activity',
        severity: 'medium',
        source: 'threat_intelligence',
        message: `Suspicious user agent detected: ${matchedAgent}`,
        details: {
          userAgent,
          matchedPattern: matchedAgent,
          path: req.path,
          method: req.method,
          ip: req.ip
        }
      });
    }
    
    // Continue to next middleware
    next();
  } catch (error) {
    logger.error('Error in suspicious user agent middleware:', error);
    next();
  }
}

/**
 * Middleware to check for suspicious query parameters
 */
export function checkSuspiciousQueryParams(req: Request, res: Response, next: NextFunction): void {
  if (!config.enabled) {
    return next();
  }
  
  try {
    const query = req.query;
    
    // List of suspicious query parameter patterns
    const suspiciousPatterns = [
      /union\s+select/i,
      /select\s+.*\s+from/i,
      /drop\s+table/i,
      /--/,
      /;/,
      /'.*'/,
      /<script>/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /eval\(/i,
      /document\.cookie/i,
      /\.\.\/\.\.\/\.\.\//,
      /etc\/passwd/i,
      /win\.ini/i
    ];
    
    // Check each query parameter
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            // Log the suspicious query parameter
            logger.warn(`Suspicious query parameter detected: ${key}=${value}`, {
              parameter: key,
              value,
              pattern: pattern.toString(),
              path: req.path,
              method: req.method,
              ip: req.ip
            });
            
            // Create security alert
            securityMonitoringService.createAlert({
              type: 'suspicious_activity',
              severity: 'high',
              source: 'threat_intelligence',
              message: `Suspicious query parameter detected: ${key}`,
              details: {
                parameter: key,
                value,
                pattern: pattern.toString(),
                path: req.path,
                method: req.method,
                ip: req.ip
              }
            });
            
            break;
          }
        }
      }
    }
    
    // Continue to next middleware
    next();
  } catch (error) {
    logger.error('Error in suspicious query parameter middleware:', error);
    next();
  }
}

export default {
  initThreatIntelligenceMiddleware,
  checkIPThreatIntelligence,
  checkDomainThreatIntelligence,
  checkSuspiciousUserAgents,
  checkSuspiciousQueryParams
};
