/**
 * Shared authentication types
 */

import { z } from 'zod';
import { userRoleEnum } from '../schema';

// Login credentials schema
export const loginCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Registration data schema
export const registrationDataSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password cannot exceed 100 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(userRoleEnum.enumValues).optional(),
  phoneNumber: z.string().optional(),
  profileImage: z.string().url().optional(),
});

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.enum(userRoleEnum.enumValues),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
});

// Auth response schema
export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

// Type definitions
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegistrationData = z.infer<typeof registrationDataSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
