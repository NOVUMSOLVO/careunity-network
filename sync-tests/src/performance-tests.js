/**
 * Performance tests for CareUnity Sync API
 *
 * This script tests the performance of the sync API under load.
 */

import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v2';
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';
const CONCURRENT_REQUESTS = 10;
const BATCH_SIZE = 50;
const TOTAL_OPERATIONS = 100;

// Global variables
let authToken = null;

// Helper function to log test results
function logResult(testName, success, data = null, error = null) {
  console.log(`\n${success ? '✅' : '❌'} ${testName}`);
  
  if (data) {
    console.log('  Data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
  
  if (error) {
    console.log('  Error:', error);
  }
}

// Helper function to make authenticated API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const startTime = performance.now();
    const response = await fetch(url, options);
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
      responseTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Authenticate with the server
async function authenticate() {
  const result = await apiRequest('/auth/login', 'POST', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
  }

  logResult('Authentication', result.success, result.data, result.error);
  return result.success;
}

// Test 1: Measure response time for sync status
async function testSyncStatusResponseTime() {
  const result = await apiRequest('/sync/status');
  
  const success = result.success && result.responseTime < 1000; // Expect < 1 second
  
  logResult(
    'Sync Status Response Time', 
    success, 
    { responseTime: `${result.responseTime.toFixed(2)}ms` }, 
    result.error
  );
  
  return success;
}

// Test 2: Create multiple sync operations in parallel
async function testConcurrentOperations() {
  const startTime = performance.now();
  
  // Create an array of promises for concurrent requests
  const promises = Array(CONCURRENT_REQUESTS).fill().map((_, index) => {
    const operation = {
      url: `http://example.com/api/test/${index}`,
      method: 'POST',
      body: JSON.stringify({ test: `data-${index}` }),
      headers: { 'Content-Type': 'application/json' },
      entityType: 'test',
      entityId: `${index}`,
    };
    
    return apiRequest('/sync/operations', 'POST', operation);
  });
  
  // Wait for all requests to complete
  const results = await Promise.all(promises);
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / CONCURRENT_REQUESTS;
  
  // Check if all requests were successful
  const allSuccessful = results.every(result => result.success);
  
  // Calculate average response time
  const avgResponseTime = results.reduce((sum, result) => sum + (result.responseTime || 0), 0) / results.length;
  
  const success = allSuccessful && avgResponseTime < 500; // Expect avg < 500ms
  
  logResult(
    'Concurrent Operations Creation', 
    success, 
    { 
      totalRequests: CONCURRENT_REQUESTS,
      totalTime: `${totalTime.toFixed(2)}ms`,
      averageTime: `${avgTime.toFixed(2)}ms`,
      averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
    }, 
    allSuccessful ? null : 'Some requests failed'
  );
  
  return success;
}

// Test 3: Batch operation creation performance
async function testBatchOperations() {
  // Create a batch of operations
  const operations = Array(BATCH_SIZE).fill().map((_, index) => ({
    url: `http://example.com/api/batch/${index}`,
    method: 'POST',
    body: JSON.stringify({ test: `batch-${index}` }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test',
    entityId: `batch-${index}`,
  }));
  
  const startTime = performance.now();
  
  const result = await apiRequest('/sync/batch', 'POST', { operations });
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  const success = result.success && totalTime < 2000; // Expect < 2 seconds for batch
  
  logResult(
    'Batch Operations Creation', 
    success, 
    { 
      batchSize: BATCH_SIZE,
      totalTime: `${totalTime.toFixed(2)}ms`,
      timePerOperation: `${(totalTime / BATCH_SIZE).toFixed(2)}ms`,
    }, 
    result.error
  );
  
  return success;
}

// Test 4: Process operations performance
async function testProcessOperations() {
  const startTime = performance.now();
  
  const result = await apiRequest('/sync/process', 'POST');
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  const success = result.success && totalTime < 5000; // Expect < 5 seconds
  
  logResult(
    'Process Operations Performance', 
    success, 
    { 
      totalTime: `${totalTime.toFixed(2)}ms`,
      operationsProcessed: result.data?.processed || 0,
    }, 
    result.error
  );
  
  return success;
}

// Run all tests
async function runTests() {
  console.log('Starting Sync API Performance Tests...');

  // First authenticate
  const authSuccess = await authenticate();

  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run the tests
  await testSyncStatusResponseTime();
  await testConcurrentOperations();
  await testBatchOperations();
  await testProcessOperations();

  console.log('\nSync API Performance Tests Completed!');
}

// Run the tests
console.log('Starting performance tests...');
runTests().catch(error => {
  console.error('Error running tests:', error);
});
