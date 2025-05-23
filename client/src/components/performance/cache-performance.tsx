/**
 * Cache Performance Component
 * 
 * This component displays cache performance metrics and provides controls
 * for managing the application cache.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { 
  RefreshCw, 
  Trash2,
  HardDrive,
  BarChart as BarChartIcon,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types
interface CachePerformanceProps {
  height?: number;
  showControls?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  keys: number;
  hitRatio: number;
  ksize?: number;
  vsize?: number;
}

interface CachePerformanceData {
  stats: CacheStats;
  keys: number;
  hitRatio: number;
  keysByPrefix?: Record<string, number>;
}

// Mock data for development
const mockCachePerformanceData: CachePerformanceData = {
  stats: {
    hits: 45280,
    misses: 8720,
    sets: 12500,
    deletes: 3200,
    keys: 1250,
    hitRatio: 0.84
  },
  keys: 1250,
  hitRatio: 0.84,
  keysByPrefix: {
    'documents': 450,
    'service-users': 320,
    'care-plans': 280,
    'ml-models': 120,
    'other': 80
  }
};

// Color constants
const COLORS = {
  primary: '#4f46e5',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  success: '#10b981',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1'
};

// Colors for pie chart
const PIE_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.purple,
  COLORS.info
];

export default function CachePerformance({ 
  height = 300,
  showControls = true
}: CachePerformanceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [performanceData, setPerformanceData] = useState<CachePerformanceData>(mockCachePerformanceData);
  
  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an actual API call
      // const { data } = await api.performance.getCacheStats();
      
      // For now, use mock data
      setPerformanceData(mockCachePerformanceData);
      
      toast({
        title: "Data refreshed",
        description: "Cache performance metrics have been updated",
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching cache performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cache performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Clear cache function
  const clearCache = async () => {
    setClearingCache(true);
    try {
      // In a real implementation, this would be an actual API call
      // await api.performance.clearCache();
      
      // For now, just wait a bit to simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cache cleared",
        description: "Application cache has been successfully cleared",
        variant: "default"
      });
      
      // Refresh data after clearing
      fetchData();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      });
    } finally {
      setClearingCache(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);
  
  // Prepare data for charts
  const hitMissData = [
    { name: 'Hits', value: performanceData.stats.hits },
    { name: 'Misses', value: performanceData.stats.misses }
  ];
  
  const keysByPrefixData = performanceData.keysByPrefix 
    ? Object.entries(performanceData.keysByPrefix).map(([prefix, count]) => ({
        name: prefix,
        value: count
      }))
    : [];
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Cache Performance</CardTitle>
          {showControls && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Application Cache</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all cached data, which may temporarily slow down the application
                      while the cache is rebuilt. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearCache} disabled={clearingCache}>
                      {clearingCache ? 'Clearing...' : 'Clear Cache'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <CardDescription>Cache hit rates and key distribution</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Hit Ratio</div>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{formatPercentage(performanceData.hitRatio)}</div>
            <Progress className="mt-2" value={performanceData.hitRatio * 100} />
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Cache Keys</div>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{formatNumber(performanceData.keys)}</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Cache Operations</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatNumber(performanceData.stats.sets + performanceData.stats.deletes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumber(performanceData.stats.sets)} sets, {formatNumber(performanceData.stats.deletes)} deletes
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="w-full h-[300px] rounded-md" />
              <Skeleton className="w-full h-[300px] rounded-md" />
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">Cache Hit/Miss Ratio</h3>
                <div className="w-full" style={{ height }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hitMissData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {hitMissData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? COLORS.success : COLORS.warning} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [formatNumber(value), 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Cache Keys by Prefix</h3>
                <div className="w-full" style={{ height }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={keysByPrefixData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {keysByPrefixData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [formatNumber(value), 'Keys']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Cache Statistics</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Hits</TableCell>
                <TableCell>{formatNumber(performanceData.stats.hits)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Misses</TableCell>
                <TableCell>{formatNumber(performanceData.stats.misses)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hit Ratio</TableCell>
                <TableCell>{formatPercentage(performanceData.hitRatio)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cache Sets</TableCell>
                <TableCell>{formatNumber(performanceData.stats.sets)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cache Deletes</TableCell>
                <TableCell>{formatNumber(performanceData.stats.deletes)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Keys</TableCell>
                <TableCell>{formatNumber(performanceData.keys)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
