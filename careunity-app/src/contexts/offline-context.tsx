import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OfflineService from '../services/offline-service';

interface OfflineContextType {
  isOnline: boolean;
  hasPendingChanges: boolean;
  pendingChangesCount: number;
  syncPendingChanges: () => Promise<void>;
  cacheData: (key: string, data: any, expiryTime?: number) => Promise<void>;
  getCachedData: (key: string) => Promise<any | null>;
  saveOfflineData: (storeName: string, data: any) => Promise<void>;
  getOfflineData: (storeName: string) => Promise<any[]>;
  clearCache: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);

  // Check for pending changes on mount and when online status changes
  useEffect(() => {
    const checkPendingChanges = async () => {
      const hasPending = await OfflineService.hasPendingItems();
      setHasPendingChanges(hasPending);
      
      const count = await OfflineService.getPendingItemsCount();
      setPendingChangesCount(count);
    };
    
    checkPendingChanges();
    
    // Set up interval to periodically check for pending changes
    const interval = setInterval(checkPendingChanges, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isOnline]);

  // Set up online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Try to sync when coming back online
      syncPendingChanges();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending changes with the server
  const syncPendingChanges = async (): Promise<void> => {
    if (!isOnline) {
      console.warn('Cannot sync changes while offline');
      return;
    }
    
    try {
      await OfflineService.syncPendingData();
      
      // Update state after sync
      const hasPending = await OfflineService.hasPendingItems();
      setHasPendingChanges(hasPending);
      
      const count = await OfflineService.getPendingItemsCount();
      setPendingChangesCount(count);
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  };

  // Cache data for offline use
  const cacheData = async (key: string, data: any, expiryTime?: number): Promise<void> => {
    try {
      await OfflineService.cacheData(key, data, expiryTime);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  // Get cached data
  const getCachedData = async (key: string): Promise<any | null> => {
    try {
      return await OfflineService.getCachedData(key);
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  };

  // Save offline data
  const saveOfflineData = async (storeName: string, data: any): Promise<void> => {
    try {
      await OfflineService.saveOfflineData(storeName, data);
      
      // Update pending changes state
      const hasPending = await OfflineService.hasPendingItems();
      setHasPendingChanges(hasPending);
      
      const count = await OfflineService.getPendingItemsCount();
      setPendingChangesCount(count);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  // Get offline data
  const getOfflineData = async (storeName: string): Promise<any[]> => {
    try {
      return await OfflineService.getOfflineData(storeName);
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  };

  // Clear all cached data
  const clearCache = async (): Promise<void> => {
    try {
      await OfflineService.clearAllCache();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const value = {
    isOnline,
    hasPendingChanges,
    pendingChangesCount,
    syncPendingChanges,
    cacheData,
    getCachedData,
    saveOfflineData,
    getOfflineData,
    clearCache,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;
