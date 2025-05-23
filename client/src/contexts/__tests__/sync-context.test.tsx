/**
 * Unit tests for the sync context
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncProvider, useSync } from '../../contexts/sync-context';
import SyncService from '../../services/sync-service';

// Mock SyncService
vi.mock('../../services/sync-service', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(undefined),
    queueOperation: vi.fn().mockResolvedValue('test-operation-id'),
    processPendingOperations: vi.fn().mockResolvedValue(undefined),
    retryFailedOperations: vi.fn().mockResolvedValue(undefined),
    getPendingOperations: vi.fn().mockResolvedValue([]),
    getErrorOperations: vi.fn().mockResolvedValue([]),
    getPendingOperationsCount: vi.fn().mockResolvedValue(0),
    hasPendingOperations: vi.fn().mockResolvedValue(false),
    getErrorOperationsCount: vi.fn().mockResolvedValue(0),
    clearSyncQueue: vi.fn().mockResolvedValue(undefined),
  },
}));

// Test component that uses the sync context
function TestComponent() {
  const {
    isOnline,
    hasPendingOperations,
    pendingOperationsCount,
    errorOperationsCount,
    isSyncing,
    syncStatus,
    queueOperation,
    syncPendingOperations,
    retryFailedOperations,
  } = useSync();
  
  return (
    <div>
      <div data-testid="online-status">{isOnline ? 'Online' : 'Offline'}</div>
      <div data-testid="pending-status">{hasPendingOperations ? 'Has Pending' : 'No Pending'}</div>
      <div data-testid="pending-count">{pendingOperationsCount}</div>
      <div data-testid="error-count">{errorOperationsCount}</div>
      <div data-testid="sync-status">{isSyncing ? 'Syncing' : 'Not Syncing'}</div>
      <div data-testid="sync-result">{syncStatus}</div>
      
      <button
        data-testid="queue-button"
        onClick={() => queueOperation('/api/test', 'POST', { test: 'data' })}
      >
        Queue Operation
      </button>
      
      <button
        data-testid="sync-button"
        onClick={() => syncPendingOperations()}
      >
        Sync Now
      </button>
      
      <button
        data-testid="retry-button"
        onClick={() => retryFailedOperations()}
      >
        Retry Failed
      </button>
    </div>
  );
}

describe('SyncContext', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // Mock window.addEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
    
    // Reset mocks
    vi.resetAllMocks();
  });
  
  // Clean up mocks after each test
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  // Test that the provider initializes correctly
  it('should initialize correctly', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Check that SyncService.initialize was called
    expect(SyncService.initialize).toHaveBeenCalled();
    
    // Check initial state
    expect(screen.getByTestId('online-status')).toHaveTextContent('Online');
    expect(screen.getByTestId('pending-status')).toHaveTextContent('No Pending');
    expect(screen.getByTestId('pending-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('sync-status')).toHaveTextContent('Not Syncing');
    expect(screen.getByTestId('sync-result')).toHaveTextContent('idle');
  });
  
  // Test queueing an operation
  it('should queue an operation', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the queue button
    fireEvent.click(screen.getByTestId('queue-button'));
    
    // Check that SyncService.queueOperation was called
    expect(SyncService.queueOperation).toHaveBeenCalledWith(
      '/api/test',
      'POST',
      { test: 'data' },
      undefined,
      undefined,
      undefined
    );
  });
  
  // Test syncing pending operations
  it('should sync pending operations', async () => {
    // Mock hasPendingOperations to return true
    SyncService.hasPendingOperations = vi.fn().mockResolvedValue(true);
    
    // Mock getPendingOperationsCount to return 1
    SyncService.getPendingOperationsCount = vi.fn().mockResolvedValue(1);
    
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByTestId('pending-status')).toHaveTextContent('Has Pending');
      expect(screen.getByTestId('pending-count')).toHaveTextContent('1');
    });
    
    // Click the sync button
    fireEvent.click(screen.getByTestId('sync-button'));
    
    // Check that SyncService.processPendingOperations was called
    expect(SyncService.processPendingOperations).toHaveBeenCalled();
    
    // Check that the sync status was updated
    await waitFor(() => {
      expect(screen.getByTestId('sync-status')).toHaveTextContent('Syncing');
      expect(screen.getByTestId('sync-result')).toHaveTextContent('syncing');
    });
  });
  
  // Test retrying failed operations
  it('should retry failed operations', async () => {
    // Mock getErrorOperationsCount to return 1
    SyncService.getErrorOperationsCount = vi.fn().mockResolvedValue(1);
    
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });
    
    // Click the retry button
    fireEvent.click(screen.getByTestId('retry-button'));
    
    // Check that SyncService.retryFailedOperations was called
    expect(SyncService.retryFailedOperations).toHaveBeenCalled();
    
    // Check that the sync status was updated
    await waitFor(() => {
      expect(screen.getByTestId('sync-status')).toHaveTextContent('Syncing');
      expect(screen.getByTestId('sync-result')).toHaveTextContent('syncing');
    });
  });
  
  // Test handling offline state
  it('should handle offline state', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    // Trigger the offline event
    const offlineHandler = window.addEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )[1];
    offlineHandler();
    
    // Check that the online status was updated
    await waitFor(() => {
      expect(screen.getByTestId('online-status')).toHaveTextContent('Offline');
    });
    
    // Try to sync while offline
    fireEvent.click(screen.getByTestId('sync-button'));
    
    // Check that SyncService.processPendingOperations was not called
    expect(SyncService.processPendingOperations).not.toHaveBeenCalled();
  });
});
