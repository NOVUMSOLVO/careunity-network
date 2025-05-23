import React, { useState, useEffect } from 'react';
import OfflineService, { SyncStatus } from '../services/offline-service';

interface OfflineStatusBarProps {
  onSyncComplete?: () => void;
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);

  // Check online status and pending changes
  const checkStatus = async () => {
    try {
      const hasPending = await OfflineService.hasPendingItems();
      setHasPendingChanges(hasPending);

      const count = await OfflineService.getPendingItemsCount();
      setPendingCount(count);

      const conflicts = await OfflineService.getConflicts();
      setConflictCount(conflicts.length);

      if (showDetails) {
        const operations = await OfflineService.getPendingOperations();
        setPendingOperations(operations);
      }
    } catch (error) {
      console.error('Error checking offline status:', error);
    }
  };

  // Sync pending changes
  const syncChanges = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await OfflineService.syncPendingData();
      setLastSyncTime(new Date());
      
      if (onSyncComplete) {
        onSyncComplete();
      }

      // Show results
      const message = `Sync completed: ${result.success} succeeded, ${result.failed} failed, ${result.conflicts} conflicts, ${result.pending} pending.`;
      console.log(message);
      
      // Update status
      await checkStatus();
    } catch (error) {
      console.error('Error syncing changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle details view
  const toggleDetails = async () => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    
    if (newShowDetails) {
      const operations = await OfflineService.getPendingOperations();
      setPendingOperations(operations);
    }
  };

  // Retry a failed operation
  const retryOperation = async (operationId: number) => {
    await OfflineService.retryOperation(operationId);
    await checkStatus();
  };

  // Delete a failed operation
  const deleteOperation = async (operationId: number) => {
    if (confirm('Are you sure you want to delete this operation? This cannot be undone.')) {
      await OfflineService.deleteOperation(operationId);
      await checkStatus();
    }
  };

  // Set up event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    checkStatus();

    // Set up interval to check status
    const interval = setInterval(checkStatus, 30000);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if online and no pending changes
  if (isOnline && !hasPendingChanges && !showDetails) {
    return null;
  }

  return (
    <div className="offline-status-bar">
      <div className="offline-status-container">
        <div className="offline-status-indicator">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span className="status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {hasPendingChanges && (
          <div className="pending-changes">
            <span className="pending-count">{pendingCount} pending changes</span>
            {conflictCount > 0 && (
              <span className="conflict-count">{conflictCount} conflicts</span>
            )}
          </div>
        )}

        <div className="offline-actions">
          {hasPendingChanges && isOnline && (
            <button 
              className="sync-button" 
              onClick={syncChanges} 
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
          <button 
            className="details-button" 
            onClick={toggleDetails}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="offline-details">
          <h3>Pending Operations</h3>
          {pendingOperations.length === 0 ? (
            <p>No pending operations</p>
          ) : (
            <table className="operations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOperations.map((op) => (
                  <tr key={op.id} className={`status-${op.status.toLowerCase()}`}>
                    <td>{op.id}</td>
                    <td>{op.method}</td>
                    <td>{op.url}</td>
                    <td>{op.status}</td>
                    <td>{new Date(op.timestamp).toLocaleString()}</td>
                    <td>
                      {op.status === SyncStatus.FAILED && (
                        <>
                          <button onClick={() => retryOperation(op.id)}>Retry</button>
                          <button onClick={() => deleteOperation(op.id)}>Delete</button>
                        </>
                      )}
                      {op.status === SyncStatus.CONFLICT && (
                        <button onClick={() => window.location.href = `/conflicts/${op.id}`}>
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {lastSyncTime && (
            <p className="last-sync">
              Last sync: {lastSyncTime.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .offline-status-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          padding: 8px 16px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .offline-status-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .offline-status-indicator {
          display: flex;
          align-items: center;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .status-dot.online {
          background-color: #28a745;
        }
        
        .status-dot.offline {
          background-color: #dc3545;
        }
        
        .pending-changes {
          margin: 0 16px;
        }
        
        .conflict-count {
          margin-left: 8px;
          color: #dc3545;
          font-weight: bold;
        }
        
        .offline-actions {
          display: flex;
        }
        
        button {
          margin-left: 8px;
          padding: 4px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background-color: #fff;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #f1f3f5;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .sync-button {
          background-color: #007bff;
          color: white;
        }
        
        .sync-button:hover {
          background-color: #0069d9;
        }
        
        .offline-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #dee2e6;
        }
        
        .operations-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        
        .operations-table th,
        .operations-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        
        .status-pending {
          background-color: #fff3cd;
        }
        
        .status-processing {
          background-color: #cce5ff;
        }
        
        .status-completed {
          background-color: #d4edda;
        }
        
        .status-failed {
          background-color: #f8d7da;
        }
        
        .status-conflict {
          background-color: #f8d7da;
        }
        
        .last-sync {
          margin-top: 16px;
          font-size: 0.875rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default OfflineStatusBar;
