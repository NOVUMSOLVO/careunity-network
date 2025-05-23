import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import apiRoutes from "./api-routes";
import newApiRoutes from "./routes/index";
import apiDocsRoutes from "./routes/api-docs";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  addRequestId,
  requestLogger,
  errorHandler,
  notFoundHandler
} from "./middleware/enhanced-error-handler";
import apiMonitoringService from "./services/api-monitoring-service";
import { securityHeaders } from "./middleware/content-security";
import { createServer } from "./https-config";
import { WebSocketService } from "./services/websocket-service";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// Add request ID to all requests
app.use(addRequestId);

// Log all requests
app.use(requestLogger);

// Apply security headers
app.use(...securityHeaders());

// Initialize API monitoring service
apiMonitoringService.initialize();

// Add API monitoring middleware
app.use(apiMonitoringService.monitoringMiddleware);

// Mount API routes
// Legacy API routes
app.use('/api', apiRoutes);

// New modular API routes with improved validation and error handling
app.use('/api/v2', newApiRoutes);

// API Documentation with Swagger UI
app.use('/api-docs', apiDocsRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Add proper error handling middleware
  app.use(errorHandler);

  // Add 404 handler for any unmatched routes
  app.use(notFoundHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port from environment or use a different default port
  const port = parseInt(process.env.PORT || '8080', 10);
  const httpsPort = parseInt(process.env.HTTPS_PORT || '5443', 10);

  // Create HTTP or HTTPS server based on configuration
  const secureServer = createServer(app);

  // Initialize WebSocket service
  const wsService = new WebSocketService(secureServer);

  // Make WebSocket service available globally
  (global as any).wsService = wsService;

  secureServer.listen(port, () => {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    log(`serving on ${protocol}://localhost:${port}`);
    log(`WebSocket server available at ${protocol === 'https' ? 'wss' : 'ws'}://localhost:${port}`);
  });
})();
