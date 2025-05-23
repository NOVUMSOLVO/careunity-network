/**
 * Simple Dynamic Port Server for CareUnity (CommonJS)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the root path
app.get('/', (req, res) => {
  // List all HTML files
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
});

// Try to find an available port
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n=== Server running at http://localhost:${port}/ ===`);
    console.log('Available pages:');
    
    // List HTML files
    fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.html'))
      .forEach(file => {
        console.log(`- http://localhost:${port}/${file}`);
      });
    
    console.log('\nServer root directory:', __dirname);
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

// Start with port 3000
startServer(3000);
