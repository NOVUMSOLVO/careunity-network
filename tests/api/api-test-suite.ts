/**
 * API Test Suite
 * 
 * A comprehensive test suite for the CareUnity API endpoints.
 */

import { ApiTestFramework } from './api-test-framework';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test environment configuration
const environment = {
  baseUrl: process.env.API_URL || 'http://localhost:5000/api',
  timeout: 10000,
};

// Initialize test framework
const testFramework = new ApiTestFramework(environment);

// Authentication test cases
const authTestCases = [
  {
    name: 'Login with valid credentials',
    endpoint: '/auth/login',
    method: 'POST' as const,
    body: {
      email: process.env.TEST_USER_EMAIL || 'admin@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    },
    expectedStatus: 200,
    expectedSchema: z.object({
      token: z.string(),
      user: z.object({
        id: z.number(),
        email: z.string().email(),
        role: z.string(),
      }),
    }),
    after: async function() {
      // Store token for subsequent tests
      if (this.response && this.response.token) {
        testFramework.setAuthToken(this.response.token);
      }
    },
  },
  {
    name: 'Login with invalid credentials',
    endpoint: '/auth/login',
    method: 'POST' as const,
    body: {
      email: 'invalid@example.com',
      password: 'wrongpassword',
    },
    expectedStatus: 401,
  },
  {
    name: 'Refresh token',
    endpoint: '/auth/refresh',
    method: 'POST' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      token: z.string(),
    }),
  },
];

// Service User test cases
const serviceUserTestCases = [
  {
    name: 'Get all service users',
    endpoint: '/service-users',
    method: 'GET' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      data: z.array(z.object({
        id: z.number(),
        name: z.string(),
      })),
      meta: z.object({
        total: z.number(),
      }).optional(),
    }),
  },
  {
    name: 'Get service user by ID',
    endpoint: '/service-users/:id',
    method: 'GET' as const,
    params: { id: 1 },
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  {
    name: 'Create service user',
    endpoint: '/service-users',
    method: 'POST' as const,
    auth: true,
    body: {
      name: 'Test User',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      address: '123 Test Street',
      phone: '555-1234',
    },
    expectedStatus: 201,
    expectedSchema: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  {
    name: 'Update service user',
    endpoint: '/service-users/:id',
    method: 'PUT' as const,
    params: { id: 1 },
    auth: true,
    body: {
      name: 'Updated Test User',
      phone: '555-5678',
    },
    expectedStatus: 200,
    expectedSchema: z.object({
      id: z.number(),
      name: z.string(),
    }),
    expectedData: {
      name: 'Updated Test User',
    },
  },
  {
    name: 'Delete service user',
    endpoint: '/service-users/:id',
    method: 'DELETE' as const,
    params: { id: 1 },
    auth: true,
    expectedStatus: 204,
  },
];

// Care Plan test cases
const carePlanTestCases = [
  {
    name: 'Get all care plans',
    endpoint: '/care-plans',
    method: 'GET' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      data: z.array(z.object({
        id: z.number(),
        serviceUserId: z.number(),
        title: z.string(),
      })),
      meta: z.object({
        total: z.number(),
      }).optional(),
    }),
  },
  {
    name: 'Get care plan by ID',
    endpoint: '/care-plans/:id',
    method: 'GET' as const,
    params: { id: 1 },
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      id: z.number(),
      serviceUserId: z.number(),
      title: z.string(),
    }),
  },
  {
    name: 'Create care plan',
    endpoint: '/care-plans',
    method: 'POST' as const,
    auth: true,
    body: {
      serviceUserId: 1,
      title: 'Test Care Plan',
      description: 'This is a test care plan',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    },
    expectedStatus: 201,
    expectedSchema: z.object({
      id: z.number(),
      serviceUserId: z.number(),
      title: z.string(),
    }),
  },
];

// ML Model test cases
const mlModelTestCases = [
  {
    name: 'Get all ML models',
    endpoint: '/ml-models',
    method: 'GET' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      data: z.array(z.object({
        id: z.number(),
        name: z.string(),
        type: z.string(),
      })),
      meta: z.object({
        total: z.number(),
      }).optional(),
    }),
  },
  {
    name: 'Get ML model by ID',
    endpoint: '/ml-models/:id',
    method: 'GET' as const,
    params: { id: 1 },
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      id: z.number(),
      name: z.string(),
      type: z.string(),
    }),
  },
  {
    name: 'Get ML model predictions',
    endpoint: '/ml-models/:id/predictions',
    method: 'POST' as const,
    params: { id: 1 },
    auth: true,
    body: {
      input: {
        features: [1, 2, 3, 4, 5],
      },
    },
    expectedStatus: 200,
    expectedSchema: z.object({
      predictions: z.array(z.number()),
    }),
  },
];

// API Monitoring test cases
const apiMonitoringTestCases = [
  {
    name: 'Get API metrics',
    endpoint: '/api-monitoring/metrics',
    method: 'GET' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      data: z.object({
        totalRequests: z.number(),
        totalErrors: z.number(),
        averageResponseTime: z.number(),
      }),
      error: z.null(),
    }),
  },
  {
    name: 'Get API logs',
    endpoint: '/api-monitoring/logs',
    method: 'GET' as const,
    auth: true,
    expectedStatus: 200,
    expectedSchema: z.object({
      data: z.array(z.object({
        id: z.string(),
        timestamp: z.string(),
        method: z.string(),
        path: z.string(),
        statusCode: z.number().optional(),
      })),
      error: z.null(),
    }),
  },
];

// Run all tests
async function runAllTests() {
  console.log('Starting API tests...');
  
  // Run authentication tests first to get token
  await testFramework.runTests(authTestCases);
  
  // Run other tests
  await testFramework.runTests(serviceUserTestCases);
  await testFramework.runTests(carePlanTestCases);
  await testFramework.runTests(mlModelTestCases);
  await testFramework.runTests(apiMonitoringTestCases);
  
  // Print results
  testFramework.printResults();
  
  // Generate HTML report
  const htmlReport = testFramework.generateHtmlReport();
  const reportPath = path.join(__dirname, '../../reports/api-test-report.html');
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write report to file
  fs.writeFileSync(reportPath, htmlReport);
  console.log(`HTML report generated at: ${reportPath}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}

// Export for use in other files
export { testFramework, runAllTests };
