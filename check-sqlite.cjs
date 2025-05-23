// Script to check SQLite database
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();

// Load environment variables from .env file
dotenv.config();

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

console.log('Checking SQLite database...');
console.log(`Database URL: ${databaseUrl || 'Not found'}`);

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable not found');
  process.exit(1);
}

if (!databaseUrl.startsWith('sqlite:')) {
  console.error('DATABASE_URL is not a SQLite database URL');
  process.exit(1);
}

// Extract the file path from the DATABASE_URL
const dbPath = databaseUrl.replace('sqlite:', '');
console.log(`SQLite database path: ${dbPath}`);

// Check if the database file exists
try {
  if (fs.existsSync(dbPath)) {
    console.log('SQLite database file exists');
    
    // Check if the database file is accessible
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err);
        process.exit(1);
      }
      
      console.log('Successfully opened SQLite database');
      
      // Check if the database has tables
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('Error querying SQLite database:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('Tables in the database:');
        if (tables.length === 0) {
          console.log('No tables found');
        } else {
          tables.forEach(table => {
            console.log(`- ${table.name}`);
          });
        }
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing SQLite database:', err);
            process.exit(1);
          }
          
          console.log('SQLite database connection closed');
        });
      });
    });
  } else {
    console.log('SQLite database file does not exist');
    
    // Create the database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create an empty database file
    console.log('Creating empty SQLite database file');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error creating SQLite database:', err);
        process.exit(1);
      }
      
      console.log('Successfully created SQLite database');
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing SQLite database:', err);
          process.exit(1);
        }
        
        console.log('SQLite database connection closed');
      });
    });
  }
} catch (err) {
  console.error('Error checking SQLite database file:', err);
  process.exit(1);
}
