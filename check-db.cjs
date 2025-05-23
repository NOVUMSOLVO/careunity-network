// Script to check database connection
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

console.log('Checking database connection...');
console.log(`Database URL: ${databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'Not found'}`);

// Check if using SQLite or PostgreSQL
if (databaseUrl && databaseUrl.startsWith('sqlite:')) {
  console.log('Using SQLite database');
  
  // Extract the file path from the DATABASE_URL
  const dbPath = databaseUrl.replace('sqlite:', '');
  console.log(`SQLite database path: ${dbPath}`);
  
  // Check if the database file exists
  try {
    if (fs.existsSync(dbPath)) {
      console.log('SQLite database file exists');
    } else {
      console.log('SQLite database file does not exist');
    }
  } catch (err) {
    console.error('Error checking SQLite database file:', err);
  }
} else if (databaseUrl) {
  console.log('Using PostgreSQL database');
  
  // Create a new client
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  
  // Connect to the database
  pool.connect()
    .then(client => {
      console.log('Successfully connected to PostgreSQL database');
      
      // Run a simple query
      return client.query('SELECT NOW()')
        .then(res => {
          console.log('Database query result:', res.rows[0]);
          client.release();
        })
        .catch(err => {
          console.error('Error executing query:', err);
          client.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to PostgreSQL database:', err);
    })
    .finally(() => {
      pool.end();
    });
} else {
  console.error('DATABASE_URL environment variable not found');
}
