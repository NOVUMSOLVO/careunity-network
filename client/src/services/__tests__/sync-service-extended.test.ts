/**
 * Extended tests for the Sync Service
 * 
 * This test file covers edge cases and error scenarios for the sync service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncService } from '../sync-service';
import { getDB } from '../../lib/indexed-db';

// Mock the IndexedDB
vi.mock('../../lib/indexed-db', () => ({
  getDB: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('SyncService - Extended Tests', () => {
  let syncService: SyncService;
  let mockDB: any;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock DB
    mockDB = {
      getAll: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue('operation-id'),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    
    (getDB as any).mockResolvedValue({
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue(mockDB),
      }),
    });
    
    // Create a new instance of SyncService
    syncService = new SyncService();
    
    // Mock successful fetch by default
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
  });
  
  afterEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
    });
  });
  
  // Edge case: Queue operation when offline
  it('should queue operation when offline and not attempt to process', async () => {
    // Set offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
    });
    
    const processQueueSpy = vi.spyOn(syncService, 'processQueue');
    
    await syncService.queueOperation(
      '/api/test',
      'POST',
      { data: 'test' },
      { 'Content-Type': 'application/json' },
      'test',
      '123'
    );
    
    expect(mockDB.add).toHaveBeenCalled();
    expect(processQueueSpy).not.toHaveBeenCalled();
  });
  
  // Error scenario: Network error during sync
  it('should handle network errors during sync and mark operation for retry', async () => {
    // Setup a pending operation
    mockDB.getAll.mockResolvedValue([
      {
        id: 'op1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'Content-Type': 'application/json' },
        status: 'pending',
        retries: 0,
        timestamp: Date.now(),
      },
    ]);
    
    // Mock network error
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    await syncService.processQueue();
    
    // Should update the operation with increased retry count
    expect(mockDB.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 'op1',
      status: 'pending',
      retries: 1,
    }));
  });
  
  // Edge case: Max retries reached
  it('should mark operation as failed after max retries', async () => {
    const MAX_RETRIES = 3; // Assuming this is the max retry value in the service
    
    // Setup an operation that has reached max retries
    mockDB.getAll.mockResolvedValue([
      {
        id: 'op1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'Content-Type': 'application/json' },
        status: 'pending',
        retries: MAX_RETRIES,
        timestamp: Date.now(),
      },
    ]);
    
    // Mock network error
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    await syncService.processQueue();
    
    // Should mark the operation as failed
    expect(mockDB.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 'op1',
      status: 'failed',
      retries: MAX_RETRIES + 1,
    }));
  });
  
  // Error scenario: Server error (500)
  it('should handle server errors and mark operation for retry', async () => {
    // Setup a pending operation
    mockDB.getAll.mockResolvedValue([
      {
        id: 'op1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'Content-Type': 'application/json' },
        status: 'pending',
        retries: 0,
        timestamp: Date.now(),
      },
    ]);
    
    // Mock server error
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });
    
    await syncService.processQueue();
    
    // Should update the operation with increased retry count
    expect(mockDB.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 'op1',
      status: 'pending',
      retries: 1,
    }));
  });
  
  // Error scenario: Client error (400)
  it('should handle client errors and mark operation as failed', async () => {
    // Setup a pending operation
    mockDB.getAll.mockResolvedValue([
      {
        id: 'op1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'Content-Type': 'application/json' },
        status: 'pending',
        retries: 0,
        timestamp: Date.now(),
      },
    ]);
    
    // Mock client error
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });
    
    await syncService.processQueue();
    
    // Should mark the operation as failed without retry
    expect(mockDB.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 'op1',
      status: 'failed',
      error: expect.any(String),
    }));
  });
  
  // Edge case: Conflict resolution (409)
  it('should handle conflict responses and mark operation accordingly', async () => {
    // Setup a pending operation
    mockDB.getAll.mockResolvedValue([
      {
        id: 'op1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'Content-Type': 'application/json' },
        status: 'pending',
        retries: 0,
        timestamp: Date.now(),
      },
    ]);
    
    // Mock conflict response
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Conflict', conflictDetails: { id: '123' } }),
    });
    
    await syncService.processQueue();
    
    // Should mark the operation as conflict
    expect(mockDB.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 'op1',
      status: 'conflict',
      conflictDetails: expect.any(Object),
    }));
  });
});
