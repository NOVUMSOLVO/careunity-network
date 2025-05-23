/**
 * Dependency Vulnerability Check Script
 * 
 * This script checks for vulnerabilities in project dependencies using npm audit.
 * It generates a report of vulnerabilities and suggests fixes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'reports');
const REPORT_FILE = path.join(REPORT_DIR, 'vulnerability-report.json');
const SUMMARY_FILE = path.join(REPORT_DIR, 'vulnerability-summary.md');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Run npm audit and return the results
 * @returns Audit results as a JSON object
 */
function runNpmAudit() {
  try {
    console.log('Running npm audit...');
    const output = execSync('npm audit --json', { cwd: ROOT_DIR }).toString();
    return JSON.parse(output);
  } catch (error) {
    // npm audit returns a non-zero exit code if vulnerabilities are found
    // Parse the output to get the JSON data
    try {
      const output = error.stdout.toString();
      return JSON.parse(output);
    } catch (parseError) {
      console.error('Error parsing npm audit output:', parseError);
      return { error: 'Failed to parse npm audit output' };
    }
  }
}

/**
 * Generate a vulnerability report
 * @param auditResults Audit results from npm audit
 */
function generateReport(auditResults) {
  // Save the full JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(auditResults, null, 2));
  console.log(`Full vulnerability report saved to ${REPORT_FILE}`);
  
  // Generate a summary report in Markdown
  let summary = '# Dependency Vulnerability Report\n\n';
  summary += `Generated on ${new Date().toLocaleString()}\n\n`;
  
  if (auditResults.error) {
    summary += `## Error\n\n${auditResults.error}\n\n`;
    fs.writeFileSync(SUMMARY_FILE, summary);
    console.log(`Summary report saved to ${SUMMARY_FILE}`);
    return;
  }
  
  // Add metadata
  summary += '## Summary\n\n';
  summary += `- Total dependencies: ${auditResults.metadata.totalDependencies || 'Unknown'}\n`;
  summary += `- Vulnerabilities found: ${auditResults.metadata.vulnerabilities ? Object.values(auditResults.metadata.vulnerabilities).reduce((a, b) => a + b, 0) : 'Unknown'}\n`;
  
  // Add vulnerability counts by severity
  if (auditResults.metadata.vulnerabilities) {
    summary += '\n### Vulnerabilities by Severity\n\n';
    for (const [severity, count] of Object.entries(auditResults.metadata.vulnerabilities)) {
      if (count > 0) {
        summary += `- ${severity}: ${count}\n`;
      }
    }
  }
  
  // Add advisories
  if (auditResults.advisories && Object.keys(auditResults.advisories).length > 0) {
    summary += '\n## Advisories\n\n';
    
    for (const [id, advisory] of Object.entries(auditResults.advisories)) {
      summary += `### ${advisory.title} (${advisory.severity})\n\n`;
      summary += `- Module: ${advisory.module_name}\n`;
      summary += `- Vulnerable versions: ${advisory.vulnerable_versions}\n`;
      summary += `- Patched versions: ${advisory.patched_versions}\n`;
      summary += `- Recommendation: ${advisory.recommendation}\n`;
      summary += `- CWE: ${advisory.cwe || 'Not specified'}\n`;
      summary += `- CVE: ${advisory.cves.join(', ') || 'Not specified'}\n\n`;
      
      if (advisory.findings && advisory.findings.length > 0) {
        summary += '#### Affected Paths\n\n';
        for (const finding of advisory.findings) {
          for (const path of finding.paths) {
            summary += `- ${path}\n`;
          }
        }
        summary += '\n';
      }
    }
  } else {
    summary += '\n## Advisories\n\nNo vulnerabilities found.\n\n';
  }
  
  // Add fix recommendations
  if (auditResults.metadata.vulnerabilities && Object.values(auditResults.metadata.vulnerabilities).reduce((a, b) => a + b, 0) > 0) {
    summary += '## Recommendations\n\n';
    summary += '1. Run `npm audit fix` to automatically fix vulnerabilities that have compatible updates.\n';
    summary += '2. For vulnerabilities that cannot be fixed automatically, consider the following:\n';
    summary += '   - Update to a newer version of the package if available\n';
    summary += '   - Look for alternative packages with similar functionality\n';
    summary += '   - Implement additional security controls to mitigate the risk\n';
    summary += '3. For production applications, consider using `npm audit --production` to focus on production dependencies.\n';
    summary += '4. Regularly run security audits as part of your CI/CD pipeline.\n\n';
    
    // Add specific fix commands
    summary += '### Fix Commands\n\n';
    summary += '```bash\n';
    summary += '# Fix vulnerabilities automatically\n';
    summary += 'npm audit fix\n\n';
    summary += '# Fix vulnerabilities including major version updates (may break compatibility)\n';
    summary += 'npm audit fix --force\n\n';
    summary += '# Update a specific package to a specific version\n';
    summary += '# npm install package-name@version\n';
    summary += '```\n';
  }
  
  // Save the summary report
  fs.writeFileSync(SUMMARY_FILE, summary);
  console.log(`Summary report saved to ${SUMMARY_FILE}`);
}

/**
 * Main function
 */
function main() {
  console.log('Starting dependency vulnerability check...');
  
  try {
    // Run npm audit
    const auditResults = runNpmAudit();
    
    // Generate report
    generateReport(auditResults);
    
    // Check if vulnerabilities were found
    if (auditResults.metadata && auditResults.metadata.vulnerabilities) {
      const totalVulnerabilities = Object.values(auditResults.metadata.vulnerabilities).reduce((a, b) => a + b, 0);
      
      if (totalVulnerabilities > 0) {
        console.log(`Found ${totalVulnerabilities} vulnerabilities. See the reports for details.`);
        
        // Log vulnerability counts by severity
        for (const [severity, count] of Object.entries(auditResults.metadata.vulnerabilities)) {
          if (count > 0) {
            console.log(`- ${severity}: ${count}`);
          }
        }
        
        console.log('\nRecommendation: Run npm audit fix to address these vulnerabilities.');
      } else {
        console.log('No vulnerabilities found. Your dependencies are secure!');
      }
    } else {
      console.log('No vulnerability data found in the audit results.');
    }
  } catch (error) {
    console.error('Error checking for vulnerabilities:', error);
    process.exit(1);
  }
}

// Run the main function
main();
