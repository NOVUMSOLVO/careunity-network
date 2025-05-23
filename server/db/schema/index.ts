/**
 * Database schema definitions
 * 
 * This file re-exports all tables from the shared schema and adds additional tables
 * that are only used by the server.
 */

// Re-export all tables from shared schema
export * from '@shared/schema';

// Import necessary dependencies
import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users, serviceUsers } from '@shared/schema';

// Staff table
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  role: text("role").notNull(), // caregiver, manager, admin
  qualifications: text("qualifications").array(),
  specialties: text("specialties").array(),
  workingHours: text("working_hours"), // JSON string of working hours
  maxVisitsPerDay: integer("max_visits_per_day").default(8),
  preferredLocations: text("preferred_locations").array(),
});

// Visit status enum
export const visitStatusEnum = pgEnum('visit_status', ['scheduled', 'in-progress', 'completed', 'cancelled', 'missed']);

// Visits table
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  caregiverId: integer("caregiver_id").references(() => users.id),
  date: text("date").notNull(), // Using text to store as YYYY-MM-DD format
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: visitStatusEnum("status").notNull().default('scheduled'),
  notes: text("notes"),
  tasks: text("tasks"), // JSON string of tasks to be completed
  priority: text("priority").default('normal'), // low, normal, high
  visitType: text("visit_type").notNull(), // personal care, medication, etc.
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  feedback: text("feedback"),
  feedbackRating: integer("feedback_rating"),
});

// Incident severity enum
export const incidentSeverityEnum = pgEnum('incident_severity', ['low', 'medium', 'high', 'critical']);

// Incident status enum
export const incidentStatusEnum = pgEnum('incident_status', ['open', 'investigating', 'resolved', 'closed']);

// Incidents table
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").references(() => serviceUsers.id),
  reportedBy: integer("reported_by").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // falls, medication, behavior, etc.
  severity: incidentSeverityEnum("severity").notNull(),
  status: incidentStatusEnum("status").notNull().default('open'),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  actionTaken: text("action_taken"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: text("follow_up_date"),
  isReportable: boolean("is_reportable").default(false),
  reportedToAuthorities: boolean("reported_to_authorities").default(false),
  reportDate: text("report_date"),
});
