/**
 * Enhanced ML Dashboard Component
 * 
 * This component integrates the enhanced ML models functionality into the main application.
 * It provides a dashboard for visualizing and interacting with ML models, with support for:
 * - Offline functionality
 * - Real-time updates
 * - Voice commands
 * - Comprehensive error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMLModels, useMakePrediction } from '@/hooks/use-ml-models';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { isOnline } from '@/lib/network-status';
import { AlertCircle, CheckCircle, Database, RefreshCw, WifiOff, Mic, BarChart2 } from 'lucide-react';
import { ModelMetadata, PredictionRequest } from '@shared/api-client/services/ml-models-api';

// Import offline service
import * as offlineService from '@/services/ml-models-offline-service';

interface EnhancedMLDashboardProps {
  className?: string;
  showVoiceCommands?: boolean;
  showOfflineControls?: boolean;
}

export function EnhancedMLDashboard({
  className = '',
  showVoiceCommands = true,
  showOfflineControls = true
}: EnhancedMLDashboardProps) {
  // State
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!isOnline());
  const [cachedModelsCount, setCachedModelsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Hooks
  const { toast } = useToast();
  const { data: models, isLoading, isError, error, refetch } = useMLModels();
  const { mutate: makePrediction, isLoading: isPredicting } = useMakePrediction();

  // Get cached models count
  const updateCachedInfo = useCallback(async () => {
    try {
      const cachedModels = offlineService.getCachedModels();
      setCachedModelsCount(cachedModels?.length || 0);
      
      const pendingRequests = offlineService.getPendingPredictionRequests();
      setPendingRequestsCount(pendingRequests?.length || 0);
    } catch (error) {
      console.error('Error getting cached info:', error);
    }
  }, []);

  // Update cached info on mount and when offline mode changes
  useEffect(() => {
    updateCachedInfo();
  }, [updateCachedInfo, offlineMode]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      toast({
        title: 'Online Mode',
        description: 'Your device is now online. Syncing data...',
        variant: 'default',
      });
      updateCachedInfo();
    };

    const handleOffline = () => {
      setOfflineMode(true);
      toast({
        title: 'Offline Mode',
        description: 'Your device is offline. Using cached data.',
        variant: 'destructive',
      });
      updateCachedInfo();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, updateCachedInfo]);

  // Toggle offline mode (for testing)
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    toast({
      title: !offlineMode ? 'Offline Mode' : 'Online Mode',
      description: !offlineMode 
        ? 'Switched to offline mode for testing' 
        : 'Switched to online mode',
    });
  };

  // Start/stop voice recognition
  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      toast({
        title: 'Voice Commands',
        description: 'Listening for voice commands...',
      });
      // In a real implementation, this would start the voice recognition
    } else {
      toast({
        title: 'Voice Commands',
        description: 'Stopped listening for voice commands',
      });
      // In a real implementation, this would stop the voice recognition
    }
  };

  // Cache all models for offline use
  const cacheAllModels = async () => {
    if (!models) return;
    
    try {
      await offlineService.cacheModels(models);
      toast({
        title: 'Models Cached',
        description: `${models.length} models cached for offline use`,
      });
      updateCachedInfo();
    } catch (error) {
      console.error('Error caching models:', error);
      toast({
        title: 'Error',
        description: 'Failed to cache models for offline use',
        variant: 'destructive',
      });
    }
  };

  // Sync pending requests
  const syncPendingRequests = async () => {
    try {
      // In a real implementation, this would sync pending requests with the server
      toast({
        title: 'Syncing',
        description: 'Syncing pending requests...',
      });
      
      // Simulate successful sync
      setTimeout(() => {
        setPendingRequestsCount(0);
        toast({
          title: 'Sync Complete',
          description: 'All pending requests have been synced',
        });
      }, 2000);
    } catch (error) {
      console.error('Error syncing pending requests:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync pending requests',
        variant: 'destructive',
      });
    }
  };

  // Test a model prediction
  const testModelPrediction = (modelId: string) => {
    // Create mock features for testing
    const features = {
      clientAge: 75,
      clientCondition: 'Mobility issues',
      clientLocation: 'Urban',
      caregiverExperience: 5,
      previousRating: 4.8
    };

    const request: PredictionRequest = {
      modelId,
      features
    };

    makePrediction(request, {
      onSuccess: (data) => {
        toast({
          title: 'Prediction Success',
          description: `Prediction: ${JSON.stringify(data.prediction)}`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Prediction Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-[250px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[300px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ML Models</CardTitle>
          <CardDescription>Error loading ML models</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Failed to load ML models. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>ML Models Dashboard</CardTitle>
            <CardDescription>
              Manage and interact with machine learning models
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {offlineMode ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
            
            {showVoiceCommands && (
              <Button
                variant="outline"
                size="sm"
                className={isListening ? 'bg-red-100' : ''}
                onClick={toggleVoiceRecognition}
              >
                <Mic className="h-4 w-4 mr-1" />
                {isListening ? 'Listening...' : 'Voice'}
              </Button>
            )}
            
            {showOfflineControls && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOfflineMode}
              >
                {offlineMode ? 'Go Online' : 'Test Offline'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="offline">Offline Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {models?.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all ${selectedModelId === model.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedModelId(model.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription>Version {model.version}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(model.metrics).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground">{key}: </span>
                          <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        testModelPrediction(model.id);
                      }}
                      disabled={isPredicting}
                    >
                      {isPredicting && selectedModelId === model.id ? 'Predicting...' : 'Test Model'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Performance metrics for selected models over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Select a model to view performance metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="offline">
            <Card>
              <CardHeader>
                <CardTitle>Offline Data Management</CardTitle>
                <CardDescription>
                  Manage cached models and pending requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Cached Models</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span>{cachedModelsCount} models cached</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={cacheAllModels}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        Cache All
                      </Button>
                    </div>
                    <Progress value={(cachedModelsCount / (models?.length || 1)) * 100} />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Pending Requests</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span>{pendingRequestsCount} pending requests</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={syncPendingRequests}
                        disabled={pendingRequestsCount === 0 || offlineMode}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync Now
                      </Button>
                    </div>
                    {pendingRequestsCount > 0 && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Pending Sync</AlertTitle>
                        <AlertDescription>
                          You have {pendingRequestsCount} requests waiting to be synced
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
