/**
 * Service Worker Registration
 * 
 * This file handles the registration and lifecycle management of the service worker.
 * It provides functions to register, update, and unregister the service worker.
 */

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

/**
 * Register the service worker
 * @returns Promise that resolves when the service worker is registered
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!isServiceWorkerSupported) {
    console.warn('Service workers are not supported in this browser');
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service worker registered successfully:', registration.scope);

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
            
            // Dispatch an event that can be used to show an update notification
            window.dispatchEvent(new CustomEvent('serviceWorkerUpdateAvailable'));
          } else {
            // At this point, everything has been precached.
            console.log('Content is cached for offline use.');
            
            // Dispatch an event that can be used to show an offline ready notification
            window.dispatchEvent(new CustomEvent('serviceWorkerInstalled'));
          }
        }
      };
    };

    return registration;
  } catch (error) {
    console.error('Error during service worker registration:', error);
    return undefined;
  }
}

/**
 * Unregister the service worker
 * @returns Promise that resolves when the service worker is unregistered
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log('Service worker unregistered:', unregistered);
    return unregistered;
  } catch (error) {
    console.error('Error during service worker unregistration:', error);
    return false;
  }
}

/**
 * Update the service worker
 * This will trigger the service worker to update if a new version is available
 * @returns Promise that resolves when the service worker is updated
 */
export async function updateServiceWorker(): Promise<void> {
  if (!isServiceWorkerSupported) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service worker updated');
  } catch (error) {
    console.error('Error during service worker update:', error);
  }
}

/**
 * Skip waiting and activate the new service worker
 * This will immediately activate the waiting service worker
 * @returns Promise that resolves when the service worker is activated
 */
export async function activateWaitingServiceWorker(): Promise<void> {
  if (!isServiceWorkerSupported) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      // Send a message to the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch (error) {
    console.error('Error activating waiting service worker:', error);
  }
}

// Initialize service worker registration
if (process.env.NODE_ENV === 'production') {
  // Wait until the page is loaded
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}
