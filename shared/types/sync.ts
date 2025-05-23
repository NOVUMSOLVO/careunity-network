/**
 * Types for the sync service
 */

import { z } from 'zod';

/**
 * Sync operation status
 */
export const SyncOperationStatusEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'error',
]);

export type SyncOperationStatus = z.infer<typeof SyncOperationStatusEnum>;

/**
 * HTTP method for sync operations
 */
export const SyncOperationMethodEnum = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

export type SyncOperationMethod = z.infer<typeof SyncOperationMethodEnum>;

/**
 * Sync operation schema
 */
export const SyncOperationSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  method: SyncOperationMethodEnum,
  body: z.string().optional(),
  headers: z.record(z.string()).optional(),
  timestamp: z.number(),
  retries: z.number().int().min(0),
  status: SyncOperationStatusEnum,
  errorMessage: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.union([z.string(), z.number()]).optional(),
  userId: z.number().int().positive(),
});

export type SyncOperation = z.infer<typeof SyncOperationSchema>;

/**
 * Create sync operation schema
 */
export const CreateSyncOperationSchema = SyncOperationSchema.omit({
  id: true,
  timestamp: true,
  retries: true,
  status: true,
  errorMessage: true,
}).extend({
  body: z.any().optional().transform(body => body ? JSON.stringify(body) : undefined),
});

export type CreateSyncOperation = z.infer<typeof CreateSyncOperationSchema>;

/**
 * Update sync operation schema
 */
export const UpdateSyncOperationSchema = z.object({
  status: SyncOperationStatusEnum,
  errorMessage: z.string().optional(),
  retries: z.number().int().min(0).optional(),
});

export type UpdateSyncOperation = z.infer<typeof UpdateSyncOperationSchema>;

/**
 * Sync operation response schema
 */
export const SyncOperationResponseSchema = z.object({
  id: z.string().uuid(),
  status: SyncOperationStatusEnum,
});

export type SyncOperationResponse = z.infer<typeof SyncOperationResponseSchema>;

/**
 * Sync status schema
 */
export const SyncStatusSchema = z.object({
  pendingCount: z.number().int().min(0),
  errorCount: z.number().int().min(0),
  lastSyncTime: z.string().datetime().nullable(),
});

export type SyncStatus = z.infer<typeof SyncStatusSchema>;

/**
 * Sync batch operation schema
 */
export const SyncBatchOperationSchema = z.object({
  operations: z.array(CreateSyncOperationSchema),
});

export type SyncBatchOperation = z.infer<typeof SyncBatchOperationSchema>;

/**
 * Sync batch response schema
 */
export const SyncBatchResponseSchema = z.object({
  operations: z.array(SyncOperationResponseSchema),
});

export type SyncBatchResponse = z.infer<typeof SyncBatchResponseSchema>;
