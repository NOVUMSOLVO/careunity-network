/**
 * Database Connection Manager
 *
 * This module provides a connection pool for database connections,
 * supporting both SQLite and PostgreSQL (Neon) databases.
 */

import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import { WebSocket } from 'ws';
import * as schema from '@shared/schema';
import { logger } from '../utils/logger';
import { config } from '../config';
import { initializeDatabase as initDbData } from './init';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = WebSocket;

// Types
interface ConnectionOptions {
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statementTimeoutMillis?: number;
  maxUses?: number;
}

interface SQLiteOptions {
  readonly?: boolean;
  fileMustExist?: boolean;
  timeout?: number;
  verbose?: Function;
}

// Default options
const DEFAULT_PG_OPTIONS: ConnectionOptions = {
  maxConnections: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statementTimeoutMillis: 10000,
  maxUses: 7500
};

const DEFAULT_SQLITE_OPTIONS: SQLiteOptions = {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log // Use console.log as the verbose function
};

// Connection pool for PostgreSQL
let pgPool: Pool | null = null;

// Connection for SQLite
let sqliteConnection: Database.Database | null = null;

// Drizzle ORM instance
let drizzleInstance: any = null;

// Connection type
let connectionType: 'sqlite' | 'postgres' | 'postgres-http' = 'sqlite';

/**
 * Initialize the database connection
 */
export async function initializeDatabase(options: ConnectionOptions = {}): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL || config.database.url;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const mergedOptions = { ...DEFAULT_PG_OPTIONS, ...options };

  try {
    // Determine database type
    if (databaseUrl.startsWith('sqlite:')) {
      connectionType = 'sqlite';
      await initializeSQLite(databaseUrl, DEFAULT_SQLITE_OPTIONS);
    } else if (databaseUrl.includes('pooled=true')) {
      connectionType = 'postgres';
      await initializePostgres(databaseUrl, mergedOptions);
    } else {
      connectionType = 'postgres-http';
      await initializePostgresHttp(databaseUrl);
    }

    logger.info(`Database connection initialized (${connectionType})`);

    // Initialize database data
    try {
      await initDbData();
      logger.info('Database data initialized successfully');
    } catch (initError) {
      logger.error('Failed to initialize database data:', initError);
      // Continue even if data initialization fails
    }
  } catch (error) {
    logger.error('Failed to initialize database connection:', error);
    throw error;
  }
}

/**
 * Initialize SQLite connection
 */
async function initializeSQLite(databaseUrl: string, options: SQLiteOptions): Promise<void> {
  try {
    // Extract the file path from the DATABASE_URL
    const dbPath = databaseUrl.replace('sqlite:', '');

    // Close existing connection if it exists
    if (sqliteConnection) {
      sqliteConnection.close();
    }

    // Create a new database connection
    sqliteConnection = new Database(dbPath, options);

    // Create a drizzle instance
    drizzleInstance = drizzleSQLite(sqliteConnection, { schema });

    logger.info(`SQLite connection initialized: ${dbPath}`);
  } catch (error) {
    logger.error('Failed to initialize SQLite connection:', error);
    throw error;
  }
}

/**
 * Initialize PostgreSQL connection pool
 */
async function initializePostgres(databaseUrl: string, options: ConnectionOptions): Promise<void> {
  try {
    // Close existing pool if it exists
    if (pgPool) {
      await pgPool.end();
    }

    // Create a new connection pool
    pgPool = new Pool({
      connectionString: databaseUrl,
      max: options.maxConnections,
      idleTimeoutMillis: options.idleTimeoutMillis,
      connectionTimeoutMillis: options.connectionTimeoutMillis,
      maxUses: options.maxUses
    });

    // Test the connection
    const client = await pgPool.connect();
    client.release();

    // Create a drizzle instance
    drizzleInstance = drizzleNeon(pgPool, { schema });

    logger.info(`PostgreSQL connection pool initialized with ${options.maxConnections} connections`);
  } catch (error) {
    logger.error('Failed to initialize PostgreSQL connection pool:', error);
    throw error;
  }
}

/**
 * Initialize PostgreSQL HTTP connection (for serverless environments)
 */
async function initializePostgresHttp(databaseUrl: string): Promise<void> {
  try {
    // Create a new HTTP connection
    const sql = neon(databaseUrl);

    // Create a drizzle instance
    drizzleInstance = drizzleNeonHttp(sql, { schema });

    logger.info('PostgreSQL HTTP connection initialized');
  } catch (error) {
    logger.error('Failed to initialize PostgreSQL HTTP connection:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDb() {
  if (!drizzleInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }

  return drizzleInstance;
}

/**
 * Get a raw database connection/client
 */
export async function getRawConnection() {
  if (connectionType === 'sqlite') {
    return sqliteConnection;
  } else if (connectionType === 'postgres') {
    if (!pgPool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    return await pgPool.connect();
  } else {
    throw new Error('Raw connections not supported for HTTP connections');
  }
}

/**
 * Execute a function with a raw connection and automatically release it
 */
export async function withConnection<T>(fn: (connection: any) => Promise<T>): Promise<T> {
  if (connectionType === 'sqlite') {
    // For SQLite, just pass the connection
    return await fn(sqliteConnection);
  } else if (connectionType === 'postgres') {
    if (!pgPool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    const client = await pgPool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  } else {
    throw new Error('Raw connections not supported for HTTP connections');
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  if (!drizzleInstance) {
    throw new Error('Database not initialized');
  }

  return await drizzleInstance.transaction(fn);
}

/**
 * Close all database connections
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (connectionType === 'sqlite' && sqliteConnection) {
      sqliteConnection.close();
      sqliteConnection = null;
    } else if (connectionType === 'postgres' && pgPool) {
      await pgPool.end();
      pgPool = null;
    }

    drizzleInstance = null;

    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}

/**
 * Get database connection stats
 */
export function getConnectionStats() {
  if (connectionType === 'sqlite') {
    return {
      type: 'sqlite',
      active: !!sqliteConnection
    };
  } else if (connectionType === 'postgres' && pgPool) {
    return {
      type: 'postgres',
      totalCount: pgPool.totalCount,
      idleCount: pgPool.idleCount,
      waitingCount: pgPool.waitingCount
    };
  } else if (connectionType === 'postgres-http') {
    return {
      type: 'postgres-http',
      active: !!drizzleInstance
    };
  } else {
    return {
      type: 'unknown',
      active: false
    };
  }
}

export default {
  initializeDatabase,
  getDb,
  getRawConnection,
  withConnection,
  transaction,
  closeDatabase,
  getConnectionStats
};
