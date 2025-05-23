/**
 * Enhanced Offline Status Component
 * 
 * This component displays the current network status and provides controls
 * for managing offline functionality, including:
 * - Displaying online/offline status
 * - Showing pending sync operations
 * - Triggering manual sync
 * - Displaying last sync time
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isOnline, triggerSync } from '@/lib/enhanced-service-worker-registration';
import { useToast } from '@/components/ui/toast';

interface EnhancedOfflineStatusProps {
  className?: string;
  showControls?: boolean;
  showSyncStatus?: boolean;
  showPendingCount?: boolean;
}

export function EnhancedOfflineStatus({
  className = '',
  showControls = true,
  showSyncStatus = true,
  showPendingCount = true
}: EnhancedOfflineStatusProps) {
  // State
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  // Update network status when online/offline events occur
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      // Auto-sync when coming back online
      handleSync();
    };

    const handleOffline = () => {
      setNetworkStatus(false);
    };

    // Listen for sync events
    const handleSyncCompleted = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsSyncing(false);
      setLastSyncTime(new Date());
      setPendingCount(0);
      
      toast({
        title: 'Sync Completed',
        description: `Data synchronized successfully at ${new Date().toLocaleTimeString()}`,
      });
    };

    const handleSyncFailed = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsSyncing(false);
      
      toast({
        title: 'Sync Failed',
        description: `Failed to synchronize data: ${detail.error || 'Unknown error'}`,
        variant: 'destructive',
      });
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('syncCompleted', handleSyncCompleted);
    window.addEventListener('syncFailed', handleSyncFailed);

    // Initialize network status
    setNetworkStatus(isOnline());

    // Simulate pending operations for demo purposes
    // In a real app, this would come from IndexedDB
    setPendingCount(Math.floor(Math.random() * 5));

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncCompleted', handleSyncCompleted);
      window.removeEventListener('syncFailed', handleSyncFailed);
    };
  }, [toast]);

  // Handle manual sync
  const handleSync = async () => {
    if (!networkStatus) {
      toast({
        title: 'Offline',
        description: 'Cannot sync while offline. Please connect to the internet.',
        variant: 'destructive',
      });
      return;
    }

    if (isSyncing) {
      toast({
        title: 'Sync in Progress',
        description: 'A sync operation is already in progress.',
      });
      return;
    }

    setIsSyncing(true);
    
    toast({
      title: 'Sync Started',
      description: 'Synchronizing data...',
    });

    try {
      const success = await triggerSync('syncData');
      
      if (!success) {
        setIsSyncing(false);
        toast({
          title: 'Sync Failed',
          description: 'Failed to trigger sync operation.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsSyncing(false);
      toast({
        title: 'Sync Error',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Render minimal version (just the status indicator)
  if (!showControls && !showSyncStatus && !showPendingCount) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {networkStatus ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{networkStatus ? 'Connected to the internet' : 'No internet connection'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Render full version
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Network Status</h3>
        {networkStatus ? (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        )}
      </div>

      {showPendingCount && (
        <div className="mb-3">
          <div className="flex justify-between items-center text-sm mb-1">
            <span>Pending Operations</span>
            <span className="font-medium">{pendingCount}</span>
          </div>
          <Progress value={(pendingCount / 10) * 100} className="h-1" />
        </div>
      )}

      {showSyncStatus && (
        <div className="text-xs text-muted-foreground mb-3">
          {lastSyncTime ? (
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              <span>Last synced: {lastSyncTime.toLocaleTimeString()}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
              <span>Not synced yet</span>
            </div>
          )}
        </div>
      )}

      {showControls && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleSync}
            disabled={!networkStatus || isSyncing}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Database className="h-3 w-3 mr-1" />
                Sync Data
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
