/**
 * Generate a performance report from test results
 * 
 * This script runs the performance tests and generates a report
 * that can be used to track performance over time.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Configuration
const REPORT_DIR = path.resolve(process.cwd(), 'performance-reports');
const MOCK_SERVER_COMMAND = 'node';
const MOCK_SERVER_ARGS = ['src/mock-sync-server.cjs'];
const PERF_TEST_COMMAND = 'node';
const PERF_TEST_ARGS = ['src/performance-tests.js'];

// Ensure the report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Start the mock server
async function startMockServer() {
  console.log('Starting mock server...');

  const server = spawn(MOCK_SERVER_COMMAND, MOCK_SERVER_ARGS, {
    stdio: 'pipe', // Capture output
    shell: true
  });

  let serverOutput = '';
  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  server.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });

  // Give the server some time to start
  await setTimeout(2000);

  return { server, output: serverOutput };
}

// Run the performance tests
async function runPerformanceTests() {
  console.log('Running performance tests...');

  return new Promise((resolve) => {
    const tests = spawn(PERF_TEST_COMMAND, PERF_TEST_ARGS, {
      stdio: 'pipe', // Capture output
      shell: true
    });

    let testOutput = '';
    tests.stdout.on('data', (data) => {
      testOutput += data.toString();
    });

    tests.stderr.on('data', (data) => {
      testOutput += data.toString();
    });

    tests.on('error', (err) => {
      console.error('Failed to run tests:', err);
      resolve({ success: false, output: testOutput, error: err.message });
    });

    tests.on('exit', (code) => {
      console.log(`Tests exited with code ${code}`);
      resolve({ success: code === 0, output: testOutput });
    });
  });
}

// Parse the test output to extract performance metrics
function parsePerformanceMetrics(output) {
  const metrics = {
    timestamp: new Date().toISOString(),
    syncStatusResponseTime: null,
    concurrentOperationsTime: null,
    batchOperationsTime: null,
    processOperationsTime: null,
  };

  // Extract sync status response time
  const syncStatusMatch = output.match(/Sync Status Response Time.*?responseTime: (\d+\.\d+)ms/s);
  if (syncStatusMatch) {
    metrics.syncStatusResponseTime = parseFloat(syncStatusMatch[1]);
  }

  // Extract concurrent operations time
  const concurrentMatch = output.match(/Concurrent Operations Creation.*?totalTime: (\d+\.\d+)ms.*?averageTime: (\d+\.\d+)ms/s);
  if (concurrentMatch) {
    metrics.concurrentOperationsTime = {
      total: parseFloat(concurrentMatch[1]),
      average: parseFloat(concurrentMatch[2])
    };
  }

  // Extract batch operations time
  const batchMatch = output.match(/Batch Operations Creation.*?totalTime: (\d+\.\d+)ms.*?timePerOperation: (\d+\.\d+)ms/s);
  if (batchMatch) {
    metrics.batchOperationsTime = {
      total: parseFloat(batchMatch[1]),
      perOperation: parseFloat(batchMatch[2])
    };
  }

  // Extract process operations time
  const processMatch = output.match(/Process Operations Performance.*?totalTime: (\d+\.\d+)ms/s);
  if (processMatch) {
    metrics.processOperationsTime = parseFloat(processMatch[1]);
  }

  return metrics;
}

// Save the performance metrics to a report file
function savePerformanceReport(metrics) {
  const reportFile = path.join(REPORT_DIR, `performance-${metrics.timestamp.replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(metrics, null, 2));
  console.log(`Performance report saved to ${reportFile}`);

  // Also update the latest report
  const latestFile = path.join(REPORT_DIR, 'latest-performance.json');
  fs.writeFileSync(latestFile, JSON.stringify(metrics, null, 2));
  console.log(`Latest performance report updated at ${latestFile}`);

  return reportFile;
}

// Generate an HTML report
function generateHtmlReport(metrics) {
  // Load previous reports to show trends
  const reports = [];
  const files = fs.readdirSync(REPORT_DIR).filter(file => file.startsWith('performance-') && file.endsWith('.json'));
  
  // Sort files by date (newest first)
  files.sort().reverse().slice(0, 10).forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, file), 'utf8'));
      reports.push(data);
    } catch (err) {
      console.error(`Error reading report file ${file}:`, err);
    }
  });

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sync API Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .chart { width: 100%; height: 300px; margin-bottom: 30px; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Sync API Performance Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  
  <h2>Latest Results</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Sync Status Response Time</td>
      <td>${metrics.syncStatusResponseTime ? metrics.syncStatusResponseTime.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
    <tr>
      <td>Concurrent Operations (Total)</td>
      <td>${metrics.concurrentOperationsTime ? metrics.concurrentOperationsTime.total.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
    <tr>
      <td>Concurrent Operations (Average)</td>
      <td>${metrics.concurrentOperationsTime ? metrics.concurrentOperationsTime.average.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
    <tr>
      <td>Batch Operations (Total)</td>
      <td>${metrics.batchOperationsTime ? metrics.batchOperationsTime.total.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
    <tr>
      <td>Batch Operations (Per Operation)</td>
      <td>${metrics.batchOperationsTime ? metrics.batchOperationsTime.perOperation.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
    <tr>
      <td>Process Operations Time</td>
      <td>${metrics.processOperationsTime ? metrics.processOperationsTime.toFixed(2) + ' ms' : 'N/A'}</td>
    </tr>
  </table>
  
  <h2>Historical Trends</h2>
  <div class="chart-container">
    <canvas id="responseTimeChart" class="chart"></canvas>
  </div>
  
  <script>
    // Prepare data for charts
    const reports = ${JSON.stringify(reports)};
    const labels = reports.map(r => new Date(r.timestamp).toLocaleDateString());
    
    // Response time chart
    new Chart(document.getElementById('responseTimeChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sync Status Response Time (ms)',
            data: reports.map(r => r.syncStatusResponseTime),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Process Operations Time (ms)',
            data: reports.map(r => r.processOperationsTime),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'API Response Times'
          }
        }
      }
    });
  </script>
</body>
</html>
  `;

  const htmlFile = path.join(REPORT_DIR, 'performance-report.html');
  fs.writeFileSync(htmlFile, html);
  console.log(`HTML report generated at ${htmlFile}`);

  return htmlFile;
}

// Main function
async function main() {
  console.log('=== Generating Sync API Performance Report ===');

  // Start the mock server
  const { server, output: serverOutput } = await startMockServer();

  // Run the performance tests
  const { success, output: testOutput } = await runPerformanceTests();

  // Stop the server
  server.kill();

  if (!success) {
    console.error('❌ Performance tests failed');
    console.error(testOutput);
    process.exit(1);
  }

  // Parse the performance metrics
  const metrics = parsePerformanceMetrics(testOutput);
  console.log('Extracted metrics:', metrics);

  // Save the performance report
  const reportFile = savePerformanceReport(metrics);

  // Generate HTML report
  const htmlFile = generateHtmlReport(metrics);

  console.log('\n✅ Performance report generation completed');
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
