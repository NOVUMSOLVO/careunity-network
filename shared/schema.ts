import { pgTable, text, serial, integer, boolean, pgEnum, jsonb, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { SyncOperationMethodEnum, SyncOperationStatusEnum } from "./types/sync";
import { userRoleValues } from "./types/user-roles";
import { feedbackCategoryValues, feedbackStatusValues } from "./types/feedback";
import { documentTypeValues, documentCategoryValues } from "./types/document";

// Import security training schema
export * from "./schema/security-training";

// User roles enum
export const userRoleEnum = pgEnum('user_role', userRoleValues);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("fullName").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default('care_worker'),
  phoneNumber: text("phone_number"),
  profileImage: text("profile_image"),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false),
  backupCodes: text("backup_codes").array(),
  lastPasswordChange: timestamp("last_password_change"),
  passwordResetRequired: boolean("password_reset_required").default(false),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  theme: text("theme").default('system'), // light, dark, system
  language: text("language").default('en'),
  notifications: jsonb("notifications").default({}),
  dashboardLayout: jsonb("dashboard_layout").default({}),
  timezone: text("timezone").default('UTC'),
  dateFormat: text("date_format").default('YYYY-MM-DD'),
  timeFormat: text("time_format").default('HH:mm'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service User table
export const serviceUsers = pgTable("service_users", {
  id: serial("id").primaryKey(),
  uniqueId: text("unique_id").notNull().unique(),
  fullName: text("fullName").notNull(),
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
  goalId: integer("goal_id").references(() => goals.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // personal care, medication, meal, etc.
  timeOfDay: text("time_of_day").notNull(), // morning, afternoon, evening, etc.
  status: text("status").notNull().default('pending'), // pending, in-progress, completed, overdue
  dueDate: text("due_date"), // Using text to store as YYYY-MM-DD format
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
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  actualDuration: integer("actual_duration"),
  status: visitStatusEnum("status").notNull().default('scheduled'),
  notes: text("notes"),
  tasks: text("tasks"), // JSON string of tasks to be completed
  priority: text("priority").default('normal'), // low, normal, high
  visitType: text("visit_type").notNull(), // personal care, medication, etc.
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  feedback: text("feedback"),
  rating: integer("rating"),
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
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username cannot exceed 50 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password cannot exceed 100 characters"), // Increased min length for security
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email cannot exceed 255 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal('')), // E.164 like format, optional
  profileImage: z.string().url({ message: "Invalid URL for profile image" }).optional().or(z.literal('')),
  role: z.enum(userRoleEnum.enumValues).optional(), // Make role optional here if default is handled or set by specific logic
});

export const updateUserSchema = insertUserSchema.partial(); // For PATCH requests

export const insertServiceUserSchema = createInsertSchema(serviceUsers, {
  uniqueId: z.string().min(1, "Unique ID is required").max(50, "Unique ID cannot exceed 50 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  address: z.string().min(5, "Address must be at least 5 characters").max(255, "Address cannot exceed 255 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal('')),
  profileImage: z.string().url({ message: "Invalid URL for profile image" }).optional().or(z.literal('')),
  preferences: z.string().optional().or(z.literal('')),
  needs: z.string().optional().or(z.literal('')),
  lifeStory: z.string().optional().or(z.literal('')),
}).omit({ id: true });

export const insertCarePlanSchema = createInsertSchema(carePlans, {
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters"),
  summary: z.string().max(500, "Summary cannot exceed 500 characters").optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Review date must be in YYYY-MM-DD format").optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
}).omit({ id: true });

export const insertGoalSchema = createInsertSchema(goals, {
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be in YYYY-MM-DD format").optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
  progressPercentage: z.number().int().min(0).max(100),
  carePlanId: z.number().int().positive("Care Plan ID must be a positive integer"),
}).omit({ id: true });

export const insertTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal('')),
  category: z.string().min(1, "Category is required"),
  timeOfDay: z.string().min(1, "Time of day is required"),
  completed: z.boolean().optional(),
  carePlanId: z.number().int().positive("Care Plan ID must be a positive integer"),
}).omit({ id: true });

export const insertAppointmentSchema = createInsertSchema(appointments, {
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:MM format"),
  status: z.string().min(1, "Status is required"),
  location: z.string().max(255, "Location cannot exceed 255 characters").optional().or(z.literal('')),
  visitType: z.string().min(1, "Visit type is required"),
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
  caregiverId: z.number().int().positive("Caregiver ID must be a positive integer").optional(),
}).omit({ id: true });

export const insertNoteSchema = createInsertSchema(notes, {
  content: z.string().min(1, "Content cannot be empty"),
  timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Timestamp must be in YYYY-MM-DD HH:MM format"),
  category: z.string().max(50, "Category cannot exceed 50 characters").optional().or(z.literal('')),
  isVoiceRecorded: z.boolean().optional(),
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
  createdBy: z.number().int().positive("Creator ID must be a positive integer"),
}).omit({ id: true });

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments, {
  category: z.string().min(1, "Category is required").max(100, "Category cannot exceed 100 characters"),
  riskLevel: z.string().min(1, "Risk level is required"),
  description: z.string().min(1, "Description is required"),
  mitigations: z.string().optional().or(z.literal('')),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Review date must be in YYYY-MM-DD format").optional().or(z.literal('')),
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
}).omit({ id: true });

export const resourceCategoryEnum = pgEnum('resource_category', [
  'health', 'housing', 'food', 'clothing', 'transportation', 'legal',
  'education', 'employment', 'mental_health', 'social', 'financial', 'activities', 'other'
]);

export const resourceStatusEnum = pgEnum('resource_status', ['active', 'inactive', 'pending']);

// Location table for community resources
export const resourceLocations = pgTable("resource_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  region: text("region"),
  postcode: text("postcode"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isVirtual: boolean("is_virtual").notNull().default(false),
});

// Community Resources table
export const communityResources = pgTable("community_resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categories: resourceCategoryEnum("categories").array().notNull(),
  locationId: integer("location_id").references(() => resourceLocations.id),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  website: text("website"),
  address: text("address"),
  postcode: text("postcode"),
  availability: jsonb("availability").notNull(), // Store availability as JSON
  isReferralRequired: boolean("is_referral_required").notNull().default(false),
  referralProcess: text("referral_process"),
  referralContact: text("referral_contact"),
  isFree: boolean("is_free").notNull().default(false),
  pricing: text("pricing"),
  fundingOptions: text("funding_options").array(),
  eligibilityCriteria: jsonb("eligibility_criteria"), // Store eligibility criteria as JSON
  languages: text("languages").array(),
  accessibilityFeatures: text("accessibility_features").array(),
  serviceArea: text("service_area"),
  status: resourceStatusEnum("status").notNull().default('active'),
  rating: integer("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  lastUpdated: text("last_updated").notNull(), // Using text to store as YYYY-MM-DD format
});

// Resource referrals table
export const resourceReferrals = pgTable("resource_referrals", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => communityResources.id),
  serviceUserId: integer("service_user_id").notNull().references(() => serviceUsers.id),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  date: text("date").notNull(), // Using text to store as YYYY-MM-DD format
  status: text("status").notNull().default('pending'), // pending, accepted, declined, completed
  notes: text("notes"),
  followUpDate: text("follow_up_date"),
  outcome: text("outcome"),
});

// Resource reviews table
export const resourceReviews = pgTable("resource_reviews", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => communityResources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: text("date").notNull(), // Using text to store as YYYY-MM-DD format
  helpfulCount: integer("helpful_count").notNull().default(0),
});

// Resource bookmarks table
export const resourceBookmarks = pgTable("resource_bookmarks", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => communityResources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  dateAdded: text("date_added").notNull(), // Using text to store as YYYY-MM-DD format
  notes: text("notes"),
});

// Insert schemas for community resources
export const insertResourceLocationSchema = createInsertSchema(resourceLocations, {
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  city: z.string().min(2, "City must be at least 2 characters").max(100, "City cannot exceed 100 characters"),
  region: z.string().max(100, "Region cannot exceed 100 characters").optional().or(z.literal('')),
  postcode: z.string().max(20, "Postcode cannot exceed 20 characters").optional().or(z.literal('')),
  latitude: z.string().regex(/^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude").optional().or(z.literal('')),
  longitude: z.string().regex(/^-?((1[0-7]|[1-9])?\d(\.\d+)?|180(\.0+)?)$/, "Invalid longitude").optional().or(z.literal('')),
  isVirtual: z.boolean().optional(),
}).omit({ id: true });

export const insertCommunityResourceSchema = createInsertSchema(communityResources, {
  name: z.string().min(2, "Name must be at least 2 characters").max(150, "Name cannot exceed 150 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categories: z.array(z.enum(resourceCategoryEnum.enumValues)).min(1, "At least one category is required"),
  locationId: z.number().int().positive("Location ID must be a positive integer").optional(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal('')),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal('')),
  address: z.string().max(255, "Address cannot exceed 255 characters").optional().or(z.literal('')),
  postcode: z.string().max(20, "Postcode cannot exceed 20 characters").optional().or(z.literal('')),
  availability: z.any().refine(val => {
    try {
      if (typeof val === 'string') JSON.parse(val);
      else JSON.stringify(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Availability must be a valid JSON object or string" }),
  isReferralRequired: z.boolean().optional(),
  referralProcess: z.string().optional().or(z.literal('')),
  referralContact: z.string().optional().or(z.literal('')),
  isFree: z.boolean().optional(),
  pricing: z.string().optional().or(z.literal('')),
  fundingOptions: z.array(z.string()).optional(),
  eligibilityCriteria: z.any().refine(val => {
    try {
      if (typeof val === 'string') JSON.parse(val);
      else JSON.stringify(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Eligibility criteria must be a valid JSON object or string" }).optional(),
  languages: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  serviceArea: z.string().optional().or(z.literal('')),
  status: z.enum(resourceStatusEnum.enumValues).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Last updated date must be in YYYY-MM-DD format"),
}).omit({ id: true });

export const insertResourceReferralSchema = createInsertSchema(resourceReferrals, {
  resourceId: z.number().int().positive("Resource ID must be a positive integer"),
  serviceUserId: z.number().int().positive("Service User ID must be a positive integer"),
  referrerId: z.number().int().positive("Referrer ID must be a positive integer"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional().or(z.literal('')),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Follow-up date must be in YYYY-MM-DD format").optional().or(z.literal('')),
  outcome: z.string().optional().or(z.literal(''))
}).omit({ id: true });

export const insertResourceReviewSchema = createInsertSchema(resourceReviews, {
  resourceId: z.number().int().positive("Resource ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  helpfulCount: z.number().int().min(0).optional(),
}).omit({ id: true });

export const insertResourceBookmarkSchema = createInsertSchema(resourceBookmarks, {
  resourceId: z.number().int().positive("Resource ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  dateAdded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date added must be in YYYY-MM-DD format"),
  notes: z.string().optional().or(z.literal(''))
}).omit({ id: true });

// Schema for login
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Schema for ID parameter validation
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer").transform(val => parseInt(val, 10)),
});

// Schema for date query parameter validation
export const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
});

// Schema for general query parameters for community resources
export const communityResourceQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  locationId: z.string().regex(/^\d+$/, "Location ID must be a positive integer").transform(val => parseInt(val, 10)).optional(),
});

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

export type InsertResourceLocation = z.infer<typeof insertResourceLocationSchema>;
export type ResourceLocation = typeof resourceLocations.$inferSelect;

export type InsertCommunityResource = z.infer<typeof insertCommunityResourceSchema>;
export type CommunityResource = typeof communityResources.$inferSelect;

export type InsertResourceReferral = z.infer<typeof insertResourceReferralSchema>;
export type ResourceReferral = typeof resourceReferrals.$inferSelect;

export type InsertResourceReview = z.infer<typeof insertResourceReviewSchema>;
export type ResourceReview = typeof resourceReviews.$inferSelect;

export type InsertResourceBookmark = z.infer<typeof insertResourceBookmarkSchema>;
export type ResourceBookmark = typeof resourceBookmarks.$inferSelect;

// Quality Metrics table
export const qualityMetrics = pgTable("quality_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  trend: text("trend").notNull().default('stable'), // up, down, stable
  category: text("category").notNull(), // care, staff, compliance, satisfaction
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Quality Metrics insert schema
export const insertQualityMetricSchema = createInsertSchema(qualityMetrics, {
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters"),
  value: z.number().min(0, "Value must be a positive number"),
  target: z.number().min(0, "Target must be a positive number"),
  trend: z.enum(['up', 'down', 'stable']),
  category: z.enum(['care', 'staff', 'compliance', 'satisfaction']),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal(''))
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertQualityMetric = z.infer<typeof insertQualityMetricSchema>;
export type QualityMetric = typeof qualityMetrics.$inferSelect;

// Sync Operations table
export const syncOperations = pgTable("sync_operations", {
  id: uuid("id").primaryKey(),
  url: text("url").notNull(),
  method: text("method").notNull(), // GET, POST, PUT, PATCH, DELETE
  body: text("body"),
  headers: jsonb("headers"),
  timestamp: integer("timestamp").notNull(),
  retries: integer("retries").notNull().default(0),
  status: text("status").notNull(), // pending, processing, completed, error
  errorMessage: text("error_message"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Insert schema for sync operations
export const insertSyncOperationSchema = createInsertSchema(syncOperations, {
  id: z.string().uuid(),
  url: z.string().url("URL must be a valid URL"),
  method: z.enum(SyncOperationMethodEnum.options),
  body: z.string().optional(),
  headers: z.record(z.string()).optional(),
  timestamp: z.number().int().positive(),
  retries: z.number().int().min(0).optional(),
  status: z.enum(SyncOperationStatusEnum.options),
  errorMessage: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.union([z.string(), z.number()]).optional(),
  userId: z.number().int().positive(),
});

export type InsertSyncOperation = z.infer<typeof insertSyncOperationSchema>;
export type SyncOperation = typeof syncOperations.$inferSelect;

// Feedback enums
export const feedbackCategoryEnum = pgEnum('feedback_category', feedbackCategoryValues);
export const feedbackStatusEnum = pgEnum('feedback_status', feedbackStatusValues);
export const feedbackPriorityEnum = pgEnum('feedback_priority', ['low', 'medium', 'high', 'critical']);
export const feedbackSourceEnum = pgEnum('feedback_source', ['in_app', 'email', 'support_ticket', 'user_interview', 'survey', 'usability_test', 'other']);

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: feedbackCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: feedbackStatusEnum("status").notNull().default('new'),
  priority: feedbackPriorityEnum("priority").notNull().default('medium'),
  source: feedbackSourceEnum("source").notNull().default('in_app'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  assignedTo: integer("assigned_to").references(() => users.id),
  relatedFeature: text("related_feature"),
  screenshots: text("screenshots").array(),
  tags: text("tags").array(),
  upvotes: integer("upvotes").notNull().default(0),
  parentId: integer("parent_id"),
  isPublic: boolean("is_public").notNull().default(true),
});

// Self-reference is handled by the database constraints

// Feedback responses table
export const feedbackResponses = pgTable("feedback_responses", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").notNull().references(() => feedback.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isOfficial: boolean("is_official").notNull().default(false),
});

// Feedback upvotes table
export const feedbackUpvotes = pgTable("feedback_upvotes", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").notNull().references(() => feedback.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for feedback
export const insertFeedbackSchema = createInsertSchema(feedback, {
  userId: z.number().int().positive("User ID must be a positive integer"),
  category: z.enum(feedbackCategoryEnum.enumValues),
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(feedbackStatusEnum.enumValues).optional(),
  priority: z.enum(feedbackPriorityEnum.enumValues).optional(),
  source: z.enum(feedbackSourceEnum.enumValues).optional(),
  assignedTo: z.number().int().positive("Assigned user ID must be a positive integer").optional(),
  relatedFeature: z.string().max(100, "Related feature cannot exceed 100 characters").optional().or(z.literal('')),
  screenshots: z.array(z.string().url("Screenshot must be a valid URL")).optional(),
  tags: z.array(z.string().max(50, "Tag cannot exceed 50 characters")).optional(),
  upvotes: z.number().int().min(0).optional(),
  parentId: z.number().int().positive("Parent feedback ID must be a positive integer").optional(),
  isPublic: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertFeedbackResponseSchema = createInsertSchema(feedbackResponses, {
  feedbackId: z.number().int().positive("Feedback ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  content: z.string().min(1, "Content cannot be empty"),
  isOfficial: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertFeedbackUpvoteSchema = createInsertSchema(feedbackUpvotes, {
  feedbackId: z.number().int().positive("Feedback ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
}).omit({ id: true, createdAt: true });

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertFeedbackResponse = z.infer<typeof insertFeedbackResponseSchema>;
export type FeedbackResponse = typeof feedbackResponses.$inferSelect;

export type InsertFeedbackUpvote = z.infer<typeof insertFeedbackUpvoteSchema>;
export type FeedbackUpvote = typeof feedbackUpvotes.$inferSelect;

// Document type and category enums
export const documentTypeEnum = pgEnum('document_type', documentTypeValues);
export const documentCategoryEnum = pgEnum('document_category', documentCategoryValues);

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull(),
  category: documentCategoryEnum("category").notNull(),
  size: integer("size").notNull(),
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  lastModified: timestamp("last_modified").defaultNow().notNull(),
  tags: text("tags").array(),
  serviceUserId: integer("service_user_id").references(() => serviceUsers.id),
  description: text("description"),
  url: text("url").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
});

// Document sharing table
export const documentSharing = pgTable("document_sharing", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  sharedWithId: integer("shared_with_id").notNull().references(() => users.id),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  accessLevel: text("access_level").notNull(), // view, download, edit
});

// Insert schemas for documents
export const insertDocumentSchema = createInsertSchema(documents, {
  name: z.string().min(1, "Document name is required").max(255, "Document name is too long"),
  type: z.enum(documentTypeEnum.enumValues),
  category: z.enum(documentCategoryEnum.enumValues),
  size: z.number().int().positive("File size must be positive"),
  uploadedById: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  serviceUserId: z.number().int().positive().optional(),
  description: z.string().max(500, "Description is too long").optional().or(z.literal('')),
  url: z.string().url("URL must be valid"),
  isPublic: z.boolean().optional(),
  isArchived: z.boolean().optional(),
}).omit({ id: true, uploadedAt: true, lastModified: true });

export const insertDocumentSharingSchema = createInsertSchema(documentSharing, {
  documentId: z.number().int().positive(),
  sharedWithId: z.number().int().positive(),
  expiresAt: z.string().datetime().optional().or(z.literal('')),
  accessLevel: z.enum(['view', 'download', 'edit']),
}).omit({ id: true, sharedAt: true });

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertDocumentSharing = z.infer<typeof insertDocumentSharingSchema>;
export type DocumentSharing = typeof documentSharing.$inferSelect;

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  eventType: text("event_type").notNull(),
  userId: integer("user_id"),
  username: text("username"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  action: text("action").notNull(),
  details: jsonb("details").notNull(),
  hash: text("hash"),
  previousEntryHash: text("previous_entry_hash"),
});
