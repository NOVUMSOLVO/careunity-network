/**
 * Tests for Enhanced Offline Status Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedOfflineStatus } from '../enhanced-offline-status';
import * as serviceWorkerRegistration from '@/lib/enhanced-service-worker-registration';

// Mock the service worker registration
jest.mock('@/lib/enhanced-service-worker-registration', () => ({
  isOnline: jest.fn(),
  triggerSync: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('EnhancedOfflineStatus', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    serviceWorkerRegistration.triggerSync.mockResolvedValue(true);
  });

  it('renders online status correctly', () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    
    render(<EnhancedOfflineStatus />);
    
    // Check if online status is displayed
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders offline status correctly', () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(false);
    
    render(<EnhancedOfflineStatus />);
    
    // Check if offline status is displayed
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('disables sync button when offline', () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(false);
    
    render(<EnhancedOfflineStatus />);
    
    // Find the sync button
    const syncButton = screen.getByText('Sync Data').closest('button');
    
    // Check if the button is disabled
    expect(syncButton).toBeDisabled();
  });

  it('enables sync button when online', () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    
    render(<EnhancedOfflineStatus />);
    
    // Find the sync button
    const syncButton = screen.getByText('Sync Data').closest('button');
    
    // Check if the button is enabled
    expect(syncButton).not.toBeDisabled();
  });

  it('triggers sync when sync button is clicked', async () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    
    render(<EnhancedOfflineStatus />);
    
    // Find the sync button
    const syncButton = screen.getByText('Sync Data').closest('button');
    
    // Click the sync button
    fireEvent.click(syncButton);
    
    // Check if triggerSync was called
    expect(serviceWorkerRegistration.triggerSync).toHaveBeenCalledWith('syncData');
    
    // Check if the button shows syncing state
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('handles sync completion', async () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    
    render(<EnhancedOfflineStatus />);
    
    // Find the sync button
    const syncButton = screen.getByText('Sync Data').closest('button');
    
    // Click the sync button
    fireEvent.click(syncButton);
    
    // Simulate sync completion
    const syncCompletedEvent = new CustomEvent('syncCompleted', {
      detail: {
        timestamp: new Date().toISOString(),
        success: true
      }
    });
    window.dispatchEvent(syncCompletedEvent);
    
    // Check if the button shows sync data again
    await waitFor(() => {
      expect(screen.getByText('Sync Data')).toBeInTheDocument();
    });
    
    // Check if last sync time is displayed
    expect(screen.getByText(/Last synced:/)).toBeInTheDocument();
  });

  it('handles sync failure', async () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    serviceWorkerRegistration.triggerSync.mockResolvedValue(false);
    
    render(<EnhancedOfflineStatus />);
    
    // Find the sync button
    const syncButton = screen.getByText('Sync Data').closest('button');
    
    // Click the sync button
    fireEvent.click(syncButton);
    
    // Check if triggerSync was called
    expect(serviceWorkerRegistration.triggerSync).toHaveBeenCalledWith('syncData');
    
    // Wait for the sync to fail
    await waitFor(() => {
      expect(screen.getByText('Sync Data')).toBeInTheDocument();
    });
  });

  it('renders minimal version when showControls, showSyncStatus, and showPendingCount are false', () => {
    render(
      <EnhancedOfflineStatus 
        showControls={false} 
        showSyncStatus={false} 
        showPendingCount={false} 
      />
    );
    
    // Check if only the status badge is displayed
    expect(screen.getByText('Online')).toBeInTheDocument();
    
    // Check that other elements are not displayed
    expect(screen.queryByText('Sync Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Pending Operations')).not.toBeInTheDocument();
    expect(screen.queryByText('Last synced:')).not.toBeInTheDocument();
  });

  it('updates status when online/offline events occur', () => {
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    
    render(<EnhancedOfflineStatus />);
    
    // Check initial status
    expect(screen.getByText('Online')).toBeInTheDocument();
    
    // Simulate going offline
    serviceWorkerRegistration.isOnline.mockReturnValue(false);
    window.dispatchEvent(new Event('offline'));
    
    // Check updated status
    waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
    
    // Simulate going online
    serviceWorkerRegistration.isOnline.mockReturnValue(true);
    window.dispatchEvent(new Event('online'));
    
    // Check updated status and that sync was triggered
    waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(serviceWorkerRegistration.triggerSync).toHaveBeenCalled();
    });
  });
});
