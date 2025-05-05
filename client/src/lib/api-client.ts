// NOTE: We are avoiding the import from queryClient to break circular dependency
// We'll use a direct window location change instead

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const API_BASE = '';

/**
 * Central API client for making requests to backend
 */
export const apiClient = {
  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  },
  
  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, {
      ...options,
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, {
      ...options,
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Make a PATCH request to the API
   */
  async patch<T>(endpoint: string, data: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, {
      ...options,
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  },
  
  /**
   * Generic request method for all HTTP methods
   */
  async request<T>(method: string, endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    // Build URL with query parameters if provided
    let url = `${API_BASE}${endpoint}`;
    
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url = `${url}?${queryParams.toString()}`;
    }
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    try {
      // Network check
      if (!navigator.onLine) {
        // If we have cached data for this request, return it
        const cachedData = localStorage.getItem(`cache:${url}`);
        if (cachedData) {
          console.log(`[API] Using cached data for ${url}`);
          return {
            data: JSON.parse(cachedData),
            error: null,
            status: 200
          };
        }
        
        throw new ApiError('Network unavailable. Please check your connection.', 0);
      }
      
      // Make the request
      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        ...options,
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = 'An error occurred';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = response.statusText;
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null, error: null, status: 204 };
      }
      
      // Parse the response
      const data = await response.json();
      
      // Cache the response if it's a GET request
      if (method === 'GET') {
        try {
          localStorage.setItem(`cache:${url}`, JSON.stringify(data));
        } catch (e) {
          console.warn('[API] Failed to cache response:', e);
        }
      }
      
      return { data, error: null, status: response.status };
    } catch (error) {
      console.error(`[API] ${method} ${url} failed:`, error);
      
      const isApiError = error instanceof ApiError;
      const status = isApiError ? error.status : 0;
      
      // Special case for unauthorized requests
      if (status === 401) {
        // Clear any cached user data from localStorage
        localStorage.removeItem('cache:/api/user');
        
        // If not already on the auth page, redirect there
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        status
      };
    }
  },
  
  /**
   * Clear all cached data
   */
  clearCache() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache:')) {
        localStorage.removeItem(key);
      }
    });
  },
  
  /**
   * Clear a specific item from cache
   */
  clearCacheItem(endpoint: string) {
    localStorage.removeItem(`cache:${API_BASE}${endpoint}`);
  }
};

/**
 * Helper function to handle API requests with React Query
 */
export function createQueryFn<T>(options: { onError?: (error: Error) => void, on401?: 'returnNull' | 'throw' } = {}) {
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
        options.onError(error);
      }
      
      throw error;
    }
    
    return data;
  };
}

/**
 * Helper function to handle API mutations with React Query
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
      throw error;
    }
    
    return data as TData;
  };
}