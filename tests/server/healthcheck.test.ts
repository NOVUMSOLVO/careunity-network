import request from 'supertest';
import express, { Express } from 'express';
import { registerRoutes } from '../server/routes'; // Adjust path as necessary
import http from 'http';

let app: Express;
let server: http.Server;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  // Minimal setup for testing routes. 
  // If your routes have dependencies like session middleware, database connections, etc.,
  // they might need to be mocked or initialized here.
  server = await registerRoutes(app);
});

afterAll((done) => {
  // Close the server after all tests are done to free up resources
  if (server) {
    server.close(done);
  }
});

describe('GET /api/healthcheck', () => {
  it('should return 200 OK and a success message', async () => {
    const response = await request(app).get('/api/healthcheck');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'CareUnity API is working properly');
    expect(response.body).toHaveProperty('timestamp');
  });
});

// Add a simple export to make this a module if it isn't already
export {};
