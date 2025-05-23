/**
 * Task API routes
 */

import express from 'express';
import { db } from '../db';
import { tasks } from '@shared/schema';
import { updateTaskSchema } from '@shared/types/care-plan';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { eq } from 'drizzle-orm';
import { ensureAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * Get a task by ID
 * GET /api/tasks/:id
 */
router.get('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (result.length === 0) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a task
 * PATCH /api/tasks/:id
 */
router.patch('/:id', ensureAuthenticated, validateParams(idParamSchema), validateBody(updateTaskSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the task exists
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (existingTask.length === 0) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    
    // Update the task
    const result = await db.update(tasks)
      .set(req.body)
      .where(eq(tasks.id, id))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the task exists
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (existingTask.length === 0) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    
    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, id));
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * Complete a task
 * POST /api/tasks/:id/complete
 */
router.post('/:id/complete', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the task exists
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (existingTask.length === 0) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    
    // Update the task status to completed
    const result = await db.update(tasks)
      .set({ status: 'completed' })
      .where(eq(tasks.id, id))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
