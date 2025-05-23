/**
 * Offline-aware API client
 * Extends the regular API client with offline capabilities
 */

import { apiClient } from './api';
import offlineStorage from './offline-storage';
import { ApiResponse } from '@shared/types/api';

// Map API endpoints to IndexedDB stores
const endpointToStore: Record<string, string> = {
  '/api/service-users': 'service-users',
  '/api/care-plans': 'care-plans',
  '/api/appointments': 'appointments',
  '/api/staff': 'staff',
};

// Helper to extract ID from URL
const extractIdFromUrl = (url: string): number | null => {
  const match = url.match(/\/(\d+)(?:\/|$)/);
  return match ? parseInt(match[1], 10) : null;
};

// Helper to get store name from URL
const getStoreNameFromUrl = (url: string): string | null => {
  for (const [endpoint, store] of Object.entries(endpointToStore)) {
    if (url.startsWith(endpoint)) {
      return store;
    }
  }
  return null;
};

// Offline-aware API client
export const offlineApiClient = {
  /**
   * GET request with offline support
   */
  async get<T>(url: string, options: any = {}): Promise<ApiResponse<T>> {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to make the actual API request
        const response = await apiClient.get<T>(url, options);
        
        // If successful, cache the response
        if (!response.error && response.data) {
          const storeName = getStoreNameFromUrl(url);
          if (storeName) {
            // If it's a collection endpoint, cache all items
            if (!url.includes('/')) {
              const items = response.data as any[];
              if (Array.isArray(items)) {
                for (const item of items) {
                  await offlineStorage.set(storeName as any, item);
                }
              }
            } 
            // If it's a single item endpoint, cache the item
            else {
              await offlineStorage.set(storeName as any, response.data);
            }
          }
          
          // Also cache the raw response
          await offlineStorage.cacheResponse(
            url + JSON.stringify(options.params || {}),
            options.params,
            response.data
          );
        }
        
        return response;
      } catch (error) {
        console.error('Error making online request, falling back to offline data:', error);
        // Fall back to offline data if the request fails
      }
    }
    
    // If we're offline or the online request failed, try to get from cache
    try {
      const cachedResponse = await offlineStorage.getCachedResponse(
        url + JSON.stringify(options.params || {})
      );
      
      if (cachedResponse) {
        return { data: cachedResponse, error: null, status: 200 };
      }
      
      // If no cached response, try to get from the appropriate store
      const storeName = getStoreNameFromUrl(url);
      if (storeName) {
        const id = extractIdFromUrl(url);
        
        if (id) {
          // Get a single item
          const item = await offlineStorage.get(storeName as any, id);
          if (item) {
            return { data: item as T, error: null, status: 200 };
          }
        } else {
          // Get all items
          const items = await offlineStorage.getAll(storeName as any);
          return { data: items as T, error: null, status: 200 };
        }
      }
      
      // If we couldn't find any data, return an error
      return {
        data: null,
        error: { message: 'No offline data available for this request', error: 'offline_data_unavailable' },
        status: 404,
      };
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return {
        data: null,
        error: { message: 'Error retrieving offline data', error: 'offline_error' },
        status: 500,
      };
    }
  },
  
  /**
   * POST request with offline support
   */
  async post<T>(url: string, data: any, options: any = {}): Promise<ApiResponse<T>> {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to make the actual API request
        const response = await apiClient.post<T>(url, data, options);
        return response;
      } catch (error) {
        console.error('Error making online POST request, storing for later sync:', error);
        // Fall back to offline mode
      }
    }
    
    // If we're offline or the online request failed, store the change for later sync
    try {
      const storeName = getStoreNameFromUrl(url);
      if (storeName) {
        // Generate a temporary ID for the new item
        const tempId = -Date.now(); // Negative to avoid conflicts with real IDs
        const newItem = { ...data, id: tempId };
        
        // Store the item in the appropriate store
        await offlineStorage.set(storeName as any, newItem);
        
        // Add to pending changes
        await offlineStorage.addPendingChange(storeName, 'create', newItem);
        
        return { data: newItem as T, error: null, status: 201 };
      }
      
      return {
        data: null,
        error: { message: 'Cannot store this type of data offline', error: 'offline_unsupported' },
        status: 400,
      };
    } catch (error) {
      console.error('Error storing offline data:', error);
      return {
        data: null,
        error: { message: 'Error storing offline data', error: 'offline_error' },
        status: 500,
      };
    }
  },
  
  /**
   * PUT request with offline support
   */
  async put<T>(url: string, data: any, options: any = {}): Promise<ApiResponse<T>> {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to make the actual API request
        const response = await apiClient.put<T>(url, data, options);
        return response;
      } catch (error) {
        console.error('Error making online PUT request, storing for later sync:', error);
        // Fall back to offline mode
      }
    }
    
    // If we're offline or the online request failed, store the change for later sync
    try {
      const storeName = getStoreNameFromUrl(url);
      const id = extractIdFromUrl(url);
      
      if (storeName && id) {
        // Update the item in the appropriate store
        await offlineStorage.set(storeName as any, { ...data, id });
        
        // Add to pending changes
        await offlineStorage.addPendingChange(storeName, 'update', { ...data, id });
        
        return { data: { ...data, id } as T, error: null, status: 200 };
      }
      
      return {
        data: null,
        error: { message: 'Cannot update this data offline', error: 'offline_unsupported' },
        status: 400,
      };
    } catch (error) {
      console.error('Error updating offline data:', error);
      return {
        data: null,
        error: { message: 'Error updating offline data', error: 'offline_error' },
        status: 500,
      };
    }
  },
  
  /**
   * PATCH request with offline support
   */
  async patch<T>(url: string, data: any, options: any = {}): Promise<ApiResponse<T>> {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to make the actual API request
        const response = await apiClient.patch<T>(url, data, options);
        return response;
      } catch (error) {
        console.error('Error making online PATCH request, storing for later sync:', error);
        // Fall back to offline mode
      }
    }
    
    // If we're offline or the online request failed, store the change for later sync
    try {
      const storeName = getStoreNameFromUrl(url);
      const id = extractIdFromUrl(url);
      
      if (storeName && id) {
        // Get the existing item
        const existingItem = await offlineStorage.get(storeName as any, id);
        
        if (existingItem) {
          // Merge the existing item with the new data
          const updatedItem = { ...existingItem, ...data, id };
          
          // Update the item in the appropriate store
          await offlineStorage.set(storeName as any, updatedItem);
          
          // Add to pending changes
          await offlineStorage.addPendingChange(storeName, 'update', updatedItem);
          
          return { data: updatedItem as T, error: null, status: 200 };
        }
        
        return {
          data: null,
          error: { message: 'Item not found in offline storage', error: 'offline_not_found' },
          status: 404,
        };
      }
      
      return {
        data: null,
        error: { message: 'Cannot update this data offline', error: 'offline_unsupported' },
        status: 400,
      };
    } catch (error) {
      console.error('Error updating offline data:', error);
      return {
        data: null,
        error: { message: 'Error updating offline data', error: 'offline_error' },
        status: 500,
      };
    }
  },
  
  /**
   * DELETE request with offline support
   */
  async delete<T>(url: string, options: any = {}): Promise<ApiResponse<T>> {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to make the actual API request
        const response = await apiClient.delete<T>(url, options);
        return response;
      } catch (error) {
        console.error('Error making online DELETE request, storing for later sync:', error);
        // Fall back to offline mode
      }
    }
    
    // If we're offline or the online request failed, store the change for later sync
    try {
      const storeName = getStoreNameFromUrl(url);
      const id = extractIdFromUrl(url);
      
      if (storeName && id) {
        // Get the existing item before deleting it
        const existingItem = await offlineStorage.get(storeName as any, id);
        
        if (existingItem) {
          // Delete the item from the appropriate store
          await offlineStorage.delete(storeName as any, id);
          
          // Add to pending changes
          await offlineStorage.addPendingChange(storeName, 'delete', { id });
          
          return { data: null, error: null, status: 204 };
        }
        
        return {
          data: null,
          error: { message: 'Item not found in offline storage', error: 'offline_not_found' },
          status: 404,
        };
      }
      
      return {
        data: null,
        error: { message: 'Cannot delete this data offline', error: 'offline_unsupported' },
        status: 400,
      };
    } catch (error) {
      console.error('Error deleting offline data:', error);
      return {
        data: null,
        error: { message: 'Error deleting offline data', error: 'offline_error' },
        status: 500,
      };
    }
  },
};

export default offlineApiClient;
