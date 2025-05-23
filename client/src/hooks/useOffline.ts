/**
 * useOffline Hook
 * 
 * This hook provides offline status and service worker functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import * as serviceWorkerRegistration from '../utils/service-worker-registration';

interface UseOfflineOptions {
  onOffline?: () => void;
  onOnline?: () => void;
  onUpdateAvailable?: () => void;
}

interface UseOfflineReturn {
  isOffline: boolean;
  hasUpdate: boolean;
  applyUpdate: () => void;
  checkForUpdates: () => Promise<boolean>;
  syncData: () => Promise<void>;
}

export function useOffline(options: UseOfflineOptions = {}): UseOfflineReturn {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    if (options.onOffline) {
      options.onOffline();
    }
  }, [options]);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    if (options.onOnline) {
      options.onOnline();
    }
  }, [options]);

  const handleServiceWorkerUpdate = useCallback(() => {
    setHasUpdate(true);
    if (options.onUpdateAvailable) {
      options.onUpdateAvailable();
    }
  }, [options]);

  const applyUpdate = useCallback(() => {
    serviceWorkerRegistration.skipWaiting();
    window.location.reload();
  }, []);

  const checkForUpdates = useCallback(() => {
    return serviceWorkerRegistration.checkForUpdates();
  }, []);

  const syncData = useCallback(() => {
    return serviceWorkerRegistration.triggerSync();
  }, []);

  useEffect(() => {
    // Register service worker
    serviceWorkerRegistration.register();

    // Add network status listeners
    serviceWorkerRegistration.addNetworkStatusListeners(handleOnline, handleOffline);

    // Listen for service worker updates
    window.addEventListener('serviceWorkerUpdated', handleServiceWorkerUpdate);

    // Listen for service worker messages
    serviceWorkerRegistration.listenForMessages((event) => {
      const data = event.data;
      
      if (data && data.type === 'SYNC_COMPLETED') {
        console.log('Sync completed:', data);
        // You could dispatch an event or update state here
      }
    });

    return () => {
      // Remove network status listeners
      serviceWorkerRegistration.removeNetworkStatusListeners(handleOnline, handleOffline);
      
      // Remove service worker update listener
      window.removeEventListener('serviceWorkerUpdated', handleServiceWorkerUpdate);
    };
  }, [handleOffline, handleOnline, handleServiceWorkerUpdate]);

  return {
    isOffline,
    hasUpdate,
    applyUpdate,
    checkForUpdates,
    syncData,
  };
}
