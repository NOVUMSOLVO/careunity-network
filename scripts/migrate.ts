import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Running database migrations...');
  
  try {
    // This creates the tables in the database based on our schema
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    // Create all enums first
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('caregiver', 'manager', 'admin', 'serviceuser', 'family');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_category') THEN
          CREATE TYPE resource_category AS ENUM ('health', 'housing', 'food', 'clothing', 'transportation', 'legal', 'education', 'employment', 'mental_health', 'social', 'financial', 'activities', 'other');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_status') THEN
          CREATE TYPE resource_status AS ENUM ('active', 'inactive', 'pending');
        END IF;
      END
      $$;
    `);
    
    // Create the schema by directly using SQL
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" user_role NOT NULL DEFAULT 'caregiver',
        "phone_number" TEXT,
        "profile_image" TEXT
      );
    `);
    
    // Create service_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "service_users" (
        "id" SERIAL PRIMARY KEY,
        "unique_id" TEXT NOT NULL UNIQUE,
        "full_name" TEXT NOT NULL,
        "date_of_birth" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone_number" TEXT,
        "emergency_contact" TEXT,
        "profile_image" TEXT,
        "preferences" TEXT,
        "needs" TEXT,
        "life_story" TEXT
      );
    `);
    
    // Create care_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "care_plans" (
        "id" SERIAL PRIMARY KEY,
        "service_user_id" INTEGER NOT NULL REFERENCES "service_users"("id"),
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "start_date" TEXT NOT NULL,
        "review_date" TEXT,
        "status" TEXT NOT NULL
      );
    `);
    
    // Create goals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "goals" (
        "id" SERIAL PRIMARY KEY,
        "care_plan_id" INTEGER NOT NULL REFERENCES "care_plans"("id"),
        "title" TEXT NOT NULL,
        "description" TEXT,
        "start_date" TEXT NOT NULL,
        "target_date" TEXT,
        "status" TEXT NOT NULL,
        "progress_percentage" INTEGER NOT NULL DEFAULT 0
      );
    `);
    
    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL PRIMARY KEY,
        "care_plan_id" INTEGER NOT NULL REFERENCES "care_plans"("id"),
        "title" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "time_of_day" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false
      );
    `);
    
    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" SERIAL PRIMARY KEY,
        "service_user_id" INTEGER NOT NULL REFERENCES "service_users"("id"),
        "caregiver_id" INTEGER REFERENCES "users"("id"),
        "title" TEXT NOT NULL,
        "description" TEXT,
        "date" TEXT NOT NULL,
        "start_time" TEXT NOT NULL,
        "end_time" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'scheduled',
        "location" TEXT,
        "visit_type" TEXT NOT NULL
      );
    `);
    
    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "notes" (
        "id" SERIAL PRIMARY KEY,
        "service_user_id" INTEGER NOT NULL REFERENCES "service_users"("id"),
        "created_by" INTEGER NOT NULL REFERENCES "users"("id"),
        "content" TEXT NOT NULL,
        "timestamp" TEXT NOT NULL,
        "category" TEXT,
        "is_voice_recorded" BOOLEAN NOT NULL DEFAULT false
      );
    `);
    
    // Create risk_assessments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "risk_assessments" (
        "id" SERIAL PRIMARY KEY,
        "service_user_id" INTEGER NOT NULL REFERENCES "service_users"("id"),
        "category" TEXT NOT NULL,
        "risk_level" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "mitigations" TEXT,
        "review_date" TEXT
      );
    `);
    
    // Create resource_locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "resource_locations" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "region" TEXT,
        "postcode" TEXT,
        "latitude" TEXT,
        "longitude" TEXT,
        "is_virtual" BOOLEAN NOT NULL DEFAULT false
      );
    `);
    
    // Create community_resources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "community_resources" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "categories" resource_category[] NOT NULL,
        "location_id" INTEGER REFERENCES "resource_locations"("id"),
        "contact_phone" TEXT,
        "contact_email" TEXT,
        "website" TEXT,
        "address" TEXT,
        "postcode" TEXT,
        "availability" JSONB NOT NULL,
        "is_referral_required" BOOLEAN NOT NULL DEFAULT false,
        "referral_process" TEXT,
        "referral_contact" TEXT,
        "is_free" BOOLEAN NOT NULL DEFAULT false,
        "pricing" TEXT,
        "funding_options" TEXT[],
        "eligibility_criteria" JSONB,
        "languages" TEXT[],
        "accessibility_features" TEXT[],
        "service_area" TEXT,
        "status" resource_status NOT NULL DEFAULT 'active',
        "rating" INTEGER,
        "review_count" INTEGER NOT NULL DEFAULT 0,
        "last_updated" TEXT NOT NULL
      );
    `);
    
    // Create resource_referrals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "resource_referrals" (
        "id" SERIAL PRIMARY KEY,
        "resource_id" INTEGER NOT NULL REFERENCES "community_resources"("id"),
        "service_user_id" INTEGER NOT NULL REFERENCES "service_users"("id"),
        "referrer_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "date" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "follow_up_date" TEXT,
        "outcome" TEXT
      );
    `);
    
    // Create resource_reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "resource_reviews" (
        "id" SERIAL PRIMARY KEY,
        "resource_id" INTEGER NOT NULL REFERENCES "community_resources"("id"),
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "date" TEXT NOT NULL,
        "helpful_count" INTEGER NOT NULL DEFAULT 0
      );
    `);
    
    // Create resource_bookmarks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "resource_bookmarks" (
        "id" SERIAL PRIMARY KEY,
        "resource_id" INTEGER NOT NULL REFERENCES "community_resources"("id"),
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "date_added" TEXT NOT NULL,
        "notes" TEXT
      );
    `);
    
    // Create the session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      );
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);