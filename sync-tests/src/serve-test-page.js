/**
 * Simple Express server to serve the sync API test page
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default route - serve the test HTML file
app.get('/', (req, res) => {
  console.log('Serving test-sync-api.html');
  res.sendFile(path.join(__dirname, 'test-sync-api.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Test server running at http://localhost:${PORT}/ ===`);
  console.log(`Open your browser to http://localhost:${PORT}/ to access the Sync API Test Page`);
});
