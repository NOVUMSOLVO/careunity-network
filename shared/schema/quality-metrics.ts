import { pgTable, serial, text, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Quality metrics schema
 * 
 * Stores quality metrics for the care service
 */
export const qualityMetrics = pgTable('quality_metrics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  target: decimal('target', { precision: 10, scale: 2 }).notNull(),
  trend: text('trend').notNull().default('stable'), // up, down, stable
  category: text('category').notNull(), // care, staff, compliance, satisfaction
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Insert schema
export const insertQualityMetricSchema = createInsertSchema(qualityMetrics, {
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters"),
  value: z.number().min(0, "Value must be a positive number"),
  target: z.number().min(0, "Target must be a positive number"),
  trend: z.enum(['up', 'down', 'stable']),
  category: z.enum(['care', 'staff', 'compliance', 'satisfaction']),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal(''))
}).omit({ id: true, createdAt: true, updatedAt: true });

// Update schema
export const updateQualityMetricSchema = insertQualityMetricSchema.partial();

// Type definitions
export type InsertQualityMetric = z.infer<typeof insertQualityMetricSchema>;
export type QualityMetric = typeof qualityMetrics.$inferSelect;
