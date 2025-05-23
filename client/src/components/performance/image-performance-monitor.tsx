/**
 * Image Performance Monitor Component
 * 
 * This component tracks and displays performance metrics for image loading
 * to help identify optimization opportunities.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

// Types for performance metrics
interface ImagePerformanceMetric {
  url: string;
  loadTime: number;
  size: number;
  format: string;
  width: number;
  height: number;
  timestamp: number;
  cached: boolean;
}

interface AggregatedMetrics {
  totalImages: number;
  totalSize: number;
  averageLoadTime: number;
  cachedImages: number;
  formatDistribution: Record<string, number>;
  sizeDistribution: { name: string; value: number }[];
  timeDistribution: { name: string; value: number }[];
}

export function ImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<ImagePerformanceMetric[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedMetrics>({
    totalImages: 0,
    totalSize: 0,
    averageLoadTime: 0,
    cachedImages: 0,
    formatDistribution: {},
    sizeDistribution: [],
    timeDistribution: []
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Start monitoring image performance
  const startMonitoring = () => {
    setIsMonitoring(true);
    setMetrics([]);
    
    // Create a PerformanceObserver to track image loads
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries().filter(entry => 
        entry.initiatorType === 'img' || 
        entry.name.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)
      );
      
      if (entries.length > 0) {
        const newMetrics = entries.map(entry => {
          // Try to get image dimensions and format
          let width = 0;
          let height = 0;
          let format = 'unknown';
          
          // Extract format from URL
          const urlMatch = entry.name.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
          if (urlMatch) {
            format = urlMatch[1].toLowerCase();
          }
          
          // Check if URL contains format parameter
          const formatParam = new URL(entry.name, window.location.origin).searchParams.get('format');
          if (formatParam) {
            format = formatParam;
          }
          
          // Find the image element to get dimensions
          const imgElements = document.querySelectorAll('img');
          for (const img of imgElements) {
            if (img.src === entry.name || img.currentSrc === entry.name) {
              width = img.naturalWidth;
              height = img.naturalHeight;
              break;
            }
          }
          
          return {
            url: entry.name,
            loadTime: entry.duration,
            size: entry.transferSize || 0,
            format,
            width,
            height,
            timestamp: entry.startTime,
            cached: entry.transferSize === 0
          };
        });
        
        setMetrics(prev => [...prev, ...newMetrics]);
      }
    });
    
    // Start observing resource timing entries
    observer.observe({ entryTypes: ['resource'] });
    
    // Store the observer for cleanup
    window.imagePerformanceObserver = observer;
  };
  
  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    // Disconnect the observer
    if (window.imagePerformanceObserver) {
      window.imagePerformanceObserver.disconnect();
    }
  };
  
  // Calculate aggregated metrics when metrics change
  useEffect(() => {
    if (metrics.length === 0) return;
    
    // Calculate total size and average load time
    const totalSize = metrics.reduce((sum, metric) => sum + metric.size, 0);
    const totalLoadTime = metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const averageLoadTime = totalLoadTime / metrics.length;
    const cachedImages = metrics.filter(metric => metric.cached).length;
    
    // Calculate format distribution
    const formatDistribution: Record<string, number> = {};
    metrics.forEach(metric => {
      formatDistribution[metric.format] = (formatDistribution[metric.format] || 0) + 1;
    });
    
    // Calculate size distribution
    const sizeRanges = [
      { name: '0-10KB', max: 10 * 1024 },
      { name: '10-50KB', max: 50 * 1024 },
      { name: '50-100KB', max: 100 * 1024 },
      { name: '100-500KB', max: 500 * 1024 },
      { name: '500KB+', max: Infinity }
    ];
    
    const sizeDistribution = sizeRanges.map(range => {
      const count = metrics.filter(metric => 
        metric.size <= range.max && 
        (range.name === '0-10KB' || metric.size > sizeRanges[sizeRanges.indexOf(range) - 1].max)
      ).length;
      
      return { name: range.name, value: count };
    });
    
    // Calculate load time distribution
    const timeRanges = [
      { name: '0-100ms', max: 100 },
      { name: '100-500ms', max: 500 },
      { name: '500ms-1s', max: 1000 },
      { name: '1s-3s', max: 3000 },
      { name: '3s+', max: Infinity }
    ];
    
    const timeDistribution = timeRanges.map(range => {
      const count = metrics.filter(metric => 
        metric.loadTime <= range.max && 
        (range.name === '0-100ms' || metric.loadTime > timeRanges[timeRanges.indexOf(range) - 1].max)
      ).length;
      
      return { name: range.name, value: count };
    });
    
    setAggregated({
      totalImages: metrics.length,
      totalSize,
      averageLoadTime,
      cachedImages,
      formatDistribution,
      sizeDistribution,
      timeDistribution
    });
  }, [metrics]);
  
  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (window.imagePerformanceObserver) {
        window.imagePerformanceObserver.disconnect();
      }
    };
  }, []);
  
  // Format bytes to human-readable string
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format time to human-readable string
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  
  // Export metrics as CSV
  const exportMetrics = () => {
    const headers = ['URL', 'Load Time (ms)', 'Size (bytes)', 'Format', 'Width', 'Height', 'Timestamp', 'Cached'];
    const rows = metrics.map(metric => [
      metric.url,
      metric.loadTime.toString(),
      metric.size.toString(),
      metric.format,
      metric.width.toString(),
      metric.height.toString(),
      new Date(metric.timestamp).toISOString(),
      metric.cached.toString()
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-performance-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Image Performance Monitor</span>
          <div className="flex gap-2">
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMetrics([])}
              disabled={metrics.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportMetrics}
              disabled={metrics.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Monitor and analyze image loading performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{aggregated.totalImages}</div>
                  <p className="text-xs text-muted-foreground">
                    {aggregated.cachedImages} cached ({Math.round(aggregated.cachedImages / aggregated.totalImages * 100) || 0}%)
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{formatBytes(aggregated.totalSize)}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatBytes(aggregated.totalSize / aggregated.totalImages || 0)} per image
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{formatTime(aggregated.averageLoadTime)}</div>
                  <div className="mt-2">
                    <Progress value={Math.min(100, aggregated.averageLoadTime / 10)} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Formats</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(aggregated.formatDistribution).map(([format, count]) => (
                      <Badge key={format} variant="outline">
                        {format}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Size Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.sizeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Load Time Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.timeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-2 p-2 font-medium text-sm border-b">
                <div className="col-span-4">URL</div>
                <div className="col-span-1">Format</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-2">Dimensions</div>
                <div className="col-span-2">Load Time</div>
                <div className="col-span-2">Status</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {metrics.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No image metrics collected yet. Start monitoring and browse the application to collect data.
                  </div>
                ) : (
                  metrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-2 text-sm border-b hover:bg-muted/50">
                      <div className="col-span-4 truncate" title={metric.url}>
                        {metric.url.split('/').pop()}
                      </div>
                      <div className="col-span-1">{metric.format}</div>
                      <div className="col-span-1">{formatBytes(metric.size)}</div>
                      <div className="col-span-2">
                        {metric.width > 0 ? `${metric.width}×${metric.height}` : 'Unknown'}
                      </div>
                      <div className="col-span-2">{formatTime(metric.loadTime)}</div>
                      <div className="col-span-2">
                        {metric.cached ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Cached
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Network
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {isMonitoring ? (
          <div className="flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Monitoring active - browsing the application will collect image metrics
          </div>
        ) : (
          <div>Monitoring inactive - click "Start Monitoring" to begin collecting metrics</div>
        )}
      </CardFooter>
    </Card>
  );
}

// Add type definition for the global window object
declare global {
  interface Window {
    imagePerformanceObserver?: PerformanceObserver;
  }
}
