/**
 * Network Status Utility
 * 
 * Provides functions to check and monitor network connectivity
 */

import { create } from 'zustand';

// Network status store
interface NetworkStatusState {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

export const useNetworkStatus = create<NetworkStatusState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setIsOnline: (status: boolean) => set({ isOnline: status }),
}));

/**
 * Check if the user is currently online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Initialize network status monitoring
 * Call this function once at app startup
 */
export function initNetworkStatusMonitoring(): void {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    useNetworkStatus.getState().setIsOnline(true);
    console.log('Network connection restored');
  };

  const handleOffline = () => {
    useNetworkStatus.getState().setIsOnline(false);
    console.log('Network connection lost');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Check if the server is reachable
 * This is a more reliable way to check connectivity than just navigator.onLine
 */
export async function isServerReachable(url: string = '/api/healthcheck'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}
