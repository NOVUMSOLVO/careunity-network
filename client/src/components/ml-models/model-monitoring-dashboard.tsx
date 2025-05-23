import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LineChart, BarChart, PieChart } from '@/components/charts';

interface ModelMonitoringDashboardProps {
  modelId: string;
}

export function ModelMonitoringDashboard({ modelId }: ModelMonitoringDashboardProps) {
  // Fetch model metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['model-metrics', modelId],
    queryFn: async () => {
      try {
        const { data, error } = await apiClient.get(`/api/v2/ml-models/${modelId}/metrics`);
        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        // Return mock data if API fails
        return getMockMetrics();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading metrics...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Model Performance Monitoring</span>
          <Badge variant="outline">{metrics?.model?.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="drift">Data Drift</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Accuracy" 
                value={metrics?.performance?.accuracy} 
                change={metrics?.performance?.accuracyChange}
                target={0.9}
              />
              <MetricCard 
                title="Precision" 
                value={metrics?.performance?.precision} 
                change={metrics?.performance?.precisionChange}
                target={0.85}
              />
              <MetricCard 
                title="Recall" 
                value={metrics?.performance?.recall} 
                change={metrics?.performance?.recallChange}
                target={0.8}
              />
            </div>
            
            <div className="h-80 mt-6">
              <LineChart 
                data={metrics?.performance?.history} 
                xKey="date" 
                yKeys={["accuracy", "precision", "recall"]}
                colors={["#3b82f6", "#10b981", "#f59e0b"]}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Requests / Day" 
                value={metrics?.usage?.requestsPerDay} 
                change={metrics?.usage?.requestsChange}
                format="number"
              />
              <MetricCard 
                title="Avg. Response Time" 
                value={metrics?.usage?.avgResponseTime} 
                change={metrics?.usage?.responseTimeChange}
                format="ms"
                reverseColors
              />
              <MetricCard 
                title="Error Rate" 
                value={metrics?.usage?.errorRate} 
                change={metrics?.usage?.errorRateChange}
                format="percent"
                reverseColors
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Requests by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60">
                    <BarChart 
                      data={metrics?.usage?.requestsByHour} 
                      xKey="hour" 
                      yKey="requests"
                      color="#3b82f6"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Request Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60">
                    <PieChart 
                      data={metrics?.usage?.requestSources} 
                      nameKey="source" 
                      valueKey="count"
                      colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="drift" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Feature Drift" 
                value={metrics?.drift?.featureDrift} 
                change={metrics?.drift?.featureDriftChange}
                format="percent"
                reverseColors
              />
              <MetricCard 
                title="Prediction Drift" 
                value={metrics?.drift?.predictionDrift} 
                change={metrics?.drift?.predictionDriftChange}
                format="percent"
                reverseColors
              />
              <MetricCard 
                title="Data Quality" 
                value={metrics?.drift?.dataQuality} 
                change={metrics?.drift?.dataQualityChange}
                format="percent"
              />
            </div>
            
            <div className="h-80 mt-6">
              <LineChart 
                data={metrics?.drift?.history} 
                xKey="date" 
                yKeys={["featureDrift", "predictionDrift", "dataQuality"]}
                colors={["#ef4444", "#f59e0b", "#10b981"]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  target?: number;
  format?: 'percent' | 'number' | 'ms';
  reverseColors?: boolean;
}

function MetricCard({ title, value, change, target, format = 'percent', reverseColors = false }: MetricCardProps) {
  const formatValue = (val: number) => {
    if (format === 'percent') return `${(val * 100).toFixed(1)}%`;
    if (format === 'ms') return `${val.toFixed(1)}ms`;
    return val.toLocaleString();
  };
  
  const getChangeColor = (changeVal: number) => {
    if (changeVal === 0) return 'text-gray-500';
    if (reverseColors) {
      return changeVal > 0 ? 'text-red-500' : 'text-green-500';
    }
    return changeVal > 0 ? 'text-green-500' : 'text-red-500';
  };
  
  const getChangeIcon = (changeVal: number) => {
    if (changeVal === 0) return '•';
    if (reverseColors) {
      return changeVal > 0 ? '↑' : '↓';
    }
    return changeVal > 0 ? '↑' : '↓';
  };
  
  const getProgressColor = () => {
    if (!target) return 'bg-blue-500';
    
    if (format === 'percent') {
      if (value >= target) return 'bg-green-500';
      if (value >= target * 0.9) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (reverseColors) {
      if (value <= target) return 'bg-green-500';
      if (value <= target * 1.1) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (value >= target) return 'bg-green-500';
    if (value >= target * 0.9) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getProgressWidth = () => {
    if (!target) return '100%';
    
    if (reverseColors) {
      const ratio = Math.min(target / Math.max(value, 0.001), 1);
      return `${ratio * 100}%`;
    }
    
    const ratio = Math.min(value / target, 1);
    return `${ratio * 100}%`;
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          {change !== undefined && (
            <div className={`text-xs ${getChangeColor(change)}`}>
              {getChangeIcon(change)} {Math.abs(change * 100).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mt-2">{formatValue(value)}</div>
        {target && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">
              Target: {formatValue(target)}
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getProgressColor()}`}
                style={{ width: getProgressWidth() }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data for testing
function getMockMetrics() {
  return {
    model: {
      id: 'model-123',
      name: 'Caregiver Recommendation Model',
      version: '1.2.3',
      type: 'recommendation'
    },
    performance: {
      accuracy: 0.92,
      accuracyChange: 0.03,
      precision: 0.89,
      precisionChange: 0.02,
      recall: 0.85,
      recallChange: -0.01,
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.82 + Math.random() * 0.1,
        recall: 0.8 + Math.random() * 0.1
      }))
    },
    usage: {
      requestsPerDay: 1250,
      requestsChange: 0.15,
      avgResponseTime: 120,
      responseTimeChange: -0.05,
      errorRate: 0.02,
      errorRateChange: -0.01,
      requestsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        requests: Math.floor(100 + Math.sin(i / 24 * Math.PI * 2) * 80 + Math.random() * 30)
      })),
      requestSources: [
        { source: 'Web App', count: 650 },
        { source: 'Mobile App', count: 450 },
        { source: 'API', count: 100 },
        { source: 'Offline', count: 50 }
      ]
    },
    drift: {
      featureDrift: 0.03,
      featureDriftChange: 0.01,
      predictionDrift: 0.04,
      predictionDriftChange: -0.02,
      dataQuality: 0.97,
      dataQualityChange: 0.01,
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        featureDrift: 0.02 + Math.random() * 0.03,
        predictionDrift: 0.03 + Math.random() * 0.04,
        dataQuality: 0.95 + Math.random() * 0.04
      }))
    }
  };
}
