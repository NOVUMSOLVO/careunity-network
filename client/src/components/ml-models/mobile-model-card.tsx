/**
 * Mobile-Optimized ML Model Card Component
 * 
 * A touch-friendly version of the model card for mobile devices
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModelMetadata } from '@shared/api-client/services/ml-models-api';
import { formatDistanceToNow } from 'date-fns';
import { Database, WifiOff, ChevronRight, BarChart3 } from 'lucide-react';
import { isOnline } from '@/lib/network-status';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileModelCardProps {
  model: ModelMetadata;
  onPredict?: (modelId: string) => void;
  onExplain?: (modelId: string) => void;
  onSelect?: (modelId: string, modelType: string) => void;
  className?: string;
}

export function MobileModelCard({ 
  model, 
  onPredict, 
  onExplain, 
  onSelect,
  className 
}: MobileModelCardProps) {
  // Track online/offline status
  const [isModelCached, setIsModelCached] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(isOnline());
  
  // Check if model is cached in IndexedDB
  useEffect(() => {
    const checkModelCache = async () => {
      try {
        // Check if the model is in the cache
        const caches = await window.caches.open('careunity-ml-models-v1');
        const cachedResponse = await caches.match(`/api/v2/ml-models/${model.id}`);
        setIsModelCached(!!cachedResponse);
      } catch (error) {
        console.error('Error checking model cache:', error);
        setIsModelCached(false);
      }
    };
    
    checkModelCache();
    
    // Set up event listeners for online/offline events
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [model.id]);
  
  // Format creation date
  const formattedDate = model.createdAt
    ? formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })
    : 'Unknown date';
  
  // Get model type from ID
  const getModelType = (id: string) => {
    if (id.startsWith('recommendation')) return 'Recommendation';
    if (id.startsWith('timeseries')) return 'Time Series';
    if (id.startsWith('satisfaction')) return 'Satisfaction';
    if (id.startsWith('workload')) return 'Workload';
    return 'Unknown';
  };
  
  // Get primary metric
  const getPrimaryMetric = () => {
    if (model.metrics.accuracy) {
      return `${(model.metrics.accuracy * 100).toFixed(1)}%`;
    }
    
    if (model.metrics.rmse) {
      return `RMSE: ${model.metrics.rmse.toFixed(2)}`;
    }
    
    return 'No metrics';
  };
  
  // Get all metrics
  const getAllMetrics = () => {
    const metrics = [];
    
    if (model.metrics.accuracy) {
      metrics.push(`Accuracy: ${(model.metrics.accuracy * 100).toFixed(1)}%`);
    }
    
    if (model.metrics.precision) {
      metrics.push(`Precision: ${(model.metrics.precision * 100).toFixed(1)}%`);
    }
    
    if (model.metrics.recall) {
      metrics.push(`Recall: ${(model.metrics.recall * 100).toFixed(1)}%`);
    }
    
    if (model.metrics.f1Score) {
      metrics.push(`F1 Score: ${(model.metrics.f1Score * 100).toFixed(1)}%`);
    }
    
    if (model.metrics.rmse) {
      metrics.push(`RMSE: ${model.metrics.rmse.toFixed(2)}`);
    }
    
    if (model.metrics.mae) {
      metrics.push(`MAE: ${model.metrics.mae.toFixed(2)}`);
    }
    
    return metrics;
  };
  
  // Get top features
  const getTopFeatures = () => {
    if (!model.featureImportance) return [];
    
    return Object.entries(model.featureImportance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, importance]) => ({
        feature: formatFeatureName(feature),
        importance: (importance * 100).toFixed(1)
      }));
  };
  
  // Format feature name
  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  const modelType = getModelType(model.id);
  const primaryMetric = getPrimaryMetric();
  const allMetrics = getAllMetrics();
  const topFeatures = getTopFeatures();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className={cn("w-full touch-manipulation", className)}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-2">
                <h3 className="text-base font-semibold">{model.name}</h3>
                <p className="text-xs text-muted-foreground">v{model.version}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {!isNetworkOnline && isModelCached && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    <Database className="h-3 w-3" />
                  </Badge>
                )}
                
                {!isNetworkOnline && !isModelCached && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <WifiOff className="h-3 w-3" />
                  </Badge>
                )}
                
                <Badge variant="outline">{modelType}</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm font-medium">{primaryMetric}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] sm:h-[65vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{model.name} (v{model.version})</SheetTitle>
          <SheetDescription>
            <Badge variant="outline" className="mr-2">{modelType}</Badge>
            <span className="text-xs">Created {formattedDate}</span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-2">Model Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {allMetrics.length > 0 ? (
                allMetrics.map((metric, index) => (
                  <Badge key={index} variant="secondary">{metric}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No metrics available</span>
              )}
            </div>
          </div>
          
          {/* Top Features */}
          {topFeatures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Top Features</h4>
              <ul className="text-sm space-y-1">
                {topFeatures.map((feature, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{feature.feature}</span>
                    <span className="text-muted-foreground">{feature.importance}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            {onPredict && (
              <Button
                variant="default"
                onClick={() => onPredict(model.id)}
                className="w-full"
              >
                Make Prediction
              </Button>
            )}
            
            {onExplain && (
              <Button
                variant="outline"
                onClick={() => onExplain(model.id)}
                className="w-full"
              >
                Explain Model
              </Button>
            )}
            
            {onSelect && (
              <Button
                variant="secondary"
                onClick={() => onSelect(model.id, getModelType(model.id).toLowerCase())}
                className="w-full"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
