/**
 * Predictive Scheduling Service
 *
 * This service uses historical data and machine learning techniques to predict
 * future care needs and optimize scheduling for caregivers and service users.
 */

import { db } from '../db';
import { visits, users, staff, serviceUsers } from '../db/schema';
import { eq, and, gte, lte, isNull, isNotNull, inArray, sql } from 'drizzle-orm';

// Types
interface PredictionRequest {
  serviceUserId?: number;
  caregiverId?: number;
  startDate: string;
  endDate: string;
  visitType?: string;
}

interface VisitPrediction {
  serviceUserId: number;
  serviceUserName: string;
  predictedDate: string;
  predictedStartTime: string;
  predictedEndTime: string;
  predictedDuration: number;
  visitType: string;
  confidence: number; // 0-100
  suggestedCaregiverId?: number;
  suggestedCaregiverName?: string;
  matchScore?: number;
  reasonCodes?: string[];
}

interface PatternData {
  dayOfWeek: number;
  timeOfDay: string;
  visitType: string;
  frequency: number;
  averageDuration: number;
}

interface CaregiverWorkloadPrediction {
  caregiverId: number;
  caregiverName: string;
  date: string;
  predictedWorkload: number; // 0-100
  availableCapacity: number; // in minutes
  predictedVisitCount: number;
  predictedTravelTime: number; // in minutes
  riskFactors: string[];
}

/**
 * Predictive Scheduling Service
 */
export class PredictiveSchedulingService {
  /**
   * Predict future visits based on historical patterns
   */
  async predictVisits(request: PredictionRequest): Promise<VisitPrediction[]> {
    try {
      const predictions: VisitPrediction[] = [];

      // Get historical visit data
      const historicalVisits = await this.getHistoricalVisitData(request);

      // Analyze patterns
      const patterns = this.analyzeVisitPatterns(historicalVisits);

      // Generate predictions based on patterns
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      // Loop through each day in the date range
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        const dateString = date.toISOString().split('T')[0];

        // Find patterns for this day of week
        const dayPatterns = patterns.filter(p => p.dayOfWeek === dayOfWeek);

        for (const pattern of dayPatterns) {
          // Calculate confidence based on frequency
          const confidence = Math.min(100, pattern.frequency * 20); // Simple scaling

          // Get service user details
          const serviceUserData = await db.select()
            .from(serviceUsers)
            .where(eq(serviceUsers.id, request.serviceUserId || 0));

          const serviceUser = serviceUserData[0];

          // Create prediction
          const prediction: VisitPrediction = {
            serviceUserId: request.serviceUserId || 0,
            serviceUserName: serviceUser?.fullName || 'Unknown',
            predictedDate: dateString,
            predictedStartTime: pattern.timeOfDay,
            predictedEndTime: this.calculateEndTime(pattern.timeOfDay, pattern.averageDuration),
            predictedDuration: pattern.averageDuration,
            visitType: pattern.visitType,
            confidence
          };

          // If confidence is high enough, suggest a caregiver
          if (confidence > 70) {
            const suggestedCaregiver = await this.suggestCaregiver(prediction);
            if (suggestedCaregiver) {
              prediction.suggestedCaregiverId = suggestedCaregiver.caregiverId;
              prediction.suggestedCaregiverName = suggestedCaregiver.caregiverName;
              prediction.matchScore = suggestedCaregiver.matchScore;
              prediction.reasonCodes = suggestedCaregiver.reasonCodes;
            }
          }

          predictions.push(prediction);
        }
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting visits:', error);
      throw error;
    }
  }

  /**
   * Predict caregiver workload for a date range
   */
  async predictCaregiverWorkload(request: PredictionRequest): Promise<CaregiverWorkloadPrediction[]> {
    try {
      const predictions: CaregiverWorkloadPrediction[] = [];

      // Get caregivers
      const caregivers = await db.select()
        .from(users)
        .where(eq(users.role, 'caregiver'));

      // Get predicted visits
      const predictedVisits = await this.predictVisits(request);

      // Group predictions by date
      const visitsByDate = predictedVisits.reduce((acc, visit) => {
        if (!acc[visit.predictedDate]) {
          acc[visit.predictedDate] = [];
        }
        acc[visit.predictedDate].push(visit);
        return acc;
      }, {} as Record<string, VisitPrediction[]>);

      // Calculate workload predictions for each caregiver and date
      for (const caregiver of caregivers) {
        for (const date in visitsByDate) {
          // Count visits assigned to this caregiver
          const caregiverVisits = visitsByDate[date].filter(
            v => v.suggestedCaregiverId === caregiver.id
          );

          // Calculate total duration
          const totalDuration = caregiverVisits.reduce(
            (sum, visit) => sum + visit.predictedDuration, 0
          );

          // Estimate travel time (simplified)
          const estimatedTravelTime = caregiverVisits.length * 15; // 15 min per visit

          // Calculate workload percentage (assuming 8-hour day = 480 minutes)
          const workloadPercentage = Math.min(100, ((totalDuration + estimatedTravelTime) / 480) * 100);

          // Identify risk factors
          const riskFactors: string[] = [];
          if (workloadPercentage > 90) riskFactors.push('Overbooked');
          if (caregiverVisits.length > 8) riskFactors.push('Too Many Visits');
          if (estimatedTravelTime > 120) riskFactors.push('Excessive Travel');

          predictions.push({
            caregiverId: caregiver.id,
            caregiverName: caregiver.fullName,
            date,
            predictedWorkload: Math.round(workloadPercentage),
            availableCapacity: Math.max(0, 480 - totalDuration - estimatedTravelTime),
            predictedVisitCount: caregiverVisits.length,
            predictedTravelTime: estimatedTravelTime,
            riskFactors
          });
        }
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting caregiver workload:', error);
      throw error;
    }
  }

  /**
   * Get historical visit data
   */
  private async getHistoricalVisitData(request: PredictionRequest) {
    // Get visits from the past 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

    let query = db.select().from(visits).where(gte(visits.date, threeMonthsAgoStr));

    // Filter by service user if specified
    if (request.serviceUserId) {
      query = query.where(eq(visits.serviceUserId, request.serviceUserId));
    }

    // Filter by caregiver if specified
    if (request.caregiverId) {
      query = query.where(eq(visits.caregiverId, request.caregiverId));
    }

    // Filter by visit type if specified
    if (request.visitType) {
      query = query.where(eq(visits.visitType, request.visitType));
    }

    return await query;
  }

  /**
   * Analyze visit patterns from historical data
   */
  private analyzeVisitPatterns(historicalVisits: any[]): PatternData[] {
    const patterns: Record<string, PatternData> = {};

    for (const visit of historicalVisits) {
      const visitDate = new Date(visit.date);
      const dayOfWeek = visitDate.getDay();
      const timeOfDay = visit.startTime.substring(0, 5); // HH:MM format
      const visitType = visit.visitType;
      const duration = this.calculateDuration(visit.startTime, visit.endTime);

      // Create a unique key for this pattern
      const patternKey = `${dayOfWeek}-${timeOfDay}-${visitType}`;

      if (!patterns[patternKey]) {
        patterns[patternKey] = {
          dayOfWeek,
          timeOfDay,
          visitType,
          frequency: 0,
          averageDuration: 0
        };
      }

      // Update pattern data
      patterns[patternKey].frequency += 1;
      patterns[patternKey].averageDuration =
        (patterns[patternKey].averageDuration * (patterns[patternKey].frequency - 1) + duration) /
        patterns[patternKey].frequency;
    }

    // Convert to array and sort by frequency
    return Object.values(patterns).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calculate duration between two time strings
   */
  private calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
  }

  /**
   * Calculate end time based on start time and duration
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const start = new Date(`2000-01-01T${startTime}`);
    start.setMinutes(start.getMinutes() + durationMinutes);
    return start.toTimeString().substring(0, 5); // HH:MM format
  }

  /**
   * Suggest a caregiver for a predicted visit
   */
  private async suggestCaregiver(prediction: VisitPrediction) {
    try {
      // Get all caregivers
      const caregivers = await db.select()
        .from(users)
        .where(eq(users.role, 'caregiver'));

      // Get service user details
      const serviceUser = await db.select()
        .from(serviceUsers)
        .where(eq(serviceUsers.id, prediction.serviceUserId));

      if (!serviceUser[0]) return null;

      // Simple matching algorithm (would be more sophisticated in production)
      const suggestions = caregivers.map(caregiver => {
        // Calculate match score based on various factors
        let matchScore = 0;
        const reasonCodes: string[] = [];

        // Factor 1: Availability (highest weight)
        // In a real implementation, check actual availability
        const isAvailable = Math.random() > 0.3; // Simulating availability check
        if (isAvailable) {
          matchScore += 40;
          reasonCodes.push('Available');
        }

        // Factor 2: Preferred caregiver
        if (serviceUser[0].preferredCaregivers &&
            JSON.parse(serviceUser[0].preferredCaregivers).includes(caregiver.id)) {
          matchScore += 30;
          reasonCodes.push('Preferred Caregiver');
        }

        // Factor 3: Previous experience with this service user
        // This would require checking appointment history in a real implementation
        if (Math.random() > 0.7) {  // Simulating previous experience
          matchScore += 15;
          reasonCodes.push('Previous Experience');
        }

        // Factor 4: Geographic proximity
        // This would require geocoding in a real implementation
        if (Math.random() > 0.6) {  // Simulating proximity
          matchScore += 10;
          reasonCodes.push('Geographic Proximity');
        }

        return {
          caregiverId: caregiver.id,
          caregiverName: caregiver.fullName,
          matchScore,
          reasonCodes
        };
      });

      // Sort by match score and return the best match
      suggestions.sort((a, b) => b.matchScore - a.matchScore);
      return suggestions[0];
    } catch (error) {
      console.error('Error suggesting caregiver:', error);
      return null;
    }
  }
}
