/**
 * Care Plan API routes
 */

import express from 'express';
import { db } from '../db';
import { carePlans, goals, tasks, serviceUsers } from '@shared/schema';
import {
  createCarePlanSchema,
  updateCarePlanSchema,
  createGoalSchema,
  updateGoalSchema,
  createTaskSchema,
  updateTaskSchema
} from '@shared/types/care-plan';
import { validateBody, validateParams, idParamSchema, validateQuery, searchQuerySchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { eq, and, sql } from 'drizzle-orm';
import { ensureAuthenticated } from '../middleware/auth';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendConflict
} from '../utils/api-response';

const router = express.Router();

/**
 * Get all care plans
 * GET /api/care-plans
 */
router.get('/', ensureAuthenticated, validateQuery(searchQuerySchema), async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get total count for pagination
    const countQuery = db.select({ count: sql`count(*)` }).from(carePlans);
    const [countResult] = await countQuery;
    const total = Number(countResult?.count || 0);

    // Apply pagination
    const offset = (page - 1) * limit;
    const results = await db.select().from(carePlans).limit(limit).offset(offset);

    // Send response with pagination metadata
    sendSuccess(res, results, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a care plan by ID
 * GET /api/care-plans/:id
 */
router.get('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (result.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    sendSuccess(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a care plan with its goals and tasks
 * GET /api/care-plans/:id/with-goals-and-tasks
 */
router.get('/:id/with-goals-and-tasks', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the care plan
    const carePlanResult = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (carePlanResult.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    const carePlan = carePlanResult[0];

    // Get the goals for this care plan
    const goalsResult = await db.select().from(goals).where(eq(goals.carePlanId, id));

    // Get the tasks for each goal
    const goalsWithTasks = await Promise.all(goalsResult.map(async (goal) => {
      const tasksResult = await db.select().from(tasks).where(eq(tasks.goalId, goal.id));
      return {
        ...goal,
        tasks: tasksResult,
      };
    }));

    // Combine the results
    const result = {
      ...carePlan,
      goals: goalsWithTasks,
    };

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new care plan
 * POST /api/care-plans
 */
router.post('/', ensureAuthenticated, validateBody(createCarePlanSchema), async (req, res, next) => {
  try {
    // Check if the service user exists
    const serviceUserResult = await db.select().from(serviceUsers).where(eq(serviceUsers.id, req.body.serviceUserId));

    if (serviceUserResult.length === 0) {
      return sendBadRequest(res, `Service user with ID ${req.body.serviceUserId} not found`);
    }

    // Create the care plan
    const result = await db.insert(carePlans).values(req.body).returning();

    sendCreated(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a care plan
 * PATCH /api/care-plans/:id
 */
router.patch('/:id', ensureAuthenticated, validateParams(idParamSchema), validateBody(updateCarePlanSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the care plan exists
    const existingPlan = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (existingPlan.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    // If serviceUserId is being updated, check if the service user exists
    if (req.body.serviceUserId) {
      const serviceUserResult = await db.select().from(serviceUsers).where(eq(serviceUsers.id, req.body.serviceUserId));

      if (serviceUserResult.length === 0) {
        return sendBadRequest(res, `Service user with ID ${req.body.serviceUserId} not found`);
      }
    }

    // Update the care plan
    const result = await db.update(carePlans)
      .set(req.body)
      .where(eq(carePlans.id, id))
      .returning();

    sendSuccess(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a care plan
 * DELETE /api/care-plans/:id
 */
router.delete('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the care plan exists
    const existingPlan = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (existingPlan.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    // Delete the care plan
    await db.delete(carePlans).where(eq(carePlans.id, id));

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all goals for a care plan
 * GET /api/care-plans/:id/goals
 */
router.get('/:id/goals', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the care plan exists
    const existingPlan = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (existingPlan.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    // Get the goals for this care plan
    const goalsResult = await db.select().from(goals).where(eq(goals.carePlanId, id));

    sendSuccess(res, goalsResult);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new goal for a care plan
 * POST /api/care-plans/:id/goals
 */
router.post('/:id/goals', ensureAuthenticated, validateParams(idParamSchema), validateBody(createGoalSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the care plan exists
    const existingPlan = await db.select().from(carePlans).where(eq(carePlans.id, id));

    if (existingPlan.length === 0) {
      return sendNotFound(res, `Care plan with ID ${id} not found`);
    }

    // Create the goal
    const result = await db.insert(goals).values({
      ...req.body,
      carePlanId: id,
    }).returning();

    sendCreated(res, result[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
