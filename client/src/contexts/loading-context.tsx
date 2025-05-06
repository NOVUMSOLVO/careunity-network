import React, { createContext, useContext, useState, useEffect } from 'react';

// Context type definition
interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number | null;
  startLoading: (message?: string, progress?: number) => void;
  updateLoading: (message: string, progress?: number) => void;
  updateProgress: (progress: number) => void;
  stopLoading: () => void;
  showLoadingFor: (milliseconds: number, message?: string) => Promise<void>;
  simulateProgress: (message?: string, durationMs?: number) => void;
  resetProgress: () => void;
}

// Create context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: '',
  loadingProgress: null,
  startLoading: () => {},
  updateLoading: () => {},
  updateProgress: () => {},
  stopLoading: () => {},
  showLoadingFor: async () => {},
  simulateProgress: () => {},
  resetProgress: () => {},
});

// Provider props
interface LoadingProviderProps {
  children: React.ReactNode;
}

/**
 * Loading provider that manages application-wide loading state
 */
export function LoadingProvider({ children }: LoadingProviderProps) {
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  
  // Store the timeout ID for cleaning up simulated progress
  const [progressIntervalId, setProgressIntervalId] = useState<number | null>(null);
  
  // Start the loading state
  const startLoading = (message: string = 'Loading...', progress: number | null = null) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setLoadingProgress(progress);
  };
  
  // Update the loading message and optional progress
  const updateLoading = (message: string, progress?: number) => {
    setLoadingMessage(message);
    if (progress !== undefined) {
      setLoadingProgress(progress);
    }
  };
  
  // Update just the progress value
  const updateProgress = (progress: number) => {
    setLoadingProgress(progress);
  };
  
  // Stop the loading state
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
    setLoadingProgress(null);
  };
  
  // Clear any progress simulation interval
  const resetProgress = () => {
    if (progressIntervalId !== null) {
      window.clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
    setLoadingProgress(null);
  };
  
  // Show loading for a specific duration
  const showLoadingFor = async (milliseconds: number, message?: string): Promise<void> => {
    startLoading(message);
    
    return new Promise(resolve => {
      setTimeout(() => {
        stopLoading();
        resolve();
      }, milliseconds);
    });
  };
  
  // Simulate progress increasing over time
  const simulateProgress = (message?: string, durationMs: number = 3000) => {
    // Clean up previous interval if any
    resetProgress();
    
    // Start at 0
    setLoadingProgress(0);
    
    // Update message if provided
    if (message) {
      setLoadingMessage(message);
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Number of steps for smooth animation
    const steps = 20;
    const interval = durationMs / steps;
    
    // Simulate progress
    let progress = 0;
    
    const id = window.setInterval(() => {
      // Increase progress, moving faster at the beginning and slower at the end
      // This creates a more realistic loading effect
      progress += (100 - progress) / 10;
      
      // Cap at 95% - will be completed by the calling code
      const cappedProgress = Math.min(95, progress);
      
      setLoadingProgress(cappedProgress);
      
      // Stop at 95% and let the actual operation complete it
      if (cappedProgress >= 95) {
        resetProgress();
      }
    }, interval);
    
    setProgressIntervalId(id);
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalId !== null) {
        window.clearInterval(progressIntervalId);
      }
    };
  }, [progressIntervalId]);
  
  // Create context value
  const value: LoadingContextType = {
    isLoading,
    loadingMessage,
    loadingProgress,
    startLoading,
    updateLoading,
    updateProgress,
    stopLoading,
    showLoadingFor,
    simulateProgress,
    resetProgress,
  };
  
  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Hook to use the loading context
 */
export function useLoading() {
  return useContext(LoadingContext);
}