/**
 * Integration tests for the API
 */

import { expect, supertest } from './setup';
import express from 'express';
import serviceUserRoutes from '../routes/service-users';
import carePlanRoutes from '../routes/care-plans';
import goalRoutes from '../routes/goals';
import taskRoutes from '../routes/tasks';
import { mockAuthMiddleware } from './setup';
import { errorHandler } from '../middleware/error-handler';
import { db } from '../db';

// Skip these tests in CI environments
const skipIfCI = process.env.CI ? describe.skip : describe;

skipIfCI('API Integration Tests', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;
  let createdServiceUserId: number;
  let createdCarePlanId: number;
  let createdGoalId: number;
  let createdTaskId: number;
  
  before(() => {
    // Create a router with mock authentication
    const router = express.Router();
    router.use(express.json());
    router.use(mockAuthMiddleware('admin'));
    
    // Mount the routes
    router.use('/service-users', serviceUserRoutes);
    router.use('/care-plans', carePlanRoutes);
    router.use('/goals', goalRoutes);
    router.use('/tasks', taskRoutes);
    
    // Add error handling
    router.use(errorHandler);
    
    // Create the app
    app = express();
    app.use(router);
    
    // Create the request
    request = supertest(app);
  });
  
  // Clean up the database after tests
  after(async () => {
    if (createdTaskId) {
      await db.delete().from('tasks').where({ id: createdTaskId });
    }
    if (createdGoalId) {
      await db.delete().from('goals').where({ id: createdGoalId });
    }
    if (createdCarePlanId) {
      await db.delete().from('care_plans').where({ id: createdCarePlanId });
    }
    if (createdServiceUserId) {
      await db.delete().from('service_users').where({ id: createdServiceUserId });
    }
  });
  
  it('should create a service user', async () => {
    const response = await request.post('/service-users')
      .send({
        fullName: 'Integration Test User',
        uniqueId: `SU-TEST-${Date.now()}`,
        dateOfBirth: '1990-01-01',
        address: '123 Test St',
        status: 'active'
      });
    
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('fullName', 'Integration Test User');
    
    createdServiceUserId = response.body.id;
  });
  
  it('should get the created service user', async () => {
    const response = await request.get(`/service-users/${createdServiceUserId}`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdServiceUserId);
    expect(response.body).to.have.property('fullName', 'Integration Test User');
  });
  
  it('should create a care plan for the service user', async () => {
    const response = await request.post('/care-plans')
      .send({
        title: 'Integration Test Care Plan',
        serviceUserId: createdServiceUserId,
        startDate: '2023-01-01',
        status: 'active'
      });
    
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('title', 'Integration Test Care Plan');
    expect(response.body).to.have.property('serviceUserId', createdServiceUserId);
    
    createdCarePlanId = response.body.id;
  });
  
  it('should get the created care plan', async () => {
    const response = await request.get(`/care-plans/${createdCarePlanId}`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdCarePlanId);
    expect(response.body).to.have.property('title', 'Integration Test Care Plan');
  });
  
  it('should create a goal for the care plan', async () => {
    const response = await request.post(`/care-plans/${createdCarePlanId}/goals`)
      .send({
        title: 'Integration Test Goal',
        description: 'This is a test goal',
        startDate: '2023-01-01',
        status: 'active',
        progressPercentage: 0
      });
    
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('title', 'Integration Test Goal');
    expect(response.body).to.have.property('carePlanId', createdCarePlanId);
    
    createdGoalId = response.body.id;
  });
  
  it('should get the created goal', async () => {
    const response = await request.get(`/goals/${createdGoalId}`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdGoalId);
    expect(response.body).to.have.property('title', 'Integration Test Goal');
  });
  
  it('should create a task for the goal', async () => {
    const response = await request.post(`/goals/${createdGoalId}/tasks`)
      .send({
        title: 'Integration Test Task',
        description: 'This is a test task',
        status: 'pending'
      });
    
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('title', 'Integration Test Task');
    expect(response.body).to.have.property('goalId', createdGoalId);
    
    createdTaskId = response.body.id;
  });
  
  it('should get the created task', async () => {
    const response = await request.get(`/tasks/${createdTaskId}`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdTaskId);
    expect(response.body).to.have.property('title', 'Integration Test Task');
  });
  
  it('should get the care plan with goals and tasks', async () => {
    const response = await request.get(`/care-plans/${createdCarePlanId}/with-goals-and-tasks`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdCarePlanId);
    expect(response.body).to.have.property('goals');
    expect(response.body.goals).to.be.an('array');
    expect(response.body.goals).to.have.lengthOf(1);
    expect(response.body.goals[0]).to.have.property('id', createdGoalId);
    expect(response.body.goals[0]).to.have.property('tasks');
    expect(response.body.goals[0].tasks).to.be.an('array');
    expect(response.body.goals[0].tasks).to.have.lengthOf(1);
    expect(response.body.goals[0].tasks[0]).to.have.property('id', createdTaskId);
  });
  
  it('should update the task', async () => {
    const response = await request.patch(`/tasks/${createdTaskId}`)
      .send({
        status: 'completed'
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdTaskId);
    expect(response.body).to.have.property('status', 'completed');
  });
  
  it('should update the goal progress', async () => {
    const response = await request.patch(`/goals/${createdGoalId}`)
      .send({
        progressPercentage: 100
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdGoalId);
    expect(response.body).to.have.property('progressPercentage', 100);
  });
  
  it('should update the care plan', async () => {
    const response = await request.patch(`/care-plans/${createdCarePlanId}`)
      .send({
        status: 'completed'
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', createdCarePlanId);
    expect(response.body).to.have.property('status', 'completed');
  });
  
  it('should delete the task', async () => {
    const response = await request.delete(`/tasks/${createdTaskId}`);
    
    expect(response.status).to.equal(204);
    createdTaskId = 0; // Mark as deleted
  });
  
  it('should delete the goal', async () => {
    const response = await request.delete(`/goals/${createdGoalId}`);
    
    expect(response.status).to.equal(204);
    createdGoalId = 0; // Mark as deleted
  });
  
  it('should delete the care plan', async () => {
    const response = await request.delete(`/care-plans/${createdCarePlanId}`);
    
    expect(response.status).to.equal(204);
    createdCarePlanId = 0; // Mark as deleted
  });
  
  it('should delete the service user', async () => {
    const response = await request.delete(`/service-users/${createdServiceUserId}`);
    
    expect(response.status).to.equal(204);
    createdServiceUserId = 0; // Mark as deleted
  });
});
