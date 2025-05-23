/**
 * Shared Service User types and validation schemas
 */

import { z } from 'zod';

// Service User status enum
export const serviceUserStatusEnum = ['active', 'inactive', 'pending'] as const;

// Service User schema
export const serviceUserSchema = z.object({
  id: z.number(),
  uniqueId: z.string().min(1, 'Unique ID is required'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  careNeeds: z.array(z.string()).optional(),
  preferredTimes: z.array(z.string()).optional(),
  preferredCarers: z.array(z.number()).optional(),
  notes: z.string().optional(),
  status: z.enum(serviceUserStatusEnum),
  profileImage: z.string().url('Invalid URL for profile image').optional(),
});

// Create Service User schema (for POST requests)
export const createServiceUserSchema = serviceUserSchema.omit({ id: true });

// Update Service User schema (for PATCH requests)
export const updateServiceUserSchema = createServiceUserSchema.partial();

// Service User with Care Plans schema
export const serviceUserWithCarePlansSchema = serviceUserSchema.extend({
  carePlans: z.array(z.object({
    id: z.number(),
    title: z.string(),
    summary: z.string().optional(),
    startDate: z.string(),
    reviewDate: z.string().optional(),
    status: z.string(),
  })),
});

// Type definitions
export type ServiceUser = z.infer<typeof serviceUserSchema>;
export type CreateServiceUser = z.infer<typeof createServiceUserSchema>;
export type UpdateServiceUser = z.infer<typeof updateServiceUserSchema>;
export type ServiceUserWithCarePlans = z.infer<typeof serviceUserWithCarePlansSchema>;
export type ServiceUserStatus = typeof serviceUserStatusEnum[number];
