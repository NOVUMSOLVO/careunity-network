/**
 * Staff hooks for React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/api/staff-api';
import { 
  Staff, 
  CreateStaff, 
  UpdateStaff 
} from '@shared/types/staff';
import { useToast } from './use-toast';

// Query keys
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: string) => [...staffKeys.lists(), { filters }] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: number) => [...staffKeys.details(), id] as const,
  byRole: (role: string) => [...staffKeys.lists(), { role }] as const,
};

/**
 * Hook to fetch all staff members
 */
export function useStaff() {
  return useQuery({
    queryKey: staffKeys.lists(),
    queryFn: async () => {
      const { data, error } = await staffApi.getAll();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch staff members by role
 */
export function useStaffByRole(role: string) {
  return useQuery({
    queryKey: staffKeys.byRole(role),
    queryFn: async () => {
      const { data, error } = await staffApi.getByRole(role);
      if (error) throw error;
      return data;
    },
    enabled: !!role,
  });
}

/**
 * Hook to fetch a staff member by ID
 */
export function useStaffMember(id: number) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await staffApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newStaff: CreateStaff) => {
      const { data, error } = await staffApi.create(newStaff);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      
      // If the staff member has a role, invalidate that list too
      if (data?.role) {
        queryClient.invalidateQueries({ queryKey: staffKeys.byRole(data.role) });
      }
      
      toast({
        title: 'Staff Member Created',
        description: `${data?.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Staff Member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a staff member
 */
export function useUpdateStaff(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateStaff) => {
      const response = await staffApi.update(id, data);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      
      // If the staff member has a role, invalidate that list too
      if (data?.role) {
        queryClient.invalidateQueries({ queryKey: staffKeys.byRole(data.role) });
      }
      
      toast({
        title: 'Staff Member Updated',
        description: `${data?.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Staff Member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get the staff data before deleting it
      const { data: staff } = await staffApi.getById(id);
      
      // Delete the staff member
      const { error } = await staffApi.delete(id);
      if (error) throw error;
      
      return { id, staff };
    },
    onSuccess: ({ id, staff }) => {
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      
      // If the staff member had a role, invalidate that list too
      if (staff?.role) {
        queryClient.invalidateQueries({ queryKey: staffKeys.byRole(staff.role) });
      }
      
      toast({
        title: 'Staff Member Deleted',
        description: 'The staff member has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Staff Member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
