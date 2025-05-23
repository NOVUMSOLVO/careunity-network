# CareUnity Sync API Tests

This directory contains test scripts and utilities to verify that the CareUnity Sync API routes are working correctly.

## Overview

The sync API is a critical component of the CareUnity application, enabling offline data synchronization and ensuring data consistency across devices. These test scripts help verify that the sync API endpoints are functioning as expected.

## Test Suite

The test suite is located in the `sync-tests` directory and includes:

- Command-line tests for automated verification
- Browser-based tests for interactive testing
- A mock server for isolated testing
- Utilities for running tests against the real server

## Getting Started

To run the tests:

```bash
# Navigate to the sync-tests directory
cd sync-tests

# Install dependencies
npm install

# Run all tests
npm run all
```

This will start the mock server, run the command-line tests, and start a web server for browser-based testing.

## Documentation

For detailed documentation on the test suite, see the [sync-tests/README.md](sync-tests/README.md) file.

## Sync API Endpoints

The sync API includes the following endpoints:

- `GET /api/v2/sync/status` - Get the current sync status
- `GET /api/v2/sync/operations` - Get all sync operations
- `GET /api/v2/sync/operations/:id` - Get a specific sync operation
- `POST /api/v2/sync/operations` - Create a new sync operation
- `PATCH /api/v2/sync/operations/:id` - Update a sync operation
- `DELETE /api/v2/sync/operations/:id` - Delete a sync operation
- `POST /api/v2/sync/process` - Process pending operations
- `POST /api/v2/sync/batch` - Create a batch of operations
- `DELETE /api/v2/sync/completed` - Delete completed operations

## Why Test the Sync API?

The sync API is essential for:

1. **Offline Support**: Allowing users to work offline and sync when connectivity is restored
2. **Data Consistency**: Ensuring data is consistent across devices
3. **Performance**: Optimizing data transfer between client and server
4. **Reliability**: Handling network interruptions gracefully

Testing these endpoints helps ensure that the sync functionality works correctly in all scenarios.
