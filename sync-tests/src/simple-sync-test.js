/**
 * Simple test script for CareUnity Sync API
 *
 * This script provides a minimal test for the sync API endpoints.
 * It uses fetch to make requests to the API and logs the results.
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api/v2';
const AUTH_URL = 'http://localhost:5000/api/auth/login';

// Test credentials - replace with valid credentials for your environment
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'password123';

// Helper function to log results in a structured way
function logResult(testName, response, data) {
  console.log(`\n----- ${testName} -----`);
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log('Response:');
  console.log(JSON.stringify(data, null, 2));
}

// Helper function to make authenticated API requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
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
    const data = await response.json().catch(() => ({}));

    return { response, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

// Test authentication
async function testAuth() {
  try {
    console.log('Testing authentication...');

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      }),
    });

    const data = await response.json().catch(() => ({}));

    logResult('Authentication', response, data);

    if (response.ok && data.token) {
      console.log('✅ Authentication successful');
      return data.token;
    } else {
      console.log('❌ Authentication failed');
      return null;
    }
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
}

// Test sync status endpoint
async function testSyncStatus(token) {
  console.log('Testing sync status endpoint...');
  const { response, data, error } = await apiRequest('/sync/status', 'GET', null, token);

  if (error) {
    console.log('❌ Error testing sync status:', error);
    return;
  }

  logResult('Sync Status', response, data);
}

// Test creating a sync operation
async function testCreateOperation(token) {
  console.log('Testing create operation endpoint...');

  const operation = {
    url: 'http://example.com/api/test',
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test',
    entityId: '123',
  };

  const { response, data, error } = await apiRequest('/sync/operations', 'POST', operation, token);

  if (error) {
    console.log('❌ Error creating operation:', error);
    return null;
  }

  logResult('Create Operation', response, data);

  if (response.ok && data.id) {
    console.log(`✅ Operation created with ID: ${data.id}`);
    return data.id;
  } else {
    console.log('❌ Failed to create operation');
    return null;
  }
}

// Test getting all operations
async function testGetOperations(token) {
  console.log('Testing get operations endpoint...');
  const { response, data, error } = await apiRequest('/sync/operations', 'GET', null, token);

  if (error) {
    console.log('❌ Error getting operations:', error);
    return;
  }

  logResult('Get Operations', response, data);
}

// Test processing operations
async function testProcessOperations(token) {
  console.log('Testing process operations endpoint...');
  const { response, data, error } = await apiRequest('/sync/process', 'POST', {}, token);

  if (error) {
    console.log('❌ Error processing operations:', error);
    return;
  }

  logResult('Process Operations', response, data);
}

// Run all tests
async function runTests() {
  console.log('=== Starting Sync API Tests ===');

  // First authenticate
  const token = await testAuth();

  if (!token) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run the tests
  await testSyncStatus(token);
  const operationId = await testCreateOperation(token);
  await testGetOperations(token);
  await testProcessOperations(token);

  console.log('\n=== Sync API Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
});
