/**
 * Dynamic Server Launcher
 *
 * This script launches the dynamic server that automatically finds an available port.
 * It uses the dynamic-index.ts file which implements port finding functionality.
 */

// Import the required modules
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting CareUnity dynamic server...');
console.log('This server will automatically find an available port if the default port is in use.');

// Command to run the server
const command = 'tsx';
const args = ['server/dynamic-index.ts'];

// Spawn the process
const serverProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Force the server to try multiple ports if needed
    ENABLE_DYNAMIC_PORT: 'true'
  }
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  serverProcess.kill('SIGTERM');
});
