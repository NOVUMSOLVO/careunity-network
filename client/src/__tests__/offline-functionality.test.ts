/**
 * Offline Functionality Tests
 * 
 * This file contains tests for the offline functionality of the application.
 */

import { offlineStorageService } from '../services/offline-storage-service';
import { syncService } from '../services/sync-service';
import { networkStatus } from '../utils/network-status';
import { apiClient } from '../services/enhanced-api-client';

// Mock the IndexedDB
jest.mock('idb', () => {
  const mockDB = {
    transaction: jest.fn().mockReturnThis(),
    objectStore: jest.fn().mockReturnThis(),
    put: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    getAll: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getAllFromIndex: jest.fn().mockResolvedValue([]),
  };
  
  return {
    openDB: jest.fn().mockResolvedValue(mockDB),
  };
});

// Mock fetch
const originalFetch = global.fetch;
let mockFetchImplementation: jest.Mock;

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Mock fetch
  mockFetchImplementation = jest.fn();
  global.fetch = mockFetchImplementation;
  
  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: true,
  });
});

afterEach(() => {
  // Restore fetch
  global.fetch = originalFetch;
});

describe('Offline Storage Service', () => {
  test('should initialize successfully', async () => {
    await expect(offlineStorageService.initialize()).resolves.not.toThrow();
  });
  
  test('should add a pending request', async () => {
    await offlineStorageService.initialize();
    
    const url = '/api/test';
    const method = 'POST';
    const headers = { 'Content-Type': 'application/json' };
    const body = { test: 'data' };
    
    const id = await offlineStorageService.addPendingRequest(url, method, headers, body);
    
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });
  
  test('should cache a response', async () => {
    await offlineStorageService.initialize();
    
    const url = '/api/test';
    const response = { data: 'test' };
    
    await offlineStorageService.cacheResponse(url, response);
    
    // Mock the get method to return our cached response
    const mockGet = require('idb').openDB().get;
    mockGet.mockResolvedValueOnce({
      url,
      response,
      timestamp: Date.now(),
    });
    
    const cachedResponse = await offlineStorageService.getCachedResponse(url);
    
    expect(cachedResponse).toEqual(response);
  });
  
  test('should store and retrieve an entity', async () => {
    await offlineStorageService.initialize();
    
    const entity = { id: '1', name: 'Test Entity', timestamp: Date.now() };
    
    await offlineStorageService.storeEntity('serviceUsers', entity);
    
    // Mock the get method to return our entity
    const mockGet = require('idb').openDB().get;
    mockGet.mockResolvedValueOnce(entity);
    
    const retrievedEntity = await offlineStorageService.getEntity('serviceUsers', '1');
    
    expect(retrievedEntity).toEqual(entity);
  });
});

describe('Sync Service', () => {
  test('should initialize successfully', async () => {
    await expect(syncService.initialize()).resolves.not.toThrow();
  });
  
  test('should not sync when offline', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    
    await syncService.initialize();
    
    const result = await syncService.syncPendingRequests();
    
    expect(result.status).toBe('error');
    expect(result.successCount).toBe(0);
    expect(result.errorCount).toBe(0);
    expect(result.errors[0].error).toBe('Network is offline');
  });
  
  test('should sync pending requests when online', async () => {
    // Mock pending requests
    const mockGetPendingRequests = jest.spyOn(offlineStorageService, 'getPendingRequests');
    mockGetPendingRequests.mockResolvedValueOnce([
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
        timestamp: Date.now(),
        attempts: 0,
      },
    ]);
    
    // Mock successful fetch
    mockFetchImplementation.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    
    // Mock remove pending request
    const mockRemovePendingRequest = jest.spyOn(offlineStorageService, 'removePendingRequest');
    mockRemovePendingRequest.mockResolvedValueOnce(undefined);
    
    await syncService.initialize();
    
    const result = await syncService.syncPendingRequests();
    
    expect(result.status).toBe('success');
    expect(result.successCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(mockFetchImplementation).toHaveBeenCalledTimes(1);
    expect(mockRemovePendingRequest).toHaveBeenCalledWith('1');
  });
});

describe('Enhanced API Client', () => {
  test('should make a successful GET request', async () => {
    // Mock successful fetch
    mockFetchImplementation.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'test' }),
    });
    
    const response = await apiClient.get('/api/test');
    
    expect(response.data).toEqual({ data: 'test' });
    expect(response.error).toBeNull();
    expect(response.status).toBe(200);
    expect(mockFetchImplementation).toHaveBeenCalledTimes(1);
  });
  
  test('should use cached response for GET request', async () => {
    // Mock getCachedResponse to return a cached response
    const mockGetCachedResponse = jest.spyOn(offlineStorageService, 'getCachedResponse');
    mockGetCachedResponse.mockResolvedValueOnce({ data: 'cached' });
    
    const response = await apiClient.get('/api/test', { cache: true });
    
    expect(response.data).toEqual({ data: 'cached' });
    expect(response.cached).toBe(true);
    expect(mockFetchImplementation).not.toHaveBeenCalled();
  });
  
  test('should queue POST request when offline', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    
    // Mock addPendingRequest
    const mockAddPendingRequest = jest.spyOn(offlineStorageService, 'addPendingRequest');
    mockAddPendingRequest.mockResolvedValueOnce('1');
    
    const response = await apiClient.post('/api/test', { test: 'data' }, { offlineSupport: true });
    
    expect(response.data).toBeNull();
    expect(response.error).not.toBeNull();
    expect(response.offline).toBe(true);
    expect(mockAddPendingRequest).toHaveBeenCalledTimes(1);
    expect(mockFetchImplementation).not.toHaveBeenCalled();
  });
  
  test('should retry failed requests', async () => {
    // First request fails with network error
    mockFetchImplementation.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    // Second request succeeds
    mockFetchImplementation.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'test' }),
    });
    
    const response = await apiClient.get('/api/test', { retry: true, retryCount: 1 });
    
    expect(response.data).toEqual({ data: 'test' });
    expect(response.error).toBeNull();
    expect(mockFetchImplementation).toHaveBeenCalledTimes(2);
  });
});

describe('Network Status', () => {
  test('should detect online status', () => {
    expect(networkStatus.isOnline()).toBe(true);
  });
  
  test('should detect offline status', () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    
    expect(networkStatus.isOnline()).toBe(false);
  });
  
  test('should notify listeners when going offline', () => {
    const offlineListener = jest.fn();
    networkStatus.addOfflineListener(offlineListener);
    
    // Simulate going offline
    window.dispatchEvent(new Event('offline'));
    
    expect(offlineListener).toHaveBeenCalledTimes(1);
  });
  
  test('should notify listeners when going online', () => {
    const onlineListener = jest.fn();
    networkStatus.addOnlineListener(onlineListener);
    
    // Simulate going online
    window.dispatchEvent(new Event('online'));
    
    expect(onlineListener).toHaveBeenCalledTimes(1);
  });
});
