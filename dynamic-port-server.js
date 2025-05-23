/**
 * Dynamic Port Server for CareUnity
 * 
 * This server will use any available port and serve static HTML files.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Create Express app
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve static files from the client/public directory if it exists
const clientPublicPath = path.join(__dirname, 'client', 'public');
if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
}

// Route for the root path
app.get('/', (req, res) => {
  // Try to serve index.html if it exists
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    res.sendFile(path.join(__dirname, 'index.html'));
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

// Function to find an available port
function findAvailablePort(startPort, callback) {
  const port = startPort;
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port is in use, try the next one
      findAvailablePort(port + 1, callback);
    } else {
      // Other error
      callback(err);
    }
  });
  
  server.once('listening', () => {
    // Port is available
    server.removeAllListeners('error');
    callback(null, port);
  });
  
  server.listen(port);
}

// Start server on any available port starting from 3000
findAvailablePort(3000, (err, port) => {
  if (err) {
    console.error('Error finding available port:', err);
    process.exit(1);
  }
  
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
  });
});
