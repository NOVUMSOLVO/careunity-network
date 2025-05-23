/**
 * Script to run the sync API tests
 *
 * This script:
 * 1. Checks if the server is running
 * 2. If not, starts the server
 * 3. Runs the sync API tests
 */

import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVER_URL = 'http://localhost:5000/api/healthcheck';
const SERVER_START_COMMAND = 'npm';
const SERVER_START_ARGS = ['run', 'dev'];
const TEST_SCRIPT = path.join(__dirname, 'test-sync-api.js');

// Check if the server is running
function checkServerRunning() {
  return new Promise((resolve) => {
    http.get(SERVER_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is already running');
        resolve(true);
      } else {
        console.log('❌ Server returned status code:', res.statusCode);
        resolve(false);
      }
    }).on('error', () => {
      console.log('❌ Server is not running');
      resolve(false);
    });
  });
}

// Start the server
function startServer() {
  return new Promise((resolve) => {
    console.log('Starting server...');

    const server = spawn(SERVER_START_COMMAND, SERVER_START_ARGS, {
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      resolve(false);
    });

    // Give the server some time to start
    setTimeout(() => {
      checkServerRunning().then(isRunning => {
        if (isRunning) {
          console.log('✅ Server started successfully');
          resolve(true);
        } else {
          console.log('❌ Server failed to start');
          resolve(false);
        }
      });
    }, 5000);
  });
}

// Run the tests
function runTests() {
  console.log('Running sync API tests...');

  const tests = spawn('node', [TEST_SCRIPT], {
    stdio: 'inherit',
    shell: true
  });

  tests.on('error', (err) => {
    console.error('Failed to run tests:', err);
  });

  tests.on('exit', (code) => {
    console.log(`Tests exited with code ${code}`);
  });
}

// Main function
async function main() {
  console.log('=== CareUnity Sync API Test Runner ===');

  // Check if the server is running
  const isRunning = await checkServerRunning();

  // If not running, start it
  if (!isRunning) {
    const started = await startServer();

    if (!started) {
      console.error('❌ Could not start the server. Please start it manually and try again.');
      process.exit(1);
    }
  }

  // Run the tests
  runTests();
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
