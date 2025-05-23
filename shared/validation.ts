/**
 * Shared validation schemas
 */

import { z } from 'zod';

// Common validation schemas
export const idSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer").transform(val => parseInt(val, 10)),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive integer").transform(val => parseInt(val, 10)).optional().default('1'),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").transform(val => parseInt(val, 10)).optional().default('10'),
});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
});

export const searchSchema = z.object({
  q: z.string().optional(),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Report validation schemas
export const reportTypeSchema = z.enum([
  'user_activity',
  'service_user_activity',
  'care_plan_progress',
  'appointment_summary',
  'staff_performance',
  'quality_metrics',
  'community_resources',
  'feedback_summary',
  'security_audit',
  'system_usage'
]);

export const reportFormatSchema = z.enum([
  'json',
  'csv',
  'pdf',
  'excel'
]);

export const reportRequestSchema = z.object({
  type: reportTypeSchema,
  format: reportFormatSchema.optional().default('json'),
  filters: z.record(z.any()).optional(),
  ...dateRangeSchema.shape,
});

// Export types
export type ReportType = z.infer<typeof reportTypeSchema>;
export type ReportFormat = z.infer<typeof reportFormatSchema>;
export type ReportRequest = z.infer<typeof reportRequestSchema>;
