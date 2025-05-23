/**
 * Debug Simple Server for CareUnity (CommonJS)
 * Modified to work with the current directory structure
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Get current directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Serve static files from the current directory
app.use(express.static(currentDir));

// Route for the root path
app.get('/', (req, res) => {
  // List all HTML files
  const htmlFiles = fs.readdirSync(currentDir)
    .filter(file => file.endsWith('.html'))
    .map(file => `<li><a href="/${file}">${file}</a></li>`)
    .join('\n');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CareUnity Network - Debug Server</title>
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
      <h1>CareUnity Network - Debug Server</h1>
      <h2>Available HTML Files:</h2>
      <ul>
        ${htmlFiles}
      </ul>
    </body>
    </html>
  `);
});

// Add a simple API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Debug server is running',
    timestamp: new Date().toISOString()
  });
});

// Try to find an available port
function startServer(port) {
  // First check if the port is available
  const server = app.listen(port, () => {
    console.log(`\n=== Debug Server running at http://localhost:${port}/ ===`);
    console.log('Available pages:');
    
    // List HTML files
    fs.readdirSync(currentDir)
      .filter(file => file.endsWith('.html'))
      .forEach(file => {
        console.log(`- http://localhost:${port}/${file}`);
      });
    
    console.log('\nServer root directory:', currentDir);
    console.log('API test endpoint:', `http://localhost:${port}/api/test`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Error starting server:', err);
    }
  });
}

// Start with port 3001 to avoid conflict with existing server
console.log('Starting debug server...');
startServer(3001);
