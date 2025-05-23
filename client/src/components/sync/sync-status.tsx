import React from 'react';
import { useSync } from '@/contexts/sync-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOffline } from '@/components/ui/offline-indicator';

interface SyncStatusProps {
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
  showWhenNoChanges?: boolean;
}

/**
 * Sync Status Component
 * 
 * This component displays the current synchronization status and provides
 * controls for manual synchronization.
 * 
 * @param variant - Display variant: 'full', 'compact', or 'badge'
 * @param className - Additional CSS classes
 * @param showWhenNoChanges - Whether to show the component when there are no pending changes
 */
export function SyncStatus({
  variant = 'full',
  className,
  showWhenNoChanges = false
}: SyncStatusProps) {
  const {
    isSyncing,
    lastSyncTime,
    pendingOperationsCount,
    errorOperationsCount,
    syncStatus,
    syncPendingOperations,
    retryFailedOperations
  } = useSync();
  
  const isOffline = useOffline();
  
  // Don't show anything if there are no pending changes and showWhenNoChanges is false
  if (!showWhenNoChanges && pendingOperationsCount === 0 && errorOperationsCount === 0) {
    return null;
  }
  
  // Format last sync time
  const formattedLastSyncTime = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';
  
  // Badge variant
  if (variant === 'badge') {
    return (
      <Badge
        variant={
          isOffline
            ? 'outline'
            : syncStatus === 'error'
            ? 'destructive'
            : syncStatus === 'syncing'
            ? 'secondary'
            : pendingOperationsCount > 0
            ? 'default'
            : 'outline'
        }
        className={cn('flex items-center gap-1', className)}
      >
        {isOffline ? (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        ) : syncStatus === 'error' ? (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>Sync Error</span>
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : pendingOperationsCount > 0 ? (
          <>
            <Clock className="h-3 w-3" />
            <span>{pendingOperationsCount} Pending</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-3 w-3" />
            <span>Synced</span>
          </>
        )}
      </Badge>
    );
  }
  
  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {isOffline ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </Badge>
        ) : (
          <>
            {pendingOperationsCount > 0 && (
              <Badge className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{pendingOperationsCount} Pending</span>
              </Badge>
            )}
            
            {errorOperationsCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errorOperationsCount} Failed</span>
              </Badge>
            )}
            
            {pendingOperationsCount === 0 && errorOperationsCount === 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Synced</span>
              </Badge>
            )}
          </>
        )}
        
        {!isOffline && (pendingOperationsCount > 0 || errorOperationsCount > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={errorOperationsCount > 0 ? retryFailedOperations : syncPendingOperations}
            disabled={isSyncing}
            className="h-8 px-2"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', isSyncing && 'animate-spin')} />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </Button>
        )}
      </div>
    );
  }
  
  // Full variant (default)
  return (
    <div className={cn('space-y-2', className)}>
      <Alert
        variant={
          isOffline
            ? 'default'
            : syncStatus === 'error'
            ? 'destructive'
            : pendingOperationsCount > 0 || errorOperationsCount > 0
            ? 'warning'
            : 'default'
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <WifiOff className="h-4 w-4" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : syncStatus === 'syncing' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : pendingOperationsCount > 0 || errorOperationsCount > 0 ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            
            <div>
              <AlertTitle>
                {isOffline
                  ? "You're offline"
                  : syncStatus === 'error'
                  ? 'Sync Error'
                  : syncStatus === 'syncing'
                  ? 'Syncing...'
                  : pendingOperationsCount > 0 || errorOperationsCount > 0
                  ? 'Pending Changes'
                  : 'All Changes Synced'}
              </AlertTitle>
              
              <AlertDescription>
                {isOffline
                  ? 'Changes will be synced when you reconnect'
                  : syncStatus === 'error'
                  ? `Failed to sync ${errorOperationsCount} changes. Please retry.`
                  : syncStatus === 'syncing'
                  ? 'Syncing your changes with the server...'
                  : pendingOperationsCount > 0
                  ? `${pendingOperationsCount} changes pending synchronization`
                  : errorOperationsCount > 0
                  ? `${errorOperationsCount} changes failed to sync`
                  : `Last synced at ${formattedLastSyncTime}`}
              </AlertDescription>
            </div>
          </div>
          
          {!isOffline && (pendingOperationsCount > 0 || errorOperationsCount > 0) && (
            <Button
              variant={syncStatus === 'error' ? 'secondary' : 'outline'}
              size="sm"
              onClick={errorOperationsCount > 0 ? retryFailedOperations : syncPendingOperations}
              disabled={isSyncing}
              className="ml-auto"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
              <span>{isSyncing ? 'Syncing...' : errorOperationsCount > 0 ? 'Retry Failed' : 'Sync Now'}</span>
            </Button>
          )}
        </div>
        
        {isSyncing && (
          <Progress value={45} className="h-1 mt-2" />
        )}
      </Alert>
    </div>
  );
}
