/**
 * Script to update users table
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
  // Check if profile_image column exists in users table
  console.log('Checking if profile_image column exists in users table...');
  const profileImageExists = db.prepare(`
    SELECT COUNT(*) as count 
    FROM pragma_table_info('users') 
    WHERE name = 'profile_image'
  `).get();
  
  if (profileImageExists.count === 0) {
    console.log('Adding profile_image column to users table...');
    
    // Add the missing column
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN profile_image TEXT
    `);
    
    console.log('profile_image column added successfully!');
  } else {
    console.log('profile_image column already exists in users table.');
  }
  
  // Check if fullName column exists in users table
  console.log('Checking if fullName column exists in users table...');
  const fullNameExists = db.prepare(`
    SELECT COUNT(*) as count 
    FROM pragma_table_info('users') 
    WHERE name = 'fullName'
  `).get();
  
  if (fullNameExists.count === 0) {
    console.log('Adding fullName column to users table...');
    
    // Add the missing column
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN fullName TEXT
    `);
    
    console.log('fullName column added successfully!');
  } else {
    console.log('fullName column already exists in users table.');
  }
  
  // Check if phoneNumber column exists in users table
  console.log('Checking if phoneNumber column exists in users table...');
  const phoneNumberExists = db.prepare(`
    SELECT COUNT(*) as count 
    FROM pragma_table_info('users') 
    WHERE name = 'phoneNumber'
  `).get();
  
  if (phoneNumberExists.count === 0) {
    console.log('Adding phoneNumber column to users table...');
    
    // Add the missing column
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN phoneNumber TEXT
    `);
    
    console.log('phoneNumber column added successfully!');
  } else {
    console.log('phoneNumber column already exists in users table.');
  }
  
  console.log('Users table updated successfully!');
} catch (error) {
  console.error('Error updating users table:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
