/**
 * Test script for CareUnity Sync API
 *
 * This script tests the sync API endpoints to verify they are working correctly.
 * It performs the following tests:
 * 1. Authenticates with the server to get a token
 * 2. Tests the sync status endpoint
 * 3. Creates a sync operation
 * 4. Gets all sync operations
 * 5. Gets a specific sync operation by ID
 * 6. Updates a sync operation
 * 7. Processes pending operations
 * 8. Creates a batch of sync operations
 * 9. Deletes completed operations
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api/v2';
const AUTH_URL = 'http://localhost:5000/api/auth/login';

// Test credentials - replace with valid credentials for your environment
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'password123';

// Store the auth token and created operation ID
let authToken = null;
let createdOperationId = null;

// Helper function to log results
function logResult(testName, success, data, error = null) {
  console.log(`\n----- ${testName} -----`);
  console.log(`Status: ${success ? 'SUCCESS ✅' : 'FAILED ❌'}`);

  if (data) {
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
  }

  if (error) {
    console.log('Error:');
    console.log(error);
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

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Test 1: Authenticate with the server
async function authenticate() {
  try {
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

    const data = await response.json();

    if (response.ok && data.token) {
      authToken = data.token;
      logResult('Authentication', true, { token: data.token.substring(0, 10) + '...' });
      return true;
    } else {
      logResult('Authentication', false, data);
      return false;
    }
  } catch (error) {
    logResult('Authentication', false, null, error.message);
    return false;
  }
}

// Test 2: Get sync status
async function testSyncStatus() {
  const result = await apiRequest('/sync/status');
  logResult('Get Sync Status', result.success, result.data, result.error);
  return result.success;
}

// Test 3: Create a sync operation
async function testCreateOperation() {
  const operation = {
    url: 'http://example.com/api/test',
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test',
    entityId: '123',
  };

  const result = await apiRequest('/sync/operations', 'POST', operation);

  if (result.success && result.data.id) {
    createdOperationId = result.data.id;
  }

  logResult('Create Sync Operation', result.success, result.data, result.error);
  return result.success;
}

// Test 4: Get all sync operations
async function testGetOperations() {
  const result = await apiRequest('/sync/operations');
  logResult('Get All Sync Operations', result.success, result.data, result.error);
  return result.success;
}

// Test 5: Get a specific sync operation by ID
async function testGetOperation() {
  if (!createdOperationId) {
    logResult('Get Sync Operation by ID', false, null, 'No operation ID available');
    return false;
  }

  const result = await apiRequest(`/sync/operations/${createdOperationId}`);
  logResult('Get Sync Operation by ID', result.success, result.data, result.error);
  return result.success;
}

// Test 6: Update a sync operation
async function testUpdateOperation() {
  if (!createdOperationId) {
    logResult('Update Sync Operation', false, null, 'No operation ID available');
    return false;
  }

  const update = {
    status: 'completed',
  };

  const result = await apiRequest(`/sync/operations/${createdOperationId}`, 'PATCH', update);
  logResult('Update Sync Operation', result.success, result.data, result.error);
  return result.success;
}

// Test 7: Process pending operations
async function testProcessOperations() {
  const result = await apiRequest('/sync/process', 'POST');
  logResult('Process Pending Operations', result.success, result.data, result.error);
  return result.success;
}

// Test 8: Create a batch of sync operations
async function testBatchOperations() {
  const batch = {
    operations: [
      {
        url: 'http://example.com/api/test1',
        method: 'POST',
        body: JSON.stringify({ test: 'batch1' }),
        entityType: 'test',
        entityId: '456',
      },
      {
        url: 'http://example.com/api/test2',
        method: 'PUT',
        body: JSON.stringify({ test: 'batch2' }),
        entityType: 'test',
        entityId: '789',
      },
    ],
  };

  const result = await apiRequest('/sync/batch', 'POST', batch);
  logResult('Create Batch Operations', result.success, result.data, result.error);
  return result.success;
}

// Test 9: Delete completed operations
async function testDeleteCompleted() {
  const result = await apiRequest('/sync/completed', 'DELETE');
  logResult('Delete Completed Operations', result.success, result.data, result.error);
  return result.success;
}

// Run all tests
async function runTests() {
  console.log('Starting Sync API Tests...');

  // First authenticate
  const authSuccess = await authenticate();

  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run the tests
  await testSyncStatus();
  await testCreateOperation();
  await testGetOperations();
  await testGetOperation();
  await testUpdateOperation();
  await testProcessOperations();
  await testBatchOperations();
  await testDeleteCompleted();

  console.log('\nSync API Tests Completed!');
}

// Run the tests
console.log('Starting tests...');
runTests().catch(error => {
  console.error('Error running tests:', error);
});
console.log('Test script loaded');
