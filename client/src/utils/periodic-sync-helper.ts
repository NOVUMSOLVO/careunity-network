/**
 * Periodic Background Sync Utilities
 * 
 * This module provides functions for working with the Periodic Background Sync API
 */

/**
 * Check if periodic background sync is supported
 */
export async function isPeriodicSyncSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 
         'periodicSync' in ServiceWorkerRegistration.prototype;
}

/**
 * Check if periodic background sync is available (support + permission)
 */
export async function isPeriodicSyncAvailable(): Promise<boolean> {
  try {
    if (!await isPeriodicSyncSupported()) {
      return false;
    }

    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as any
    });
    
    return status.state === 'granted';
  } catch (error) {
    console.error('Error checking periodic background sync availability:', error);
    return false;
  }
}

/**
 * Register for periodic background sync
 * @param tag The tag identifying the sync operation
 * @param minInterval The minimum interval in milliseconds (minimum allowed is usually 1 hour)
 */
export async function registerPeriodicSync(
  tag: string,
  minInterval: number = 60 * 60 * 1000 // 1 hour by default
): Promise<boolean> {
  try {
    if (!await isPeriodicSyncAvailable()) {
      console.log('Periodic background sync not available');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.periodicSync.register(tag, {
      minInterval
    });

    console.log(`Registered periodic background sync for '${tag}'`);
    return true;
  } catch (error) {
    console.error(`Failed to register periodic background sync for '${tag}':`, error);
    return false;
  }
}

/**
 * Unregister periodic background sync
 * @param tag The tag identifying the sync operation
 */
export async function unregisterPeriodicSync(tag: string): Promise<boolean> {
  try {
    if (!await isPeriodicSyncSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.periodicSync.unregister(tag);
  } catch (error) {
    console.error(`Failed to unregister periodic background sync for '${tag}':`, error);
    return false;
  }
}

/**
 * Get all registered periodic sync tags
 */
export async function getRegisteredPeriodicSyncs(): Promise<string[]> {
  try {
    if (!await isPeriodicSyncSupported()) {
      return [];
    }

    const registration = await navigator.serviceWorker.ready;
    const tags = await registration.periodicSync.getTags();
    return tags;
  } catch (error) {
    console.error('Failed to get registered periodic background syncs:', error);
    return [];
  }
}

/**
 * Manual sync options
 */
export interface ManualSyncOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

/**
 * Manually trigger a sync
 */
export async function triggerManualSync(options: ManualSyncOptions = {}): Promise<boolean> {
  try {
    const { onSuccess, onError, timeout = 30000 } = options;

    // Create a timeout promise
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Sync operation timed out')), timeout);
    });

    // Create a sync promise
    const syncPromise = new Promise<boolean>((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'SYNC_COMPLETED') {
          resolve(true);
        } else if (event.data && event.data.type === 'SYNC_FAILED') {
          reject(new Error(event.data.error || 'Sync failed'));
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'SYNC_NOW' },
        [messageChannel.port2]
      );
    });

    // Race the sync and timeout promises
    const result = await Promise.race([syncPromise, timeoutPromise]);
    
    if (result && onSuccess) {
      onSuccess();
    }
    
    return result;
  } catch (error) {
    console.error('Manual sync error:', error);
    
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(String(error)));
    }
    
    return false;
  }
}
