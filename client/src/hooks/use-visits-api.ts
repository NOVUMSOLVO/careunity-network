/**
 * Hook for visits API
 * Provides React Query hooks for interacting with the visits API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Visit, 
  CreateVisitRequest, 
  UpdateVisitRequest, 
  CompleteVisitRequest,
  VisitQueryParams
} from '@shared/api-client/services/visit-api';

/**
 * Hook for visits API
 */
export function useVisitsApi() {
  const queryClient = useQueryClient();
  
  /**
   * Get all visits
   */
  const useVisits = (params?: VisitQueryParams) => {
    return useQuery({
      queryKey: ['/api/visits', params],
      queryFn: async () => {
        const response = await api.visits.getAll(params);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      }
    });
  };
  
  /**
   * Get a visit by ID
   */
  const useVisit = (id: number) => {
    return useQuery({
      queryKey: [`/api/visits/${id}`],
      queryFn: async () => {
        const response = await api.visits.getById(id);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      enabled: !!id
    });
  };
  
  /**
   * Create a new visit
   */
  const useCreateVisit = () => {
    return useMutation({
      mutationFn: async (data: CreateVisitRequest) => {
        const response = await api.visits.create(data);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      onSuccess: () => {
        // Invalidate visits queries
        queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      }
    });
  };
  
  /**
   * Update a visit
   */
  const useUpdateVisit = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: UpdateVisitRequest }) => {
        const response = await api.visits.update(id, data);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific visit query
        queryClient.invalidateQueries({ queryKey: [`/api/visits/${data.id}`] });
        // Invalidate visits list queries
        queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      }
    });
  };
  
  /**
   * Complete a visit
   */
  const useCompleteVisit = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: CompleteVisitRequest }) => {
        const response = await api.visits.complete(id, data);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific visit query
        queryClient.invalidateQueries({ queryKey: [`/api/visits/${data.id}`] });
        // Invalidate visits list queries
        queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      }
    });
  };
  
  /**
   * Cancel a visit
   */
  const useCancelVisit = () => {
    return useMutation({
      mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
        const response = await api.visits.cancel(id, reason);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific visit query
        queryClient.invalidateQueries({ queryKey: [`/api/visits/${data.id}`] });
        // Invalidate visits list queries
        queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      }
    });
  };
  
  /**
   * Get visits for a service user
   */
  const useServiceUserVisits = (serviceUserId: number, params?: { date?: string; startDate?: string; endDate?: string }) => {
    return useQuery({
      queryKey: [`/api/visits/service-user/${serviceUserId}`, params],
      queryFn: async () => {
        const response = await api.visits.getForServiceUser(serviceUserId, params);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      enabled: !!serviceUserId
    });
  };
  
  /**
   * Get visits for a caregiver
   */
  const useCaregiverVisits = (caregiverId: number, params?: { date?: string; startDate?: string; endDate?: string }) => {
    return useQuery({
      queryKey: [`/api/visits/caregiver/${caregiverId}`, params],
      queryFn: async () => {
        const response = await api.visits.getForCaregiver(caregiverId, params);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      },
      enabled: !!caregiverId
    });
  };
  
  return {
    useVisits,
    useVisit,
    useCreateVisit,
    useUpdateVisit,
    useCompleteVisit,
    useCancelVisit,
    useServiceUserVisits,
    useCaregiverVisits
  };
}
