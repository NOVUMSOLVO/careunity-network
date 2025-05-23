/**
 * Script to fix column names in the database
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
  // Get the current schema of the users table
  console.log('Getting current schema of users table...');
  const columns = db.prepare(`PRAGMA table_info(users)`).all();
  
  console.log('Current columns in users table:');
  columns.forEach(col => {
    console.log(`- ${col.name} (${col.type})`);
  });
  
  // Check if we need to rename columns
  const hasProfileImage = columns.some(col => col.name === 'profileImage');
  const hasPhoneNumber = columns.some(col => col.name === 'phoneNumber');
  const hasFullName = columns.some(col => col.name === 'fullName');
  
  // Create a new table with the correct column names
  if (!hasProfileImage || !hasPhoneNumber || !hasFullName) {
    console.log('Creating new users table with correct column names...');
    
    // Create a temporary table with the correct schema
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        fullName TEXT NOT NULL,
        role TEXT NOT NULL,
        phoneNumber TEXT,
        profileImage TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Copy data from the old table to the new table
    console.log('Copying data to new table...');
    
    // Get the existing users
    const users = db.prepare(`SELECT * FROM users`).all();
    console.log(`Found ${users.length} users to migrate`);
    
    if (users.length > 0) {
      // Insert each user into the new table
      const insertStmt = db.prepare(`
        INSERT INTO users_new (
          id, username, password, email, fullName, role, phoneNumber, profileImage, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      for (const user of users) {
        insertStmt.run(
          user.id,
          user.username,
          user.password,
          user.email,
          user.full_name || user.fullName || '',
          user.role,
          user.phone_number || user.phoneNumber || null,
          user.profile_image || user.profileImage || null,
          user.created_at || new Date().toISOString(),
          user.updated_at || new Date().toISOString()
        );
      }
      
      console.log('Data copied successfully!');
    }
    
    // Drop the old table and rename the new one
    console.log('Replacing old table with new table...');
    db.exec(`
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
    `);
    
    console.log('Users table updated successfully!');
  } else {
    console.log('Users table already has the correct column names.');
  }
  
  console.log('Column names fixed successfully!');
} catch (error) {
  console.error('Error fixing column names:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
