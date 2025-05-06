import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/shared-query-client';
import { RouterProvider } from '@/components/router';
import { LoadingProvider } from '@/contexts/loading-context';
import { WebSocketProvider } from '@/contexts/websocket-context';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the application with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <WebSocketProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </WebSocketProvider>
      </RouterProvider>
    </QueryClientProvider>
  );
}