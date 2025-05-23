/**
 * Mobile-specific adapter for the shared API client
 * Uses axios for making requests and AsyncStorage for caching
 */

import { ApiAdapter, ApiResponse, ApiRequestOptions } from '../types/api';
import { createApiError } from './core';

// This is a placeholder implementation that will be replaced with actual mobile code
// The actual implementation would import AsyncStorage and axios
export class MobileApiAdapter implements ApiAdapter {
  private getAuthToken: () => Promise<string | null>;

  constructor(getAuthToken: () => Promise<string | null>) {
    this.getAuthToken = getAuthToken;
  }

  /**
   * Make a request using axios
   */
  async request<T>(
    method: string,
    url: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // In the actual implementation, we would:
      // 1. Check network connectivity using NetInfo
      // 2. Get cached data from AsyncStorage if offline
      // 3. Add auth token to headers
      // 4. Make the request using axios
      // 5. Handle errors and cache responses

      // This is a placeholder that would be replaced with actual implementation
      console.log(`[Mobile API] ${method} ${url}`);

      // Simulate a successful response
      return {
        data: { success: true } as unknown as T,
        error: null,
        status: 200
      };
    } catch (error) {
      console.error(`[Mobile API] ${method} ${url} failed:`, error);

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

/**
 * Actual implementation for React Native would look like:
 */
/*
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApiAdapter, ApiResponse, ApiRequestOptions } from '../types/api';
import { createApiError } from './core';

export class MobileApiAdapter implements ApiAdapter {
  private getAuthToken: () => Promise<string | null>;

  constructor(getAuthToken: () => Promise<string | null>) {
    this.getAuthToken = getAuthToken;
  }

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

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        // If we have cached data for this request and caching is enabled, return it
        if (options.cache !== false) {
          const cachedData = await AsyncStorage.getItem(`cache:${fullUrl}`);
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

      // Get auth token
      const token = await this.getAuthToken();

      // Default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Prepare request config
      const config: AxiosRequestConfig = {
        method,
        url: fullUrl,
        headers,
        timeout: options.timeout || 10000,
      };

      // Add data for non-GET requests
      if (data !== undefined && method !== 'GET') {
        config.data = data;
      }

      // Make the request
      const response: AxiosResponse<T> = await axios(config);

      // Cache the response if it's a GET request and caching is enabled
      if (method === 'GET' && options.cache !== false) {
        try {
          await AsyncStorage.setItem(`cache:${fullUrl}`, JSON.stringify(response.data));
        } catch (e) {
          console.warn('[API] Failed to cache response:', e);
        }
      }

      return { data: response.data, error: null, status: response.status };
    } catch (error) {
      console.error(`[API] ${method} ${fullUrl} failed:`, error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 0;
        const message = axiosError.response?.data?.message || axiosError.message;

        return {
          data: null,
          error: createApiError(message, status),
          status
        };
      }

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
*/
