# CareUnity Sync API Testing Guide

This document provides a comprehensive guide to testing the CareUnity Sync API, which is critical for offline data synchronization in the application.

## Table of Contents

1. [Test Suite Overview](#test-suite-overview)
2. [Running Tests](#running-tests)
3. [Test Categories](#test-categories)
4. [CI/CD Integration](#cicd-integration)
5. [Performance Monitoring](#performance-monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Extending the Tests](#extending-the-tests)

## Test Suite Overview

The Sync API test suite consists of several components:

- **Basic Functionality Tests**: Verify core sync API operations
- **Authentication Tests**: Test authentication edge cases and error handling
- **Performance Tests**: Measure API performance under load
- **Conflict Resolution Tests**: Test conflict detection and resolution
- **Error Handling Tests**: Verify proper handling of error conditions
- **Browser-based Tests**: Interactive testing interface

## Running Tests

### Prerequisites

Before running the tests, ensure you have:

1. Node.js installed (v14 or later)
2. The CareUnity app dependencies installed (`npm install`)
3. The sync-tests dependencies installed (`cd sync-tests && npm install`)

### Running Individual Test Suites

```bash
# Navigate to the sync-tests directory
cd sync-tests

# Start the mock server (in a separate terminal)
npm run start-mock

# Run basic functionality tests
npm run test

# Run authentication tests
npm run test:auth

# Run performance tests
npm run test:performance

# Run conflict resolution tests
npm run test:conflicts

# Run error handling tests
npm run test:errors
```

### Running All Tests

```bash
# Run all core tests
npm run test:all

# Run extended tests (conflicts and errors)
npm run test:extended

# Run all tests (core and extended)
npm run test:complete

# Run the all-in-one script (starts mock server, runs tests, starts test page server)
npm run all
```

### Browser-based Testing

```bash
# Start the test page server
npm run serve

# Open your browser to http://localhost:3002/
```

## Test Categories

### Basic Functionality Tests

These tests verify the core functionality of the Sync API:

- Authentication
- Getting sync status
- Creating sync operations
- Getting all operations
- Getting a specific operation
- Updating operations
- Processing pending operations
- Creating batch operations
- Deleting completed operations

### Authentication Tests

These tests verify authentication edge cases:

- Successful authentication
- Failed authentication (wrong password)
- Missing authentication token
- Invalid authentication token
- Expired authentication token
- Token refresh

### Performance Tests

These tests measure API performance under load:

- Response time for sync status
- Concurrent operations creation
- Batch operations performance
- Process operations performance

### Conflict Resolution Tests

These tests verify conflict detection and resolution:

- Creating conflicting operations
- Detecting conflicts during processing
- Resolving conflicts using last-write-wins strategy
- Resolving conflicts using manual merge

### Error Handling Tests

These tests verify proper handling of error conditions:

- Invalid operation format
- Invalid operation ID
- Invalid operation update
- Rate limiting
- Server error handling

## CI/CD Integration

The test suite is integrated with GitHub Actions for continuous integration:

- Tests run automatically on pushes to main/develop branches
- Tests run on pull requests
- Tests run when relevant files are changed
- Performance reports are generated and uploaded as artifacts

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/sync-api-tests.yml` and includes:

1. Running sync service unit tests
2. Running all sync API tests
3. Generating performance reports
4. Uploading test results as artifacts

## Performance Monitoring

The test suite includes tools for monitoring API performance:

```bash
# Generate a performance report
npm run generate-report
```

This will:

1. Run the performance tests
2. Extract performance metrics
3. Save the metrics to a JSON file
4. Generate an HTML report with historical trends
5. Save the report to `performance-reports/performance-report.html`

### Performance Metrics

The following metrics are tracked:

- Sync status response time
- Concurrent operations creation time (total and average)
- Batch operations time (total and per operation)
- Process operations time

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify that the mock server is running
   - Check that the test user credentials are correct
   - Ensure the authentication endpoint is correct

2. **Connection Issues**:
   - Verify that the server is running on the expected port
   - Check for firewall or network issues
   - Ensure the API base URL is correct

3. **Test Failures**:
   - Check the server logs for errors
   - Verify that the API endpoints match the expected format
   - Ensure the test data is valid

### Debugging

For more detailed debugging:

```bash
# Run tests with more verbose output
DEBUG=sync-tests:* npm run test
```

## Extending the Tests

### Adding New Test Cases

1. Create a new test file in the `src` directory
2. Follow the pattern of existing test files
3. Add a new script to `package.json`
4. Update the CI/CD workflow to include the new tests

### Example Test Structure

```javascript
// Import dependencies
import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v2';

// Helper functions
async function apiRequest(endpoint, method, body, token) {
  // Implementation
}

// Test functions
async function testFeature() {
  // Implementation
  return success;
}

// Run all tests
async function runTests() {
  // Run test functions
  await testFeature();
}

// Execute tests
runTests().catch(error => {
  console.error('Error:', error);
});
```

### Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests
2. **Clear Assertions**: Make it clear what each test is verifying
3. **Error Handling**: Handle errors gracefully and provide useful error messages
4. **Cleanup**: Clean up any test data created during the tests
5. **Documentation**: Document the purpose and expected behavior of each test
