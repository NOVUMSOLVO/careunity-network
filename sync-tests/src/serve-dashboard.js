/**
 * Simple Express server to serve the dashboard
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.DASHBOARD_PORT || 3003;
const PERFORMANCE_REPORTS_DIR = path.resolve(process.cwd(), 'performance-reports');

// Create the Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API endpoint to get performance data
app.get('/api/performance', (req, res) => {
  try {
    // Ensure the performance reports directory exists
    if (!fs.existsSync(PERFORMANCE_REPORTS_DIR)) {
      fs.mkdirSync(PERFORMANCE_REPORTS_DIR, { recursive: true });
      
      // Return empty data if no reports exist
      return res.json({
        dates: [],
        responseTimes: [],
        processingTimes: [],
        pendingOperations: 0,
        successRate: '0%'
      });
    }
    
    // Get all performance report files
    const files = fs.readdirSync(PERFORMANCE_REPORTS_DIR)
      .filter(file => file.startsWith('performance-') && file.endsWith('.json'))
      .sort(); // Sort by date (oldest first)
    
    if (files.length === 0) {
      // Return empty data if no reports exist
      return res.json({
        dates: [],
        responseTimes: [],
        processingTimes: [],
        pendingOperations: 0,
        successRate: '0%'
      });
    }
    
    // Load the reports
    const reports = files.map(file => {
      const filePath = path.join(PERFORMANCE_REPORTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data;
    });
    
    // Extract the data for the charts
    const dates = reports.map(report => {
      const date = new Date(report.timestamp);
      return date.toLocaleDateString();
    });
    
    const responseTimes = reports.map(report => report.syncStatusResponseTime || 0);
    
    const processingTimes = reports.map(report => report.processOperationsTime || 0);
    
    // Get the latest test results
    let testResults = {};
    try {
      const testResultsPath = path.join(PERFORMANCE_REPORTS_DIR, 'test-results.json');
      if (fs.existsSync(testResultsPath)) {
        testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading test results:', err);
    }
    
    // Calculate success rate
    const successRate = testResults.successRate || '0%';
    
    // Get pending operations count
    const pendingOperations = testResults.pendingOperations || 0;
    
    // Return the data
    res.json({
      dates,
      responseTimes,
      processingTimes,
      pendingOperations,
      successRate,
      testResults: testResults.results || []
    });
  } catch (err) {
    console.error('Error getting performance data:', err);
    res.status(500).json({ error: 'Failed to get performance data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Dashboard server running at http://localhost:${PORT}/ ===`);
  console.log(`Open your browser to http://localhost:${PORT}/ to access the Sync API Dashboard`);
});
