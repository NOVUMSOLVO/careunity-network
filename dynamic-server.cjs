/**
 * Dynamic Server Launcher (CommonJS version)
 * 
 * This script launches the dynamic server that automatically finds an available port.
 */

// Import the required modules
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting CareUnity dynamic server...');

// Command to run the server
const command = 'tsx';
const args = ['server/dynamic-index.ts'];

// Spawn the process
const serverProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true
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
