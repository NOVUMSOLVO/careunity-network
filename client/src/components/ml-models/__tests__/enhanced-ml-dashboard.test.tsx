/**
 * Tests for Enhanced ML Dashboard Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedMLDashboard } from '../enhanced-ml-dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as offlineService from '@/services/ml-models-offline-service';

// Mock the offline service
jest.mock('@/services/ml-models-offline-service', () => ({
  getCachedModels: jest.fn(),
  getPendingPredictionRequests: jest.fn(),
  cacheModels: jest.fn(),
}));

// Mock the hooks
jest.mock('@/hooks/use-ml-models', () => ({
  useMLModels: () => ({
    data: [
      {
        id: 'recommendation-1',
        name: 'Caregiver Recommendation',
        version: '1.0',
        metrics: { accuracy: 0.92, precision: 0.89, recall: 0.94, f1: 0.91 }
      },
      {
        id: 'timeseries-1',
        name: 'Visit Prediction',
        version: '1.2',
        metrics: { rmse: 1.2, mae: 0.9, r2: 0.78 }
      }
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn()
  }),
  useMakePrediction: () => ({
    mutate: jest.fn((request, options) => {
      // Simulate successful prediction
      options.onSuccess({
        prediction: 0.85,
        confidence: 0.92,
        explanations: [
          { feature: 'clientAge', importance: 0.3, contribution: 0.2 },
          { feature: 'caregiverExperience', importance: 0.25, contribution: 0.15 }
        ]
      });
    }),
    isLoading: false
  })
}));

// Mock the network status
jest.mock('@/lib/network-status', () => ({
  isOnline: jest.fn(() => true)
}));

// Create a wrapper with the necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('EnhancedMLDashboard', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock implementation for offline service
    (offlineService.getCachedModels as jest.Mock).mockReturnValue([
      { id: 'recommendation-1', name: 'Caregiver Recommendation' }
    ]);
    (offlineService.getPendingPredictionRequests as jest.Mock).mockReturnValue([]);
    (offlineService.cacheModels as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders the dashboard with models', () => {
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Check if the component renders correctly
    expect(screen.getByText('ML Models Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Caregiver Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Visit Prediction')).toBeInTheDocument();
  });

  it('allows selecting a model', () => {
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Click on a model card
    fireEvent.click(screen.getByText('Caregiver Recommendation'));
    
    // Check if the model is selected (it should have a test model button)
    const testButton = screen.getAllByText('Test Model')[0];
    expect(testButton).toBeInTheDocument();
    
    // Test the model
    fireEvent.click(testButton);
    
    // Check if the prediction was successful
    waitFor(() => {
      expect(screen.getByText('Prediction Success')).toBeInTheDocument();
    });
  });

  it('handles offline mode', () => {
    // Mock isOnline to return false
    require('@/lib/network-status').isOnline.mockReturnValue(false);
    
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Check if offline badge is displayed
    expect(screen.getByText('Offline')).toBeInTheDocument();
    
    // Check if cached models are displayed
    expect(screen.getByText('1 models cached')).toBeInTheDocument();
  });

  it('allows caching models for offline use', async () => {
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Navigate to offline tab
    fireEvent.click(screen.getByText('Offline Data'));
    
    // Click cache all button
    const cacheButton = screen.getByText('Cache All');
    fireEvent.click(cacheButton);
    
    // Check if cacheModels was called
    await waitFor(() => {
      expect(offlineService.cacheModels).toHaveBeenCalled();
    });
  });

  it('handles loading state', () => {
    // Mock useMLModels to return loading state
    require('@/hooks/use-ml-models').useMLModels.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn()
    });
    
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Check if loading state is displayed
    expect(screen.queryByText('ML Models Dashboard')).not.toBeInTheDocument();
  });

  it('handles error state', () => {
    // Mock useMLModels to return error state
    require('@/hooks/use-ml-models').useMLModels.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load models'),
      refetch: jest.fn()
    });
    
    render(<EnhancedMLDashboard />, { wrapper: createWrapper() });
    
    // Check if error state is displayed
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
    
    // Check if retry button is displayed
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Click retry button
    fireEvent.click(retryButton);
    
    // Check if refetch was called
    expect(require('@/hooks/use-ml-models').useMLModels().refetch).toHaveBeenCalled();
  });
});
