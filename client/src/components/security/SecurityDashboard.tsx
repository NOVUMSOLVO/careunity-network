/**
 * Security Dashboard Component
 * 
 * This component displays security-related information and alerts
 * for administrators to monitor and respond to security incidents.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { formatDistanceToNow, format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  CheckSquare,
  XSquare,
  Filter
} from 'lucide-react';

import { SecurityAuditLog } from './SecurityAuditLog';
import { SecurityMetricsChart } from './SecurityMetricsChart';

// Alert types
type AlertType = 
  | 'failed_login'
  | 'account_locked'
  | 'password_changed'
  | 'permission_changed'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'unusual_login_location'
  | 'data_access_anomaly'
  | 'api_abuse'
  | 'csrf_attack'
  | 'xss_attempt'
  | 'sql_injection_attempt'
  | 'sensitive_data_access';

// Alert severity levels
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Alert status
type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'false_positive';

// Alert interface
interface SecurityAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  source: string;
  message: string;
  details: Record<string, any>;
  status: AlertStatus;
}

// Security metrics interface
interface SecurityMetrics {
  failedLoginAttempts: number;
  accountLockouts: number;
  suspiciousActivities: number;
  dataAccessEvents: number;
  apiRequests: number;
  activeUsers: number;
  securityIncidents: number;
  resolvedIncidents: number;
}

// Dashboard props
interface SecurityDashboardProps {
  refreshInterval?: number; // in milliseconds
}

export function SecurityDashboard({ refreshInterval = 60000 }: SecurityDashboardProps) {
  const { t } = useTranslation();
  const api = useApi();
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<AlertType | 'all'>('all');
  
  // Load alerts and metrics
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load alerts
      const alertsResponse = await api.get('/api/v2/security/alerts');
      setAlerts(alertsResponse.data);
      
      // Load metrics
      const metricsResponse = await api.get('/api/v2/security/metrics');
      setMetrics(metricsResponse.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount and at regular intervals
  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  // Update alert status
  const updateAlertStatus = async (alertId: string, status: AlertStatus) => {
    try {
      await api.put(`/api/v2/security/alerts/${alertId}`, { status });
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status } : alert
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to update alert status');
    }
  };
  
  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
      return false;
    }
    
    if (selectedStatus !== 'all' && alert.status !== selectedStatus) {
      return false;
    }
    
    if (selectedType !== 'all' && alert.type !== selectedType) {
      return false;
    }
    
    return true;
  });
  
  // Get alert icon based on severity
  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'medium':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Shield className="h-5 w-5 text-blue-500" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'new':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'acknowledged':
        return <Eye className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'false_positive':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-amber-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md text-destructive">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Security Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed Login Attempts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {loading || !metrics ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">{metrics.failedLoginAttempts}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Lockouts
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {loading || !metrics ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">{metrics.accountLockouts}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Suspicious Activities
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {loading || !metrics ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {loading || !metrics ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Security Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Security Metrics</CardTitle>
              <CardDescription>
                Security events over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <SecurityMetricsChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Severity:</span>
              <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status:</span>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Type:</span>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="failed_login">Failed login</SelectItem>
                  <SelectItem value="account_locked">Account locked</SelectItem>
                  <SelectItem value="brute_force_attempt">Brute force attempt</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious activity</SelectItem>
                  <SelectItem value="unusual_login_location">Unusual login location</SelectItem>
                  <SelectItem value="data_access_anomaly">Data access anomaly</SelectItem>
                  <SelectItem value="api_abuse">API abuse</SelectItem>
                  <SelectItem value="sensitive_data_access">Sensitive data access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                {filteredAlerts.length} alerts found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No alerts found matching the selected filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAlertIcon(alert.severity)}
                            {getSeverityBadge(alert.severity)}
                          </div>
                        </TableCell>
                        <TableCell>{alert.type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(alert.timestamp), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(alert.timestamp), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(alert.status)}
                            <span className="capitalize">{alert.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {alert.status === 'new' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Acknowledge
                              </Button>
                            )}
                            {(alert.status === 'new' || alert.status === 'acknowledged') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateAlertStatus(alert.id, 'resolved')}
                              >
                                <CheckSquare className="mr-1 h-3 w-3" />
                                Resolve
                              </Button>
                            )}
                            {(alert.status === 'new' || alert.status === 'acknowledged') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateAlertStatus(alert.id, 'false_positive')}
                              >
                                <XSquare className="mr-1 h-3 w-3" />
                                False Positive
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
          <SecurityAuditLog showFilters={true} limit={100} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
