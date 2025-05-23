# CareUnity CI/CD Pipeline Documentation

This document provides an overview of the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the CareUnity application.

## Overview

The CareUnity CI/CD pipeline automates the process of testing, building, and deploying the application. It ensures that code changes are properly tested before they are deployed to production, reducing the risk of introducing bugs or regressions.

## Pipeline Components

The CI/CD pipeline consists of the following components:

1. **GitHub Actions**: Used for automating workflows
2. **Vitest**: Used for unit and integration testing
3. **Playwright**: Used for end-to-end testing
4. **ESLint**: Used for code quality checks
5. **Postman/Newman**: Used for API testing
6. **AWS**: Used for deployment

## Workflow Files

The CI/CD pipeline is defined in the following workflow files:

1. **main.yml**: The main CI/CD pipeline for the web application
2. **mobile.yml**: CI/CD pipeline for the mobile app
3. **sync-api-tests.yml**: Tests for the sync API
4. **visits-api-tests.yml**: Tests for the visits API

## Pipeline Stages

### 1. Lint

The lint stage checks the code for style and quality issues using ESLint. It ensures that the code follows the project's coding standards.

```yaml
lint:
  name: Lint
  runs-on: ubuntu-latest
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint
```

### 2. Unit Tests

The unit tests stage runs the unit tests for the application using Vitest. It ensures that individual components work as expected.

```yaml
test:
  name: Unit Tests
  runs-on: ubuntu-latest
  needs: lint
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run visits API tests
      run: npx vitest run server/tests/visits.test.ts
```

### 3. Build

The build stage compiles the application code and creates the production build. It ensures that the application can be built successfully.

```yaml
build:
  name: Build
  runs-on: ubuntu-latest
  needs: test
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
```

### 4. End-to-End Tests

The end-to-end tests stage runs the end-to-end tests for the application using Playwright. It ensures that the application works as expected from a user's perspective.

```yaml
e2e-tests:
  name: End-to-End Tests
  runs-on: ubuntu-latest
  needs: build
  
  services:
    postgres:
      image: postgres:14
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: careunity_test
      ports:
        - 5432:5432
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Setup database
      run: npm run db:setup:test
    
    - name: Start server
      run: npm run start:test &
    
    - name: Wait for server to start
      run: npx wait-on http://localhost:3000
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run visits E2E tests
      run: npx playwright test e2e/visits.spec.ts
```

### 5. Deploy to Staging

The deploy to staging stage deploys the application to the staging environment. It allows for testing the application in a production-like environment before deploying to production.

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: e2e-tests
  if: github.ref == 'refs/heads/develop'
  environment: staging
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist/
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: eu-west-2
    
    - name: Deploy to EC2
      run: |
        echo "Deploying to staging server..."
        # Deployment script
```

### 6. Deploy to Production

The deploy to production stage deploys the application to the production environment. It only runs when changes are pushed to the main branch.

```yaml
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: e2e-tests
  if: github.ref == 'refs/heads/main'
  environment: production
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist/
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: eu-west-2
    
    - name: Deploy to EC2
      run: |
        echo "Deploying to production server..."
        # Deployment script
```

## API-Specific Workflows

### Visits API Tests

The visits API tests workflow runs tests specifically for the visits API. It ensures that the visits API works as expected.

```yaml
name: Visits API Tests

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'server/routes/visits.ts'
      - 'shared/api-client/services/visit-api.ts'
      - 'client/src/hooks/use-visits-api.ts'
      - 'client/src/pages/visits/**'
      - 'server/tests/visits.test.ts'
      - '.github/workflows/visits-api-tests.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: careunity_test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run visits API unit tests
        run: npx vitest run server/tests/visits.test.ts
      
      - name: Run visits API integration tests
        run: |
          npm run start:test &
          npx wait-on http://localhost:3000
          npx newman run server/tests/postman/visits-api.postman_collection.json
```

## Running the Pipeline Locally

You can run parts of the CI/CD pipeline locally to test your changes before pushing them to GitHub:

1. **Lint**: `npm run lint`
2. **Unit Tests**: `npm test`
3. **Build**: `npm run build`
4. **E2E Tests**: `npm run test:e2e`
5. **Visits API Tests**: `npx vitest run server/tests/visits.test.ts`

## Troubleshooting

If the CI/CD pipeline fails, you can check the GitHub Actions logs to see what went wrong. Common issues include:

1. **Lint errors**: Fix the code style issues reported by ESLint
2. **Test failures**: Fix the failing tests
3. **Build errors**: Fix the build errors
4. **E2E test failures**: Fix the failing end-to-end tests
5. **Deployment errors**: Check the deployment logs for errors

## Adding New Tests

When adding new features to the application, you should also add tests for those features. Here's how to add tests for different parts of the application:

1. **Unit Tests**: Add tests to the appropriate test file in the `client/src` or `server` directories
2. **E2E Tests**: Add tests to the appropriate test file in the `e2e` directory
3. **API Tests**: Add tests to the appropriate test file in the `server/tests` directory or create a new Postman collection

## Conclusion

The CareUnity CI/CD pipeline automates the process of testing, building, and deploying the application. It ensures that code changes are properly tested before they are deployed to production, reducing the risk of introducing bugs or regressions.
