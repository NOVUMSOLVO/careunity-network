/**
 * Common shared types
 */

import { z } from 'zod';

/**
 * Pagination parameters schema
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

/**
 * Pagination parameters type
 */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

/**
 * ID parameter type
 */
export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  query: z.string().optional(),
});

/**
 * Search query type
 */
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * Date range type
 */
export type DateRange = z.infer<typeof dateRangeSchema>;
