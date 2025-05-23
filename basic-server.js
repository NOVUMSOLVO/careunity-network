// Simple Express server for CareUnity
console.log('Starting CareUnity basic server...');

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = 3333; // Use a different port to avoid conflicts

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// Basic API routes
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'CareUnity API is running'
  });
});

// User routes
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, username: 'admin', fullName: 'Admin User', role: 'admin' },
      { id: 2, username: 'caregiver1', fullName: 'John Doe', role: 'care_worker' },
      { id: 3, username: 'manager1', fullName: 'Jane Smith', role: 'care_manager' }
    ]
  });
});

// Service user routes
app.get('/api/service-users', (req, res) => {
  res.json({
    serviceUsers: [
      { id: 1, fullName: 'Alice Johnson', dateOfBirth: '1945-06-15' },
      { id: 2, fullName: 'Bob Williams', dateOfBirth: '1938-11-22' },
      { id: 3, fullName: 'Carol Davis', dateOfBirth: '1952-03-08' }
    ]
  });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Additional server configuration

// Start the server
const server = app.listen(PORT, () => {
  console.log(`CareUnity server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
  console.log(`Health check at http://localhost:${PORT}/api/healthcheck`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
