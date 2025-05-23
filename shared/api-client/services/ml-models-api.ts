/**
 * ML Models API service
 * Provides methods for interacting with the ML models API endpoints
 */

import { ApiClient } from '../core';
import { ApiResponse } from '../../types/api';

// Types
export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
    mae?: number;
  };
  featureImportance?: Record<string, number>;
}

export interface ModelVersion {
  id: string;
  modelName: string;
  version: string;
  createdAt: Date;
  createdBy?: string;
  status: 'development' | 'staging' | 'production' | 'archived';
  description?: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
    mae?: number;
  };
  featureImportance?: Record<string, number>;
  hyperparameters?: Record<string, any>;
  tags?: string[];
  modelPath: string;
}

export interface ModelFamily {
  name: string;
  description?: string;
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
  versions: ModelVersion[];
  currentProductionVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriftDetectionResult {
  hasDrift: boolean;
  driftScore: number;
  driftingFeatures: string[];
  details: {
    featureName: string;
    baselineDistribution: any;
    currentDistribution: any;
    driftMetric: number;
    threshold: number;
  }[];
}

export interface RetrainingCheckResult {
  needsRetraining: boolean;
  reason: string;
}

export interface ModelPerformanceRecord {
  date: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
    mae?: number;
  };
  sampleSize: number;
}

export interface TrainingConfig {
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
  hyperparameters?: Record<string, any>;
  trainingRatio: number;
  validationRatio: number;
  testRatio: number;
  randomSeed?: number;
}

export interface PredictionRequest {
  modelId: string;
  features: Record<string, any>;
}

export interface PredictionResult {
  prediction: number | string | boolean;
  confidence: number;
  explanations: {
    feature: string;
    importance: number;
    contribution: number;
  }[];
}

export interface ExplanationRequest {
  modelType: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
  prediction: number | string | boolean;
  confidence: number;
  featureImportance: {
    feature: string;
    importance: number;
    contribution: number;
  }[];
  context?: Record<string, any>;
}

export interface ExplanationResult {
  summary: string;
  detailedExplanation: string;
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  visualData?: {
    type: 'bar' | 'pie' | 'line';
    data: any;
  };
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  environment: 'staging' | 'production';
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  deployedBy?: string;
  notes?: string;
  version: string;
}

export interface ModelMonitoringData {
  health: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    trend: {
      date: string;
      errorRate: number;
      responseTime: number;
    }[];
  };
  dataQuality: {
    overallScore: number;
    metrics: {
      name: string;
      score: number;
    }[];
    distribution: {
      feature: string;
      training: number;
      current: number;
    }[];
  };
  predictions: {
    accuracy: number;
    volume: number;
    confidence: number;
    trend: {
      date: string;
      accuracy: number;
      confidence: number;
    }[];
  };
}

export interface ModelAlert {
  id: string;
  modelId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  type: 'drift' | 'performance' | 'error' | 'system';
}

/**
 * ML Models API Service
 */
export class MLModelsApiService {
  private client: ApiClient;
  private baseUrl: string;

  constructor(client: ApiClient) {
    this.client = client;
    this.baseUrl = '/api/v2/ml-models';
  }

  /**
   * Get all available ML models
   */
  async getModels(): Promise<ApiResponse<ModelMetadata[]>> {
    return this.client.get<ModelMetadata[]>(this.baseUrl);
  }

  /**
   * Get a specific ML model by ID
   */
  async getModel(modelId: string): Promise<ApiResponse<ModelMetadata>> {
    return this.client.get<ModelMetadata>(`${this.baseUrl}/${modelId}`);
  }

  /**
   * Train a new recommendation model
   */
  async trainRecommendationModel(config: TrainingConfig): Promise<ApiResponse<ModelMetadata>> {
    return this.client.post<ModelMetadata>(`${this.baseUrl}/train/recommendation`, config);
  }

  /**
   * Train a new time series model
   */
  async trainTimeSeriesModel(config: TrainingConfig): Promise<ApiResponse<ModelMetadata>> {
    return this.client.post<ModelMetadata>(`${this.baseUrl}/train/timeseries`, config);
  }

  /**
   * Train a new satisfaction prediction model
   */
  async trainSatisfactionModel(config: TrainingConfig): Promise<ApiResponse<ModelMetadata>> {
    return this.client.post<ModelMetadata>(`${this.baseUrl}/train/satisfaction`, config);
  }

  /**
   * Make a prediction using a trained model
   */
  async predict(request: PredictionRequest): Promise<ApiResponse<PredictionResult>> {
    return this.client.post<PredictionResult>(`${this.baseUrl}/predict`, request);
  }

  /**
   * Generate explanation for a prediction
   */
  async explainPrediction(request: ExplanationRequest): Promise<ApiResponse<ExplanationResult>> {
    return this.client.post<ExplanationResult>(`${this.baseUrl}/explain`, request);
  }

  /**
   * Detect data drift for a model
   */
  async detectDrift(modelId: string, features: Record<string, any>[]): Promise<ApiResponse<DriftDetectionResult>> {
    return this.client.post<DriftDetectionResult>(`${this.baseUrl}/detect-drift`, {
      modelId,
      features
    });
  }

  /**
   * Check if a model needs retraining
   */
  async checkRetrainingNeeded(modelId: string): Promise<ApiResponse<RetrainingCheckResult>> {
    return this.client.get<RetrainingCheckResult>(`${this.baseUrl}/${modelId}/check-retraining`);
  }

  /**
   * Get model performance history
   */
  async getModelPerformance(modelId: string): Promise<ApiResponse<ModelPerformanceRecord[]>> {
    return this.client.get<ModelPerformanceRecord[]>(`${this.baseUrl}/${modelId}/performance`);
  }

  /**
   * Get all model families from registry
   */
  async getModelFamilies(): Promise<ApiResponse<ModelFamily[]>> {
    return this.client.get<ModelFamily[]>(`${this.baseUrl}/registry`);
  }

  /**
   * Get a specific model family from registry
   */
  async getModelFamily(name: string): Promise<ApiResponse<ModelFamily>> {
    return this.client.get<ModelFamily>(`${this.baseUrl}/registry/${name}`);
  }

  /**
   * Promote a model to a new status
   */
  async promoteModel(
    modelName: string,
    version: string,
    status: 'development' | 'staging' | 'production' | 'archived'
  ): Promise<ApiResponse<ModelVersion>> {
    return this.client.post<ModelVersion>(`${this.baseUrl}/registry/promote`, {
      modelName,
      version,
      status
    });
  }

  /**
   * Get all model deployments
   */
  async getAllDeployments(): Promise<ApiResponse<ModelDeployment[]>> {
    return this.client.get<ModelDeployment[]>(`${this.baseUrl}/deployments`);
  }

  /**
   * Get deployments for a specific model
   */
  async getModelDeployments(modelId: string): Promise<ApiResponse<ModelDeployment[]>> {
    return this.client.get<ModelDeployment[]>(`${this.baseUrl}/${modelId}/deployments`);
  }

  /**
   * Deploy a model to an environment
   */
  async deployModel(
    modelId: string,
    environment: 'staging' | 'production',
    notes?: string
  ): Promise<ApiResponse<ModelDeployment>> {
    return this.client.post<ModelDeployment>(`${this.baseUrl}/${modelId}/deploy`, {
      environment,
      notes
    });
  }

  /**
   * Get monitoring data for a model
   */
  async getModelMonitoring(modelId: string): Promise<ApiResponse<ModelMonitoringData>> {
    return this.client.get<ModelMonitoringData>(`${this.baseUrl}/${modelId}/monitoring`);
  }

  /**
   * Get alerts for a model
   */
  async getModelAlerts(modelId: string): Promise<ApiResponse<{ activeAlerts: number, alerts: ModelAlert[] }>> {
    return this.client.get<{ activeAlerts: number, alerts: ModelAlert[] }>(`${this.baseUrl}/${modelId}/alerts`);
  }
}
