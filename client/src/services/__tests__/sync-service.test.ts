/**
 * Unit tests for the sync service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SyncService from '../../services/sync-service';
import {
  mockIndexedDB,
  mockIDBDatabase,
  mockIDBTransaction,
  mockIDBObjectStore,
  mockIDBIndex,
  resetIndexedDBMocks
} from '../../test/mocks/indexeddb-mock';

// Mock fetch
const mockFetch = vi.fn();

// Mock navigator
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    ready: Promise.resolve({
      sync: {
        register: vi.fn(),
      },
      addEventListener: vi.fn(),
    }),
    addEventListener: vi.fn(),
  },
};

// Mock window
const mockWindow = {
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

describe('SyncService', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Reset IndexedDB mocks
    resetIndexedDBMocks();

    // Mock global objects
    global.indexedDB = mockIndexedDB as any;
    global.fetch = mockFetch as any;
    global.navigator = mockNavigator as any;
    global.window = mockWindow as any;

    // Reset all mocks
    vi.resetAllMocks();

    // Setup default mock responses
    mockIDBObjectStore.getAllFromIndex.mockResolvedValue([]);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ success: true }),
    });
  });

  // Clean up mocks after each test
  afterEach(() => {
    vi.resetAllMocks();
    resetIndexedDBMocks();
  });

  // Test initialization
  it('should initialize correctly', async () => {
    await SyncService.initialize();

    // Check that the database was opened
    expect(mockIndexedDB.open).toHaveBeenCalledWith('careunityOfflineDB', 1);

    // Check that event listeners were added
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  // Test queueing an operation
  it('should queue an operation', async () => {
    const url = '/api/test';
    const method = 'POST';
    const data = { test: 'data' };
    const headers = { 'Content-Type': 'application/json' };
    const entityType = 'test';
    const entityId = '123';

    const operationId = await SyncService.queueOperation(url, method, data, headers, entityType, entityId);

    // Check that the operation was added to the queue
    expect(mockIDBObjectStore.add).toHaveBeenCalledWith(expect.objectContaining({
      url,
      method,
      body: JSON.stringify(data),
      headers,
      entityType,
      entityId,
      status: 'pending',
    }));

    // Check that an event was dispatched
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));

    // Check that the operation ID was returned
    expect(operationId).toBeDefined();
  });

  // Test processing pending operations when online
  it('should process pending operations when online', async () => {
    // Mock navigator.onLine to return true
    Object.defineProperty(navigator, 'onLine', { value: true });

    // Mock getAllFromIndex to return some pending operations
    const pendingOperations = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
        timestamp: Date.now(),
        retries: 0,
        status: 'pending',
      },
    ];
    mockIDBObjectStore.getAllFromIndex.mockResolvedValue(pendingOperations);

    // Mock fetch to return a successful response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });

    await SyncService.processPendingOperations();

    // Check that fetch was called with the correct arguments
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    // Check that the operation status was updated to completed
    expect(mockIDBObjectStore.put).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      status: 'completed',
    }));
  });

  // Test handling offline state
  it('should not process operations when offline', async () => {
    // Mock navigator.onLine to return false
    Object.defineProperty(navigator, 'onLine', { value: false });

    await SyncService.processPendingOperations();

    // Check that fetch was not called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Test retrying failed operations
  it('should retry failed operations', async () => {
    // Mock getAllFromIndex to return some error operations
    const errorOperations = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
        timestamp: Date.now(),
        retries: 1,
        status: 'error',
        errorMessage: 'Test error',
      },
    ];
    mockIDBObjectStore.getAllFromIndex.mockResolvedValue(errorOperations);

    await SyncService.retryFailedOperations();

    // Check that the operation status was updated to pending
    expect(mockIDBObjectStore.put).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      status: 'pending',
    }));
  });

  // Test cleaning up completed operations
  it('should clean up completed operations', async () => {
    // Mock getAllFromIndex to return some completed operations
    const completedOperations = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
        timestamp: Date.now(),
        retries: 0,
        status: 'completed',
      },
    ];
    mockIDBObjectStore.getAllFromIndex.mockResolvedValue(completedOperations);

    await SyncService.cleanupCompletedOperations();

    // Check that the completed operations were deleted
    expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('1');
  });
});
