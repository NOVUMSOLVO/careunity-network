/**
 * Improved HTTP Server for CareUnity
 * With better error handling and debugging
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Set the directory to serve files from
const rootDir = 'C:/CareUnityNetwork';

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

// Create HTTP server with detailed error handling
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Handle root path
  if (req.url === '/' || req.url === '/index.html') {
    // Redirect to test-simple.html
    res.writeHead(302, { 'Location': '/test-simple.html' });
    res.end();
    return;
  }
  
  // Get file path
  let filePath = path.join(rootDir, req.url);
  
  // If the URL ends with a slash, try to serve index.html
  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }
  
  console.log(`Attempting to serve: ${filePath}`);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #d32f2f; }
            pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested file was not found on this server.</p>
          <p>Requested URL: ${req.url}</p>
          <p>File path: ${filePath}</p>
          <h2>Available Files:</h2>
          <pre>${listFilesInDirectory(rootDir)}</pre>
        </body>
        </html>
      `);
      return;
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`Error reading file: ${filePath}`, err);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>500 Internal Server Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #d32f2f; }
              pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>500 Internal Server Error</h1>
            <p>Error reading the file.</p>
            <p>File path: ${filePath}</p>
            <pre>${err.toString()}</pre>
          </body>
          </html>
        `);
        return;
      }
      
      console.log(`Successfully serving: ${filePath} as ${contentType}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Function to list files in a directory
function listFilesInDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(file => !file.startsWith('.'))
      .map(file => {
        const stats = fs.statSync(path.join(dir, file));
        if (stats.isDirectory()) {
          return `📁 ${file}/`;
        } else {
          return `📄 ${file}`;
        }
      })
      .join('\n');
  } catch (err) {
    return `Error listing files: ${err.message}`;
  }
}

// Try ports sequentially
const tryPort = (port, maxPort) => {
  console.log(`Trying port ${port}...`);
  
  if (port > maxPort) {
    console.error(`Could not find an available port between ${3000} and ${maxPort}`);
    process.exit(1);
    return;
  }

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      tryPort(port + 1, maxPort);
    } else {
      console.error('Error:', err);
      process.exit(1);
    }
  });

  server.once('listening', () => {
    console.log(`\n=== Server running at http://localhost:${port}/ ===`);
    console.log(`Root directory: ${rootDir}`);
    console.log('\nAvailable files:');
    console.log(listFilesInDirectory(rootDir));
  });

  server.listen(port);
};

// Start with port 3000, try up to 3010
console.log('Starting improved CareUnity server...');
tryPort(3000, 3010);
