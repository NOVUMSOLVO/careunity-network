/**
 * Migration to add sync_operations table
 */

import { sql } from 'drizzle-orm';
import { db } from '../db';

export async function up() {
  console.log('Running migration: add sync_operations table');

  // Create the sync_operations table
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS sync_operations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      url TEXT NOT NULL,
      method TEXT NOT NULL,
      body TEXT,
      headers JSONB,
      timestamp BIGINT NOT NULL,
      retries INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      error_message TEXT,
      entity_type TEXT,
      entity_id TEXT,
      user_id INTEGER NOT NULL REFERENCES users(id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_sync_operations_user_id ON sync_operations(user_id);
    CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
    CREATE INDEX IF NOT EXISTS idx_sync_operations_timestamp ON sync_operations(timestamp);
  `);

  console.log('Migration completed: add sync_operations table');
}

export async function down() {
  console.log('Running migration rollback: remove sync_operations table');

  // Drop the sync_operations table
  await db.execute(sql`
    DROP TABLE IF EXISTS sync_operations;
  `);

  console.log('Migration rollback completed: remove sync_operations table');
}
