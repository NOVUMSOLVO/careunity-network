import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/shared-query-client';
import { RouterProvider } from '@/components/router';
import { LoadingProvider } from '@/contexts/loading-context';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { LanguageProvider } from '@/contexts/language-context';
import { AccessibilityProvider } from '@/contexts/accessibility-context';
import { SyncProvider } from '@/contexts/sync-context';
import { OfflineProvider } from '@/contexts/offline-context';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the application with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AccessibilityProvider>
          <RouterProvider>
            <OfflineProvider>
              <WebSocketProvider autoConnect={true}>
                <SyncProvider>
                  <LoadingProvider>
                    {children}
                  </LoadingProvider>
                </SyncProvider>
              </WebSocketProvider>
            </OfflineProvider>
          </RouterProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}