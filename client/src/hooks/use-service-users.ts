/**
 * Service User hooks for React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceUserApi } from '@/api/service-user-api';
import { 
  ServiceUser, 
  CreateServiceUser, 
  UpdateServiceUser, 
  ServiceUserWithCarePlans 
} from '@shared/types/service-user';
import { useToast } from './use-toast';

// Query keys
export const serviceUserKeys = {
  all: ['service-users'] as const,
  lists: () => [...serviceUserKeys.all, 'list'] as const,
  list: (filters: string) => [...serviceUserKeys.lists(), { filters }] as const,
  details: () => [...serviceUserKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceUserKeys.details(), id] as const,
  withCarePlans: (id: number) => [...serviceUserKeys.detail(id), 'care-plans'] as const,
};

/**
 * Hook to fetch all service users
 */
export function useServiceUsers() {
  return useQuery({
    queryKey: serviceUserKeys.lists(),
    queryFn: async () => {
      const { data, error } = await serviceUserApi.getAll();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch a service user by ID
 */
export function useServiceUser(id: number) {
  return useQuery({
    queryKey: serviceUserKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await serviceUserApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch a service user with their care plans
 */
export function useServiceUserWithCarePlans(id: number) {
  return useQuery({
    queryKey: serviceUserKeys.withCarePlans(id),
    queryFn: async () => {
      const { data, error } = await serviceUserApi.getWithCarePlans(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to search service users
 */
export function useSearchServiceUsers(query: string) {
  return useQuery({
    queryKey: [...serviceUserKeys.lists(), { search: query }],
    queryFn: async () => {
      const { data, error } = await serviceUserApi.search(query);
      if (error) throw error;
      return data;
    },
    enabled: !!query,
  });
}

/**
 * Hook to create a service user
 */
export function useCreateServiceUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newServiceUser: CreateServiceUser) => {
      const { data, error } = await serviceUserApi.create(newServiceUser);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() });
      toast({
        title: 'Service User Created',
        description: `${data?.fullName} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Service User',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a service user
 */
export function useUpdateServiceUser(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateServiceUser) => {
      const response = await serviceUserApi.update(id, data);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() });
      toast({
        title: 'Service User Updated',
        description: `${data?.fullName} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Service User',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a service user
 */
export function useDeleteServiceUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await serviceUserApi.delete(id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() });
      queryClient.removeQueries({ queryKey: serviceUserKeys.detail(id) });
      toast({
        title: 'Service User Deleted',
        description: 'The service user has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Service User',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
