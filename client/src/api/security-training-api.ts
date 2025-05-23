/**
 * Security Training API Client
 * 
 * This file contains functions for interacting with the security training API.
 */

import { api } from '@/lib/api';

// Types
export interface SecurityTrainingModule {
  id: number;
  title: string;
  description: string;
  content: string;
  type: 'video' | 'article' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  requiredForRoles: string[];
  prerequisites: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
  tags: string[];
  thumbnail?: string;
  expiryPeriod?: number;
}

export interface SecurityTrainingQuizQuestion {
  id: number;
  moduleId: number;
  question: string;
  options: string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface UserSecurityTraining {
  id: number;
  userId: number;
  moduleId: number;
  completed: boolean;
  completedAt?: string;
  score?: number;
  attempts: number;
  lastAttemptAt?: string;
  progress: number;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  module?: SecurityTrainingModule;
}

export interface QuizAnswer {
  questionId: number;
  selectedOption: number;
}

export interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

/**
 * Get all security training modules
 */
export async function getSecurityTrainingModules(): Promise<SecurityTrainingModule[]> {
  const { data } = await api.get<SecurityTrainingModule[]>('/api/v1/security-training/modules');
  return data;
}

/**
 * Get a specific security training module
 */
export async function getSecurityTrainingModule(id: number): Promise<SecurityTrainingModule> {
  const { data } = await api.get<SecurityTrainingModule>(`/api/v1/security-training/modules/${id}`);
  return data;
}

/**
 * Get quiz questions for a module
 */
export async function getQuizQuestions(moduleId: number): Promise<SecurityTrainingQuizQuestion[]> {
  const { data } = await api.get<SecurityTrainingQuizQuestion[]>(`/api/v1/security-training/modules/${moduleId}/questions`);
  return data;
}

/**
 * Submit quiz answers for a module
 */
export async function submitQuiz(moduleId: number, answers: QuizAnswer[]): Promise<QuizResult> {
  const { data } = await api.post<QuizResult>(`/api/v1/security-training/modules/${moduleId}/submit-quiz`, { answers });
  return data;
}

/**
 * Get user's progress for all modules
 */
export async function getUserProgress(): Promise<UserSecurityTraining[]> {
  const { data } = await api.get<UserSecurityTraining[]>('/api/v1/security-training/progress');
  return data;
}

/**
 * Get user's progress for a specific module
 */
export async function getUserModuleProgress(moduleId: number): Promise<UserSecurityTraining> {
  const { data } = await api.get<UserSecurityTraining>(`/api/v1/security-training/modules/${moduleId}/progress`);
  return data;
}

/**
 * Update user's progress for a module
 */
export async function updateUserProgress(moduleId: number, progress: {
  progress: number;
  score?: number;
  completed?: boolean;
  notes?: string;
}): Promise<UserSecurityTraining> {
  const { data } = await api.put<UserSecurityTraining>(`/api/v1/security-training/modules/${moduleId}/progress`, progress);
  return data;
}

/**
 * Mark a module as completed
 */
export async function completeModule(moduleId: number, score?: number): Promise<UserSecurityTraining> {
  const { data } = await api.post<UserSecurityTraining>(`/api/v1/security-training/modules/${moduleId}/complete`, { score });
  return data;
}

/**
 * Get required modules for the current user
 */
export async function getRequiredModules(): Promise<SecurityTrainingModule[]> {
  const { data } = await api.get<SecurityTrainingModule[]>('/api/v1/security-training/required-modules');
  return data;
}

/**
 * Check if user has completed all required training
 */
export async function checkTrainingCompliance(): Promise<{ isCompliant: boolean }> {
  const { data } = await api.get<{ isCompliant: boolean }>('/api/v1/security-training/check-compliance');
  return data;
}
