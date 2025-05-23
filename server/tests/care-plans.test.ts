/**
 * Care Plan API tests
 */

import { expect, sinon, supertest, createTestApp, mockAuthMiddleware, mockDb, restoreStubs } from './setup';
import carePlanRoutes from '../routes/care-plans';
import express from 'express';
import { validateBody, validateParams } from '../middleware/validation';
import { errorHandler } from '../middleware/error-handler';

describe('Care Plan API', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;
  let dbMock: any;
  
  beforeEach(() => {
    // Create a router with mock authentication
    const router = express.Router();
    router.use(mockAuthMiddleware());
    router.use('/care-plans', carePlanRoutes);
    router.use(errorHandler);
    
    // Create a test app
    app = createTestApp(router);
    request = supertest(app);
    
    // Mock the database
    dbMock = mockDb();
  });
  
  afterEach(() => {
    restoreStubs();
  });
  
  describe('GET /care-plans', () => {
    it('should return all care plans', async () => {
      // Mock the database response
      const mockCarePlans = [
        { id: 1, title: 'Care Plan 1', serviceUserId: 1, status: 'active' },
        { id: 2, title: 'Care Plan 2', serviceUserId: 2, status: 'active' },
      ];
      dbMock.returning.returns(mockCarePlans);
      
      // Make the request
      const response = await request.get('/care-plans');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockCarePlans);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
    });
  });
  
  describe('GET /care-plans/:id', () => {
    it('should return a care plan by ID', async () => {
      // Mock the database response
      const mockCarePlan = { id: 1, title: 'Care Plan 1', serviceUserId: 1, status: 'active' };
      dbMock.returning.returns([mockCarePlan]);
      
      // Make the request
      const response = await request.get('/care-plans/1');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockCarePlan);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
    
    it('should return 404 if care plan not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.get('/care-plans/999');
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
  });
  
  describe('GET /care-plans/:id/with-goals-and-tasks', () => {
    it('should return a care plan with goals and tasks', async () => {
      // Mock the database response
      const mockCarePlan = { id: 1, title: 'Care Plan 1', serviceUserId: 1, status: 'active' };
      const mockGoals = [
        { id: 1, title: 'Goal 1', carePlanId: 1, status: 'active' },
        { id: 2, title: 'Goal 2', carePlanId: 1, status: 'active' },
      ];
      const mockTasks = [
        { id: 1, title: 'Task 1', goalId: 1, status: 'pending' },
        { id: 2, title: 'Task 2', goalId: 1, status: 'pending' },
      ];
      
      dbMock.returning.onFirstCall().returns([mockCarePlan]);
      dbMock.returning.onSecondCall().returns(mockGoals);
      dbMock.returning.onThirdCall().returns(mockTasks);
      
      // Make the request
      const response = await request.get('/care-plans/1/with-goals-and-tasks');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', 1);
      expect(response.body).to.have.property('goals');
      expect(response.body.goals).to.be.an('array');
      expect(dbMock.select.called).to.be.true;
      expect(dbMock.from.called).to.be.true;
      expect(dbMock.where.called).to.be.true;
    });
    
    it('should return 404 if care plan not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.get('/care-plans/999/with-goals-and-tasks');
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
  });
  
  describe('POST /care-plans', () => {
    it('should create a new care plan', async () => {
      // Mock the database response
      const mockServiceUser = { id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' };
      const mockCarePlan = { 
        id: 1, 
        title: 'Care Plan 1', 
        serviceUserId: 1, 
        startDate: '2023-01-01',
        status: 'active' 
      };
      
      dbMock.returning.onFirstCall().returns([mockServiceUser]);
      dbMock.returning.onSecondCall().returns([mockCarePlan]);
      
      // Make the request
      const response = await request.post('/care-plans')
        .send({
          title: 'Care Plan 1',
          serviceUserId: 1,
          startDate: '2023-01-01',
          status: 'active'
        });
      
      // Assert the response
      expect(response.status).to.equal(201);
      expect(response.body).to.deep.equal(mockCarePlan);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.insert.calledOnce).to.be.true;
      expect(dbMock.values.calledOnce).to.be.true;
      expect(dbMock.returning.calledTwice).to.be.true;
    });
    
    it('should return 400 if validation fails', async () => {
      // Make the request with invalid data
      const response = await request.post('/care-plans')
        .send({
          title: 'Care Plan 1',
          // Missing required fields
        });
      
      // Assert the response
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'validation_error');
      expect(dbMock.insert.called).to.be.false;
    });
    
    it('should return 400 if service user not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.post('/care-plans')
        .send({
          title: 'Care Plan 1',
          serviceUserId: 999,
          startDate: '2023-01-01',
          status: 'active'
        });
      
      // Assert the response
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'bad_request');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.insert.called).to.be.false;
    });
  });
  
  describe('PATCH /care-plans/:id', () => {
    it('should update a care plan', async () => {
      // Mock the database response
      const mockCarePlan = { 
        id: 1, 
        title: 'Care Plan Updated', 
        serviceUserId: 1, 
        status: 'active' 
      };
      dbMock.returning.onFirstCall().returns([{ id: 1, title: 'Care Plan 1', serviceUserId: 1, status: 'active' }]);
      dbMock.returning.onSecondCall().returns([mockCarePlan]);
      
      // Make the request
      const response = await request.patch('/care-plans/1')
        .send({
          title: 'Care Plan Updated'
        });
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockCarePlan);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.update.calledOnce).to.be.true;
      expect(dbMock.set.calledOnce).to.be.true;
      expect(dbMock.returning.calledTwice).to.be.true;
    });
    
    it('should return 404 if care plan not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.patch('/care-plans/999')
        .send({
          title: 'Care Plan Updated'
        });
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.update.called).to.be.false;
    });
  });
  
  describe('DELETE /care-plans/:id', () => {
    it('should delete a care plan', async () => {
      // Mock the database response
      dbMock.returning.returns([{ id: 1, title: 'Care Plan 1', serviceUserId: 1, status: 'active' }]);
      
      // Make the request
      const response = await request.delete('/care-plans/1');
      
      // Assert the response
      expect(response.status).to.equal(204);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.delete.calledOnce).to.be.true;
    });
    
    it('should return 404 if care plan not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.delete('/care-plans/999');
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.delete.called).to.be.false;
    });
  });
});
