import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3Icon, 
  PieChartIcon, 
  LineChartIcon,
  DownloadIcon,
  FilterIcon
} from 'lucide-react';

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: 'care' | 'staff' | 'compliance' | 'satisfaction';
}

interface QualityMetricsProps {
  data?: QualityMetric[];
  fullView?: boolean;
}

/**
 * Quality metrics component
 * 
 * Displays quality metrics with progress bars and trends
 */
export function QualityMetrics({ data, fullView = false }: QualityMetricsProps) {
  if (!data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading quality metrics...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">No quality metrics available</p>
      </div>
    );
  }

  // Group metrics by category
  const groupedMetrics = data.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, QualityMetric[]>);

  // Get color based on value vs target
  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Get trend indicator
  const getTrendIndicator = (trend: QualityMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↑</span>;
      case 'down':
        return <span className="text-red-500">↓</span>;
      case 'stable':
        return <span className="text-gray-500">→</span>;
      default:
        return null;
    }
  };

  // Render metrics for a specific category
  const renderMetrics = (metrics: QualityMetric[]) => (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{metric.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {metric.value} / {metric.target}
              </span>
              {getTrendIndicator(metric.trend)}
            </div>
          </div>
          <Progress 
            value={(metric.value / metric.target) * 100} 
            className={getProgressColor(metric.value, metric.target)}
          />
        </div>
      ))}
    </div>
  );

  // If not full view, show a simplified version
  if (!fullView) {
    // Get top metrics from each category
    const topMetrics = Object.values(groupedMetrics)
      .map(metrics => metrics[0])
      .slice(0, 4);

    return (
      <div className="space-y-4">
        {topMetrics.map((metric) => (
          <div key={metric.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {metric.value} / {metric.target}
                </span>
                {getTrendIndicator(metric.trend)}
              </div>
            </div>
            <Progress 
              value={(metric.value / metric.target) * 100} 
              className={getProgressColor(metric.value, metric.target)}
            />
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full">
          View All Metrics
        </Button>
      </div>
    );
  }

  // Full view with tabs for different categories
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3Icon className="mr-2 h-4 w-4" />
            Chart View
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      <Tabs defaultValue="care">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="care">Care Quality</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="care" className="mt-4 space-y-4">
          {groupedMetrics.care && renderMetrics(groupedMetrics.care)}
        </TabsContent>
        
        <TabsContent value="staff" className="mt-4 space-y-4">
          {groupedMetrics.staff && renderMetrics(groupedMetrics.staff)}
        </TabsContent>
        
        <TabsContent value="compliance" className="mt-4 space-y-4">
          {groupedMetrics.compliance && renderMetrics(groupedMetrics.compliance)}
        </TabsContent>
        
        <TabsContent value="satisfaction" className="mt-4 space-y-4">
          {groupedMetrics.satisfaction && renderMetrics(groupedMetrics.satisfaction)}
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium">Quality Trends (Last 12 Months)</h3>
            <div className="h-64 w-full bg-muted/20 flex items-center justify-center">
              <LineChartIcon className="h-8 w-8 text-muted" />
              <span className="ml-2 text-sm text-muted-foreground">Chart will render here</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium">Quality by Service Area</h3>
            <div className="h-64 w-full bg-muted/20 flex items-center justify-center">
              <PieChartIcon className="h-8 w-8 text-muted" />
              <span className="ml-2 text-sm text-muted-foreground">Chart will render here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
