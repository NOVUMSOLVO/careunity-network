import { QueryClient, type QueryFunction, type QueryKey } from "@tanstack/react-query";

interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Make a request to the API using fetch directly
 * @deprecated Use apiClient methods from api-client.ts instead
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.warn("apiRequest is deprecated, use apiClient methods instead");
  
  const options: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };
  
  if (data && method.toUpperCase() !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  return fetch(url, options);
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function for React Query
 */
export function getQueryFn<T = unknown>(options: { 
  on401?: UnauthorizedBehavior;
  onError?: (error: Error) => void;
} = {}): QueryFunction<T> {
  return async ({ queryKey }: { queryKey: QueryKey }) => {
    const endpoint = queryKey[0] as string;
    
    // Extract params from queryKey if present
    const params: Record<string, string> = {};
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      Object.assign(params, queryKey[1] as Record<string, string>);
    }
    
    // Build URL with query parameters
    let url = endpoint;
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url = `${url}?${queryParams.toString()}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Handle 401 unauthorized specifically
        if (response.status === 401 && options.on401 === 'returnNull') {
          return null as any;
        }
        
        // Try to parse error message from response
        let errorMessage = 'Error fetching data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If can't parse error JSON, use status text
          errorMessage = response.statusText;
        }
        
        const error = new Error(errorMessage);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return null as any;
      }
      
      // Parse the response
      const data = await response.json();
      return data;
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      
      throw error;
    }
  };
}

// Configure the React Query client with simplified settings to fix TypeScript errors
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Using type assertion to avoid TypeScript errors
      queryFn: getQueryFn({ on401: "throw" }) as QueryFunction<unknown>,
      // Simplified settings
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 300000, // 5 minutes
      gcTime: 3600000,   // 1 hour (renamed from cacheTime in v5)
      retry: 3,
    },
    mutations: {
      retry: 2
    },
  },
});
