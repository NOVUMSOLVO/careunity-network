/**
 * API Performance Chart Component
 * 
 * This component displays API performance metrics in a chart format.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  RefreshCw, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface ApiPerformanceProps {
  timeRange?: string;
  height?: number;
  showControls?: boolean;
}

interface ApiMetric {
  timestamp: string;
  count: number;
  avgResponseTime: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

interface RouteMetric {
  route: string;
  count: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

interface ApiPerformanceData {
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    successRate: number;
  };
  routeMetrics: RouteMetric[];
  timeSeriesData: ApiMetric[];
}

// Mock data for development
const mockApiPerformanceData: ApiPerformanceData = {
  summary: {
    totalRequests: 12500,
    avgResponseTime: 125,
    p95ResponseTime: 350,
    successRate: 99.2
  },
  routeMetrics: [
    { route: '/api/v2/service-users', count: 3250, avgResponseTime: 85, minResponseTime: 45, maxResponseTime: 320 },
    { route: '/api/v2/care-plans', count: 2100, avgResponseTime: 120, minResponseTime: 65, maxResponseTime: 450 },
    { route: '/api/v2/documents', count: 1850, avgResponseTime: 150, minResponseTime: 70, maxResponseTime: 520 },
    { route: '/api/v2/allocation', count: 1200, avgResponseTime: 220, minResponseTime: 95, maxResponseTime: 780 },
    { route: '/api/v2/ml-models', count: 950, avgResponseTime: 280, minResponseTime: 110, maxResponseTime: 950 }
  ],
  timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    count: Math.floor(Math.random() * 500) + 300,
    avgResponseTime: Math.floor(Math.random() * 150) + 80,
    cpuUsage: Math.floor(Math.random() * 40) + 20,
    memoryUsage: Math.floor(Math.random() * 30) + 40
  }))
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

export default function ApiPerformanceChart({ 
  timeRange = '24h', 
  height = 300,
  showControls = true
}: ApiPerformanceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('response-time');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [performanceData, setPerformanceData] = useState<ApiPerformanceData>(mockApiPerformanceData);
  
  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an actual API call
      // const { data } = await api.performance.getApiPerformance({
      //   startTime: getStartTimeFromRange(selectedTimeRange),
      //   endTime: Date.now(),
      //   interval: getIntervalFromRange(selectedTimeRange)
      // });
      
      // For now, use mock data
      setPerformanceData(mockApiPerformanceData);
      
      toast({
        title: "Data refreshed",
        description: "API performance metrics have been updated",
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching API performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchData();
  }, [selectedTimeRange]);
  
  // Helper function to get start time from range
  const getStartTimeFromRange = (range: string): number => {
    const now = Date.now();
    switch (range) {
      case '1h': return now - 60 * 60 * 1000;
      case '6h': return now - 6 * 60 * 60 * 1000;
      case '24h': return now - 24 * 60 * 60 * 1000;
      case '7d': return now - 7 * 24 * 60 * 60 * 1000;
      case '30d': return now - 30 * 24 * 60 * 60 * 1000;
      default: return now - 24 * 60 * 60 * 1000;
    }
  };
  
  // Helper function to get interval from range
  const getIntervalFromRange = (range: string): string => {
    switch (range) {
      case '1h': return 'minute';
      case '6h': return 'minute';
      case '24h': return 'hour';
      case '7d': return 'day';
      case '30d': return 'day';
      default: return 'hour';
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    if (selectedTimeRange === '1h' || selectedTimeRange === '6h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (selectedTimeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>API Performance</CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription>Response times and request volume over time</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Avg Response Time</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.summary.avgResponseTime}ms</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">P95 Response Time</div>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.summary.p95ResponseTime}ms</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.summary.successRate}%</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="response-time">Response Time</TabsTrigger>
            <TabsTrigger value="request-volume">Request Volume</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="response-time" className="mt-0">
            {loading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTimestamp}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Response Time (ms)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12 }
                      }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}ms`, 'Avg Response Time']}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="avgResponseTime" 
                      name="Avg Response Time" 
                      stroke={COLORS.primary} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="request-volume" className="mt-0">
            {loading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTimestamp}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Request Count', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12 }
                      }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Requests']}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Request Count" 
                      fill={COLORS.secondary} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="routes" className="mt-0">
            {loading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={performanceData.routeMetrics.sort((a, b) => b.avgResponseTime - a.avgResponseTime)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Avg Response Time (ms)', 
                        position: 'insideBottom',
                        offset: -5,
                        style: { fontSize: 12 }
                      }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="route"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}ms`, 'Avg Response Time']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="avgResponseTime" 
                      name="Avg Response Time" 
                      fill={COLORS.primary} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
