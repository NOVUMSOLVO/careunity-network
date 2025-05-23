/**
 * Security Training Service
 * 
 * This service manages security training modules and user progress.
 */

import { db } from '../db';
import { 
  securityTrainingModules, 
  userSecurityTraining, 
  securityTrainingQuizQuestions,
  SecurityTrainingModule,
  UserSecurityTraining,
  SecurityTrainingQuizQuestion,
  InsertSecurityTrainingModule,
  InsertUserSecurityTraining,
  InsertSecurityTrainingQuizQuestion
} from '@shared/schema/security-training';
import { users } from '@shared/schema';
import { eq, and, inArray, isNull, desc, asc, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Security Training Service
 */
class SecurityTrainingService {
  /**
   * Get all security training modules
   */
  async getAllModules(): Promise<SecurityTrainingModule[]> {
    try {
      return await db.query.securityTrainingModules.findMany({
        where: eq(securityTrainingModules.isActive, true),
        orderBy: asc(securityTrainingModules.order)
      });
    } catch (error) {
      logger.error('Error fetching security training modules', { error });
      throw error;
    }
  }

  /**
   * Get a security training module by ID
   */
  async getModuleById(id: number): Promise<SecurityTrainingModule | null> {
    try {
      return await db.query.securityTrainingModules.findFirst({
        where: eq(securityTrainingModules.id, id)
      });
    } catch (error) {
      logger.error(`Error fetching security training module with ID ${id}`, { error });
      throw error;
    }
  }

  /**
   * Create a new security training module
   */
  async createModule(module: InsertSecurityTrainingModule): Promise<SecurityTrainingModule> {
    try {
      const [newModule] = await db.insert(securityTrainingModules)
        .values(module)
        .returning();
      
      return newModule;
    } catch (error) {
      logger.error('Error creating security training module', { error, module });
      throw error;
    }
  }

  /**
   * Update a security training module
   */
  async updateModule(id: number, module: Partial<InsertSecurityTrainingModule>): Promise<SecurityTrainingModule | null> {
    try {
      const [updatedModule] = await db.update(securityTrainingModules)
        .set({ ...module, updatedAt: new Date() })
        .where(eq(securityTrainingModules.id, id))
        .returning();
      
      return updatedModule || null;
    } catch (error) {
      logger.error(`Error updating security training module with ID ${id}`, { error, module });
      throw error;
    }
  }

  /**
   * Delete a security training module
   */
  async deleteModule(id: number): Promise<boolean> {
    try {
      // Instead of deleting, mark as inactive
      const [updatedModule] = await db.update(securityTrainingModules)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(securityTrainingModules.id, id))
        .returning();
      
      return !!updatedModule;
    } catch (error) {
      logger.error(`Error deleting security training module with ID ${id}`, { error });
      throw error;
    }
  }

  /**
   * Get quiz questions for a module
   */
  async getQuizQuestions(moduleId: number): Promise<SecurityTrainingQuizQuestion[]> {
    try {
      return await db.query.securityTrainingQuizQuestions.findMany({
        where: eq(securityTrainingQuizQuestions.moduleId, moduleId),
        orderBy: asc(securityTrainingQuizQuestions.order)
      });
    } catch (error) {
      logger.error(`Error fetching quiz questions for module ID ${moduleId}`, { error });
      throw error;
    }
  }

  /**
   * Get user's training progress
   */
  async getUserProgress(userId: number): Promise<UserSecurityTraining[]> {
    try {
      return await db.query.userSecurityTraining.findMany({
        where: eq(userSecurityTraining.userId, userId),
        with: {
          module: true
        }
      });
    } catch (error) {
      logger.error(`Error fetching training progress for user ID ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Get user's progress for a specific module
   */
  async getUserModuleProgress(userId: number, moduleId: number): Promise<UserSecurityTraining | null> {
    try {
      return await db.query.userSecurityTraining.findFirst({
        where: and(
          eq(userSecurityTraining.userId, userId),
          eq(userSecurityTraining.moduleId, moduleId)
        )
      });
    } catch (error) {
      logger.error(`Error fetching module progress for user ID ${userId}, module ID ${moduleId}`, { error });
      throw error;
    }
  }

  /**
   * Update user's progress for a module
   */
  async updateUserProgress(userId: number, moduleId: number, progress: Partial<InsertUserSecurityTraining>): Promise<UserSecurityTraining> {
    try {
      // Check if progress record exists
      const existingProgress = await this.getUserModuleProgress(userId, moduleId);
      
      if (existingProgress) {
        // Update existing record
        const [updatedProgress] = await db.update(userSecurityTraining)
          .set({ 
            ...progress, 
            updatedAt: new Date(),
            // If completed is being set to true and wasn't before, set completedAt
            ...(progress.completed && !existingProgress.completed ? { completedAt: new Date() } : {})
          })
          .where(and(
            eq(userSecurityTraining.userId, userId),
            eq(userSecurityTraining.moduleId, moduleId)
          ))
          .returning();
        
        return updatedProgress;
      } else {
        // Create new record
        const [newProgress] = await db.insert(userSecurityTraining)
          .values({ 
            userId, 
            moduleId, 
            ...progress,
            // If completed is true, set completedAt
            ...(progress.completed ? { completedAt: new Date() } : {})
          })
          .returning();
        
        return newProgress;
      }
    } catch (error) {
      logger.error(`Error updating progress for user ID ${userId}, module ID ${moduleId}`, { error, progress });
      throw error;
    }
  }

  /**
   * Mark a module as completed for a user
   */
  async completeModule(userId: number, moduleId: number, score?: number): Promise<UserSecurityTraining> {
    try {
      // Get the module to check if it has an expiry period
      const module = await this.getModuleById(moduleId);
      
      // Calculate expiry date if module has an expiry period
      let expiresAt = null;
      if (module?.expiryPeriod) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + module.expiryPeriod);
      }
      
      return await this.updateUserProgress(userId, moduleId, {
        completed: true,
        completedAt: new Date(),
        progress: 100,
        score,
        expiresAt
      });
    } catch (error) {
      logger.error(`Error completing module for user ID ${userId}, module ID ${moduleId}`, { error });
      throw error;
    }
  }

  /**
   * Get required modules for a user based on their role
   */
  async getRequiredModulesForUser(userId: number): Promise<SecurityTrainingModule[]> {
    try {
      // Get user's role
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true }
      });
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get modules required for this role
      return await db.query.securityTrainingModules.findMany({
        where: and(
          eq(securityTrainingModules.isActive, true),
          sql`${securityTrainingModules.requiredForRoles} @> ARRAY[${user.role}]::text[]`
        ),
        orderBy: asc(securityTrainingModules.order)
      });
    } catch (error) {
      logger.error(`Error fetching required modules for user ID ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Check if a user has completed all required security training
   */
  async hasCompletedRequiredTraining(userId: number): Promise<boolean> {
    try {
      // Get required modules
      const requiredModules = await this.getRequiredModulesForUser(userId);
      
      if (requiredModules.length === 0) {
        return true; // No required modules
      }
      
      // Get user's completed modules
      const userProgress = await this.getUserProgress(userId);
      
      // Check if all required modules are completed and not expired
      const now = new Date();
      for (const module of requiredModules) {
        const progress = userProgress.find(p => p.moduleId === module.id);
        
        // Module is not completed or is expired
        if (!progress?.completed || (progress.expiresAt && progress.expiresAt < now)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking required training completion for user ID ${userId}`, { error });
      throw error;
    }
  }
}

export default new SecurityTrainingService();
