import { pgTable, text, serial, integer, boolean, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['caregiver', 'manager', 'admin', 'serviceuser', 'family']);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default('caregiver'),
  phoneNumber: text("phone_number"),
  profileImage: text("profile_image"),
});

// Service User table
export const serviceUsers = pgTable("service_users", {
  id: serial("id").primaryKey(),
  uniqueId: text("unique_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(), // Using text to store as YYYY-MM-DD format
  address: text("address").notNull(),
  phoneNumber: text("phone_number"),
  emergencyContact: text("emergency_contact"),
  profileImage: text("profile_image"),
  preferences: text("preferences"), // JSON string of preferences
  needs: text("needs"), // JSON string of needs
  lifeStory: text("life_story"),
});

// Care Plan table
export const carePlans = pgTable("care_plans", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  title: text("title").notNull(),
  summary: text("summary"),
  startDate: text("start_date").notNull(), // Using text to store as YYYY-MM-DD format
  reviewDate: text("review_date"), // Using text to store as YYYY-MM-DD format
  status: text("status").notNull(), // active, completed, etc.
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  carePlanId: integer("care_plan_id").notNull().references(() => carePlans.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(), // Using text to store as YYYY-MM-DD format
  targetDate: text("target_date"), // Using text to store as YYYY-MM-DD format
  status: text("status").notNull(), // on track, completed, etc.
  progressPercentage: integer("progress_percentage").notNull().default(0),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  carePlanId: integer("care_plan_id").notNull().references(() => carePlans.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // personal care, medication, meal, etc.
  timeOfDay: text("time_of_day").notNull(), // morning, afternoon, evening, etc.
  completed: boolean("completed").notNull().default(false),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  caregiverId: integer("caregiver_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // Using text to store as YYYY-MM-DD format
  startTime: text("start_time").notNull(), // Using text to store as HH:MM format
  endTime: text("end_time").notNull(), // Using text to store as HH:MM format
  status: text("status").notNull().default('scheduled'), // scheduled, completed, cancelled
  location: text("location"),
  visitType: text("visit_type").notNull(), // personal care, medication, etc.
});

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(), // Using text to store as YYYY-MM-DD HH:MM format
  category: text("category"), // general, medication, personal care, etc.
  isVoiceRecorded: boolean("is_voice_recorded").notNull().default(false),
});

// Risk Assessment table
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  category: text("category").notNull(), // falls, medication, nutrition, etc.
  riskLevel: text("risk_level").notNull(), // low, medium, high
  description: text("description").notNull(),
  mitigations: text("mitigations"), // JSON string of mitigations
  reviewDate: text("review_date"), // Using text to store as YYYY-MM-DD format
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  phoneNumber: true,
  profileImage: true,
}).omit({ id: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

export const insertServiceUserSchema = createInsertSchema(serviceUsers).pick({
  uniqueId: true,
  fullName: true,
  dateOfBirth: true,
  address: true,
  phoneNumber: true,
  emergencyContact: true,
  profileImage: true,
  preferences: true,
  needs: true,
  lifeStory: true,
}).omit({ id: true });

export const insertCarePlanSchema = createInsertSchema(carePlans).pick({
  serviceUserId: true,
  title: true,
  summary: true,
  startDate: true,
  reviewDate: true,
  status: true,
}).omit({ id: true });

export const insertGoalSchema = createInsertSchema(goals).pick({
  carePlanId: true,
  title: true,
  description: true,
  startDate: true,
  targetDate: true,
  status: true,
  progressPercentage: true,
}).omit({ id: true });

export const insertTaskSchema = createInsertSchema(tasks).pick({
  carePlanId: true,
  title: true,
  description: true,
  category: true,
  timeOfDay: true,
  completed: true,
}).omit({ id: true });

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  serviceUserId: true,
  caregiverId: true,
  title: true,
  description: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  location: true,
  visitType: true,
}).omit({ id: true });

export const insertNoteSchema = createInsertSchema(notes).pick({
  serviceUserId: true,
  createdBy: true,
  content: true,
  timestamp: true,
  category: true,
  isVoiceRecorded: true,
}).omit({ id: true });

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).pick({
  serviceUserId: true,
  category: true,
  riskLevel: true,
  description: true,
  mitigations: true,
  reviewDate: true,
}).omit({ id: true });

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertServiceUser = z.infer<typeof insertServiceUserSchema>;
export type ServiceUser = typeof serviceUsers.$inferSelect;

export type InsertCarePlan = z.infer<typeof insertCarePlanSchema>;
export type CarePlan = typeof carePlans.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
