/**
 * Document management types
 */

import { z } from 'zod';

// Document type enum
export const documentTypeValues = [
  'pdf',
  'image',
  'document',
  'spreadsheet',
  'other'
] as const;

export type DocumentType = typeof documentTypeValues[number];

// Document category enum
export const documentCategoryValues = [
  'care_plan',
  'medical',
  'assessment',
  'consent',
  'report',
  'other'
] as const;

export type DocumentCategory = typeof documentCategoryValues[number];

// Document schema
export const documentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Document name is required").max(255, "Document name is too long"),
  type: z.enum(documentTypeValues),
  category: z.enum(documentCategoryValues),
  size: z.number().int().positive("File size must be positive"),
  uploadedById: z.number().int().positive(),
  uploadedAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  tags: z.array(z.string()),
  serviceUserId: z.number().int().positive().optional(),
  description: z.string().max(500, "Description is too long").optional(),
  url: z.string().url("URL must be valid"),
  isPublic: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

// Create document schema (for API requests)
export const createDocumentSchema = documentSchema.omit({
  id: true,
  uploadedAt: true,
  lastModified: true,
  url: true,
});

// Update document schema (for API requests)
export const updateDocumentSchema = documentSchema.partial().omit({
  id: true,
  uploadedById: true,
  uploadedAt: true,
  size: true,
  type: true,
  url: true,
});

// Document sharing schema
export const documentSharingSchema = z.object({
  documentId: z.number().int().positive(),
  sharedWithId: z.number().int().positive(),
  sharedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  accessLevel: z.enum(['view', 'download', 'edit']),
});

// Create document sharing schema
export const createDocumentSharingSchema = documentSharingSchema.omit({
  sharedAt: true,
});

// Document type
export type Document = z.infer<typeof documentSchema>;

// Create document type
export type CreateDocument = z.infer<typeof createDocumentSchema>;

// Update document type
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;

// Document sharing type
export type DocumentSharing = z.infer<typeof documentSharingSchema>;

// Create document sharing type
export type CreateDocumentSharing = z.infer<typeof createDocumentSharingSchema>;
