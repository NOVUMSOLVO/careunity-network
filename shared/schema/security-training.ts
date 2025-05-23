import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Security training module difficulty enum
 */
export const securityTrainingDifficultyEnum = pgEnum('security_training_difficulty', [
  'beginner',
  'intermediate',
  'advanced'
]);

/**
 * Security training module type enum
 */
export const securityTrainingTypeEnum = pgEnum('security_training_type', [
  'video',
  'article',
  'quiz',
  'interactive'
]);

/**
 * Security training modules schema
 * 
 * Stores security training modules for users
 */
export const securityTrainingModules = pgTable('security_training_modules', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(), // JSON content or HTML
  type: securityTrainingTypeEnum('type').notNull(),
  difficulty: securityTrainingDifficultyEnum('difficulty').notNull(),
  estimatedDuration: integer('estimated_duration').notNull(), // in minutes
  requiredForRoles: text('required_for_roles').array(), // array of role names
  prerequisites: integer('prerequisites').array(), // array of module IDs
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  order: integer('order').notNull().default(0), // for ordering modules
  tags: text('tags').array(),
  thumbnail: text('thumbnail'), // URL to thumbnail image
  expiryPeriod: integer('expiry_period'), // in days, null means never expires
});

/**
 * User security training progress schema
 * 
 * Tracks user progress through security training modules
 */
export const userSecurityTraining = pgTable('user_security_training', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  moduleId: integer('module_id').notNull().references(() => securityTrainingModules.id),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  score: integer('score'), // for quiz modules
  attempts: integer('attempts').notNull().default(0),
  lastAttemptAt: timestamp('last_attempt_at'),
  progress: integer('progress').notNull().default(0), // percentage progress
  expiresAt: timestamp('expires_at'), // when this training expires and needs to be retaken
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Security training quiz questions schema
 * 
 * Stores quiz questions for security training modules
 */
export const securityTrainingQuizQuestions = pgTable('security_training_quiz_questions', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').notNull().references(() => securityTrainingModules.id),
  question: text('question').notNull(),
  options: text('options').array().notNull(), // array of options
  correctOption: integer('correct_option').notNull(), // index of correct option
  explanation: text('explanation'), // explanation of the correct answer
  points: integer('points').notNull().default(1),
  order: integer('order').notNull().default(0), // for ordering questions
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export types
export type SecurityTrainingModule = typeof securityTrainingModules.$inferSelect;
export type InsertSecurityTrainingModule = typeof securityTrainingModules.$inferInsert;

export type UserSecurityTraining = typeof userSecurityTraining.$inferSelect;
export type InsertUserSecurityTraining = typeof userSecurityTraining.$inferInsert;

export type SecurityTrainingQuizQuestion = typeof securityTrainingQuizQuestions.$inferSelect;
export type InsertSecurityTrainingQuizQuestion = typeof securityTrainingQuizQuestions.$inferInsert;
