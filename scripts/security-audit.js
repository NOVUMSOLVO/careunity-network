/**
 * Security Audit Script
 * 
 * This script performs a basic security audit of the CareUnity application.
 * It checks for common security issues and provides recommendations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const CAREUNITY_APP_DIR = path.join(ROOT_DIR, 'careunity-app');
const MOBILE_APP_DIR = path.join(ROOT_DIR, 'mobile-app');

// Security issues to check for
const securityChecks = [
  {
    name: 'Hardcoded Secrets',
    description: 'Check for hardcoded secrets, API keys, and credentials',
    patterns: [
      /['"](?:api|jwt|token|secret|password|auth|key|credential).*?['"]:\s*['"][^'"]+['"]/i,
      /const\s+(?:api|jwt|token|secret|password|auth|key|credential).*?=\s*['"][^'"]+['"]/i,
      /['"](?:sk_|pk_|api_|secret_|password_|auth_|key_|credential_).*?['"]/i,
    ],
    excludePatterns: [
      /process\.env\./,
      /config\./,
      /['"]password['"]\s*:/i,
      /['"]secretKey['"]\s*:/i,
    ],
    severity: 'high',
  },
  {
    name: 'Insecure Cookies',
    description: 'Check for cookies without secure, httpOnly, or sameSite flags',
    patterns: [
      /cookie\s*\(/i,
      /cookies\s*\(/i,
      /setCookie\s*\(/i,
      /cookie.*?secure:\s*false/i,
      /cookie.*?httpOnly:\s*false/i,
      /cookie.*?sameSite:\s*['"]none['"]/i,
    ],
    excludePatterns: [
      /secure:\s*true/i,
      /httpOnly:\s*true/i,
      /sameSite:\s*['"]strict['"]/i,
      /sameSite:\s*['"]lax['"]/i,
    ],
    severity: 'medium',
  },
  {
    name: 'SQL Injection',
    description: 'Check for potential SQL injection vulnerabilities',
    patterns: [
      /db\.query\s*\(\s*['"][^'"]*\$\{/i,
      /db\.query\s*\(\s*['"][^'"]*\+/i,
      /db\.execute\s*\(\s*['"][^'"]*\$\{/i,
      /db\.execute\s*\(\s*['"][^'"]*\+/i,
      /sql\s*\+=/i,
      /sql\s*=.*?\+/i,
    ],
    excludePatterns: [
      /parameterized/i,
      /prepared/i,
    ],
    severity: 'critical',
  },
  {
    name: 'XSS Vulnerabilities',
    description: 'Check for potential Cross-Site Scripting vulnerabilities',
    patterns: [
      /dangerouslySetInnerHTML/i,
      /innerHTML\s*=/i,
      /document\.write\s*\(/i,
      /eval\s*\(/i,
      /setTimeout\s*\(\s*['"`][^'"`]*\$\{/i,
      /setInterval\s*\(\s*['"`][^'"`]*\$\{/i,
    ],
    excludePatterns: [
      /sanitize/i,
      /escape/i,
      /DOMPurify/i,
    ],
    severity: 'high',
  },
  {
    name: 'Weak Cryptography',
    description: 'Check for weak cryptographic algorithms',
    patterns: [
      /createHash\s*\(\s*['"]md5['"]/i,
      /createHash\s*\(\s*['"]sha1['"]/i,
      /createCipher\s*\(\s*['"]des['"]/i,
      /createCipher\s*\(\s*['"]rc4['"]/i,
      /createCipher\s*\(\s*['"]blowfish['"]/i,
    ],
    excludePatterns: [],
    severity: 'high',
  },
  {
    name: 'Insecure Random Values',
    description: 'Check for insecure random value generation',
    patterns: [
      /Math\.random\s*\(/i,
      /new Date\(\)\.getTime\(\)/i,
      /Date\.now\(\)/i,
    ],
    excludePatterns: [
      /crypto\.randomBytes/i,
      /crypto\.randomUUID/i,
      /crypto\.randomInt/i,
    ],
    severity: 'medium',
  },
  {
    name: 'Missing Authentication',
    description: 'Check for routes without authentication middleware',
    patterns: [
      /router\.(get|post|put|patch|delete)\s*\(\s*['"][^'"]+['"]/i,
      /app\.(get|post|put|patch|delete)\s*\(\s*['"][^'"]+['"]/i,
    ],
    excludePatterns: [
      /authenticate/i,
      /auth/i,
      /isAuthenticated/i,
      /requireAuth/i,
      /ensureAuth/i,
      /protected/i,
      /login/i,
      /register/i,
      /signup/i,
      /signin/i,
      /logout/i,
      /health/i,
      /status/i,
      /ping/i,
    ],
    severity: 'high',
  },
  {
    name: 'Outdated Dependencies',
    description: 'Check for outdated dependencies with security vulnerabilities',
    patterns: [],
    excludePatterns: [],
    severity: 'medium',
    customCheck: async () => {
      try {
        const output = execSync('npm audit --json', { cwd: ROOT_DIR }).toString();
        const auditResult = JSON.parse(output);
        
        if (auditResult.vulnerabilities) {
          const issues = [];
          let totalVulnerabilities = 0;
          
          for (const [severity, vulns] of Object.entries(auditResult.vulnerabilities)) {
            if (vulns.length > 0) {
              totalVulnerabilities += vulns.length;
              issues.push(`${vulns.length} ${severity} vulnerabilities found`);
            }
          }
          
          if (totalVulnerabilities > 0) {
            return {
              found: true,
              issues,
              recommendation: 'Run npm audit fix to address these vulnerabilities or update the affected packages manually.'
            };
          }
        }
        
        return { found: false };
      } catch (error) {
        return {
          found: true,
          issues: ['Error running npm audit: ' + error.message],
          recommendation: 'Run npm audit manually to check for vulnerabilities.'
        };
      }
    }
  }
];

// Function to check a file for security issues
async function checkFile(filePath, checks) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Skip non-code files
    if (!['.js', '.jsx', '.ts', '.tsx', '.vue', '.php', '.py', '.rb', '.go', '.java', '.cs'].includes(fileExt)) {
      return issues;
    }
    
    for (const check of checks) {
      if (check.customCheck) {
        continue; // Skip custom checks here, they're handled separately
      }
      
      for (const pattern of check.patterns) {
        const matches = content.match(new RegExp(pattern, 'g'));
        
        if (matches) {
          let isExcluded = false;
          
          // Check if any exclude patterns match
          for (const excludePattern of check.excludePatterns) {
            if (content.match(new RegExp(excludePattern, 'g'))) {
              isExcluded = true;
              break;
            }
          }
          
          if (!isExcluded) {
            issues.push({
              file: filePath,
              check: check.name,
              description: check.description,
              matches: matches.length,
              severity: check.severity,
              recommendation: getRecommendation(check.name)
            });
            
            break; // Only report once per check per file
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error checking file ${filePath}: ${error.message}`);
  }
  
  return issues;
}

// Function to get recommendation based on check name
function getRecommendation(checkName) {
  switch (checkName) {
    case 'Hardcoded Secrets':
      return 'Move secrets to environment variables or a secure vault. Never hardcode sensitive information.';
    case 'Insecure Cookies':
      return 'Set secure, httpOnly, and sameSite flags on cookies containing sensitive information.';
    case 'SQL Injection':
      return 'Use parameterized queries or prepared statements instead of string concatenation.';
    case 'XSS Vulnerabilities':
      return 'Sanitize user input and use content security policies to prevent XSS attacks.';
    case 'Weak Cryptography':
      return 'Use modern cryptographic algorithms like SHA-256, SHA-3, or AES-256.';
    case 'Insecure Random Values':
      return 'Use cryptographically secure random number generators for security-sensitive operations.';
    case 'Missing Authentication':
      return 'Add authentication middleware to protect sensitive routes.';
    default:
      return 'Review and address the security issue according to best practices.';
  }
}

// Function to scan a directory recursively
async function scanDirectory(dir, checks) {
  let issues = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.git')) {
        const dirIssues = await scanDirectory(filePath, checks);
        issues = [...issues, ...dirIssues];
      } else if (stats.isFile()) {
        const fileIssues = await checkFile(filePath, checks);
        issues = [...issues, ...fileIssues];
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
  
  return issues;
}

// Main function
async function main() {
  console.log('Starting security audit...');
  
  let allIssues = [];
  
  // Scan server directory
  console.log('Scanning server directory...');
  const serverIssues = await scanDirectory(SERVER_DIR, securityChecks);
  allIssues = [...allIssues, ...serverIssues];
  
  // Scan client directory
  console.log('Scanning client directory...');
  const clientIssues = await scanDirectory(CLIENT_DIR, securityChecks);
  allIssues = [...allIssues, ...clientIssues];
  
  // Scan careunity-app directory
  console.log('Scanning careunity-app directory...');
  const careunityAppIssues = await scanDirectory(CAREUNITY_APP_DIR, securityChecks);
  allIssues = [...allIssues, ...careunityAppIssues];
  
  // Scan mobile-app directory
  console.log('Scanning mobile-app directory...');
  const mobileAppIssues = await scanDirectory(MOBILE_APP_DIR, securityChecks);
  allIssues = [...allIssues, ...mobileAppIssues];
  
  // Run custom checks
  for (const check of securityChecks) {
    if (check.customCheck) {
      console.log(`Running custom check: ${check.name}...`);
      const result = await check.customCheck();
      
      if (result.found) {
        allIssues.push({
          check: check.name,
          description: check.description,
          issues: result.issues,
          severity: check.severity,
          recommendation: result.recommendation
        });
      }
    }
  }
  
  // Generate report
  generateReport(allIssues);
}

// Function to generate a report
function generateReport(issues) {
  console.log('\n=== Security Audit Report ===\n');
  
  if (issues.length === 0) {
    console.log('No security issues found.');
    return;
  }
  
  // Group issues by severity
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const highIssues = issues.filter(issue => issue.severity === 'high');
  const mediumIssues = issues.filter(issue => issue.severity === 'medium');
  const lowIssues = issues.filter(issue => issue.severity === 'low');
  
  console.log(`Found ${issues.length} potential security issues:`);
  console.log(`- Critical: ${criticalIssues.length}`);
  console.log(`- High: ${highIssues.length}`);
  console.log(`- Medium: ${mediumIssues.length}`);
  console.log(`- Low: ${lowIssues.length}`);
  
  // Print critical issues
  if (criticalIssues.length > 0) {
    console.log('\n=== Critical Issues ===\n');
    printIssues(criticalIssues);
  }
  
  // Print high issues
  if (highIssues.length > 0) {
    console.log('\n=== High Issues ===\n');
    printIssues(highIssues);
  }
  
  // Print medium issues
  if (mediumIssues.length > 0) {
    console.log('\n=== Medium Issues ===\n');
    printIssues(mediumIssues);
  }
  
  // Print low issues
  if (lowIssues.length > 0) {
    console.log('\n=== Low Issues ===\n');
    printIssues(lowIssues);
  }
  
  console.log('\n=== End of Report ===\n');
}

// Function to print issues
function printIssues(issues) {
  for (const issue of issues) {
    console.log(`Issue: ${issue.check}`);
    console.log(`Description: ${issue.description}`);
    
    if (issue.file) {
      console.log(`File: ${issue.file}`);
      console.log(`Matches: ${issue.matches}`);
    } else if (issue.issues) {
      console.log('Details:');
      for (const detail of issue.issues) {
        console.log(`  - ${detail}`);
      }
    }
    
    console.log(`Recommendation: ${issue.recommendation}`);
    console.log('');
  }
}

// Run the main function
main().catch(error => {
  console.error('Error running security audit:', error);
  process.exit(1);
});
