import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SyncStatus } from './sync-status';
import { useSync } from '@/contexts/sync-context';
import { useOffline } from '@/components/ui/offline-indicator';

// Mock the sync context
jest.mock('@/contexts/sync-context', () => ({
  useSync: jest.fn()
}));

// Mock the offline indicator
jest.mock('@/components/ui/offline-indicator', () => ({
  useOffline: jest.fn()
}));

describe('SyncStatus', () => {
  const mockSyncPendingOperations = jest.fn();
  const mockRetryFailedOperations = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      lastSyncTime: new Date('2023-06-15T12:00:00Z'),
      pendingOperationsCount: 0,
      errorOperationsCount: 0,
      syncStatus: 'idle',
      syncPendingOperations: mockSyncPendingOperations,
      retryFailedOperations: mockRetryFailedOperations
    });
    
    (useOffline as jest.Mock).mockReturnValue(false);
  });
  
  test('renders nothing when no pending changes and showWhenNoChanges is false', () => {
    (useSync as jest.Mock).mockReturnValue({
      pendingOperationsCount: 0,
      errorOperationsCount: 0
    });
    
    const { container } = render(<SyncStatus showWhenNoChanges={false} />);
    expect(container.firstChild).toBeNull();
  });
  
  test('renders badge variant correctly when online with no pending changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      lastSyncTime: new Date('2023-06-15T12:00:00Z'),
      pendingOperationsCount: 0,
      errorOperationsCount: 0,
      syncStatus: 'success'
    });
    (useOffline as jest.Mock).mockReturnValue(false);
    
    render(<SyncStatus variant="badge" showWhenNoChanges={true} />);
    
    const badge = screen.getByText('Synced');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-outline');
  });
  
  test('renders badge variant correctly when offline', () => {
    (useOffline as jest.Mock).mockReturnValue(true);
    
    render(<SyncStatus variant="badge" />);
    
    const badge = screen.getByText('Offline');
    expect(badge).toBeInTheDocument();
  });
  
  test('renders badge variant correctly when syncing', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: true,
      syncStatus: 'syncing',
      pendingOperationsCount: 5,
      errorOperationsCount: 0
    });
    
    render(<SyncStatus variant="badge" />);
    
    const badge = screen.getByText('Syncing...');
    expect(badge).toBeInTheDocument();
  });
  
  test('renders badge variant correctly with pending changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 3,
      errorOperationsCount: 0,
      syncStatus: 'idle'
    });
    
    render(<SyncStatus variant="badge" />);
    
    const badge = screen.getByText('3 Pending');
    expect(badge).toBeInTheDocument();
  });
  
  test('renders compact variant correctly with pending and error changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 3,
      errorOperationsCount: 2,
      syncStatus: 'error'
    });
    
    render(<SyncStatus variant="compact" />);
    
    expect(screen.getByText('3 Pending')).toBeInTheDocument();
    expect(screen.getByText('2 Failed')).toBeInTheDocument();
    expect(screen.getByText('Sync')).toBeInTheDocument();
  });
  
  test('renders full variant correctly when offline', () => {
    (useOffline as jest.Mock).mockReturnValue(true);
    
    render(<SyncStatus />);
    
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByText('Changes will be synced when you reconnect')).toBeInTheDocument();
  });
  
  test('renders full variant correctly with pending changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 5,
      errorOperationsCount: 0,
      syncStatus: 'idle'
    });
    
    render(<SyncStatus />);
    
    expect(screen.getByText('Pending Changes')).toBeInTheDocument();
    expect(screen.getByText('5 changes pending synchronization')).toBeInTheDocument();
    expect(screen.getByText('Sync Now')).toBeInTheDocument();
  });
  
  test('renders full variant correctly with error changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 0,
      errorOperationsCount: 3,
      syncStatus: 'error'
    });
    
    render(<SyncStatus />);
    
    expect(screen.getByText('Sync Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to sync 3 changes. Please retry.')).toBeInTheDocument();
    expect(screen.getByText('Retry Failed')).toBeInTheDocument();
  });
  
  test('calls syncPendingOperations when sync button is clicked with pending changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 5,
      errorOperationsCount: 0,
      syncStatus: 'idle',
      syncPendingOperations: mockSyncPendingOperations
    });
    
    render(<SyncStatus />);
    
    fireEvent.click(screen.getByText('Sync Now'));
    expect(mockSyncPendingOperations).toHaveBeenCalledTimes(1);
  });
  
  test('calls retryFailedOperations when retry button is clicked with error changes', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      pendingOperationsCount: 0,
      errorOperationsCount: 3,
      syncStatus: 'error',
      retryFailedOperations: mockRetryFailedOperations
    });
    
    render(<SyncStatus />);
    
    fireEvent.click(screen.getByText('Retry Failed'));
    expect(mockRetryFailedOperations).toHaveBeenCalledTimes(1);
  });
  
  test('disables sync button when syncing', () => {
    (useSync as jest.Mock).mockReturnValue({
      isSyncing: true,
      pendingOperationsCount: 5,
      errorOperationsCount: 0,
      syncStatus: 'syncing',
      syncPendingOperations: mockSyncPendingOperations
    });
    
    render(<SyncStatus />);
    
    const syncButton = screen.getByText('Syncing...');
    expect(syncButton.closest('button')).toBeDisabled();
  });
});
