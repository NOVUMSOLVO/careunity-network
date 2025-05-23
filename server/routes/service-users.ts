/**
 * Service User API routes
 */

import express from 'express';
import { db } from '../db';
import { serviceUsers, carePlans } from '@shared/schema';
import {
  createServiceUserSchema,
  updateServiceUserSchema
} from '@shared/types/service-user';
import { validateBody, validateParams, idParamSchema, validateQuery, searchQuerySchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { eq, like, and, or, sql } from 'drizzle-orm';
import { ensureAuthenticated } from '../middleware/auth';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendConflict,
  sendBadRequest
} from '../utils/api-response';

const router = express.Router();

/**
 * Get all service users
 * GET /api/service-users
 */
router.get('/', ensureAuthenticated, validateQuery(searchQuerySchema), async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    // Build the query
    let queryBuilder = db.select().from(serviceUsers);

    // Apply search filter if query is provided
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          like(serviceUsers.fullName, `%${query}%`),
          like(serviceUsers.uniqueId, `%${query}%`),
          like(serviceUsers.email, `%${query}%`)
        )
      );
    }

    // Get total count for pagination
    const countQuery = db.select({ count: sql`count(*)` }).from(serviceUsers);

    // Apply the same search filter to count query
    if (query) {
      countQuery.where(
        or(
          like(serviceUsers.fullName, `%${query}%`),
          like(serviceUsers.uniqueId, `%${query}%`),
          like(serviceUsers.email, `%${query}%`)
        )
      );
    }

    // Execute count query
    const [countResult] = await countQuery;
    const total = Number(countResult?.count || 0);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.limit(limit).offset(offset);

    // Execute main query
    const results = await queryBuilder;

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
 * Get a service user by ID
 * GET /api/service-users/:id
 */
router.get('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.select().from(serviceUsers).where(eq(serviceUsers.id, id));

    if (result.length === 0) {
      return sendNotFound(res, `Service user with ID ${id} not found`);
    }

    sendSuccess(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a service user with their care plans
 * GET /api/service-users/:id/with-care-plans
 */
router.get('/:id/with-care-plans', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the service user
    const serviceUserResult = await db.select().from(serviceUsers).where(eq(serviceUsers.id, id));

    if (serviceUserResult.length === 0) {
      return sendNotFound(res, `Service user with ID ${id} not found`);
    }

    const serviceUser = serviceUserResult[0];

    // Get the care plans for this service user
    const carePlansResult = await db.select().from(carePlans).where(eq(carePlans.serviceUserId, id));

    // Combine the results
    const result = {
      ...serviceUser,
      carePlans: carePlansResult,
    };

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new service user
 * POST /api/service-users
 */
router.post('/', ensureAuthenticated, validateBody(createServiceUserSchema), async (req, res, next) => {
  try {
    // Check if a service user with the same uniqueId already exists
    const existingUser = await db.select({ id: serviceUsers.id })
      .from(serviceUsers)
      .where(eq(serviceUsers.uniqueId, req.body.uniqueId));

    if (existingUser.length > 0) {
      return sendConflict(res, `Service user with uniqueId ${req.body.uniqueId} already exists`);
    }

    // Create the service user
    const result = await db.insert(serviceUsers).values(req.body).returning();

    sendCreated(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a service user
 * PATCH /api/service-users/:id
 */
router.patch('/:id', ensureAuthenticated, validateParams(idParamSchema), validateBody(updateServiceUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the service user exists
    const existingUser = await db.select().from(serviceUsers).where(eq(serviceUsers.id, id));

    if (existingUser.length === 0) {
      return sendNotFound(res, `Service user with ID ${id} not found`);
    }

    // If uniqueId is being updated, check if it's already in use
    if (req.body.uniqueId && req.body.uniqueId !== existingUser[0].uniqueId) {
      const duplicateUser = await db.select({ id: serviceUsers.id })
        .from(serviceUsers)
        .where(and(
          eq(serviceUsers.uniqueId, req.body.uniqueId),
          // Exclude the current user
          (user) => user.id !== id
        ));

      if (duplicateUser.length > 0) {
        return sendConflict(res, `Service user with uniqueId ${req.body.uniqueId} already exists`);
      }
    }

    // Update the service user
    const result = await db.update(serviceUsers)
      .set(req.body)
      .where(eq(serviceUsers.id, id))
      .returning();

    sendSuccess(res, result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a service user
 * DELETE /api/service-users/:id
 */
router.delete('/:id', ensureAuthenticated, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the service user exists
    const existingUser = await db.select().from(serviceUsers).where(eq(serviceUsers.id, id));

    if (existingUser.length === 0) {
      return sendNotFound(res, `Service user with ID ${id} not found`);
    }

    // Delete the service user
    await db.delete(serviceUsers).where(eq(serviceUsers.id, id));

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * Search service users
 * GET /api/service-users/search
 */
router.get('/search', ensureAuthenticated, validateQuery(searchQuerySchema), async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return sendSuccess(res, []);
    }

    const results = await db.select().from(serviceUsers).where(
      or(
        like(serviceUsers.fullName, `%${query}%`),
        like(serviceUsers.uniqueId, `%${query}%`),
        like(serviceUsers.email, `%${query}%`)
      )
    );

    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
});

export default router;
