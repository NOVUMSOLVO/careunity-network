/**
 * Port Checker Utility
 *
 * This script checks if a specific port is in use and provides information
 * about available ports.
 */

import net from 'net';

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(true);
      } else {
        // Other error
        resolve(false);
      }
      server.close();
    });

    server.once('listening', () => {
      // Port is available
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

// Function to find the next available port
async function findAvailablePort(startPort, maxPort = startPort + 10) {
  for (let port = startPort; port <= maxPort; port++) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
  }
  return null; // No available port found in range
}

// Check ports
async function checkPorts() {
  const portsToCheck = [3000, 5000, 8000];

  console.log('Checking port availability...');

  for (const port of portsToCheck) {
    const inUse = await isPortInUse(port);
    console.log(`Port ${port}: ${inUse ? 'In use' : 'Available'}`);
  }

  // Find next available port starting from 3000
  const availablePort = await findAvailablePort(3000);
  if (availablePort) {
    console.log(`\nNext available port: ${availablePort}`);
  } else {
    console.log('\nNo available ports found in the range 3000-3010');
  }
}

// Run the port check
checkPorts().catch(console.error);
