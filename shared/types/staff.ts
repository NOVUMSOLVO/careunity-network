/**
 * Shared Staff types and validation schemas
 */

import { z } from 'zod';

// Staff role enum
export const staffRoleEnum = ['caregiver', 'manager', 'admin'] as const;

// Staff schema
export const staffSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(staffRoleEnum),
  phone: z.string().optional(),
  address: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
  profileImage: z.string().url('Invalid URL for profile image').optional(),
  status: z.enum(['active', 'inactive', 'on-leave']).default('active'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Hire date must be in YYYY-MM-DD format').optional(),
});

// Create Staff schema (for POST requests)
export const createStaffSchema = staffSchema.omit({ id: true });

// Update Staff schema (for PATCH requests)
export const updateStaffSchema = createStaffSchema.partial();

// Type definitions
export type Staff = z.infer<typeof staffSchema>;
export type CreateStaff = z.infer<typeof createStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
export type StaffRole = typeof staffRoleEnum[number];
