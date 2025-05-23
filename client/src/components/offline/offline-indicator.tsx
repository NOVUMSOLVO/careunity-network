/**
 * Offline Indicator Component
 * 
 * This component displays an indicator when the application is offline
 * and provides controls for syncing data when back online.
 */

import React, { useState, useEffect } from 'react';
import { useOffline } from '../../contexts/offline-context';
import { SyncStatus } from '../../services/sync-service';

/**
 * Offline indicator props
 */
interface OfflineIndicatorProps {
  showSyncButton?: boolean;
  showPendingCount?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Offline indicator component
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showSyncButton = true,
  showPendingCount = true,
  className = '',
  style = {},
}) => {
  const {
    isOnline,
    isSyncing,
    hasPendingChanges,
    pendingChangesCount,
    syncPendingChanges,
    syncStatus,
  } = useOffline();
  
  const [showIndicator, setShowIndicator] = useState<boolean>(!isOnline);
  const [syncError, setSyncError] = useState<boolean>(false);
  
  // Update indicator visibility
  useEffect(() => {
    if (!isOnline) {
      // Always show when offline
      setShowIndicator(true);
    } else if (hasPendingChanges) {
      // Show when online but has pending changes
      setShowIndicator(true);
    } else {
      // Hide after a delay when online with no pending changes
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasPendingChanges]);
  
  // Update sync error state
  useEffect(() => {
    setSyncError(syncStatus === SyncStatus.ERROR);
  }, [syncStatus]);
  
  // Don't render if nothing to show
  if (!showIndicator) {
    return null;
  }
  
  return (
    <div
      className={`offline-indicator ${isOnline ? 'online' : 'offline'} ${
        hasPendingChanges ? 'has-pending' : ''
      } ${syncError ? 'sync-error' : ''} ${className}`}
      style={style}
    >
      <div className="offline-indicator-content">
        {!isOnline ? (
          <div className="offline-status">
            <span className="offline-icon">📶</span>
            <span className="offline-text">You are offline</span>
          </div>
        ) : hasPendingChanges ? (
          <div className="pending-status">
            <span className="pending-icon">🔄</span>
            <span className="pending-text">
              {showPendingCount
                ? `${pendingChangesCount} pending change${
                    pendingChangesCount !== 1 ? 's' : ''
                  }`
                : 'Pending changes'}
            </span>
          </div>
        ) : (
          <div className="online-status">
            <span className="online-icon">✅</span>
            <span className="online-text">Connected</span>
          </div>
        )}
        
        {isOnline && hasPendingChanges && showSyncButton && (
          <button
            className="sync-button"
            onClick={syncPendingChanges}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : syncError ? 'Retry Sync' : 'Sync Now'}
          </button>
        )}
      </div>
      
      <style jsx>{`
        .offline-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          padding: 10px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          max-width: 300px;
        }
        
        .offline {
          background-color: #f87171;
          color: white;
        }
        
        .online {
          background-color: #10b981;
          color: white;
        }
        
        .has-pending {
          background-color: #f59e0b;
          color: white;
        }
        
        .sync-error {
          background-color: #ef4444;
          color: white;
        }
        
        .offline-indicator-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .offline-status,
        .pending-status,
        .online-status {
          display: flex;
          align-items: center;
        }
        
        .offline-icon,
        .pending-icon,
        .online-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .sync-button {
          margin-left: 12px;
          padding: 4px 10px;
          border-radius: 4px;
          border: none;
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }
        
        .sync-button:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .sync-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .offline-indicator {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Offline wrapper component
 * 
 * This component wraps content and displays a message when offline
 */
interface OfflineWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOnline?: boolean;
}

export const OfflineWrapper: React.FC<OfflineWrapperProps> = ({
  children,
  fallback,
  requireOnline = false,
}) => {
  const { isOnline } = useOffline();
  
  // If online or not requiring online, render children
  if (isOnline || !requireOnline) {
    return <>{children}</>;
  }
  
  // If offline and requiring online, render fallback
  return (
    <>
      {fallback || (
        <div className="offline-fallback">
          <div className="offline-fallback-content">
            <div className="offline-icon">📶</div>
            <h3>You are offline</h3>
            <p>This feature requires an internet connection.</p>
          </div>
          
          <style jsx>{`
            .offline-fallback {
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              text-align: center;
            }
            
            .offline-fallback-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .offline-icon {
              font-size: 32px;
              margin-bottom: 16px;
            }
            
            h3 {
              margin: 0 0 8px 0;
              font-size: 18px;
              color: #1f2937;
            }
            
            p {
              margin: 0;
              color: #6b7280;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
