/**
 * Family Portal API routes
 */

import express from 'express';
import { db } from '../db';
import { users, serviceUsers, carePlans, appointments, notes, documents, documentSharing } from '@shared/schema';
import { validateParams, validateQuery, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { eq, and, gte, lte, like, or, inArray, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

// Ensure user has family_member role
router.use(ensureRole(['family_member', 'admin', 'system_admin']));

// Family member access schema
const familyAccessSchema = z.object({
  serviceUserId: z.number().int().positive(),
  userId: z.number().int().positive(),
  relationshipType: z.string().min(1, "Relationship type is required"),
  accessLevel: z.enum(['read', 'read_write']),
  isEmergencyContact: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

// Create family member access schema
const createFamilyAccessSchema = familyAccessSchema.omit({
  isActive: true,
});

// Update family member access schema
const updateFamilyAccessSchema = familyAccessSchema.partial().omit({
  serviceUserId: true,
  userId: true,
});

// Date range query schema
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
});

/**
 * Get service users accessible to the family member
 * GET /api/v2/family-portal/service-users
 */
router.get('/service-users', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get service users that the family member has access to
    const accessibleServiceUsers = await db.select({
      serviceUser: serviceUsers,
      access: {
        relationshipType: 'family_access.relationship_type',
        accessLevel: 'family_access.access_level',
        isEmergencyContact: 'family_access.is_emergency_contact',
      }
    })
    .from(serviceUsers)
    .innerJoin('family_access', eq('family_access.service_user_id', serviceUsers.id))
    .where(
      and(
        eq('family_access.user_id', userId),
        eq('family_access.is_active', true)
      )
    );

    if (accessibleServiceUsers.length === 0) {
      return res.json([]);
    }

    // Format the response
    const formattedResults = accessibleServiceUsers.map(({ serviceUser, access }) => ({
      ...serviceUser,
      relationshipType: access.relationshipType,
      accessLevel: access.accessLevel,
      isEmergencyContact: access.isEmergencyContact,
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * Get service user details
 * GET /api/v2/family-portal/service-users/:id
 */
router.get('/service-users/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if the family member has access to this service user
    const access = await db.select()
      .from('family_access')
      .where(
        and(
          eq('family_access.service_user_id', id),
          eq('family_access.user_id', userId),
          eq('family_access.is_active', true)
        )
      );

    if (access.length === 0) {
      throw ApiError.forbidden('You do not have access to this service user');
    }

    // Get service user details
    const serviceUserResult = await db.select()
      .from(serviceUsers)
      .where(eq(serviceUsers.id, id));

    if (serviceUserResult.length === 0) {
      throw ApiError.notFound(`Service user with ID ${id} not found`);
    }

    res.json({
      ...serviceUserResult[0],
      relationshipType: access[0].relationshipType,
      accessLevel: access[0].accessLevel,
      isEmergencyContact: access[0].isEmergencyContact,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get care plans for a service user
 * GET /api/v2/family-portal/service-users/:id/care-plans
 */
router.get('/service-users/:id/care-plans', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if the family member has access to this service user
    const access = await db.select()
      .from('family_access')
      .where(
        and(
          eq('family_access.service_user_id', id),
          eq('family_access.user_id', userId),
          eq('family_access.is_active', true)
        )
      );

    if (access.length === 0) {
      throw ApiError.forbidden('You do not have access to this service user');
    }

    // Get care plans
    const carePlansResult = await db.select()
      .from(carePlans)
      .where(eq(carePlans.serviceUserId, id))
      .orderBy(desc(carePlans.startDate));

    res.json(carePlansResult);
  } catch (error) {
    next(error);
  }
});

/**
 * Get appointments for a service user
 * GET /api/v2/family-portal/service-users/:id/appointments
 */
router.get('/service-users/:id/appointments', validateParams(idParamSchema), validateQuery(dateRangeSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user!.id;

    // Check if the family member has access to this service user
    const access = await db.select()
      .from('family_access')
      .where(
        and(
          eq('family_access.service_user_id', id),
          eq('family_access.user_id', userId),
          eq('family_access.is_active', true)
        )
      );

    if (access.length === 0) {
      throw ApiError.forbidden('You do not have access to this service user');
    }

    // Build query for appointments
    let appointmentsQuery = db.select({
      appointment: appointments,
      caregiver: {
        id: users.id,
        fullName: users.fullName
      }
    })
    .from(appointments)
    .leftJoin(users, eq(appointments.caregiverId, users.id))
    .where(eq(appointments.serviceUserId, id));

    // Apply date filters if provided
    if (startDate) {
      appointmentsQuery = appointmentsQuery.where(gte(appointments.date, startDate));
    }

    if (endDate) {
      appointmentsQuery = appointmentsQuery.where(lte(appointments.date, endDate));
    }

    // Order by date and time
    appointmentsQuery = appointmentsQuery.orderBy(desc(appointments.date), appointments.startTime);

    const appointmentsResult = await appointmentsQuery;

    // Format the response
    const formattedResults = appointmentsResult.map(({ appointment, caregiver }) => ({
      ...appointment,
      caregiver: caregiver ? {
        id: caregiver.id,
        fullName: caregiver.fullName
      } : null
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * Get notes for a service user
 * GET /api/v2/family-portal/service-users/:id/notes
 */
router.get('/service-users/:id/notes', validateParams(idParamSchema), validateQuery(dateRangeSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user!.id;

    // Check if the family member has access to this service user
    const access = await db.select()
      .from('family_access')
      .where(
        and(
          eq('family_access.service_user_id', id),
          eq('family_access.user_id', userId),
          eq('family_access.is_active', true)
        )
      );

    if (access.length === 0) {
      throw ApiError.forbidden('You do not have access to this service user');
    }

    // Build query for notes
    let notesQuery = db.select({
      note: notes,
      createdBy: {
        id: users.id,
        fullName: users.fullName
      }
    })
    .from(notes)
    .leftJoin(users, eq(notes.createdBy, users.id))
    .where(eq(notes.serviceUserId, id));

    // Apply date filters if provided
    if (startDate) {
      notesQuery = notesQuery.where(gte(notes.timestamp.substring(0, 10), startDate));
    }

    if (endDate) {
      notesQuery = notesQuery.where(lte(notes.timestamp.substring(0, 10), endDate));
    }

    // Order by timestamp (newest first)
    notesQuery = notesQuery.orderBy(desc(notes.timestamp));

    const notesResult = await notesQuery;

    // Format the response
    const formattedResults = notesResult.map(({ note, createdBy }) => ({
      ...note,
      createdBy: {
        id: createdBy.id,
        fullName: createdBy.fullName
      }
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * Get documents for a service user
 * GET /api/v2/family-portal/service-users/:id/documents
 */
router.get('/service-users/:id/documents', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if the family member has access to this service user
    const access = await db.select()
      .from('family_access')
      .where(
        and(
          eq('family_access.service_user_id', id),
          eq('family_access.user_id', userId),
          eq('family_access.is_active', true)
        )
      );

    if (access.length === 0) {
      throw ApiError.forbidden('You do not have access to this service user');
    }

    // Get documents for this service user that are public or shared with this user
    const documentsResult = await db.select({
      document: documents,
      uploadedBy: {
        id: users.id,
        fullName: users.fullName
      }
    })
    .from(documents)
    .leftJoin(users, eq(documents.uploadedById, users.id))
    .where(
      and(
        eq(documents.serviceUserId, id),
        eq(documents.isArchived, false),
        or(
          eq(documents.isPublic, true),
          inArray(documents.id,
            db.select({ id: documentSharing.documentId })
              .from(documentSharing)
              .where(
                and(
                  eq(documentSharing.sharedWithId, userId),
                  or(
                    eq(documentSharing.expiresAt, null),
                    gte(documentSharing.expiresAt, new Date().toISOString())
                  )
                )
              )
          )
        )
      )
    )
    .orderBy(desc(documents.uploadedAt));

    // Format the response
    const formattedResults = documentsResult.map(({ document, uploadedBy }) => ({
      ...document,
      uploadedBy: {
        id: uploadedBy.id,
        fullName: uploadedBy.fullName
      }
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

export default router;
