/**
 * API Test Script
 * 
 * This script tests the API endpoints to verify that they are working correctly.
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_URL = 'http://localhost:5000/api';
const API_V1_URL = 'http://localhost:5000/api/v1';
const AUTH_TOKEN = ''; // Add your auth token here if needed

// Test cases
const tests = [
  {
    name: 'API Root',
    method: 'GET',
    url: API_URL,
    expectedStatus: 200,
  },
  {
    name: 'API v1 Root',
    method: 'GET',
    url: API_V1_URL,
    expectedStatus: 200,
  },
  {
    name: 'Get Service Users',
    method: 'GET',
    url: `${API_URL}/service-users`,
    expectedStatus: 200,
    validateResponse: (res) => {
      if (!res.data.data || !Array.isArray(res.data.data)) {
        throw new Error('Response data is not an array');
      }
      if (res.data.error !== null) {
        throw new Error('Error should be null');
      }
      if (!res.data.meta || !res.data.meta.pagination) {
        throw new Error('Response should include pagination metadata');
      }
    },
  },
  {
    name: 'Get Service Users (v1)',
    method: 'GET',
    url: `${API_V1_URL}/service-users`,
    expectedStatus: 200,
    validateResponse: (res) => {
      if (!res.data.data || !Array.isArray(res.data.data)) {
        throw new Error('Response data is not an array');
      }
      if (res.data.error !== null) {
        throw new Error('Error should be null');
      }
      if (!res.data.meta || !res.data.meta.pagination) {
        throw new Error('Response should include pagination metadata');
      }
    },
  },
  {
    name: 'Get Non-existent Service User',
    method: 'GET',
    url: `${API_URL}/service-users/9999`,
    expectedStatus: 404,
    validateResponse: (res) => {
      if (res.data.data !== null) {
        throw new Error('Data should be null');
      }
      if (!res.data.error || res.data.error.code !== 'not_found') {
        throw new Error('Error code should be "not_found"');
      }
    },
  },
  {
    name: 'Get Care Plans',
    method: 'GET',
    url: `${API_URL}/care-plans`,
    expectedStatus: 200,
    validateResponse: (res) => {
      if (!res.data.data || !Array.isArray(res.data.data)) {
        throw new Error('Response data is not an array');
      }
      if (res.data.error !== null) {
        throw new Error('Error should be null');
      }
      if (!res.data.meta || !res.data.meta.pagination) {
        throw new Error('Response should include pagination metadata');
      }
    },
  },
  {
    name: 'Invalid Route',
    method: 'GET',
    url: `${API_URL}/invalid-route`,
    expectedStatus: 404,
    validateResponse: (res) => {
      if (res.data.data !== null) {
        throw new Error('Data should be null');
      }
      if (!res.data.error || res.data.error.code !== 'not_found') {
        throw new Error('Error code should be "not_found"');
      }
    },
  },
];

// Run tests
async function runTests() {
  console.log(chalk.blue('=== API Test Script ==='));
  console.log(chalk.blue(`Testing API at ${API_URL}`));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(chalk.cyan(`Testing: ${test.name}`));
      
      const config = {
        headers: {},
      };
      
      if (AUTH_TOKEN) {
        config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
      }
      
      const response = await axios({
        method: test.method,
        url: test.url,
        ...config,
        validateStatus: () => true, // Don't throw on error status codes
      });
      
      // Check status code
      if (response.status !== test.expectedStatus) {
        throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
      }
      
      // Validate response if needed
      if (test.validateResponse) {
        test.validateResponse(response);
      }
      
      console.log(chalk.green('✓ Passed'));
      passed++;
    } catch (error) {
      console.log(chalk.red(`✗ Failed: ${error.message}`));
      if (error.response) {
        console.log(chalk.red('Response:', JSON.stringify(error.response.data, null, 2)));
      }
      failed++;
    }
    
    console.log();
  }
  
  // Print summary
  console.log(chalk.blue('=== Test Summary ==='));
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  console.log(chalk.blue(`Total: ${tests.length}`));
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('Error running tests:'), error);
  process.exit(1);
});
