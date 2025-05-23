/**
 * User validation schemas
 */

import { z } from 'zod';
import { idSchema, paginationSchema, searchSchema, sortSchema } from '../validation';

// User validation schemas
export const userRoleSchema = z.enum([
  'admin',
  'system_admin',
  'manager',
  'caregiver',
  'family',
  'service_user'
]);

export const userStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'suspended'
]);

// User creation schema
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be at most 100 characters"),
  role: userRoleSchema.optional().default('caregiver'),
  status: userStatusSchema.optional().default('active'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// User update schema
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be at most 100 characters").optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// User preferences schema
export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
  dashboardLayout: z.record(z.any()).optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
});

// User query schema
export const userQuerySchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...sortSchema.shape,
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

// ID param schema
export const idParamSchema = idSchema;

// Export types
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
