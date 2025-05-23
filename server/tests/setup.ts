/**
 * Test setup file
 */

import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';
import { db } from '../db';

// Export test utilities
export { expect, sinon, supertest };

/**
 * Create a test app with the given routes
 */
export function createTestApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
}

/**
 * Mock authentication middleware for testing
 */
export function mockAuthMiddleware(role: string = 'admin') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.user = {
      id: 1,
      username: 'testuser',
      role,
    };
    next();
  };
}

/**
 * Mock database for testing
 */
export function mockDb() {
  const dbMock = {
    select: sinon.stub().returnsThis(),
    from: sinon.stub().returnsThis(),
    where: sinon.stub().returnsThis(),
    limit: sinon.stub().returnsThis(),
    offset: sinon.stub().returnsThis(),
    insert: sinon.stub().returnsThis(),
    values: sinon.stub().returnsThis(),
    returning: sinon.stub(),
    update: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis(),
    delete: sinon.stub().returnsThis(),
  };
  
  // Replace the real db with the mock
  sinon.stub(db, 'select').callsFake(dbMock.select);
  sinon.stub(db, 'insert').callsFake(dbMock.insert);
  sinon.stub(db, 'update').callsFake(dbMock.update);
  sinon.stub(db, 'delete').callsFake(dbMock.delete);
  
  return dbMock;
}

/**
 * Restore all sinon stubs
 */
export function restoreStubs() {
  sinon.restore();
}
