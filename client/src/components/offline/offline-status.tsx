/**
 * Offline Status Component
 * 
 * Displays the current online/offline status and pending changes
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, CloudSync, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { offlineStorage } from '@/lib/offline-storage';
import { addNetworkStatusListeners, isOnline } from '@/lib/service-worker-registration';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

export function OfflineStatus() {
  const [online, setOnline] = useState(isOnline());
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load pending changes
  const loadPendingChanges = async () => {
    try {
      const changes = await offlineStorage.getPendingChanges();
      setPendingChanges(changes);
      setPendingCount(await offlineStorage.getPendingChangesCountByStatus('pending'));
      setErrorCount(await offlineStorage.getPendingChangesCountByStatus('error'));
    } catch (error) {
      console.error('Error loading pending changes:', error);
    }
  };

  // Sync pending changes
  const syncChanges = async () => {
    if (isSyncing || !online) return;
    
    setIsSyncing(true);
    
    try {
      const result = await offlineStorage.syncPendingChanges();
      console.log(`Sync completed: ${result.success} succeeded, ${result.failed} failed`);
      
      // Reload pending changes
      await loadPendingChanges();
      
      // Update last sync time
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error syncing changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Retry failed changes
  const retryFailedChanges = async () => {
    if (isSyncing || !online) return;
    
    setIsSyncing(true);
    
    try {
      const result = await offlineStorage.retryFailedChanges();
      console.log(`Retry completed: ${result.success} succeeded, ${result.failed} failed`);
      
      // Reload pending changes
      await loadPendingChanges();
      
      // Update last sync time
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error retrying failed changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Get entity display name
  const getEntityDisplayName = (entity: string) => {
    const entityMap: Record<string, string> = {
      'service-users': 'Service User',
      'care-plans': 'Care Plan',
      'appointments': 'Appointment',
      'staff': 'Staff',
      'care-notes': 'Care Note',
      'medications': 'Medication',
    };
    
    return entityMap[entity] || entity;
  };

  // Get action display name
  const getActionDisplayName = (action: string) => {
    const actionMap: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
    };
    
    return actionMap[action] || action;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'pending': 'secondary',
      'processing': 'default',
      'completed': 'outline',
      'error': 'destructive',
    };
    
    return statusMap[status] || 'outline';
  };

  // Initialize
  useEffect(() => {
    // Load pending changes
    loadPendingChanges();
    
    // Set up network status listeners
    const cleanup = addNetworkStatusListeners(
      () => {
        setOnline(true);
        // Sync changes when coming back online
        syncChanges();
      },
      () => setOnline(false)
    );
    
    // Set up interval to check for pending changes
    const interval = setInterval(loadPendingChanges, 30000);
    
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  // If no pending changes and online, don't show anything
  if (online && pendingCount === 0 && errorCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={online ? 'outline' : 'destructive'}
                size="sm"
                className="rounded-full p-2 h-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                {online ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                
                {(pendingCount > 0 || errorCount > 0) && (
                  <Badge 
                    variant={errorCount > 0 ? 'destructive' : 'secondary'} 
                    className="ml-2"
                  >
                    {pendingCount + errorCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {online ? 'Online' : 'Offline'} 
              {pendingCount > 0 && ` - ${pendingCount} pending changes`}
              {errorCount > 0 && ` - ${errorCount} failed changes`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {online ? (
                <>
                  <Wifi className="h-5 w-5 mr-2 text-green-500" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 mr-2 text-red-500" />
                  Offline
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {online 
                ? 'You are currently online. Changes will be synchronized with the server.'
                : 'You are currently offline. Changes will be stored locally and synchronized when you are back online.'}
            </DialogDescription>
          </DialogHeader>
          
          {pendingChanges.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingChanges.map((change) => (
                    <TableRow key={change.id}>
                      <TableCell>{getEntityDisplayName(change.entity)}</TableCell>
                      <TableCell>{getActionDisplayName(change.action)}</TableCell>
                      <TableCell>{formatTimestamp(change.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(change.status)}>
                          {change.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <CloudSync className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No pending changes</p>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {lastSyncTime && (
                <span>Last synced: {formatDistanceToNow(lastSyncTime, { addSuffix: true })}</span>
              )}
            </div>
            <div className="flex gap-2">
              {errorCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={retryFailedChanges}
                  disabled={!online || isSyncing}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
              )}
              
              <Button 
                onClick={syncChanges}
                disabled={!online || isSyncing || pendingCount === 0}
              >
                <CloudSync className="h-4 w-4 mr-2" />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
