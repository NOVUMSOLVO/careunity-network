/**
 * Script to create quality metrics table
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
  console.log('Checking if quality_metrics table exists...');
  
  // Check if the table exists
  const tableExists = db.prepare(`
    SELECT COUNT(*) as count 
    FROM sqlite_master 
    WHERE type='table' AND name='quality_metrics'
  `).get();
  
  if (tableExists.count === 0) {
    console.log('Creating quality_metrics table...');
    
    // Create the quality_metrics table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quality_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        target REAL NOT NULL,
        trend TEXT NOT NULL DEFAULT 'stable',
        category TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('quality_metrics table created successfully!');
    
    // Add some sample data
    console.log('Adding sample quality metrics...');
    
    const sampleMetrics = [
      {
        name: 'Visit Completion Rate',
        value: 92.5,
        target: 95.0,
        trend: 'increasing',
        category: 'operational',
        description: 'Percentage of scheduled visits that are completed'
      },
      {
        name: 'Client Satisfaction',
        value: 4.2,
        target: 4.5,
        trend: 'stable',
        category: 'satisfaction',
        description: 'Average client satisfaction rating (1-5 scale)'
      },
      {
        name: 'Staff Utilization',
        value: 78.3,
        target: 85.0,
        trend: 'increasing',
        category: 'operational',
        description: 'Percentage of staff time spent on direct care activities'
      },
      {
        name: 'Medication Error Rate',
        value: 0.5,
        target: 0.2,
        trend: 'decreasing',
        category: 'clinical',
        description: 'Percentage of medication administrations with errors'
      },
      {
        name: 'Care Plan Compliance',
        value: 88.7,
        target: 95.0,
        trend: 'stable',
        category: 'clinical',
        description: 'Percentage of care plan tasks completed as scheduled'
      }
    ];
    
    // Insert sample metrics
    const insertStmt = db.prepare(`
      INSERT INTO quality_metrics (name, value, target, trend, category, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const metric of sampleMetrics) {
      insertStmt.run(
        metric.name,
        metric.value,
        metric.target,
        metric.trend,
        metric.category,
        metric.description
      );
    }
    
    console.log('Sample quality metrics added successfully!');
  } else {
    console.log('quality_metrics table already exists.');
  }
  
  console.log('Quality metrics setup completed successfully!');
} catch (error) {
  console.error('Error creating quality metrics table:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
