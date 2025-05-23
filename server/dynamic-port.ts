/**
 * Dynamic Port Server Configuration
 *
 * This module provides functions to find an available port and start the server
 * on that port. It will try to use the default port first, and if that's not
 * available, it will try other ports until it finds an available one.
 */

import { Server } from 'http';
import { log } from './vite';

/**
 * Find an available port starting from the specified port
 *
 * @param server HTTP server instance
 * @param startPort Port to start trying from
 * @param maxAttempts Maximum number of ports to try
 * @returns Promise that resolves to the available port
 */
export function findAvailablePort(
  server: Server,
  startPort: number = 5000,
  maxAttempts: number = 10
): Promise<number> {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    // Function to try a specific port
    const tryPort = (port: number) => {
      // Check if we've exceeded the maximum number of attempts
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
        return;
      }

      attempts++;

      // Set up error handler for this attempt
      const errorHandler = (err: NodeJS.ErrnoException) => {
        server.removeListener('error', errorHandler);

        if (err.code === 'EADDRINUSE') {
          // Port is in use, try the next one
          log(`Port ${port} is in use, trying ${port + 1}...`);
          tryPort(port + 1);
        } else {
          // Other error occurred
          reject(err);
        }
      };

      // Set up listening handler for this attempt
      const listeningHandler = () => {
        server.removeListener('listening', listeningHandler);
        server.removeListener('error', errorHandler);

        resolve(port);
      };

      // Add event listeners
      server.once('error', errorHandler);
      server.once('listening', listeningHandler);

      // Try to listen on the port
      server.listen(port);
    };

    // Start trying ports
    tryPort(currentPort);
  });
}

/**
 * Start the server on an available port
 *
 * @param server HTTP server instance
 * @param preferredPort Preferred port to use
 * @returns Promise that resolves when the server is started
 */
export async function startServerOnAvailablePort(
  server: Server,
  preferredPort: number = 5000
): Promise<number> {
  try {
    // Check if dynamic port assignment is enabled
    const useDynamicPort = process.env.ENABLE_DYNAMIC_PORT === 'true';

    if (useDynamicPort) {
      // Use dynamic port assignment
      const port = await findAvailablePort(server, preferredPort);
      log(`Server started on port ${port}`);
      return port;
    } else {
      // Try to use only the preferred port
      return new Promise((resolve, reject) => {
        // Set up error handler
        const errorHandler = (err: NodeJS.ErrnoException) => {
          server.removeListener('error', errorHandler);
          server.removeListener('listening', listeningHandler);

          if (err.code === 'EADDRINUSE') {
            // Port is in use
            const errorMessage = `Port ${preferredPort} is already in use. Set ENABLE_DYNAMIC_PORT=true to automatically find an available port.`;
            log(errorMessage);
            reject(new Error(errorMessage));
          } else {
            // Other error
            reject(err);
          }
        };

        // Set up listening handler
        const listeningHandler = () => {
          server.removeListener('error', errorHandler);
          server.removeListener('listening', listeningHandler);

          log(`Server started on port ${preferredPort}`);
          resolve(preferredPort);
        };

        // Add event listeners
        server.once('error', errorHandler);
        server.once('listening', listeningHandler);

        // Try to listen on the preferred port
        server.listen(preferredPort);
      });
    }
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
