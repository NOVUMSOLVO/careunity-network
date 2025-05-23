/**
 * MIME-Focused Express Server
 * 
 * This server is specifically designed to address MIME type issues with JavaScript modules.
 * It ensures all JavaScript files are served with the correct MIME type.
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

// Set proper MIME types for all JavaScript files
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.mjs')) {
    res.type('application/javascript');
  }
  next();
});

// Serve static files from the client directory with proper MIME types
app.use(express.static(path.join(__dirname, 'client'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Serve static files from the public directory if it exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
}

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
      console.log(`\n=== MIME-Focused Server running at http://localhost:${port}/ ===`);
      console.log(`Health check at http://localhost:${port}/api/healthcheck`);
      console.log(`\nThis server ensures all JavaScript files are served with the correct MIME type.`);
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
