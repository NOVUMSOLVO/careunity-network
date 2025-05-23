/**
 * API v1 Routes
 *
 * This file exports all API v1 routes.
 */

import express from 'express';
import serviceUserRoutes from '../../routes/service-users';
import carePlanRoutes from '../../routes/care-plans';
import goalRoutes from '../../routes/goals';
import taskRoutes from '../../routes/tasks';
import syncRoutes from '../../routes/sync';
import dashboardRoutes from '../../routes/dashboard';
import allocationRoutes from '../../routes/allocation';
import mlModelRoutes from '../../routes/ml-models';
import feedbackRoutes from '../../routes/feedback';
import userRoutes from '../../routes/user-routes';
import notificationRoutes from '../../routes/notification-routes';
import reportRoutes from '../../routes/report-routes';
import documentRoutes from '../../routes/document-routes';
import familyPortalRoutes from '../../routes/family-portal';
import externalIntegrationRoutes from '../../routes/external-integration';
import monitoringRoutes from '../../routes/monitoring-routes';
import apiMonitoringRoutes from '../../routes/api-monitoring';
import twoFactorRoutes from '../../routes/two-factor-routes';
import auditRoutes from '../../routes/audit-routes';
import performanceRoutes from '../../routes/performance-routes';
import imageRoutes from '../../routes/image-routes';
import visitsRoutes from '../../routes/visits';
import securityTrainingRoutes from '../../routes/security-training-routes';
import {
  apiRateLimiter,
  feedbackRateLimiter,
  usersRateLimiter,
  serviceUsersRateLimiter,
  mlModelsRateLimiter
} from '../../middleware/enhanced-rate-limiter';
import { securityHeaders } from '../../middleware/content-security';

const router = express.Router();

// Apply security headers
router.use(...securityHeaders());

// Apply global rate limiter
router.use(apiRateLimiter);

// Mount the routes
router.use('/service-users', serviceUsersRateLimiter, serviceUserRoutes);
router.use('/care-plans', carePlanRoutes);
router.use('/goals', goalRoutes);
router.use('/tasks', taskRoutes);
router.use('/sync', syncRoutes);
router.use('/allocation', allocationRoutes);
router.use('/ml-models', mlModelsRateLimiter, mlModelRoutes);
router.use('/feedback', feedbackRateLimiter, feedbackRoutes);
router.use('/users', usersRateLimiter, userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/documents', documentRoutes);
router.use('/family-portal', familyPortalRoutes);
router.use('/external-integration', externalIntegrationRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/api-monitoring', apiMonitoringRoutes);
router.use('/performance', performanceRoutes);
router.use('/visits', visitsRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/audit', auditRoutes);
router.use('/images', imageRoutes);
router.use('/security-training', securityTrainingRoutes);
router.use('/', dashboardRoutes);

export default router;
