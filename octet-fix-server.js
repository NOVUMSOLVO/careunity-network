/**
 * Octet-Stream Fix Server
 * 
 * This server specifically addresses the issue of JavaScript files being served
 * with the incorrect MIME type "application/octet-stream".
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.map': 'application/json'
};

// Custom middleware to intercept all responses and fix MIME types
app.use((req, res, next) => {
  // Store the original setHeader method
  const originalSetHeader = res.setHeader;
  
  // Override the setHeader method
  res.setHeader = function(name, value) {
    // If setting Content-Type header
    if (name.toLowerCase() === 'content-type') {
      // If it's application/octet-stream and the request is for a JS file
      if (value === 'application/octet-stream' && 
          (req.path.endsWith('.js') || req.path.endsWith('.mjs'))) {
        // Replace with the correct MIME type
        console.log(`Fixing MIME type for ${req.path} from application/octet-stream to application/javascript`);
        return originalSetHeader.call(this, name, 'application/javascript');
      }
    }
    
    // Call the original method for all other headers
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// Custom static file server with proper MIME types
const serveStatic = (directory) => {
  return (req, res, next) => {
    // Get the file path
    const filePath = path.join(directory, req.path);
    
    // Check if the file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return next(); // File doesn't exist, move to next middleware
      }
      
      // Get the file extension
      const ext = path.extname(filePath);
      
      // Set the content type based on the file extension
      const contentType = mimeTypes[ext] || 'text/plain';
      res.setHeader('Content-Type', contentType);
      
      // Special handling for JavaScript modules
      if (req.path.endsWith('.js') || req.path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
        console.log(`Explicitly setting MIME type for ${req.path} to application/javascript`);
      }
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  };
};

// Serve static files from the client directory
app.use(serveStatic(path.join(__dirname, 'client')));

// Serve static files from the public directory if it exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(serveStatic(publicDir));
}

// Serve static files from the root directory
app.use(serveStatic(__dirname));

// API routes
app.get('/api/healthcheck', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  // Check if the request is for an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the index.html file for all other routes
  const indexPath = path.join(__dirname, 'client', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false); // Some other error
      }
      server.close();
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is available
    });
    
    server.listen(port);
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
    const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const port = await findAvailablePort(preferredPort);
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Start the server
    server.listen(port, () => {
      console.log(`\n=== Octet-Stream Fix Server running at http://localhost:${port}/ ===`);
      console.log(`Health check at http://localhost:${port}/api/healthcheck`);
      console.log(`\nThis server fixes the MIME type issue for JavaScript modules.`);
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
