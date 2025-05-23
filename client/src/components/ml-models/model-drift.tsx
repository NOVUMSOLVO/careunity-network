/**
 * Model Drift Component
 * 
 * Displays drift detection results for a machine learning model
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDetectDrift, useCheckRetrainingNeeded } from '@/hooks/use-ml-models';
import { DriftDetectionResult } from '@shared/api-client/services/ml-models-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ModelDriftProps {
  modelId: string;
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
}

export function ModelDrift({ modelId, modelType }: ModelDriftProps) {
  const [driftResult, setDriftResult] = useState<DriftDetectionResult | null>(null);
  const [testData, setTestData] = useState<string>('[]');
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  
  const detectDrift = useDetectDrift();
  const { 
    data: retrainingCheck, 
    isLoading: isCheckingRetraining, 
    isError: isRetrainingError,
    error: retrainingError,
    refetch: recheckRetraining
  } = useCheckRetrainingNeeded(modelId);
  
  // Handle drift detection
  const handleDetectDrift = async () => {
    try {
      // Parse test data
      const features = JSON.parse(testData);
      
      // Detect drift
      const result = await detectDrift.mutateAsync({ modelId, features });
      setDriftResult(result);
    } catch (error) {
      console.error('Error detecting drift:', error);
    }
  };
  
  // Handle test data change
  const handleTestDataChange = (value: string) => {
    setTestData(value);
    
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Drift Detection</CardTitle>
          <CardDescription>
            Detect data drift and determine if model retraining is needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Test Data (JSON format)</h4>
              <Textarea
                value={testData}
                onChange={(e) => handleTestDataChange(e.target.value)}
                rows={5}
                placeholder='[{"feature1": 100, "feature2": "value"}, ...]'
                className={!isValidJson ? 'border-red-500' : ''}
              />
              {!isValidJson && (
                <p className="text-sm text-red-500 mt-1">
                  Invalid JSON format
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleDetectDrift} 
              disabled={detectDrift.isPending || !isValidJson}
              className="w-full"
            >
              {detectDrift.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Detecting Drift...
                </>
              ) : (
                'Detect Drift'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {driftResult && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Drift Detection Results</CardTitle>
                <CardDescription>
                  Analysis of data drift between baseline and current data
                </CardDescription>
              </div>
              <Badge 
                variant={driftResult.hasDrift ? 'destructive' : 'default'}
                className="text-md py-1 px-3"
              >
                {driftResult.hasDrift ? 'Drift Detected' : 'No Drift'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Overall Drift Score</h4>
                <div className="flex items-center gap-4">
                  <Progress 
                    value={driftResult.driftScore * 100} 
                    className="h-3"
                  />
                  <span className="text-sm font-medium">
                    {(driftResult.driftScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {driftResult.driftingFeatures.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Drifting Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {driftResult.driftingFeatures.map(feature => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Feature Details</TabsTrigger>
                  <TabsTrigger value="distributions" className="flex-1">Distributions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    {driftResult.details.map((detail, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{detail.featureName}</h5>
                          <Badge 
                            variant={detail.driftMetric > detail.threshold ? 'destructive' : 'outline'}
                          >
                            {(detail.driftMetric * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Baseline:</span> 
                              <span className="ml-1">
                                Mean: {detail.baselineDistribution.mean.toFixed(2)}, 
                                Std: {detail.baselineDistribution.std.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Current:</span> 
                              <span className="ml-1">
                                Mean: {detail.currentDistribution.mean.toFixed(2)}, 
                                Std: {detail.currentDistribution.std.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="distributions" className="mt-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Distribution Visualization</AlertTitle>
                    <AlertDescription>
                      Distribution visualization is not available in this version.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Retraining Check</CardTitle>
          <CardDescription>
            Automatically check if the model needs retraining
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingRetraining ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isRetrainingError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to check retraining status: {retrainingError instanceof Error ? retrainingError.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : retrainingCheck ? (
            <div className="space-y-4">
              <Alert variant={retrainingCheck.needsRetraining ? 'destructive' : 'default'}>
                {retrainingCheck.needsRetraining ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {retrainingCheck.needsRetraining ? 'Retraining Needed' : 'No Retraining Needed'}
                </AlertTitle>
                <AlertDescription>
                  {retrainingCheck.reason}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>
                No retraining check data available.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => recheckRetraining()}
            disabled={isCheckingRetraining}
            className="w-full"
          >
            {isCheckingRetraining ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recheck
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
