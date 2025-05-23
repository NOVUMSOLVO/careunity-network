/**
 * Service User API tests
 */

import { expect, sinon, supertest, createTestApp, mockAuthMiddleware, mockDb, restoreStubs } from './setup';
import serviceUserRoutes from '../routes/service-users';
import express from 'express';
import { validateBody, validateParams } from '../middleware/validation';
import { errorHandler } from '../middleware/error-handler';

describe('Service User API', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;
  let dbMock: any;
  
  beforeEach(() => {
    // Create a router with mock authentication
    const router = express.Router();
    router.use(mockAuthMiddleware());
    router.use('/service-users', serviceUserRoutes);
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
  
  describe('GET /service-users', () => {
    it('should return all service users', async () => {
      // Mock the database response
      const mockServiceUsers = [
        { id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' },
        { id: 2, fullName: 'Jane Smith', uniqueId: 'SU002', status: 'active' },
      ];
      dbMock.returning.returns(mockServiceUsers);
      
      // Make the request
      const response = await request.get('/service-users');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockServiceUsers);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
    });
    
    it('should handle search query', async () => {
      // Mock the database response
      const mockServiceUsers = [
        { id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' },
      ];
      dbMock.returning.returns(mockServiceUsers);
      
      // Make the request
      const response = await request.get('/service-users?query=John');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockServiceUsers);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
  });
  
  describe('GET /service-users/:id', () => {
    it('should return a service user by ID', async () => {
      // Mock the database response
      const mockServiceUser = { id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' };
      dbMock.returning.returns([mockServiceUser]);
      
      // Make the request
      const response = await request.get('/service-users/1');
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockServiceUser);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
    
    it('should return 404 if service user not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.get('/service-users/999');
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.from.calledOnce).to.be.true;
      expect(dbMock.where.calledOnce).to.be.true;
    });
  });
  
  describe('POST /service-users', () => {
    it('should create a new service user', async () => {
      // Mock the database response
      const mockServiceUser = { 
        id: 1, 
        fullName: 'John Doe', 
        uniqueId: 'SU001', 
        dateOfBirth: '1990-01-01',
        address: '123 Main St',
        status: 'active' 
      };
      dbMock.returning.returns([mockServiceUser]);
      
      // Make the request
      const response = await request.post('/service-users')
        .send({
          fullName: 'John Doe',
          uniqueId: 'SU001',
          dateOfBirth: '1990-01-01',
          address: '123 Main St',
          status: 'active'
        });
      
      // Assert the response
      expect(response.status).to.equal(201);
      expect(response.body).to.deep.equal(mockServiceUser);
      expect(dbMock.insert.calledOnce).to.be.true;
      expect(dbMock.values.calledOnce).to.be.true;
      expect(dbMock.returning.calledOnce).to.be.true;
    });
    
    it('should return 400 if validation fails', async () => {
      // Make the request with invalid data
      const response = await request.post('/service-users')
        .send({
          fullName: 'John Doe',
          // Missing required fields
        });
      
      // Assert the response
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'validation_error');
      expect(dbMock.insert.called).to.be.false;
    });
  });
  
  describe('PATCH /service-users/:id', () => {
    it('should update a service user', async () => {
      // Mock the database response
      const mockServiceUser = { 
        id: 1, 
        fullName: 'John Updated', 
        uniqueId: 'SU001', 
        status: 'active' 
      };
      dbMock.returning.onFirstCall().returns([{ id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' }]);
      dbMock.returning.onSecondCall().returns([mockServiceUser]);
      
      // Make the request
      const response = await request.patch('/service-users/1')
        .send({
          fullName: 'John Updated'
        });
      
      // Assert the response
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockServiceUser);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.update.calledOnce).to.be.true;
      expect(dbMock.set.calledOnce).to.be.true;
      expect(dbMock.returning.calledTwice).to.be.true;
    });
    
    it('should return 404 if service user not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.patch('/service-users/999')
        .send({
          fullName: 'John Updated'
        });
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.update.called).to.be.false;
    });
  });
  
  describe('DELETE /service-users/:id', () => {
    it('should delete a service user', async () => {
      // Mock the database response
      dbMock.returning.returns([{ id: 1, fullName: 'John Doe', uniqueId: 'SU001', status: 'active' }]);
      
      // Make the request
      const response = await request.delete('/service-users/1');
      
      // Assert the response
      expect(response.status).to.equal(204);
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.delete.calledOnce).to.be.true;
    });
    
    it('should return 404 if service user not found', async () => {
      // Mock the database response
      dbMock.returning.returns([]);
      
      // Make the request
      const response = await request.delete('/service-users/999');
      
      // Assert the response
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'not_found');
      expect(dbMock.select.calledOnce).to.be.true;
      expect(dbMock.delete.called).to.be.false;
    });
  });
});
