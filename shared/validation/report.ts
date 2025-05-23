/**
 * Report validation schemas
 */

import { z } from 'zod';
import { dateRangeSchema } from '../validation';

// Report query schema
export const reportQuerySchema = z.object({
  ...dateRangeSchema.shape,
  staffId: z.string().optional(),
  serviceUserId: z.string().optional(),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
});

// Export types
export type ReportQuery = z.infer<typeof reportQuerySchema>;
