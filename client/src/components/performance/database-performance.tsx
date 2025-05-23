/**
 * Database Performance Component
 * 
 * This component displays database performance metrics and query optimization recommendations.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  RefreshCw, 
  Database,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Check,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Types
interface DatabasePerformanceProps {
  height?: number;
  showControls?: boolean;
}

interface QueryMetric {
  queryId: string;
  executionTime: number;
  rowsReturned: number;
  table?: string;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

interface DatabasePerformanceData {
  metrics: QueryMetric[];
  totalQueries: number;
  averageExecutionTime: number;
  totalRowsReturned: number;
  slowQueries: QueryMetric[];
  indexRecommendations: IndexRecommendation[];
}

// Mock data for development
const mockDatabasePerformanceData: DatabasePerformanceData = {
  metrics: [],
  totalQueries: 8750,
  averageExecutionTime: 85,
  totalRowsReturned: 1250000,
  slowQueries: [
    { queryId: 'q1', executionTime: 1250, rowsReturned: 5200, table: 'visits' },
    { queryId: 'q2', executionTime: 980, rowsReturned: 1800, table: 'service_users' },
    { queryId: 'q3', executionTime: 850, rowsReturned: 3500, table: 'staff' },
    { queryId: 'q4', executionTime: 720, rowsReturned: 950, table: 'care_plans' },
    { queryId: 'q5', executionTime: 680, rowsReturned: 12000, table: 'tasks' }
  ],
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
  ]
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

// Impact color mapping
const IMPACT_COLORS = {
  high: COLORS.danger,
  medium: COLORS.warning,
  low: COLORS.info
};

export default function DatabasePerformance({ 
  height = 300,
  showControls = true
}: DatabasePerformanceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('slow-queries');
  const [performanceData, setPerformanceData] = useState<DatabasePerformanceData>(mockDatabasePerformanceData);
  
  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // const slowQueries = await api.performance.getSlowQueries();
      // const indexRecommendations = await api.performance.getIndexRecommendations();
      // const queryMetrics = await api.performance.getQueryMetrics();
      
      // For now, use mock data
      setPerformanceData(mockDatabasePerformanceData);
      
      toast({
        title: "Data refreshed",
        description: "Database performance metrics have been updated",
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching database performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch database performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);
  
  // Prepare data for charts
  const slowQueriesChartData = performanceData.slowQueries.map(query => ({
    name: query.queryId,
    executionTime: query.executionTime,
    rowsReturned: query.rowsReturned,
    table: query.table
  }));
  
  // Get impact badge variant
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Database Performance</CardTitle>
          {showControls && (
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>Query performance and optimization recommendations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Avg Query Time</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.averageExecutionTime}ms</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Queries</div>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.totalQueries.toLocaleString()}</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Rows Returned</div>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-1">{performanceData.totalRowsReturned.toLocaleString()}</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="slow-queries">Slow Queries</TabsTrigger>
            <TabsTrigger value="index-recommendations">Index Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="slow-queries" className="mt-0">
            {loading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <>
                <div className="w-full" style={{ height }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slowQueriesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ 
                          value: 'Execution Time (ms)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 12 }
                        }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value}ms`, 'Execution Time']}
                        labelFormatter={(label) => `Query: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="executionTime" 
                        name="Execution Time" 
                        fill={COLORS.danger} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Slow Queries Details</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query ID</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Execution Time</TableHead>
                        <TableHead>Rows Returned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceData.slowQueries.map((query) => (
                        <TableRow key={query.queryId}>
                          <TableCell className="font-medium">{query.queryId}</TableCell>
                          <TableCell>{query.table}</TableCell>
                          <TableCell>{query.executionTime}ms</TableCell>
                          <TableCell>{query.rowsReturned.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="index-recommendations" className="mt-0">
            {loading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.indexRecommendations.map((rec, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rec.table}</TableCell>
                        <TableCell>{rec.columns.join(', ')}</TableCell>
                        <TableCell>{getImpactBadge(rec.impact)}</TableCell>
                        <TableCell className="max-w-md truncate">{rec.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Implementation Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adding indexes can significantly improve query performance but may impact write operations.
                    Always test index changes in a staging environment before applying to production.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
