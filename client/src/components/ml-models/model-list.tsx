/**
 * ML Model List Component
 *
 * Displays a list of machine learning models
 */

import React, { useState } from 'react';
import { useMLModels, useTrainRecommendationModel, useTrainTimeSeriesModel, useTrainSatisfactionModel } from '@/hooks/use-ml-models';
import { ModelCard } from './model-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/api-client/services/ml-models-api';

interface ModelListProps {
  onPredict?: (modelId: string) => void;
  onExplain?: (modelId: string) => void;
  onSelect?: (modelId: string, modelType: string) => void;
}

export function ModelList({ onPredict, onExplain, onSelect }: ModelListProps) {
  const { data: models, isLoading, isError, error } = useMLModels();
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    modelType: 'recommendation',
    trainingRatio: 0.7,
    validationRatio: 0.15,
    testRatio: 0.15,
  });

  // Training mutations
  const trainRecommendation = useTrainRecommendationModel();
  const trainTimeSeries = useTrainTimeSeriesModel();
  const trainSatisfaction = useTrainSatisfactionModel();

  // Filter models by type
  const recommendationModels = models?.filter(m => m.id.startsWith('recommendation')) || [];
  const timeSeriesModels = models?.filter(m => m.id.startsWith('timeseries')) || [];
  const satisfactionModels = models?.filter(m => m.id.startsWith('satisfaction')) || [];
  const workloadModels = models?.filter(m => m.id.startsWith('workload')) || [];

  // Handle training a new model
  const handleTrainModel = () => {
    switch (trainingConfig.modelType) {
      case 'recommendation':
        trainRecommendation.mutate(trainingConfig);
        break;
      case 'timeSeries':
        trainTimeSeries.mutate(trainingConfig);
        break;
      case 'satisfaction':
        trainSatisfaction.mutate(trainingConfig);
        break;
      default:
        // Not implemented yet
        break;
    }

    setIsTrainingDialogOpen(false);
  };

  // Handle retraining an existing model
  const handleRetrain = (modelId: string) => {
    // Determine model type from ID
    let modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload' = 'recommendation';

    if (modelId.startsWith('timeseries')) {
      modelType = 'timeSeries';
    } else if (modelId.startsWith('satisfaction')) {
      modelType = 'satisfaction';
    } else if (modelId.startsWith('workload')) {
      modelType = 'workload';
    }

    // Set training config and open dialog
    setTrainingConfig({
      ...trainingConfig,
      modelType,
    });

    setIsTrainingDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">ML Models</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <Tabs defaultValue="recommendation">
          <TabsList className="w-full">
            <TabsTrigger value="recommendation" className="flex-1">Recommendation</TabsTrigger>
            <TabsTrigger value="timeseries" className="flex-1">Time Series</TabsTrigger>
            <TabsTrigger value="satisfaction" className="flex-1">Satisfaction</TabsTrigger>
            <TabsTrigger value="workload" className="flex-1">Workload</TabsTrigger>
          </TabsList>
          <TabsContent value="recommendation" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load ML models: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (models?.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">ML Models</h2>
          <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Train New Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Train New ML Model</DialogTitle>
                <DialogDescription>
                  Configure and train a new machine learning model.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="model-type">Model Type</Label>
                  <Select
                    value={trainingConfig.modelType}
                    onValueChange={(value: any) =>
                      setTrainingConfig({ ...trainingConfig, modelType: value })
                    }
                  >
                    <SelectTrigger id="model-type">
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="timeSeries">Time Series</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction</SelectItem>
                      <SelectItem value="workload">Workload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="training-ratio">Training Ratio</Label>
                    <Input
                      id="training-ratio"
                      type="number"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={trainingConfig.trainingRatio}
                      onChange={(e) =>
                        setTrainingConfig({
                          ...trainingConfig,
                          trainingRatio: parseFloat(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validation-ratio">Validation Ratio</Label>
                    <Input
                      id="validation-ratio"
                      type="number"
                      min="0.05"
                      max="0.3"
                      step="0.05"
                      value={trainingConfig.validationRatio}
                      onChange={(e) =>
                        setTrainingConfig({
                          ...trainingConfig,
                          validationRatio: parseFloat(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-ratio">Test Ratio</Label>
                    <Input
                      id="test-ratio"
                      type="number"
                      min="0.05"
                      max="0.3"
                      step="0.05"
                      value={trainingConfig.testRatio}
                      onChange={(e) =>
                        setTrainingConfig({
                          ...trainingConfig,
                          testRatio: parseFloat(e.target.value)
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTrainingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleTrainModel}
                  disabled={
                    trainRecommendation.isPending ||
                    trainTimeSeries.isPending ||
                    trainSatisfaction.isPending
                  }
                >
                  {(trainRecommendation.isPending ||
                    trainTimeSeries.isPending ||
                    trainSatisfaction.isPending) ? 'Training...' : 'Train Model'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Models Found</AlertTitle>
          <AlertDescription>
            No machine learning models have been trained yet. Click the "Train New Model" button to get started.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render model list
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ML Models</h2>
        <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Train New Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Train New ML Model</DialogTitle>
              <DialogDescription>
                Configure and train a new machine learning model.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model-type">Model Type</Label>
                <Select
                  value={trainingConfig.modelType}
                  onValueChange={(value: any) =>
                    setTrainingConfig({ ...trainingConfig, modelType: value })
                  }
                >
                  <SelectTrigger id="model-type">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="timeSeries">Time Series</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="workload">Workload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="training-ratio">Training Ratio</Label>
                  <Input
                    id="training-ratio"
                    type="number"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={trainingConfig.trainingRatio}
                    onChange={(e) =>
                      setTrainingConfig({
                        ...trainingConfig,
                        trainingRatio: parseFloat(e.target.value)
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validation-ratio">Validation Ratio</Label>
                  <Input
                    id="validation-ratio"
                    type="number"
                    min="0.05"
                    max="0.3"
                    step="0.05"
                    value={trainingConfig.validationRatio}
                    onChange={(e) =>
                      setTrainingConfig({
                        ...trainingConfig,
                        validationRatio: parseFloat(e.target.value)
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-ratio">Test Ratio</Label>
                  <Input
                    id="test-ratio"
                    type="number"
                    min="0.05"
                    max="0.3"
                    step="0.05"
                    value={trainingConfig.testRatio}
                    onChange={(e) =>
                      setTrainingConfig({
                        ...trainingConfig,
                        testRatio: parseFloat(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTrainingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleTrainModel}
                disabled={
                  trainRecommendation.isPending ||
                  trainTimeSeries.isPending ||
                  trainSatisfaction.isPending
                }
              >
                {(trainRecommendation.isPending ||
                  trainTimeSeries.isPending ||
                  trainSatisfaction.isPending) ? 'Training...' : 'Train Model'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="recommendation">
        <TabsList className="w-full">
          <TabsTrigger value="recommendation" className="flex-1">
            Recommendation ({recommendationModels.length})
          </TabsTrigger>
          <TabsTrigger value="timeseries" className="flex-1">
            Time Series ({timeSeriesModels.length})
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex-1">
            Satisfaction ({satisfactionModels.length})
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex-1">
            Workload ({workloadModels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendation" className="mt-4">
          {recommendationModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendationModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onPredict={onPredict}
                  onExplain={onExplain}
                  onRetrain={handleRetrain}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Recommendation Models</AlertTitle>
              <AlertDescription>
                No recommendation models have been trained yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="timeseries" className="mt-4">
          {timeSeriesModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeSeriesModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onPredict={onPredict}
                  onExplain={onExplain}
                  onRetrain={handleRetrain}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Time Series Models</AlertTitle>
              <AlertDescription>
                No time series models have been trained yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-4">
          {satisfactionModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {satisfactionModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onPredict={onPredict}
                  onExplain={onExplain}
                  onRetrain={handleRetrain}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Satisfaction Models</AlertTitle>
              <AlertDescription>
                No satisfaction prediction models have been trained yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="workload" className="mt-4">
          {workloadModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloadModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onPredict={onPredict}
                  onExplain={onExplain}
                  onRetrain={handleRetrain}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Workload Models</AlertTitle>
              <AlertDescription>
                No workload prediction models have been trained yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
