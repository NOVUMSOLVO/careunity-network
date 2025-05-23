/**
 * ML Models Mock Service
 * 
 * Provides mock data for ML models during development
 * or when offline.
 */

import {
  ModelMetadata,
  PredictionRequest,
  PredictionResult,
  ExplanationRequest,
  ExplanationResult,
  DriftDetectionResult,
  ModelPerformanceRecord,
  ModelDeployment,
  ModelMonitoringData,
  ModelAlert,
  ModelFamily,
  ModelVersion
} from '@shared/api-client/services/ml-models-api';

// Mock models data
export const mockModels: ModelMetadata[] = [
  {
    id: 'recommendation-1',
    name: 'Caregiver Recommendation',
    version: '1.0',
    createdAt: new Date(2023, 5, 15).toISOString(),
    metrics: {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91
    },
    featureImportance: {
      skillMatch: 0.35,
      locationMatch: 0.25,
      continuityMatch: 0.20,
      availabilityMatch: 0.15,
      experienceLevel: 0.05
    }
  },
  {
    id: 'timeseries-1',
    name: 'Visit Prediction',
    version: '1.2',
    createdAt: new Date(2023, 7, 20).toISOString(),
    metrics: {
      rmse: 1.2,
      mae: 0.9
    },
    featureImportance: {
      previousVisitDuration: 0.40,
      timeOfDay: 0.25,
      dayOfWeek: 0.20,
      serviceUserComplexity: 0.15
    }
  },
  {
    id: 'satisfaction-1',
    name: 'Satisfaction Prediction',
    version: '0.8',
    createdAt: new Date(2023, 9, 5).toISOString(),
    metrics: {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85
    },
    featureImportance: {
      visitDuration: 0.30,
      caregiverConsistency: 0.25,
      taskCompletion: 0.20,
      communicationQuality: 0.15,
      responseTime: 0.10
    }
  },
  {
    id: 'workload-1',
    name: 'Caregiver Workload',
    version: '0.5',
    createdAt: new Date(2023, 10, 10).toISOString(),
    metrics: {
      rmse: 1.5,
      mae: 1.1
    },
    featureImportance: {
      numberOfVisits: 0.35,
      visitComplexity: 0.30,
      travelTime: 0.20,
      experienceLevel: 0.15
    }
  }
];

// Mock deployments data
export const mockDeployments: ModelDeployment[] = [
  {
    id: 'deploy-1',
    modelId: 'recommendation-1',
    environment: 'staging',
    status: 'success',
    timestamp: new Date(2023, 6, 1).toISOString(),
    version: '1.0',
    notes: 'Initial staging deployment'
  },
  {
    id: 'deploy-2',
    modelId: 'recommendation-1',
    environment: 'production',
    status: 'success',
    timestamp: new Date(2023, 6, 15).toISOString(),
    version: '1.0',
    notes: 'Production release after successful staging tests'
  },
  {
    id: 'deploy-3',
    modelId: 'timeseries-1',
    environment: 'staging',
    status: 'success',
    timestamp: new Date(2023, 8, 10).toISOString(),
    version: '1.2',
    notes: 'Updated model with improved accuracy'
  }
];

// Mock monitoring data
export const mockMonitoringData: ModelMonitoringData = {
  health: {
    uptime: 99.8,
    responseTime: 120,
    errorRate: 0.2,
    trend: [
      { date: '2023-06-01', errorRate: 0.3, responseTime: 150 },
      { date: '2023-07-01', errorRate: 0.2, responseTime: 130 },
      { date: '2023-08-01', errorRate: 0.2, responseTime: 120 }
    ]
  },
  dataQuality: {
    overallScore: 92,
    metrics: [
      { name: 'Completeness', score: 95 },
      { name: 'Consistency', score: 90 },
      { name: 'Accuracy', score: 88 }
    ],
    distribution: [
      { feature: 'age', training: 35, current: 38 },
      { feature: 'gender', training: 50, current: 48 },
      { feature: 'location', training: 25, current: 28 }
    ]
  },
  predictions: {
    accuracy: 92,
    volume: 1250,
    confidence: 88,
    trend: [
      { date: '2023-06-01', accuracy: 90, confidence: 85 },
      { date: '2023-07-01', accuracy: 91, confidence: 86 },
      { date: '2023-08-01', accuracy: 92, confidence: 88 }
    ]
  }
};

// Mock alerts
export const mockAlerts: ModelAlert[] = [
  {
    id: 'alert-1',
    modelId: 'recommendation-1',
    title: 'Drift Detected',
    description: 'Data drift detected in age distribution',
    severity: 'medium',
    status: 'active',
    createdAt: new Date(2023, 8, 15).toISOString(),
    type: 'drift'
  },
  {
    id: 'alert-2',
    modelId: 'recommendation-1',
    title: 'Performance Drop',
    description: 'Model accuracy dropped below threshold',
    severity: 'high',
    status: 'active',
    createdAt: new Date(2023, 8, 20).toISOString(),
    type: 'performance'
  },
  {
    id: 'alert-3',
    modelId: 'timeseries-1',
    title: 'System Error',
    description: 'Error in prediction service',
    severity: 'low',
    status: 'resolved',
    createdAt: new Date(2023, 7, 10).toISOString(),
    resolvedAt: new Date(2023, 7, 11).toISOString(),
    type: 'error'
  }
];

// Mock performance data
export const mockPerformanceData: ModelPerformanceRecord[] = [
  {
    id: 'perf-1',
    modelId: 'recommendation-1',
    timestamp: new Date(2023, 6, 1).toISOString(),
    metrics: {
      accuracy: 0.90,
      precision: 0.87,
      recall: 0.92,
      f1Score: 0.89
    }
  },
  {
    id: 'perf-2',
    modelId: 'recommendation-1',
    timestamp: new Date(2023, 7, 1).toISOString(),
    metrics: {
      accuracy: 0.91,
      precision: 0.88,
      recall: 0.93,
      f1Score: 0.90
    }
  },
  {
    id: 'perf-3',
    modelId: 'recommendation-1',
    timestamp: new Date(2023, 8, 1).toISOString(),
    metrics: {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91
    }
  }
];

/**
 * Get mock models
 */
export function getMockModels(): ModelMetadata[] {
  return mockModels;
}

/**
 * Get mock model by ID
 */
export function getMockModel(id: string): ModelMetadata | undefined {
  return mockModels.find(model => model.id === id);
}

/**
 * Make a mock prediction
 */
export function makeMockPrediction(request: PredictionRequest): PredictionResult {
  // Generate a realistic-looking prediction based on the model type
  const modelId = request.modelId;
  
  if (modelId.startsWith('recommendation')) {
    return {
      prediction: Math.random() > 0.3 ? true : false,
      confidence: 0.75 + Math.random() * 0.2,
      explanations: [
        { feature: 'Skill Match', contribution: 0.35 },
        { feature: 'Location Match', contribution: 0.25 },
        { feature: 'Continuity Match', contribution: 0.20 }
      ]
    };
  }
  
  if (modelId.startsWith('timeseries')) {
    return {
      prediction: 45 + Math.random() * 30,
      confidence: 0.7 + Math.random() * 0.2,
      explanations: [
        { feature: 'Previous Visit Duration', contribution: 0.40 },
        { feature: 'Time of Day', contribution: 0.25 },
        { feature: 'Day of Week', contribution: 0.20 }
      ]
    };
  }
  
  if (modelId.startsWith('satisfaction')) {
    return {
      prediction: 3 + Math.random() * 2,
      confidence: 0.65 + Math.random() * 0.25,
      explanations: [
        { feature: 'Visit Duration', contribution: 0.30 },
        { feature: 'Caregiver Consistency', contribution: 0.25 },
        { feature: 'Task Completion', contribution: 0.20 }
      ]
    };
  }
  
  // Default fallback
  return {
    prediction: Math.random() > 0.5,
    confidence: 0.5 + Math.random() * 0.3,
    explanations: []
  };
}
