import { QueryClient, type QueryFunction, type QueryKey } from "@tanstack/react-query";
import { apiClient } from "./api-client";

interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Make a request to the API
 * @deprecated Use apiClient methods from api-client.ts instead
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.warn("apiRequest is deprecated, use apiClient methods instead");
  
  let response: ApiResponse;
  switch (method.toUpperCase()) {
    case 'GET':
      response = await apiClient.get(url);
      break;
    case 'POST':
      response = await apiClient.post(url, data);
      break;
    case 'PUT':
      response = await apiClient.put(url, data);
      break;
    case 'PATCH':
      response = await apiClient.patch(url, data);
      break;
    case 'DELETE':
      response = await apiClient.delete(url);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
  
  // If there was an error, throw it
  if (response.error) {
    throw response.error;
  }
  
  // Create a mock Response object to maintain compatibility
  const mockResponse = {
    ok: !response.error,
    status: response.status,
    statusText: response.error && response.error instanceof Error ? response.error.message : "OK",
    json: () => Promise.resolve(response.data),
    text: () => Promise.resolve(JSON.stringify(response.data)),
  } as unknown as Response;
  
  return mockResponse;
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function for React Query
 */
export function createQueryFn<T = unknown>(options: { 
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
    
    return data as T;
  };
}

// Configure the React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // @ts-ignore - TypeScript has an issue with the type, but it works at runtime
      queryFn: createQueryFn({ on401: "throw" }),
      // Increased defaults for better offline experience
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      retry: (failureCount, error) => {
        // Only retry network errors, not 4xx/5xx responses
        return failureCount < 3 && navigator.onLine && 
          !(error instanceof Error && error.message.includes("Failed to fetch"));
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors up to 2 times, not 4xx/5xx responses
        return failureCount < 2 && navigator.onLine;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
