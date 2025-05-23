/**
 * Model Performance Component
 * 
 * Displays performance history for a machine learning model
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModelPerformance } from '@/hooks/use-ml-models';
import { ModelPerformanceRecord } from '@shared/api-client/services/ml-models-api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModelPerformanceProps {
  modelId: string;
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
}

export function ModelPerformance({ modelId, modelType }: ModelPerformanceProps) {
  const { data: performanceData, isLoading, isError, error } = useModelPerformance(modelId);
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Historical performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Historical performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load performance data: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!performanceData || performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Historical performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>
              No performance history available for this model.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate performance trends
  const trends = calculatePerformanceTrends(performanceData, modelType);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance</CardTitle>
        <CardDescription>Historical performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(trends).map(([metric, trend]) => (
              <Card key={metric} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">{formatMetricName(metric)}</h4>
                    <p className="text-2xl font-bold">
                      {formatMetricValue(metric, trend.current)}
                    </p>
                  </div>
                  <Badge 
                    variant={getTrendVariant(trend.direction, metric, modelType)}
                    className="flex items-center gap-1"
                  >
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatMetricValue(metric, Math.abs(trend.change))}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          
          <Tabs defaultValue="accuracy">
            <TabsList className="w-full">
              {getMetricTabsForModelType(modelType).map(metric => (
                <TabsTrigger key={metric} value={metric} className="flex-1">
                  {formatMetricName(metric)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {getMetricTabsForModelType(modelType).map(metric => (
              <TabsContent key={metric} value={metric}>
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        domain={getYAxisDomain(metric, modelType)}
                        tickFormatter={(value) => formatMetricValue(metric, value)}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatMetricValue(metric, value), formatMetricName(metric)]}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={`metrics.${metric}`} 
                        name={formatMetricName(metric)} 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sampleSize" 
                        name="Sample Size" 
                        stroke="#82ca9d" 
                        yAxisId="right"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get metric tabs for model type
 */
function getMetricTabsForModelType(modelType: string): string[] {
  switch (modelType) {
    case 'recommendation':
    case 'satisfaction':
      return ['accuracy', 'precision', 'recall', 'f1Score'];
    case 'timeSeries':
    case 'workload':
      return ['rmse', 'mae'];
    default:
      return ['accuracy'];
  }
}

/**
 * Format metric name for display
 */
function formatMetricName(metric: string): string {
  switch (metric) {
    case 'accuracy':
      return 'Accuracy';
    case 'precision':
      return 'Precision';
    case 'recall':
      return 'Recall';
    case 'f1Score':
      return 'F1 Score';
    case 'rmse':
      return 'RMSE';
    case 'mae':
      return 'MAE';
    default:
      return metric;
  }
}

/**
 * Format metric value for display
 */
function formatMetricValue(metric: string, value: number): string {
  switch (metric) {
    case 'accuracy':
    case 'precision':
    case 'recall':
    case 'f1Score':
      return `${(value * 100).toFixed(1)}%`;
    case 'rmse':
    case 'mae':
      return value.toFixed(2);
    default:
      return value.toString();
  }
}

/**
 * Get Y-axis domain for metric
 */
function getYAxisDomain(metric: string, modelType: string): [number, number] {
  switch (metric) {
    case 'accuracy':
    case 'precision':
    case 'recall':
    case 'f1Score':
      return [0, 1];
    case 'rmse':
    case 'mae':
      return [0, 'auto'];
    default:
      return [0, 'auto'];
  }
}

/**
 * Calculate performance trends
 */
function calculatePerformanceTrends(
  data: ModelPerformanceRecord[],
  modelType: string
): Record<string, { current: number; change: number; direction: 'up' | 'down' }> {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get metrics based on model type
  const metrics = getMetricTabsForModelType(modelType);
  
  // Calculate trends
  const trends: Record<string, { current: number; change: number; direction: 'up' | 'down' }> = {};
  
  for (const metric of metrics) {
    if (sortedData.length < 2) {
      trends[metric] = {
        current: sortedData[0]?.metrics[metric as keyof typeof sortedData[0]['metrics']] || 0,
        change: 0,
        direction: 'up'
      };
      continue;
    }
    
    const first = sortedData[0]?.metrics[metric as keyof typeof sortedData[0]['metrics']] || 0;
    const last = sortedData[sortedData.length - 1]?.metrics[metric as keyof typeof sortedData[0]['metrics']] || 0;
    const change = last - first;
    
    // For RMSE and MAE, lower is better
    const direction = metric === 'rmse' || metric === 'mae'
      ? change < 0 ? 'up' : 'down'
      : change > 0 ? 'up' : 'down';
    
    trends[metric] = {
      current: last,
      change,
      direction
    };
  }
  
  return trends;
}

/**
 * Get trend badge variant
 */
function getTrendVariant(
  direction: 'up' | 'down',
  metric: string,
  modelType: string
): 'default' | 'destructive' | 'outline' {
  // For RMSE and MAE, lower is better
  if (metric === 'rmse' || metric === 'mae') {
    return direction === 'up' ? 'default' : 'destructive';
  }
  
  // For other metrics, higher is better
  return direction === 'up' ? 'default' : 'destructive';
}
