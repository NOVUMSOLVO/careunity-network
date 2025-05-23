/**
 * CareUnity Server
 *
 * This is the main server file that initializes all services and starts the server.
 */

import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from 'http';
import cors from "cors";
import session from "express-session";
import connectRedis from "connect-redis";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import helmet from "helmet"; // For security headers

// Import configuration
import { config } from './config';

// Import services
import { logger } from './utils/logger';
import { connectionManager } from './db/connection-manager';
import * as cacheFactory from './services/cache-factory';
import { WebSocketService } from './services/websocket-service';
import monitoringService from './services/monitoring-service';
import auditService from './services/audit-service';
import performanceAlertService from './services/performance-alert-service';

// Import routes and middleware
import apiRoutes from "./api-routes";
import newApiRoutes from "./routes/index";
import { errorHandler } from "./middleware/error-handler";
import { securityHeaders } from './middleware/content-security';
import { csrfCookieMiddleware, csrfProtectionMiddleware } from './middleware/csrf-protection';
import securityMonitoring from './middleware/security-monitoring';
import securityMonitoringService from './services/security-monitoring-service';
import { performanceMetricsService } from './services/performance-metrics-service';
import performanceDashboardRoutes from './routes/performance-dashboard';
import { cacheService } from './services/cache-service';
import { setupVite, serveStatic, log } from "./vite";

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    await connectionManager.initializeDatabase(config.database.pool);

    // Initialize cache service
    logger.info('Initializing cache service...');
    await cacheFactory.initializeCache();

    // Initialize monitoring service
    logger.info('Initializing monitoring service...');
    monitoringService.initMonitoring();

    // Initialize audit service
    logger.info('Initializing audit service...');
    auditService.initAuditService();

    // Initialize performance alert service
    logger.info('Initializing performance alert service...');
    performanceAlertService.initPerformanceAlerts({
      enabled: true,
      checkIntervalSeconds: 60,
      notifyWebSocket: true,
      notifyLog: true
    });

    // Initialize performance metrics service
    logger.info('Initializing performance metrics service...');
    performanceMetricsService.initialize();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Configure session store
 */
function configureSessionStore(app: express.Express) {
  // Configure session store based on configuration
  if (config.session.store.type === 'redis' && config.redis.enabled) {
    logger.info('Using Redis session store');

    // Create Redis client for session store
    const RedisStore = connectRedis(session);
    const redisClient = createClient({
      url: config.session.store.options.url,
      legacyMode: true
    });

    // Connect to Redis
    redisClient.connect().catch((err) => {
      logger.error('Redis connection error:', err);
      logger.warn('Falling back to memory session store');

      // Fall back to memory store
      app.use(session({
        ...config.session,
        store: new session.MemoryStore()
      }));
    });

    // Use Redis store if connection successful
    app.use(session({
      ...config.session,
      store: new RedisStore({
        client: redisClient as any,
        prefix: config.session.store.options.prefix,
        ttl: config.session.store.options.ttl
      })
    }));
  } else {
    logger.info('Using memory session store');

    // Use memory store
    app.use(session({
      ...config.session,
      store: new session.MemoryStore()
    }));
  }
}

/**
 * Configure Express application
 */
function configureExpress(): express.Express {
  // Create Express application
  const app = express();

  // Apply middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors(config.cors));
  app.use(cookieParser());
  
  // Apply security headers with helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "wss://*", "https://*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    xssFilter: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  // Apply security monitoring
  app.use(securityMonitoring.trackApiRequests);
  app.use(securityMonitoring.detectSuspiciousActivities);
  app.use(securityMonitoring.trackFailedLogins);
  app.use(securityMonitoring.trackSensitiveDataAccess);

  // Initialize security monitoring service
  securityMonitoringService.initSecurityMonitoring();

  // Configure session store
  configureSessionStore(app);

  // Apply performance monitoring
  app.use(monitoringService.performanceMonitoring);
  app.use(performanceMetricsService.middleware);

  // Mount performance dashboard routes
  app.use('/api/v2/performance', performanceDashboardRoutes);

  // Mount API routes
  app.use('/api', apiRoutes);
  app.use('/api/v2', newApiRoutes);

  // Add health check route
  app.get('/api/healthcheck', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: connectionManager.getConnectionStats(),
        cache: cacheFactory.getCache().getStats()
      }
    });
  });

  // Add HTML files list route
  app.get('/html-files', (req, res) => {
    const publicDir = path.join(process.cwd(), 'client/public');

    try {
      const htmlFiles = fs.readdirSync(publicDir)
        .filter(file => file.endsWith('.html'))
        .map(file => `<li><a href="/${file}">${file}</a></li>`)
        .join('');

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CareUnity Network</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 10px 0; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>CareUnity Network</h1>
          <h2>Available HTML Files:</h2>
          <ul>
            ${htmlFiles}
          </ul>
        </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Error reading HTML files directory');
    }
  });

  // Add error monitoring middleware
  app.use(monitoringService.errorMonitoring);

  // Add error handling middleware
  app.use(errorHandler);

  return app;
}

/**
 * Start the server on an available port
 */
async function startServer(app: express.Express, preferredPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    // Create HTTP server
    const server = createServer(app);

    // Initialize WebSocket service
    const websocketService = new WebSocketService(server);

    // Make the WebSocket service available globally
    (global as any).websocketService = websocketService;

    // Try to start on preferred port
    server.listen(preferredPort, config.server.host)
      .on('listening', () => {
        const address = server.address();
        const port = typeof address === 'object' ? address?.port : preferredPort;

        if (!port) {
          reject(new Error('Failed to get server port'));
          return;
        }

        // Set up Vite in development mode
        if (process.env.NODE_ENV === 'development') {
          setupVite(app, server).catch(error => {
            logger.error('Error setting up Vite:', error);
            logger.warn('Continuing without Vite middleware');
          });
        } else {
          serveStatic(app);
        }

        resolve(port);
      })
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          // Port is in use, try the next one
          logger.warn(`Port ${preferredPort} is in use, trying ${preferredPort + 1}`);
          server.close();
          startServer(app, preferredPort + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

/**
 * Gracefully shut down the server
 */
async function shutdownServer() {
  logger.info('Shutting down server...');

  try {
    // Stop performance alerts
    performanceAlertService.stopPerformanceAlerts();

    // Shutdown performance metrics service
    performanceMetricsService.shutdown();

    // Close cache connections
    await cacheFactory.closeCache();

    // Close database connections
    await connectionManager.closeDatabase();

    logger.info('Server shutdown complete');
  } catch (error) {
    logger.error('Error during server shutdown:', error);
  }
}

/**
 * Main function to start the server
 */
async function main() {
  try {
    // Initialize all services
    await initializeServices();

    // Configure Express application
    const app = configureExpress();

    // Start the server
    const preferredPort = config.server.port ? parseInt(String(config.server.port), 10) : 5000;
    const port = await startServer(app, preferredPort);

    // Log server information
    logger.info(`Server running at http://${config.server.host}:${port}/`);
    logger.info(`API available at http://${config.server.host}:${port}/api/`);
    logger.info(`Health check at http://${config.server.host}:${port}/api/healthcheck`);
    logger.info(`HTML files list at http://${config.server.host}:${port}/html-files`);

    // Set up graceful shutdown
    process.on('SIGTERM', shutdownServer);
    process.on('SIGINT', shutdownServer);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  main();
}

export { main, configureExpress, initializeServices };
