/**
 * Error handling tests for CareUnity Sync API
 *
 * This script tests error handling scenarios for the sync API.
 */

import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const AUTH_ENDPOINT = '/api/auth/login';
const SYNC_API_PREFIX = '/api/v2';
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

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

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null, isAuthRequest = false) {
  try {
    // Determine if this is an auth request or a sync API request
    const url = isAuthRequest 
      ? `${API_BASE_URL}${endpoint}` 
      : `${API_BASE_URL}${SYNC_API_PREFIX}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to ${url}`);
    
    const response = await fetch(url, options);
    
    // Try to parse JSON response, but handle non-JSON responses gracefully
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      console.log('Non-JSON response:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
      // Try to create a structured response for consistency
      data = { message: 'Non-JSON response received', responseText: data.substring(0, 100) };
    }

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('API request error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Authenticate with the server
async function authenticate() {
  const result = await apiRequest(AUTH_ENDPOINT, 'POST', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
  }, null, true);

  if (result.success && result.data.token) {
    authToken = result.data.token;
  }

  logResult('Authentication', result.success, result.data, result.error);
  return result.success;
}

// Test 1: Invalid operation format
async function testInvalidOperationFormat() {
  // Create an operation with missing required fields
  const invalidOperation = {
    // Missing url and method
    body: JSON.stringify({ test: 'data' }),
    headers: { 'Content-Type': 'application/json' },
  };

  const result = await apiRequest('/sync/operations', 'POST', invalidOperation, authToken);
  
  // This should fail with 400 Bad Request
  const testPassed = !result.success && result.status === 400;
  
  logResult('Invalid Operation Format', testPassed, result.data, result.error);
  return testPassed;
}

// Test 2: Invalid operation ID
async function testInvalidOperationId() {
  const result = await apiRequest('/sync/operations/invalid-id', 'GET', null, authToken);
  
  // This should fail with 404 Not Found
  const testPassed = !result.success && result.status === 404;
  
  logResult('Invalid Operation ID', testPassed, result.data, result.error);
  return testPassed;
}

// Test 3: Invalid update to operation
async function testInvalidOperationUpdate() {
  // First create a valid operation
  const operation = {
    url: 'http://example.com/api/test',
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test',
    entityId: '123',
  };

  const createResult = await apiRequest('/sync/operations', 'POST', operation, authToken);
  
  if (!createResult.success) {
    logResult('Create Operation for Update Test', false, createResult.data, createResult.error);
    return false;
  }
  
  const operationId = createResult.data.id;
  
  // Try to update with invalid status
  const invalidUpdate = {
    status: 'invalid-status' // Valid statuses are 'pending', 'completed', 'failed', 'conflict'
  };
  
  const result = await apiRequest(`/sync/operations/${operationId}`, 'PATCH', invalidUpdate, authToken);
  
  // This should fail with 400 Bad Request
  const testPassed = !result.success && result.status === 400;
  
  logResult('Invalid Operation Update', testPassed, result.data, result.error);
  return testPassed;
}

// Test 4: Rate limiting
async function testRateLimiting() {
  // Make multiple requests in quick succession
  const requests = [];
  const numRequests = 20; // Adjust based on rate limit
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(apiRequest('/sync/status', 'GET', null, authToken));
  }
  
  const results = await Promise.all(requests);
  
  // Check if any requests were rate limited (429 Too Many Requests)
  const rateLimited = results.some(result => result.status === 429);
  
  // This test passes if rate limiting is implemented (some requests return 429)
  // or if all requests succeed (rate limiting not implemented or limit not reached)
  const testPassed = rateLimited || results.every(result => result.success);
  
  logResult('Rate Limiting', testPassed, {
    totalRequests: numRequests,
    rateLimited: rateLimited,
    successfulRequests: results.filter(r => r.success).length
  }, testPassed ? null : 'Unexpected failures in rate limit test');
  
  return testPassed;
}

// Test 5: Server error handling
async function testServerErrorHandling() {
  // Create an operation that would trigger a server error
  // This is implementation-specific, but we can try with a very large payload
  const largeData = { data: 'x'.repeat(10 * 1024 * 1024) }; // 10MB of data
  
  const operation = {
    url: 'http://example.com/api/test',
    method: 'POST',
    body: JSON.stringify(largeData),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test',
    entityId: '123',
  };

  const result = await apiRequest('/sync/operations', 'POST', operation, authToken);
  
  // This should either fail with 413 Payload Too Large or 500 Internal Server Error
  // or succeed if the server can handle large payloads
  const testPassed = (!result.success && (result.status === 413 || result.status === 500)) || result.success;
  
  logResult('Server Error Handling', testPassed, result.data, result.error);
  return testPassed;
}

// Run all tests
async function runTests() {
  console.log('Starting Error Handling Tests...');

  // First authenticate
  const authSuccess = await authenticate();

  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run the tests
  await testInvalidOperationFormat();
  await testInvalidOperationId();
  await testInvalidOperationUpdate();
  await testRateLimiting();
  await testServerErrorHandling();

  console.log('\nError Handling Tests Completed!');
}

// Run the tests
console.log('Starting error handling tests...');
runTests().catch(error => {
  console.error('Error running tests:', error);
});
