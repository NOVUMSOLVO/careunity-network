/**
 * Authentication tests for CareUnity Sync API
 *
 * This script tests authentication edge cases and error handling for the sync API.
 */

import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const AUTH_ENDPOINT = '/api/auth/login'; // Updated to match mock server
const SYNC_API_PREFIX = '/api/v2';
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';
const INVALID_PASSWORD = 'wrongpassword';
const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.2Zc9MmJxQgOsL8FoQTVTsOUZ3Ir5U9ULcPIjKBNGDFc';

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

// Test 1: Successful authentication
async function testSuccessfulAuth() {
  const result = await apiRequest(AUTH_ENDPOINT, 'POST', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
  }, null, true); // Mark as auth request

  if (result.success && result.data.token) {
    authToken = result.data.token;
  }

  logResult('Successful Authentication', result.success, result.data, result.error);
  return result.success;
}

// Test 2: Failed authentication (wrong password)
async function testFailedAuth() {
  const result = await apiRequest(AUTH_ENDPOINT, 'POST', {
    username: TEST_USERNAME,
    password: INVALID_PASSWORD,
  }, null, true); // Mark as auth request

  // This should fail, so we invert the success check
  const testPassed = !result.success && result.status === 401;

  logResult('Failed Authentication (Wrong Password)', testPassed, result.data, result.error);
  return testPassed;
}

// Test 3: Missing authentication token
async function testMissingToken() {
  const result = await apiRequest('/sync/status');

  // This should fail with 401 Unauthorized
  const testPassed = !result.success && result.status === 401;

  logResult('Missing Authentication Token', testPassed, result.data, result.error);
  return testPassed;
}

// Test 4: Invalid authentication token
async function testInvalidToken() {
  const result = await apiRequest('/sync/status', 'GET', null, 'invalid-token');

  // This should fail with 401 Unauthorized
  const testPassed = !result.success && result.status === 401;

  logResult('Invalid Authentication Token', testPassed, result.data, result.error);
  return testPassed;
}

// Test 5: Expired authentication token
async function testExpiredToken() {
  const result = await apiRequest('/sync/status', 'GET', null, EXPIRED_TOKEN);

  // This should fail with 401 Unauthorized
  const testPassed = !result.success && result.status === 401;

  logResult('Expired Authentication Token', testPassed, result.data, result.error);
  return testPassed;
}

// Test 6: Token refresh
async function testTokenRefresh() {
  // First get a valid token
  if (!authToken) {
    await testSuccessfulAuth();
    if (!authToken) {
      logResult('Token Refresh', false, null, 'Could not obtain initial token');
      return false;
    }
  }

  // Try to refresh the token
  const result = await apiRequest('/api/auth/refresh', 'POST', null, authToken, true); // Mark as auth request

  if (result.success && result.data.token) {
    // Update the token
    authToken = result.data.token;
  }

  // Consider this test optional since not all implementations have refresh tokens
  const testPassed = result.success || result.status === 404;

  logResult('Token Refresh', testPassed, result.data, result.error);
  return testPassed;
}

// Run all tests
async function runTests() {
  console.log('Starting Authentication Tests...');

  // Run the tests
  const authSuccess = await testSuccessfulAuth();
  await testFailedAuth();
  await testMissingToken();
  await testInvalidToken();
  await testExpiredToken();

  // Only run token refresh if we have a valid token
  if (authSuccess) {
    await testTokenRefresh();
  }

  console.log('\nAuthentication Tests Completed!');
}

// Run the tests
console.log('Starting authentication tests...');
runTests().catch(error => {
  console.error('Error running tests:', error);
});
