/**
 * ML Models WebSocket Server
 *
 * This server provides real-time updates for ML models, including:
 * - Model performance changes
 * - New predictions
 * - Training status updates
 * - Drift detection alerts
 */

import { WebSocketServer } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ML Models WebSocket Server');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Map();

// Store model data
const models = {
  'recommendation-1': {
    id: 'recommendation-1',
    name: 'Caregiver Recommendation',
    version: '1.0',
    metrics: {
      accuracy: 0.92,
      lastUpdated: new Date().toISOString()
    },
    status: 'active',
    predictions: []
  },
  'timeseries-1': {
    id: 'timeseries-1',
    name: 'Visit Prediction',
    version: '1.2',
    metrics: {
      rmse: 1.2,
      lastUpdated: new Date().toISOString()
    },
    status: 'active',
    predictions: []
  },
  'satisfaction-1': {
    id: 'satisfaction-1',
    name: 'Satisfaction Prediction',
    version: '0.8',
    metrics: {
      accuracy: 0.85,
      lastUpdated: new Date().toISOString()
    },
    status: 'active',
    predictions: []
  }
};

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  const metadata = { clientId };

  // Store client connection
  clients.set(ws, metadata);
  console.log(`Client connected: ${clientId}`);

  // Send initial model data
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      models: Object.values(models),
      timestamp: new Date().toISOString()
    }
  }));

  // Handle messages from clients
  ws.on('message', (messageData) => {
    try {
      const message = JSON.parse(messageData);
      console.log(`Received message from ${clientId}:`, message);

      // Handle different message types
      switch (message.type) {
        case 'subscribe':
          handleSubscribe(ws, message.data);
          break;
        case 'unsubscribe':
          handleUnsubscribe(ws, message.data);
          break;
        case 'feedback':
          handleFeedback(message.data);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected: ${clientId}`);
  });
});

// Handle model subscriptions
function handleSubscribe(ws, data) {
  const metadata = clients.get(ws);
  metadata.subscriptions = metadata.subscriptions || [];

  if (data.modelId && !metadata.subscriptions.includes(data.modelId)) {
    metadata.subscriptions.push(data.modelId);
    console.log(`Client ${metadata.clientId} subscribed to model ${data.modelId}`);

    // Send confirmation
    ws.send(JSON.stringify({
      type: 'subscribed',
      data: {
        modelId: data.modelId,
        timestamp: new Date().toISOString()
      }
    }));
  }
}

// Handle model unsubscriptions
function handleUnsubscribe(ws, data) {
  const metadata = clients.get(ws);
  metadata.subscriptions = metadata.subscriptions || [];

  if (data.modelId) {
    metadata.subscriptions = metadata.subscriptions.filter(id => id !== data.modelId);
    console.log(`Client ${metadata.clientId} unsubscribed from model ${data.modelId}`);

    // Send confirmation
    ws.send(JSON.stringify({
      type: 'unsubscribed',
      data: {
        modelId: data.modelId,
        timestamp: new Date().toISOString()
      }
    }));
  }
}

// Handle feedback from clients
function handleFeedback(data) {
  if (data.modelId && data.feedback) {
    console.log(`Received feedback for model ${data.modelId}:`, data.feedback);

    // Update model based on feedback (simplified)
    if (models[data.modelId]) {
      // Store feedback for later analysis
      models[data.modelId].feedback = models[data.modelId].feedback || [];
      models[data.modelId].feedback.push({
        value: data.feedback,
        timestamp: new Date().toISOString()
      });

      // Broadcast update to subscribed clients
      broadcastModelUpdate(data.modelId, 'feedback', {
        modelId: data.modelId,
        feedbackCount: models[data.modelId].feedback.length
      });
    }
  }
}

// Broadcast model update to subscribed clients
function broadcastModelUpdate(modelId, updateType, data) {
  if (!models[modelId]) return;

  const message = JSON.stringify({
    type: 'update',
    updateType,
    data: {
      ...data,
      timestamp: new Date().toISOString()
    }
  });

  // Send to all subscribed clients
  clients.forEach((metadata, client) => {
    if (client.readyState === 1 && // WebSocket.OPEN = 1
        metadata.subscriptions &&
        metadata.subscriptions.includes(modelId)) {
      client.send(message);
    }
  });
}

// Simulate model updates
function simulateModelUpdates() {
  setInterval(() => {
    // Randomly select a model to update
    const modelIds = Object.keys(models);
    const modelId = modelIds[Math.floor(Math.random() * modelIds.length)];
    const model = models[modelId];

    // Randomly select update type
    const updateTypes = ['metrics', 'prediction', 'status', 'drift'];
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

    switch (updateType) {
      case 'metrics':
        // Update model metrics
        if (model.metrics.accuracy) {
          // Small random change to accuracy
          const change = (Math.random() * 0.02) - 0.01; // -0.01 to +0.01
          model.metrics.accuracy = Math.max(0, Math.min(1, model.metrics.accuracy + change));
          model.metrics.lastUpdated = new Date().toISOString();

          broadcastModelUpdate(modelId, 'metrics', {
            modelId,
            metrics: model.metrics
          });

          console.log(`Updated metrics for model ${modelId}: accuracy = ${model.metrics.accuracy.toFixed(4)}`);
        } else if (model.metrics.rmse) {
          // Small random change to RMSE
          const change = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
          model.metrics.rmse = Math.max(0, model.metrics.rmse + change);
          model.metrics.lastUpdated = new Date().toISOString();

          broadcastModelUpdate(modelId, 'metrics', {
            modelId,
            metrics: model.metrics
          });

          console.log(`Updated metrics for model ${modelId}: RMSE = ${model.metrics.rmse.toFixed(4)}`);
        }
        break;

      case 'prediction':
        // New prediction
        const prediction = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          input: { /* Simplified input data */ },
          output: model.metrics.accuracy ?
            Math.random() > 0.5 : // Classification
            Math.random() * 10 // Regression
        };

        model.predictions.unshift(prediction);
        if (model.predictions.length > 100) {
          model.predictions.pop(); // Keep only the latest 100 predictions
        }

        broadcastModelUpdate(modelId, 'prediction', {
          modelId,
          prediction
        });

        console.log(`New prediction for model ${modelId}`);
        break;

      case 'status':
        // Status change (rare)
        if (Math.random() < 0.2) { // 20% chance
          const statuses = ['active', 'training', 'evaluating', 'degraded'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

          if (newStatus !== model.status) {
            model.status = newStatus;

            broadcastModelUpdate(modelId, 'status', {
              modelId,
              status: model.status
            });

            console.log(`Status change for model ${modelId}: ${model.status}`);
          }
        }
        break;

      case 'drift':
        // Data drift detection (very rare)
        if (Math.random() < 0.05) { // 5% chance
          const driftAlert = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            severity: Math.random() < 0.3 ? 'high' : 'medium',
            features: ['age', 'location', 'time_of_day'].slice(0, Math.floor(Math.random() * 3) + 1)
          };

          broadcastModelUpdate(modelId, 'drift', {
            modelId,
            driftAlert
          });

          console.log(`Drift detected for model ${modelId}: ${driftAlert.severity} severity`);
        }
        break;
    }
  }, 5000); // Update every 5 seconds
}

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`ML Models WebSocket Server running on port ${PORT}`);
  simulateModelUpdates();
});
