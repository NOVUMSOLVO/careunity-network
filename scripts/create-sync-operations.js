/**
 * Simple script to create the sync_operations table in SQLite
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Extract the file path from the DATABASE_URL
const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
console.log(`Using database at: ${dbPath}`);

// Create the database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create a database connection
const db = new Database(dbPath);

try {
  console.log('Creating sync_operations table...');

  // Create the sync_operations table
  db.exec(`
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

  // Create indexes
  console.log('Creating indexes...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sync_operations_user_id ON sync_operations(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sync_operations_timestamp ON sync_operations(timestamp)');

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
