/**
 * Security Testing Script
 * 
 * This script uses Lighthouse to test the security of the application.
 */
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

/**
 * Run Lighthouse security audit
 */
async function runSecurityAudit(url) {
  console.log(`Running security audit for ${url}...`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox']
  });

  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['best-practices', 'seo'],
    quiet: true
  };

  const runnerResult = await lighthouse(url, options);
  const reportHtml = runnerResult.report;

  // Generate report filename
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportsDir = path.join(__dirname, '../reports/security');
  
  // Ensure report directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `security-audit-${timestamp}.html`);
  fs.writeFileSync(reportPath, reportHtml);

  // Extract security scores
  const scores = {
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100
  };

  console.log('\nSecurity Audit Results:');
  console.log(`- Best Practices Score: ${scores.bestPractices.toFixed(0)}/100`);
  console.log(`- SEO Score (including security headers): ${scores.seo.toFixed(0)}/100`);
  console.log(`\nFull report saved to: ${reportPath}`);

  await chrome.kill();
  return scores;
}

// URL to test (when running locally)
const localUrl = 'http://localhost:3000';

// Run the audit
runSecurityAudit(localUrl).catch(error => {
  console.error('Error running security audit:', error);
  process.exit(1);
});
