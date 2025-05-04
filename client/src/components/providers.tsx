import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { NotificationsProvider } from '@/hooks/use-notifications';
import { queryClient } from '@/lib/queryClient';
import { syncService } from '@/lib/sync-service';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Initializes the service worker for offline support
 */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

/**
 * App providers component that wraps the application with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  // Initialize service worker
  useEffect(() => {
    initServiceWorker();
  }, []);

  // Initialize sync service
  useEffect(() => {
    syncService.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NotificationsProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}