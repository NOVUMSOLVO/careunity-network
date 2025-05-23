/**
 * Feedback API Service
 * Provides methods for interacting with the feedback endpoints
 */

import { ApiClient } from '../core';
import { 
  Feedback, 
  FeedbackResponse, 
  FeedbackUpvote, 
  InsertFeedback, 
  InsertFeedbackResponse 
} from '../../schema';
import { FeedbackCategory, FeedbackPriority, FeedbackSource, FeedbackStats, FeedbackStatus } from '../../types/feedback';

/**
 * Feedback API service class
 */
export class FeedbackApi {
  constructor(private client: ApiClient) {}

  /**
   * Get all feedback items
   */
  async getAllFeedback(options?: {
    category?: FeedbackCategory;
    status?: FeedbackStatus;
    priority?: FeedbackPriority;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Feedback[]> {
    return this.client.get('/feedback', { params: options });
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(id: number): Promise<Feedback> {
    return this.client.get(`/feedback/${id}`);
  }

  /**
   * Create new feedback
   */
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    return this.client.post('/feedback', feedback);
  }

  /**
   * Update feedback
   */
  async updateFeedback(id: number, feedback: Partial<InsertFeedback>): Promise<Feedback> {
    return this.client.patch(`/feedback/${id}`, feedback);
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: number): Promise<void> {
    return this.client.delete(`/feedback/${id}`);
  }

  /**
   * Get feedback responses
   */
  async getFeedbackResponses(feedbackId: number): Promise<FeedbackResponse[]> {
    return this.client.get(`/feedback/${feedbackId}/responses`);
  }

  /**
   * Add feedback response
   */
  async addFeedbackResponse(feedbackId: number, response: InsertFeedbackResponse): Promise<FeedbackResponse> {
    return this.client.post(`/feedback/${feedbackId}/responses`, response);
  }

  /**
   * Update feedback response
   */
  async updateFeedbackResponse(feedbackId: number, responseId: number, content: string): Promise<FeedbackResponse> {
    return this.client.patch(`/feedback/${feedbackId}/responses/${responseId}`, { content });
  }

  /**
   * Delete feedback response
   */
  async deleteFeedbackResponse(feedbackId: number, responseId: number): Promise<void> {
    return this.client.delete(`/feedback/${feedbackId}/responses/${responseId}`);
  }

  /**
   * Upvote feedback
   */
  async upvoteFeedback(feedbackId: number): Promise<FeedbackUpvote> {
    return this.client.post(`/feedback/${feedbackId}/upvote`);
  }

  /**
   * Remove upvote from feedback
   */
  async removeUpvote(feedbackId: number): Promise<void> {
    return this.client.delete(`/feedback/${feedbackId}/upvote`);
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    return this.client.get('/feedback/stats');
  }

  /**
   * Get user's feedback
   */
  async getUserFeedback(): Promise<Feedback[]> {
    return this.client.get('/feedback/user');
  }

  /**
   * Get feedback by category
   */
  async getFeedbackByCategory(category: FeedbackCategory): Promise<Feedback[]> {
    return this.client.get('/feedback', { params: { category } });
  }

  /**
   * Get feedback by status
   */
  async getFeedbackByStatus(status: FeedbackStatus): Promise<Feedback[]> {
    return this.client.get('/feedback', { params: { status } });
  }

  /**
   * Get feedback by source
   */
  async getFeedbackBySource(source: FeedbackSource): Promise<Feedback[]> {
    return this.client.get('/feedback', { params: { source } });
  }

  /**
   * Search feedback
   */
  async searchFeedback(query: string): Promise<Feedback[]> {
    return this.client.get('/feedback/search', { params: { q: query } });
  }
}
