/**
 * Machine Learning Models API routes
 */

import express from 'express';
import { MLModelService } from '../services/ml/model-service';
import { DataPreprocessingService } from '../services/ml/data-preprocessing';
import { ExplainabilityService } from '../services/ml/explainability-service';
import { ModelMonitoringService } from '../services/ml/model-monitoring';
import { ModelRegistryService } from '../services/ml/model-registry';
import { ensureAuthenticated } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

// Initialize services
const modelService = new MLModelService();
const dataService = new DataPreprocessingService();
const explainabilityService = new ExplainabilityService();
const registryService = new ModelRegistryService();
const monitoringService = new ModelMonitoringService(modelService, dataService);

// Validation schemas
const trainModelSchema = z.object({
  modelType: z.enum(['recommendation', 'timeSeries', 'satisfaction', 'workload']),
  hyperparameters: z.record(z.any()).optional(),
  trainingRatio: z.number().min(0.1).max(0.9).default(0.7),
  validationRatio: z.number().min(0.05).max(0.3).default(0.15),
  testRatio: z.number().min(0.05).max(0.3).default(0.15),
  randomSeed: z.number().optional()
});

const predictionRequestSchema = z.object({
  modelId: z.string(),
  features: z.record(z.any())
});

const explanationRequestSchema = z.object({
  modelType: z.enum(['recommendation', 'timeSeries', 'satisfaction', 'workload']),
  prediction: z.union([z.number(), z.string(), z.boolean()]),
  confidence: z.number().min(0).max(1),
  featureImportance: z.array(z.object({
    feature: z.string(),
    importance: z.number(),
    contribution: z.number()
  })),
  context: z.record(z.any()).optional()
});

const driftDetectionSchema = z.object({
  modelId: z.string(),
  features: z.array(z.record(z.any()))
});

const modelPromotionSchema = z.object({
  modelName: z.string(),
  version: z.string(),
  status: z.enum(['development', 'staging', 'production', 'archived'])
});

/**
 * Get all available ML models
 * GET /api/v2/ml-models
 */
router.get('/', async (req, res, next) => {
  try {
    const models = await modelService.getAvailableModels();
    res.json(models);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific ML model by ID
 * GET /api/v2/ml-models/:id
 */
router.get('/:id', validateParams(z.object({ id: z.string() })), async (req, res, next) => {
  try {
    const model = await modelService.getModel(req.params.id);

    if (!model) {
      return res.status(404).json({
        error: 'not_found',
        message: `Model with ID ${req.params.id} not found`
      });
    }

    res.json(model);
  } catch (error) {
    next(error);
  }
});

/**
 * Train a new recommendation model
 * POST /api/v2/ml-models/train/recommendation
 */
router.post('/train/recommendation', validateBody(trainModelSchema), async (req, res, next) => {
  try {
    const model = await modelService.trainRecommendationModel(req.body);
    res.status(201).json(model);
  } catch (error) {
    next(error);
  }
});

/**
 * Train a new time series model
 * POST /api/v2/ml-models/train/timeseries
 */
router.post('/train/timeseries', validateBody(trainModelSchema), async (req, res, next) => {
  try {
    const model = await modelService.trainTimeSeriesModel(req.body);
    res.status(201).json(model);
  } catch (error) {
    next(error);
  }
});

/**
 * Train a new satisfaction prediction model
 * POST /api/v2/ml-models/train/satisfaction
 */
router.post('/train/satisfaction', validateBody(trainModelSchema), async (req, res, next) => {
  try {
    const model = await modelService.trainSatisfactionModel(req.body);
    res.status(201).json(model);
  } catch (error) {
    next(error);
  }
});

/**
 * Make a prediction using a trained model
 * POST /api/v2/ml-models/predict
 */
router.post('/predict', validateBody(predictionRequestSchema), async (req, res, next) => {
  try {
    const prediction = await modelService.predict(req.body);
    res.json(prediction);
  } catch (error) {
    next(error);
  }
});

/**
 * Generate explanation for a prediction
 * POST /api/v2/ml-models/explain
 */
router.post('/explain', validateBody(explanationRequestSchema), async (req, res, next) => {
  try {
    const explanation = await explainabilityService.explainPrediction(req.body);
    res.json(explanation);
  } catch (error) {
    next(error);
  }
});

/**
 * Detect data drift for a model
 * POST /api/v2/ml-models/detect-drift
 */
router.post('/detect-drift', validateBody(driftDetectionSchema), async (req, res, next) => {
  try {
    const { modelId, features } = req.body;
    const driftResult = await monitoringService.detectDrift(modelId, { features });
    res.json(driftResult);
  } catch (error) {
    next(error);
  }
});

/**
 * Check if a model needs retraining
 * GET /api/v2/ml-models/:id/check-retraining
 */
router.get('/:id/check-retraining', validateParams(z.object({ id: z.string() })), async (req, res, next) => {
  try {
    // Get recent data for the model
    const testData = await dataService.prepareAllocationDataset({
      startDate: getDateXDaysAgo(30) // Last 30 days
    });

    const result = await monitoringService.checkRetrainingNeeded(req.params.id, testData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get model performance history
 * GET /api/v2/ml-models/:id/performance
 */
router.get('/:id/performance', validateParams(z.object({ id: z.string() })), async (req, res, next) => {
  try {
    // This would normally come from the monitoring service
    // For now, generate mock performance data
    const performanceData = generateMockPerformanceData(req.params.id);
    res.json(performanceData);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all model families from registry
 * GET /api/v2/ml-models/registry
 */
router.get('/registry', async (req, res, next) => {
  try {
    const families = registryService.getAllModelFamilies();
    res.json(families);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific model family from registry
 * GET /api/v2/ml-models/registry/:name
 */
router.get('/registry/:name', validateParams(z.object({ name: z.string() })), async (req, res, next) => {
  try {
    const family = registryService.getModelFamily(req.params.name);

    if (!family) {
      return res.status(404).json({
        error: 'not_found',
        message: `Model family ${req.params.name} not found`
      });
    }

    res.json(family);
  } catch (error) {
    next(error);
  }
});

/**
 * Promote a model to a new status
 * POST /api/v2/ml-models/registry/promote
 */
router.post('/registry/promote', validateBody(modelPromotionSchema), async (req, res, next) => {
  try {
    const { modelName, version, status } = req.body;
    const modelVersion = await registryService.promoteModel(modelName, version, status);

    if (!modelVersion) {
      return res.status(404).json({
        error: 'not_found',
        message: `Model ${modelName} version ${version} not found`
      });
    }

    res.json(modelVersion);
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to get date X days ago in YYYY-MM-DD format
 */
function getDateXDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to generate mock performance data
 */
function generateMockPerformanceData(modelId: string): any[] {
  const data = [];
  const now = new Date();
  const modelType = modelId.split('-')[0];

  // Generate data points for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    let metrics: any = {};

    if (modelType === 'recommendation' || modelType === 'satisfaction') {
      // Add some random variation but with an improving trend
      const baseAccuracy = 0.75 + (30 - i) * 0.005; // Starts at 0.75, improves to 0.9
      metrics = {
        accuracy: baseAccuracy + (Math.random() * 0.05 - 0.025),
        precision: baseAccuracy - 0.05 + (Math.random() * 0.05),
        recall: baseAccuracy - 0.1 + (Math.random() * 0.05)
      };
    } else if (modelType === 'timeseries') {
      // For regression metrics, lower is better
      const baseRmse = 2.0 - (30 - i) * 0.03; // Starts at 2.0, improves to 1.1
      metrics = {
        rmse: Math.max(0.5, baseRmse + (Math.random() * 0.2 - 0.1)),
        mae: Math.max(0.3, baseRmse * 0.7 + (Math.random() * 0.2 - 0.1))
      };
    }

    data.push({
      date: date.toISOString().split('T')[0],
      metrics,
      sampleSize: 100 + Math.floor(Math.random() * 50)
    });
  }

  return data;
}

export default router;
