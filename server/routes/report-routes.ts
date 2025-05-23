/**
 * Report API Routes
 *
 * This file contains routes for generating and retrieving reports, including:
 * - Care quality reports
 * - Staff performance reports
 * - Visit statistics
 * - Financial reports
 * - Custom reports
 */

import express from 'express';
import { db } from '../db';
import { visits, users, staff, serviceUsers, carePlans, goals, tasks } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { validateQuery } from '../middleware/validation';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { ApiError } from '../middleware/error-handler';
import { reportQuerySchema } from '@shared/validation/report';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

/**
 * Get care quality report
 * GET /api/v2/reports/care-quality
 */
router.get('/care-quality', ensureRole(['admin', 'manager', 'supervisor']), validateQuery(reportQuerySchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (!startDate || !endDate) {
      throw ApiError.badRequest('Start date and end date are required');
    }

    // Query visit data
    const visitData = await db.select({
      totalVisits: sql`COUNT(*)`,
      completedVisits: sql`SUM(CASE WHEN ${visits.status} = 'completed' THEN 1 ELSE 0 END)`,
      missedVisits: sql`SUM(CASE WHEN ${visits.status} = 'missed' THEN 1 ELSE 0 END)`,
      lateVisits: sql`SUM(CASE WHEN ${visits.status} = 'completed' AND ${visits.actualStartTime} > ${visits.startTime} THEN 1 ELSE 0 END)`,
      averageRating: sql`AVG(${visits.rating})`,
      averageDuration: sql`AVG(${visits.actualDuration})`
    })
    .from(visits)
    .where(and(
      gte(visits.date, startDate),
      lte(visits.date, endDate)
    ));

    // Query care plan compliance
    const carePlanData = await db.select({
      totalTasks: sql`COUNT(*)`,
      completedTasks: sql`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      overdueTasks: sql`SUM(CASE WHEN ${tasks.status} = 'overdue' THEN 1 ELSE 0 END)`
    })
    .from(tasks)
    .innerJoin(goals, eq(tasks.goalId, goals.id))
    .innerJoin(carePlans, eq(goals.carePlanId, carePlans.id))
    .where(and(
      gte(tasks.dueDate, startDate),
      lte(tasks.dueDate, endDate)
    ));

    // Calculate metrics
    const visitMetrics = visitData[0];
    const carePlanMetrics = carePlanData[0];

    const visitCompletionRate = visitMetrics.totalVisits > 0
      ? (Number(visitMetrics.completedVisits) / Number(visitMetrics.totalVisits)) * 100
      : 0;

    const taskCompletionRate = carePlanMetrics.totalTasks > 0
      ? (Number(carePlanMetrics.completedTasks) / Number(carePlanMetrics.totalTasks)) * 100
      : 0;

    const punctualityRate = visitMetrics.completedVisits > 0
      ? ((Number(visitMetrics.completedVisits) - Number(visitMetrics.lateVisits)) / Number(visitMetrics.completedVisits)) * 100
      : 0;

    // Prepare report
    const report = {
      period: {
        startDate,
        endDate
      },
      visitMetrics: {
        totalVisits: Number(visitMetrics.totalVisits),
        completedVisits: Number(visitMetrics.completedVisits),
        missedVisits: Number(visitMetrics.missedVisits),
        lateVisits: Number(visitMetrics.lateVisits),
        visitCompletionRate: visitCompletionRate.toFixed(2),
        punctualityRate: punctualityRate.toFixed(2),
        averageRating: Number(visitMetrics.averageRating).toFixed(2),
        averageDuration: Number(visitMetrics.averageDuration).toFixed(2)
      },
      carePlanMetrics: {
        totalTasks: Number(carePlanMetrics.totalTasks),
        completedTasks: Number(carePlanMetrics.completedTasks),
        overdueTasks: Number(carePlanMetrics.overdueTasks),
        taskCompletionRate: taskCompletionRate.toFixed(2)
      },
      qualityScore: ((visitCompletionRate + taskCompletionRate + punctualityRate) / 3).toFixed(2)
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * Get staff performance report
 * GET /api/v2/reports/staff-performance
 */
router.get('/staff-performance', ensureRole(['admin', 'manager', 'supervisor']), validateQuery(reportQuerySchema), async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;

    // Validate date range
    if (!startDate || !endDate) {
      throw ApiError.badRequest('Start date and end date are required');
    }

    // Build query
    let query = db.select({
      staffId: users.id,
      staffName: users.name,
      totalVisits: sql`COUNT(*)`,
      completedVisits: sql`SUM(CASE WHEN ${visits.status} = 'completed' THEN 1 ELSE 0 END)`,
      missedVisits: sql`SUM(CASE WHEN ${visits.status} = 'missed' THEN 1 ELSE 0 END)`,
      lateVisits: sql`SUM(CASE WHEN ${visits.status} = 'completed' AND ${visits.actualStartTime} > ${visits.startTime} THEN 1 ELSE 0 END)`,
      averageRating: sql`AVG(${visits.rating})`,
      totalHours: sql`SUM(${visits.actualDuration}) / 60`
    })
    .from(visits)
    .innerJoin(users, eq(visits.caregiverId, users.id))
    .where(and(
      gte(visits.date, startDate),
      lte(visits.date, endDate)
    ))
    .groupBy(users.id, users.name);

    // Filter by staff ID if provided
    if (staffId) {
      query = query.where(eq(users.id, staffId));
    }

    // Execute query
    const staffPerformance = await query;

    // Calculate additional metrics
    const staffMetrics = staffPerformance.map(staff => {
      const completionRate = staff.totalVisits > 0
        ? (Number(staff.completedVisits) / Number(staff.totalVisits)) * 100
        : 0;

      const punctualityRate = staff.completedVisits > 0
        ? ((Number(staff.completedVisits) - Number(staff.lateVisits)) / Number(staff.completedVisits)) * 100
        : 0;

      return {
        ...staff,
        completionRate: completionRate.toFixed(2),
        punctualityRate: punctualityRate.toFixed(2),
        performanceScore: ((completionRate + punctualityRate + (Number(staff.averageRating) * 20)) / 3).toFixed(2)
      };
    });

    res.json({
      period: {
        startDate,
        endDate
      },
      staffMetrics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get visit statistics report
 * GET /api/v2/reports/visit-statistics
 */
router.get('/visit-statistics', validateQuery(reportQuerySchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (!startDate || !endDate) {
      throw ApiError.badRequest('Start date and end date are required');
    }

    // Query visit data by day
    const dailyStats = await db.select({
      date: visits.date,
      totalVisits: sql`COUNT(*)`,
      completedVisits: sql`SUM(CASE WHEN ${visits.status} = 'completed' THEN 1 ELSE 0 END)`,
      missedVisits: sql`SUM(CASE WHEN ${visits.status} = 'missed' THEN 1 ELSE 0 END)`,
      totalHours: sql`SUM(${visits.actualDuration}) / 60`
    })
    .from(visits)
    .where(and(
      gte(visits.date, startDate),
      lte(visits.date, endDate)
    ))
    .groupBy(visits.date)
    .orderBy(visits.date);

    // Query visit data by type
    const visitTypeStats = await db.select({
      visitType: visits.visitType,
      totalVisits: sql`COUNT(*)`,
      averageDuration: sql`AVG(${visits.actualDuration})`,
      averageRating: sql`AVG(${visits.rating})`
    })
    .from(visits)
    .where(and(
      gte(visits.date, startDate),
      lte(visits.date, endDate)
    ))
    .groupBy(visits.visitType);

    res.json({
      period: {
        startDate,
        endDate
      },
      dailyStats,
      visitTypeStats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
