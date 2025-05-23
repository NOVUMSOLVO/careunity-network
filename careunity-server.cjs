// Simple Express server for CareUnity (CommonJS version)
console.log('Starting CareUnity Express server...');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Import database modules
const { db, sqlite, close: closeDb } = require('./db/index.cjs');
const { initializeDatabase } = require('./db/init.cjs');

// Create Express app
const app = express();
const PORT = 4444; // Use a different port to avoid conflicts

// Add request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);

  // Log response when finished
  res.on('finish', () => {
    console.log(`${timestamp} - Response: ${res.statusCode}`);
  });

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

// Import API routes
const apiRoutes = require('./routes/api/index.cjs');

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Initialize the database before starting the server
(async () => {
  try {
    // Initialize the database
    await initializeDatabase();

    // Start the server
    console.log(`Attempting to start server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log(`CareUnity server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/`);
      console.log(`Health check at http://localhost:${PORT}/api/healthcheck`);
      console.log(`Users endpoint at http://localhost:${PORT}/api/users`);
      console.log(`Service users endpoint at http://localhost:${PORT}/api/service-users`);
      console.log('Server is ready to accept connections');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please choose a different port.`);
      } else {
        console.error('Server error:', error);
      }
      closeDb();
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server stopped');
        closeDb();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    closeDb();
    process.exit(1);
  }
})();

// End of server setup
