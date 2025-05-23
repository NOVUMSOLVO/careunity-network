/**
 * Appointment hooks for React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/api/appointment-api';
import { 
  Appointment, 
  CreateAppointment, 
  UpdateAppointment 
} from '@shared/types/appointment';
import { useToast } from './use-toast';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
  byServiceUser: (id: number) => [...appointmentKeys.lists(), { serviceUserId: id }] as const,
  byCaregiver: (id: number) => [...appointmentKeys.lists(), { caregiverId: id }] as const,
};

/**
 * Hook to fetch all appointments or appointments for a specific service user
 */
export function useAppointments(serviceUserId?: number, options = {}) {
  return useQuery({
    queryKey: serviceUserId 
      ? appointmentKeys.byServiceUser(serviceUserId) 
      : appointmentKeys.lists(),
    queryFn: async () => {
      const { data, error } = serviceUserId 
        ? await appointmentApi.getByServiceUser(serviceUserId)
        : await appointmentApi.getAll();
      if (error) throw error;
      return data;
    },
    ...options
  });
}

/**
 * Hook to fetch appointments for a specific caregiver
 */
export function useAppointmentsByCaregiver(caregiverId: number) {
  return useQuery({
    queryKey: appointmentKeys.byCaregiver(caregiverId),
    queryFn: async () => {
      const { data, error } = await appointmentApi.getByCaregiver(caregiverId);
      if (error) throw error;
      return data;
    },
    enabled: !!caregiverId,
  });
}

/**
 * Hook to fetch an appointment by ID
 */
export function useAppointment(id: number) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await appointmentApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create an appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newAppointment: CreateAppointment) => {
      const { data, error } = await appointmentApi.create(newAppointment);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all appointment lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // If the appointment is for a specific service user, invalidate that list too
      if (data?.serviceUserId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byServiceUser(data.serviceUserId) 
        });
      }
      
      // If the appointment has a caregiver, invalidate that list too
      if (data?.caregiverId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byCaregiver(data.caregiverId) 
        });
      }
      
      toast({
        title: 'Appointment Created',
        description: `${data?.title} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an appointment
 */
export function useUpdateAppointment(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateAppointment) => {
      const response = await appointmentApi.update(id, data);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate specific appointment
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      
      // Invalidate all appointment lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // If the appointment is for a specific service user, invalidate that list too
      if (data?.serviceUserId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byServiceUser(data.serviceUserId) 
        });
      }
      
      // If the appointment has a caregiver, invalidate that list too
      if (data?.caregiverId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byCaregiver(data.caregiverId) 
        });
      }
      
      toast({
        title: 'Appointment Updated',
        description: `${data?.title} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete an appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get the appointment data before deleting it
      const { data: appointment } = await appointmentApi.getById(id);
      
      // Delete the appointment
      const { error } = await appointmentApi.delete(id);
      if (error) throw error;
      
      return { id, appointment };
    },
    onSuccess: ({ id, appointment }) => {
      // Invalidate specific appointment
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) });
      
      // Invalidate all appointment lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // If the appointment was for a specific service user, invalidate that list too
      if (appointment?.serviceUserId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byServiceUser(appointment.serviceUserId) 
        });
      }
      
      // If the appointment had a caregiver, invalidate that list too
      if (appointment?.caregiverId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentKeys.byCaregiver(appointment.caregiverId) 
        });
      }
      
      toast({
        title: 'Appointment Deleted',
        description: 'The appointment has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update appointment status
 */
export function useUpdateAppointmentStatus(id: number) {
  const updateMutation = useUpdateAppointment(id);
  
  const updateStatus = (status: string) => {
    return updateMutation.mutate({ status });
  };
  
  return {
    ...updateMutation,
    updateStatus,
    markAsCompleted: () => updateStatus('completed'),
    markAsCancelled: () => updateStatus('cancelled'),
    markAsInProgress: () => updateStatus('in-progress'),
    markAsScheduled: () => updateStatus('scheduled'),
  };
}
