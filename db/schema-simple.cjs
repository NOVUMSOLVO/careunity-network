// Simplified database schema definitions
const { sqliteTable, text, integer, real } = require('drizzle-orm/sqlite-core');

// User roles
const USER_ROLES = ['admin', 'care_manager', 'care_worker'];

// Users table
const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: USER_ROLES }).notNull().default('care_worker'),
  phoneNumber: text('phone_number'),
  profileImage: text('profile_image'),
  totpSecret: text('totp_secret'),
  totpEnabled: integer('totp_enabled', { mode: 'boolean' }).default(false)
});

// Service users table
const serviceUsers = sqliteTable('service_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uniqueId: text('unique_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(), // YYYY-MM-DD format
  address: text('address').notNull(),
  phoneNumber: text('phone_number'),
  emergencyContact: text('emergency_contact'),
  profileImage: text('profile_image'),
  preferences: text('preferences'), // JSON string
  needs: text('needs'), // JSON string
  lifeStory: text('life_story')
});

// Care plans table
const carePlans = sqliteTable('care_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceUserId: integer('service_user_id').notNull().references(() => serviceUsers.id),
  title: text('title').notNull(),
  summary: text('summary'),
  startDate: text('start_date').notNull(), // YYYY-MM-DD format
  reviewDate: text('review_date'), // YYYY-MM-DD format
  status: text('status').notNull() // active, completed, etc.
});

// Tasks table
const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carePlanId: integer('care_plan_id').notNull().references(() => carePlans.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // personal care, medication, meal, etc.
  timeOfDay: text('time_of_day').notNull(), // morning, afternoon, evening, etc.
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false)
});

// Appointments table
const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceUserId: integer('service_user_id').notNull().references(() => serviceUsers.id),
  caregiverId: integer('caregiver_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // YYYY-MM-DD format
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  status: text('status').notNull().default('scheduled'), // scheduled, completed, cancelled
  location: text('location'),
  visitType: text('visit_type').notNull() // personal care, medication, etc.
});

// Notes table
const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceUserId: integer('service_user_id').notNull().references(() => serviceUsers.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(), // YYYY-MM-DD HH:MM format
  category: text('category'), // general, medication, personal care, etc.
  isVoiceRecorded: integer('is_voice_recorded', { mode: 'boolean' }).notNull().default(false)
});

// Export the schema
module.exports = {
  users,
  serviceUsers,
  carePlans,
  tasks,
  appointments,
  notes
};
