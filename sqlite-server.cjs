// Minimal Express server with SQLite database
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const port = 3333; // Use a hardcoded port to avoid conflicts

// Basic middleware
app.use(express.json());

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || 'sqlite:./dev.db';

// Extract the file path from the DATABASE_URL
const dbPath = databaseUrl.replace('sqlite:', '');
console.log(`SQLite database path: ${dbPath}`);

// Create the database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`Creating database directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
let db;

// Initialize the database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err);
        reject(err);
        return;
      }

      console.log('Successfully opened SQLite database');

      // Create a simple users table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }

        console.log('Users table created or already exists');
        resolve();
      });
    });
  });
}

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    databasePath: dbPath
  });
});

// Get all users endpoint
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error('Error querying users:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.json(rows);
  });
});

// Create user endpoint
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    res.status(400).json({ error: 'Username and email are required' });
    return;
  }

  db.run(
    'INSERT INTO users (username, email) VALUES (?, ?)',
    [username, email],
    function(err) {
      if (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      res.status(201).json({
        id: this.lastID,
        username,
        email
      });
    }
  );
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CareUnity Minimal Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
          }
          h1 {
            color: #333;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>CareUnity Minimal Server</h1>
        <div class="card">
          <p>This is a minimal server with SQLite database.</p>
          <p>Server time: ${new Date().toLocaleString()}</p>
          <p>API Endpoints:</p>
          <ul>
            <li><a href="/api/healthcheck">Health Check</a></li>
            <li><a href="/api/users">Get Users</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Initialize the database and start the server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Minimal server running at http://localhost:${port}`);
      console.log(`Health check available at http://localhost:${port}/api/healthcheck`);
      console.log(`Users API available at http://localhost:${port}/api/users`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
