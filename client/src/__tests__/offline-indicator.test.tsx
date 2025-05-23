/**
 * Offline Indicator Tests
 * 
 * This file contains tests for the offline indicator component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineIndicator, OfflineWrapper } from '../components/offline/offline-indicator';
import { OfflineProvider, useOffline } from '../contexts/offline-context';

// Mock the offline context
jest.mock('../contexts/offline-context', () => {
  const originalModule = jest.requireActual('../contexts/offline-context');
  
  return {
    ...originalModule,
    useOffline: jest.fn(),
  };
});

describe('OfflineIndicator', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('should render offline message when offline', () => {
    // Mock useOffline to return offline status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
      isSyncing: false,
      hasPendingChanges: false,
      pendingChangesCount: 0,
      syncPendingChanges: jest.fn(),
      syncStatus: 'idle',
    });
    
    render(<OfflineIndicator />);
    
    expect(screen.getByText('You are offline')).toBeInTheDocument();
  });
  
  test('should render pending changes message when online with pending changes', () => {
    // Mock useOffline to return online status with pending changes
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      hasPendingChanges: true,
      pendingChangesCount: 3,
      syncPendingChanges: jest.fn(),
      syncStatus: 'idle',
    });
    
    render(<OfflineIndicator showPendingCount={true} />);
    
    expect(screen.getByText('3 pending changes')).toBeInTheDocument();
  });
  
  test('should render sync button when online with pending changes', () => {
    // Mock useOffline to return online status with pending changes
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      hasPendingChanges: true,
      pendingChangesCount: 3,
      syncPendingChanges: jest.fn(),
      syncStatus: 'idle',
    });
    
    render(<OfflineIndicator showSyncButton={true} />);
    
    expect(screen.getByText('Sync Now')).toBeInTheDocument();
  });
  
  test('should call syncPendingChanges when sync button is clicked', () => {
    const mockSyncPendingChanges = jest.fn();
    
    // Mock useOffline to return online status with pending changes
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      hasPendingChanges: true,
      pendingChangesCount: 3,
      syncPendingChanges: mockSyncPendingChanges,
      syncStatus: 'idle',
    });
    
    render(<OfflineIndicator showSyncButton={true} />);
    
    fireEvent.click(screen.getByText('Sync Now'));
    
    expect(mockSyncPendingChanges).toHaveBeenCalledTimes(1);
  });
  
  test('should show syncing message when syncing', () => {
    // Mock useOffline to return syncing status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: true,
      hasPendingChanges: true,
      pendingChangesCount: 3,
      syncPendingChanges: jest.fn(),
      syncStatus: 'syncing',
    });
    
    render(<OfflineIndicator showSyncButton={true} />);
    
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });
  
  test('should show retry sync message when sync fails', () => {
    // Mock useOffline to return error status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      hasPendingChanges: true,
      pendingChangesCount: 3,
      syncPendingChanges: jest.fn(),
      syncStatus: 'error',
    });
    
    render(<OfflineIndicator showSyncButton={true} />);
    
    expect(screen.getByText('Retry Sync')).toBeInTheDocument();
  });
});

describe('OfflineWrapper', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('should render children when online', () => {
    // Mock useOffline to return online status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
    });
    
    render(
      <OfflineWrapper>
        <div>Online content</div>
      </OfflineWrapper>
    );
    
    expect(screen.getByText('Online content')).toBeInTheDocument();
  });
  
  test('should render children when offline but not requiring online', () => {
    // Mock useOffline to return offline status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
    });
    
    render(
      <OfflineWrapper requireOnline={false}>
        <div>Offline-compatible content</div>
      </OfflineWrapper>
    );
    
    expect(screen.getByText('Offline-compatible content')).toBeInTheDocument();
  });
  
  test('should render fallback when offline and requiring online', () => {
    // Mock useOffline to return offline status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
    });
    
    render(
      <OfflineWrapper requireOnline={true}>
        <div>Online-only content</div>
      </OfflineWrapper>
    );
    
    expect(screen.getByText('You are offline')).toBeInTheDocument();
    expect(screen.queryByText('Online-only content')).not.toBeInTheDocument();
  });
  
  test('should render custom fallback when offline and requiring online', () => {
    // Mock useOffline to return offline status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
    });
    
    render(
      <OfflineWrapper
        requireOnline={true}
        fallback={<div>Custom offline message</div>}
      >
        <div>Online-only content</div>
      </OfflineWrapper>
    );
    
    expect(screen.getByText('Custom offline message')).toBeInTheDocument();
    expect(screen.queryByText('Online-only content')).not.toBeInTheDocument();
  });
});

describe('OfflineProvider Integration', () => {
  // Mock window.addEventListener for online/offline events
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  
  beforeEach(() => {
    // Mock addEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });
  
  afterEach(() => {
    // Restore original methods
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });
  
  test('should set up event listeners for online/offline events', () => {
    render(
      <OfflineProvider>
        <div>Test</div>
      </OfflineProvider>
    );
    
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
  
  test('should clean up event listeners on unmount', () => {
    const { unmount } = render(
      <OfflineProvider>
        <div>Test</div>
      </OfflineProvider>
    );
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
