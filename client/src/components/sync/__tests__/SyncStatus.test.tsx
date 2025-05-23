/**
 * Unit tests for the SyncStatus component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncStatus } from '../SyncStatus';
import { SyncProvider } from '../../../contexts/sync-context';
import SyncService from '../../../services/sync-service';

// Mock SyncService
vi.mock('../../../services/sync-service', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(undefined),
    queueOperation: vi.fn().mockResolvedValue('test-operation-id'),
    processPendingOperations: vi.fn().mockResolvedValue(undefined),
    retryFailedOperations: vi.fn().mockResolvedValue(undefined),
    getPendingOperations: vi.fn().mockResolvedValue([
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
        timestamp: Date.now(),
        retries: 0,
        status: 'pending',
        entityType: 'test',
        entityId: '123',
      },
    ]),
    getErrorOperations: vi.fn().mockResolvedValue([
      {
        id: '2',
        url: '/api/test',
        method: 'PUT',
        body: JSON.stringify({ test: 'error' }),
        headers: { 'Content-Type': 'application/json' },
        timestamp: Date.now(),
        retries: 1,
        status: 'error',
        errorMessage: 'Test error',
        entityType: 'test',
        entityId: '456',
      },
    ]),
    getPendingOperationsCount: vi.fn().mockResolvedValue(1),
    hasPendingOperations: vi.fn().mockResolvedValue(true),
    getErrorOperationsCount: vi.fn().mockResolvedValue(1),
    clearSyncQueue: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn().mockReturnValue('5 minutes ago'),
}));

describe('SyncStatus', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // Reset mocks
    vi.resetAllMocks();
  });
  
  // Test rendering with banner
  it('should render with banner when showBanner is true', async () => {
    render(
      <SyncProvider>
        <SyncStatus showBanner={true} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      // Check that the banner is rendered
      expect(screen.getByText(/1 change pending synchronization/i)).toBeInTheDocument();
    });
  });
  
  // Test rendering without banner
  it('should render without banner when showBanner is false', async () => {
    render(
      <SyncProvider>
        <SyncStatus showBanner={false} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      // Check that the banner is not rendered
      expect(screen.queryByText(/1 change pending synchronization/i)).not.toBeInTheDocument();
      
      // Check that the button is rendered
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
  
  // Test sync button click
  it('should open sync dialog when sync button is clicked', async () => {
    render(
      <SyncProvider>
        <SyncStatus showBanner={true} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText(/1 change pending synchronization/i)).toBeInTheDocument();
    });
    
    // Click the sync button
    fireEvent.click(screen.getByText(/sync now/i));
    
    // Check that the dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/sync changes/i)).toBeInTheDocument();
      expect(screen.getByText(/pending changes/i)).toBeInTheDocument();
      expect(screen.getByText(/failed changes/i)).toBeInTheDocument();
    });
  });
  
  // Test sync now button in dialog
  it('should call syncPendingOperations when Sync Now button is clicked in dialog', async () => {
    render(
      <SyncProvider>
        <SyncStatus showBanner={true} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText(/1 change pending synchronization/i)).toBeInTheDocument();
    });
    
    // Click the sync button to open the dialog
    fireEvent.click(screen.getByText(/sync now/i));
    
    // Wait for the dialog to open
    await waitFor(() => {
      expect(screen.getByText(/sync changes/i)).toBeInTheDocument();
    });
    
    // Click the Sync Now button in the dialog
    fireEvent.click(screen.getByText(/sync now/i, { selector: 'button' }));
    
    // Check that SyncService.processPendingOperations was called
    expect(SyncService.processPendingOperations).toHaveBeenCalled();
  });
  
  // Test retry failed button in dialog
  it('should call retryFailedOperations when Retry Failed button is clicked in dialog', async () => {
    render(
      <SyncProvider>
        <SyncStatus showBanner={true} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText(/1 change pending synchronization/i)).toBeInTheDocument();
      expect(screen.getByText(/1 error during synchronization/i)).toBeInTheDocument();
    });
    
    // Click the sync button to open the dialog
    fireEvent.click(screen.getByText(/sync now/i));
    
    // Wait for the dialog to open
    await waitFor(() => {
      expect(screen.getByText(/sync changes/i)).toBeInTheDocument();
    });
    
    // Click the Retry Failed button in the dialog
    fireEvent.click(screen.getByText(/retry failed/i));
    
    // Check that SyncService.retryFailedOperations was called
    expect(SyncService.retryFailedOperations).toHaveBeenCalled();
  });
  
  // Test offline state
  it('should show offline message when offline', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    render(
      <SyncProvider>
        <SyncStatus showBanner={true} showButton={true} />
      </SyncProvider>
    );
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
    });
    
    // Click the sync button to open the dialog
    fireEvent.click(screen.getByText(/sync now/i));
    
    // Wait for the dialog to open
    await waitFor(() => {
      expect(screen.getByText(/sync changes/i)).toBeInTheDocument();
      expect(screen.getByText(/you are currently offline/i)).toBeInTheDocument();
    });
    
    // Check that the Sync Now button is not present
    expect(screen.queryByText(/sync now/i, { selector: 'button' })).not.toBeInTheDocument();
  });
});
