/**
 * Offline Indicator Component
 * 
 * This component displays an indicator when the user is offline.
 */

import React, { useState, useEffect } from 'react';
import { useOffline } from '../hooks/useOffline';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isOffline, hasUpdate, applyUpdate } = useOffline();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState<boolean>(false);

  // Show update prompt when an update is available
  useEffect(() => {
    if (hasUpdate) {
      setShowUpdatePrompt(true);
    }
  }, [hasUpdate]);

  // Hide the offline indicator after 5 seconds when coming back online
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isOffline) {
      setShowReconnected(true);
      timeout = setTimeout(() => {
        setShowReconnected(false);
      }, 5000);
    }
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOffline]);

  if (!isOffline && !showReconnected && !showUpdatePrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {isOffline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18.364 5.636a9 9 0 010 12.728l-2.829-2.829a5 5 0 000-7.07l2.829-2.829zm-3.536 3.536a3 3 0 000 4.243l-1.414-1.414a1 1 0 010-1.414l1.414-1.415zm-7.072 7.072l1.414-1.414a1 1 0 011.414 0l1.414 1.414a3 3 0 00-4.242 0zm-3.536 3.536l2.829-2.829a5 5 0 017.07 0l2.83 2.829a9 9 0 00-12.728 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>You are offline. Some features may be unavailable.</span>
        </div>
      )}

      {!isOffline && showReconnected && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
          <span>You are back online!</span>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span>A new version is available!</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={applyUpdate}
              className="bg-white text-blue-500 px-3 py-1 rounded-md text-sm font-medium"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-white px-3 py-1 rounded-md text-sm font-medium border border-white"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
