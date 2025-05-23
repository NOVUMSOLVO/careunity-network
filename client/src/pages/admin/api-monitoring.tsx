/**
 * API Monitoring Dashboard
 * 
 * Displays metrics and logs for API monitoring.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart, Clock, Download, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function ApiMonitoringPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [slowRequests, setSlowRequests] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [statusCodes, setStatusCodes] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  
  // Filters
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [method, setMethod] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [statusCode, setStatusCode] = useState<string>('');
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  
  // Load all monitoring data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load metrics
      const metricsResponse = await api.get('/api/v2/api-monitoring/metrics');
      setMetrics(metricsResponse.data.data);
      
      // Load usage
      const usageResponse = await api.get('/api/v2/api-monitoring/usage');
      setUsage(usageResponse.data.data);
      
      // Load status codes
      const statusCodesResponse = await api.get('/api/v2/api-monitoring/status-codes');
      setStatusCodes(statusCodesResponse.data.data);
      
      // Load config
      const configResponse = await api.get('/api/v2/api-monitoring/config');
      setConfig(configResponse.data.data);
      
      // Load logs with filters
      await loadLogs();
      
      // Load errors
      await loadErrors();
      
      // Load slow requests
      await loadSlowRequests();
    } catch (error) {
      console.error('Error loading API monitoring data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API monitoring data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load logs with filters
  const loadLogs = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (method) params.method = method;
      if (path) params.path = path;
      if (statusCode) params.statusCode = statusCode;
      
      const response = await api.get('/api/v2/api-monitoring/logs', { params });
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API logs',
        variant: 'destructive',
      });
    }
  };
  
  // Load errors
  const loadErrors = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (method) params.method = method;
      if (path) params.path = path;
      
      const response = await api.get('/api/v2/api-monitoring/errors', { params });
      setErrors(response.data.data);
    } catch (error) {
      console.error('Error loading errors:', error);
    }
  };
  
  // Load slow requests
  const loadSlowRequests = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (method) params.method = method;
      if (path) params.path = path;
      
      const response = await api.get('/api/v2/api-monitoring/slow-requests', { params });
      setSlowRequests(response.data.data);
    } catch (error) {
      console.error('Error loading slow requests:', error);
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    loadLogs();
    loadErrors();
    loadSlowRequests();
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setMethod('');
    setPath('');
    setStatusCode('');
    
    // Reload data with no filters
    loadLogs();
    loadErrors();
    loadSlowRequests();
  };
  
  // Refresh data
  const refreshData = () => {
    loadData();
  };
  
  // Export logs as CSV
  const exportLogs = () => {
    // Implementation would depend on your CSV export utility
    toast({
      title: 'Export Started',
      description: 'Exporting logs to CSV...',
    });
  };
  
  // Table columns for logs
  const logColumns = [
    {
      id: 'timestamp',
      header: 'Timestamp',
      accessor: (row: any) => new Date(row.timestamp).toLocaleString(),
    },
    {
      id: 'method',
      header: 'Method',
      accessor: (row: any) => row.method,
      cell: (value: string) => (
        <Badge variant={getMethodVariant(value)}>{value}</Badge>
      ),
    },
    {
      id: 'path',
      header: 'Path',
      accessor: (row: any) => row.path,
    },
    {
      id: 'statusCode',
      header: 'Status',
      accessor: (row: any) => row.statusCode,
      cell: (value: number) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    {
      id: 'responseTime',
      header: 'Response Time',
      accessor: (row: any) => row.responseTime ? `${row.responseTime.toFixed(2)}ms` : '-',
    },
    {
      id: 'userId',
      header: 'User ID',
      accessor: (row: any) => row.userId || '-',
      hideOnMobile: true,
    },
  ];
  
  // Helper function to get method badge variant
  const getMethodVariant = (method: string) => {
    switch (method) {
      case 'GET': return 'default';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'PATCH': return 'warning';
      case 'DELETE': return 'destructive';
      default: return 'secondary';
    }
  };
  
  // Helper function to get status badge variant
  const getStatusVariant = (status: number) => {
    if (status < 300) return 'success';
    if (status < 400) return 'warning';
    if (status < 500) return 'destructive';
    return 'destructive';
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Monitoring</h1>
          <p className="text-gray-500 mt-1">
            Monitor API performance, errors, and usage
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={refreshData}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportLogs}
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Requests"
          value={metrics?.totalRequests || 0}
          icon={<BarChart className="h-5 w-5 text-blue-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Average Response Time"
          value={metrics?.averageResponseTime ? `${metrics.averageResponseTime.toFixed(2)}ms` : '0ms'}
          icon={<Clock className="h-5 w-5 text-green-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Total Errors"
          value={metrics?.totalErrors || 0}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Error Rate"
          value={metrics?.totalRequests ? `${((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(2)}%` : '0%'}
          icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          loading={isLoading}
        />
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter API logs and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                id="startDate"
                date={startDate}
                setDate={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                id="endDate"
                date={endDate}
                setDate={setEndDate}
                placeholder="Select end date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Input
                id="path"
                placeholder="Filter by path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusCode">Status Code</Label>
              <Input
                id="statusCode"
                placeholder="e.g. 404, 500"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="logs" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="logs">API Logs</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="slow">Slow Requests</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="status">Status Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>API Request Logs</CardTitle>
              <CardDescription>Recent API requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ResponsiveTable
                  columns={logColumns}
                  data={logs}
                  getRowKey={(row) => row.id}
                  emptyMessage="No logs found"
                  mobileCards={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>API Errors</CardTitle>
              <CardDescription>Requests that resulted in errors</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ResponsiveTable
                  columns={logColumns}
                  data={errors}
                  getRowKey={(row) => row.id}
                  emptyMessage="No errors found"
                  mobileCards={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slow">
          <Card>
            <CardHeader>
              <CardTitle>Slow Requests</CardTitle>
              <CardDescription>Requests that took longer than {config?.slowRequestThreshold || 1000}ms to process</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ResponsiveTable
                  columns={logColumns}
                  data={slowRequests}
                  getRowKey={(row) => row.id}
                  emptyMessage="No slow requests found"
                  mobileCards={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>Request counts by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ResponsiveTable
                  columns={[
                    {
                      id: 'endpoint',
                      header: 'Endpoint',
                      accessor: (row: any) => row.endpoint,
                    },
                    {
                      id: 'count',
                      header: 'Requests',
                      accessor: (row: any) => row.count,
                    },
                    {
                      id: 'errors',
                      header: 'Errors',
                      accessor: (row: any) => row.errors,
                    },
                    {
                      id: 'errorRate',
                      header: 'Error Rate',
                      accessor: (row: any) => `${row.errorRate.toFixed(2)}%`,
                    },
                    {
                      id: 'averageResponseTime',
                      header: 'Avg. Response Time',
                      accessor: (row: any) => `${row.averageResponseTime.toFixed(2)}ms`,
                    },
                  ]}
                  data={usage}
                  getRowKey={(row) => row.endpoint}
                  emptyMessage="No usage data found"
                  mobileCards={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Codes</CardTitle>
              <CardDescription>Response status code distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ResponsiveTable
                  columns={[
                    {
                      id: 'code',
                      header: 'Status Code',
                      accessor: (row: any) => row.code,
                      cell: (value: number) => (
                        <Badge variant={getStatusVariant(value)}>{value}</Badge>
                      ),
                    },
                    {
                      id: 'count',
                      header: 'Count',
                      accessor: (row: any) => row.count,
                    },
                    {
                      id: 'percentage',
                      header: 'Percentage',
                      accessor: (row: any) => `${row.percentage.toFixed(2)}%`,
                    },
                  ]}
                  data={statusCodes}
                  getRowKey={(row) => row.code}
                  emptyMessage="No status code data found"
                  mobileCards={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, icon, loading = false }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
