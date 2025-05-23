/**
 * ML Models Real-Time Notifications
 * 
 * This component displays real-time notifications for ML models
 * using WebSockets.
 */

import React, { useState, useEffect } from 'react';
import { 
  useMLModelsWebSocket, 
  ConnectionState, 
  MessageType, 
  WebSocketMessage 
} from '@/services/ml-models-websocket';
import { 
  AlertCircle, 
  BarChart3, 
  RefreshCw, 
  CheckCircle2, 
  WifiOff, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

interface MLModelsRealTimeNotificationsProps {
  className?: string;
  showConnectionStatus?: boolean;
  maxNotifications?: number;
}

export function MLModelsRealTimeNotifications({
  className = '',
  showConnectionStatus = true,
  maxNotifications = 5
}: MLModelsRealTimeNotificationsProps) {
  const { connectionState, messages, connect, disconnect, reconnect } = useMLModelsWebSocket();
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket
    connect();
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  // Update notifications when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Get the latest message
      const latestMessage = messages[messages.length - 1];
      
      // Update notifications
      setNotifications(prev => {
        // Add new message to the beginning
        const updated = [latestMessage, ...prev];
        
        // Limit to maxNotifications
        return updated.slice(0, maxNotifications);
      });
      
      // Increment unread count if popover is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast for important notifications
      if (
        latestMessage.type === MessageType.MODEL_DRIFT_DETECTED ||
        latestMessage.type === MessageType.RETRAIN_SUGGESTED
      ) {
        toast({
          title: getNotificationTitle(latestMessage),
          description: getNotificationDescription(latestMessage),
          variant: latestMessage.payload.severity === 'high' ? 'destructive' : 'default',
        });
      }
    }
  }, [messages, isOpen, maxNotifications, toast]);
  
  // Reset unread count when popover is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);
  
  // Get notification icon based on message type
  const getNotificationIcon = (message: WebSocketMessage) => {
    switch (message.type) {
      case MessageType.MODEL_UPDATED:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case MessageType.MODEL_PERFORMANCE_CHANGED:
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case MessageType.MODEL_DRIFT_DETECTED:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case MessageType.MODEL_TRAINING_COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case MessageType.MODEL_DEPLOYED:
        return <Zap className="h-4 w-4 text-purple-500" />;
      case MessageType.RETRAIN_SUGGESTED:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get notification title based on message type
  const getNotificationTitle = (message: WebSocketMessage) => {
    switch (message.type) {
      case MessageType.MODEL_UPDATED:
        return 'Model Updated';
      case MessageType.MODEL_PERFORMANCE_CHANGED:
        return 'Performance Changed';
      case MessageType.MODEL_DRIFT_DETECTED:
        return `Drift Detected (${message.payload.severity || 'medium'})`;
      case MessageType.MODEL_TRAINING_COMPLETED:
        return 'Training Completed';
      case MessageType.MODEL_DEPLOYED:
        return `Deployed to ${message.payload.environment}`;
      case MessageType.RETRAIN_SUGGESTED:
        return 'Retraining Suggested';
      default:
        return 'Notification';
    }
  };
  
  // Get notification description based on message type
  const getNotificationDescription = (message: WebSocketMessage) => {
    const modelId = message.payload.modelId || 'Unknown';
    
    switch (message.type) {
      case MessageType.MODEL_UPDATED:
        return `Model ${modelId} has been updated`;
      case MessageType.MODEL_PERFORMANCE_CHANGED:
        const metrics = message.payload.metrics || {};
        const accuracy = metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/A';
        return `Model ${modelId} performance: ${accuracy} accuracy`;
      case MessageType.MODEL_DRIFT_DETECTED:
        return `Data drift detected in model ${modelId}`;
      case MessageType.MODEL_TRAINING_COMPLETED:
        return `Model ${modelId} training completed`;
      case MessageType.MODEL_DEPLOYED:
        return `Model ${modelId} deployed to ${message.payload.environment}`;
      case MessageType.RETRAIN_SUGGESTED:
        return `Model ${modelId} needs retraining: ${message.payload.reason}`;
      default:
        return `Notification for model ${modelId}`;
    }
  };
  
  // Get connection status badge
  const getConnectionStatusBadge = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            <span className="text-xs">Connected</span>
          </Badge>
        );
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            <span className="text-xs">Connecting</span>
          </Badge>
        );
      case ConnectionState.DISCONNECTED:
      case ConnectionState.ERROR:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <WifiOff className="h-3 w-3 mr-1" />
            <span className="text-xs">Disconnected</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Zap className="h-4 w-4 mr-2" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">ML Model Updates</CardTitle>
                {showConnectionStatus && getConnectionStatusBadge()}
              </div>
              <CardDescription>
                Real-time model notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">
                            {getNotificationTitle(notification)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getNotificationDescription(notification)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-2">
              <div className="flex justify-between w-full">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNotifications([])}
                >
                  Clear All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reconnect()}
                  disabled={connectionState === ConnectionState.CONNECTED}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconnect
                </Button>
              </div>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
