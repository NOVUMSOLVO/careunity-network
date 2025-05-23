/**
 * Main API routes file
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import apiRoutes from '../api';
import { securityHeaders } from '../middleware/content-security';
import monitoringService from '../services/monitoring-service';
import auditService from '../services/audit-service';
import twoFactorRoutes from './two-factor-routes';
import securityRoutes from './security-routes';
import { csrfCookieMiddleware, csrfProtectionMiddleware } from '../middleware/csrf-protection';
import { apiRateLimiter, authRateLimiter } from '../middleware/enhanced-rate-limiter';

const router = express.Router();

// Apply security headers
router.use(...securityHeaders());

// Apply cookie parser middleware
router.use(cookieParser());

// Apply CSRF protection
router.use(csrfCookieMiddleware);
router.use(csrfProtectionMiddleware);

// Apply rate limiting
router.use(apiRateLimiter);

// Apply performance monitoring
router.use(monitoringService.performanceMonitoring);

// Apply audit logging middleware
router.use(auditService.authAuditMiddleware);
router.use(auditService.dataAccessAuditMiddleware);

// Mount the API routes
router.use('/', apiRoutes);

// Mount the two-factor authentication routes
router.use('/2fa', authRateLimiter, twoFactorRoutes);

// Mount the security routes
router.use('/api/v2/security', securityRoutes);

export default router;
