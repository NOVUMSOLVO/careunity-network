/**
 * Database Migration Script
 *
 * This script creates the database tables based on the schema.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Make sure the .env file is loaded
import 'dotenv/config';

// Extract the file path from the DATABASE_URL
const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './dev.db';

console.log(`Migrating database at ${dbPath}`);

// Create the database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create a database connection
const sqlite = new Database(dbPath);

// Create a drizzle instance
const db = drizzle(sqlite, { schema });

// Helper function to run SQL and log the result
const runSQL = (sql: string, tableName: string) => {
  console.log(`Creating table: ${tableName}`);
  try {
    sqlite.exec(sql);
    console.log(`Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
  }
};

// Create the schema
console.log('Creating database schema...');

// Create users table
runSQL(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    role TEXT NOT NULL,
    phone_number TEXT,
    profile_image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create service_users table
runSQL(`
  CREATE TABLE IF NOT EXISTS service_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    care_needs TEXT,
    preferences TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    gp_name TEXT,
    gp_phone TEXT,
    gp_address TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`, 'service_users');

// Create care_plans table
runSQL(`
  CREATE TABLE IF NOT EXISTS care_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  )
`, 'care_plans');

// Create goals table
runSQL(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    care_plan_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (care_plan_id) REFERENCES care_plans (id)
  )
`, 'goals');

// Create tasks table
runSQL(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    care_plan_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (care_plan_id) REFERENCES care_plans (id)
  )
`, 'tasks');

// Create appointments table
runSQL(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER NOT NULL,
    caregiver_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (caregiver_id) REFERENCES users (id)
  )
`, 'appointments');

// Create notes table
runSQL(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  )
`, 'notes');

// Create risk_assessments table
runSQL(`
  CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER NOT NULL,
    assessment_date TEXT NOT NULL,
    risk_factors TEXT,
    risk_level TEXT NOT NULL,
    mitigation_strategies TEXT,
    review_date TEXT,
    assessed_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (assessed_by) REFERENCES users (id)
  )
`, 'risk_assessments');

// Create staff table
runSQL(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    role TEXT NOT NULL,
    qualifications TEXT,
    specialties TEXT,
    working_hours TEXT,
    max_visits_per_day INTEGER DEFAULT 8,
    preferred_locations TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`, 'staff');

// Create visits table
runSQL(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER NOT NULL,
    caregiver_id INTEGER,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    tasks TEXT,
    priority TEXT DEFAULT 'normal',
    visit_type TEXT NOT NULL,
    completed_at TEXT,
    completed_by INTEGER,
    feedback TEXT,
    feedback_rating INTEGER,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (caregiver_id) REFERENCES users (id),
    FOREIGN KEY (completed_by) REFERENCES users (id)
  )
`, 'visits');

// Create incidents table
runSQL(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_user_id INTEGER,
    reported_by INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    location TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    resolved_by INTEGER,
    action_taken TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    follow_up_date TEXT,
    is_reportable BOOLEAN DEFAULT 0,
    reported_to_authorities BOOLEAN DEFAULT 0,
    report_date TEXT,
    FOREIGN KEY (service_user_id) REFERENCES service_users (id),
    FOREIGN KEY (reported_by) REFERENCES users (id),
    FOREIGN KEY (resolved_by) REFERENCES users (id)
  )
`, 'incidents');

console.log('Database schema created successfully!');

// Close the database connection
sqlite.close();
