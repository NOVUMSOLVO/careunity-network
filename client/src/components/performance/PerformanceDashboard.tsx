import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { LineChart, BarChart, PieChart } from './charts';
import { Loader } from '../ui/loader';
import { apiClient } from '../../services/api-client';
import { formatDate, formatTime } from '../../utils/date-utils';

// Time range options
const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

/**
 * Performance Dashboard Component
 * 
 * Displays performance metrics and analytics for the application.
 */
export function PerformanceDashboard() {
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    performance: [],
    queries: [],
    system: [],
    cache: [],
    slowQueries: [],
  });
  
  // Toast
  const { toast } = useToast();
  
  // Fetch metrics on mount and when time range changes
  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);
  
  // Calculate time range in milliseconds
  const getTimeRangeMs = () => {
    const now = Date.now();
    
    switch (timeRange) {
      case '1h':
        return { startTime: now - 60 * 60 * 1000, endTime: now };
      case '24h':
        return { startTime: now - 24 * 60 * 60 * 1000, endTime: now };
      case '7d':
        return { startTime: now - 7 * 24 * 60 * 60 * 1000, endTime: now };
      case '30d':
        return { startTime: now - 30 * 24 * 60 * 60 * 1000, endTime: now };
      default:
        return { startTime: now - 24 * 60 * 60 * 1000, endTime: now };
    }
  };
  
  // Fetch metrics from API
  const fetchMetrics = async () => {
    setIsLoading(true);
    
    try {
      const { startTime, endTime } = getTimeRangeMs();
      
      // Fetch all metrics in parallel
      const [
        performanceResponse,
        queriesResponse,
        systemResponse,
        cacheResponse,
        slowQueriesResponse,
      ] = await Promise.all([
        apiClient.get(`/api/v2/performance/metrics?startTime=${startTime}&endTime=${endTime}`),
        apiClient.get(`/api/v2/performance/queries?startTime=${startTime}&endTime=${endTime}`),
        apiClient.get(`/api/v2/performance/system?startTime=${startTime}&endTime=${endTime}`),
        apiClient.get(`/api/v2/performance/cache?startTime=${startTime}&endTime=${endTime}`),
        apiClient.get('/api/v2/performance/slow-queries'),
      ]);
      
      setMetrics({
        performance: performanceResponse.data.data,
        queries: queriesResponse.data.data,
        system: systemResponse.data.data,
        cache: cacheResponse.data.data,
        slowQueries: slowQueriesResponse.data.data,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch performance metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear cache
  const clearCache = async (cacheType: string) => {
    try {
      await apiClient.post('/api/v2/performance/clear-cache', { cacheType });
      
      toast({
        title: 'Success',
        description: `Cache ${cacheType} cleared successfully`,
      });
      
      // Refresh metrics
      fetchMetrics();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        variant: 'destructive',
      });
    }
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    // API response times by route
    const apiResponseTimes = metrics.performance.reduce((acc: any, metric: any) => {
      const route = metric.route;
      
      if (!acc[route]) {
        acc[route] = [];
      }
      
      acc[route].push({
        time: metric.timestamp,
        value: metric.responseTime,
      });
      
      return acc;
    }, {});
    
    // System metrics over time
    const systemMetrics = metrics.system.map((metric: any) => ({
      time: metric.timestamp,
      cpu: metric.cpuUsage,
      memory: metric.memoryUsage,
      connections: metric.activeConnections,
    }));
    
    // Cache hit rates
    const cacheMetrics = metrics.cache.map((metric: any) => {
      const total = metric.hits + metric.misses;
      const hitRate = total > 0 ? (metric.hits / total) * 100 : 0;
      
      return {
        time: metric.timestamp,
        hitRate,
        size: metric.size,
        evictions: metric.evictions,
      };
    });
    
    return {
      apiResponseTimes,
      systemMetrics,
      cacheMetrics,
    };
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  // Prepare chart data
  const chartData = prepareChartData();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => fetchMetrics()}>Refresh</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Response Time Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.performance.length > 0
                    ? `${(metrics.performance.reduce((sum: number, m: any) => sum + m.responseTime, 0) / metrics.performance.length).toFixed(2)} ms`
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            {/* Request Count Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.length}</div>
              </CardContent>
            </Card>
            
            {/* Slow Queries Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.slowQueries.length}</div>
              </CardContent>
            </Card>
            
            {/* Cache Hit Rate Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.cache.length > 0
                    ? `${(metrics.cache.reduce((sum: number, m: any) => sum + (m.hits / (m.hits + m.misses) * 100 || 0), 0) / metrics.cache.length).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* System Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>CPU, Memory, and Active Connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart
                  data={chartData.systemMetrics}
                  xKey="time"
                  yKeys={[
                    { key: 'cpu', name: 'CPU Usage (%)' },
                    { key: 'memory', name: 'Memory Usage (MB)' },
                    { key: 'connections', name: 'Active Connections' },
                  ]}
                  xFormatter={formatTime}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Additional tabs would be implemented here */}
      </Tabs>
    </div>
  );
}
