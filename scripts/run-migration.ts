/**
 * Script to run a specific migration
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { config } from 'dotenv';
import * as schema from '../shared/schema';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
console.log(`Loading environment variables from: ${envPath}`);
config({ path: envPath });

console.log('Environment variables loaded');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  throw new Error("DATABASE_URL environment variable is required for migrations.");
}

async function runMigration() {
  console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 20)}...`);

  // Determine if we're using SQLite or PostgreSQL
  const isSQLite = process.env.DATABASE_URL.startsWith('sqlite:');
  let db;

  if (isSQLite) {
    // SQLite setup
    console.log('Using SQLite database');

    // Extract the file path from the DATABASE_URL
    const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
    const sqlite = new Database(dbPath);
    db = drizzleSQLite(sqlite, { schema });
  } else {
    // PostgreSQL setup with Neon
    console.log('Using PostgreSQL database with Neon');

    // Configure WebSocket for Neon
    neonConfig.webSocketConstructor = WebSocket;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzleNeon(pool, { schema });
  }

  try {
    console.log("Starting migration: add sync_operations table");

    // Create the sync_operations table
    if (isSQLite) {
      // SQLite version - execute statements one by one
      console.log("Creating sync_operations table...");
      db.driver.exec(`
        CREATE TABLE IF NOT EXISTS sync_operations (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          method TEXT NOT NULL,
          body TEXT,
          headers TEXT,
          timestamp INTEGER NOT NULL,
          retries INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL,
          error_message TEXT,
          entity_type TEXT,
          entity_id TEXT,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      console.log("Creating indexes...");
      db.driver.exec("CREATE INDEX IF NOT EXISTS idx_sync_operations_user_id ON sync_operations(user_id)");
      db.driver.exec("CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status)");
      db.driver.exec("CREATE INDEX IF NOT EXISTS idx_sync_operations_timestamp ON sync_operations(timestamp)");
      console.log("Indexes created successfully");
    } else {
      // PostgreSQL version
      await db.execute(`
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
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    if (!isSQLite) {
      // For PostgreSQL, we need to close the pool
      const pool = db.driver;
      await pool.end();
    } else {
      // For SQLite, we need to close the database
      db.driver.close();
    }
  }
}

runMigration();
