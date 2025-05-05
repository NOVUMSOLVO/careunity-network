import { QueryClient, type QueryFunction } from "@tanstack/react-query";

/**
 * Create a singleton QueryClient instance to be shared across the app
 * This breaks circular dependencies by isolating the QueryClient configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default query function
      queryFn: (async ({ queryKey }) => {
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
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          
          let errorMessage = 'Error fetching data';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText;
          }
          
          throw new Error(errorMessage);
        }
        
        if (response.status === 204) {
          return null;
        }
        
        return await response.json();
      }) as QueryFunction,
      
      // Standard defaults
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 300000, // 5 minutes
      gcTime: 3600000,   // 1 hour
      retry: 3,
    },
    mutations: {
      retry: 2
    },
  },
});