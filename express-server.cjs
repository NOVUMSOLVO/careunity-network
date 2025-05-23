const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
// Try to use the port from environment variable or default to 3001
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pure-html.html'));
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

    // Create HTTP server
    const server = http.createServer(app);

    // Start the server
    server.listen(port, () => {
      console.log(`\n=== Express server running at http://localhost:${port}/ ===`);
      console.log('Available endpoints:');
      console.log(`- http://localhost:${port}/api/healthcheck (API health check)`);
      console.log('\nAvailable pages:');
      console.log(`- http://localhost:${port}/`);
      console.log(`- http://localhost:${port}/pure-html.html`);
      console.log(`- http://localhost:${port}/minimal-react.html`);
      console.log(`- http://localhost:${port}/standalone-react.html`);
      console.log(`- http://localhost:${port}/basic-test.html`);
      console.log(`- http://localhost:${port}/static-test.html`);

      console.log('\nServer root directory:', __dirname);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
