/**
 * Shared Appointment types and validation schemas
 */

import { z } from 'zod';

// Appointment status enum
export const appointmentStatusEnum = ['scheduled', 'in-progress', 'completed', 'cancelled'] as const;

// Appointment schema
export const appointmentSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Start time must be in HH:MM or HH:MM:SS format'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'End time must be in HH:MM or HH:MM:SS format'),
  status: z.enum(appointmentStatusEnum),
  serviceUserId: z.number(),
  caregiverId: z.number().optional(),
  location: z.string().optional(),
}).refine(data => {
  // Ensure end time is after start time
  if (data.date && data.startTime && data.endTime) {
    const start = new Date(`${data.date}T${data.startTime}`);
    const end = new Date(`${data.date}T${data.endTime}`);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Create Appointment schema (for POST requests)
export const createAppointmentSchema = appointmentSchema.omit({ id: true });

// Update Appointment schema (for PATCH requests)
export const updateAppointmentSchema = createAppointmentSchema.partial();

// Type definitions
export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
export type AppointmentStatus = typeof appointmentStatusEnum[number];
