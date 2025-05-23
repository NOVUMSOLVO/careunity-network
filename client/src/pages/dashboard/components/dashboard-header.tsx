import React from 'react';
import { User } from '@shared/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DownloadIcon, 
  RefreshCwIcon, 
  WifiOffIcon, 
  WifiIcon,
  BellIcon,
  UserIcon,
  SettingsIcon
} from 'lucide-react';
import { SyncStatus } from '@/components/sync/SyncStatus';
import { formatDate } from '@/lib/utils';

interface DashboardHeaderProps {
  user: User | null;
  isOnline: boolean;
  syncStatus: {
    lastSyncTime: string | null;
    pendingChanges: number;
    syncing: boolean;
  };
  dashboardView: string;
}

/**
 * Dashboard header component
 * 
 * Displays the dashboard header with user information, sync status,
 * and quick actions.
 */
export function DashboardHeader({ 
  user, 
  isOnline, 
  syncStatus,
  dashboardView 
}: DashboardHeaderProps) {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    if (!user) return 'Welcome to CareUnity';
    
    switch (dashboardView) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'manager':
        return 'Care Manager Dashboard';
      case 'coordinator':
        return 'Care Coordinator Dashboard';
      case 'caregiver':
        return 'Caregiver Dashboard';
      default:
        return 'Welcome to CareUnity';
    }
  };
  
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.fullName || 'Guest'}
        </h1>
        <p className="text-muted-foreground">
          {getWelcomeMessage()} | {formatDate(new Date(), 'full')}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Sync status indicator */}
        <Card className="border-none shadow-none">
          <CardContent className="flex items-center gap-2 p-2">
            {isOnline ? (
              <WifiIcon className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOffIcon className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            
            {syncStatus.pendingChanges > 0 && (
              <Badge variant="outline" className="ml-2">
                {syncStatus.pendingChanges} pending
              </Badge>
            )}
            
            {syncStatus.lastSyncTime && (
              <span className="text-xs text-muted-foreground">
                Last sync: {formatDate(new Date(syncStatus.lastSyncTime), 'time')}
              </span>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              disabled={!isOnline || syncStatus.syncing}
              title="Sync now"
            >
              <RefreshCwIcon className={`h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </Button>
        
        {/* User menu */}
        <Button variant="ghost" size="icon">
          <UserIcon className="h-5 w-5" />
        </Button>
        
        {/* Settings */}
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
