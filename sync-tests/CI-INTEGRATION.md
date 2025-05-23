# Sync API CI/CD Integration Guide

This document provides instructions for integrating the Sync API tests into your CI/CD pipeline.

## Overview

The Sync API tests are designed to verify the functionality of the CareUnity Sync API, which is critical for offline data synchronization. The test suite includes:

1. Basic functionality tests
2. Authentication edge cases and error handling
3. Performance tests under load
4. Browser-based interactive tests

## Running Tests Locally

Before integrating with CI/CD, you should run the tests locally to ensure they pass:

```bash
# Install dependencies
npm install
cd sync-tests
npm install

# Run all tests
npm run test:all

# Or run individual test suites
npm run test        # Basic functionality tests
npm run test:auth   # Authentication tests
npm run test:performance  # Performance tests
```

## GitHub Actions Integration

We've set up a GitHub Actions workflow in `.github/workflows/sync-api-tests.yml` that automatically runs the Sync API tests when changes are made to relevant files.

The workflow:
1. Runs on pushes to main/develop branches and pull requests
2. Triggers only when relevant files are changed
3. Runs both the unit tests for the sync service and the API tests

### Workflow Configuration

The workflow is configured to:

- Run on Node.js 18.x
- Install dependencies for both the main project and the sync-tests directory
- Run the sync service unit tests
- Start the mock server and run the API tests
- Upload test results as artifacts

### Customizing the Workflow

You may need to customize the workflow based on your specific CI/CD environment:

1. **Environment Variables**: Add any necessary environment variables in the workflow file:

   ```yaml
   env:
     TEST_USERNAME: testuser
     TEST_PASSWORD: password123
   ```

2. **Database Setup**: If your tests require a database, add steps to set up a test database:

   ```yaml
   - name: Set up PostgreSQL
     uses: harmon758/postgresql-action@v1
     with:
       postgresql version: '14'
       postgresql db: test_db
       postgresql user: test_user
       postgresql password: test_password
   ```

3. **Caching**: Optimize build times by caching dependencies:

   ```yaml
   - name: Cache Node modules
     uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
       restore-keys: |
         ${{ runner.os }}-node-
   ```

## Other CI/CD Platforms

### GitLab CI

For GitLab CI, create a `.gitlab-ci.yml` file:

```yaml
stages:
  - test

sync-api-tests:
  stage: test
  image: node:18
  script:
    - npm ci
    - cd sync-tests
    - npm ci
    - npm run ci
  artifacts:
    paths:
      - junit-report.xml
    reports:
      junit: junit-report.xml
```

### Azure DevOps

For Azure DevOps, create an `azure-pipelines.yml` file:

```yaml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - 'client/src/services/**'
      - 'client/src/lib/**'
      - 'server/routes/sync.ts'
      - 'sync-tests/**'

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'Install dependencies'

- script: cd sync-tests && npm ci
  displayName: 'Install sync-tests dependencies'

- script: npm run test:sync
  displayName: 'Run sync service unit tests'

- script: cd sync-tests && npm run ci
  displayName: 'Run sync API tests'

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/junit-report.xml'
    mergeTestResults: true
    testRunTitle: 'Sync API Tests'
  condition: succeededOrFailed()
```

## Best Practices

1. **Run Tests on Every PR**: Configure your CI/CD to run tests on every pull request to catch issues early.

2. **Test in Isolation**: The mock server allows testing the Sync API in isolation without external dependencies.

3. **Performance Monitoring**: Use the performance tests to monitor API performance over time and detect regressions.

4. **Test Coverage**: Aim for high test coverage of the Sync API functionality.

5. **Automated Reporting**: Configure your CI/CD to generate and publish test reports.

## Troubleshooting

If tests fail in CI but pass locally:

1. Check environment variables and configuration differences
2. Ensure all dependencies are installed in CI
3. Look for timing issues (CI environments may be slower)
4. Check for network connectivity issues in CI

## Expanding Test Coverage

To add more tests:

1. Create new test files in the `sync-tests/src` directory
2. Add new test scripts to `package.json`
3. Update the `run-all-tests.js` script to include your new tests
4. Update the CI/CD configuration to run the new tests
