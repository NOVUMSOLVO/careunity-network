/**
 * WebSocket Service
 *
 * This service manages WebSocket connections and real-time updates for the application.
 */

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// WebSocket client type
interface WebSocketClient {
  id: string;
  userId?: number;
  role?: string;
  socket: WebSocket;
  isAlive: boolean;
  subscriptions: string[];
}

// WebSocket message type
interface WebSocketMessage {
  type: string;
  payload: any;
  channel?: string;
  targetUserId?: number;
  targetRole?: string;
}

/**
 * WebSocket Service
 */
export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout;

  /**
   * Initialize the WebSocket server
   */
  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server });

    // Set up connection handler
    this.wss.on('connection', this.handleConnection.bind(this));

    // Set up ping interval to keep connections alive and detect disconnected clients
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          client.socket.terminate();
          this.clients.delete(client.id);
          return;
        }

        client.isAlive = false;
        client.socket.ping();
      });
    }, 30000); // 30 seconds

    console.log('WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connections
   */
  private handleConnection(socket: WebSocket, request: http.IncomingMessage) {
    // Generate a unique ID for this connection
    const clientId = uuidv4();

    // Create a new client
    const client: WebSocketClient = {
      id: clientId,
      socket,
      isAlive: true,
      subscriptions: []
    };

    // Add the client to the clients map
    this.clients.set(clientId, client);

    console.log(`New WebSocket connection: ${clientId}`);

    // Set up message handler
    socket.on('message', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as WebSocketMessage;
        this.handleMessage(client, parsedMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.sendToClient(client, {
          type: 'error',
          payload: {
            message: 'Invalid message format'
          }
        });
      }
    });

    // Set up pong handler to keep the connection alive
    socket.on('pong', () => {
      client.isAlive = true;
    });

    // Set up close handler
    socket.on('close', () => {
      console.log(`WebSocket connection closed: ${clientId}`);
      this.clients.delete(clientId);
    });

    // Set up error handler
    socket.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    // Send a welcome message
    this.sendToClient(client, {
      type: 'connected',
      payload: {
        clientId,
        message: 'Connected to CareUnity WebSocket server'
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(client: WebSocketClient, message: WebSocketMessage) {
    console.log(`Received message from client ${client.id}:`, message.type);

    switch (message.type) {
      case 'authenticate':
        this.handleAuthentication(client, message.payload);
        break;

      case 'subscribe':
        this.handleSubscription(client, message.payload);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(client, message.payload);
        break;

      case 'allocation_update':
        // Forward allocation updates to relevant subscribers
        this.broadcastToChannel('allocation', message.payload);
        break;

      case 'visit_update':
        // Forward visit updates to relevant subscribers
        this.broadcastToChannel('visits', message.payload);
        break;

      case 'caregiver_location':
        // Forward caregiver location updates to relevant subscribers
        this.broadcastToChannel('caregiver_locations', message.payload);
        break;

      case 'performance_alert_ack':
        // Handle performance alert acknowledgment
        this.handlePerformanceAlertAck(client, message.payload);
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
        this.sendToClient(client, {
          type: 'error',
          payload: {
            message: `Unknown message type: ${message.type}`
          }
        });
    }
  }

  /**
   * Handle client authentication
   */
  private handleAuthentication(client: WebSocketClient, payload: any) {
    try {
      // Verify the JWT token
      const { token } = payload;
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      // Update the client with user information
      client.userId = decoded.userId;
      client.role = decoded.role;

      console.log(`Client ${client.id} authenticated as user ${client.userId} with role ${client.role}`);

      // Send a success message
      this.sendToClient(client, {
        type: 'authenticated',
        payload: {
          userId: client.userId,
          role: client.role
        }
      });

      // Auto-subscribe based on role
      if (client.role === 'admin' || client.role === 'coordinator') {
        client.subscriptions.push('allocation', 'visits', 'caregiver_locations', 'performance_alerts');
      } else if (client.role === 'caregiver') {
        client.subscriptions.push('visits');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Authentication failed'
        }
      });
    }
  }

  /**
   * Handle channel subscription
   */
  private handleSubscription(client: WebSocketClient, payload: any) {
    const { channel } = payload;

    if (!channel) {
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Channel is required for subscription'
        }
      });
      return;
    }

    // Add the channel to the client's subscriptions if not already subscribed
    if (!client.subscriptions.includes(channel)) {
      client.subscriptions.push(channel);
    }

    console.log(`Client ${client.id} subscribed to channel: ${channel}`);

    this.sendToClient(client, {
      type: 'subscribed',
      payload: {
        channel,
        subscriptions: client.subscriptions
      }
    });
  }

  /**
   * Handle channel unsubscription
   */
  private handleUnsubscription(client: WebSocketClient, payload: any) {
    const { channel } = payload;

    if (!channel) {
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Channel is required for unsubscription'
        }
      });
      return;
    }

    // Remove the channel from the client's subscriptions
    client.subscriptions = client.subscriptions.filter(sub => sub !== channel);

    console.log(`Client ${client.id} unsubscribed from channel: ${channel}`);

    this.sendToClient(client, {
      type: 'unsubscribed',
      payload: {
        channel,
        subscriptions: client.subscriptions
      }
    });
  }

  /**
   * Send a message to a specific client
   */
  private sendToClient(client: WebSocketClient, message: WebSocketMessage) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast a message to all clients subscribed to a channel
   */
  public broadcastToChannel(channel: string, payload: any) {
    console.log(`Broadcasting to channel: ${channel}`);

    this.clients.forEach((client) => {
      if (client.subscriptions.includes(channel) && client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(client, {
          type: 'update',
          channel,
          payload
        });
      }
    });
  }

  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: number, message: WebSocketMessage) {
    let sent = false;

    this.clients.forEach((client) => {
      if (client.userId === userId && client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
        sent = true;
      }
    });

    return sent;
  }

  /**
   * Send a message to users with a specific role
   */
  public sendToRole(role: string, message: WebSocketMessage) {
    let count = 0;

    this.clients.forEach((client) => {
      if (client.role === role && client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
        count++;
      }
    });

    return count;
  }

  /**
   * Broadcast a message to all connected clients
   */
  public broadcastToAll(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Handle performance alert acknowledgment
   */
  private handlePerformanceAlertAck(client: WebSocketClient, payload: any) {
    const { alertId } = payload;

    if (!alertId) {
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Alert ID is required for acknowledgment'
        }
      });
      return;
    }

    // In a real implementation, this would call the performance alert service
    // to acknowledge the alert
    try {
      // Placeholder for actual implementation
      const acknowledged = true; // performanceAlertService.acknowledgeAlert(alertId);

      if (acknowledged) {
        console.log(`Performance alert ${alertId} acknowledged by client ${client.id}`);

        // Notify all admin users about the acknowledgment
        this.broadcastToChannel('performance_alerts', {
          alertId,
          acknowledged: true,
          acknowledgedBy: client.userId,
          acknowledgedAt: new Date().toISOString()
        });

        this.sendToClient(client, {
          type: 'performance_alert_acked',
          payload: {
            alertId,
            success: true
          }
        });
      } else {
        this.sendToClient(client, {
          type: 'error',
          payload: {
            message: `Alert with ID ${alertId} not found`
          }
        });
      }
    } catch (error) {
      console.error('Error acknowledging performance alert:', error);
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Failed to acknowledge alert'
        }
      });
    }
  }

  /**
   * Send a performance alert to subscribed clients
   */
  public sendPerformanceAlert(alert: any) {
    this.broadcastToChannel('performance_alerts', alert);
  }

  /**
   * Clean up resources when shutting down
   */
  public close() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}
