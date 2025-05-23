/**
 * API Routes
 * 
 * This file exports all API routes with versioning support.
 */

import express from 'express';
import v1Routes from './v1';
import { errorHandler, notFoundHandler } from '../middleware/error-handler';
import monitoringService from '../services/monitoring-service';
import auditService from '../services/audit-service';

const router = express.Router();

// Initialize services
monitoringService.initMonitoring();
auditService.initAuditService();

// Mount API versions
router.use('/v1', v1Routes);

// For backward compatibility, also mount v1 routes at the root
router.use('/', v1Routes);

// Add error monitoring middleware
router.use(monitoringService.errorMonitoring);

// Add error handling middleware
router.use(errorHandler);

// Add 404 handler for any unmatched routes
router.use(notFoundHandler);

export default router;
