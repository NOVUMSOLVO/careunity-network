/**
 * External System Integration API routes
 */

import express from 'express';
import { db } from '../db';
import { users, serviceUsers, carePlans, appointments, notes, documents } from '@shared/schema';
import { validateBody, validateParams, validateQuery, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { eq, and, gte, lte, like, or, inArray, desc } from 'drizzle-orm';
import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

// Most routes require admin or system_admin role
const adminRoutes = express.Router();
adminRoutes.use(ensureRole(['admin', 'system_admin']));

// Integration system schema
const integrationSystemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(['ehr', 'medication', 'billing', 'scheduling', 'other']),
  baseUrl: z.string().url("Base URL must be a valid URL"),
  apiKey: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.any()).optional(),
  lastSyncAt: z.string().datetime().optional(),
});

// Create integration system schema
const createIntegrationSystemSchema = integrationSystemSchema.omit({
  id: true,
  lastSyncAt: true,
});

// Update integration system schema
const updateIntegrationSystemSchema = integrationSystemSchema.partial().omit({
  id: true,
  lastSyncAt: true,
});

// Integration mapping schema
const integrationMappingSchema = z.object({
  id: z.number().int().positive(),
  systemId: z.number().int().positive(),
  entityType: z.enum(['service_user', 'care_plan', 'appointment', 'note', 'document', 'staff']),
  localId: z.number().int().positive(),
  externalId: z.string().min(1, "External ID is required"),
  mappingData: z.record(z.any()).optional(),
  lastSyncAt: z.string().datetime().optional(),
});

// Create integration mapping schema
const createIntegrationMappingSchema = integrationMappingSchema.omit({
  id: true,
  lastSyncAt: true,
});

// Update integration mapping schema
const updateIntegrationMappingSchema = integrationMappingSchema.partial().omit({
  id: true,
  systemId: true,
  entityType: true,
  localId: true,
  lastSyncAt: true,
});

// Sync request schema
const syncRequestSchema = z.object({
  systemId: z.number().int().positive(),
  entityType: z.enum(['service_user', 'care_plan', 'appointment', 'note', 'document', 'staff']).optional(),
  entityId: z.number().int().positive().optional(),
  fullSync: z.boolean().default(false),
});

/**
 * Get all integration systems
 * GET /api/v2/external-integration/systems
 */
adminRoutes.get('/systems', async (req, res, next) => {
  try {
    const systems = await db.select()
      .from('integration_systems')
      .orderBy('integration_systems.name');

    // Mask sensitive data
    const maskedSystems = systems.map(system => ({
      ...system,
      apiKey: system.apiKey ? '••••••••' + system.apiKey.slice(-4) : null,
      clientSecret: system.clientSecret ? '••••••••' + system.clientSecret.slice(-4) : null,
    }));

    res.json(maskedSystems);
  } catch (error) {
    next(error);
  }
});

/**
 * Get integration system by ID
 * GET /api/v2/external-integration/systems/:id
 */
adminRoutes.get('/systems/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const system = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', id));

    if (system.length === 0) {
      throw ApiError.notFound(`Integration system with ID ${id} not found`);
    }

    // Mask sensitive data
    const maskedSystem = {
      ...system[0],
      apiKey: system[0].apiKey ? '••••••••' + system[0].apiKey.slice(-4) : null,
      clientSecret: system[0].clientSecret ? '••••••••' + system[0].clientSecret.slice(-4) : null,
    };

    res.json(maskedSystem);
  } catch (error) {
    next(error);
  }
});

/**
 * Create integration system
 * POST /api/v2/external-integration/systems
 */
adminRoutes.post('/systems', validateBody(createIntegrationSystemSchema), async (req, res, next) => {
  try {
    const systemData = req.body;

    // Create the integration system
    const result = await db.insert('integration_systems').values(systemData).returning();

    // Mask sensitive data in response
    const maskedSystem = {
      ...result[0],
      apiKey: result[0].apiKey ? '••••••••' + result[0].apiKey.slice(-4) : null,
      clientSecret: result[0].clientSecret ? '••••••••' + result[0].clientSecret.slice(-4) : null,
    };

    res.status(201).json(maskedSystem);
  } catch (error) {
    next(error);
  }
});

/**
 * Update integration system
 * PATCH /api/v2/external-integration/systems/:id
 */
adminRoutes.patch('/systems/:id', validateParams(idParamSchema), validateBody(updateIntegrationSystemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if system exists
    const existingSystem = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', id));

    if (existingSystem.length === 0) {
      throw ApiError.notFound(`Integration system with ID ${id} not found`);
    }

    // Update the system
    const result = await db.update('integration_systems')
      .set(updateData)
      .where(eq('integration_systems.id', id))
      .returning();

    // Mask sensitive data in response
    const maskedSystem = {
      ...result[0],
      apiKey: result[0].apiKey ? '••••••••' + result[0].apiKey.slice(-4) : null,
      clientSecret: result[0].clientSecret ? '••••••••' + result[0].clientSecret.slice(-4) : null,
    };

    res.json(maskedSystem);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete integration system
 * DELETE /api/v2/external-integration/systems/:id
 */
adminRoutes.delete('/systems/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if system exists
    const existingSystem = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', id));

    if (existingSystem.length === 0) {
      throw ApiError.notFound(`Integration system with ID ${id} not found`);
    }

    // Delete the system
    await db.delete('integration_systems')
      .where(eq('integration_systems.id', id));

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * Get all mappings for a system
 * GET /api/v2/external-integration/systems/:id/mappings
 */
adminRoutes.get('/systems/:id/mappings', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if system exists
    const existingSystem = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', id));

    if (existingSystem.length === 0) {
      throw ApiError.notFound(`Integration system with ID ${id} not found`);
    }

    // Get all mappings for this system
    const mappings = await db.select()
      .from('integration_mappings')
      .where(eq('integration_mappings.system_id', id))
      .orderBy('integration_mappings.entity_type', 'integration_mappings.local_id');

    res.json(mappings);
  } catch (error) {
    next(error);
  }
});

/**
 * Create mapping
 * POST /api/v2/external-integration/mappings
 */
adminRoutes.post('/mappings', validateBody(createIntegrationMappingSchema), async (req, res, next) => {
  try {
    const mappingData = req.body;

    // Check if system exists
    const existingSystem = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', mappingData.systemId));

    if (existingSystem.length === 0) {
      throw ApiError.badRequest(`Integration system with ID ${mappingData.systemId} not found`);
    }

    // Check if mapping already exists
    const existingMapping = await db.select()
      .from('integration_mappings')
      .where(
        and(
          eq('integration_mappings.system_id', mappingData.systemId),
          eq('integration_mappings.entity_type', mappingData.entityType),
          eq('integration_mappings.local_id', mappingData.localId)
        )
      );

    if (existingMapping.length > 0) {
      throw ApiError.conflict(`Mapping already exists for this entity`);
    }

    // Create the mapping
    const result = await db.insert('integration_mappings').values(mappingData).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Update mapping
 * PATCH /api/v2/external-integration/mappings/:id
 */
adminRoutes.patch('/mappings/:id', validateParams(idParamSchema), validateBody(updateIntegrationMappingSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if mapping exists
    const existingMapping = await db.select()
      .from('integration_mappings')
      .where(eq('integration_mappings.id', id));

    if (existingMapping.length === 0) {
      throw ApiError.notFound(`Mapping with ID ${id} not found`);
    }

    // Update the mapping
    const result = await db.update('integration_mappings')
      .set(updateData)
      .where(eq('integration_mappings.id', id))
      .returning();

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete mapping
 * DELETE /api/v2/external-integration/mappings/:id
 */
adminRoutes.delete('/mappings/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if mapping exists
    const existingMapping = await db.select()
      .from('integration_mappings')
      .where(eq('integration_mappings.id', id));

    if (existingMapping.length === 0) {
      throw ApiError.notFound(`Mapping with ID ${id} not found`);
    }

    // Delete the mapping
    await db.delete('integration_mappings')
      .where(eq('integration_mappings.id', id));

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * Sync with external system
 * POST /api/v2/external-integration/sync
 */
adminRoutes.post('/sync', validateBody(syncRequestSchema), async (req, res, next) => {
  try {
    const { systemId, entityType, entityId, fullSync } = req.body;

    // Check if system exists
    const existingSystem = await db.select()
      .from('integration_systems')
      .where(eq('integration_systems.id', systemId));

    if (existingSystem.length === 0) {
      throw ApiError.badRequest(`Integration system with ID ${systemId} not found`);
    }

    // Start a background sync job
    // In a real implementation, this would be handled by a job queue
    // For now, we'll just return a success message

    res.json({
      message: 'Sync job started',
      jobId: crypto.randomUUID(),
      status: 'pending',
      details: {
        systemId,
        entityType,
        entityId,
        fullSync,
        startedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get sync status
 * GET /api/v2/external-integration/sync-status
 */
adminRoutes.get('/sync-status', async (req, res, next) => {
  try {
    // Get last sync time for each system
    const systems = await db.select({
      id: 'integration_systems.id',
      name: 'integration_systems.name',
      type: 'integration_systems.type',
      lastSyncAt: 'integration_systems.last_sync_at',
      isActive: 'integration_systems.is_active'
    })
    .from('integration_systems');

    // Get sync counts for each system
    const syncCounts = await Promise.all(systems.map(async (system) => {
      const mappingCounts = await db.select({
        entityType: 'integration_mappings.entity_type',
        count: { value: 'integration_mappings.id', fn: 'count' }
      })
      .from('integration_mappings')
      .where(eq('integration_mappings.system_id', system.id))
      .groupBy('integration_mappings.entity_type');

      return {
        ...system,
        mappingCounts: mappingCounts.reduce((acc, curr) => {
          acc[curr.entityType] = curr.count.value;
          return acc;
        }, {})
      };
    }));

    res.json(syncCounts);
  } catch (error) {
    next(error);
  }
});

// Mount admin routes
router.use('/', adminRoutes);

// Public routes (available to all authenticated users)

/**
 * Get external systems for a service user
 * GET /api/v2/external-integration/service-users/:id/systems
 */
router.get('/service-users/:id/systems', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if service user exists
    const serviceUser = await db.select()
      .from(serviceUsers)
      .where(eq(serviceUsers.id, id));

    if (serviceUser.length === 0) {
      throw ApiError.notFound(`Service user with ID ${id} not found`);
    }

    // Get all mappings for this service user
    const mappings = await db.select({
      mapping: 'integration_mappings',
      system: {
        id: 'integration_systems.id',
        name: 'integration_systems.name',
        type: 'integration_systems.type'
      }
    })
    .from('integration_mappings')
    .innerJoin('integration_systems', eq('integration_mappings.system_id', 'integration_systems.id'))
    .where(
      and(
        eq('integration_mappings.entity_type', 'service_user'),
        eq('integration_mappings.local_id', id),
        eq('integration_systems.is_active', true)
      )
    );

    // Format the response
    const formattedResults = mappings.map(({ mapping, system }) => ({
      system: {
        id: system.id,
        name: system.name,
        type: system.type
      },
      externalId: mapping.externalId,
      lastSyncAt: mapping.lastSyncAt
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

export default router;
