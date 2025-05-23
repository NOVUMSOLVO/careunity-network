import connectionManager from './db/connection-manager';
import { logger } from './utils/logger';

// Initialize the database connection
let db: any;

async function initializeDb() {
  try {
    await connectionManager.initializeDatabase();
    db = connectionManager.getDb();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

// Initialize the database on module load
initializeDb().catch(error => {
  logger.error('Database initialization failed:', error);
  process.exit(1);
});

// Export the database instance
export { db };

// Export the connection manager for advanced usage
export { connectionManager };