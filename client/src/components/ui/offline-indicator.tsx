import React from 'react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showOnlineStatus?: boolean;
  variant?: 'minimal' | 'badge' | 'banner';
}

/**
 * Offline status indicator component
 * Shows different visual indicators based on connection status
 */
export function OfflineIndicator({
  className,
  showOnlineStatus = false,
  variant = 'badge'
}: OfflineIndicatorProps) {
  const isOffline = useOffline();
  
  // If online and not configured to show online status, don't render anything
  if (!isOffline && !showOnlineStatus) {
    return null;
  }
  
  // Minimal variant - just an icon
  if (variant === 'minimal') {
    return (
      <div 
        className={cn(
          "flex items-center", 
          isOffline ? "text-red-500" : "text-green-500",
          className
        )}
      >
        {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
      </div>
    );
  }
  
  // Badge variant
  if (variant === 'badge') {
    return (
      <div 
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
          isOffline 
            ? "bg-red-100 text-red-800" 
            : "bg-green-100 text-green-800",
          className
        )}
      >
        {isOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
        <span>{isOffline ? "Offline" : "Online"}</span>
      </div>
    );
  }
  
  // Banner variant (full width)
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2 p-2 text-sm font-medium text-white transition-all",
        isOffline 
          ? "bg-red-500 animate-pulse" 
          : "bg-green-500",
        className
      )}
    >
      {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
      <span>
        {isOffline 
          ? "You're offline. Some features may be limited." 
          : "You're back online. All features available."}
      </span>
    </div>
  );
}

/**
 * Offline Wrapper component
 * Wraps content with a fallback when offline
 */
interface OfflineWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresOnline?: boolean;
}

export function OfflineWrapper({ 
  children, 
  fallback, 
  requiresOnline = true 
}: OfflineWrapperProps) {
  const isOffline = useOffline();
  
  // If offline and this component requires online connectivity, show fallback
  if (isOffline && requiresOnline) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-center">
        <WifiOff className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-medium text-red-800">You're offline</h3>
        <p className="text-sm text-red-700 mt-1">
          This content requires an internet connection.
        </p>
      </div>
    );
  }
  
  // Otherwise, render children
  return <>{children}</>;
}