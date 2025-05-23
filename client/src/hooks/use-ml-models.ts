/**
 * ML Models API hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
  ModelMetadata,
  TrainingConfig,
  PredictionRequest,
  PredictionResult,
  ExplanationRequest,
  ExplanationResult,
  ModelFamily,
  ModelVersion,
  DriftDetectionResult,
  RetrainingCheckResult,
  ModelPerformanceRecord,
  ModelDeployment,
  ModelMonitoringData,
  ModelAlert
} from '@shared/api-client/services/ml-models-api';

// Query keys
export const mlModelKeys = {
  all: ['ml-models'] as const,
  lists: () => [...mlModelKeys.all, 'list'] as const,
  list: (filters: string) => [...mlModelKeys.lists(), { filters }] as const,
  details: () => [...mlModelKeys.all, 'detail'] as const,
  detail: (id: string) => [...mlModelKeys.details(), id] as const,
  performance: (id: string) => [...mlModelKeys.detail(id), 'performance'] as const,
  retrainingCheck: (id: string) => [...mlModelKeys.detail(id), 'retraining-check'] as const,
  registry: {
    all: () => [...mlModelKeys.all, 'registry'] as const,
    families: () => [...mlModelKeys.registry.all(), 'families'] as const,
    family: (name: string) => [...mlModelKeys.registry.families(), name] as const,
  },
  monitoring: {
    all: () => [...mlModelKeys.all, 'monitoring'] as const,
    drift: (id: string) => [...mlModelKeys.monitoring.all(), 'drift', id] as const,
    data: (id: string) => [...mlModelKeys.monitoring.all(), 'data', id] as const,
    alerts: (id: string) => [...mlModelKeys.monitoring.all(), 'alerts', id] as const
  },
  deployments: {
    all: () => [...mlModelKeys.all, 'deployments'] as const,
    list: (id: string) => [...mlModelKeys.deployments.all(), id] as const
  }
};

/**
 * Hook to fetch all ML models with offline support
 */
export function useMLModels() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: mlModelKeys.lists(),
    queryFn: async () => {
      try {
        // Try to fetch from API
        const { data, error } = await api.mlModels.getModels();
        if (error) throw error;

        // Cache the data for offline use
        import('@/services/ml-models-offline-service').then(({ cacheModels }) => {
          cacheModels(data);
        });

        return data;
      } catch (error) {
        // If offline or API error, try to get cached data
        const offlineService = await import('@/services/ml-models-offline-service');
        const cachedModels = offlineService.getCachedModels();

        if (cachedModels) {
          toast({
            title: 'Offline Mode',
            description: 'Using cached ML models data',
          });
          return cachedModels;
        }

        // If no cached data, try mock data
        const mockService = await import('@/services/ml-models-mock-service');
        const mockModels = mockService.getMockModels();

        toast({
          title: 'Offline Mode',
          description: 'Using mock ML models data',
        });

        return mockModels;
      }
    },
    // Refetch when online status changes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook to fetch a specific ML model by ID
 */
export function useMLModel(id: string) {
  return useQuery({
    queryKey: mlModelKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModel(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to train a recommendation model
 */
export function useTrainRecommendationModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: TrainingConfig) => {
      const { data, error } = await api.mlModels.trainRecommendationModel(config);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Recommendation model trained successfully',
      });
      queryClient.invalidateQueries({ queryKey: mlModelKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to train recommendation model: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to train a time series model
 */
export function useTrainTimeSeriesModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: TrainingConfig) => {
      const { data, error } = await api.mlModels.trainTimeSeriesModel(config);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Time series model trained successfully',
      });
      queryClient.invalidateQueries({ queryKey: mlModelKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to train time series model: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to train a satisfaction prediction model
 */
export function useTrainSatisfactionModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: TrainingConfig) => {
      const { data, error } = await api.mlModels.trainSatisfactionModel(config);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Satisfaction prediction model trained successfully',
      });
      queryClient.invalidateQueries({ queryKey: mlModelKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to train satisfaction model: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to make a prediction using a trained model with offline support
 */
export function useMakePrediction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PredictionRequest): Promise<PredictionResult> => {
      try {
        // Try to make prediction via API
        const { data, error } = await api.mlModels.predict(request);
        if (error) throw error;

        // Cache the result for offline use
        import('@/services/ml-models-offline-service').then(({ cachePredictionResult }) => {
          cachePredictionResult(request.modelId, request.features, data);
        });

        return data;
      } catch (error) {
        // Check if we're offline
        const isOffline = !(await import('@/lib/network-status')).isOnline();

        if (isOffline) {
          // Queue the request for later processing
          const offlineService = await import('@/services/ml-models-offline-service');
          offlineService.queuePredictionRequest(request);

          // Check for cached result
          const cachedResult = offlineService.getCachedPredictionResult(
            request.modelId,
            request.features
          );

          if (cachedResult) {
            toast({
              title: 'Offline Mode',
              description: 'Using cached prediction result',
            });
            return cachedResult;
          }

          // If no cached result, use mock data
          const mockService = await import('@/services/ml-models-mock-service');
          const mockResult = mockService.makeMockPrediction(request);

          toast({
            title: 'Offline Mode',
            description: 'Using mock prediction data. This will be synced when online.',
          });

          return mockResult;
        }

        // If online but still error, throw it
        throw error;
      }
    },
    onSuccess: () => {
      // Process any pending predictions when we successfully make a prediction
      // (indicates we're online)
      import('@/services/ml-models-offline-service').then(({ processPendingPredictions }) => {
        processPendingPredictions();
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to make prediction: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to generate an explanation for a prediction
 */
export function useGenerateExplanation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: ExplanationRequest): Promise<ExplanationResult> => {
      const { data, error } = await api.mlModels.explainPrediction(request);
      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to generate explanation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to detect data drift for a model
 */
export function useDetectDrift() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ modelId, features }: { modelId: string; features: Record<string, any>[] }): Promise<DriftDetectionResult> => {
      const { data, error } = await api.mlModels.detectDrift(modelId, features);
      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to detect drift: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to check if a model needs retraining
 */
export function useCheckRetrainingNeeded(modelId: string) {
  return useQuery({
    queryKey: mlModelKeys.retrainingCheck(modelId),
    queryFn: async () => {
      const { data, error } = await api.mlModels.checkRetrainingNeeded(modelId);
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });
}

/**
 * Hook to get model performance history
 */
export function useModelPerformance(modelId: string) {
  return useQuery({
    queryKey: mlModelKeys.performance(modelId),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModelPerformance(modelId);
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });
}

/**
 * Hook to get all model families from registry
 */
export function useModelFamilies() {
  return useQuery({
    queryKey: mlModelKeys.registry.families(),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModelFamilies();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get a specific model family from registry
 */
export function useModelFamily(name: string) {
  return useQuery({
    queryKey: mlModelKeys.registry.family(name),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModelFamily(name);
      if (error) throw error;
      return data;
    },
    enabled: !!name,
  });
}

/**
 * Hook to promote a model to a new status
 */
export function usePromoteModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      modelName,
      version,
      status
    }: {
      modelName: string;
      version: string;
      status: 'development' | 'staging' | 'production' | 'archived'
    }): Promise<ModelVersion> => {
      const { data, error } = await api.mlModels.promoteModel(modelName, version, status);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Model ${variables.modelName} version ${variables.version} promoted to ${variables.status}`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mlModelKeys.registry.families() });
      queryClient.invalidateQueries({ queryKey: mlModelKeys.registry.family(variables.modelName) });
      queryClient.invalidateQueries({ queryKey: mlModelKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to promote model: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get model deployments
 */
export function useModelDeployments(modelId?: string) {
  return useQuery({
    queryKey: modelId ? mlModelKeys.deployments.list(modelId) : mlModelKeys.deployments.all(),
    queryFn: async () => {
      const { data, error } = modelId
        ? await api.mlModels.getModelDeployments(modelId)
        : await api.mlModels.getAllDeployments();
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
}

/**
 * Hook to deploy a model
 */
export function useDeployModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      modelId,
      environment,
      notes
    }: {
      modelId: string;
      environment: 'staging' | 'production';
      notes?: string;
    }): Promise<ModelDeployment> => {
      const { data, error } = await api.mlModels.deployModel(modelId, environment, notes);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Model deployed to ${variables.environment} environment`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mlModelKeys.deployments.all() });
      if (variables.modelId) {
        queryClient.invalidateQueries({ queryKey: mlModelKeys.deployments.list(variables.modelId) });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to deploy model: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get model monitoring data
 */
export function useModelMonitoring(modelId: string) {
  return useQuery({
    queryKey: mlModelKeys.monitoring.data(modelId),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModelMonitoring(modelId);
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });
}

/**
 * Hook to get model alerts
 */
export function useModelAlerts(modelId: string) {
  return useQuery({
    queryKey: mlModelKeys.monitoring.alerts(modelId),
    queryFn: async () => {
      const { data, error } = await api.mlModels.getModelAlerts(modelId);
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });
}
