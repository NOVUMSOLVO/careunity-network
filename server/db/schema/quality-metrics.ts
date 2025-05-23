import { pgTable, serial, varchar, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

/**
 * Quality metrics schema
 * 
 * Stores quality metrics for the care service
 */
export const qualityMetrics = pgTable('quality_metrics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  target: decimal('target', { precision: 10, scale: 2 }).notNull(),
  trend: varchar('trend', { length: 20 }).notNull().default('stable'),
  category: varchar('category', { length: 50 }).notNull(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
