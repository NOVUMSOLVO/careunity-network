import { pgTable, text, serial, integer, boolean, pgEnum, jsonb, timestamp } from "drizzle-orm/pg-core";
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
export const insertUserSchema = createInsertSchema(users, {
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

// Community Resources schema
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
export const insertResourceLocationSchema = createInsertSchema(resourceLocations).pick({
  name: true,
  city: true,
  region: true,
  postcode: true,
  latitude: true,
  longitude: true,
  isVirtual: true,
}).omit({ id: true });

export const insertCommunityResourceSchema = createInsertSchema(communityResources).pick({
  name: true,
  description: true,
  categories: true,
  locationId: true,
  contactPhone: true,
  contactEmail: true,
  website: true,
  address: true,
  postcode: true,
  availability: true,
  isReferralRequired: true,
  referralProcess: true,
  referralContact: true,
  isFree: true,
  pricing: true,
  fundingOptions: true,
  eligibilityCriteria: true,
  languages: true,
  accessibilityFeatures: true,
  serviceArea: true,
  status: true,
  rating: true,
  reviewCount: true,
  lastUpdated: true,
}).omit({ id: true });

export const insertResourceReferralSchema = createInsertSchema(resourceReferrals).pick({
  resourceId: true,
  serviceUserId: true,
  referrerId: true,
  date: true,
  status: true,
  notes: true,
  followUpDate: true,
  outcome: true,
}).omit({ id: true });

export const insertResourceReviewSchema = createInsertSchema(resourceReviews).pick({
  resourceId: true,
  userId: true,
  rating: true,
  comment: true,
  date: true,
  helpfulCount: true,
}).omit({ id: true });

export const insertResourceBookmarkSchema = createInsertSchema(resourceBookmarks).pick({
  resourceId: true,
  userId: true,
  dateAdded: true,
  notes: true,
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
