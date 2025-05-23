/**
 * Service Worker Registration
 * 
 * This module handles the registration of the service worker for offline capabilities.
 */

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

// Register the service worker
export function registerServiceWorker() {
  if (!isServiceWorkerSupported) {
    console.log('Service workers are not supported in this browser');
    return false;
  }

  // Register the service worker
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', registration.scope);
      
      // Handle updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // Dispatch an event to notify the app about the update
              window.dispatchEvent(new CustomEvent('serviceWorkerUpdate', {
                detail: registration
              }));
            } else {
              // At this point, everything has been precached.
              console.log('Content is cached for offline use.');
              
              // Dispatch an event to notify the app that content is cached
              window.dispatchEvent(new CustomEvent('serviceWorkerCached'));
            }
          }
        };
      };
    } catch (error) {
      console.error('Error during service worker registration:', error);
      return false;
    }
  });

  return true;
}

// Unregister all service workers
export async function unregisterServiceWorker() {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    return unregistered;
  } catch (error) {
    console.error('Error during service worker unregistration:', error);
    return false;
  }
}

// Check if the app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Add online/offline event listeners
export function addNetworkStatusListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void {
  const handleOnline = () => {
    console.log('App is online');
    onlineCallback();
  };

  const handleOffline = () => {
    console.log('App is offline');
    offlineCallback();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return a cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Update service worker
export async function updateServiceWorker() {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('Error updating service worker:', error);
    return false;
  }
}

// Skip waiting and reload
export function skipWaitingAndReload(registration: ServiceWorkerRegistration) {
  if (!registration.waiting) return;
  
  // Send a message to the waiting service worker
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  
  // Reload once the new service worker takes over
  const handleControllerChange = () => {
    window.location.reload();
  };
  
  // Listen for the controlling service worker changing
  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
}
