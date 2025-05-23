/**
 * Simple Express Server
 * 
 * This is a minimal Express server that correctly serves JavaScript files
 * with the proper MIME type.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Set up middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Explicitly set MIME types for JavaScript files
app.get('*.js', (req, res, next) => {
  console.log(`Setting MIME type for JavaScript file: ${req.path}`);
  res.type('application/javascript');
  next();
});

// Serve static files from the current directory
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      console.log(`Setting header for ${path}`);
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test page at http://localhost:${PORT}/module-test.html`);
});
