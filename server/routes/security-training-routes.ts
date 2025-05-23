/**
 * Security Training Routes
 *
 * This file contains routes for security training functionality,
 * including fetching modules, tracking progress, and completing training.
 */

import express, { Request, Response } from 'express';
import { ensureAuthenticated } from '../middleware/auth';
import { db } from '../db';
import { logger } from '../utils/logger';
import securityTrainingService from '../services/security-training-service';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated());

// Validation schemas
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
});

const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional()
});

const completeModuleSchema = z.object({
  score: z.number().int().min(0).max(100).optional()
});

const submitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number().int().positive(),
    selectedOption: z.number().int().min(0)
  }))
});

/**
 * Get all security training modules
 * GET /api/v1/security-training/modules
 */
router.get('/modules', async (req: Request, res: Response) => {
  try {
    const modules = await securityTrainingService.getAllModules();
    res.json(modules);
  } catch (error) {
    logger.error('Error fetching security training modules', { error });
    res.status(500).json({ message: 'Failed to fetch security training modules' });
  }
});

/**
 * Get a specific security training module
 * GET /api/v1/security-training/modules/:id
 */
router.get('/modules/:id', validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const module = await securityTrainingService.getModuleById(id);

    if (!module) {
      return res.status(404).json({ message: 'Security training module not found' });
    }

    res.json(module);
  } catch (error) {
    logger.error(`Error fetching security training module with ID ${req.params.id}`, { error });
    res.status(500).json({ message: 'Failed to fetch security training module' });
  }
});

/**
 * Get quiz questions for a module
 * GET /api/v1/security-training/modules/:id/questions
 */
router.get('/modules/:id/questions', validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const questions = await securityTrainingService.getQuizQuestions(id);

    // Remove correct answers from response
    const sanitizedQuestions = questions.map(({ correctOption, ...rest }) => rest);

    res.json(sanitizedQuestions);
  } catch (error) {
    logger.error(`Error fetching quiz questions for module ID ${req.params.id}`, { error });
    res.status(500).json({ message: 'Failed to fetch quiz questions' });
  }
});

/**
 * Submit quiz answers for a module
 * POST /api/v1/security-training/modules/:id/submit-quiz
 */
router.post('/modules/:id/submit-quiz',
  validateParams(idParamSchema),
  validateBody(submitQuizSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const { answers } = req.body;
      const userId = req.user!.id;

      // Get all questions for this module
      const questions = await securityTrainingService.getQuizQuestions(id);

      if (questions.length === 0) {
        return res.status(404).json({ message: 'No quiz questions found for this module' });
      }

      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const question of questions) {
        totalPoints += question.points;

        // Find user's answer for this question
        const userAnswer = answers.find(a => a.questionId === question.id);

        if (userAnswer && userAnswer.selectedOption === question.correctOption) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      }

      // Calculate percentage score
      const score = Math.round((earnedPoints / totalPoints) * 100);

      // Mark module as completed
      await securityTrainingService.completeModule(userId, id, score);

      // Return results
      res.json({
        score,
        correctAnswers,
        totalQuestions: questions.length,
        passed: score >= 70 // Assuming 70% is passing score
      });
    } catch (error) {
      logger.error(`Error submitting quiz for module ID ${req.params.id}`, { error });
      res.status(500).json({ message: 'Failed to submit quiz' });
    }
  }
);

/**
 * Get user's progress for all modules
 * GET /api/v1/security-training/progress
 */
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const progress = await securityTrainingService.getUserProgress(userId);
    res.json(progress);
  } catch (error) {
    logger.error(`Error fetching training progress for user ID ${req.user!.id}`, { error });
    res.status(500).json({ message: 'Failed to fetch training progress' });
  }
});

/**
 * Get user's progress for a specific module
 * GET /api/v1/security-training/modules/:id/progress
 */
router.get('/modules/:id/progress', validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const userId = req.user!.id;

    const progress = await securityTrainingService.getUserModuleProgress(userId, id);

    if (!progress) {
      return res.json({
        userId,
        moduleId: id,
        completed: false,
        progress: 0
      });
    }

    res.json(progress);
  } catch (error) {
    logger.error(`Error fetching module progress for user ID ${req.user!.id}, module ID ${req.params.id}`, { error });
    res.status(500).json({ message: 'Failed to fetch module progress' });
  }
});

/**
 * Update user's progress for a module
 * PUT /api/v1/security-training/modules/:id/progress
 */
router.put('/modules/:id/progress',
  validateParams(idParamSchema),
  validateBody(updateProgressSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const userId = req.user!.id;

      const progress = await securityTrainingService.updateUserProgress(userId, id, req.body);
      res.json(progress);
    } catch (error) {
      logger.error(`Error updating progress for user ID ${req.user!.id}, module ID ${req.params.id}`, { error });
      res.status(500).json({ message: 'Failed to update module progress' });
    }
  }
);

/**
 * Mark a module as completed
 * POST /api/v1/security-training/modules/:id/complete
 */
router.post('/modules/:id/complete',
  validateParams(idParamSchema),
  validateBody(completeModuleSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const userId = req.user!.id;
      const { score } = req.body;

      const progress = await securityTrainingService.completeModule(userId, id, score);
      res.json(progress);
    } catch (error) {
      logger.error(`Error completing module for user ID ${req.user!.id}, module ID ${req.params.id}`, { error });
      res.status(500).json({ message: 'Failed to complete module' });
    }
  }
);

/**
 * Get required modules for the current user
 * GET /api/v1/security-training/required-modules
 */
router.get('/required-modules', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const modules = await securityTrainingService.getRequiredModulesForUser(userId);
    res.json(modules);
  } catch (error) {
    logger.error(`Error fetching required modules for user ID ${req.user!.id}`, { error });
    res.status(500).json({ message: 'Failed to fetch required modules' });
  }
});

/**
 * Check if user has completed all required training
 * GET /api/v1/security-training/check-compliance
 */
router.get('/check-compliance', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const isCompliant = await securityTrainingService.hasCompletedRequiredTraining(userId);
    res.json({ isCompliant });
  } catch (error) {
    logger.error(`Error checking training compliance for user ID ${req.user!.id}`, { error });
    res.status(500).json({ message: 'Failed to check training compliance' });
  }
});

export default router;
