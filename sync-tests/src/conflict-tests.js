/**
 * Conflict resolution tests for CareUnity Sync API
 *
 * This script tests conflict detection and resolution scenarios for the sync API.
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

// Test 1: Create conflicting operations
async function testCreateConflictingOperations() {
  // Create first operation
  const entityId = uuid();
  const operation1 = {
    url: `/api/entities/${entityId}`,
    method: 'PATCH',
    body: JSON.stringify({ name: 'Updated by client 1' }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test-entity',
    entityId,
    clientId: 'client1',
    timestamp: Date.now()
  };

  const result1 = await apiRequest('/sync/operations', 'POST', operation1, authToken);
  
  if (!result1.success) {
    logResult('Create First Operation', false, result1.data, result1.error);
    return false;
  }
  
  // Create second operation with same entity but different client
  const operation2 = {
    url: `/api/entities/${entityId}`,
    method: 'PATCH',
    body: JSON.stringify({ name: 'Updated by client 2' }),
    headers: { 'Content-Type': 'application/json' },
    entityType: 'test-entity',
    entityId,
    clientId: 'client2',
    timestamp: Date.now() + 100 // Slightly later timestamp
  };

  const result2 = await apiRequest('/sync/operations', 'POST', operation2, authToken);
  
  const success = result1.success && result2.success;
  
  logResult('Create Conflicting Operations', success, {
    operation1: result1.data,
    operation2: result2.data
  }, success ? null : 'Failed to create conflicting operations');
  
  return success;
}

// Test 2: Detect conflicts during processing
async function testConflictDetection() {
  // Process operations which should detect conflicts
  const result = await apiRequest('/sync/process', 'POST', null, authToken);
  
  // Check if conflicts were detected
  const hasConflicts = result.data && result.data.conflicts && result.data.conflicts.length > 0;
  
  logResult('Conflict Detection', hasConflicts, result.data, hasConflicts ? null : 'No conflicts detected');
  
  return hasConflicts;
}

// Test 3: Resolve conflict using last-write-wins strategy
async function testLastWriteWinsResolution() {
  // Get all operations with conflicts
  const result = await apiRequest('/sync/operations?status=conflict', 'GET', null, authToken);
  
  if (!result.success || !result.data || !result.data.length) {
    logResult('Get Conflict Operations', false, result.data, 'No conflict operations found');
    return false;
  }
  
  // Get the first conflict
  const conflict = result.data[0];
  
  // Resolve using last-write-wins strategy
  const resolution = {
    strategy: 'last-write-wins',
    operationId: conflict.id
  };
  
  const resolveResult = await apiRequest('/sync/resolve', 'POST', resolution, authToken);
  
  const success = resolveResult.success;
  
  logResult('Last-Write-Wins Resolution', success, resolveResult.data, success ? null : 'Failed to resolve conflict');
  
  return success;
}

// Test 4: Resolve conflict using manual merge strategy
async function testManualMergeResolution() {
  // Get all operations with conflicts
  const result = await apiRequest('/sync/operations?status=conflict', 'GET', null, authToken);
  
  if (!result.success || !result.data || !result.data.length) {
    logResult('Get Conflict Operations', false, result.data, 'No conflict operations found');
    return false;
  }
  
  // Get the first conflict
  const conflict = result.data[0];
  
  // Resolve using manual merge strategy
  const resolution = {
    strategy: 'manual',
    operationId: conflict.id,
    mergedData: JSON.stringify({ name: 'Manually merged update' })
  };
  
  const resolveResult = await apiRequest('/sync/resolve', 'POST', resolution, authToken);
  
  const success = resolveResult.success;
  
  logResult('Manual Merge Resolution', success, resolveResult.data, success ? null : 'Failed to resolve conflict');
  
  return success;
}

// Run all tests
async function runTests() {
  console.log('Starting Conflict Resolution Tests...');

  // First authenticate
  const authSuccess = await authenticate();

  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run the tests
  const conflictsCreated = await testCreateConflictingOperations();
  
  if (conflictsCreated) {
    await testConflictDetection();
    await testLastWriteWinsResolution();
    await testManualMergeResolution();
  }

  console.log('\nConflict Resolution Tests Completed!');
}

// Run the tests
console.log('Starting conflict tests...');
runTests().catch(error => {
  console.error('Error running tests:', error);
});
