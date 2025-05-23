/**
 * Security Training Hooks
 * 
 * This file contains React Query hooks for interacting with the security training API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  getSecurityTrainingModules,
  getSecurityTrainingModule,
  getQuizQuestions,
  submitQuiz,
  getUserProgress,
  getUserModuleProgress,
  updateUserProgress,
  completeModule,
  getRequiredModules,
  checkTrainingCompliance,
  type SecurityTrainingModule,
  type SecurityTrainingQuizQuestion,
  type UserSecurityTraining,
  type QuizAnswer,
  type QuizResult
} from '@/api/security-training-api';

/**
 * Hook for fetching all security training modules
 */
export function useSecurityTrainingModules() {
  return useQuery({
    queryKey: ['security-training', 'modules'],
    queryFn: getSecurityTrainingModules
  });
}

/**
 * Hook for fetching a specific security training module
 */
export function useSecurityTrainingModule(id: number) {
  return useQuery({
    queryKey: ['security-training', 'modules', id],
    queryFn: () => getSecurityTrainingModule(id),
    enabled: !!id
  });
}

/**
 * Hook for fetching quiz questions for a module
 */
export function useQuizQuestions(moduleId: number) {
  return useQuery({
    queryKey: ['security-training', 'modules', moduleId, 'questions'],
    queryFn: () => getQuizQuestions(moduleId),
    enabled: !!moduleId
  });
}

/**
 * Hook for submitting quiz answers
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ moduleId, answers }: { moduleId: number, answers: QuizAnswer[] }) => 
      submitQuiz(moduleId, answers),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['security-training', 'progress'] });
      queryClient.invalidateQueries({ 
        queryKey: ['security-training', 'modules', variables.moduleId, 'progress'] 
      });
      
      // Show success toast
      toast({
        title: data.passed ? 'Quiz Completed Successfully' : 'Quiz Completed',
        description: data.passed 
          ? `You scored ${data.score}% and passed the quiz!` 
          : `You scored ${data.score}%. You need 70% to pass.`,
        variant: data.passed ? 'default' : 'destructive'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit quiz',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });
}

/**
 * Hook for fetching user's progress for all modules
 */
export function useUserProgress() {
  return useQuery({
    queryKey: ['security-training', 'progress'],
    queryFn: getUserProgress
  });
}

/**
 * Hook for fetching user's progress for a specific module
 */
export function useUserModuleProgress(moduleId: number) {
  return useQuery({
    queryKey: ['security-training', 'modules', moduleId, 'progress'],
    queryFn: () => getUserModuleProgress(moduleId),
    enabled: !!moduleId
  });
}

/**
 * Hook for updating user's progress for a module
 */
export function useUpdateUserProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ moduleId, progress }: { 
      moduleId: number, 
      progress: { progress: number; score?: number; completed?: boolean; notes?: string; } 
    }) => updateUserProgress(moduleId, progress),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['security-training', 'progress'] });
      queryClient.invalidateQueries({ 
        queryKey: ['security-training', 'modules', variables.moduleId, 'progress'] 
      });
      
      // Show success toast
      toast({
        title: 'Progress Updated',
        description: `Your progress has been updated to ${data.progress}%`
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update progress',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });
}

/**
 * Hook for marking a module as completed
 */
export function useCompleteModule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ moduleId, score }: { moduleId: number, score?: number }) => 
      completeModule(moduleId, score),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['security-training', 'progress'] });
      queryClient.invalidateQueries({ 
        queryKey: ['security-training', 'modules', variables.moduleId, 'progress'] 
      });
      
      // Show success toast
      toast({
        title: 'Module Completed',
        description: 'You have successfully completed this training module'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to complete module',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });
}

/**
 * Hook for fetching required modules for the current user
 */
export function useRequiredModules() {
  return useQuery({
    queryKey: ['security-training', 'required-modules'],
    queryFn: getRequiredModules
  });
}

/**
 * Hook for checking if user has completed all required training
 */
export function useTrainingCompliance() {
  return useQuery({
    queryKey: ['security-training', 'compliance'],
    queryFn: checkTrainingCompliance
  });
}
