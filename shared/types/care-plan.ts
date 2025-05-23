/**
 * Shared Care Plan types and validation schemas
 */

import { z } from 'zod';

// Care Plan status enum
export const carePlanStatusEnum = ['active', 'completed', 'pending', 'archived'] as const;

// Goal status enum
export const goalStatusEnum = ['active', 'completed', 'pending', 'cancelled'] as const;

// Task status enum
export const taskStatusEnum = ['pending', 'in-progress', 'completed', 'cancelled'] as const;

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  goalId: z.number(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional(),
  status: z.enum(taskStatusEnum),
  assignedTo: z.number().optional(),
});

// Create Task schema (for POST requests)
export const createTaskSchema = taskSchema.omit({ id: true });

// Update Task schema (for PATCH requests)
export const updateTaskSchema = createTaskSchema.partial();

// Goal schema
export const goalSchema = z.object({
  id: z.number(),
  carePlanId: z.number(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format').optional(),
  status: z.enum(goalStatusEnum),
  progressPercentage: z.number().min(0).max(100),
  tasks: z.array(taskSchema).optional(),
});

// Create Goal schema (for POST requests)
export const createGoalSchema = goalSchema.omit({ id: true, tasks: true });

// Update Goal schema (for PATCH requests)
export const updateGoalSchema = createGoalSchema.partial();

// Care Plan schema
export const carePlanSchema = z.object({
  id: z.number(),
  serviceUserId: z.number(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Review date must be in YYYY-MM-DD format').optional(),
  status: z.enum(carePlanStatusEnum),
  goals: z.array(goalSchema).optional(),
});

// Create Care Plan schema (for POST requests)
export const createCarePlanSchema = carePlanSchema.omit({ id: true, goals: true });

// Update Care Plan schema (for PATCH requests)
export const updateCarePlanSchema = createCarePlanSchema.partial();

// Care Plan with Goals and Tasks schema
export const carePlanWithGoalsAndTasksSchema = carePlanSchema.extend({
  goals: z.array(goalSchema.extend({
    tasks: z.array(taskSchema),
  })),
});

// Type definitions
export type CarePlan = z.infer<typeof carePlanSchema>;
export type CreateCarePlan = z.infer<typeof createCarePlanSchema>;
export type UpdateCarePlan = z.infer<typeof updateCarePlanSchema>;
export type CarePlanWithGoalsAndTasks = z.infer<typeof carePlanWithGoalsAndTasksSchema>;
export type CarePlanStatus = typeof carePlanStatusEnum[number];

export type Goal = z.infer<typeof goalSchema>;
export type CreateGoal = z.infer<typeof createGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type GoalStatus = typeof goalStatusEnum[number];

export type Task = z.infer<typeof taskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type TaskStatus = typeof taskStatusEnum[number];
