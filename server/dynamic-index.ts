/**
 * Modified Server Entry Point with Dynamic Port Assignment
 *
 * This is a modified version of the main server that uses dynamic port assignment
 * to automatically find an available port if the default port is already in use.
 */

import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import apiRoutes from "./api-routes";
import newApiRoutes from "./routes/index";
import cors from "cors";
import helmet from "helmet";
import { securityHeaders } from "./middleware/security-headers";
import { errorHandler } from "./middleware/error-handler";
import { startServerOnAvailablePort } from "./dynamic-port";
import path from "path";
import fs from "fs";
import { MLModelsWebSocketService } from "./services/ml/websocket-service";

// Create Express application
const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

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

// Apply additional security headers
app.use(securityHeaders());

// Mount API routes
// Legacy API routes
app.use('/api', apiRoutes);

// New modular API routes with improved validation and error handling
app.use('/api/v2', newApiRoutes);

// Add a simple health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: 'dynamic port'
  });
});

// Add a route to list available HTML files
app.get('/html-files', (req, res) => {
  const rootDir = path.resolve(process.cwd());

  // Find HTML files in the root directory
  const htmlFiles = fs.readdirSync(rootDir)
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      name: file,
      path: `/${file}`
    }));

  // Find HTML files in the client/public directory if it exists
  const clientPublicDir = path.join(rootDir, 'client', 'public');
  let clientHtmlFiles: { name: string, path: string }[] = [];

  if (fs.existsSync(clientPublicDir)) {
    clientHtmlFiles = fs.readdirSync(clientPublicDir)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        name: file,
        path: `/client/public/${file}`
      }));
  }

  res.json({
    rootDirectory: rootDir,
    htmlFiles: [...htmlFiles, ...clientHtmlFiles]
  });
});

// Serve static files from the root directory
app.use(express.static(process.cwd()));

// Serve static files from client/public if it exists
const clientPublicDir = path.join(process.cwd(), 'client', 'public');
if (fs.existsSync(clientPublicDir)) {
  app.use('/client/public', express.static(clientPublicDir));
}

// Create WebSocket service
const webSocketService = new MLModelsWebSocketService();

// Start the server
(async () => {
  try {
    const server = await registerRoutes(app);

    // Initialize WebSocket service
    webSocketService.initialize(server);

    // Add error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Set up Vite in development mode
    if (app.get("env") === "development") {
      try {
        await setupVite(app, server);
      } catch (error) {
        log(`Error setting up Vite: ${error instanceof Error ? error.message : String(error)}`);
        log('Continuing without Vite middleware');
      }
    } else {
      serveStatic(app);
    }

    // Start the server on an available port
    // Try to use the port from environment variable, or fall back to 8080
    const preferredPort = process.env.PORT ? parseInt(process.env.PORT) : 8080;

    // If ENABLE_DYNAMIC_PORT is set to true, use dynamic port assignment
    // Otherwise, only use the preferred port if it's available
    const useDynamicPort = process.env.ENABLE_DYNAMIC_PORT === 'true';

    log(`Using ${useDynamicPort ? 'dynamic' : 'fixed'} port assignment`);
    log(`Preferred port: ${preferredPort}`);

    const port = await startServerOnAvailablePort(server, preferredPort);

    log(`Server running at http://localhost:${port}/`);
    log(`API available at http://localhost:${port}/api/`);
    log(`WebSocket available at ws://localhost:${port}/api/v2/ml-models/ws`);
    log(`Health check at http://localhost:${port}/api/healthcheck`);
    log(`HTML files list at http://localhost:${port}/html-files`);

    // Set up demo notifications for WebSocket
    if (process.env.NODE_ENV !== 'production') {
      setupDemoNotifications(webSocketService);
    }

  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();

/**
 * Set up demo notifications for WebSocket
 */
function setupDemoNotifications(wsService: MLModelsWebSocketService) {
  // Send model performance update every 30 seconds
  setInterval(() => {
    const modelIds = ['recommendation-1', 'timeseries-1', 'satisfaction-1'];
    const randomModelId = modelIds[Math.floor(Math.random() * modelIds.length)];

    wsService.notifyModelPerformanceChanged(randomModelId, {
      accuracy: 0.75 + Math.random() * 0.2,
      precision: 0.7 + Math.random() * 0.25,
      recall: 0.65 + Math.random() * 0.3,
      f1Score: 0.7 + Math.random() * 0.25,
      timestamp: new Date().toISOString()
    });

    log(`Sent demo performance update for model ${randomModelId}`);
  }, 30000);

  // Send model drift notification every 2 minutes
  setInterval(() => {
    const modelIds = ['recommendation-1', 'timeseries-1', 'satisfaction-1'];
    const randomModelId = modelIds[Math.floor(Math.random() * modelIds.length)];

    wsService.notifyModelDriftDetected(randomModelId, {
      driftScore: Math.random(),
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      features: ['age', 'location', 'visitDuration'],
      timestamp: new Date().toISOString()
    });

    log(`Sent demo drift notification for model ${randomModelId}`);
  }, 120000);
}
