/**
 * Script to run all sync API tests
 *
 * This script:
 * 1. Starts the mock server
 * 2. Runs the simple test script
 * 3. Runs the authentication tests
 * 4. Runs the performance tests
 * 5. Starts the test page server
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Configuration
const MOCK_SERVER_COMMAND = 'node';
const MOCK_SERVER_ARGS = ['src/mock-sync-server.cjs'];
const TEST_SCRIPT_COMMAND = 'node';
const TEST_SCRIPT_ARGS = ['src/simple-sync-test.js'];
const AUTH_TEST_COMMAND = 'node';
const AUTH_TEST_ARGS = ['src/auth-tests.js'];
const PERF_TEST_COMMAND = 'node';
const PERF_TEST_ARGS = ['src/performance-tests.js'];
const TEST_PAGE_SERVER_COMMAND = 'node';
const TEST_PAGE_SERVER_ARGS = ['src/serve-test-page.js'];

// Start the mock server
async function startMockServer() {
  console.log('Starting mock server...');

  const server = spawn(MOCK_SERVER_COMMAND, MOCK_SERVER_ARGS, {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (err) => {
    console.error('Failed to start mock server:', err);
  });

  // Give the server some time to start
  await setTimeout(2000);

  return server;
}

// Run a test script
async function runTestScript(command, args, testName) {
  console.log(`Running ${testName}...`);

  return new Promise((resolve) => {
    const tests = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    tests.on('error', (err) => {
      console.error(`Failed to run ${testName}:`, err);
      resolve(false);
    });

    tests.on('exit', (code) => {
      console.log(`${testName} exited with code ${code}`);
      resolve(code === 0);
    });
  });
}

// Run the basic tests
async function runBasicTests() {
  return runTestScript(TEST_SCRIPT_COMMAND, TEST_SCRIPT_ARGS, 'basic tests');
}

// Run the authentication tests
async function runAuthTests() {
  return runTestScript(AUTH_TEST_COMMAND, AUTH_TEST_ARGS, 'authentication tests');
}

// Run the performance tests
async function runPerfTests() {
  return runTestScript(PERF_TEST_COMMAND, PERF_TEST_ARGS, 'performance tests');
}

// Start the test page server
async function startTestPageServer() {
  console.log('Starting test page server...');

  const server = spawn(TEST_PAGE_SERVER_COMMAND, TEST_PAGE_SERVER_ARGS, {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (err) => {
    console.error('Failed to start test page server:', err);
  });

  // Give the server some time to start
  await setTimeout(2000);

  return server;
}

// Main function
async function main() {
  console.log('=== CareUnity Sync API Test Runner ===');

  // Start the mock server
  const mockServer = await startMockServer();

  // Run the basic tests
  const basicTestsPassed = await runBasicTests();

  if (!basicTestsPassed) {
    console.error('❌ Basic tests failed');
    mockServer.kill();
    process.exit(1);
  }

  // Run the authentication tests
  const authTestsPassed = await runAuthTests();

  if (!authTestsPassed) {
    console.error('❌ Authentication tests failed');
    mockServer.kill();
    process.exit(1);
  }

  // Run the performance tests
  const perfTestsPassed = await runPerfTests();

  if (!perfTestsPassed) {
    console.error('❌ Performance tests failed');
    mockServer.kill();
    process.exit(1);
  }

  // Start the test page server
  const testPageServer = await startTestPageServer();

  console.log('\n✅ All tests passed');
  console.log('\nTest page server is running at http://localhost:3002/');
  console.log('Press Ctrl+C to stop the servers and exit');

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping servers...');
    mockServer.kill();
    testPageServer.kill();
    process.exit(0);
  });
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
