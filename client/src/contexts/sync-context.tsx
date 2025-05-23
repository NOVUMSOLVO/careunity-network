import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SyncService, { SyncOperation } from '../services/sync-service';

interface SyncContextType {
  isOnline: boolean;
  hasPendingOperations: boolean;
  pendingOperationsCount: number;
  errorOperationsCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  queueOperation: (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any,
    headers?: Record<string, string>,
    entityType?: string,
    entityId?: string | number
  ) => Promise<string>;
  syncPendingOperations: () => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  getPendingOperations: () => Promise<SyncOperation[]>;
  getErrorOperations: () => Promise<SyncOperation[]>;
  clearSyncQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingOperations, setHasPendingOperations] = useState(false);
  const [pendingOperationsCount, setPendingOperationsCount] = useState(0);
  const [errorOperationsCount, setErrorOperationsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Initialize sync service
  useEffect(() => {
    const initSync = async () => {
      await SyncService.initialize();
      updateSyncStatus();
    };

    initSync();

    // Set up event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up event listeners for sync events
    window.addEventListener('sync:operation-queued', updateSyncStatus);
    window.addEventListener('sync:operation-completed', handleSyncCompleted);
    window.addEventListener('sync:operation-failed', handleSyncFailed);
    window.addEventListener('sync:online', updateSyncStatus);
    window.addEventListener('sync:offline', updateSyncStatus);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync:operation-queued', updateSyncStatus);
      window.removeEventListener('sync:operation-completed', handleSyncCompleted);
      window.removeEventListener('sync:operation-failed', handleSyncFailed);
      window.removeEventListener('sync:online', updateSyncStatus);
      window.removeEventListener('sync:offline', updateSyncStatus);
    };
  }, []);

  // Handle online event
  const handleOnline = () => {
    setIsOnline(true);
    updateSyncStatus();
  };

  // Handle offline event
  const handleOffline = () => {
    setIsOnline(false);
  };

  // Handle sync completed event
  const handleSyncCompleted = () => {
    setLastSyncTime(new Date());
    setSyncStatus('success');
    setIsSyncing(false);
    updateSyncStatus();
  };

  // Handle sync failed event
  const handleSyncFailed = () => {
    setSyncStatus('error');
    setIsSyncing(false);
    updateSyncStatus();
  };

  // Update sync status
  const updateSyncStatus = async () => {
    try {
      const hasPending = await SyncService.hasPendingOperations();
      setHasPendingOperations(hasPending);

      const pendingCount = await SyncService.getPendingOperationsCount();
      setPendingOperationsCount(pendingCount);

      const errorCount = await SyncService.getErrorOperationsCount();
      setErrorOperationsCount(errorCount);
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  };

  // Queue an operation for synchronization
  const queueOperation = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any,
    headers?: Record<string, string>,
    entityType?: string,
    entityId?: string | number
  ): Promise<string> => {
    const operationId = await SyncService.queueOperation(
      url,
      method,
      data,
      headers,
      entityType,
      entityId
    );

    // Update sync status
    updateSyncStatus();

    return operationId;
  };

  // Sync pending operations
  const syncPendingOperations = async (): Promise<void> => {
    if (!isOnline) {
      console.warn('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      await SyncService.processPendingOperations();
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Error syncing pending operations:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      updateSyncStatus();
    }
  };

  // Retry failed operations
  const retryFailedOperations = async (): Promise<void> => {
    if (!isOnline) {
      console.warn('Cannot retry while offline');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      await SyncService.retryFailedOperations();
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Error retrying failed operations:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      updateSyncStatus();
    }
  };

  // Get pending operations
  const getPendingOperations = async (): Promise<SyncOperation[]> => {
    return SyncService.getPendingOperations();
  };

  // Get error operations
  const getErrorOperations = async (): Promise<SyncOperation[]> => {
    return SyncService.getErrorOperations();
  };

  // Clear sync queue
  const clearSyncQueue = async (): Promise<void> => {
    await SyncService.clearSyncQueue();
    updateSyncStatus();
  };

  const value = {
    isOnline,
    hasPendingOperations,
    pendingOperationsCount,
    errorOperationsCount,
    isSyncing,
    lastSyncTime,
    syncStatus,
    queueOperation,
    syncPendingOperations,
    retryFailedOperations,
    getPendingOperations,
    getErrorOperations,
    clearSyncQueue,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
