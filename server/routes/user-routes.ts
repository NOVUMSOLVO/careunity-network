/**
 * User API Routes
 *
 * This file contains routes for user management, including:
 * - User profile management
 * - User preferences
 * - User settings
 */

import express from 'express';
import { db } from '../db';
import { users, userPreferences } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { ApiError } from '../middleware/error-handler';
import {
  updateUserSchema,
  updateUserPreferencesSchema,
  idParamSchema,
  userQuerySchema
} from '@shared/validation/user';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated);

/**
 * Get current user profile
 * GET /api/v2/users/me
 */
router.get('/me', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const result = await db.select().from(users).where(eq(users.id, userId));

    if (result.length === 0) {
      throw ApiError.notFound(`User with ID ${userId} not found`);
    }

    // Get user preferences
    const preferencesResult = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));

    // Remove password from user object
    const { password, ...userWithoutPassword } = result[0];

    res.json({
      ...userWithoutPassword,
      preferences: preferencesResult[0] || {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update current user profile
 * PATCH /api/v2/users/me
 */
router.patch('/me', validateBody(updateUserSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId));

    if (existingUser.length === 0) {
      throw ApiError.notFound(`User with ID ${userId} not found`);
    }

    // Update user
    const result = await db.update(users)
      .set(req.body)
      .where(eq(users.id, userId))
      .returning();

    // Remove password from user object
    const { password, ...userWithoutPassword } = result[0];

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

/**
 * Update user preferences
 * PATCH /api/v2/users/me/preferences
 */
router.patch('/me/preferences', validateBody(updateUserPreferencesSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Check if preferences exist
    const existingPreferences = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));

    if (existingPreferences.length === 0) {
      // Create preferences
      const result = await db.insert(userPreferences)
        .values({
          userId,
          ...req.body
        })
        .returning();

      res.json(result[0]);
    } else {
      // Update preferences
      const result = await db.update(userPreferences)
        .set(req.body)
        .where(eq(userPreferences.userId, userId))
        .returning();

      res.json(result[0]);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Get user by ID (admin only)
 * GET /api/v2/users/:id
 */
router.get('/:id', ensureRole(['admin', 'system_admin']), validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.select().from(users).where(eq(users.id, id));

    if (result.length === 0) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = result[0];

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

export default router;
