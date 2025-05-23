/**
 * Enhanced Service Worker Registration
 * 
 * This file handles the registration and lifecycle management of the service worker.
 * It provides functions to register, update, and unregister the service worker,
 * along with support for:
 * - Workbox-based service worker
 * - Periodic Background Sync
 * - Badge API
 */

import { Workbox } from 'workbox-window';

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

// Service worker file path
const SERVICE_WORKER_PATH = '/workbox-service-worker.js';

// Workbox instance
let wb: Workbox | null = null;

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
    // Initialize Workbox
    wb = new Workbox(SERVICE_WORKER_PATH);

    // Add event listeners for installation and updates
    wb.addEventListener('installed', event => {
      if (event.isUpdate) {
        console.log('Service worker updated');
        // Dispatch an event that can be used to show an update notification
        window.dispatchEvent(new CustomEvent('serviceWorkerUpdateAvailable'));
      } else {
        console.log('Service worker installed for the first time');
        // Dispatch an event that can be used to show an offline ready notification
        window.dispatchEvent(new CustomEvent('serviceWorkerInstalled'));
      }
    });

    wb.addEventListener('activated', event => {
      if (event.isUpdate) {
        console.log('Updated service worker activated');
        // Reload the page to ensure everything is fresh
        window.location.reload();
      }
    });

    wb.addEventListener('controlling', () => {
      console.log('Service worker is controlling the page');
    });

    wb.addEventListener('waiting', () => {
      console.log('Service worker is waiting');
      // Dispatch an event that can be used to prompt the user to update
      window.dispatchEvent(new CustomEvent('serviceWorkerWaiting'));
    });

    // Register the service worker
    const registration = await wb.register();
    console.log('Service worker registered successfully');

    // Initialize periodic background sync
    await setupPeriodicSync(registration);

    // Initialize badge support
    await setupBadgeSupport(registration);

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return undefined;
  }
}

/**
 * Setup periodic background sync
 */
async function setupPeriodicSync(registration: ServiceWorkerRegistration): Promise<void> {
  // Check if periodic background sync is supported
  if ('periodicSync' in registration) {
    try {
      // Check for permission
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any
      });

      if (status.state === 'granted') {
        // Register for periodic background sync
        await registration.periodicSync.register('data-sync', {
          minInterval: 60 * 60 * 1000 // 1 hour in milliseconds
        });
        console.log('Periodic background sync registered');
      } else {
        console.log('Periodic background sync permission not granted');
      }
    } catch (error) {
      console.error('Failed to register periodic background sync:', error);
    }
  } else {
    console.log('Periodic background sync not supported');
  }
}

/**
 * Setup badge support
 */
async function setupBadgeSupport(registration: ServiceWorkerRegistration): Promise<void> {
  if ('setAppBadge' in navigator) {
    try {
      // Request notification permission if not already granted
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      console.log('Badge API is supported');

      // Request initial badge update from the service worker
      await updateBadgeCount();
    } catch (error) {
      console.error('Failed to setup badge support:', error);
    }
  } else {
    console.log('Badge API not supported');
  }
}

/**
 * Update the badge count by sending a message to the service worker
 */
export async function updateBadgeCount(): Promise<number> {
  if (!('setAppBadge' in navigator)) {
    console.log('Badge API not supported');
    return 0;
  }

  try {
    // Create a MessageChannel for the response
    const messageChannel = new MessageChannel();
    
    // Create a promise to wait for the response
    const response = new Promise<number>((resolve, reject) => {
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'BADGE_UPDATED') {
          resolve(event.data.count);
        } else if (event.data && event.data.type === 'BADGE_UPDATE_FAILED') {
          reject(new Error(event.data.error || 'Failed to update badge'));
        }
      };
    });

    // Send the message to the service worker
    navigator.serviceWorker.controller?.postMessage(
      { type: 'UPDATE_BADGE' },
      [messageChannel.port2]
    );

    // Wait for the response
    const count = await response;
    return count;
  } catch (error) {
    console.error('Error updating badge count:', error);
    return 0;
  }
}

/**
 * Clear all notifications and reset the badge count
 */
export async function clearAllNotifications(): Promise<number> {
  try {
    // Create a MessageChannel for the response
    const messageChannel = new MessageChannel();
    
    // Create a promise to wait for the response
    const response = new Promise<number>((resolve, reject) => {
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'NOTIFICATIONS_CLEARED') {
          resolve(event.data.count);
        } else if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS_FAILED') {
          reject(new Error(event.data.error || 'Failed to clear notifications'));
        }
      };
    });

    // Send the message to the service worker
    navigator.serviceWorker.controller?.postMessage(
      { type: 'CLEAR_NOTIFICATIONS' },
      [messageChannel.port2]
    );

    // Wait for the response
    const clearedCount = await response;
    return clearedCount;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return 0;
  }
}

/**
 * Manually trigger a sync
 */
export async function syncNow(): Promise<boolean> {
  try {
    // Create a MessageChannel for the response
    const messageChannel = new MessageChannel();
    
    // Create a promise to wait for the response
    const response = new Promise<boolean>((resolve, reject) => {
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'SYNC_COMPLETED') {
          resolve(true);
        } else if (event.data && event.data.type === 'SYNC_FAILED') {
          reject(new Error(event.data.error || 'Sync failed'));
        }
      };
    });

    // Send the message to the service worker
    navigator.serviceWorker.controller?.postMessage(
      { type: 'SYNC_NOW' },
      [messageChannel.port2]
    );

    // Wait for the response
    return await response;
  } catch (error) {
    console.error('Error triggering sync:', error);
    return false;
  }
}

/**
 * Update the service worker to the latest version
 */
export function updateServiceWorker(): void {
  if (wb) {
    wb.addEventListener('controlling', () => {
      window.location.reload();
    });
    
    wb.messageSkipWaiting();
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      return success;
    }
    return false;
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}
