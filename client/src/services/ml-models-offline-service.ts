/**
 * ML Models Offline Service
 * 
 * Provides offline support for ML models by caching data locally
 * and synchronizing when online connectivity is restored.
 */

import { ModelMetadata, PredictionRequest, PredictionResult } from '@shared/api-client/services/ml-models-api';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/network-status';

// Storage keys
const STORAGE_KEYS = {
  MODELS: 'careunity_ml_models',
  PENDING_PREDICTIONS: 'careunity_pending_predictions',
  PREDICTION_RESULTS: 'careunity_prediction_results',
};

/**
 * Cache ML models data locally
 */
export async function cacheModels(models: ModelMetadata[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
    console.log('ML models cached successfully');
  } catch (error) {
    console.error('Failed to cache ML models:', error);
  }
}

/**
 * Get cached ML models
 */
export function getCachedModels(): ModelMetadata[] | null {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEYS.MODELS);
    if (!cachedData) return null;
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Failed to retrieve cached ML models:', error);
    return null;
  }
}

/**
 * Queue a prediction request for later processing when online
 */
export function queuePredictionRequest(request: PredictionRequest): void {
  try {
    const pendingRequests = getPendingPredictionRequests();
    pendingRequests.push({
      id: `prediction_${Date.now()}`,
      request,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.PENDING_PREDICTIONS, JSON.stringify(pendingRequests));
  } catch (error) {
    console.error('Failed to queue prediction request:', error);
  }
}

/**
 * Get pending prediction requests
 */
export function getPendingPredictionRequests(): Array<{
  id: string;
  request: PredictionRequest;
  timestamp: string;
}> {
  try {
    const pendingRequests = localStorage.getItem(STORAGE_KEYS.PENDING_PREDICTIONS);
    if (!pendingRequests) return [];
    return JSON.parse(pendingRequests);
  } catch (error) {
    console.error('Failed to retrieve pending prediction requests:', error);
    return [];
  }
}

/**
 * Cache prediction result
 */
export function cachePredictionResult(modelId: string, features: Record<string, any>, result: PredictionResult): void {
  try {
    const cachedResults = getCachedPredictionResults();
    cachedResults[`${modelId}_${JSON.stringify(features)}`] = {
      result,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PREDICTION_RESULTS, JSON.stringify(cachedResults));
  } catch (error) {
    console.error('Failed to cache prediction result:', error);
  }
}

/**
 * Get cached prediction results
 */
export function getCachedPredictionResults(): Record<string, {
  result: PredictionResult;
  timestamp: string;
}> {
  try {
    const cachedResults = localStorage.getItem(STORAGE_KEYS.PREDICTION_RESULTS);
    if (!cachedResults) return {};
    return JSON.parse(cachedResults);
  } catch (error) {
    console.error('Failed to retrieve cached prediction results:', error);
    return {};
  }
}

/**
 * Get cached prediction result for a specific model and features
 */
export function getCachedPredictionResult(modelId: string, features: Record<string, any>): PredictionResult | null {
  try {
    const cachedResults = getCachedPredictionResults();
    const key = `${modelId}_${JSON.stringify(features)}`;
    if (!cachedResults[key]) return null;
    return cachedResults[key].result;
  } catch (error) {
    console.error('Failed to retrieve cached prediction result:', error);
    return null;
  }
}

/**
 * Process pending prediction requests when online
 */
export async function processPendingPredictions(): Promise<void> {
  if (!isOnline()) return;

  const pendingRequests = getPendingPredictionRequests();
  if (pendingRequests.length === 0) return;

  const processedIds: string[] = [];

  for (const { id, request } of pendingRequests) {
    try {
      const { data, error } = await api.mlModels.predict(request);
      if (error) throw error;
      
      // Cache the result
      cachePredictionResult(request.modelId, request.features, data);
      processedIds.push(id);
    } catch (error) {
      console.error(`Failed to process pending prediction request ${id}:`, error);
    }
  }

  // Remove processed requests
  if (processedIds.length > 0) {
    const remainingRequests = pendingRequests.filter(({ id }) => !processedIds.includes(id));
    localStorage.setItem(STORAGE_KEYS.PENDING_PREDICTIONS, JSON.stringify(remainingRequests));
  }
}

/**
 * Clear all cached ML model data
 */
export function clearCachedMLModelData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MODELS);
    localStorage.removeItem(STORAGE_KEYS.PENDING_PREDICTIONS);
    localStorage.removeItem(STORAGE_KEYS.PREDICTION_RESULTS);
    console.log('Cleared all cached ML model data');
  } catch (error) {
    console.error('Failed to clear cached ML model data:', error);
  }
}
