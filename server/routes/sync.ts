/**
 * Sync API routes
 *
 * This implementation uses in-memory storage for development and testing
 * until the database migration is properly set up.
 */

import express from 'express';
import {
  SyncOperationSchema,
  CreateSyncOperationSchema,
  UpdateSyncOperationSchema,
  SyncBatchOperationSchema
} from '@shared/types/sync';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { ApiError } from '../middleware/error-handler';
import { ensureAuthenticated } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

// In-memory storage for sync operations
const syncOperationsStore = new Map();

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

/**
 * Get sync status
 * GET /api/v2/sync/status
 */
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all operations for this user
    const userOperations = Array.from(syncOperationsStore.values())
      .filter((op: any) => op.userId === userId);

    // Count pending operations
    const pendingCount = userOperations.filter((op: any) => op.status === 'pending').length;

    // Count error operations
    const errorCount = userOperations.filter((op: any) => op.status === 'error').length;

    // Get last sync time (most recent completed operation)
    const completedOperations = userOperations
      .filter((op: any) => op.status === 'completed')
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    const lastSyncTime = completedOperations.length > 0
      ? new Date(completedOperations[0].timestamp).toISOString()
      : null;

    res.json({
      pendingCount,
      errorCount,
      lastSyncTime
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all sync operations
 * GET /api/v2/sync/operations
 */
router.get('/operations', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string | undefined;

    // Get all operations for this user
    let operations = Array.from(syncOperationsStore.values())
      .filter((op: any) => op.userId === userId);

    // Filter by status if provided
    if (status) {
      operations = operations.filter((op: any) => op.status === status);
    }

    // Sort by timestamp (newest first)
    operations.sort((a: any, b: any) => b.timestamp - a.timestamp);

    res.json(operations);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a sync operation by ID
 * GET /api/v2/sync/operations/:id
 */
router.get('/operations/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const operationId = req.params.id;

    // Get operation by ID
    const operation = syncOperationsStore.get(operationId);

    if (!operation || operation.userId !== userId) {
      throw ApiError.notFound('Sync operation not found');
    }

    res.json(operation);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a sync operation
 * POST /api/v2/sync/operations
 */
router.post('/operations', validateBody(CreateSyncOperationSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const operationId = uuid();
    const operation = {
      ...req.body,
      id: operationId,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      userId
    };

    // Store the operation
    syncOperationsStore.set(operationId, operation);

    res.status(201).json(operation);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a sync operation
 * PATCH /api/v2/sync/operations/:id
 */
router.patch('/operations/:id',
  validateParams(idParamSchema),
  validateBody(UpdateSyncOperationSchema),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const operationId = req.params.id;

      // Check if operation exists
      const existingOperation = syncOperationsStore.get(operationId);

      if (!existingOperation || existingOperation.userId !== userId) {
        throw ApiError.notFound('Sync operation not found');
      }

      // Update operation
      const updatedOperation = {
        ...existingOperation,
        ...req.body
      };

      // Store the updated operation
      syncOperationsStore.set(operationId, updatedOperation);

      res.json(updatedOperation);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete a sync operation
 * DELETE /api/v2/sync/operations/:id
 */
router.delete('/operations/:id', validateParams(idParamSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const operationId = req.params.id;

    // Check if operation exists
    const existingOperation = syncOperationsStore.get(operationId);

    if (!existingOperation || existingOperation.userId !== userId) {
      throw ApiError.notFound('Sync operation not found');
    }

    // Delete operation
    syncOperationsStore.delete(operationId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * Process pending operations
 * POST /api/v2/sync/process
 */
router.post('/process', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get pending operations
    const pendingOperations = Array.from(syncOperationsStore.values())
      .filter((op: any) => op.userId === userId && op.status === 'pending')
      .sort((a: any, b: any) => a.timestamp - b.timestamp);

    if (pendingOperations.length === 0) {
      return res.json({ processed: 0 });
    }

    // Process each operation
    let processed = 0;
    let failed = 0;

    for (const operation of pendingOperations) {
      try {
        // Update status to processing
        const processingOperation = {
          ...operation,
          status: 'processing'
        };
        syncOperationsStore.set(operation.id, processingOperation);

        // Process the operation (simulate API call)
        // In a real implementation, this would make actual API calls
        const success = Math.random() > 0.2; // 80% success rate for simulation

        if (success) {
          // Update status to completed
          const completedOperation = {
            ...processingOperation,
            status: 'completed'
          };
          syncOperationsStore.set(operation.id, completedOperation);

          processed++;
        } else {
          // Update status to error
          const errorOperation = {
            ...processingOperation,
            status: 'error',
            errorMessage: 'Simulated error response',
            retries: operation.retries + 1,
          };
          syncOperationsStore.set(operation.id, errorOperation);

          failed++;
        }
      } catch (error) {
        // Update status to error
        const errorOperation = {
          ...operation,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
          retries: operation.retries + 1,
        };
        syncOperationsStore.set(operation.id, errorOperation);

        failed++;
      }
    }

    res.json({
      processed,
      failed,
      total: pendingOperations.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Batch create sync operations
 * POST /api/v2/sync/batch
 */
router.post('/batch', validateBody(SyncBatchOperationSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { operations } = req.body;

    const operationsWithIds = operations.map(operation => ({
      ...operation,
      id: uuid(),
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      userId
    }));

    // Store each operation
    const result = operationsWithIds.map(operation => {
      syncOperationsStore.set(operation.id, operation);
      return { id: operation.id, status: operation.status };
    });

    res.status(201).json({
      operations: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Clear completed operations
 * DELETE /api/v2/sync/completed
 */
router.delete('/completed', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get completed operations
    const completedOperations = Array.from(syncOperationsStore.values())
      .filter((op: any) => op.userId === userId && op.status === 'completed');

    // Delete completed operations
    const deletedIds = completedOperations.map(operation => {
      syncOperationsStore.delete(operation.id);
      return { id: operation.id };
    });

    res.json({
      deleted: deletedIds.length,
      operations: deletedIds
    });
  } catch (error) {
    next(error);
  }
});

export default router;
