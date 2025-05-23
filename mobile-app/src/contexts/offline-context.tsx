import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

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
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Check for pending changes on startup
    checkPendingChanges();

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for pending changes whenever online status changes
  useEffect(() => {
    if (isOnline) {
      checkPendingChanges();
    }
  }, [isOnline]);

  // Check for pending changes
  const checkPendingChanges = async () => {
    try {
      const pendingActionsString = await AsyncStorage.getItem('pendingActions');
      const pendingActions = pendingActionsString ? JSON.parse(pendingActionsString) : [];
      
      setHasPendingChanges(pendingActions.length > 0);
      setPendingChangesCount(pendingActions.length);
    } catch (error) {
      console.error('Error checking pending changes:', error);
    }
  };

  // Sync pending changes with the server
  const syncPendingChanges = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync changes while offline');
    }

    try {
      const pendingActionsString = await AsyncStorage.getItem('pendingActions');
      const pendingActions = pendingActionsString ? JSON.parse(pendingActionsString) : [];
      
      if (pendingActions.length === 0) {
        return;
      }

      // Process each pending action
      const failedActions = [];
      
      for (const action of pendingActions) {
        try {
          await axios({
            method: action.method,
            url: `${API_URL}${action.url}`,
            data: action.data,
            headers: action.headers,
          });
        } catch (error) {
          console.error('Error syncing action:', error);
          failedActions.push(action);
        }
      }

      // Update pending actions with only failed ones
      await AsyncStorage.setItem('pendingActions', JSON.stringify(failedActions));
      
      // Update state
      setHasPendingChanges(failedActions.length > 0);
      setPendingChangesCount(failedActions.length);
    } catch (error) {
      console.error('Error syncing pending changes:', error);
      throw error;
    }
  };

  // Cache data with optional expiry time
  const cacheData = async (key: string, data: any, expiryTime?: number) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: expiryTime ? Date.now() + expiryTime : null,
      };
      
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  // Get cached data if not expired
  const getCachedData = async (key: string) => {
    try {
      const cachedItemString = await AsyncStorage.getItem(`cache_${key}`);
      
      if (!cachedItemString) {
        return null;
      }
      
      const cachedItem = JSON.parse(cachedItemString);
      
      // Check if expired
      if (cachedItem.expiry && Date.now() > cachedItem.expiry) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return cachedItem.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  };

  // Save data for offline use
  const saveOfflineData = async (storeName: string, data: any) => {
    try {
      const existingDataString = await AsyncStorage.getItem(`offline_${storeName}`);
      const existingData = existingDataString ? JSON.parse(existingDataString) : [];
      
      // If data has an ID, update existing item
      if (data.id) {
        const index = existingData.findIndex((item: any) => item.id === data.id);
        
        if (index >= 0) {
          existingData[index] = { ...existingData[index], ...data };
        } else {
          existingData.push(data);
        }
      } else {
        // Add new item with temporary ID
        existingData.push({
          ...data,
          id: `temp_${Date.now()}`,
          _isOfflineCreated: true,
        });
      }
      
      await AsyncStorage.setItem(`offline_${storeName}`, JSON.stringify(existingData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  // Get offline data
  const getOfflineData = async (storeName: string) => {
    try {
      const dataString = await AsyncStorage.getItem(`offline_${storeName}`);
      return dataString ? JSON.parse(dataString) : [];
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  };

  // Clear all cached data
  const clearCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
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
