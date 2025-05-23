/**
 * Run offline functionality end-to-end tests
 *
 * This script:
 * 1. Starts the server in test mode
 * 2. Runs Playwright tests for offline functionality
 * 3. Generates a report
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const SERVER_PORT = 3000;
const SERVER_STARTUP_TIMEOUT = 10000; // 10 seconds
const TEST_TIMEOUT = 60000; // 60 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Log a message with color
 * @param {string} message Message to log
 * @param {string} color Color to use
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Wait for a condition to be true
 * @param {Function} condition Condition function that returns a boolean
 * @param {number} timeout Timeout in milliseconds
 * @param {number} interval Check interval in milliseconds
 * @returns {Promise<boolean>} Whether the condition was met before timeout
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Check if a port is in use
 * @param {number} port Port to check
 * @returns {Promise<boolean>} Whether the port is in use
 */
async function isPortInUse(port) {
  return new Promise(resolve => {
    import('net').then(netModule => {
      const net = netModule.default;
      const tester = net.createServer()
        .once('error', err => {
          if (err.code === 'EADDRINUSE') {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .once('listening', () => {
          tester.once('close', () => resolve(false)).close();
        })
        .listen(port);
    }).catch(err => {
      console.error('Error importing net module:', err);
      resolve(false);
    });
  });
}

/**
 * Start the server in test mode
 * @returns {Promise<import('child_process').ChildProcess>} Server process
 */
async function startServer() {
  log('Starting server in test mode...', colors.cyan);

  // Check if port is already in use
  if (await isPortInUse(SERVER_PORT)) {
    log(`Port ${SERVER_PORT} is already in use. Please stop any running servers.`, colors.red);
    process.exit(1);
  }

  // Start server with test environment
  const serverProcess = spawn('node', ['server/index.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: SERVER_PORT.toString(),
      TEST_MODE: 'true',
    },
    stdio: 'pipe',
  });

  // Log server output
  serverProcess.stdout.on('data', data => {
    const output = data.toString().trim();
    if (output) {
      log(`[Server] ${output}`, colors.dim);
    }
  });

  serverProcess.stderr.on('data', data => {
    const output = data.toString().trim();
    if (output) {
      log(`[Server Error] ${output}`, colors.red);
    }
  });

  // Wait for server to start
  const serverStarted = await waitFor(async () => {
    try {
      return await isPortInUse(SERVER_PORT);
    } catch (error) {
      return false;
    }
  }, SERVER_STARTUP_TIMEOUT);

  if (!serverStarted) {
    log('Server failed to start within the timeout period.', colors.red);
    serverProcess.kill();
    process.exit(1);
  }

  log('Server started successfully.', colors.green);
  return serverProcess;
}

/**
 * Run Playwright tests
 * @returns {Promise<boolean>} Whether the tests passed
 */
async function runTests() {
  log('Running offline functionality tests...', colors.cyan);

  return new Promise(resolve => {
    const testProcess = spawn('npx', ['playwright', 'test', 'e2e-tests/offline.spec.ts', '--reporter=html'], {
      cwd: rootDir,
      env: {
        ...process.env,
        E2E_BASE_URL: `http://localhost:${SERVER_PORT}`,
      },
      stdio: 'pipe',
    });

    let output = '';

    testProcess.stdout.on('data', data => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    testProcess.stderr.on('data', data => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    testProcess.on('close', code => {
      if (code === 0) {
        log('Tests completed successfully.', colors.green);
        resolve(true);
      } else {
        log('Tests failed.', colors.red);
        resolve(false);
      }
    });

    // Set a timeout for the tests
    setTimeout(() => {
      log('Tests timed out.', colors.red);
      testProcess.kill();
      resolve(false);
    }, TEST_TIMEOUT);
  });
}

/**
 * Generate a test report
 * @param {boolean} success Whether the tests passed
 */
function generateReport(success) {
  log('Generating test report...', colors.cyan);

  const reportDir = path.join(rootDir, 'test-results');

  // Create report directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Write report
  const reportPath = path.join(reportDir, 'offline-test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    success,
    summary: success ? 'Offline functionality tests passed.' : 'Offline functionality tests failed.',
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Test report saved to ${reportPath}`, colors.green);

  // Open the HTML report
  log('Opening HTML report...', colors.cyan);
  const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  spawn(openCommand, ['playwright-report/index.html'], {
    cwd: rootDir,
    stdio: 'ignore',
    shell: true,
  });
}

/**
 * Main function
 */
async function main() {
  log('=== Offline Functionality Tests ===', colors.bright + colors.blue);

  let serverProcess;

  try {
    // Start server
    serverProcess = await startServer();

    // Run tests
    const success = await runTests();

    // Generate report
    generateReport(success);

    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    // Clean up server process
    if (serverProcess) {
      log('Stopping server...', colors.cyan);
      serverProcess.kill();
    }
  }
}

// Run the main function
main();
