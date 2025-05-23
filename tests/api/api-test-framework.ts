/**
 * API Testing Framework
 * 
 * A comprehensive framework for testing API endpoints with support for:
 * - Authentication
 * - Request validation
 * - Response validation
 * - Performance testing
 * - Error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import { performance } from 'perf_hooks';
import { expect } from 'chai';

// Test environment configuration
interface TestEnvironment {
  baseUrl: string;
  authToken?: string;
  timeout?: number;
}

// Test case configuration
interface TestCase {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
  expectedStatus?: number;
  expectedSchema?: z.ZodType<any>;
  expectedData?: any;
  timeout?: number;
  before?: () => Promise<void>;
  after?: () => Promise<void>;
}

// Test result
interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  success: boolean;
  error?: string;
  response?: any;
}

/**
 * API Test Framework
 */
export class ApiTestFramework {
  private client: AxiosInstance;
  private environment: TestEnvironment;
  private results: TestResult[] = [];
  
  /**
   * Create a new API test framework
   */
  constructor(environment: TestEnvironment) {
    this.environment = environment;
    
    // Create Axios client
    this.client = axios.create({
      baseURL: environment.baseUrl,
      timeout: environment.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Add authentication token if provided
    if (environment.authToken) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${environment.authToken}`;
    }
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.environment.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Run a single test case
   */
  public async runTest(testCase: TestCase): Promise<TestResult> {
    console.log(`Running test: ${testCase.name}`);
    
    // Initialize test result
    const result: TestResult = {
      name: testCase.name,
      endpoint: testCase.endpoint,
      method: testCase.method,
      status: 0,
      duration: 0,
      success: false,
    };
    
    try {
      // Run before hook if provided
      if (testCase.before) {
        await testCase.before();
      }
      
      // Prepare request config
      const config: AxiosRequestConfig = {
        method: testCase.method,
        url: testCase.endpoint,
        params: testCase.query,
        data: testCase.body,
        headers: testCase.headers,
        timeout: testCase.timeout || this.environment.timeout,
      };
      
      // Add authentication if required
      if (testCase.auth && this.environment.authToken) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${this.environment.authToken}`,
        };
      }
      
      // Replace URL parameters
      if (testCase.params) {
        let url = testCase.endpoint;
        for (const [key, value] of Object.entries(testCase.params)) {
          url = url.replace(`:${key}`, String(value));
        }
        config.url = url;
      }
      
      // Measure performance
      const startTime = performance.now();
      
      // Send request
      const response = await this.client.request(config);
      
      // Calculate duration
      const endTime = performance.now();
      result.duration = endTime - startTime;
      
      // Update result
      result.status = response.status;
      result.response = response.data;
      
      // Validate response status
      if (testCase.expectedStatus) {
        expect(response.status).to.equal(testCase.expectedStatus);
      } else {
        expect(response.status).to.be.within(200, 299);
      }
      
      // Validate response schema
      if (testCase.expectedSchema) {
        const validationResult = testCase.expectedSchema.safeParse(response.data);
        expect(validationResult.success).to.be.true;
      }
      
      // Validate response data
      if (testCase.expectedData) {
        if (typeof testCase.expectedData === 'function') {
          expect(testCase.expectedData(response.data)).to.be.true;
        } else {
          expect(response.data).to.deep.include(testCase.expectedData);
        }
      }
      
      // Mark test as successful
      result.success = true;
      
      // Run after hook if provided
      if (testCase.after) {
        await testCase.after();
      }
    } catch (error: any) {
      // Handle test failure
      result.success = false;
      result.error = error.message;
      
      if (error.response) {
        result.status = error.response.status;
        result.response = error.response.data;
      }
      
      console.error(`Test failed: ${testCase.name}`);
      console.error(error);
    }
    
    // Add result to results array
    this.results.push(result);
    
    return result;
  }
  
  /**
   * Run multiple test cases
   */
  public async runTests(testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.runTest(testCase);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Get test results
   */
  public getResults(): TestResult[] {
    return this.results;
  }
  
  /**
   * Print test results
   */
  public printResults(): void {
    console.log('\n=== API Test Results ===\n');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`- ${result.name} (${result.method} ${result.endpoint}): ${result.error}`);
        });
    }
    
    console.log('\nPerformance:');
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
    
    const slowestTest = this.results.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    console.log(`Slowest Test: ${slowestTest.name} (${slowestTest.duration.toFixed(2)}ms)`);
    
    const fastestTest = this.results.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    console.log(`Fastest Test: ${fastestTest.name} (${fastestTest.duration.toFixed(2)}ms)`);
  }
  
  /**
   * Generate HTML report
   */
  public generateHtmlReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests * 100).toFixed(2);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { margin-bottom: 20px; }
          .success { color: green; }
          .failure { color: red; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .method-get { background-color: #e7f5fe; }
          .method-post { background-color: #e7ffe7; }
          .method-put { background-color: #fff9e0; }
          .method-patch { background-color: #f9e0ff; }
          .method-delete { background-color: #ffe7e7; }
        </style>
      </head>
      <body>
        <h1>API Test Results</h1>
        
        <div class="summary">
          <p>Total Tests: <strong>${totalTests}</strong></p>
          <p>Passed: <strong class="success">${passedTests}</strong></p>
          <p>Failed: <strong class="failure">${failedTests}</strong></p>
          <p>Success Rate: <strong>${successRate}%</strong></p>
        </div>
        
        <h2>Test Details</h2>
        <table>
          <tr>
            <th>Test Name</th>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Status</th>
            <th>Duration (ms)</th>
            <th>Result</th>
          </tr>
    `;
    
    this.results.forEach(result => {
      html += `
        <tr class="method-${result.method.toLowerCase()}">
          <td>${result.name}</td>
          <td>${result.endpoint}</td>
          <td>${result.method}</td>
          <td>${result.status}</td>
          <td>${result.duration.toFixed(2)}</td>
          <td class="${result.success ? 'success' : 'failure'}">${result.success ? 'PASS' : 'FAIL'}</td>
        </tr>
      `;
    });
    
    html += `
        </table>
      </body>
      </html>
    `;
    
    return html;
  }
}
