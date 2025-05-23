/**
 * Document Management API routes
 */

import express from 'express';
import { db } from '../db';
import { documents, documentSharing, users, serviceUsers } from '@shared/schema';
import { createDocumentSchema, updateDocumentSchema, createDocumentSharingSchema } from '@shared/types/document';
import { validateBody, validateParams, validateQuery, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { ensureAuthenticated, ensureRole } from '../middleware/auth';
import { eq, and, like, or, inArray, desc } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import queryOptimizer from '../db/query-optimizer';
import cacheService from '../services/cache-service';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuid()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.') as any, false);
    }
  }
});

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated);

// Search query schema
const documentSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  serviceUserId: z.string().regex(/^\d+$/, "Service User ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
  page: z.string().regex(/^\d+$/, "Page must be a positive integer").transform(val => parseInt(val, 10)).optional().default('1'),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").transform(val => parseInt(val, 10)).optional().default('10'),
});

/**
 * Get all documents with filtering and pagination
 * GET /api/v2/documents
 */
router.get('/', validateQuery(documentSearchSchema), async (req, res, next) => {
  try {
    const { query, category, type, serviceUserId, page = 1, limit = 10 } = req.query;

    // Create cache key based on query parameters
    const cacheKey = `documents:list:${JSON.stringify({ query, category, type, serviceUserId, page, limit })}`;

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Wrap the query execution with metrics tracking
    return await queryOptimizer.withQueryMetrics('documents:list', async () => {
      let queryBuilder = db.select({
        document: documents,
        uploadedBy: {
          id: users.id,
          fullName: users.fullName
        }
      })
      .from(documents)
      .leftJoin(users, eq(documents.uploadedById, users.id))
      .where(eq(documents.isArchived, false));

      // Apply search filters
      if (query) {
        queryBuilder = queryBuilder.where(
          or(
            like(documents.name, `%${query}%`),
            like(documents.description || '', `%${query}%`),
            like(documents.tags.map(tag => `%${tag}%`).join(','), `%${query}%`)
          )
        );
      }

      if (category) {
        queryBuilder = queryBuilder.where(eq(documents.category, category));
      }

      if (type) {
        queryBuilder = queryBuilder.where(eq(documents.type, type));
      }

      if (serviceUserId) {
        queryBuilder = queryBuilder.where(eq(documents.serviceUserId, serviceUserId));
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder = queryBuilder.limit(limit).offset(offset).orderBy(desc(documents.uploadedAt));

      const results = await queryBuilder;

      // Format the response
      const formattedResults = results.map(({ document, uploadedBy }) => ({
        ...document,
        uploadedBy: {
          id: uploadedBy.id,
          fullName: uploadedBy.fullName
        }
      }));

      // Get total count for pagination - use a separate metrics tracking
      const totalCount = await queryOptimizer.withQueryMetrics('documents:count', async () => {
        const countQuery = db.select({ count: { value: documents.id, fn: 'count' } })
          .from(documents)
          .where(eq(documents.isArchived, false));

        // Apply the same filters to the count query
        if (query) {
          countQuery.where(
            or(
              like(documents.name, `%${query}%`),
              like(documents.description || '', `%${query}%`),
              like(documents.tags.map(tag => `%${tag}%`).join(','), `%${query}%`)
            )
          );
        }

        if (category) {
          countQuery.where(eq(documents.category, category));
        }

        if (type) {
          countQuery.where(eq(documents.type, type));
        }

        if (serviceUserId) {
          countQuery.where(eq(documents.serviceUserId, serviceUserId));
        }

        return await countQuery;
      });

      const response = {
        data: formattedResults,
        pagination: {
          page,
          limit,
          totalCount: totalCount[0].count.value,
          totalPages: Math.ceil(totalCount[0].count.value / limit)
        }
      };

      // Cache the result for 5 minutes (300 seconds)
      cacheService.set(cacheKey, response, 300);

      res.json(response);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a document by ID
 * GET /api/v2/documents/:id
 */
router.get('/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Create cache key based on document ID
    const cacheKey = `documents:detail:${id}`;

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Wrap the query execution with metrics tracking
    return await queryOptimizer.withQueryMetrics('documents:detail', async () => {
      const result = await db.select({
        document: documents,
        uploadedBy: {
          id: users.id,
          fullName: users.fullName
        },
        serviceUser: serviceUsers ? {
          id: serviceUsers.id,
          fullName: serviceUsers.fullName
        } : null
      })
      .from(documents)
      .leftJoin(users, eq(documents.uploadedById, users.id))
      .leftJoin(serviceUsers, eq(documents.serviceUserId, serviceUsers.id))
      .where(eq(documents.id, id));

      if (result.length === 0) {
        throw ApiError.notFound(`Document with ID ${id} not found`);
      }

      // Format the response
      const document = result[0];
      const formattedResult = {
        ...document.document,
        uploadedBy: document.uploadedBy,
        serviceUser: document.serviceUser
      };

      // Cache the result for 10 minutes (600 seconds)
      cacheService.set(cacheKey, formattedResult, 600);

      res.json(formattedResult);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Upload a new document
 * POST /api/v2/documents
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Validate the document metadata
    const documentData = createDocumentSchema.parse({
      ...req.body,
      size: req.file.size,
      uploadedById: req.user!.id,
      url: `/uploads/${req.file.filename}`,
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    });

    // Create the document with metrics tracking
    const result = await queryOptimizer.withQueryMetrics('documents:create', async () => {
      return await db.insert(documents).values(documentData).returning();
    });

    // Invalidate list cache when a new document is added
    cacheService.del(cacheService.getKeys().filter(key => key.startsWith('documents:list')));

    res.status(201).json(result[0]);
  } catch (error) {
    // Clean up the uploaded file if validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * Update a document
 * PATCH /api/v2/documents/:id
 */
router.patch('/:id', validateParams(idParamSchema), validateBody(updateDocumentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Wrap in metrics tracking
    return await queryOptimizer.withQueryMetrics('documents:update', async () => {
      // Check if document exists
      const existingDoc = await db.select().from(documents).where(eq(documents.id, id));

      if (existingDoc.length === 0) {
        throw ApiError.notFound(`Document with ID ${id} not found`);
      }

      // Update the document
      const result = await db.update(documents)
        .set({
          ...req.body,
          lastModified: new Date().toISOString()
        })
        .where(eq(documents.id, id))
        .returning();

      // Invalidate related caches
      cacheService.del(`documents:detail:${id}`);
      cacheService.del(cacheService.getKeys().filter(key => key.startsWith('documents:list')));

      res.json(result[0]);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Archive a document (soft delete)
 * DELETE /api/v2/documents/:id
 */
router.delete('/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Wrap in metrics tracking
    return await queryOptimizer.withQueryMetrics('documents:archive', async () => {
      // Check if document exists
      const existingDoc = await db.select().from(documents).where(eq(documents.id, id));

      if (existingDoc.length === 0) {
        throw ApiError.notFound(`Document with ID ${id} not found`);
      }

      // Soft delete (archive) the document
      await db.update(documents)
        .set({
          isArchived: true,
          lastModified: new Date().toISOString()
        })
        .where(eq(documents.id, id));

      // Invalidate related caches
      cacheService.del(`documents:detail:${id}`);
      cacheService.del(cacheService.getKeys().filter(key => key.startsWith('documents:list')));

      res.status(204).end();
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Share a document with another user
 * POST /api/v2/documents/:id/share
 */
router.post('/:id/share', validateParams(idParamSchema), validateBody(createDocumentSharingSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const existingDoc = await db.select().from(documents).where(eq(documents.id, id));

    if (existingDoc.length === 0) {
      throw ApiError.notFound(`Document with ID ${id} not found`);
    }

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, req.body.sharedWithId));

    if (user.length === 0) {
      throw ApiError.badRequest(`User with ID ${req.body.sharedWithId} not found`);
    }

    // Check if sharing already exists
    const existingSharing = await db.select()
      .from(documentSharing)
      .where(
        and(
          eq(documentSharing.documentId, id),
          eq(documentSharing.sharedWithId, req.body.sharedWithId)
        )
      );

    if (existingSharing.length > 0) {
      // Update existing sharing
      const result = await db.update(documentSharing)
        .set({
          accessLevel: req.body.accessLevel,
          expiresAt: req.body.expiresAt
        })
        .where(
          and(
            eq(documentSharing.documentId, id),
            eq(documentSharing.sharedWithId, req.body.sharedWithId)
          )
        )
        .returning();

      res.json(result[0]);
    } else {
      // Create new sharing
      const sharingData = {
        documentId: id,
        sharedWithId: req.body.sharedWithId,
        accessLevel: req.body.accessLevel,
        expiresAt: req.body.expiresAt
      };

      const result = await db.insert(documentSharing).values(sharingData).returning();

      res.status(201).json(result[0]);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Get all users a document is shared with
 * GET /api/v2/documents/:id/sharing
 */
router.get('/:id/sharing', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const existingDoc = await db.select().from(documents).where(eq(documents.id, id));

    if (existingDoc.length === 0) {
      throw ApiError.notFound(`Document with ID ${id} not found`);
    }

    // Get all sharing records for this document
    const sharingRecords = await db.select({
      sharing: documentSharing,
      user: {
        id: users.id,
        fullName: users.fullName,
        email: users.email
      }
    })
    .from(documentSharing)
    .leftJoin(users, eq(documentSharing.sharedWithId, users.id))
    .where(eq(documentSharing.documentId, id));

    // Format the response
    const formattedResults = sharingRecords.map(({ sharing, user }) => ({
      ...sharing,
      sharedWith: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    }));

    res.json(formattedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * Remove document sharing
 * DELETE /api/v2/documents/:id/share/:userId
 */
router.delete('/:id/share/:userId', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    // Delete the sharing record
    await db.delete(documentSharing)
      .where(
        and(
          eq(documentSharing.documentId, id),
          eq(documentSharing.sharedWithId, parseInt(userId))
        )
      );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
