import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/shared-query-client';
import { Router } from 'wouter';
import { LoadingProvider } from '@/contexts/loading-context';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the application with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </Router>
    </QueryClientProvider>
  );
}