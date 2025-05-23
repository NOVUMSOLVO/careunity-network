/**
 * Debug Server for CareUnity
 * Outputs the port it's using
 */

const http = require('http');

// Create a simple server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Debug server is running');
});

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
  });

  server.listen(port);
};

// Start with port 3000, try up to 3010
console.log('Starting debug server...');
tryPort(3000, 3010);
