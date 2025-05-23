/**
 * Web API client instance
 */

import { createWebApiClient } from '@shared/api-client';
import { createApiServices, ApiServices } from '@shared/api-client/services';
import { ApiError } from '@shared/types/api';

// Create the API client instance
export const apiClient = createWebApiClient({
  baseUrl: '',  // Empty string for same-origin requests
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  onUnauthorized: () => {
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  },
  onError: (error: ApiError) => {
    console.error('[API] Error:', error);

    // Handle specific error cases
    if (error.error === 'unauthorized') {
      // Clear any cached user data
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cache:/api/user');
      }

      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
  }
});

// Create API services
export const api: ApiServices = createApiServices(apiClient);

/**
 * Helper function to create a query function for React Query
 */
export function createQueryFn<T>(options: {
  onError?: (error: Error) => void;
  on401?: 'returnNull' | 'throw';
} = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | null> => {
    const endpoint = queryKey[0];

    // Extract params from queryKey if present
    const params: Record<string, string> = {};
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      Object.assign(params, queryKey[1]);
    }

    const { data, error, status } = await apiClient.get<T>(endpoint, { params });

    if (error) {
      if (status === 401 && options.on401 === 'returnNull') {
        return null;
      }

      if (options.onError) {
        options.onError(new Error(error.message));
      }

      throw new Error(error.message);
    }

    return data;
  };
}

/**
 * Helper function to create a mutation function for React Query
 */
export function createMutationFn<TData, TVariables>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string
) {
  return async (variables: TVariables): Promise<TData> => {
    let response;

    switch (method) {
      case 'POST':
        response = await apiClient.post<TData>(endpoint, variables);
        break;
      case 'PUT':
        response = await apiClient.put<TData>(endpoint, variables);
        break;
      case 'PATCH':
        response = await apiClient.patch<TData>(endpoint, variables);
        break;
      case 'DELETE':
        response = await apiClient.delete<TData>(endpoint);
        break;
    }

    const { data, error } = response;

    if (error) {
      throw new Error(error.message);
    }

    return data as TData;
  };
}
