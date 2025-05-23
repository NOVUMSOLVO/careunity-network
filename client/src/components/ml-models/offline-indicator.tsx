/**
 * ML Models Offline Indicator
 * 
 * This component displays the offline status specifically for ML models,
 * including information about cached models and pending operations.
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { isOnline } from '@/lib/network-status';
import { getCachedModels, getPendingPredictionRequests } from '@/services/ml-models-offline-service';

interface MLModelsOfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function MLModelsOfflineIndicator({ 
  className = '', 
  showDetails = false 
}: MLModelsOfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [cachedModelsCount, setCachedModelsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();

  // Check offline status and cached data
  useEffect(() => {
    const checkStatus = async () => {
      // Check online status
      setIsOffline(!isOnline());
      
      // Check cached models
      const cachedModels = await getCachedModels();
      setCachedModelsCount(cachedModels ? cachedModels.length : 0);
      
      // Check pending requests
      const pendingRequests = await getPendingPredictionRequests();
      setPendingRequestsCount(pendingRequests.length);
      
      // Get last sync time from localStorage
      const lastSync = localStorage.getItem('ml_models_last_sync');
      setLastSyncTime(lastSync);
    };
    
    // Run immediately
    checkStatus();
    
    // Set up event listeners for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: 'Back Online',
        description: 'Your ML models will now sync with the server.',
      });
      checkStatus();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: 'Offline Mode',
        description: 'Using cached ML models data.',
        variant: 'destructive',
      });
      checkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for sync completed events from service worker
    const handleSyncCompleted = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        const timestamp = new Date(event.data.timestamp).toLocaleString();
        setLastSyncTime(timestamp);
        localStorage.setItem('ml_models_last_sync', timestamp);
        
        toast({
          title: 'ML Models Sync Complete',
          description: `Synced ${event.data.success} items. ${event.data.pending} items pending.`,
        });
        
        checkStatus();
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleSyncCompleted);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSyncCompleted);
    };
  }, [toast]);
  
  // Force sync with server
  const handleSync = async () => {
    if (isOffline) {
      toast({
        title: 'Cannot Sync',
        description: 'You are currently offline. Please connect to the internet and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Syncing ML Models',
      description: 'Synchronizing cached data with the server...',
    });
    
    try {
      // Send message to service worker to sync
      navigator.serviceWorker?.controller?.postMessage({
        type: 'SYNC_REQUIRED',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing ML models:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize ML models data.',
        variant: 'destructive',
      });
    }
  };
  
  // Simple indicator without details
  if (!showDetails) {
    return (
      <div className={`flex items-center ${className}`}>
        {isOffline ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  <span className="text-xs">Offline</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>ML Models are in offline mode. {cachedModelsCount} models cached.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Online</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>ML Models are connected to the server</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
  
  // Detailed indicator with sync button and stats
  return (
    <div className={`rounded-md border p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {isOffline ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              <WifiOff className="h-3 w-3 mr-1" />
              <span>Offline Mode</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Online</span>
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSync}
          disabled={isOffline}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync Now
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">Cached Models:</span>
          <span className="ml-1 font-medium">{cachedModelsCount}</span>
        </div>
        
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">Pending Requests:</span>
          <span className="ml-1 font-medium">{pendingRequestsCount}</span>
        </div>
      </div>
      
      {lastSyncTime && (
        <div className="mt-2 text-xs text-muted-foreground">
          Last synced: {lastSyncTime}
        </div>
      )}
    </div>
  );
}
