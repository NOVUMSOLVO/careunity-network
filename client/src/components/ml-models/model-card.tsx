/**
 * ML Model Card Component
 *
 * Displays information about a machine learning model
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModelMetadata } from '@shared/api-client/services/ml-models-api';
import { formatDistanceToNow } from 'date-fns';
import { Database, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isOnline } from '@/lib/network-status';

interface ModelCardProps {
  model: ModelMetadata;
  onPredict?: (modelId: string) => void;
  onExplain?: (modelId: string) => void;
  onRetrain?: (modelId: string) => void;
  onSelect?: (modelId: string, modelType: string) => void;
}

export function ModelCard({ model, onPredict, onExplain, onRetrain, onSelect }: ModelCardProps) {
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

  // Get model metrics
  const getMetrics = () => {
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
      .slice(0, 3)
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
  const metrics = getMetrics();
  const topFeatures = getTopFeatures();

  return (
    <Card
      className="w-full cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onSelect && onSelect(model.id, getModelType(model.id).toLowerCase())}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{model.name}</CardTitle>

              {!isNetworkOnline && isModelCached && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        <Database className="h-3 w-3 mr-1" />
                        <span className="text-xs">Cached</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This model is available offline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {!isNetworkOnline && !isModelCached && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        <WifiOff className="h-3 w-3 mr-1" />
                        <span className="text-xs">Offline</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This model is not available offline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <CardDescription>Version {model.version}</CardDescription>
          </div>
          <Badge variant="outline">{modelType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Model Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {metrics.length > 0 ? (
                metrics.map((metric, index) => (
                  <Badge key={index} variant="secondary">{metric}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No metrics available</span>
              )}
            </div>
          </div>

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

          <div className="text-xs text-muted-foreground">
            Created {formattedDate}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {onPredict && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onPredict(model.id)}
          >
            Make Prediction
          </Button>
        )}

        {onExplain && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExplain(model.id)}
          >
            Explain
          </Button>
        )}

        {onRetrain && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRetrain(model.id)}
          >
            Retrain
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
