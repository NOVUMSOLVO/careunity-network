/**
 * Web-specific adapter for the shared API client
 * Uses the Fetch API for making requests
 */

import { ApiAdapter, ApiResponse, ApiRequestOptions } from '../types/api';
import { createApiError } from './core';

export class WebApiAdapter implements ApiAdapter {
  /**
   * Make a request using the Fetch API
   */
  async request<T>(
    method: string,
    url: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Build URL with query parameters if provided
    let fullUrl = url;

    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      fullUrl = `${url}?${queryParams.toString()}`;
    }

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      // Network check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // If we have cached data for this request and caching is enabled, return it
        if (options.cache !== false && typeof localStorage !== 'undefined') {
          const cachedData = localStorage.getItem(`cache:${fullUrl}`);
          if (cachedData) {
            console.log(`[API] Using cached data for ${fullUrl}`);
            return {
              data: JSON.parse(cachedData),
              error: null,
              status: 200
            };
          }
        }

        return {
          data: null,
          error: createApiError('Network unavailable. Please check your connection.', 0),
          status: 0
        };
      }

      // Prepare request options
      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };

      // Add body for non-GET requests
      if (data !== undefined && method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
      }

      // Make the request
      const response = await fetch(fullUrl, fetchOptions);

      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = 'An error occurred';
        let errorCode = 'internal_error';
        let errorDetails = undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorCode = errorData.error || errorCode;
          errorDetails = errorData.details;
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = response.statusText;
        }

        return {
          data: null,
          error: createApiError(errorMessage, response.status, errorCode, errorDetails),
          status: response.status
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null, error: null, status: 204 };
      }

      // Parse the response
      const responseData = await response.json();

      // Cache the response if it's a GET request and caching is enabled
      if (method === 'GET' && options.cache !== false && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`cache:${fullUrl}`, JSON.stringify(responseData));
        } catch (e) {
          console.warn('[API] Failed to cache response:', e);
        }
      }

      return { data: responseData, error: null, status: response.status };
    } catch (error) {
      console.error(`[API] ${method} ${fullUrl} failed:`, error);

      return {
        data: null,
        error: createApiError(
          error instanceof Error ? error.message : String(error),
          0
        ),
        status: 0
      };
    }
  }
}
