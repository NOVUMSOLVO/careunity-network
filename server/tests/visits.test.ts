/**
 * Integration tests for the Visits API
 */

import { expect, supertest } from './setup';
import express from 'express';
import visitsRoutes from '../routes/visits';
import { mockAuthMiddleware } from './setup';
import { errorHandler } from '../middleware/error-handler';
import { db } from '../db';

// Skip these tests in CI environments
const skipIfCI = process.env.CI ? describe.skip : describe;

skipIfCI('Visits API Integration Tests', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;
  let createdVisitId: number;
  
  before(() => {
    // Create a router with mock authentication
    const router = express.Router();
    router.use(express.json());
    router.use(mockAuthMiddleware('admin'));
    
    // Mount the routes
    router.use('/visits', visitsRoutes);
    
    // Add error handling
    router.use(errorHandler);
    
    // Create the app
    app = express();
    app.use(router);
    
    // Create the request
    request = supertest(app);
  });
  
  describe('POST /visits', () => {
    it('should create a new visit', async () => {
      const visitData = {
        serviceUserId: 1,
        caregiverId: 2,
        date: '2023-10-15',
        startTime: '2023-10-15T09:00:00Z',
        endTime: '2023-10-15T10:00:00Z',
        visitType: 'personal care',
        priority: 'normal',
        notes: 'Test visit'
      };
      
      const response = await request
        .post('/visits')
        .send(visitData)
        .expect(201);
      
      expect(response.body).to.have.property('id');
      expect(response.body.serviceUserId).to.equal(visitData.serviceUserId);
      expect(response.body.caregiverId).to.equal(visitData.caregiverId);
      expect(response.body.date).to.equal(visitData.date);
      expect(response.body.visitType).to.equal(visitData.visitType);
      
      createdVisitId = response.body.id;
    });
    
    it('should return 400 for invalid visit data', async () => {
      const invalidData = {
        // Missing required fields
        date: '2023-10-15',
        startTime: '2023-10-15T09:00:00Z',
        endTime: '2023-10-15T08:00:00Z', // End time before start time
      };
      
      await request
        .post('/visits')
        .send(invalidData)
        .expect(400);
    });
  });
  
  describe('GET /visits', () => {
    it('should get all visits', async () => {
      const response = await request
        .get('/visits')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.at.least(1);
    });
    
    it('should filter visits by date', async () => {
      const response = await request
        .get('/visits?date=2023-10-15')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      response.body.forEach((visit: any) => {
        expect(visit.date).to.equal('2023-10-15');
      });
    });
    
    it('should filter visits by caregiver ID', async () => {
      const response = await request
        .get('/visits?caregiverId=2')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      response.body.forEach((visit: any) => {
        expect(visit.caregiverId).to.equal(2);
      });
    });
  });
  
  describe('GET /visits/:id', () => {
    it('should get a visit by ID', async () => {
      const response = await request
        .get(`/visits/${createdVisitId}`)
        .expect(200);
      
      expect(response.body).to.have.property('id', createdVisitId);
      expect(response.body).to.have.property('serviceUser');
      expect(response.body).to.have.property('caregiver');
    });
    
    it('should return 404 for non-existent visit', async () => {
      await request
        .get('/visits/9999')
        .expect(404);
    });
  });
  
  describe('PUT /visits/:id', () => {
    it('should update a visit', async () => {
      const updateData = {
        notes: 'Updated test visit',
        priority: 'high'
      };
      
      const response = await request
        .put(`/visits/${createdVisitId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).to.have.property('id', createdVisitId);
      expect(response.body.notes).to.equal(updateData.notes);
      expect(response.body.priority).to.equal(updateData.priority);
    });
  });
  
  describe('POST /visits/:id/complete', () => {
    it('should complete a visit', async () => {
      const completeData = {
        notes: 'Visit completed successfully',
        feedback: 'Good service',
        feedbackRating: 5
      };
      
      const response = await request
        .post(`/visits/${createdVisitId}/complete`)
        .send(completeData)
        .expect(200);
      
      expect(response.body).to.have.property('id', createdVisitId);
      expect(response.body.status).to.equal('completed');
      expect(response.body.feedback).to.equal(completeData.feedback);
      expect(response.body.feedbackRating).to.equal(completeData.feedbackRating);
      expect(response.body).to.have.property('completedAt');
      expect(response.body).to.have.property('completedBy');
    });
  });
  
  describe('POST /visits/:id/cancel', () => {
    it('should create and then cancel a visit', async () => {
      // First create a new visit to cancel
      const visitData = {
        serviceUserId: 1,
        caregiverId: 2,
        date: '2023-10-16',
        startTime: '2023-10-16T09:00:00Z',
        endTime: '2023-10-16T10:00:00Z',
        visitType: 'personal care',
        priority: 'normal'
      };
      
      const createResponse = await request
        .post('/visits')
        .send(visitData)
        .expect(201);
      
      const visitId = createResponse.body.id;
      
      // Now cancel the visit
      const cancelData = {
        reason: 'Service user unavailable'
      };
      
      const response = await request
        .post(`/visits/${visitId}/cancel`)
        .send(cancelData)
        .expect(200);
      
      expect(response.body).to.have.property('id', visitId);
      expect(response.body.status).to.equal('cancelled');
      expect(response.body.notes).to.include(cancelData.reason);
    });
  });
  
  after(async () => {
    // Clean up created visits
    if (createdVisitId) {
      try {
        await db.delete('visits').where('id = ?', [createdVisitId]);
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }
    }
  });
});
