/**
 * Enhanced Service Worker Registration
 * 
 * This module handles the registration and lifecycle management of the enhanced service worker.
 * It provides functions to register, update, and unregister the service worker,
 * as well as utilities for handling offline/online status and sync operations.
 */

import { create } from 'zustand';

// Service worker status store
interface ServiceWorkerState {
  isRegistered: boolean;
  isWaiting: boolean;
  registration: ServiceWorkerRegistration | null;
  setRegistration: (registration: ServiceWorkerRegistration | null) => void;
  setIsWaiting: (isWaiting: boolean) => void;
}

export const useServiceWorkerStore = create<ServiceWorkerState>((set) => ({
  isRegistered: false,
  isWaiting: false,
  registration: null,
  setRegistration: (registration) => set({ 
    isRegistered: !!registration,
    registration 
  }),
  setIsWaiting: (isWaiting) => set({ isWaiting }),
}));

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

/**
 * Register the enhanced service worker
 * @returns Promise that resolves when the service worker is registered
 */
export async function registerEnhancedServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!isServiceWorkerSupported) {
    console.warn('Service workers are not supported in this browser');
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/enhanced-service-worker.js', {
      scope: '/',
    });

    console.log('Enhanced service worker registered with scope:', registration.scope);

    // Store registration in state
    useServiceWorkerStore.getState().setRegistration(registration);

    // Check if there's a waiting service worker
    if (registration.waiting) {
      useServiceWorkerStore.getState().setIsWaiting(true);
    }

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is waiting
          useServiceWorkerStore.getState().setIsWaiting(true);
          
          // Dispatch event for the app to show update notification
          window.dispatchEvent(new CustomEvent('serviceWorkerWaiting'));
        }
      });
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data) {
        // Handle sync messages
        if (event.data.type === 'SYNC_COMPLETED') {
          window.dispatchEvent(new CustomEvent('syncCompleted', { 
            detail: event.data 
          }));
        } else if (event.data.type === 'SYNC_FAILED') {
          window.dispatchEvent(new CustomEvent('syncFailed', { 
            detail: event.data 
          }));
        } else if (event.data.type === 'ML_MODELS_SYNC_COMPLETED') {
          window.dispatchEvent(new CustomEvent('mlModelsSyncCompleted', { 
            detail: event.data 
          }));
        }
      }
    });

    return registration;
  } catch (error) {
    console.error('Error registering enhanced service worker:', error);
    return undefined;
  }
}

/**
 * Update the service worker
 * This will trigger the waiting service worker to become active
 */
export function updateServiceWorker(): void {
  const { registration, isWaiting } = useServiceWorkerStore.getState();

  if (!registration || !isWaiting) return;

  if (registration.waiting) {
    // Send message to the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Unregister all service workers
 * @returns Promise that resolves to true if unregistration was successful
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    
    if (unregistered) {
      useServiceWorkerStore.getState().setRegistration(null);
      useServiceWorkerStore.getState().setIsWaiting(false);
    }
    
    return unregistered;
  } catch (error) {
    console.error('Error unregistering service worker:', error);
    return false;
  }
}

/**
 * Trigger a sync operation
 * @param syncTag The sync tag to use (e.g., 'syncData', 'syncMLModels')
 * @returns Promise that resolves to true if sync was triggered
 */
export async function triggerSync(syncTag: string = 'syncData'): Promise<boolean> {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if SyncManager is supported
    if ('sync' in registration) {
      await registration.sync.register(syncTag);
      return true;
    } else {
      // Fallback for browsers that don't support Background Sync API
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_REQUIRED',
          syncTag
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error triggering sync:', error);
    return false;
  }
}

/**
 * Check if the app is online
 * @returns boolean indicating if the app is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Add online/offline event listeners
 * @param onlineCallback Function to call when the app goes online
 * @param offlineCallback Function to call when the app goes offline
 * @returns Cleanup function to remove event listeners
 */
export function addNetworkStatusListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
}
