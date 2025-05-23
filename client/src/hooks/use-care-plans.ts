/**
 * Care Plan hooks for React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carePlanApi } from '@/api/care-plan-api';
import { 
  CarePlan, 
  CreateCarePlan, 
  UpdateCarePlan, 
  CarePlanWithGoalsAndTasks,
  Goal,
  CreateGoal,
  UpdateGoal,
  Task,
  CreateTask,
  UpdateTask
} from '@shared/types/care-plan';
import { useToast } from './use-toast';
import { serviceUserKeys } from './use-service-users';

// Query keys
export const carePlanKeys = {
  all: ['care-plans'] as const,
  lists: () => [...carePlanKeys.all, 'list'] as const,
  list: (filters: any) => [...carePlanKeys.lists(), { filters }] as const,
  listByServiceUser: (serviceUserId: number) => [...carePlanKeys.lists(), { serviceUserId }] as const,
  details: () => [...carePlanKeys.all, 'detail'] as const,
  detail: (id: number) => [...carePlanKeys.details(), id] as const,
  withGoalsAndTasks: (id: number) => [...carePlanKeys.detail(id), 'goals-tasks'] as const,
  goals: (carePlanId: number) => [...carePlanKeys.detail(carePlanId), 'goals'] as const,
  goal: (goalId: number) => ['goals', goalId] as const,
  tasks: (goalId: number) => [...carePlanKeys.goal(goalId), 'tasks'] as const,
  task: (taskId: number) => ['tasks', taskId] as const,
};

/**
 * Hook to fetch all care plans
 */
export function useCarePlans(serviceUserId?: number) {
  return useQuery({
    queryKey: serviceUserId 
      ? carePlanKeys.listByServiceUser(serviceUserId) 
      : carePlanKeys.lists(),
    queryFn: async () => {
      const { data, error } = await carePlanApi.getAll(serviceUserId);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch a care plan by ID
 */
export function useCarePlan(id: number) {
  return useQuery({
    queryKey: carePlanKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await carePlanApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch a care plan with its goals and tasks
 */
export function useCarePlanWithGoalsAndTasks(id: number) {
  return useQuery({
    queryKey: carePlanKeys.withGoalsAndTasks(id),
    queryFn: async () => {
      const { data, error } = await carePlanApi.getWithGoalsAndTasks(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a care plan
 */
export function useCreateCarePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newCarePlan: CreateCarePlan) => {
      const { data, error } = await carePlanApi.create(newCarePlan);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carePlanKeys.lists() });
      
      if (data?.serviceUserId) {
        queryClient.invalidateQueries({ 
          queryKey: carePlanKeys.listByServiceUser(data.serviceUserId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: serviceUserKeys.withCarePlans(data.serviceUserId) 
        });
      }
      
      toast({
        title: 'Care Plan Created',
        description: `${data?.title} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Care Plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a care plan
 */
export function useUpdateCarePlan(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateCarePlan) => {
      const response = await carePlanApi.update(id, data);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carePlanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: carePlanKeys.lists() });
      
      if (data?.serviceUserId) {
        queryClient.invalidateQueries({ 
          queryKey: carePlanKeys.listByServiceUser(data.serviceUserId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: serviceUserKeys.withCarePlans(data.serviceUserId) 
        });
      }
      
      toast({
        title: 'Care Plan Updated',
        description: `${data?.title} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Care Plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a care plan
 */
export function useDeleteCarePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await carePlanApi.delete(id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: carePlanKeys.lists() });
      queryClient.removeQueries({ queryKey: carePlanKeys.detail(id) });
      toast({
        title: 'Care Plan Deleted',
        description: 'The care plan has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Care Plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to create a goal
 */
export function useCreateGoal(carePlanId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newGoal: CreateGoal) => {
      const { data, error } = await carePlanApi.createGoal(carePlanId, newGoal);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carePlanKeys.withGoalsAndTasks(carePlanId) });
      queryClient.invalidateQueries({ queryKey: carePlanKeys.goals(carePlanId) });
      toast({
        title: 'Goal Created',
        description: 'The goal has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Goal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to create a task
 */
export function useCreateTask(goalId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newTask: CreateTask) => {
      const { data, error } = await carePlanApi.createTask(goalId, newTask);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carePlanKeys.tasks(goalId) });
      // Also invalidate the parent care plan with goals and tasks
      const goal = queryClient.getQueryData<Goal>(carePlanKeys.goal(goalId));
      if (goal?.carePlanId) {
        queryClient.invalidateQueries({ 
          queryKey: carePlanKeys.withGoalsAndTasks(goal.carePlanId) 
        });
      }
      toast({
        title: 'Task Created',
        description: 'The task has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
