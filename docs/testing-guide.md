# CareUnity Testing Guide

This document provides an overview of the testing approach for the CareUnity application, including how to run tests locally and how the CI/CD pipeline is configured for automated testing.

## Testing Approach

The CareUnity application uses a comprehensive testing strategy that includes:

1. **Unit Tests**: Test individual components and functions in isolation
2. **Integration Tests**: Test interactions between components and services
3. **API Tests**: Test API endpoints and their responses
4. **End-to-End Tests**: Test complete user flows from the UI perspective
5. **Visual Regression Tests**: Ensure UI consistency across changes
6. **Performance Tests**: Measure and monitor application performance

## Test Directory Structure

```
careunity/
├── client/src/
│   ├── __tests__/           # Client-side unit tests
│   └── components/
│       └── __tests__/       # Component-specific tests
├── server/
│   ├── tests/               # Server-side tests
│   │   ├── unit/            # Server unit tests
│   │   ├── integration/     # Integration tests
│   │   └── api/             # API tests
├── e2e-tests/               # End-to-end tests
│   ├── critical-flows.spec.ts
│   └── visual-regression.spec.ts
├── sync-tests/              # Sync API tests
└── scripts/
    └── generate-test-data.ts # Test data generation
```

## Running Tests Locally

### Prerequisites

Before running tests, ensure you have:

1. Node.js (v14 or later) installed
2. All dependencies installed (`npm install`)
3. A local database instance (for integration tests)
4. Environment variables configured (see `.env.example`)

### Unit Tests

Run client and server unit tests:

```bash
# Run all unit tests
npm run test

# Run client-side tests only
npm run test:client

# Run server-side tests only
npm run test:server

# Run with coverage report
npm run test:coverage
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run sync API tests
npm run test:sync:all
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run visual regression tests
npx playwright test e2e-tests/visual-regression.spec.ts
```

### Generate Test Data

```bash
# Generate test data for local development/testing
npm run generate-test-data
```

## CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions and runs the following jobs:

1. **Unit Tests**: Runs all unit tests and collects coverage reports
2. **Integration Tests**: Sets up a test database, generates test data, and runs integration tests
3. **End-to-End Tests**: Builds the application and runs E2E tests with Playwright
4. **Visual Regression Tests**: Runs visual regression tests and compares screenshots

The pipeline is triggered on:
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

## Writing Tests

### Unit Tests

Unit tests use Vitest and should follow these guidelines:

- Test files should be named `*.test.ts` or `*.test.tsx`
- Each test should focus on a single unit of functionality
- Use mocks for external dependencies
- Aim for high coverage of critical code paths

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotalHours } from '../utils/time-utils';

describe('calculateTotalHours', () => {
  it('should calculate hours correctly for same day', () => {
    const start = new Date('2023-01-01T09:00:00');
    const end = new Date('2023-01-01T17:00:00');
    expect(calculateTotalHours(start, end)).toBe(8);
  });
});
```

### End-to-End Tests

E2E tests use Playwright and should:

- Focus on critical user flows
- Be resilient to minor UI changes
- Use test data that's predictable and isolated
- Include assertions that verify the expected outcome

Example:

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Test Data

The application uses generated test data for testing purposes. The test data generator (`scripts/generate-test-data.ts`) creates realistic data for:

- Users with different roles
- Service users
- Care plans
- Care allocations
- Visits
- Documents

To customize the test data generation, modify the configuration in the generator script.

## Troubleshooting

### Common Issues

1. **Tests failing due to database connection**:
   - Ensure the database is running and accessible
   - Check that environment variables are correctly set

2. **Visual regression tests failing**:
   - Review the screenshot differences to determine if they're expected changes
   - Update baseline screenshots if the UI has intentionally changed

3. **Flaky E2E tests**:
   - Increase timeouts for slow operations
   - Add more explicit waiting conditions
   - Ensure test isolation (tests should not depend on each other)

For more help, contact the development team or open an issue on GitHub.
