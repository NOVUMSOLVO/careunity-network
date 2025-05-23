/**
 * Performance Alerts Component
 *
 * This component displays performance alerts and allows users to acknowledge them.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  BellOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePerformanceAlerts } from '@/hooks/use-websocket';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface PerformanceAlertsProps {
  maxAlerts?: number;
  showControls?: boolean;
  compact?: boolean;
}

interface AlertEvent {
  id: string;
  timestamp: number;
  type: 'api' | 'database' | 'system' | 'cache' | 'error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: number;
  acknowledgedAt?: string;
}

// Mock data for development
const mockAlerts: AlertEvent[] = [
  {
    id: 'api-1650123456789',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    type: 'api',
    severity: 'warning',
    message: 'API response time threshold exceeded (520ms)',
    details: {
      avgResponseTime: 520,
      threshold: 500,
      slowRoutes: [
        { route: '/api/v2/documents', avgTime: 780, count: 45 },
        { route: '/api/v2/allocation', avgTime: 650, count: 32 }
      ]
    },
    acknowledged: false
  },
  {
    id: 'database-1650123456790',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    type: 'database',
    severity: 'critical',
    message: '3 slow queries detected',
    details: {
      slowQueries: [
        { queryId: 'q1', executionTime: 1250, rowsReturned: 5200, table: 'visits' },
        { queryId: 'q2', executionTime: 980, rowsReturned: 1800, table: 'service_users' }
      ],
      threshold: 1000
    },
    acknowledged: true,
    acknowledgedBy: 1,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
  },
  {
    id: 'system-1650123456791',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    type: 'system',
    severity: 'critical',
    message: 'CPU usage threshold exceeded (92.5%)',
    details: {
      avgCpuUsage: 92.5,
      threshold: 80,
      samples: 10
    },
    acknowledged: true,
    acknowledgedBy: 1,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() // 25 minutes ago
  },
  {
    id: 'cache-1650123456792',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    type: 'cache',
    severity: 'info',
    message: 'Cache hit ratio below threshold (45.2%)',
    details: {
      hitRatio: 0.452,
      threshold: 0.5,
      hits: 4520,
      misses: 5480,
      keys: 1250
    },
    acknowledged: false
  },
  {
    id: 'error-1650123456793',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    type: 'error',
    severity: 'warning',
    message: 'Error rate threshold exceeded (6.5%)',
    details: {
      errorRate: 6.5,
      threshold: 5,
      totalErrors: 65,
      totalRequests: 1000,
      topErrorRoutes: [
        { route: '/api/v2/documents', count: 25 },
        { route: '/api/v2/allocation', count: 18 }
      ]
    },
    acknowledged: false
  }
];

// Color constants
const SEVERITY_COLORS = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500'
};

// Icon mapping
const TYPE_ICONS = {
  api: <AlertTriangle className="h-4 w-4" />,
  database: <AlertCircle className="h-4 w-4" />,
  system: <AlertCircle className="h-4 w-4" />,
  cache: <Info className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />
};

export default function PerformanceAlerts({
  maxAlerts = 10,
  showControls = true,
  compact = false
}: PerformanceAlertsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const { alerts, unacknowledgedCount, acknowledgeAlert, isConnected } = usePerformanceAlerts();

  // Fetch alerts function
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an actual API call
      // const { data } = await api.performance.getAlerts();

      // For now, we're using the usePerformanceAlerts hook which handles this

      toast({
        title: "Alerts refreshed",
        description: "Performance alerts have been updated",
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching performance alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const success = acknowledgeAlert(alertId);

      if (success) {
        toast({
          title: "Alert acknowledged",
          description: "The performance alert has been acknowledged",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to acknowledge alert - not connected",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get time ago string
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    return (
      <Badge className={SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || <Info className="h-4 w-4" />;
  };

  // Render compact view
  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Performance Alerts</CardTitle>
            {showControls && (
              <div className="flex items-center gap-2">
                {unacknowledgedCount > 0 && (
                  <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                    {unacknowledgedCount}
                  </Badge>
                )}
                <Button variant="outline" size="icon" onClick={fetchAlerts} disabled={loading}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="w-full h-12 rounded-md" />
              <Skeleton className="w-full h-12 rounded-md" />
              <Skeleton className="w-full h-12 rounded-md" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
              <p>No performance alerts</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {alerts.slice(0, maxAlerts).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      alert.acknowledged ? 'bg-muted/50' : 'bg-muted/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${SEVERITY_COLORS[alert.severity]}`}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{getTimeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render full view
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Performance Alerts</CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              {unacknowledgedCount > 0 && (
                <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                  {unacknowledgedCount}
                </Badge>
              )}
              <Button variant="outline" size="icon" onClick={fetchAlerts} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription>System performance alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-16 rounded-md" />
            <Skeleton className="w-full h-16 rounded-md" />
            <Skeleton className="w-full h-16 rounded-md" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
            <p>No performance alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, maxAlerts).map((alert) => (
              <Collapsible
                key={alert.id}
                open={expandedAlertId === alert.id}
                onOpenChange={(open) => setExpandedAlertId(open ? alert.id : null)}
                className={`border rounded-lg ${
                  alert.acknowledged ? 'bg-muted/50' : 'bg-muted/10'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${SEVERITY_COLORS[alert.severity]}`}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{alert.message}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getSeverityBadge(alert.severity)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledgeAlert(alert.id);
                          }}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedAlertId === alert.id ? 'Less' : 'More'}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-background p-3 rounded-md">
                      <h5 className="text-sm font-medium mb-2">Details</h5>
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-muted-foreground">Type:</p>
                            <p className="font-medium">{alert.type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time:</p>
                            <p className="font-medium">{formatTimestamp(alert.timestamp)}</p>
                          </div>
                          {alert.acknowledged && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Acknowledged By:</p>
                                <p className="font-medium">User #{alert.acknowledgedBy}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Acknowledged At:</p>
                                <p className="font-medium">{alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="text-muted-foreground mb-1">Alert Data:</p>
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
