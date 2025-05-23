/**
 * Database Initialization Script
 *
 * This script initializes the database with all required data.
 */

import { db } from '../db';
import { logger } from '../utils/logger';
import { seedSecurityTraining } from './seed-security-training';

/**
 * Initialize the database with all required data
 */
export async function initializeDatabase() {
  try {
    logger.info('Initializing database...');

    // Seed security training modules
    await seedSecurityTraining();

    logger.info('Database initialization completed successfully.');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// If this script is run directly, execute the initialization function
// Using ES modules syntax
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if this file is being run directly
if (import.meta.url === `file://${__filename}`) {
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    });
}
