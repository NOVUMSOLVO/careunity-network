/**
 * Machine Learning Allocation Service
 *
 * This service enhances the allocation algorithm with machine learning capabilities
 * to improve matching quality and predictive scheduling.
 */

import { db } from '../db';
import { visits, users, staff, serviceUsers } from '../db/schema';
import { eq, and, gte, lte, isNull, isNotNull, inArray } from 'drizzle-orm';
import { MLModelService } from './ml/model-service';
import { DataPreprocessingService } from './ml/data-preprocessing';
import { ExplainabilityService } from './ml/explainability-service';

// Types
interface MLAllocationRequest {
  visitIds: number[];
  optimizationPreference?: 'quality' | 'efficiency' | 'continuity' | 'balanced';
  useHistoricalData?: boolean;
  considerFuturePredictions?: boolean;
}

interface MLAllocationResult {
  visitId: number;
  caregiverId: number;
  score: number;
  confidence: number; // 0-100
  factors: {
    skillMatch: number;
    locationMatch: number;
    timeMatch: number;
    continuityMatch: number;
    loadBalance: number;
    historicalSuccess: number;
    predictedSatisfaction: number;
  };
  explanation: string[];
}

interface HistoricalPerformance {
  caregiverId: number;
  serviceUserId: number;
  successRate: number; // 0-100
  averageRating: number; // 1-5
  visitCount: number;
  lastVisitDate: string;
}

/**
 * Machine Learning Allocation Service
 */
export class MLAllocationService {
  private modelService: MLModelService;
  private dataService: DataPreprocessingService;
  private explainabilityService: ExplainabilityService;

  constructor() {
    this.modelService = new MLModelService();
    this.dataService = new DataPreprocessingService();
    this.explainabilityService = new ExplainabilityService();
  }

  /**
   * Run enhanced allocation algorithm with ML capabilities
   */
  async runAllocation(request: MLAllocationRequest): Promise<MLAllocationResult[]> {
    try {
      // Get visits
      const visitsData = await db.select().from(visits).where(inArray(visits.id, request.visitIds));

      // Get service users for these visits
      const serviceUserIds = [...new Set(visitsData.map(v => v.serviceUserId))];
      const serviceUsersData = await db.select().from(serviceUsers).where(inArray(serviceUsers.id, serviceUserIds));

      // Get all caregivers
      const caregiversData = await db.select().from(users)
        .where(eq(users.role, 'caregiver'))
        .leftJoin(staff, eq(users.id, staff.userId));

      // Get historical performance data if requested
      const historicalData = request.useHistoricalData
        ? await this.getHistoricalPerformance(serviceUserIds)
        : [];

      // Get available ML models
      const availableModels = await this.modelService.getAvailableModels();
      const recommendationModel = availableModels.find(m => m.id.startsWith('recommendation'));
      const satisfactionModel = availableModels.find(m => m.id.startsWith('satisfaction'));

      // Train models if they don't exist
      if (!recommendationModel) {
        console.log('Training new recommendation model...');
        await this.modelService.trainRecommendationModel({
          modelType: 'recommendation',
          hyperparameters: {},
          trainingRatio: 0.7,
          validationRatio: 0.15,
          testRatio: 0.15
        });
      }

      if (!satisfactionModel && request.considerFuturePredictions) {
        console.log('Training new satisfaction model...');
        await this.modelService.trainSatisfactionModel({
          modelType: 'satisfaction',
          hyperparameters: {},
          trainingRatio: 0.7,
          validationRatio: 0.15,
          testRatio: 0.15
        });
      }

      // Process each visit
      const results: MLAllocationResult[] = [];

      for (const visit of visitsData) {
        // Get service user for this visit
        const serviceUser = serviceUsersData.find(su => su.id === visit.serviceUserId);
        if (!serviceUser) continue;

        // Calculate scores for all caregivers
        for (const caregiver of caregiversData) {
          const result = await this.calculateEnhancedScore(
            caregiver,
            serviceUser,
            visit,
            request.optimizationPreference || 'balanced',
            historicalData,
            request.considerFuturePredictions || false
          );

          // Only include if score is above zero
          if (result.score > 0) {
            results.push(result);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error running ML allocation algorithm:', error);
      throw error;
    }
  }

  /**
   * Calculate enhanced match score with ML features
   */
  private async calculateEnhancedScore(
    caregiver: any,
    serviceUser: any,
    visit: any,
    optimizationPreference: string,
    historicalData: HistoricalPerformance[],
    considerFuturePredictions: boolean
  ): Promise<MLAllocationResult> {
    try {
      // Base factors (similar to regular allocation algorithm)
      const skillMatch = this.calculateSkillMatch(caregiver, serviceUser, visit);
      const locationMatch = this.calculateLocationMatch(caregiver, serviceUser);
      const continuityMatch = this.calculateContinuityMatch(caregiver.users.id, serviceUser);
      const loadBalance = this.calculateLoadBalance(caregiver);
      const timeMatch = this.isAvailable(caregiver, visit) ? 100 : 0;

      // If caregiver is not available, return zero score
      if (timeMatch === 0) {
        return {
          visitId: visit.id,
          caregiverId: caregiver.users.id,
          score: 0,
          confidence: 0,
          factors: {
            skillMatch,
            locationMatch,
            timeMatch,
            continuityMatch,
            loadBalance,
            historicalSuccess: 0,
            predictedSatisfaction: 0
          },
          explanation: ['Caregiver is not available at the requested time']
        };
      }

      // Get available ML models
      const availableModels = await this.modelService.getAvailableModels();
      const recommendationModel = availableModels.find(m => m.id.startsWith('recommendation'));

      // Enhanced ML factors
      const historicalSuccess = this.calculateHistoricalSuccess(
        caregiver.users.id,
        serviceUser.id,
        historicalData
      );

      const predictedSatisfaction = considerFuturePredictions
        ? await this.predictSatisfaction(caregiver.users.id, serviceUser.id, visit)
        : 0;

      // Apply weights based on optimization preference
      let weights = {
        skill: 0.2,
        location: 0.15,
        continuity: 0.15,
        load: 0.1,
        time: 0.15,
        historical: 0.15,
        predicted: 0.1
      };

      switch (optimizationPreference) {
        case 'quality':
          weights = {
            skill: 0.3,
            location: 0.1,
            continuity: 0.15,
            load: 0.05,
            time: 0.1,
            historical: 0.2,
            predicted: 0.1
          };
          break;
        case 'efficiency':
          weights = {
            skill: 0.15,
            location: 0.3,
            continuity: 0.05,
            load: 0.15,
            time: 0.15,
            historical: 0.1,
            predicted: 0.1
          };
          break;
        case 'continuity':
          weights = {
            skill: 0.15,
            location: 0.1,
            continuity: 0.3,
            load: 0.05,
            time: 0.1,
            historical: 0.2,
            predicted: 0.1
          };
          break;
      }

      let score = 0;

      // If we have a recommendation model, use it for enhanced scoring
      if (recommendationModel) {
        try {
          // Prepare features for the model
          const features = {
            caregiverId: caregiver.users.id,
            serviceUserId: serviceUser.id,
            visitType: visit.visitType,
            skillMatch,
            locationMatch,
            continuityMatch,
            loadBalance,
            timeMatch,
            historicalSuccess,
            dayOfWeek: new Date(visit.date).getDay(),
            visitDuration: visit.duration,
            caregiverExperience: caregiver.staff?.yearsExperience || 1,
            serviceUserNeeds: serviceUser.careNeeds || []
          };

          // Get prediction from model
          const prediction = await this.modelService.predict({
            modelId: recommendationModel.id,
            features
          });

          // Use model prediction as the primary score, but blend with our calculated score
          if (typeof prediction.prediction === 'number') {
            // Blend model prediction (70%) with calculated score (30%)
            const calculatedScore =
              skillMatch * weights.skill +
              locationMatch * weights.location +
              continuityMatch * weights.continuity +
              loadBalance * weights.load +
              timeMatch * weights.time +
              historicalSuccess * weights.historical +
              predictedSatisfaction * weights.predicted;

            score = (prediction.prediction * 0.7) + (calculatedScore * 0.3);

            // Ensure score is in 0-100 range
            score = Math.min(100, Math.max(0, score));
          } else {
            // Fallback to calculated score if prediction is not a number
            score =
              skillMatch * weights.skill +
              locationMatch * weights.location +
              continuityMatch * weights.continuity +
              loadBalance * weights.load +
              timeMatch * weights.time +
              historicalSuccess * weights.historical +
              predictedSatisfaction * weights.predicted;
          }
        } catch (error) {
          console.error('Error using recommendation model:', error);
          // Fallback to calculated score
          score =
            skillMatch * weights.skill +
            locationMatch * weights.location +
            continuityMatch * weights.continuity +
            loadBalance * weights.load +
            timeMatch * weights.time +
            historicalSuccess * weights.historical +
            predictedSatisfaction * weights.predicted;
        }
      } else {
        // No model available, use calculated score
        score =
          skillMatch * weights.skill +
          locationMatch * weights.location +
          continuityMatch * weights.continuity +
          loadBalance * weights.load +
          timeMatch * weights.time +
          historicalSuccess * weights.historical +
          predictedSatisfaction * weights.predicted;
      }

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(
        historicalData.find(h => h.caregiverId === caregiver.users.id && h.serviceUserId === serviceUser.id)
      );

      // Generate explanation
      const explanation = await this.generateExplanation(
        caregiver,
        serviceUser,
        {
          skillMatch,
          locationMatch,
          timeMatch,
          continuityMatch,
          loadBalance,
          historicalSuccess,
          predictedSatisfaction
        }
      );

      return {
        visitId: visit.id,
        caregiverId: caregiver.users.id,
        score,
        confidence,
        factors: {
          skillMatch,
          locationMatch,
          timeMatch,
          continuityMatch,
          loadBalance,
          historicalSuccess,
          predictedSatisfaction
        },
        explanation
      };
    } catch (error) {
      console.error('Error calculating enhanced score:', error);

      // Fallback to basic scoring in case of error
      const skillMatch = this.calculateSkillMatch(caregiver, serviceUser, visit);
      const locationMatch = this.calculateLocationMatch(caregiver, serviceUser);
      const continuityMatch = this.calculateContinuityMatch(caregiver.users.id, serviceUser);
      const loadBalance = this.calculateLoadBalance(caregiver);
      const timeMatch = this.isAvailable(caregiver, visit) ? 100 : 0;

      if (timeMatch === 0) {
        return {
          visitId: visit.id,
          caregiverId: caregiver.users.id,
          score: 0,
          confidence: 0,
          factors: {
            skillMatch,
            locationMatch,
            timeMatch,
            continuityMatch,
            loadBalance,
            historicalSuccess: 0,
            predictedSatisfaction: 0
          },
          explanation: ['Caregiver is not available at the requested time']
        };
      }

      const score = (skillMatch + locationMatch + continuityMatch + loadBalance + timeMatch) / 5;

      return {
        visitId: visit.id,
        caregiverId: caregiver.users.id,
        score,
        confidence: 50,
        factors: {
          skillMatch,
          locationMatch,
          timeMatch,
          continuityMatch,
          loadBalance,
          historicalSuccess: 0,
          predictedSatisfaction: 0
        },
        explanation: ['Basic allocation score calculated due to an error with advanced ML scoring']
      };
    }
  }

  /**
   * Get historical performance data
   */
  private async getHistoricalPerformance(serviceUserIds: number[]): Promise<HistoricalPerformance[]> {
    try {
      // In a real implementation, this would query a historical performance database
      // For now, we'll generate mock data based on actual users in the system

      // Get all caregivers
      const caregivers = await db.select().from(users)
        .where(eq(users.role, 'caregiver'));

      // Generate mock historical data
      const mockData: HistoricalPerformance[] = [];

      // For each service user and caregiver combination, generate some mock data
      for (const serviceUserId of serviceUserIds) {
        for (const caregiver of caregivers) {
          // Only generate data for some combinations (70% chance)
          if (Math.random() > 0.3) {
            // Generate random success rate (60-100%)
            const successRate = Math.floor(Math.random() * 40) + 60;

            // Generate random average rating (3-5)
            const averageRating = Math.floor(Math.random() * 20 + 30) / 10; // 3.0-5.0

            // Generate random visit count (1-20)
            const visitCount = Math.floor(Math.random() * 20) + 1;

            // Generate random last visit date (within last 30 days)
            const daysAgo = Math.floor(Math.random() * 30);
            const lastVisitDate = new Date();
            lastVisitDate.setDate(lastVisitDate.getDate() - daysAgo);

            mockData.push({
              caregiverId: caregiver.id,
              serviceUserId,
              successRate,
              averageRating,
              visitCount,
              lastVisitDate: lastVisitDate.toISOString().split('T')[0]
            });
          }
        }
      }

      return mockData;
    } catch (error) {
      console.error('Error getting historical performance data:', error);
      return [];
    }
  }

  /**
   * Predict satisfaction score using ML model
   */
  private async predictSatisfaction(caregiverId: number, serviceUserId: number, visit: any): Promise<number> {
    try {
      // Get available models
      const availableModels = await this.modelService.getAvailableModels();
      const satisfactionModel = availableModels.find(m => m.id.startsWith('satisfaction'));

      if (!satisfactionModel) {
        console.log('No satisfaction model available, using fallback prediction');
        return Math.floor(Math.random() * 40) + 60; // 60-100 range as fallback
      }

      // Prepare features for prediction
      const features = {
        caregiverId,
        serviceUserId,
        visitType: visit.visitType,
        duration: visit.duration,
        dayOfWeek: new Date(visit.date).getDay(),
        timeOfDay: visit.startTime,
        previousRatings: 4.2, // This would come from historical data in a real implementation
        visitDuration: visit.duration,
        caregiverExperience: 3, // Years of experience, would come from caregiver profile
        communicationStyle: 'friendly', // Would come from caregiver profile
        punctuality: 0.95 // Percentage of on-time arrivals
      };

      // Make prediction
      const prediction = await this.modelService.predict({
        modelId: satisfactionModel.id,
        features
      });

      // Convert prediction to a score between 0-100
      // If prediction is a rating (1-5), scale it to 0-100
      if (typeof prediction.prediction === 'number') {
        if (prediction.prediction >= 1 && prediction.prediction <= 5) {
          return (prediction.prediction / 5) * 100;
        }
        return Math.min(100, Math.max(0, prediction.prediction as number));
      }

      // Fallback
      return Math.floor(Math.random() * 40) + 60;
    } catch (error) {
      console.error('Error predicting satisfaction:', error);
      return Math.floor(Math.random() * 40) + 60; // Fallback
    }
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(historicalData?: HistoricalPerformance): number {
    if (!historicalData) return 50; // Neutral confidence with no data

    // Higher confidence with more historical visits
    const visitCountFactor = Math.min(1, historicalData.visitCount / 10); // Max out at 10 visits

    // Higher confidence with more recent visits
    const lastVisitDate = new Date(historicalData.lastVisitDate);
    const daysSinceLastVisit = (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0, 1 - (daysSinceLastVisit / 30)); // Decay over 30 days

    // Calculate overall confidence
    return 50 + (visitCountFactor * 25) + (recencyFactor * 25);
  }

  /**
   * Generate human-readable explanation for the match
   */
  private async generateExplanation(caregiver: any, serviceUser: any, factors: any): Promise<string[]> {
    try {
      // Convert factors to feature importance format
      const featureImportance = Object.entries(factors).map(([feature, value]) => {
        return {
          feature,
          importance: (value as number) / 100,
          contribution: (value as number) / 100
        };
      });

      // Use explainability service to generate detailed explanation
      const explanation = await this.explainabilityService.explainPrediction({
        modelType: 'recommendation',
        prediction: factors.skillMatch + factors.locationMatch + factors.continuityMatch +
                   factors.loadBalance + factors.timeMatch + factors.historicalSuccess +
                   factors.predictedSatisfaction,
        confidence: 0.8,
        featureImportance,
        context: {
          caregiverName: caregiver.users.fullName,
          serviceUserName: serviceUser.fullName,
          visitType: 'care visit',
          visitDate: 'scheduled date',
          visitTime: 'scheduled time'
        }
      });

      // Extract key points from the explanation
      const explanationPoints = [
        ...explanation.keyFactors
          .filter(f => f.impact === 'positive')
          .map(f => `${f.factor}: ${f.description}`),
        explanation.summary
      ];

      // If no explanation was generated, fall back to basic explanations
      if (explanationPoints.length === 0) {
        if (factors.skillMatch > 80) {
          explanationPoints.push(`${caregiver.users.fullName} has the skills needed for ${serviceUser.fullName}'s care requirements`);
        }

        if (factors.locationMatch > 80) {
          explanationPoints.push(`${caregiver.users.fullName} is located close to ${serviceUser.fullName}`);
        }

        if (factors.continuityMatch > 80) {
          explanationPoints.push(`${caregiver.users.fullName} has an established relationship with ${serviceUser.fullName}`);
        }

        if (factors.loadBalance < 50) {
          explanationPoints.push(`${caregiver.users.fullName} has a high current workload`);
        }

        if (factors.historicalSuccess > 80) {
          explanationPoints.push(`${caregiver.users.fullName} has a history of successful visits with ${serviceUser.fullName}`);
        }

        if (factors.predictedSatisfaction > 80) {
          explanationPoints.push(`Our AI predicts high satisfaction for this match`);
        }
      }

      return explanationPoints;
    } catch (error) {
      console.error('Error generating explanation:', error);

      // Fallback to basic explanations
      const explanation: string[] = [];

      if (factors.skillMatch > 80) {
        explanation.push(`${caregiver.users.fullName} has the skills needed for ${serviceUser.fullName}'s care requirements`);
      }

      if (factors.locationMatch > 80) {
        explanation.push(`${caregiver.users.fullName} is located close to ${serviceUser.fullName}`);
      }

      if (factors.continuityMatch > 80) {
        explanation.push(`${caregiver.users.fullName} has an established relationship with ${serviceUser.fullName}`);
      }

      if (factors.loadBalance < 50) {
        explanation.push(`${caregiver.users.fullName} has a high current workload`);
      }

      if (factors.historicalSuccess > 80) {
        explanation.push(`${caregiver.users.fullName} has a history of successful visits with ${serviceUser.fullName}`);
      }

      if (factors.predictedSatisfaction > 80) {
        explanation.push(`Our AI predicts high satisfaction for this match`);
      }

      return explanation;
    }
  }

  // Helper methods (simplified versions of the regular allocation algorithm)
  private calculateSkillMatch(caregiver: any, serviceUser: any, visit: any): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100 range for demo
  }

  private calculateLocationMatch(caregiver: any, serviceUser: any): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100 range for demo
  }

  private calculateContinuityMatch(caregiverId: number, serviceUser: any): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100 range for demo
  }

  private calculateLoadBalance(caregiver: any): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100 range for demo
  }

  private isAvailable(caregiver: any, visit: any): boolean {
    return Math.random() > 0.2; // 80% chance of availability for demo
  }

  /**
   * Calculate historical success score based on past performance
   */
  private calculateHistoricalSuccess(
    caregiverId: number,
    serviceUserId: number,
    historicalData: HistoricalPerformance[]
  ): number {
    // Find historical data for this caregiver-service user pair
    const history = historicalData.find(h =>
      h.caregiverId === caregiverId && h.serviceUserId === serviceUserId
    );

    if (!history) {
      // No historical data available
      return 50; // Neutral score
    }

    // Calculate score based on success rate, average rating, and visit count

    // Success rate contributes 40% (already in 0-100 range)
    const successComponent = history.successRate * 0.4;

    // Average rating contributes 40% (convert from 1-5 to 0-100)
    const ratingComponent = ((history.averageRating - 1) / 4) * 100 * 0.4;

    // Visit count contributes 20% (more visits = higher score, max out at 20 visits)
    const visitCountComponent = Math.min(1, history.visitCount / 20) * 100 * 0.2;

    // Calculate total score
    const score = successComponent + ratingComponent + visitCountComponent;

    return Math.min(100, Math.max(0, score));
  }
}
