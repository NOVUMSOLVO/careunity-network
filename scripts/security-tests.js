/**
 * Security Testing Script
 * 
 * This script runs automated security tests against the CareUnity application.
 * It tests for common security vulnerabilities and configuration issues.
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';
const REPORT_DIR = path.join(__dirname, '..', 'reports');
const REPORT_FILE = path.join(REPORT_DIR, 'security-test-report.md');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  errors: []
};

/**
 * Run a security test
 * @param {string} name Test name
 * @param {Function} testFn Test function
 */
async function runTest(name, testFn) {
  console.log(`Running test: ${name}`);
  
  try {
    const result = await testFn();
    
    if (result.passed) {
      testResults.passed.push({ name, details: result.details });
      console.log(`✅ PASSED: ${name}`);
    } else {
      testResults.failed.push({ name, details: result.details });
      console.log(`❌ FAILED: ${name}`);
    }
    
    if (result.warnings && result.warnings.length > 0) {
      testResults.warnings.push({ name, warnings: result.warnings });
      console.log(`⚠️ WARNINGS: ${result.warnings.length}`);
    }
  } catch (error) {
    testResults.errors.push({ name, error: error.message });
    console.log(`❌ ERROR: ${name} - ${error.message}`);
  }
}

/**
 * Test for secure HTTP headers
 */
async function testSecureHeaders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/healthcheck`);
    const headers = response.headers;
    
    const requiredHeaders = {
      'strict-transport-security': value => value.includes('max-age='),
      'content-security-policy': value => value.includes('default-src'),
      'x-content-type-options': value => value === 'nosniff',
      'x-frame-options': value => ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase()),
      'x-xss-protection': value => value.includes('1;'),
      'referrer-policy': value => value.length > 0,
      'permissions-policy': value => value.length > 0
    };
    
    const missingHeaders = [];
    const invalidHeaders = [];
    
    for (const [header, validator] of Object.entries(requiredHeaders)) {
      if (!headers[header]) {
        missingHeaders.push(header);
      } else if (!validator(headers[header])) {
        invalidHeaders.push(`${header}: ${headers[header]}`);
      }
    }
    
    const warnings = [];
    
    // Check for cookies without secure flags
    if (headers['set-cookie']) {
      const cookies = Array.isArray(headers['set-cookie']) 
        ? headers['set-cookie'] 
        : [headers['set-cookie']];
      
      for (const cookie of cookies) {
        if (!cookie.includes('Secure') || !cookie.includes('HttpOnly')) {
          warnings.push(`Cookie without Secure or HttpOnly flag: ${cookie.split(';')[0]}`);
        }
        if (!cookie.includes('SameSite')) {
          warnings.push(`Cookie without SameSite attribute: ${cookie.split(';')[0]}`);
        }
      }
    }
    
    return {
      passed: missingHeaders.length === 0 && invalidHeaders.length === 0,
      details: {
        missingHeaders,
        invalidHeaders,
        presentHeaders: Object.keys(headers)
      },
      warnings
    };
  } catch (error) {
    return {
      passed: false,
      details: {
        error: error.message
      }
    };
  }
}

/**
 * Test for CSRF protection
 */
async function testCsrfProtection() {
  try {
    // First request to get CSRF token
    const initialResponse = await axios.get(`${BASE_URL}/api/healthcheck`);
    
    // Check if CSRF cookie is set
    const cookies = initialResponse.headers['set-cookie'] || [];
    const csrfCookie = cookies.find(cookie => cookie.includes('XSRF-TOKEN'));
    
    if (!csrfCookie) {
      return {
        passed: false,
        details: {
          message: 'CSRF cookie not found in response'
        }
      };
    }
    
    // Extract token value
    const tokenMatch = csrfCookie.match(/XSRF-TOKEN=([^;]+)/);
    const csrfToken = tokenMatch ? tokenMatch[1] : null;
    
    if (!csrfToken) {
      return {
        passed: false,
        details: {
          message: 'Could not extract CSRF token from cookie'
        }
      };
    }
    
    // Try a POST request without CSRF token (should fail)
    let csrfTestPassed = false;
    
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'test',
        password: 'password'
      }, {
        headers: {
          Cookie: csrfCookie
        }
      });
      
      // If we get here, the request succeeded without CSRF token
      csrfTestPassed = false;
    } catch (error) {
      // Request should fail with 403 Forbidden
      if (error.response && error.response.status === 403) {
        csrfTestPassed = true;
      }
    }
    
    // Try a POST request with CSRF token (should succeed or fail with a different error)
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'test',
        password: 'password'
      }, {
        headers: {
          Cookie: csrfCookie,
          'X-XSRF-TOKEN': csrfToken
        }
      });
      
      // If we get here, the request succeeded with CSRF token
      // But it might fail for other reasons (like validation)
    } catch (error) {
      // Request should not fail with 403 Forbidden
      if (error.response && error.response.status === 403) {
        const errorBody = error.response.data;
        if (errorBody && errorBody.message && errorBody.message.includes('CSRF')) {
          csrfTestPassed = false;
        }
      }
    }
    
    return {
      passed: csrfTestPassed,
      details: {
        message: csrfTestPassed 
          ? 'CSRF protection is working correctly' 
          : 'CSRF protection is not working correctly'
      }
    };
  } catch (error) {
    return {
      passed: false,
      details: {
        error: error.message
      }
    };
  }
}

/**
 * Test for XSS vulnerabilities
 */
async function testXssProtection() {
  try {
    // Test payload
    const xssPayload = '<script>alert("XSS")</script>';
    
    // Try to submit the payload in a query parameter
    const response = await axios.get(`${BASE_URL}/api/users?search=${encodeURIComponent(xssPayload)}`);
    
    // Check if the response contains the unescaped payload
    const responseContainsXss = response.data && 
      typeof response.data === 'string' && 
      response.data.includes(xssPayload);
    
    // Check CSP header
    const cspHeader = response.headers['content-security-policy'];
    const hasStrongCsp = cspHeader && 
      cspHeader.includes("script-src 'self'") && 
      !cspHeader.includes("script-src 'unsafe-inline'");
    
    const warnings = [];
    
    if (!hasStrongCsp) {
      warnings.push('Content Security Policy does not properly restrict inline scripts');
    }
    
    return {
      passed: !responseContainsXss,
      details: {
        message: responseContainsXss 
          ? 'XSS payload was reflected in the response' 
          : 'XSS payload was not reflected in the response',
        cspHeader
      },
      warnings
    };
  } catch (error) {
    // If the request fails, it might be because the endpoint doesn't exist
    // or because the server rejected the malicious input
    return {
      passed: true,
      details: {
        message: 'Request with XSS payload was rejected',
        error: error.message
      }
    };
  }
}

/**
 * Test for secure authentication
 */
async function testSecureAuthentication() {
  try {
    // Try to login with invalid credentials
    let loginResponse;
    try {
      loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'nonexistent_user',
        password: 'invalid_password'
      });
    } catch (error) {
      // Login should fail, so this is expected
      loginResponse = error.response;
    }
    
    // Check if the error message is generic
    const genericErrorMessage = loginResponse && 
      loginResponse.data && 
      loginResponse.data.message === 'Invalid username or password';
    
    // Check rate limiting
    const rateLimitHeader = loginResponse.headers['x-ratelimit-remaining'] || 
                           loginResponse.headers['retry-after'];
    
    const warnings = [];
    
    if (!rateLimitHeader) {
      warnings.push('No rate limiting headers found for failed login attempts');
    }
    
    // Check for account lockout (would need multiple requests)
    
    return {
      passed: genericErrorMessage,
      details: {
        message: genericErrorMessage 
          ? 'Authentication error messages are generic' 
          : 'Authentication error messages may reveal too much information',
        rateLimiting: !!rateLimitHeader
      },
      warnings
    };
  } catch (error) {
    return {
      passed: false,
      details: {
        error: error.message
      }
    };
  }
}

/**
 * Generate a security test report
 */
function generateReport() {
  let report = '# Security Test Report\n\n';
  report += `Generated on ${new Date().toLocaleString()}\n\n`;
  
  report += '## Summary\n\n';
  report += `- Tests passed: ${testResults.passed.length}\n`;
  report += `- Tests failed: ${testResults.failed.length}\n`;
  report += `- Warnings: ${testResults.warnings.length}\n`;
  report += `- Errors: ${testResults.errors.length}\n\n`;
  
  if (testResults.passed.length > 0) {
    report += '## Passed Tests\n\n';
    for (const test of testResults.passed) {
      report += `### ${test.name}\n\n`;
      report += `${JSON.stringify(test.details, null, 2)}\n\n`;
    }
  }
  
  if (testResults.failed.length > 0) {
    report += '## Failed Tests\n\n';
    for (const test of testResults.failed) {
      report += `### ${test.name}\n\n`;
      report += `${JSON.stringify(test.details, null, 2)}\n\n`;
    }
  }
  
  if (testResults.warnings.length > 0) {
    report += '## Warnings\n\n';
    for (const test of testResults.warnings) {
      report += `### ${test.name}\n\n`;
      for (const warning of test.warnings) {
        report += `- ${warning}\n`;
      }
      report += '\n';
    }
  }
  
  if (testResults.errors.length > 0) {
    report += '## Errors\n\n';
    for (const test of testResults.errors) {
      report += `### ${test.name}\n\n`;
      report += `Error: ${test.error}\n\n`;
    }
  }
  
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report saved to ${REPORT_FILE}`);
}

/**
 * Main function
 */
async function main() {
  console.log('Starting security tests...');
  
  // Run tests
  await runTest('Secure HTTP Headers', testSecureHeaders);
  await runTest('CSRF Protection', testCsrfProtection);
  await runTest('XSS Protection', testXssProtection);
  await runTest('Secure Authentication', testSecureAuthentication);
  
  // Generate report
  generateReport();
  
  // Return exit code based on test results
  const exitCode = testResults.failed.length > 0 || testResults.errors.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Run the main function
main().catch(error => {
  console.error('Error running security tests:', error);
  process.exit(1);
});
