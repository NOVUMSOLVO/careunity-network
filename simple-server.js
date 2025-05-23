import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to use the port from environment variable or default to 3000
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Map file extensions to MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  // Handle API health check endpoint
  if (req.url === '/api/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Parse the URL to get the pathname
  let filePath = path.join(__dirname, req.url === '/' ? 'basic-test.html' : req.url.substring(1));
  console.log(`Looking for file: ${filePath}`);

  // Get the file extension
  const extname = path.extname(filePath);

  // Set the content type based on the file extension
  const contentType = MIME_TYPES[extname] || 'text/plain';

  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        console.log(`File not found: ${filePath}`);
        fs.readFile(path.join(__dirname, '404.html'), (error, content) => {
          if (error) {
            // If 404 page is not found, send a simple text response
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File Not Found', 'utf-8');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        console.error(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const testServer = http.createServer();

    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false); // Some other error
      }
      testServer.close();
    });

    testServer.once('listening', () => {
      testServer.close();
      resolve(false); // Port is available
    });

    testServer.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort, maxAttempts = 10) {
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

// Start the server on an available port
async function startServer() {
  try {
    const port = await findAvailablePort(PORT);

    server.listen(port, () => {
      console.log(`\n=== Server running at http://localhost:${port}/ ===`);
      console.log('Available endpoints:');
      console.log(`- http://localhost:${port}/api/healthcheck (API health check)`);
      console.log('\nAvailable pages:');
      console.log(`- http://localhost:${port}/basic-test.html`);
      console.log(`- http://localhost:${port}/standalone-react.html`);
      console.log(`- http://localhost:${port}/static-test.html`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
