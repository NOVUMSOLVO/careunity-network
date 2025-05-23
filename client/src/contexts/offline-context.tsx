import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { offlineStorage } from '@/lib/offline-storage';
import { isOnline as checkIsOnline, addNetworkStatusListeners } from '@/lib/service-worker-registration';

// Define the context type
interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  hasPendingChanges: boolean;
  pendingChangesCount: number;
  errorChangesCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  syncChanges: () => Promise<void>;
  retryFailedChanges: () => Promise<void>;
  addPendingChange: (entity: string, action: 'create' | 'update' | 'delete', data: any) => Promise<string>;
}

// Create the context with a default value
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider props
interface OfflineProviderProps {
  children: ReactNode;
}

// Provider component
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(checkIsOnline());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [errorChangesCount, setErrorChangesCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Check for pending changes in IndexedDB
  const checkPendingChanges = async () => {
    try {
      const pendingCount = await offlineStorage.getPendingChangesCountByStatus('pending');
      const errorCount = await offlineStorage.getPendingChangesCountByStatus('error');

      setPendingChangesCount(pendingCount);
      setErrorChangesCount(errorCount);
      setHasPendingChanges(pendingCount > 0 || errorCount > 0);
    } catch (error) {
      console.error('Error checking pending changes:', error);
    }
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'You are back online',
        description: hasPendingChanges
          ? 'You have pending changes that need to be synced.'
          : 'Your connection has been restored.',
      });

      // Try to sync changes when coming back online
      if (hasPendingChanges) {
        syncChanges();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'You are offline',
        description: 'The app will continue to work in offline mode.',
        variant: 'destructive',
      });

      // Automatically enable offline mode when the user goes offline
      setIsOfflineMode(true);
    };

    // Set up network status listeners using our service worker registration helper
    const cleanup = addNetworkStatusListeners(handleOnline, handleOffline);

    // Check for pending changes on mount
    checkPendingChanges();

    // Set up periodic check for pending changes
    const interval = setInterval(checkPendingChanges, 30000); // Check every 30 seconds

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        checkPendingChanges();
        setLastSyncTime(new Date(event.data.timestamp));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    // Clean up
    return () => {
      cleanup();
      clearInterval(interval);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [hasPendingChanges, toast]);

  // Enable offline mode
  const enableOfflineMode = () => {
    setIsOfflineMode(true);
    toast({
      title: 'Offline Mode Enabled',
      description: 'Changes will be saved locally and synced when you reconnect.',
    });
  };

  // Disable offline mode
  const disableOfflineMode = () => {
    if (!isOnline) {
      toast({
        title: 'Cannot Disable Offline Mode',
        description: 'You are currently offline. Please reconnect to the internet first.',
        variant: 'destructive',
      });
      return;
    }

    if (hasPendingChanges) {
      toast({
        title: 'Pending Changes',
        description: 'Please sync your changes before disabling offline mode.',
        variant: 'destructive',
      });
      return;
    }

    setIsOfflineMode(false);
    toast({
      title: 'Offline Mode Disabled',
      description: 'You are now working in online mode.',
    });
  };

  // Sync changes
  const syncChanges = async () => {
    if (!isOnline) {
      toast({
        title: 'Cannot Sync Changes',
        description: 'You are currently offline. Please reconnect to the internet first.',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Cannot sync while offline'));
    }

    if (isSyncing) {
      toast({
        title: 'Sync in Progress',
        description: 'A synchronization is already in progress.',
      });
      return Promise.resolve();
    }

    try {
      setIsSyncing(true);

      // Check if there are any pending changes
      const pendingCount = await offlineStorage.getPendingChangesCountByStatus('pending');

      if (pendingCount === 0) {
        toast({
          title: 'No Changes to Sync',
          description: 'There are no pending changes to synchronize.',
        });
        setIsSyncing(false);
        return Promise.resolve();
      }

      // Sync changes using our offline storage
      const result = await offlineStorage.syncPendingChanges();

      // Update state
      await checkPendingChanges();
      setLastSyncTime(new Date());

      toast({
        title: 'Changes Synced Successfully',
        description: `${result.success} changes have been synchronized with the server.${result.failed > 0 ? ` ${result.failed} changes failed.` : ''}`,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error syncing changes:', error);
      toast({
        title: 'Sync Failed',
        description: 'There was an error synchronizing your changes. Please try again.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Retry failed changes
  const retryFailedChanges = async () => {
    if (!isOnline) {
      toast({
        title: 'Cannot Retry Changes',
        description: 'You are currently offline. Please reconnect to the internet first.',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Cannot retry while offline'));
    }

    if (isSyncing) {
      toast({
        title: 'Sync in Progress',
        description: 'A synchronization is already in progress.',
      });
      return Promise.resolve();
    }

    try {
      setIsSyncing(true);

      // Check if there are any failed changes
      const errorCount = await offlineStorage.getPendingChangesCountByStatus('error');

      if (errorCount === 0) {
        toast({
          title: 'No Failed Changes',
          description: 'There are no failed changes to retry.',
        });
        setIsSyncing(false);
        return Promise.resolve();
      }

      // Retry failed changes
      const result = await offlineStorage.retryFailedChanges();

      // Update state
      await checkPendingChanges();
      setLastSyncTime(new Date());

      toast({
        title: 'Retry Completed',
        description: `${result.success} changes have been synchronized with the server.${result.failed > 0 ? ` ${result.failed} changes failed.` : ''}`,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error retrying changes:', error);
      toast({
        title: 'Retry Failed',
        description: 'There was an error retrying your changes. Please try again.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add pending change
  const addPendingChange = async (
    entity: string,
    action: 'create' | 'update' | 'delete',
    data: any
  ) => {
    try {
      const changeId = await offlineStorage.addPendingChange(entity, action, data);

      // Update state
      await checkPendingChanges();

      // If online and not in offline mode, try to sync immediately
      if (isOnline && !isOfflineMode && !isSyncing) {
        syncChanges();
      }

      return changeId;
    } catch (error) {
      console.error('Error adding pending change:', error);
      toast({
        title: 'Error Saving Change',
        description: 'There was an error saving your change for later synchronization.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get pending changes count
  const getPendingChangesCount = () => {
    return pendingChangesCount;
  };

  // Context value
  const value = {
    isOnline,
    isOfflineMode,
    hasPendingChanges,
    pendingChangesCount,
    errorChangesCount,
    lastSyncTime,
    isSyncing,
    enableOfflineMode,
    disableOfflineMode,
    syncChanges,
    retryFailedChanges,
    addPendingChange,
    getPendingChangesCount,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

// Hook to use the offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);

  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }

  return context;
};
