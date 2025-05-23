/**
 * Port Finder Utility
 * 
 * This utility helps find an available port for the server to use.
 * It will try to use the preferred port first, and if that's not available,
 * it will find the next available port.
 */

import net from 'net';

/**
 * Check if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if the port is in use, false otherwise
 */
export function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
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

/**
 * Find an available port starting from the preferred port
 * @param {number} preferredPort - The preferred port to start with
 * @param {number} maxAttempts - Maximum number of ports to try
 * @returns {Promise<number>} - The available port
 */
export async function findAvailablePort(preferredPort = 5000, maxAttempts = 10) {
  console.log(`Looking for an available port starting from ${preferredPort}...`);
  
  for (let port = preferredPort; port < preferredPort + maxAttempts; port++) {
    const inUse = await isPortInUse(port);
    
    if (!inUse) {
      console.log(`Found available port: ${port}`);
      return port;
    }
    
    console.log(`Port ${port} is in use, trying next port...`);
  }
  
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

/**
 * Get a port to use, either from environment variable or find an available one
 * @returns {Promise<number>} - The port to use
 */
export async function getPortToUse() {
  // Try to use the port from environment variable
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  
  if (envPort) {
    // Check if the specified port is available
    const inUse = await isPortInUse(envPort);
    
    if (!inUse) {
      console.log(`Using port from environment: ${envPort}`);
      return envPort;
    }
    
    console.log(`Port ${envPort} from environment is in use, finding an alternative...`);
  }
  
  // Find an available port starting from 3000 (common development port)
  return findAvailablePort(3000);
}
