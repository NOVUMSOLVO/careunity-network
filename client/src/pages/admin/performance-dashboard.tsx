/**
 * Performance Dashboard
 *
 * This dashboard provides insights into application performance metrics,
 * including API response times, database query performance, and client-side metrics.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  LineChart as LineChartIcon,
  Database,
  Server,
  RefreshCw,
  Download,
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiPerformanceChart, DatabasePerformance, CachePerformance, PerformanceAlerts } from '@/components/performance';

// Types
interface PerformanceMetric {
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
}

interface QueryMetric {
  queryId: string;
  executionTime: number;
  rowsReturned: number;
  timestamp: number;
}

interface SystemMetric {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  pendingRequests: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  hitRatio: number;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

// Mock data (replace with actual API calls)
const mockPerformanceData = {
  apiMetrics: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    avgResponseTime: Math.random() * 300 + 50,
    p95ResponseTime: Math.random() * 500 + 100,
    requestCount: Math.floor(Math.random() * 1000 + 500)
  })),

  routePerformance: [
    { route: '/api/service-users', avgTime: 120, count: 1250 },
    { route: '/api/care-plans', avgTime: 180, count: 850 },
    { route: '/api/allocation', avgTime: 320, count: 620 },
    { route: '/api/staff', avgTime: 90, count: 780 },
    { route: '/api/reports', avgTime: 420, count: 320 },
    { route: '/api/ml-models', avgTime: 280, count: 150 }
  ],

  slowQueries: [
    { queryId: 'q1', executionTime: 1250, rowsReturned: 5200, table: 'visits' },
    { queryId: 'q2', executionTime: 980, rowsReturned: 1800, table: 'service_users' },
    { queryId: 'q3', executionTime: 850, rowsReturned: 3500, table: 'staff' },
    { queryId: 'q4', executionTime: 720, rowsReturned: 950, table: 'care_plans' },
    { queryId: 'q5', executionTime: 680, rowsReturned: 12000, table: 'tasks' }
  ],

  systemMetrics: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    cpuUsage: Math.random() * 60 + 20,
    memoryUsage: Math.random() * 40 + 30,
    activeConnections: Math.floor(Math.random() * 50 + 10)
  })),

  cacheStats: {
    hits: 45280,
    misses: 8720,
    keys: 1250,
    hitRatio: 0.84
  },

  indexRecommendations: [
    {
      table: 'visits',
      columns: ['service_user_id', 'date'],
      impact: 'high',
      reason: 'Frequently used in WHERE clauses across 12 slow queries'
    },
    {
      table: 'tasks',
      columns: ['status', 'due_date'],
      impact: 'medium',
      reason: 'Used in JOIN conditions which may benefit from indexing'
    },
    {
      table: 'staff',
      columns: ['role', 'region_id'],
      impact: 'medium',
      reason: 'Frequently filtered columns in slow queries'
    }
  ] as IndexRecommendation[]
};

// Color constants
const COLORS = {
  primary: '#4f46e5',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  success: '#10b981'
};

export default function PerformanceDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('api');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(mockPerformanceData);

  // Fetch data function (replace with actual API calls)
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // const apiMetrics = await api.monitoring.getApiMetrics(timeRange);
      // const routePerformance = await api.monitoring.getRoutePerformance(timeRange);
      // const slowQueries = await api.monitoring.getSlowQueries();
      // const systemMetrics = await api.monitoring.getSystemMetrics(timeRange);
      // const cacheStats = await api.monitoring.getCacheStats();
      // const indexRecommendations = await api.monitoring.getIndexRecommendations();

      // For now, use mock data
      setPerformanceData(mockPerformanceData);

      toast({
        title: "Data refreshed",
        description: "Performance metrics have been updated",
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and optimize application performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(performanceData.apiMetrics.reduce((acc, curr) => acc + curr.avgResponseTime, 0) / performanceData.apiMetrics.length)}ms</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last period
                </p>
                <Progress className="mt-2" value={65} />
              </CardContent>
            </div>

            <div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(performanceData.systemMetrics.reduce((acc, curr) => acc + curr.cpuUsage, 0) / performanceData.systemMetrics.length)}%</div>
                <p className="text-xs text-muted-foreground">
                  -1.2% from last period
                </p>
                <Progress className="mt-2" value={45} />
              </CardContent>
            </div>

            <div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(performanceData.cacheStats.hitRatio * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  +5.3% from last period
                </p>
                <Progress className="mt-2" value={84} />
              </CardContent>
            </div>
          </div>
        </Card>

        <div className="md:row-span-2">
          <PerformanceAlerts compact={true} maxAlerts={5} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="api" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            API Performance
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Server className="mr-2 h-4 w-4" />
            System Resources
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <ApiPerformanceChart timeRange={timeRange} height={400} />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabasePerformance height={400} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>CPU and memory usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData.systemMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                      <YAxis yAxisId="left" orientation="left" label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Memory Usage (%)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cpuUsage" name="CPU Usage" stroke={COLORS.primary} />
                      <Line yAxisId="right" type="monotone" dataKey="memoryUsage" name="Memory Usage" stroke={COLORS.secondary} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Connections</CardTitle>
                <CardDescription>Number of active connections over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData.systemMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Connections', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activeConnections" name="Active Connections" fill={COLORS.info} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <CachePerformance height={300} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
