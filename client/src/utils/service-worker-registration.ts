/**
 * Service Worker Registration
 *
 * This module handles the registration and updates of the service worker.
 */

import { logger } from './logger';

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

/**
 * Register the service worker
 */
export function register(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported) {
    logger.warn('Service workers are not supported in this browser');
    return Promise.resolve(null);
  }

  // Only register service worker in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.VITE_ENABLE_SW) {
    logger.info('Service worker registration skipped in development mode');
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/service-worker.js', { scope: '/' })
    .then((registration) => {
      logger.info('Service worker registered successfully:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker available
              logger.info('New service worker available');
              notifyUpdate();
            } else {
              // Service worker installed for the first time
              logger.info('Service worker installed for the first time');
            }
          }
        });
      });

      return registration;
    })
    .catch((error) => {
      logger.error('Error registering service worker:', error);
      return null;
    });
}

/**
 * Unregister the service worker
 */
export function unregister(): Promise<boolean> {
  if (!isServiceWorkerSupported) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .catch((error) => {
      logger.error('Error unregistering service worker:', error);
      return false;
    });
}

/**
 * Check for service worker updates
 */
export function checkForUpdates(): Promise<boolean> {
  if (!isServiceWorkerSupported) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.update()
        .then(() => true)
        .catch((error) => {
          logger.error('Error checking for service worker updates:', error);
          return false;
        });
    })
    .catch((error) => {
      logger.error('Error accessing service worker registration:', error);
      return false;
    });
}

/**
 * Skip waiting and activate the new service worker
 */
export function skipWaiting(): void {
  if (!isServiceWorkerSupported) {
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (!registration.waiting) {
      return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
}

/**
 * Notify the user about a service worker update
 */
function notifyUpdate(): void {
  // Dispatch an event that the application can listen for
  window.dispatchEvent(new CustomEvent('serviceWorkerUpdated'));

  // You could also show a notification or UI element here
  logger.info('A new version of the application is available. Refresh to update.');
}

/**
 * Listen for service worker messages
 */
export function listenForMessages(callback: (event: MessageEvent) => void): void {
  if (!isServiceWorkerSupported) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', callback);
}

/**
 * Send a message to the service worker
 */
export function sendMessage(message: any): Promise<void> {
  if (!isServiceWorkerSupported) {
    return Promise.resolve();
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      if (!registration.active) {
        throw new Error('No active service worker found');
      }

      registration.active.postMessage(message);
    })
    .catch((error) => {
      logger.error('Error sending message to service worker:', error);
    });
}

/**
 * Check if the app is running in offline mode
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Add online/offline event listeners
 */
export function addNetworkStatusListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): void {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
}

/**
 * Remove online/offline event listeners
 */
export function removeNetworkStatusListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): void {
  window.removeEventListener('online', onlineCallback);
  window.removeEventListener('offline', offlineCallback);
}

/**
 * Trigger a background sync
 */
export function triggerSync(tag: string = 'syncData'): Promise<void> {
  if (!isServiceWorkerSupported) {
    return Promise.resolve();
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      if ('sync' in registration) {
        return registration.sync.register(tag);
      } else {
        // Fallback for browsers that don't support background sync
        return sendMessage({ type: 'SYNC_REQUIRED' });
      }
    })
    .catch((error) => {
      logger.error('Error triggering background sync:', error);
    });
}

/**
 * Register the enhanced service worker
 *
 * @param swPath Path to the enhanced service worker file
 * @returns Promise resolving to the service worker registration or null
 */
export function registerServiceWorker(
  swPath: string = '/enhanced-service-worker.js'
): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported) {
    logger.warn('Service workers are not supported in this browser');
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register(swPath, { scope: '/' })
    .then((registration) => {
      logger.info(`Enhanced service worker registered: ${registration.scope}`);
      return registration;
    })
    .catch((error) => {
      logger.error('Enhanced service worker registration failed:', error);
      return null;
    });
}
