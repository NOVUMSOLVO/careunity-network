/**
 * ESM Dynamic Port Server for CareUnity
 * 
 * This server will use any available port and serve static HTML files.
 * Uses ES modules syntax.
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import http from 'http';

// Get current file directory with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve static files from the client/public directory if it exists
const clientPublicPath = join(__dirname, 'client', 'public');
if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
}

// Route for the root path
app.get('/', (req, res) => {
  // Try to serve index.html if it exists
  if (fs.existsSync(join(__dirname, 'index.html'))) {
    res.sendFile(join(__dirname, 'index.html'));
  } else {
    // Otherwise, list all HTML files
    const htmlFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.html'))
      .map(file => `<li><a href="/${file}">${file}</a></li>`)
      .join('\n');

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
  }
});

// Create HTTP server
const server = http.createServer(app);

// Start server on a specific port or find an available one
const startPort = 3000;
let currentPort = startPort;
const maxPort = startPort + 10; // Try up to 10 ports

function tryPort(port) {
  server.listen(port, () => {
    console.log(`\n=== Server running at http://localhost:${port}/ ===`);
    console.log('Available pages:');
    
    // List HTML files
    fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.html'))
      .forEach(file => {
        console.log(`- http://localhost:${port}/${file}`);
      });
    
    console.log('\nServer root directory:', __dirname);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && currentPort < maxPort) {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      currentPort++;
      tryPort(currentPort);
    } else {
      console.error('Error starting server:', err);
    }
  });
}

tryPort(currentPort);
