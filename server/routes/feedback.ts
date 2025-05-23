/**
 * Feedback routes
 */

import express from 'express';
import { FeedbackService } from '../services/feedback-service';
import { ensureAuthenticated as requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate-request';
import { feedbackRateLimiter } from '../middleware/rate-limiter';
import {
  insertFeedbackSchema,
  insertFeedbackResponseSchema,
  idParamSchema
} from '@shared/schema';
import { z } from 'zod';
import { ApiError } from '../utils/api-error';

const router = express.Router();
const feedbackService = new FeedbackService();

// Get all feedback
router.get('/', requireAuth(), async (req, res, next) => {
  try {
    const { category, status, isPublic, limit, offset } = req.query;

    const options = {
      category: category as any,
      status: status as any,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const feedbackItems = await feedbackService.getAllFeedback(options);
    res.json(feedbackItems);
  } catch (error) {
    next(error);
  }
});

// Get feedback by ID
router.get('/:id', requireAuth(), validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedbackItem = await feedbackService.getFeedbackById(parseInt(id));
    res.json(feedbackItem);
  } catch (error) {
    next(error);
  }
});

// Create new feedback
router.post('/', requireAuth(), feedbackRateLimiter, validateBody(insertFeedbackSchema), async (req, res, next) => {
  try {
    // Add the current user ID to the feedback data
    const feedbackData = {
      ...req.body,
      userId: req.user!.id
    };

    const newFeedback = await feedbackService.createFeedback(feedbackData);
    res.status(201).json(newFeedback);
  } catch (error) {
    next(error);
  }
});

// Update feedback
router.patch('/:id', requireAuth(), validateParams(idParamSchema), validateBody(insertFeedbackSchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the feedback to check ownership
    const existingFeedback = await feedbackService.getFeedbackById(parseInt(id));

    // Only allow the creator or admin to update
    if (existingFeedback.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError('Not authorized to update this feedback', 403);
    }

    const updatedFeedback = await feedbackService.updateFeedback(parseInt(id), req.body);
    res.json(updatedFeedback);
  } catch (error) {
    next(error);
  }
});

// Delete feedback
router.delete('/:id', requireAuth(), validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the feedback to check ownership
    const existingFeedback = await feedbackService.getFeedbackById(parseInt(id));

    // Only allow the creator or admin to delete
    if (existingFeedback.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError('Not authorized to delete this feedback', 403);
    }

    await feedbackService.deleteFeedback(parseInt(id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Get feedback responses
router.get('/:id/responses', requireAuth(), validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const responses = await feedbackService.getFeedbackResponses(parseInt(id));
    res.json(responses);
  } catch (error) {
    next(error);
  }
});

// Add feedback response
router.post('/:id/responses', requireAuth(), feedbackRateLimiter, validateParams(idParamSchema), validateBody(insertFeedbackResponseSchema.omit({ feedbackId: true, userId: true })), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Add the current user ID and feedback ID to the response data
    const responseData = {
      ...req.body,
      feedbackId: parseInt(id),
      userId: req.user!.id,
      isOfficial: req.user!.role === 'admin' || req.user!.role === 'manager'
    };

    const newResponse = await feedbackService.addFeedbackResponse(responseData);
    res.status(201).json(newResponse);
  } catch (error) {
    next(error);
  }
});

// Update feedback response
router.patch('/:feedbackId/responses/:responseId', requireAuth(),
  validateParams(z.object({
    feedbackId: idParamSchema.shape.id,
    responseId: idParamSchema.shape.id
  })),
  validateBody(z.object({
    content: z.string().min(1, "Content cannot be empty")
  })),
  async (req, res, next) => {
  try {
    const { feedbackId, responseId } = req.params;
    const { content } = req.body;

    // Get the response to check ownership
    const responses = await feedbackService.getFeedbackResponses(parseInt(feedbackId));
    const existingResponse = responses.find(r => r.id === parseInt(responseId));

    if (!existingResponse) {
      throw new ApiError('Feedback response not found', 404);
    }

    // Only allow the creator or admin to update
    if (existingResponse.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError('Not authorized to update this response', 403);
    }

    const updatedResponse = await feedbackService.updateFeedbackResponse(
      parseInt(responseId),
      parseInt(feedbackId),
      content
    );

    res.json(updatedResponse);
  } catch (error) {
    next(error);
  }
});

// Delete feedback response
router.delete('/:feedbackId/responses/:responseId', requireAuth(),
  validateParams(z.object({
    feedbackId: idParamSchema.shape.id,
    responseId: idParamSchema.shape.id
  })),
  async (req, res, next) => {
  try {
    const { feedbackId, responseId } = req.params;

    // Get the response to check ownership
    const responses = await feedbackService.getFeedbackResponses(parseInt(feedbackId));
    const existingResponse = responses.find(r => r.id === parseInt(responseId));

    if (!existingResponse) {
      throw new ApiError('Feedback response not found', 404);
    }

    // Only allow the creator or admin to delete
    if (existingResponse.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError('Not authorized to delete this response', 403);
    }

    await feedbackService.deleteFeedbackResponse(parseInt(responseId), parseInt(feedbackId));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Upvote feedback
router.post('/:id/upvote', requireAuth(), feedbackRateLimiter, validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const upvote = await feedbackService.upvoteFeedback(parseInt(id), req.user!.id);
    res.status(201).json(upvote);
  } catch (error) {
    next(error);
  }
});

// Remove upvote
router.delete('/:id/upvote', requireAuth(), validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    await feedbackService.removeUpvote(parseInt(id), req.user!.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Get user's feedback
router.get('/user/me', requireAuth(), async (req, res, next) => {
  try {
    const feedbackItems = await feedbackService.getAllFeedback({
      userId: req.user!.id
    });
    res.json(feedbackItems);
  } catch (error) {
    next(error);
  }
});

export default router;
