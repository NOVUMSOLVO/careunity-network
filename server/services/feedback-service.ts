/**
 * Feedback Service
 * Handles business logic for feedback management
 */

import { db } from '../db';
import { 
  feedback, 
  feedbackResponses, 
  feedbackUpvotes, 
  Feedback, 
  FeedbackResponse, 
  FeedbackUpvote, 
  InsertFeedback, 
  InsertFeedbackResponse, 
  InsertFeedbackUpvote 
} from '@shared/schema';
import { FeedbackCategory, FeedbackStats, FeedbackStatus } from '@shared/types/feedback';
import { eq, and, desc, asc, sql, count, inArray } from 'drizzle-orm';
import { ApiError } from '../utils/api-error';

/**
 * Feedback service class
 */
export class FeedbackService {
  /**
   * Get all feedback items with optional filtering
   */
  async getAllFeedback(options?: {
    category?: FeedbackCategory;
    status?: FeedbackStatus;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Feedback[]> {
    try {
      let query = db.select().from(feedback);
      
      // Apply filters
      if (options?.category) {
        query = query.where(eq(feedback.category, options.category));
      }
      
      if (options?.status) {
        query = query.where(eq(feedback.status, options.status));
      }
      
      if (options?.isPublic !== undefined) {
        query = query.where(eq(feedback.isPublic, options.isPublic));
      }
      
      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.offset(options.offset);
      }
      
      // Order by creation date (newest first)
      query = query.orderBy(desc(feedback.createdAt));
      
      return await query;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw new ApiError('Failed to get feedback', 500);
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(id: number): Promise<Feedback> {
    try {
      const result = await db.select().from(feedback).where(eq(feedback.id, id)).limit(1);
      
      if (result.length === 0) {
        throw new ApiError('Feedback not found', 404);
      }
      
      return result[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error getting feedback by ID:', error);
      throw new ApiError('Failed to get feedback', 500);
    }
  }

  /**
   * Create new feedback
   */
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    try {
      const result = await db.insert(feedback).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new ApiError('Failed to create feedback', 500);
    }
  }

  /**
   * Update feedback
   */
  async updateFeedback(id: number, data: Partial<InsertFeedback>): Promise<Feedback> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(id);
      
      // Update the feedback
      const result = await db.update(feedback)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(feedback.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error updating feedback:', error);
      throw new ApiError('Failed to update feedback', 500);
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: number): Promise<void> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(id);
      
      // Delete related responses first
      await db.delete(feedbackResponses).where(eq(feedbackResponses.feedbackId, id));
      
      // Delete related upvotes
      await db.delete(feedbackUpvotes).where(eq(feedbackUpvotes.feedbackId, id));
      
      // Delete the feedback
      await db.delete(feedback).where(eq(feedback.id, id));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error deleting feedback:', error);
      throw new ApiError('Failed to delete feedback', 500);
    }
  }

  /**
   * Get feedback responses
   */
  async getFeedbackResponses(feedbackId: number): Promise<FeedbackResponse[]> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(feedbackId);
      
      // Get responses
      return await db.select()
        .from(feedbackResponses)
        .where(eq(feedbackResponses.feedbackId, feedbackId))
        .orderBy(asc(feedbackResponses.createdAt));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error getting feedback responses:', error);
      throw new ApiError('Failed to get feedback responses', 500);
    }
  }

  /**
   * Add feedback response
   */
  async addFeedbackResponse(data: InsertFeedbackResponse): Promise<FeedbackResponse> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(data.feedbackId);
      
      // Add response
      const result = await db.insert(feedbackResponses).values(data).returning();
      return result[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error adding feedback response:', error);
      throw new ApiError('Failed to add feedback response', 500);
    }
  }

  /**
   * Update feedback response
   */
  async updateFeedbackResponse(id: number, feedbackId: number, content: string): Promise<FeedbackResponse> {
    try {
      // Check if response exists
      const response = await db.select()
        .from(feedbackResponses)
        .where(and(
          eq(feedbackResponses.id, id),
          eq(feedbackResponses.feedbackId, feedbackId)
        ))
        .limit(1);
      
      if (response.length === 0) {
        throw new ApiError('Feedback response not found', 404);
      }
      
      // Update response
      const result = await db.update(feedbackResponses)
        .set({ content, updatedAt: new Date() })
        .where(eq(feedbackResponses.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error updating feedback response:', error);
      throw new ApiError('Failed to update feedback response', 500);
    }
  }

  /**
   * Delete feedback response
   */
  async deleteFeedbackResponse(id: number, feedbackId: number): Promise<void> {
    try {
      // Check if response exists
      const response = await db.select()
        .from(feedbackResponses)
        .where(and(
          eq(feedbackResponses.id, id),
          eq(feedbackResponses.feedbackId, feedbackId)
        ))
        .limit(1);
      
      if (response.length === 0) {
        throw new ApiError('Feedback response not found', 404);
      }
      
      // Delete response
      await db.delete(feedbackResponses).where(eq(feedbackResponses.id, id));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error deleting feedback response:', error);
      throw new ApiError('Failed to delete feedback response', 500);
    }
  }

  /**
   * Upvote feedback
   */
  async upvoteFeedback(feedbackId: number, userId: number): Promise<FeedbackUpvote> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(feedbackId);
      
      // Check if user already upvoted
      const existingUpvote = await db.select()
        .from(feedbackUpvotes)
        .where(and(
          eq(feedbackUpvotes.feedbackId, feedbackId),
          eq(feedbackUpvotes.userId, userId)
        ))
        .limit(1);
      
      if (existingUpvote.length > 0) {
        throw new ApiError('User already upvoted this feedback', 400);
      }
      
      // Add upvote
      const upvoteData: InsertFeedbackUpvote = {
        feedbackId,
        userId
      };
      
      const result = await db.insert(feedbackUpvotes).values(upvoteData).returning();
      
      // Update upvote count in feedback
      await db.update(feedback)
        .set({ upvotes: sql`${feedback.upvotes} + 1` })
        .where(eq(feedback.id, feedbackId));
      
      return result[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error upvoting feedback:', error);
      throw new ApiError('Failed to upvote feedback', 500);
    }
  }

  /**
   * Remove upvote from feedback
   */
  async removeUpvote(feedbackId: number, userId: number): Promise<void> {
    try {
      // Check if feedback exists
      await this.getFeedbackById(feedbackId);
      
      // Check if upvote exists
      const existingUpvote = await db.select()
        .from(feedbackUpvotes)
        .where(and(
          eq(feedbackUpvotes.feedbackId, feedbackId),
          eq(feedbackUpvotes.userId, userId)
        ))
        .limit(1);
      
      if (existingUpvote.length === 0) {
        throw new ApiError('User has not upvoted this feedback', 400);
      }
      
      // Remove upvote
      await db.delete(feedbackUpvotes)
        .where(and(
          eq(feedbackUpvotes.feedbackId, feedbackId),
          eq(feedbackUpvotes.userId, userId)
        ));
      
      // Update upvote count in feedback
      await db.update(feedback)
        .set({ upvotes: sql`${feedback.upvotes} - 1` })
        .where(eq(feedback.id, feedbackId));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error removing upvote:', error);
      throw new ApiError('Failed to remove upvote', 500);
    }
  }
}
