// Database connection module
const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'careunity.db');

// Create database connection
let db;
let sqlite;

try {
  console.log(`Connecting to SQLite database at: ${dbPath}`);
  sqlite = new Database(dbPath);
  db = drizzle(sqlite);
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

// Export the database connection
module.exports = {
  db,
  sqlite,
  close: () => {
    if (sqlite) {
      console.log('Closing database connection');
      sqlite.close();
    }
  }
};
