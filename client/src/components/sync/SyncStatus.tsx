import React, { useState } from 'react';
import { useSync } from '../../contexts/sync-context';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, WifiOff, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  showBanner?: boolean;
  showButton?: boolean;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  showBanner = true,
  showButton = true,
  className = '',
}) => {
  const {
    isOnline,
    hasPendingOperations,
    pendingOperationsCount,
    errorOperationsCount,
    isSyncing,
    lastSyncTime,
    syncStatus,
    syncPendingOperations,
    retryFailedOperations,
    getPendingOperations,
    getErrorOperations,
  } = useSync();

  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);
  const [errorOperations, setErrorOperations] = useState<any[]>([]);

  const handleSyncClick = async () => {
    if (hasPendingOperations || errorOperationsCount > 0) {
      // Fetch the pending and error operations
      const pending = await getPendingOperations();
      const errors = await getErrorOperations();
      
      setPendingOperations(pending);
      setErrorOperations(errors);
      
      setShowSyncDialog(true);
    } else {
      // If no pending operations, just check for any updates
      syncPendingOperations();
    }
  };

  const handleSync = async () => {
    await syncPendingOperations();
    setShowSyncDialog(false);
  };

  const handleRetry = async () => {
    await retryFailedOperations();
    setShowSyncDialog(false);
  };

  // Don't show anything if there's nothing to sync and no banner is requested
  if (!showBanner && !hasPendingOperations && errorOperationsCount === 0) {
    return null;
  }

  return (
    <>
      {/* Sync Status Banner */}
      {showBanner && (hasPendingOperations || errorOperationsCount > 0) && (
        <Card className={`p-3 mb-4 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <WifiOff className="h-5 w-5 text-yellow-500" />
              )}
              {isOnline && isSyncing && (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              {isOnline && !isSyncing && hasPendingOperations && (
                <RefreshCw className="h-5 w-5 text-blue-500" />
              )}
              {isOnline && !isSyncing && errorOperationsCount > 0 && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              
              <div>
                {!isOnline && (
                  <p className="text-sm font-medium">
                    You're offline. Changes will sync when you reconnect.
                  </p>
                )}
                {isOnline && hasPendingOperations && (
                  <p className="text-sm font-medium">
                    {pendingOperationsCount} {pendingOperationsCount === 1 ? 'change' : 'changes'} pending synchronization
                  </p>
                )}
                {isOnline && errorOperationsCount > 0 && (
                  <p className="text-sm font-medium text-red-500">
                    {errorOperationsCount} {errorOperationsCount === 1 ? 'error' : 'errors'} during synchronization
                  </p>
                )}
                {lastSyncTime && (
                  <p className="text-xs text-gray-500">
                    Last synced: {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            
            {showButton && isOnline && (
              <Button 
                size="sm" 
                onClick={handleSyncClick}
                disabled={isSyncing}
                variant={errorOperationsCount > 0 ? "destructive" : "default"}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Sync Status Indicator (when no banner) */}
      {!showBanner && showButton && (
        <Button
          size="sm"
          onClick={handleSyncClick}
          disabled={isSyncing}
          variant={errorOperationsCount > 0 ? "destructive" : "outline"}
          className={className}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !isOnline ? (
            <WifiOff className="h-4 w-4 text-yellow-500" />
          ) : errorOperationsCount > 0 ? (
            <AlertTriangle className="h-4 w-4" />
          ) : hasPendingOperations ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          
          {hasPendingOperations && (
            <Badge variant="secondary" className="ml-2">
              {pendingOperationsCount}
            </Badge>
          )}
        </Button>
      )}
      
      {/* Sync Dialog */}
      <AlertDialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingOperationsCount > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-sm mb-2">Pending Changes ({pendingOperationsCount})</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {pendingOperations.slice(0, 5).map((op) => (
                      <li key={op.id}>
                        {op.method} {op.entityType || 'data'} 
                        {op.entityId ? ` #${op.entityId}` : ''}
                      </li>
                    ))}
                    {pendingOperations.length > 5 && (
                      <li>...and {pendingOperations.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {errorOperationsCount > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-sm mb-2 text-red-500">Failed Changes ({errorOperationsCount})</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {errorOperations.slice(0, 5).map((op) => (
                      <li key={op.id}>
                        {op.method} {op.entityType || 'data'} 
                        {op.entityId ? ` #${op.entityId}` : ''}
                        <span className="text-red-500 block text-xs">
                          Error: {op.errorMessage?.substring(0, 50)}
                          {op.errorMessage && op.errorMessage.length > 50 ? '...' : ''}
                        </span>
                      </li>
                    ))}
                    {errorOperations.length > 5 && (
                      <li>...and {errorOperations.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {!isOnline && (
                <p className="text-yellow-500 font-medium">
                  You are currently offline. Please reconnect to the internet to sync changes.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {isOnline && pendingOperationsCount > 0 && (
              <AlertDialogAction onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </AlertDialogAction>
            )}
            {isOnline && errorOperationsCount > 0 && (
              <Button variant="destructive" onClick={handleRetry} disabled={isSyncing}>
                {isSyncing ? 'Retrying...' : 'Retry Failed'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
