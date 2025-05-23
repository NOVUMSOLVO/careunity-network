/**
 * Goal API routes
 */

import express from 'express';
import { db } from '../db';
import { goals, tasks } from '@shared/schema';
import { 
  updateGoalSchema,
  createTaskSchema
} from '@shared/types/care-plan';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { eq } from 'drizzle-orm';
import { ensureAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * Get a goal by ID
 * GET /api/goals/:id
 */
router.get('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.select().from(goals).where(eq(goals.id, id));
    
    if (result.length === 0) {
      throw ApiError.notFound(`Goal with ID ${id} not found`);
    }
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a goal
 * PATCH /api/goals/:id
 */
router.patch('/:id', ensureAuthenticated, validateParams(idParamSchema), validateBody(updateGoalSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the goal exists
    const existingGoal = await db.select().from(goals).where(eq(goals.id, id));
    
    if (existingGoal.length === 0) {
      throw ApiError.notFound(`Goal with ID ${id} not found`);
    }
    
    // Update the goal
    const result = await db.update(goals)
      .set(req.body)
      .where(eq(goals.id, id))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a goal
 * DELETE /api/goals/:id
 */
router.delete('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the goal exists
    const existingGoal = await db.select().from(goals).where(eq(goals.id, id));
    
    if (existingGoal.length === 0) {
      throw ApiError.notFound(`Goal with ID ${id} not found`);
    }
    
    // Delete the goal
    await db.delete(goals).where(eq(goals.id, id));
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * Get all tasks for a goal
 * GET /api/goals/:id/tasks
 */
router.get('/:id/tasks', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the goal exists
    const existingGoal = await db.select().from(goals).where(eq(goals.id, id));
    
    if (existingGoal.length === 0) {
      throw ApiError.notFound(`Goal with ID ${id} not found`);
    }
    
    // Get the tasks for this goal
    const tasksResult = await db.select().from(tasks).where(eq(tasks.goalId, id));
    
    res.json(tasksResult);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new task for a goal
 * POST /api/goals/:id/tasks
 */
router.post('/:id/tasks', ensureAuthenticated, validateParams(idParamSchema), validateBody(createTaskSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the goal exists
    const existingGoal = await db.select().from(goals).where(eq(goals.id, id));
    
    if (existingGoal.length === 0) {
      throw ApiError.notFound(`Goal with ID ${id} not found`);
    }
    
    // Create the task
    const result = await db.insert(tasks).values({
      ...req.body,
      goalId: id,
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
