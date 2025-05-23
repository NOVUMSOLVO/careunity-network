/**
 * Security Notification Component
 * 
 * This component displays security notifications and alerts to users.
 * It can be used to inform users about security events, such as:
 * - Unusual login activity
 * - Password changes
 * - Two-factor authentication events
 * - Security policy updates
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  AlertTriangle, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle,
  Info,
  X,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// Notification types
type NotificationType = 
  | 'login_activity'
  | 'password_changed'
  | 'account_locked'
  | 'security_policy_update'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'device_added'
  | 'security_alert';

// Notification severity levels
type NotificationSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

// Notification interface
interface SecurityNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  details?: Record<string, any>;
}

interface SecurityNotificationProps {
  notification: SecurityNotification;
  onDismiss?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  variant?: 'alert' | 'dialog' | 'toast' | 'inline';
}

export function SecurityNotification({ 
  notification, 
  onDismiss, 
  onAction,
  variant = 'alert'
}: SecurityNotificationProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Get icon based on severity
  const getIcon = () => {
    switch (notification.severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'medium':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  // Get severity badge
  const getSeverityBadge = () => {
    switch (notification.severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-amber-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      case 'info':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Handle dismiss
  const handleDismiss = () => {
    setOpen(false);
    if (onDismiss) {
      onDismiss(notification.id);
    }
  };
  
  // Handle action
  const handleAction = () => {
    if (onAction && notification.actionUrl) {
      onAction(notification.id, notification.actionUrl);
    }
  };
  
  // Render alert variant
  if (variant === 'alert') {
    return (
      <Alert 
        className={`mb-4 ${!open ? 'hidden' : ''}`}
        variant={notification.severity === 'critical' || notification.severity === 'high' ? 'destructive' : 'default'}
      >
        <div className="flex items-start">
          <div className="mr-2 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2">
              {notification.title}
              {getSeverityBadge()}
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
            </AlertTitle>
            <AlertDescription className="mt-1">
              {notification.message}
              
              {notification.actionRequired && notification.actionUrl && (
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    onClick={handleAction}
                    variant={notification.severity === 'critical' ? 'default' : 'outline'}
                  >
                    {notification.actionText || 'Take Action'}
                  </Button>
                </div>
              )}
            </AlertDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-6 w-6" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    );
  }
  
  // Render dialog/drawer variant
  if (variant === 'dialog') {
    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getIcon()}
                {notification.title}
                {getSeverityBadge()}
              </DialogTitle>
              <DialogDescription>
                {notification.message}
              </DialogDescription>
            </DialogHeader>
            
            {notification.details && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <h4 className="font-medium mb-1">Details:</h4>
                <ul className="space-y-1">
                  {Object.entries(notification.details).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <DialogFooter className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDismiss}>
                  Dismiss
                </Button>
                {notification.actionRequired && notification.actionUrl && (
                  <Button onClick={handleAction}>
                    {notification.actionText || 'Take Action'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {getIcon()}
              {notification.title}
              {getSeverityBadge()}
            </DrawerTitle>
            <DrawerDescription>
              {notification.message}
            </DrawerDescription>
          </DrawerHeader>
          
          {notification.details && (
            <div className="px-4">
              <div className="bg-muted p-3 rounded-md text-sm">
                <h4 className="font-medium mb-1">Details:</h4>
                <ul className="space-y-1">
                  {Object.entries(notification.details).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <DrawerFooter>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </div>
            </div>
            
            {notification.actionRequired && notification.actionUrl && (
              <Button onClick={handleAction}>
                {notification.actionText || 'Take Action'}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleDismiss}>
                Dismiss
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Render inline variant
  if (variant === 'inline') {
    return (
      <div className={`border rounded-md p-3 mb-3 ${!open ? 'hidden' : ''}`}>
        <div className="flex items-start">
          <div className="mr-2 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              {getSeverityBadge()}
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            
            {notification.actionRequired && notification.actionUrl && (
              <div className="mt-2">
                <Button 
                  size="sm" 
                  onClick={handleAction}
                  variant="outline"
                >
                  {notification.actionText || 'Take Action'}
                </Button>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-6 w-6" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Toast variant is handled differently - we just trigger the toast
  useEffect(() => {
    if (variant === 'toast' && open) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.severity === 'critical' || notification.severity === 'high' ? 'destructive' : 'default',
        action: notification.actionRequired && notification.actionUrl ? (
          <Button size="sm" onClick={handleAction}>
            {notification.actionText || 'View'}
          </Button>
        ) : undefined,
      });
      
      // Auto-close
      setOpen(false);
    }
  }, [variant, open]);
  
  // Toast variant doesn't render anything directly
  return null;
}

// Export a notification center component that manages multiple notifications
export function SecurityNotificationCenter() {
  const { t } = useTranslation();
  const api = useApi();
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    
    try {
      const response = await api.get('/api/v2/security/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load security notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle dismiss
  const handleDismiss = async (id: string) => {
    try {
      await api.put(`/api/v2/security/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };
  
  // Handle action
  const handleAction = (id: string, action: string) => {
    // Mark as read
    handleDismiss(id);
    
    // Navigate to action URL
    window.location.href = action;
  };
  
  // Filter unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  
  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }
  
  if (unreadNotifications.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No new security notifications
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {unreadNotifications.map(notification => (
        <SecurityNotification
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
          onAction={handleAction}
          variant="inline"
        />
      ))}
    </div>
  );
}
