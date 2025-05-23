/**
 * Script to create community resources tables
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
  console.log('Creating resource_locations table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      region TEXT,
      postcode TEXT,
      latitude TEXT,
      longitude TEXT,
      is_virtual BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Creating community_resources table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      categories TEXT,
      location_id INTEGER,
      contact_phone TEXT,
      contact_email TEXT,
      website TEXT,
      address TEXT,
      postcode TEXT,
      availability TEXT,
      is_free BOOLEAN DEFAULT 0,
      pricing TEXT,
      funding_options TEXT,
      eligibility_criteria TEXT,
      languages TEXT,
      accessibility_features TEXT,
      service_area TEXT,
      status TEXT DEFAULT 'active',
      rating REAL,
      review_count INTEGER DEFAULT 0,
      last_updated TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES resource_locations (id)
    )
  `);

  console.log('Creating resource_referrals table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      service_user_id INTEGER NOT NULL,
      referred_by INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      follow_up_date TEXT,
      outcome TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES community_resources (id),
      FOREIGN KEY (service_user_id) REFERENCES service_users (id),
      FOREIGN KEY (referred_by) REFERENCES users (id)
    )
  `);

  console.log('Creating resource_reviews table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      date TEXT NOT NULL,
      helpful_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES community_resources (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Creating resource_bookmarks table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      notes TEXT,
      date_added TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES community_resources (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Community resources tables created successfully!');
} catch (error) {
  console.error('Error creating community resources tables:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
