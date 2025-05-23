/**
 * Penetration Testing Script
 * 
 * This script performs basic penetration testing against the CareUnity application.
 * It tests for common vulnerabilities and security misconfigurations.
 * 
 * IMPORTANT: This script should only be run in a controlled environment with proper authorization.
 * Running penetration tests without authorization may be illegal and unethical.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const { program } = require('commander');

// Configuration
const REPORT_DIR = path.join(__dirname, '..', 'reports');
const REPORT_FILE = path.join(REPORT_DIR, 'pentest-report.md');
const VULNERABILITIES_FILE = path.join(__dirname, 'data', 'vulnerabilities.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Test results
const testResults = {
  vulnerabilities: [],
  findings: [],
  recommendations: []
};

// Command line options
program
  .option('-u, --url <url>', 'Target URL', 'http://localhost:5000')
  .option('-t, --timeout <timeout>', 'Request timeout in milliseconds', 5000)
  .option('-c, --concurrency <concurrency>', 'Number of concurrent requests', 5)
  .option('-v, --verbose', 'Verbose output')
  .option('--no-report', 'Do not generate a report')
  .option('--no-banner', 'Do not display the banner')
  .parse(process.argv);

const options = program.opts();

// Display banner
if (options.banner) {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║             CareUnity Penetration Test            ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  
  Target: ${options.url}
  Timeout: ${options.timeout}ms
  Concurrency: ${options.concurrency}
  
  IMPORTANT: This tool should only be used with proper authorization.
  
  `);
}

/**
 * Test for open ports and services
 */
async function testOpenPorts() {
  try {
    console.log('Testing for open ports and services...');
    
    // Extract hostname from URL
    const url = new URL(options.url);
    const hostname = url.hostname;
    
    // Run nmap if available
    try {
      const nmapOutput = execSync(`nmap -F ${hostname}`, { timeout: 30000 }).toString();
      
      // Parse nmap output
      const openPorts = [];
      const lines = nmapOutput.split('\n');
      
      for (const line of lines) {
        if (line.includes('open')) {
          openPorts.push(line.trim());
        }
      }
      
      if (openPorts.length > 0) {
        testResults.vulnerabilities.push({
          name: 'Open Ports',
          severity: 'medium',
          description: 'The server has open ports that may expose unnecessary services.',
          details: openPorts,
          recommendation: 'Close unnecessary ports and restrict access to required services only.'
        });
      }
      
      return {
        success: true,
        openPorts
      };
    } catch (error) {
      console.log('Nmap not available or failed. Skipping port scan.');
      return {
        success: false,
        error: error.message
      };
    }
  } catch (error) {
    console.error('Error testing open ports:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test for SSL/TLS vulnerabilities
 */
async function testSslTls() {
  try {
    console.log('Testing for SSL/TLS vulnerabilities...');
    
    // Extract hostname from URL
    const url = new URL(options.url);
    const hostname = url.hostname;
    
    // Run sslyze if available
    try {
      const sslyzeOutput = execSync(`sslyze --regular ${hostname}`, { timeout: 60000 }).toString();
      
      // Check for vulnerabilities
      const vulnerabilities = [];
      
      if (sslyzeOutput.includes('SSLv2')) {
        vulnerabilities.push('SSLv2 is supported (insecure)');
      }
      
      if (sslyzeOutput.includes('SSLv3')) {
        vulnerabilities.push('SSLv3 is supported (insecure)');
      }
      
      if (sslyzeOutput.includes('TLSv1.0')) {
        vulnerabilities.push('TLSv1.0 is supported (outdated)');
      }
      
      if (sslyzeOutput.includes('ROBOT')) {
        vulnerabilities.push('Vulnerable to ROBOT attack');
      }
      
      if (sslyzeOutput.includes('HEARTBLEED')) {
        vulnerabilities.push('Vulnerable to Heartbleed');
      }
      
      if (vulnerabilities.length > 0) {
        testResults.vulnerabilities.push({
          name: 'SSL/TLS Vulnerabilities',
          severity: 'high',
          description: 'The server has SSL/TLS vulnerabilities that may allow attacks.',
          details: vulnerabilities,
          recommendation: 'Update SSL/TLS configuration to use only secure protocols and ciphers.'
        });
      }
      
      return {
        success: true,
        vulnerabilities
      };
    } catch (error) {
      console.log('sslyze not available or failed. Skipping SSL/TLS test.');
      return {
        success: false,
        error: error.message
      };
    }
  } catch (error) {
    console.error('Error testing SSL/TLS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test for common security headers
 */
async function testSecurityHeaders() {
  try {
    console.log('Testing for security headers...');
    
    const response = await axios.get(options.url, {
      timeout: options.timeout,
      validateStatus: () => true
    });
    
    const headers = response.headers;
    const missingHeaders = [];
    
    // Check for important security headers
    if (!headers['strict-transport-security']) {
      missingHeaders.push('Strict-Transport-Security (HSTS)');
    }
    
    if (!headers['content-security-policy']) {
      missingHeaders.push('Content-Security-Policy (CSP)');
    }
    
    if (!headers['x-content-type-options']) {
      missingHeaders.push('X-Content-Type-Options');
    }
    
    if (!headers['x-frame-options']) {
      missingHeaders.push('X-Frame-Options');
    }
    
    if (!headers['x-xss-protection']) {
      missingHeaders.push('X-XSS-Protection');
    }
    
    if (!headers['referrer-policy']) {
      missingHeaders.push('Referrer-Policy');
    }
    
    if (missingHeaders.length > 0) {
      testResults.vulnerabilities.push({
        name: 'Missing Security Headers',
        severity: 'medium',
        description: 'The server is missing important security headers that help protect against common attacks.',
        details: missingHeaders,
        recommendation: 'Add the missing security headers to the server responses.'
      });
    }
    
    return {
      success: true,
      missingHeaders,
      presentHeaders: Object.keys(headers)
    };
  } catch (error) {
    console.error('Error testing security headers:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test for common web vulnerabilities
 */
async function testWebVulnerabilities() {
  try {
    console.log('Testing for common web vulnerabilities...');
    
    const vulnerabilities = [];
    
    // Test for XSS vulnerabilities
    const xssPayloads = [
      '<script>alert(1)</script>',
      '"><script>alert(1)</script>',
      '\'><script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)'
    ];
    
    for (const payload of xssPayloads) {
      try {
        const response = await axios.get(`${options.url}/search?q=${encodeURIComponent(payload)}`, {
          timeout: options.timeout,
          validateStatus: () => true
        });
        
        if (response.data && response.data.includes(payload)) {
          vulnerabilities.push({
            type: 'XSS',
            payload,
            url: `${options.url}/search?q=${encodeURIComponent(payload)}`
          });
          break; // Found one XSS, no need to test more
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Test for SQL injection vulnerabilities
    const sqlPayloads = [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR 1=1 --",
      "admin' --",
      "1' OR '1' = '1",
      "1 OR 1=1"
    ];
    
    for (const payload of sqlPayloads) {
      try {
        const response = await axios.post(`${options.url}/api/auth/login`, {
          username: payload,
          password: payload
        }, {
          timeout: options.timeout,
          validateStatus: () => true
        });
        
        // Check if login was successful with a SQL injection payload
        if (response.status === 200 && response.data && response.data.token) {
          vulnerabilities.push({
            type: 'SQL Injection',
            payload,
            url: `${options.url}/api/auth/login`
          });
          break; // Found one SQL injection, no need to test more
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Add findings to results
    if (vulnerabilities.length > 0) {
      for (const vuln of vulnerabilities) {
        testResults.vulnerabilities.push({
          name: `${vuln.type} Vulnerability`,
          severity: 'critical',
          description: `The application is vulnerable to ${vuln.type}.`,
          details: [
            `Payload: ${vuln.payload}`,
            `URL: ${vuln.url}`
          ],
          recommendation: `Fix the ${vuln.type} vulnerability by properly validating and sanitizing user input.`
        });
      }
    }
    
    return {
      success: true,
      vulnerabilities
    };
  } catch (error) {
    console.error('Error testing web vulnerabilities:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test for directory traversal vulnerabilities
 */
async function testDirectoryTraversal() {
  try {
    console.log('Testing for directory traversal vulnerabilities...');
    
    const traversalPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\win.ini',
      '../../../config.json',
      '../../../.env',
      '../../../package.json',
      '../../../server/server.js'
    ];
    
    for (const path of traversalPaths) {
      try {
        const response = await axios.get(`${options.url}/api/files?path=${encodeURIComponent(path)}`, {
          timeout: options.timeout,
          validateStatus: () => true
        });
        
        // Check if the response contains sensitive information
        const sensitivePatterns = [
          'root:',
          'password',
          'DATABASE_URL',
          'API_KEY',
          'SECRET',
          'PRIVATE_KEY'
        ];
        
        for (const pattern of sensitivePatterns) {
          if (response.data && typeof response.data === 'string' && response.data.includes(pattern)) {
            testResults.vulnerabilities.push({
              name: 'Directory Traversal',
              severity: 'critical',
              description: 'The application is vulnerable to directory traversal attacks.',
              details: [
                `Path: ${path}`,
                `URL: ${options.url}/api/files?path=${encodeURIComponent(path)}`,
                `Found sensitive pattern: ${pattern}`
              ],
              recommendation: 'Validate and sanitize file paths. Use a whitelist of allowed paths and files.'
            });
            return {
              success: true,
              vulnerable: true,
              path,
              pattern
            };
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    return {
      success: true,
      vulnerable: false
    };
  } catch (error) {
    console.error('Error testing directory traversal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a penetration test report
 */
function generateReport() {
  if (!options.report) {
    return;
  }
  
  console.log('Generating penetration test report...');
  
  let report = '# Penetration Test Report\n\n';
  report += `Generated on ${new Date().toLocaleString()}\n\n`;
  report += `Target: ${options.url}\n\n`;
  
  report += '## Summary\n\n';
  
  const criticalVulns = testResults.vulnerabilities.filter(v => v.severity === 'critical');
  const highVulns = testResults.vulnerabilities.filter(v => v.severity === 'high');
  const mediumVulns = testResults.vulnerabilities.filter(v => v.severity === 'medium');
  const lowVulns = testResults.vulnerabilities.filter(v => v.severity === 'low');
  
  report += `- Critical vulnerabilities: ${criticalVulns.length}\n`;
  report += `- High vulnerabilities: ${highVulns.length}\n`;
  report += `- Medium vulnerabilities: ${mediumVulns.length}\n`;
  report += `- Low vulnerabilities: ${lowVulns.length}\n\n`;
  
  if (testResults.vulnerabilities.length === 0) {
    report += 'No vulnerabilities were found. This does not guarantee that the application is secure.\n\n';
  } else {
    report += '## Vulnerabilities\n\n';
    
    // Critical vulnerabilities
    if (criticalVulns.length > 0) {
      report += '### Critical\n\n';
      for (const vuln of criticalVulns) {
        report += `#### ${vuln.name}\n\n`;
        report += `**Description:** ${vuln.description}\n\n`;
        report += '**Details:**\n\n';
        for (const detail of vuln.details) {
          report += `- ${detail}\n`;
        }
        report += `\n**Recommendation:** ${vuln.recommendation}\n\n`;
      }
    }
    
    // High vulnerabilities
    if (highVulns.length > 0) {
      report += '### High\n\n';
      for (const vuln of highVulns) {
        report += `#### ${vuln.name}\n\n`;
        report += `**Description:** ${vuln.description}\n\n`;
        report += '**Details:**\n\n';
        for (const detail of vuln.details) {
          report += `- ${detail}\n`;
        }
        report += `\n**Recommendation:** ${vuln.recommendation}\n\n`;
      }
    }
    
    // Medium vulnerabilities
    if (mediumVulns.length > 0) {
      report += '### Medium\n\n';
      for (const vuln of mediumVulns) {
        report += `#### ${vuln.name}\n\n`;
        report += `**Description:** ${vuln.description}\n\n`;
        report += '**Details:**\n\n';
        for (const detail of vuln.details) {
          report += `- ${detail}\n`;
        }
        report += `\n**Recommendation:** ${vuln.recommendation}\n\n`;
      }
    }
    
    // Low vulnerabilities
    if (lowVulns.length > 0) {
      report += '### Low\n\n';
      for (const vuln of lowVulns) {
        report += `#### ${vuln.name}\n\n`;
        report += `**Description:** ${vuln.description}\n\n`;
        report += '**Details:**\n\n';
        for (const detail of vuln.details) {
          report += `- ${detail}\n`;
        }
        report += `\n**Recommendation:** ${vuln.recommendation}\n\n`;
      }
    }
  }
  
  report += '## Recommendations\n\n';
  
  // Add general recommendations
  const generalRecommendations = [
    'Implement a Web Application Firewall (WAF) to protect against common attacks.',
    'Regularly update all dependencies to patch known vulnerabilities.',
    'Implement proper input validation and sanitization for all user inputs.',
    'Use parameterized queries for database operations to prevent SQL injection.',
    'Implement proper authentication and authorization mechanisms.',
    'Use HTTPS for all communications to encrypt data in transit.',
    'Implement proper error handling to avoid leaking sensitive information.',
    'Regularly perform security testing and code reviews.',
    'Implement a security headers policy to protect against common web vulnerabilities.',
    'Follow the principle of least privilege for all user accounts and services.'
  ];
  
  for (const recommendation of generalRecommendations) {
    report += `- ${recommendation}\n`;
  }
  
  // Write report to file
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report saved to ${REPORT_FILE}`);
}

/**
 * Main function
 */
async function main() {
  console.log('Starting penetration test...');
  
  // Run tests
  await testOpenPorts();
  await testSslTls();
  await testSecurityHeaders();
  await testWebVulnerabilities();
  await testDirectoryTraversal();
  
  // Generate report
  generateReport();
  
  // Print summary
  console.log('\nTest completed.');
  console.log(`Found ${testResults.vulnerabilities.length} vulnerabilities:`);
  console.log(`- Critical: ${testResults.vulnerabilities.filter(v => v.severity === 'critical').length}`);
  console.log(`- High: ${testResults.vulnerabilities.filter(v => v.severity === 'high').length}`);
  console.log(`- Medium: ${testResults.vulnerabilities.filter(v => v.severity === 'medium').length}`);
  console.log(`- Low: ${testResults.vulnerabilities.filter(v => v.severity === 'low').length}`);
  
  if (options.report) {
    console.log(`\nReport saved to ${REPORT_FILE}`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error running penetration test:', error);
  process.exit(1);
});
