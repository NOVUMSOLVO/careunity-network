/**
 * Offline Hook
 * 
 * This hook provides the current online/offline status of the application
 * and utilities for working with offline mode.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to track online/offline status
 * @returns boolean indicating if the app is offline
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    // Function to update offline status
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
  
  return isOffline;
}

/**
 * Hook to track pending offline changes
 * @returns boolean indicating if there are pending changes to sync
 */
export function usePendingChanges(): { hasPendingChanges: boolean; isPending: boolean } {
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isPending, setIsPending] = useState(true);
  
  useEffect(() => {
    // Check for pending changes in IndexedDB
    const checkPendingChanges = async () => {
      try {
        setIsPending(true);
        
        // Open the database
        const request = indexedDB.open('careunityOfflineDB', 1);
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // If the sync-queue store doesn't exist, there are no pending changes
          if (!db.objectStoreNames.contains('sync-queue')) {
            setHasPendingChanges(false);
            setIsPending(false);
            return;
          }
          
          // Check if there are pending operations in the sync-queue store
          const transaction = db.transaction('sync-queue', 'readonly');
          const store = transaction.objectStore('sync-queue');
          const index = store.index('by-status');
          const countRequest = index.count('pending');
          
          countRequest.onsuccess = () => {
            setHasPendingChanges(countRequest.result > 0);
            setIsPending(false);
          };
          
          countRequest.onerror = () => {
            console.error('Error checking pending changes:', countRequest.error);
            setHasPendingChanges(false);
            setIsPending(false);
          };
        };
        
        request.onerror = () => {
          console.error('Error opening database:', request.error);
          setHasPendingChanges(false);
          setIsPending(false);
        };
      } catch (error) {
        console.error('Error checking pending changes:', error);
        setHasPendingChanges(false);
        setIsPending(false);
      }
    };
    
    // Check for pending changes when the component mounts
    checkPendingChanges();
    
    // Listen for sync complete events from service worker
    const handleSyncComplete = (event: any) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        checkPendingChanges();
      }
    };
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSyncComplete);
    }
    
    // Listen for online/offline events
    const handleOnline = () => {
      checkPendingChanges();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Clean up event listeners
    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSyncComplete);
      }
      
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return { hasPendingChanges, isPending };
}

/**
 * Hook to track sync status
 * @returns object with sync status and function to trigger sync
 */
export function useSyncStatus(): { 
  isSyncing: boolean; 
  lastSyncTime: Date | null; 
  triggerSync: () => Promise<boolean>;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Listen for sync complete events from service worker
    const handleSyncComplete = (event: any) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        setIsSyncing(false);
        setLastSyncTime(new Date());
      }
    };
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSyncComplete);
    }
    
    // Clean up event listeners
    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSyncComplete);
      }
    };
  }, []);
  
  // Function to trigger sync
  const triggerSync = async (): Promise<boolean> => {
    if (!navigator.onLine || isSyncing) {
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      // Check if the service worker is ready
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        setIsSyncing(false);
        return false;
      }
      
      // Try to use the Background Sync API if available
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await registration.sync.register('syncData');
        return true;
      } else {
        // Fallback for browsers that don't support Background Sync API
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_REQUIRED'
        });
        return true;
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      setIsSyncing(false);
      return false;
    }
  };
  
  return { isSyncing, lastSyncTime, triggerSync };
}
