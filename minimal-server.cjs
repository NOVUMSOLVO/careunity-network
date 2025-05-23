/**
 * Minimal HTTP Server for CareUnity
 * No dependencies, just Node.js built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Handle root path
  if (req.url === '/' || req.url === '/index.html') {
    // List all HTML files
    const htmlFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.html'))
      .map(file => `<li><a href="/${file}">${file}</a></li>`)
      .join('\n');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
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
    return;
  }
  
  // Get file path
  let filePath = path.join(__dirname, req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
      return;
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1><p>Error reading the file.</p>');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Try to find an available port
function startServer(port) {
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
