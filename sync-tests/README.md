# CareUnity Sync API Tests

This directory contains test scripts and utilities to verify that the CareUnity Sync API routes are working correctly.

## Files

- `test-sync-api.js` - Node.js script that tests all sync API endpoints
- `test-sync-api.html` - Browser-based UI for testing sync API endpoints
- `run-sync-tests.js` - Script to start the server and run the tests
- `serve-test-page.js` - Simple Express server to serve the HTML test page
- `simple-sync-test.js` - Simplified test script for sync API endpoints
- `mock-sync-server.cjs` - Mock server that implements the sync API endpoints for testing
- `sync-tests/package.json` - Package configuration for test dependencies

## Prerequisites

Before running the tests, make sure you have:

1. Node.js installed (v14 or later)
2. The CareUnity app dependencies installed (`npm install`)
3. A test user account in the system (username: `testuser`, password: `password123` by default)

## Running the Tests

### Option 1: Run All Tests

The easiest way to test the sync API is to use the all-in-one script that starts the mock server, runs the tests, and starts the test page server:

```bash
# Navigate to the sync-tests directory
cd sync-tests

# Install dependencies
npm install

# Run all tests
npm run all
```

This will:
1. Start the mock server
2. Run the command-line tests
3. Start the test page server
4. Keep both servers running for browser-based testing

### Option 2: Using the Mock Server

If you want more control, you can run each component separately:

```bash
# Navigate to the sync-tests directory
cd sync-tests

# Install dependencies
npm install

# Start the mock server
npm run start-mock

# In a separate terminal, run the simplified test script
npm run test
```

### Option 3: Command Line Tests with the Real Server

To run the command line tests against the real server:

```bash
# Make sure the server is running first
npm run dev

# In a separate terminal, run the tests
node test-sync-api.js
```

Alternatively, you can use the helper script that will check if the server is running and start it if needed:

```bash
node run-sync-tests.js
```

### Option 4: Browser-Based Tests

To use the browser-based test interface:

```bash
# Navigate to the sync-tests directory
cd sync-tests

# Install dependencies
npm install

# Start the test page server
npm run serve

# Open your browser to http://localhost:3002/
```

You can use the browser-based tests with either the mock server or the real server - just make sure one of them is running on port 5000.

Then follow these steps in the browser:

1. Enter your username and password and click "Login"
2. Once authenticated, use the buttons to test different sync API endpoints
3. View the results in the result box

## Modifying the Tests

### Authentication

If you need to use different test credentials, modify the following values:

- In `test-sync-api.js`: Update `TEST_USERNAME` and `TEST_PASSWORD`
- In `test-sync-api.html`: Update the default values in the username and password input fields

### API Endpoints

If you need to test different endpoints or modify the test data:

- In `test-sync-api.js`: Modify the test functions
- In `test-sync-api.html`: Update the event listeners for the test buttons

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Verify that the test user exists in the system
2. Check that the password is correct
3. Ensure the server is running and accessible

### Server Connection Issues

If the tests can't connect to the server:

1. Make sure the server is running on port 5000
2. Check for any CORS issues if testing from a different domain
3. Verify that the API base URL is correct

### API Response Issues

If the API returns unexpected responses:

1. Check the server logs for any errors
2. Verify that the request payload matches the expected format
3. Ensure that the authentication token is being sent correctly

### Module Type Issues

If you encounter module type errors:

1. Make sure you're using the correct file extensions (`.mjs` for ES modules, `.cjs` for CommonJS)
2. Check that the `type` field in package.json is set correctly
3. Use the appropriate import/require syntax based on the module type

## Notes

- The mock server uses in-memory storage for sync operations, so data will be lost when the server restarts
- The tests simulate API calls and may not reflect actual production behavior
- Some tests may fail if the server is configured differently than expected

## Mock Server vs. Real Server

### Mock Server
- Standalone implementation that doesn't require the full CareUnity app
- Uses in-memory storage for sync operations
- Simulates API behavior with predictable responses
- Great for isolated testing of client-side code

### Real Server
- Uses the actual CareUnity app implementation
- Requires the full server environment to be set up
- Tests the real API behavior
- Better for integration testing
