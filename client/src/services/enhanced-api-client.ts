/**
 * Enhanced API Client
 * 
 * This service provides an enhanced API client with offline support,
 * request caching, and automatic retry capabilities.
 */

import { offlineStorageService } from './offline-storage-service';
import { networkStatus } from '../utils/network-status';
import { logger } from '../utils/logger';

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  cache?: boolean;
  cacheTtl?: number; // in seconds
  offlineSupport?: boolean;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number; // in milliseconds
  timeout?: number; // in milliseconds
}

/**
 * API response interface
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  offline?: boolean;
  cached?: boolean;
}

/**
 * Default request options
 */
const defaultOptions: ApiRequestOptions = {
  headers: {},
  cache: true,
  cacheTtl: 5 * 60, // 5 minutes
  offlineSupport: true,
  retry: true,
  retryCount: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
};

/**
 * Enhanced API client class
 */
export class EnhancedApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  
  /**
   * Initialize the API client
   */
  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    
    logger.info('Enhanced API client initialized');
  }
  
  /**
   * Make a GET request
   */
  public async get<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }
  
  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }
  
  /**
   * Make a PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
  
  /**
   * Make a DELETE request
   */
  public async delete<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
  
  /**
   * Make a request to the API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Merge options with defaults
    const opts = { ...defaultOptions, ...options };
    
    // Build URL
    const url = this.buildUrl(endpoint, opts.params);
    
    // Build headers
    const headers = {
      ...this.defaultHeaders,
      ...opts.headers,
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Check if we're offline
    if (!networkStatus.isOnline()) {
      logger.warn(`Network is offline, handling request: ${method} ${url}`);
      return this.handleOfflineRequest<T>(method, url, headers, data, opts);
    }
    
    // Check if we have a cached response
    if (method === 'GET' && opts.cache) {
      const cachedResponse = await offlineStorageService.getCachedResponse(url);
      if (cachedResponse) {
        logger.info(`Using cached response for: ${url}`);
        return {
          data: cachedResponse as T,
          error: null,
          status: 200,
          cached: true,
        };
      }
    }
    
    // Make the request
    try {
      // Build request options
      const requestOptions: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
      requestOptions.signal = controller.signal;
      
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Parse response
      let responseData: T | null = null;
      
      if (response.status !== 204) { // No content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          try {
            responseData = JSON.parse(text) as T;
          } catch {
            responseData = text as unknown as T;
          }
        }
      }
      
      // Cache successful GET responses
      if (method === 'GET' && response.ok && opts.cache) {
        await offlineStorageService.cacheResponse(url, responseData, opts.cacheTtl);
      }
      
      return {
        data: responseData,
        error: null,
        status: response.status,
      };
    } catch (error) {
      logger.error(`API request failed: ${method} ${url}`, { error });
      
      // Handle network errors with retry
      if (error instanceof TypeError && error.message.includes('network') && opts.retry) {
        return this.retryRequest<T>(method, endpoint, data, opts);
      }
      
      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          data: null,
          error: new Error('Request timeout'),
          status: 408,
        };
      }
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        status: 0,
      };
    }
  }
  
  /**
   * Handle an offline request
   */
  private async handleOfflineRequest<T>(
    method: string,
    url: string,
    headers: Record<string, string>,
    data: any,
    options: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    // For GET requests, try to get from cache
    if (method === 'GET' && options.cache) {
      const cachedResponse = await offlineStorageService.getCachedResponse(url);
      if (cachedResponse) {
        logger.info(`Using cached response for offline request: ${url}`);
        return {
          data: cachedResponse as T,
          error: null,
          status: 200,
          offline: true,
          cached: true,
        };
      }
    }
    
    // For mutation requests, queue them for later if offline support is enabled
    if (method !== 'GET' && options.offlineSupport) {
      // Queue the request for later
      await offlineStorageService.addPendingRequest(url, method, headers, data);
      logger.info(`Queued offline request for later: ${method} ${url}`);
      
      return {
        data: null,
        error: new Error('Request queued for later when online'),
        status: 503,
        offline: true,
      };
    }
    
    // If we can't handle the request offline, return an error
    return {
      data: null,
      error: new Error('Network is offline and request cannot be handled offline'),
      status: 503,
      offline: true,
    };
  }
  
  /**
   * Retry a failed request
   */
  private async retryRequest<T>(
    method: string,
    endpoint: string,
    data: any,
    options: ApiRequestOptions,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    // Check if we've reached the maximum retry count
    if (retryCount >= (options.retryCount || 3)) {
      logger.warn(`Maximum retry count reached for: ${method} ${endpoint}`);
      return {
        data: null,
        error: new Error('Maximum retry count reached'),
        status: 0,
      };
    }
    
    // Wait before retrying
    const delay = options.retryDelay || 1000;
    await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, retryCount)));
    
    logger.info(`Retrying request (${retryCount + 1}/${options.retryCount}): ${method} ${endpoint}`);
    
    // Make the request again
    try {
      return await this.request<T>(method, endpoint, data, {
        ...options,
        retryCount: (options.retryCount || 3) - 1,
      });
    } catch (error) {
      // If the retry fails, try again with an increased retry count
      return this.retryRequest<T>(method, endpoint, data, options, retryCount + 1);
    }
  }
  
  /**
   * Build a URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Ensure endpoint starts with a slash if baseUrl doesn't end with one
    if (this.baseUrl && !this.baseUrl.endsWith('/') && !endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    // Combine baseUrl and endpoint
    let url = this.baseUrl + endpoint;
    
    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }
}

// Create and export a singleton instance
export const apiClient = new EnhancedApiClient();

export default apiClient;
