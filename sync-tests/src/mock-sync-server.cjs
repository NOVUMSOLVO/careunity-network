/**
 * Mock server for testing sync API endpoints
 * 
 * This server provides mock implementations of the sync API endpoints
 * for testing purposes. It uses Express to handle requests and
 * provides in-memory storage for sync operations.
 */

const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage
const users = [
  { id: 1, username: 'testuser', password: 'password123', role: 'admin' }
];
const syncOperations = new Map();

// Helper function to generate a JWT-like token (not real JWT)
function generateToken(user) {
  return Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  })).toString('base64');
}

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Decode the token (simple base64 decode, not real JWT verification)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  // Generate token
  const token = generateToken(user);
  
  // Return user info and token
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword
  });
});

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CareUnity API is working properly',
    timestamp: new Date().toISOString()
  });
});

// Sync API routes
const syncRouter = express.Router();

// All sync routes require authentication
syncRouter.use(authenticateToken);

// Get sync status
syncRouter.get('/status', (req, res) => {
  const userId = req.user.id;
  
  // Get all operations for this user
  const userOperations = Array.from(syncOperations.values())
    .filter(op => op.userId === userId);
  
  // Count pending operations
  const pendingCount = userOperations.filter(op => op.status === 'pending').length;
  
  // Count error operations
  const errorCount = userOperations.filter(op => op.status === 'error').length;
  
  // Get last sync time (most recent completed operation)
  const completedOperations = userOperations
    .filter(op => op.status === 'completed')
    .sort((a, b) => b.timestamp - a.timestamp);
  
  const lastSyncTime = completedOperations.length > 0
    ? new Date(completedOperations[0].timestamp).toISOString()
    : null;
  
  res.json({
    pendingCount,
    errorCount,
    lastSyncTime
  });
});

// Get all sync operations
syncRouter.get('/operations', (req, res) => {
  const userId = req.user.id;
  const status = req.query.status;
  
  // Get all operations for this user
  let operations = Array.from(syncOperations.values())
    .filter(op => op.userId === userId);
  
  // Filter by status if provided
  if (status) {
    operations = operations.filter(op => op.status === status);
  }
  
  // Sort by timestamp (newest first)
  operations.sort((a, b) => b.timestamp - a.timestamp);
  
  res.json(operations);
});

// Get a sync operation by ID
syncRouter.get('/operations/:id', (req, res) => {
  const userId = req.user.id;
  const operationId = req.params.id;
  
  // Get operation by ID
  const operation = syncOperations.get(operationId);
  
  if (!operation || operation.userId !== userId) {
    return res.status(404).json({ message: 'Sync operation not found' });
  }
  
  res.json(operation);
});

// Create a sync operation
syncRouter.post('/operations', (req, res) => {
  const userId = req.user.id;
  
  const operationId = uuid();
  const operation = {
    ...req.body,
    id: operationId,
    timestamp: Date.now(),
    status: 'pending',
    retries: 0,
    userId
  };
  
  // Store the operation
  syncOperations.set(operationId, operation);
  
  res.status(201).json(operation);
});

// Update a sync operation
syncRouter.patch('/operations/:id', (req, res) => {
  const userId = req.user.id;
  const operationId = req.params.id;
  
  // Check if operation exists
  const existingOperation = syncOperations.get(operationId);
  
  if (!existingOperation || existingOperation.userId !== userId) {
    return res.status(404).json({ message: 'Sync operation not found' });
  }
  
  // Update operation
  const updatedOperation = {
    ...existingOperation,
    ...req.body
  };
  
  // Store the updated operation
  syncOperations.set(operationId, updatedOperation);
  
  res.json(updatedOperation);
});

// Delete a sync operation
syncRouter.delete('/operations/:id', (req, res) => {
  const userId = req.user.id;
  const operationId = req.params.id;
  
  // Check if operation exists
  const existingOperation = syncOperations.get(operationId);
  
  if (!existingOperation || existingOperation.userId !== userId) {
    return res.status(404).json({ message: 'Sync operation not found' });
  }
  
  // Delete operation
  syncOperations.delete(operationId);
  
  res.status(204).end();
});

// Process pending operations
syncRouter.post('/process', (req, res) => {
  const userId = req.user.id;
  
  // Get pending operations
  const pendingOperations = Array.from(syncOperations.values())
    .filter(op => op.userId === userId && op.status === 'pending')
    .sort((a, b) => a.timestamp - b.timestamp);
  
  if (pendingOperations.length === 0) {
    return res.json({ processed: 0 });
  }
  
  // Process each operation
  let processed = 0;
  let failed = 0;
  
  for (const operation of pendingOperations) {
    // Update status to processing
    const processingOperation = {
      ...operation,
      status: 'processing'
    };
    syncOperations.set(operation.id, processingOperation);
    
    // Process the operation (simulate API call)
    // In a real implementation, this would make actual API calls
    const success = Math.random() > 0.2; // 80% success rate for simulation
    
    if (success) {
      // Update status to completed
      const completedOperation = {
        ...processingOperation,
        status: 'completed'
      };
      syncOperations.set(operation.id, completedOperation);
      
      processed++;
    } else {
      // Update status to error
      const errorOperation = {
        ...processingOperation,
        status: 'error',
        errorMessage: 'Simulated error response',
        retries: operation.retries + 1,
      };
      syncOperations.set(operation.id, errorOperation);
      
      failed++;
    }
  }
  
  res.json({
    processed,
    failed,
    total: pendingOperations.length
  });
});

// Batch create sync operations
syncRouter.post('/batch', (req, res) => {
  const userId = req.user.id;
  const { operations } = req.body;
  
  const operationsWithIds = operations.map(operation => ({
    ...operation,
    id: uuid(),
    timestamp: Date.now(),
    status: 'pending',
    retries: 0,
    userId
  }));
  
  // Store each operation
  const result = operationsWithIds.map(operation => {
    syncOperations.set(operation.id, operation);
    return { id: operation.id, status: operation.status };
  });
  
  res.status(201).json({
    operations: result
  });
});

// Clear completed operations
syncRouter.delete('/completed', (req, res) => {
  const userId = req.user.id;
  
  // Get completed operations
  const completedOperations = Array.from(syncOperations.values())
    .filter(op => op.userId === userId && op.status === 'completed');
  
  // Delete completed operations
  const deletedIds = completedOperations.map(operation => {
    syncOperations.delete(operation.id);
    return { id: operation.id };
  });
  
  res.json({
    deleted: deletedIds.length,
    operations: deletedIds
  });
});

// Mount the sync router
app.use('/api/v2/sync', syncRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Mock sync server running at http://localhost:${PORT}/`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/healthcheck');
  console.log('- GET /api/v2/sync/status');
  console.log('- GET /api/v2/sync/operations');
  console.log('- GET /api/v2/sync/operations/:id');
  console.log('- POST /api/v2/sync/operations');
  console.log('- PATCH /api/v2/sync/operations/:id');
  console.log('- DELETE /api/v2/sync/operations/:id');
  console.log('- POST /api/v2/sync/process');
  console.log('- POST /api/v2/sync/batch');
  console.log('- DELETE /api/v2/sync/completed');
});
