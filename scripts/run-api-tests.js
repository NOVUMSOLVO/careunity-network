/**
 * Run API Tests
 * 
 * This script runs the API tests and generates a report.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import open from 'open';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test suite
const testSuitePath = path.join(__dirname, '../tests/api/api-test-suite.ts');

// Path to the report
const reportPath = path.join(__dirname, '../reports/api-test-report.html');

// Ensure the reports directory exists
const reportsDir = path.dirname(reportPath);
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Run the tests
console.log('Running API tests...');
try {
  execSync(`npx tsx ${testSuitePath}`, { stdio: 'inherit' });
  console.log('Tests completed successfully.');
  
  // Check if the report was generated
  if (fs.existsSync(reportPath)) {
    console.log(`Report generated at: ${reportPath}`);
    
    // Open the report in the default browser
    console.log('Opening report in browser...');
    open(reportPath);
  } else {
    console.error('Report was not generated.');
  }
} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
}
