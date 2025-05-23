/**
 * Script to run sync service tests
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Check if the test file exists
const testFile = path.resolve(process.cwd(), 'client/src/services/__tests__/sync-service-extended.test.ts');
if (!fs.existsSync(testFile)) {
  console.error('Error: Test file not found:', testFile);
  process.exit(1);
}

console.log('Running sync service extended tests...');

// Run the tests with Node directly
const args = [
  '--experimental-vm-modules', // Enable ES modules
  'node_modules/vitest/vitest.mjs',
  'run',
  '--environment', 'node', // Use Node environment instead of jsdom
  testFile
];

console.log(`Running: node ${args.join(' ')}`);

// Spawn the process
const child = spawn('node', args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-warnings' // Suppress Node.js warnings
  }
});

// Handle process exit
child.on('exit', code => {
  process.exit(code);
});

// Handle process errors
child.on('error', err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
