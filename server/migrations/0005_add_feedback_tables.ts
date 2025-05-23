import { sql } from 'drizzle-orm';
import { pgTable, serial, integer, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { feedbackCategoryValues, feedbackStatusValues } from '@shared/types/feedback';

export async function up(db: any): Promise<void> {
  // Create enums
  await db.execute(sql`
    CREATE TYPE "feedback_category" AS ENUM (${sql.join(feedbackCategoryValues)});
    CREATE TYPE "feedback_status" AS ENUM (${sql.join(feedbackStatusValues)});
    CREATE TYPE "feedback_priority" AS ENUM ('low', 'medium', 'high', 'critical');
    CREATE TYPE "feedback_source" AS ENUM ('in_app', 'email', 'support_ticket', 'user_interview', 'survey', 'usability_test', 'other');
  `);

  // Create feedback table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "feedback" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
      "category" feedback_category NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "status" feedback_status NOT NULL DEFAULT 'new',
      "priority" feedback_priority NOT NULL DEFAULT 'medium',
      "source" feedback_source NOT NULL DEFAULT 'in_app',
      "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "assigned_to" INTEGER REFERENCES "users"("id"),
      "related_feature" TEXT,
      "screenshots" TEXT[],
      "tags" TEXT[],
      "upvotes" INTEGER NOT NULL DEFAULT 0,
      "parent_id" INTEGER REFERENCES "feedback"("id"),
      "is_public" BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  // Create feedback responses table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "feedback_responses" (
      "id" SERIAL PRIMARY KEY,
      "feedback_id" INTEGER NOT NULL REFERENCES "feedback"("id") ON DELETE CASCADE,
      "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
      "content" TEXT NOT NULL,
      "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "is_official" BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  // Create feedback upvotes table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "feedback_upvotes" (
      "id" SERIAL PRIMARY KEY,
      "feedback_id" INTEGER NOT NULL REFERENCES "feedback"("id") ON DELETE CASCADE,
      "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
      "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("feedback_id", "user_id")
    );
  `);

  // Create indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "feedback_user_id_idx" ON "feedback"("user_id");
    CREATE INDEX IF NOT EXISTS "feedback_category_idx" ON "feedback"("category");
    CREATE INDEX IF NOT EXISTS "feedback_status_idx" ON "feedback"("status");
    CREATE INDEX IF NOT EXISTS "feedback_priority_idx" ON "feedback"("priority");
    CREATE INDEX IF NOT EXISTS "feedback_is_public_idx" ON "feedback"("is_public");
    CREATE INDEX IF NOT EXISTS "feedback_responses_feedback_id_idx" ON "feedback_responses"("feedback_id");
    CREATE INDEX IF NOT EXISTS "feedback_upvotes_feedback_id_idx" ON "feedback_upvotes"("feedback_id");
  `);
}

export async function down(db: any): Promise<void> {
  // Drop tables
  await db.execute(sql`
    DROP TABLE IF EXISTS "feedback_upvotes";
    DROP TABLE IF EXISTS "feedback_responses";
    DROP TABLE IF EXISTS "feedback";
  `);

  // Drop enums
  await db.execute(sql`
    DROP TYPE IF EXISTS "feedback_category";
    DROP TYPE IF EXISTS "feedback_status";
    DROP TYPE IF EXISTS "feedback_priority";
    DROP TYPE IF EXISTS "feedback_source";
  `);
}
