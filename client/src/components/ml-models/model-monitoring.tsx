/**
 * ML Model Monitoring Component
 *
 * Displays monitoring information for ML models including:
 * - Health metrics
 * - Data quality
 * - Prediction quality
 * - Alerts and notifications
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModelMonitoring, useModelAlerts } from '@/hooks/use-ml-models';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Activity, 
  BarChart, 
  Bell, 
  CheckCircle, 
  Database, 
  RefreshCw, 
  XCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

interface ModelMonitoringProps {
  modelId: string;
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
}

export function ModelMonitoring({ modelId, modelType }: ModelMonitoringProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'data' | 'predictions' | 'alerts'>('health');
  
  const { 
    data: monitoringData, 
    isLoading, 
    isError, 
    error,
    refetch: refreshMonitoring
  } = useModelMonitoring(modelId);
  
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    isError: isAlertsError,
    error: alertsError
  } = useModelAlerts(modelId);
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Monitoring</CardTitle>
          <CardDescription>Health and performance monitoring</CardDescription>
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
          <CardTitle>Model Monitoring</CardTitle>
          <CardDescription>Health and performance monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load monitoring data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // No monitoring data yet
  if (!monitoringData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Model Monitoring</CardTitle>
            <CardDescription>Health and performance monitoring</CardDescription>
          </div>
          <Button onClick={() => refreshMonitoring()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Monitoring Data</AlertTitle>
            <AlertDescription>
              No monitoring data is available for this model yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Model Monitoring</CardTitle>
          <CardDescription>Health and performance monitoring</CardDescription>
        </div>
        <Button onClick={() => refreshMonitoring()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="data">Data Quality</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {alertsData && alertsData.activeAlerts > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertsData.activeAlerts}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="health">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-2xl font-bold">
                        {monitoringData.health.uptime}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {monitoringData.health.responseTime}ms
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Activity className={`h-4 w-4 mr-2 ${monitoringData.health.errorRate < 1 ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-2xl font-bold">
                        {monitoringData.health.errorRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Health Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monitoringData.health.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="errorRate" stroke="#ef4444" name="Error Rate (%)" />
                        <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Response Time (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Quality</span>
                      <span className="font-medium">{monitoringData.dataQuality.overallScore}%</span>
                    </div>
                    <Progress value={monitoringData.dataQuality.overallScore} className="h-2" />
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      {monitoringData.dataQuality.metrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{metric.name}</span>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{metric.score}%</span>
                            {metric.score > 80 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : metric.score > 50 ? (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Data Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={monitoringData.dataQuality.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feature" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="training" fill="#3b82f6" name="Training" />
                        <Bar dataKey="current" fill="#10b981" name="Current" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-2xl font-bold">
                        {monitoringData.predictions.accuracy}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Predictions / Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {monitoringData.predictions.volume}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-2xl font-bold">
                        {monitoringData.predictions.confidence}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Prediction Metrics Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monitoringData.predictions.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy (%)" />
                        <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" name="Confidence (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            {isLoadingAlerts ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : isAlertsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {alertsError instanceof Error ? alertsError.message : 'Failed to load alerts data'}
                </AlertDescription>
              </Alert>
            ) : !alertsData || alertsData.alerts.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>No Alerts</AlertTitle>
                <AlertDescription>
                  No alerts have been triggered for this model.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {alertsData.alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'outline'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge variant={alert.status === 'active' ? 'destructive' : 'outline'}>
                        {alert.status}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      {alert.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
