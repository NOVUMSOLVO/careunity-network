import { useState } from 'react';
import { useSync } from '../contexts/sync-context';
import { apiClient } from '../lib/api-client';

/**
 * Hook for making API calls with offline support
 * Automatically queues operations when offline and syncs when online
 */
export function useSyncApi() {
  const { isOnline, queueOperation } = useSync();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Make a GET request
   * @param url API endpoint
   * @param options Request options
   * @returns Response data
   */
  const get = async <T>(url: string, options: RequestInit = {}): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // For GET requests, we try to use the API client directly
      // If offline, it will use cached data if available
      const response = await apiClient.get<T>(url, options);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Make a POST request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @param entityType Type of entity being created
   * @returns Response data or operation ID if offline
   */
  const post = async <T>(
    url: string, 
    data: any, 
    options: RequestInit = {},
    entityType?: string
  ): Promise<T | string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // If online, make the request directly
        const response = await apiClient.post<T>(url, data, options);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setIsLoading(false);
        return response.data;
      } else {
        // If offline, queue the operation
        const operationId = await queueOperation(
          url,
          'POST',
          data,
          options.headers as Record<string, string>,
          entityType
        );
        
        setIsLoading(false);
        return operationId;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Make a PUT request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @param entityType Type of entity being updated
   * @param entityId ID of entity being updated
   * @returns Response data or operation ID if offline
   */
  const put = async <T>(
    url: string, 
    data: any, 
    options: RequestInit = {},
    entityType?: string,
    entityId?: string | number
  ): Promise<T | string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // If online, make the request directly
        const response = await apiClient.put<T>(url, data, options);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setIsLoading(false);
        return response.data;
      } else {
        // If offline, queue the operation
        const operationId = await queueOperation(
          url,
          'PUT',
          data,
          options.headers as Record<string, string>,
          entityType,
          entityId
        );
        
        setIsLoading(false);
        return operationId;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Make a PATCH request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @param entityType Type of entity being updated
   * @param entityId ID of entity being updated
   * @returns Response data or operation ID if offline
   */
  const patch = async <T>(
    url: string, 
    data: any, 
    options: RequestInit = {},
    entityType?: string,
    entityId?: string | number
  ): Promise<T | string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // If online, make the request directly
        const response = await apiClient.patch<T>(url, data, options);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setIsLoading(false);
        return response.data;
      } else {
        // If offline, queue the operation
        const operationId = await queueOperation(
          url,
          'PATCH',
          data,
          options.headers as Record<string, string>,
          entityType,
          entityId
        );
        
        setIsLoading(false);
        return operationId;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Make a DELETE request
   * @param url API endpoint
   * @param options Request options
   * @param entityType Type of entity being deleted
   * @param entityId ID of entity being deleted
   * @returns Response data or operation ID if offline
   */
  const del = async <T>(
    url: string, 
    options: RequestInit = {},
    entityType?: string,
    entityId?: string | number
  ): Promise<T | string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // If online, make the request directly
        const response = await apiClient.delete<T>(url, options);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setIsLoading(false);
        return response.data;
      } else {
        // If offline, queue the operation
        const operationId = await queueOperation(
          url,
          'DELETE',
          undefined,
          options.headers as Record<string, string>,
          entityType,
          entityId
        );
        
        setIsLoading(false);
        return operationId;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    isLoading,
    error,
  };
}
