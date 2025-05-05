import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the application with all necessary providers
 * 
 * Note: This version is intentionally simplified to avoid hooks-related errors
 * while we debug application visibility issues
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="providers">
        {children}
      </div>
    </QueryClientProvider>
  );
}