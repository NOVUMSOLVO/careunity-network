/**
 * HTTPS Configuration
 * 
 * This module provides HTTPS configuration for the CareUnity server.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { Express } from 'express';
import { logger } from './utils/logger';

interface HttpsOptions {
  key: Buffer;
  cert: Buffer;
}

/**
 * Get HTTPS options from environment or files
 */
export function getHttpsOptions(): HttpsOptions | null {
  try {
    // Check if SSL cert and key are provided in environment variables
    if (process.env.SSL_KEY && process.env.SSL_CERT) {
      return {
        key: Buffer.from(process.env.SSL_KEY, 'base64'),
        cert: Buffer.from(process.env.SSL_CERT, 'base64'),
      };
    }

    // Check for cert files in the certs directory
    const certsDir = path.join(process.cwd(), 'certs');
    
    if (fs.existsSync(path.join(certsDir, 'server.key')) && 
        fs.existsSync(path.join(certsDir, 'server.cert'))) {
      return {
        key: fs.readFileSync(path.join(certsDir, 'server.key')),
        cert: fs.readFileSync(path.join(certsDir, 'server.cert')),
      };
    }
    
    // No SSL configuration found
    return null;
  } catch (error) {
    logger.error('Error loading HTTPS options:', error);
    return null;
  }
}

/**
 * Create HTTP or HTTPS server based on available options
 */
export function createServer(app: Express): http.Server | https.Server {
  const httpsOptions = getHttpsOptions();
  
  if (httpsOptions) {
    logger.info('Starting server with HTTPS');
    return https.createServer(httpsOptions, app);
  } else {
    logger.info('Starting server with HTTP (no HTTPS configuration found)');
    return http.createServer(app);
  }
}

/**
 * Create HTTP to HTTPS redirect server
 */
export function createHttpRedirectServer(httpsPort: number): http.Server {
  const redirectApp = require('express')();
  
  redirectApp.use((req, res) => {
    const host = req.headers.host?.split(':')[0] || 'localhost';
    const url = `https://${host}:${httpsPort}${req.url}`;
    res.redirect(301, url);
  });
  
  return http.createServer(redirectApp);
}

/**
 * Start HTTPS server with HTTP redirect
 */
export function startSecureServer(app: Express, httpPort: number, httpsPort: number): {
  httpServer?: http.Server;
  httpsServer: https.Server | http.Server;
} {
  const httpsOptions = getHttpsOptions();
  
  if (httpsOptions) {
    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(httpsPort, () => {
      logger.info(`HTTPS server running on port ${httpsPort}`);
    });
    
    // Create HTTP redirect server
    const httpServer = createHttpRedirectServer(httpsPort);
    httpServer.listen(httpPort, () => {
      logger.info(`HTTP redirect server running on port ${httpPort}`);
    });
    
    return { httpServer, httpsServer };
  } else {
    // Fall back to HTTP only
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, () => {
      logger.info(`HTTP server running on port ${httpPort} (HTTPS not configured)`);
    });
    
    return { httpsServer: httpServer };
  }
}
