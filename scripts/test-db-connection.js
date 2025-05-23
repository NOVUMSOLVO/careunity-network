/**
 * Script to test database connection
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Reading .env file from: ${envPath}`);

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  // Parse environment variables
  const env = {};
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      env[key.trim()] = value.trim();
    }
  });

  console.log('Environment variables loaded:');
  console.log('DATABASE_URL exists:', !!env.DATABASE_URL);

  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Test database connection
  console.log(`Connecting to database: ${env.DATABASE_URL.substring(0, 20)}...`);

  const pool = new Pool({
    connectionString: env.DATABASE_URL
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error connecting to database:', err);
      process.exit(1);
    } else {
      console.log('Successfully connected to database!');
      console.log('Current time from database:', res.rows[0].now);

      // Test if users table exists
      pool.query('SELECT COUNT(*) FROM users', (err, res) => {
        if (err) {
          console.error('Error querying users table:', err);
        } else {
          console.log('Users table exists with', res.rows[0].count, 'records');
        }

        pool.end();
      });
    }
  });
} catch (error) {
  console.error('Error reading .env file:', error);
  process.exit(1);
}
