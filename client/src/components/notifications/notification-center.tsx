/**
 * Notification Center Component
 * 
 * Displays real-time notifications and allows users to interact with them
 */

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, CheckCheck, X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/hooks/use-websocket';
import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  // Mark notifications as read when opening the popover
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const unreadNotifications = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadNotifications.length > 0) {
        markAsRead(unreadNotifications);
      }
    }
  }, [isOpen, unreadCount, notifications, markAsRead]);
  
  // Get notification icon based on priority
  const getNotificationIcon = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format notification timestamp
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(notification => !notification.read)
    : notifications;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          {isConnected ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] h-5"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>
              {isConnected ? 'Real-time updates and alerts' : 'Currently offline'}
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <NotificationList 
                notifications={filteredNotifications}
                getNotificationIcon={getNotificationIcon}
                formatTimestamp={formatTimestamp}
              />
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              <NotificationList 
                notifications={filteredNotifications}
                getNotificationIcon={getNotificationIcon}
                formatTimestamp={formatTimestamp}
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="justify-center p-2 text-xs text-muted-foreground">
            {isConnected ? 'Connected to real-time updates' : 'Offline - reconnecting...'}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationListProps {
  notifications: any[];
  getNotificationIcon: (priority: 'low' | 'medium' | 'high' | 'critical') => React.ReactNode;
  formatTimestamp: (timestamp: string) => string;
}

function NotificationList({ notifications, getNotificationIcon, formatTimestamp }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <BellOff className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[320px]">
      <div className="p-4 space-y-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="relative">
            <div className={`p-3 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/50'}`}>
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.priority)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${notification.read ? '' : 'text-foreground'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <div className="pt-1">
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        View details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
