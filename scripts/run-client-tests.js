/**
 * Script to run client-side tests with the correct environment
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Check if vitest.config.ts exists
const vitestConfigPath = path.resolve(process.cwd(), 'vitest.config.ts');
if (!fs.existsSync(vitestConfigPath)) {
  console.error('Error: vitest.config.ts not found');
  process.exit(1);
}

// Run vitest with the correct environment
const args = [
  'vitest',
  'run', // Run tests once and exit
  '--environment', 'jsdom', // Use jsdom environment for client tests
  '--config', vitestConfigPath, // Use the vitest config
  'client/src/**/*.test.{ts,tsx}', // Only run client tests
];

// Add any additional arguments passed to this script
process.argv.slice(2).forEach(arg => {
  args.push(arg);
});

console.log(`Running: ${args.join(' ')}`);

// Spawn the process
const child = spawn('npx', args, {
  stdio: 'inherit', // Pipe stdout/stderr to this process
  shell: true, // Use shell for Windows compatibility
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
