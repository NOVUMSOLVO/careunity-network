/**
 * ML Models Page
 *
 * Displays and manages machine learning models with enhanced functionality:
 * - Offline support with data caching and synchronization
 * - Real-time updates via WebSockets
 * - Voice command integration
 * - Comprehensive error handling
 */

import React, { useState, useEffect } from 'react';
import { ModelList } from '@/components/ml-models/model-list';
import { ModelPerformance } from '@/components/ml-models/model-performance';
import { ModelDrift } from '@/components/ml-models/model-drift';
import { ModelRegistry } from '@/components/ml-models/model-registry';
import { ModelDeployment } from '@/components/ml-models/model-deployment';
import { ModelMonitoring } from '@/components/ml-models/model-monitoring';
import { MLModelsOfflineIndicator } from '@/components/ml-models/offline-indicator';
import { MLModelsRealTimeNotifications } from '@/components/ml-models/real-time-notifications';
import { EnhancedMLDashboard } from '@/components/ml-models/enhanced-ml-dashboard';
import { VoiceCommands } from '@/components/ml-models/voice-commands';
import { useMakePrediction, useGenerateExplanation } from '@/hooks/use-ml-models';
import { PredictionRequest, ExplanationRequest } from '@shared/api-client/services/ml-models-api';
import { initMLModelsWebSocket } from '@/services/ml-models-websocket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function MLModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedModelType, setSelectedModelType] = useState<'recommendation' | 'timeSeries' | 'satisfaction' | 'workload'>('recommendation');
  const [activeTab, setActiveTab] = useState<'models' | 'performance' | 'drift' | 'registry' | 'deployment' | 'monitoring'>('models');
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [predictionFeatures, setPredictionFeatures] = useState<Record<string, any>>({});
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [explanationResult, setExplanationResult] = useState<any>(null);

  // Mutations
  const makePrediction = useMakePrediction();
  const generateExplanation = useGenerateExplanation();

  // Handle opening prediction dialog
  const handleOpenPredictionDialog = (modelId: string) => {
    setSelectedModelId(modelId);

    // Determine model type from ID
    let modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload' = 'recommendation';

    if (modelId.startsWith('timeseries')) {
      modelType = 'timeSeries';
    } else if (modelId.startsWith('satisfaction')) {
      modelType = 'satisfaction';
    } else if (modelId.startsWith('workload')) {
      modelType = 'workload';
    }

    setSelectedModelType(modelType);
    setPredictionFeatures({});
    setPredictionResult(null);
    setIsPredictionDialogOpen(true);
  };

  // Handle opening explanation dialog
  const handleOpenExplanationDialog = (modelId: string) => {
    setSelectedModelId(modelId);

    // Determine model type from ID
    let modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload' = 'recommendation';

    if (modelId.startsWith('timeseries')) {
      modelType = 'timeSeries';
    } else if (modelId.startsWith('satisfaction')) {
      modelType = 'satisfaction';
    } else if (modelId.startsWith('workload')) {
      modelType = 'workload';
    }

    setSelectedModelType(modelType);
    setExplanationResult(null);
    setIsExplanationDialogOpen(true);
  };

  // Handle making a prediction
  const handleMakePrediction = async () => {
    if (!selectedModelId) return;

    const request: PredictionRequest = {
      modelId: selectedModelId,
      features: predictionFeatures
    };

    try {
      const result = await makePrediction.mutateAsync(request);
      setPredictionResult(result);
    } catch (error) {
      console.error('Failed to make prediction:', error);
    }
  };

  // Handle generating an explanation
  const handleGenerateExplanation = async () => {
    if (!selectedModelId || !predictionResult) return;

    // Determine model type from ID
    let modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload' = 'recommendation';

    if (selectedModelId.startsWith('timeseries')) {
      modelType = 'timeSeries';
    } else if (selectedModelId.startsWith('satisfaction')) {
      modelType = 'satisfaction';
    } else if (selectedModelId.startsWith('workload')) {
      modelType = 'workload';
    }

    const request: ExplanationRequest = {
      modelType,
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      featureImportance: predictionResult.explanations || [],
      context: predictionFeatures
    };

    try {
      const result = await generateExplanation.mutateAsync(request);
      setExplanationResult(result);
      setIsPredictionDialogOpen(false);
      setIsExplanationDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    }
  };

  // Handle feature input change
  const handleFeatureChange = (key: string, value: any) => {
    setPredictionFeatures(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get feature inputs based on model type
  const getFeatureInputs = () => {
    if (!selectedModelId) return null;

    // Different features based on model type
    if (selectedModelId.startsWith('recommendation')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caregiverId">Caregiver ID</Label>
              <Input
                id="caregiverId"
                type="number"
                value={predictionFeatures.caregiverId || ''}
                onChange={(e) => handleFeatureChange('caregiverId', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceUserId">Service User ID</Label>
              <Input
                id="serviceUserId"
                type="number"
                value={predictionFeatures.serviceUserId || ''}
                onChange={(e) => handleFeatureChange('serviceUserId', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitType">Visit Type</Label>
              <Input
                id="visitType"
                value={predictionFeatures.visitType || ''}
                onChange={(e) => handleFeatureChange('visitType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillMatch">Skill Match (0-100)</Label>
              <Input
                id="skillMatch"
                type="number"
                min="0"
                max="100"
                value={predictionFeatures.skillMatch || ''}
                onChange={(e) => handleFeatureChange('skillMatch', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationMatch">Location Match (0-100)</Label>
              <Input
                id="locationMatch"
                type="number"
                min="0"
                max="100"
                value={predictionFeatures.locationMatch || ''}
                onChange={(e) => handleFeatureChange('locationMatch', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="continuityMatch">Continuity Match (0-100)</Label>
              <Input
                id="continuityMatch"
                type="number"
                min="0"
                max="100"
                value={predictionFeatures.continuityMatch || ''}
                onChange={(e) => handleFeatureChange('continuityMatch', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      );
    }

    if (selectedModelId.startsWith('satisfaction')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caregiverId">Caregiver ID</Label>
              <Input
                id="caregiverId"
                type="number"
                value={predictionFeatures.caregiverId || ''}
                onChange={(e) => handleFeatureChange('caregiverId', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceUserId">Service User ID</Label>
              <Input
                id="serviceUserId"
                type="number"
                value={predictionFeatures.serviceUserId || ''}
                onChange={(e) => handleFeatureChange('serviceUserId', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previousRatings">Previous Ratings (1-5)</Label>
              <Input
                id="previousRatings"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={predictionFeatures.previousRatings || ''}
                onChange={(e) => handleFeatureChange('previousRatings', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDuration">Visit Duration (minutes)</Label>
              <Input
                id="visitDuration"
                type="number"
                min="0"
                value={predictionFeatures.visitDuration || ''}
                onChange={(e) => handleFeatureChange('visitDuration', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      );
    }

    // Generic inputs for other model types
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="features">Features (JSON format)</Label>
          <Textarea
            id="features"
            rows={10}
            placeholder='{"feature1": 100, "feature2": "value", ...}'
            value={predictionFeatures.rawJson || '{}'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setPredictionFeatures(parsed);
                handleFeatureChange('rawJson', e.target.value);
              } catch (error) {
                // Allow invalid JSON during typing
                handleFeatureChange('rawJson', e.target.value);
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Network status is now handled by the MLModelsOfflineIndicator component

  // Initialize WebSocket connection
  useEffect(() => {
    // Initialize WebSocket connection
    const cleanup = initMLModelsWebSocket();

    // Clean up on unmount
    return cleanup;
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Machine Learning Models</h1>
            <p className="text-muted-foreground">
              Manage and use AI models for care allocation and prediction
            </p>
          </div>

          <div className="flex items-start gap-3">
            <MLModelsRealTimeNotifications />
            <MLModelsOfflineIndicator showDetails={true} className="w-64" />
          </div>
        </div>

        {/* Enhanced ML Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnhancedMLDashboard />
          </div>
          <div>
            <VoiceCommands
              onCommand={(command) => {
                // Handle voice commands
                if (command === 'show models') {
                  setActiveTab('models');
                } else if (command === 'show performance' && selectedModelId) {
                  setActiveTab('performance');
                } else if (command === 'test model' && selectedModelId) {
                  handleOpenPredictionDialog(selectedModelId);
                }
              }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="models" className="flex-1">Models</TabsTrigger>
            {selectedModelId && (
              <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
            )}
            {selectedModelId && (
              <TabsTrigger value="drift" className="flex-1">Drift Detection</TabsTrigger>
            )}
            {selectedModelId && (
              <TabsTrigger value="monitoring" className="flex-1">Monitoring</TabsTrigger>
            )}
            {selectedModelId && (
              <TabsTrigger value="deployment" className="flex-1">Deployment</TabsTrigger>
            )}
            <TabsTrigger value="registry" className="flex-1">Registry</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-6">
            <ModelList
              onPredict={handleOpenPredictionDialog}
              onExplain={handleOpenExplanationDialog}
              onSelect={(modelId, modelType) => {
                setSelectedModelId(modelId);
                setSelectedModelType(modelType as any);
              }}
            />
          </TabsContent>

          {selectedModelId && (
            <TabsContent value="performance" className="mt-6">
              <ModelPerformance
                modelId={selectedModelId}
                modelType={selectedModelType}
              />
            </TabsContent>
          )}

          {selectedModelId && (
            <TabsContent value="drift" className="mt-6">
              <ModelDrift
                modelId={selectedModelId}
                modelType={selectedModelType}
              />
            </TabsContent>
          )}

          {selectedModelId && (
            <TabsContent value="monitoring" className="mt-6">
              <ModelMonitoring
                modelId={selectedModelId}
                modelType={selectedModelType}
              />
            </TabsContent>
          )}

          {selectedModelId && (
            <TabsContent value="deployment" className="mt-6">
              <ModelDeployment
                modelId={selectedModelId}
                modelType={selectedModelType}
              />
            </TabsContent>
          )}

          <TabsContent value="registry" className="mt-6">
            <ModelRegistry />
          </TabsContent>
        </Tabs>

        {/* Prediction Dialog */}
        <Dialog open={isPredictionDialogOpen} onOpenChange={setIsPredictionDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Make Prediction</DialogTitle>
              <DialogDescription>
                Enter feature values to make a prediction using the selected model.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {getFeatureInputs()}

              {predictionResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction Result</CardTitle>
                    <CardDescription>
                      Confidence: {(predictionResult.confidence * 100).toFixed(1)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Prediction</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-lg py-2 px-3">
                            {typeof predictionResult.prediction === 'number'
                              ? predictionResult.prediction.toFixed(2)
                              : String(predictionResult.prediction)}
                          </Badge>
                        </div>
                      </div>

                      {predictionResult.explanations && predictionResult.explanations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Factors</h4>
                          <ul className="space-y-2">
                            {predictionResult.explanations.slice(0, 3).map((exp: any, i: number) => (
                              <li key={i} className="flex justify-between items-center">
                                <span>{exp.feature}</span>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={Math.abs(exp.contribution) * 100}
                                    className="w-24 h-2"
                                  />
                                  <span className="text-xs w-12 text-right">
                                    {(exp.contribution * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPredictionDialogOpen(false)}>
                Cancel
              </Button>
              {predictionResult ? (
                <Button onClick={handleGenerateExplanation} disabled={generateExplanation.isPending}>
                  {generateExplanation.isPending ? 'Generating...' : 'Explain Prediction'}
                </Button>
              ) : (
                <Button onClick={handleMakePrediction} disabled={makePrediction.isPending}>
                  {makePrediction.isPending ? 'Predicting...' : 'Make Prediction'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Explanation Dialog */}
        <Dialog open={isExplanationDialogOpen} onOpenChange={setIsExplanationDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prediction Explanation</DialogTitle>
              <DialogDescription>
                Detailed explanation of the prediction results.
              </DialogDescription>
            </DialogHeader>

            {explanationResult ? (
              <div className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{explanationResult.summary}</p>
                  </CardContent>
                </Card>

                <Tabs defaultValue="factors">
                  <TabsList className="w-full">
                    <TabsTrigger value="factors" className="flex-1">Key Factors</TabsTrigger>
                    <TabsTrigger value="details" className="flex-1">Detailed Explanation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="factors" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <ul className="space-y-4">
                          {explanationResult.keyFactors.map((factor: any, i: number) => (
                            <li key={i} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  factor.impact === 'positive' ? 'default' :
                                  factor.impact === 'negative' ? 'destructive' : 'outline'
                                }>
                                  {factor.impact}
                                </Badge>
                                <span className="font-medium">{factor.factor}</span>
                              </div>
                              <p className="text-sm text-muted-foreground pl-6">
                                {factor.description}
                              </p>
                              <Separator className="mt-2" />
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="whitespace-pre-line">
                          {explanationResult.detailedExplanation}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Loading explanation...
                </p>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setIsExplanationDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
