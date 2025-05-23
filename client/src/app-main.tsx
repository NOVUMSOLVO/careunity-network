import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProviders } from './components/providers';
import { registerServiceWorker } from './utils/service-worker-registration';
import { networkStatus } from './utils/network-status';
import { syncService } from './services/sync-service';
import { offlineStorageService } from './services/offline-storage-service';
import { Toaster } from './components/ui/toaster';

/**
 * Main entry point for the application
 * This file sets up the React application with all necessary providers
 * and initializes the service worker for offline functionality
 */

// Initialize offline support
window.addEventListener('load', async () => {
  try {
    // Register enhanced service worker
    const registration = await registerServiceWorker('/enhanced-service-worker.js');

    if (registration) {
      console.log('Enhanced service worker registered successfully:', registration.scope);

      // Listen for service worker update notifications
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service worker update found!');

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker installed, but waiting to activate');

            // Show update notification
            if (confirm('A new version of the application is available. Reload to update?')) {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });

      // Handle controller change (new service worker activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('Service worker controller changed, reloading page');
          window.location.reload();
        }
      });
    }
  } catch (error) {
    console.error('Enhanced service worker registration failed:', error);
  }

  // Initialize offline storage
  try {
    await offlineStorageService.initialize();
    console.log('Offline storage initialized');
  } catch (error) {
    console.error('Offline storage initialization failed:', error);
  }

  // Initialize sync service
  try {
    await syncService.initialize(60); // Auto-sync every 60 seconds when online
    console.log('Sync service initialized');
  } catch (error) {
    console.error('Sync service initialization failed:', error);
  }

  // Initialize network status monitoring
  networkStatus.startPeriodicChecks(30); // Check connectivity every 30 seconds
  console.log('Network status monitoring initialized');
});

// Initialize React application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders>
        <App />
        <Toaster />
      </AppProviders>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}
