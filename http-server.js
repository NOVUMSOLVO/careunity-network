/**
 * Simple HTTP Server
 *
 * This is a minimal HTTP server using Node.js's built-in http module.
 * It's designed to be as simple as possible to avoid any potential issues.
 * Enhanced with proper MIME type support for modern image formats.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enhanced MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',  // WebP support
  '.avif': 'image/avif',  // AVIF support
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

// Create a simple HTTP server with MIME type support
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle API health check endpoint
  if (req.url === '/api/healthcheck') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle file requests
  let url = req.url;
  
  // Default to index.html for root
  if (url === '/') {
    url = '/index.html';
  }
  
  // Remove query string if present
  const queryStringIndex = url.indexOf('?');
  if (queryStringIndex !== -1) {
    url = url.substring(0, queryStringIndex);
  }
  
  // Resolve the file path
  const filePath = path.join(__dirname, 'dist', url);
  
  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 404;
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested resource was not found on this server.</p>
          <p>Path: ${url}</p>
          <p><a href="/">Return to homepage</a></p>
        </body>
        </html>
      `);
      return;
    }
    
    // Determine the file's MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set the Content-Type header
    res.setHeader('Content-Type', mimeType);
    
    // Read and serve the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', () => {
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
  });
});

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const testServer = http.createServer();

    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false); // Some other error
      }
      testServer.close();
    });

    testServer.once('listening', () => {
      testServer.close();
      resolve(false); // Port is available
    });

    testServer.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  console.log(`Looking for an available port starting from ${startPort}...`);

  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const inUse = await isPortInUse(port);

    if (!inUse) {
      console.log(`Found available port: ${port}`);
      return port;
    }

    console.log(`Port ${port} is in use, trying next port...`);
  }

  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

// Start the server
async function startServer() {
  try {
    // Try to use the port from environment variable or find an available one
    const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
    const port = await findAvailablePort(preferredPort);

    // Start the server
    server.listen(port, () => {
      console.log(`\n=== Optimized Assets Server running at http://localhost:${port}/ ===`);
      console.log(`Modern image formats supported: WebP, AVIF`);
      console.log(`Test the bundled JS at http://localhost:${port}/`);
      console.log(`Test modern image formats at http://localhost:${port}/image-test.html (if available)`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
