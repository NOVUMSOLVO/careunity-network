/**
 * Visits API routes
 *
 * Provides endpoints for managing care visits.
 */

import express from 'express';
import { db } from '../db';
import { visits, users, serviceUsers } from '@shared/schema';
import { validateBody, validateParams, validateQuery, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { eq, and, gte, lte, like, or, inArray, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated);

// Define validation schemas
const visitStatusEnum = ['scheduled', 'in-progress', 'completed', 'cancelled', 'missed'] as const;
const visitPriorityEnum = ['low', 'normal', 'high'] as const;

// Visit query schema
const visitQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
  caregiverId: z.string().regex(/^\d+$/, "Caregiver ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  serviceUserId: z.string().regex(/^\d+$/, "Service User ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  status: z.enum(visitStatusEnum).optional(),
  visitType: z.string().optional(),
});

// Create visit schema
const createVisitSchema = z.object({
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
  caregiverId: z.number().int().positive("Caregiver ID must be a positive integer").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  status: z.enum(visitStatusEnum).default('scheduled'),
  notes: z.string().optional(),
  tasks: z.string().optional(), // JSON string of tasks
  priority: z.enum(visitPriorityEnum).default('normal'),
  visitType: z.string().min(1, "Visit type is required"),
}).refine(data => {
  // Ensure end time is after start time
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Update visit schema
const updateVisitSchema = z.object({
  caregiverId: z.number().int().positive("Caregiver ID must be a positive integer").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  startTime: z.string().datetime({ offset: true }).optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  status: z.enum(visitStatusEnum).optional(),
  notes: z.string().optional(),
  tasks: z.string().optional(), // JSON string of tasks
  priority: z.enum(visitPriorityEnum).optional(),
  visitType: z.string().min(1, "Visit type is required").optional(),
}).refine(data => {
  // If both start and end time are provided, ensure end time is after start time
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Complete visit schema
const completeVisitSchema = z.object({
  notes: z.string().optional(),
  feedback: z.string().optional(),
  feedbackRating: z.number().int().min(1).max(5).optional(),
});

// Cancel visit schema
const cancelVisitSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

/**
 * Get all visits
 * GET /api/v2/visits
 */
router.get('/', validateQuery(visitQuerySchema), async (req, res, next) => {
  try {
    const { date, startDate, endDate, caregiverId, serviceUserId, status, visitType } = req.query;

    // Build query
    let query = db.select({
      visit: visits,
      serviceUser: {
        id: serviceUsers.id,
        fullName: serviceUsers.fullName,
      },
      caregiver: {
        id: users.id,
        fullName: users.fullName,
      },
    })
    .from(visits)
    .leftJoin(serviceUsers, eq(visits.serviceUserId, serviceUsers.id))
    .leftJoin(users, eq(visits.caregiverId, users.id));

    // Apply filters
    if (date) {
      query = query.where(eq(visits.date, date as string));
    }

    if (startDate && endDate) {
      query = query.where(and(
        gte(visits.date, startDate as string),
        lte(visits.date, endDate as string)
      ));
    } else if (startDate) {
      query = query.where(gte(visits.date, startDate as string));
    } else if (endDate) {
      query = query.where(lte(visits.date, endDate as string));
    }

    if (caregiverId) {
      query = query.where(eq(visits.caregiverId, caregiverId as number));
    }

    if (serviceUserId) {
      query = query.where(eq(visits.serviceUserId, serviceUserId as number));
    }

    if (status) {
      query = query.where(eq(visits.status, status as any));
    }

    if (visitType) {
      query = query.where(eq(visits.visitType, visitType as string));
    }

    // Order by date and start time
    query = query.orderBy(visits.date, visits.startTime);

    const results = await query;

    // Transform results
    const transformedResults = results.map(({ visit, serviceUser, caregiver }) => ({
      ...visit,
      serviceUser: serviceUser ? {
        id: serviceUser.id,
        fullName: serviceUser.fullName,
      } : undefined,
      caregiver: caregiver ? {
        id: caregiver.id,
        fullName: caregiver.fullName,
      } : undefined,
    }));

    res.json(transformedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a visit by ID
 * GET /api/v2/visits/:id
 */
router.get('/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.select({
      visit: visits,
      serviceUser: {
        id: serviceUsers.id,
        fullName: serviceUsers.fullName,
      },
      caregiver: {
        id: users.id,
        fullName: users.fullName,
      },
    })
    .from(visits)
    .leftJoin(serviceUsers, eq(visits.serviceUserId, serviceUsers.id))
    .leftJoin(users, eq(visits.caregiverId, users.id))
    .where(eq(visits.id, id));

    if (result.length === 0) {
      throw ApiError.notFound(`Visit with ID ${id} not found`);
    }

    const { visit, serviceUser, caregiver } = result[0];

    res.json({
      ...visit,
      serviceUser: serviceUser ? {
        id: serviceUser.id,
        fullName: serviceUser.fullName,
      } : undefined,
      caregiver: caregiver ? {
        id: caregiver.id,
        fullName: caregiver.fullName,
      } : undefined,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new visit
 * POST /api/v2/visits
 */
router.post('/', validateBody(createVisitSchema), async (req, res, next) => {
  try {
    const { serviceUserId, caregiverId, ...visitData } = req.body;

    // Check if service user exists
    const serviceUser = await db.select().from(serviceUsers).where(eq(serviceUsers.id, serviceUserId));
    if (serviceUser.length === 0) {
      throw ApiError.badRequest(`Service user with ID ${serviceUserId} not found`);
    }

    // Check if caregiver exists (if provided)
    if (caregiverId) {
      const caregiver = await db.select().from(users).where(eq(users.id, caregiverId));
      if (caregiver.length === 0) {
        throw ApiError.badRequest(`Caregiver with ID ${caregiverId} not found`);
      }
    }

    // Create the visit
    const result = await db.insert(visits)
      .values({
        serviceUserId,
        caregiverId,
        ...visitData,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a visit
 * PUT /api/v2/visits/:id
 */
router.put('/:id', validateParams(idParamSchema), validateBody(updateVisitSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if visit exists
    const existingVisit = await db.select().from(visits).where(eq(visits.id, id));
    if (existingVisit.length === 0) {
      throw ApiError.notFound(`Visit with ID ${id} not found`);
    }

    // Check if caregiver exists (if provided)
    if (updateData.caregiverId) {
      const caregiver = await db.select().from(users).where(eq(users.id, updateData.caregiverId));
      if (caregiver.length === 0) {
        throw ApiError.badRequest(`Caregiver with ID ${updateData.caregiverId} not found`);
      }
    }

    // Update the visit
    const result = await db.update(visits)
      .set(updateData)
      .where(eq(visits.id, id))
      .returning();

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Complete a visit
 * POST /api/v2/visits/:id/complete
 */
router.post('/:id/complete', validateParams(idParamSchema), validateBody(completeVisitSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, feedback, feedbackRating } = req.body;

    // Check if visit exists
    const existingVisit = await db.select().from(visits).where(eq(visits.id, id));
    if (existingVisit.length === 0) {
      throw ApiError.notFound(`Visit with ID ${id} not found`);
    }

    // Update the visit
    const result = await db.update(visits)
      .set({
        status: 'completed',
        notes: notes || existingVisit[0].notes,
        feedback,
        feedbackRating,
        completedAt: new Date().toISOString(),
        completedBy: (req.user as any).id,
      })
      .where(eq(visits.id, id))
      .returning();

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel a visit
 * POST /api/v2/visits/:id/cancel
 */
router.post('/:id/cancel', validateParams(idParamSchema), validateBody(cancelVisitSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if visit exists
    const existingVisit = await db.select().from(visits).where(eq(visits.id, id));
    if (existingVisit.length === 0) {
      throw ApiError.notFound(`Visit with ID ${id} not found`);
    }

    // Update the visit
    const result = await db.update(visits)
      .set({
        status: 'cancelled',
        notes: existingVisit[0].notes
          ? `${existingVisit[0].notes}\n\nCancellation reason: ${reason}`
          : `Cancellation reason: ${reason}`,
      })
      .where(eq(visits.id, id))
      .returning();

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
