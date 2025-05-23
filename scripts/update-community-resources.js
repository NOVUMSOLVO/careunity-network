/**
 * Script to update community resources tables
 */

import Database from 'better-sqlite3';
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

// Create a database connection
const db = new Database(dbPath);

try {
  // Check if is_referral_required column exists
  console.log('Checking if is_referral_required column exists...');
  let columnExists = db.prepare(`
    SELECT COUNT(*) as count
    FROM pragma_table_info('community_resources')
    WHERE name = 'is_referral_required'
  `).get();

  if (columnExists.count === 0) {
    console.log('Adding is_referral_required column to community_resources table...');

    // Add the missing column
    db.exec(`
      ALTER TABLE community_resources
      ADD COLUMN is_referral_required BOOLEAN DEFAULT 0
    `);

    console.log('is_referral_required column added successfully!');
  } else {
    console.log('is_referral_required column already exists.');
  }

  // Check if referral_process column exists
  console.log('Checking if referral_process column exists...');
  columnExists = db.prepare(`
    SELECT COUNT(*) as count
    FROM pragma_table_info('community_resources')
    WHERE name = 'referral_process'
  `).get();

  if (columnExists.count === 0) {
    console.log('Adding referral_process column to community_resources table...');

    // Add the missing column
    db.exec(`
      ALTER TABLE community_resources
      ADD COLUMN referral_process TEXT
    `);

    console.log('referral_process column added successfully!');
  } else {
    console.log('referral_process column already exists.');
  }

  // Check if referral_contact column exists
  console.log('Checking if referral_contact column exists...');
  columnExists = db.prepare(`
    SELECT COUNT(*) as count
    FROM pragma_table_info('community_resources')
    WHERE name = 'referral_contact'
  `).get();

  if (columnExists.count === 0) {
    console.log('Adding referral_contact column to community_resources table...');

    // Add the missing column
    db.exec(`
      ALTER TABLE community_resources
      ADD COLUMN referral_contact TEXT
    `);

    console.log('referral_contact column added successfully!');
  } else {
    console.log('referral_contact column already exists.');
  }

  console.log('Community resources tables updated successfully!');
} catch (error) {
  console.error('Error updating community resources tables:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
