import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { performanceMonitoring, PerformanceMetrics } from '@/services/performance-monitoring';
import { useDevice } from '@/hooks/use-mobile';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Performance thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTFB: 600, // Time to First Byte (ms)
  RESOURCE_LOAD: 1000, // Resource load time (ms)
  LONG_TASKS: 5, // Number of long tasks
};

// Performance score calculation
const calculateScore = (metrics: PerformanceMetrics): number => {
  if (!metrics) return 0;
  
  let score = 100;
  
  // Reduce score based on metrics exceeding thresholds
  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > THRESHOLDS.LCP) {
    score -= Math.min(25, ((metrics.largestContentfulPaint - THRESHOLDS.LCP) / 1000) * 5);
  }
  
  if (metrics.firstInputDelay && metrics.firstInputDelay > THRESHOLDS.FID) {
    score -= Math.min(25, ((metrics.firstInputDelay - THRESHOLDS.FID) / 100) * 5);
  }
  
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > THRESHOLDS.CLS) {
    score -= Math.min(25, ((metrics.cumulativeLayoutShift - THRESHOLDS.CLS) / 0.1) * 5);
  }
  
  if (metrics.longTasks && metrics.longTasks > THRESHOLDS.LONG_TASKS) {
    score -= Math.min(25, (metrics.longTasks - THRESHOLDS.LONG_TASKS) * 2);
  }
  
  return Math.max(0, Math.round(score));
};

// Get status based on score
const getScoreStatus = (score: number): 'critical' | 'warning' | 'good' => {
  if (score < 50) return 'critical';
  if (score < 80) return 'warning';
  return 'good';
};

// Format milliseconds to readable format
const formatTime = (ms: number | undefined): string => {
  if (ms === undefined) return 'N/A';
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// Mock historical data (in a real app, this would come from an API)
const generateHistoricalData = () => {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < 24; i++) {
    data.push({
      timestamp: new Date(now - (23 - i) * 3600000).toISOString(),
      LCP: 1500 + Math.random() * 2000,
      FID: 50 + Math.random() * 100,
      CLS: 0.05 + Math.random() * 0.15,
      score: 60 + Math.random() * 40,
    });
  }
  
  return data;
};

/**
 * Performance Dashboard Component
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<'critical' | 'warning' | 'good'>('good');
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isMobile } = useDevice();
  
  // Fetch metrics on mount and when refresh is triggered
  useEffect(() => {
    fetchMetrics();
    
    // Set up WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3000/ws/performance');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'performance_update') {
          setMetrics(data.payload);
          const newScore = calculateScore(data.payload);
          setScore(newScore);
          setStatus(getScoreStatus(newScore));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  // Fetch current metrics
  const fetchMetrics = async () => {
    setIsRefreshing(true);
    
    try {
      const currentMetrics = performanceMonitoring.getMetrics();
      setMetrics(currentMetrics);
      
      const newScore = calculateScore(currentMetrics);
      setScore(newScore);
      setStatus(getScoreStatus(newScore));
      
      // In a real app, fetch historical data from API
      // setHistoricalData(await api.getPerformanceHistory());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor application performance metrics in real-time</p>
        </div>
        
        <Button 
          onClick={fetchMetrics} 
          disabled={isRefreshing}
          className="mt-2 md:mt-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Performance Score</CardTitle>
            <CardDescription>Overall application performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`text-4xl font-bold ${
                status === 'critical' ? 'text-red-500' : 
                status === 'warning' ? 'text-amber-500' : 
                'text-green-500'
              }`}>
                {score}
              </div>
              <Progress 
                value={score} 
                className="h-2 w-full" 
                indicatorClassName={
                  status === 'critical' ? 'bg-red-500' : 
                  status === 'warning' ? 'bg-amber-500' : 
                  'bg-green-500'
                }
              />
              <Badge variant={
                status === 'critical' ? 'destructive' : 
                status === 'warning' ? 'warning' : 
                'success'
              }>
                {status === 'critical' ? 'Critical Issues' : 
                 status === 'warning' ? 'Needs Improvement' : 
                 'Good Performance'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription>Key user experience metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">LCP</span>
                  <span className={`text-sm ${metrics.largestContentfulPaint && metrics.largestContentfulPaint > THRESHOLDS.LCP ? 'text-red-500' : 'text-green-500'}`}>
                    {formatTime(metrics.largestContentfulPaint)}
                  </span>
                </div>
                <Progress 
                  value={metrics.largestContentfulPaint ? Math.min(100, (THRESHOLDS.LCP / metrics.largestContentfulPaint) * 100) : 0} 
                  className="h-1" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">FID</span>
                  <span className={`text-sm ${metrics.firstInputDelay && metrics.firstInputDelay > THRESHOLDS.FID ? 'text-red-500' : 'text-green-500'}`}>
                    {formatTime(metrics.firstInputDelay)}
                  </span>
                </div>
                <Progress 
                  value={metrics.firstInputDelay ? Math.min(100, (THRESHOLDS.FID / metrics.firstInputDelay) * 100) : 0} 
                  className="h-1" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CLS</span>
                  <span className={`text-sm ${metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > THRESHOLDS.CLS ? 'text-red-500' : 'text-green-500'}`}>
                    {metrics.cumulativeLayoutShift?.toFixed(3) || 'N/A'}
                  </span>
                </div>
                <Progress 
                  value={metrics.cumulativeLayoutShift ? Math.min(100, (THRESHOLDS.CLS / metrics.cumulativeLayoutShift) * 100) : 0} 
                  className="h-1" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Page resources and JavaScript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Resources</span>
                  <span className="text-sm">
                    {metrics.resourceCount || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Resource Load Time</span>
                  <span className={`text-sm ${metrics.resourceLoadTime && metrics.resourceLoadTime > THRESHOLDS.RESOURCE_LOAD ? 'text-red-500' : 'text-green-500'}`}>
                    {formatTime(metrics.resourceLoadTime)}
                  </span>
                </div>
                <Progress 
                  value={metrics.resourceLoadTime ? Math.min(100, (THRESHOLDS.RESOURCE_LOAD / metrics.resourceLoadTime) * 100) : 0} 
                  className="h-1" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Long Tasks</span>
                  <span className={`text-sm ${metrics.longTasks && metrics.longTasks > THRESHOLDS.LONG_TASKS ? 'text-red-500' : 'text-green-500'}`}>
                    {metrics.longTasks || 'N/A'}
                  </span>
                </div>
                <Progress 
                  value={metrics.longTasks ? Math.min(100, (THRESHOLDS.LONG_TASKS / metrics.longTasks) * 100) : 0} 
                  className="h-1" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {status === 'critical' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Performance Issues</AlertTitle>
          <AlertDescription>
            Your application has critical performance issues that need immediate attention.
            Check the metrics dashboard for details.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'warning' && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Performance Needs Improvement</AlertTitle>
          <AlertDescription>
            Your application performance could be improved. Review the metrics and consider
            implementing the suggested optimizations.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'good' && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Good Performance</AlertTitle>
          <AlertDescription>
            Your application is performing well. Continue monitoring for any changes.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Performance metrics over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'LCP' || name === 'FID' ? `${value.toFixed(0)}ms` : 
                        name === 'CLS' ? value.toFixed(3) : 
                        value.toFixed(0),
                        name
                      ]}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
                    <Line type="monotone" dataKey="LCP" stroke="#82ca9d" name="LCP" />
                    <Line type="monotone" dataKey="FID" stroke="#ffc658" name="FID" />
                    <Line type="monotone" dataKey="CLS" stroke="#ff8042" name="CLS" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {/* Historical data content */}
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          {/* API performance content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
