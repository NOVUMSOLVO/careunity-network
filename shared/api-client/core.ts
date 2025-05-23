/**
 * Core API client
 * Platform-agnostic API client that can be used with platform-specific adapters
 */

import { 
  ApiAdapter, 
  ApiClientOptions, 
  ApiRequestOptions, 
  ApiResponse, 
  ApiError 
} from '../types/api';

/**
 * Core API client class
 */
export class ApiClient {
  private adapter: ApiAdapter;
  private options: ApiClientOptions;
  
  constructor(adapter: ApiAdapter, options: ApiClientOptions) {
    this.adapter = adapter;
    this.options = options;
  }
  
  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.adapter.request<T>('GET', this.buildUrl(endpoint), undefined, options);
  }
  
  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.adapter.request<T>('POST', this.buildUrl(endpoint), data, options);
  }
  
  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.adapter.request<T>('PUT', this.buildUrl(endpoint), data, options);
  }
  
  /**
   * Make a PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.adapter.request<T>('PATCH', this.buildUrl(endpoint), data, options);
  }
  
  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.adapter.request<T>('DELETE', this.buildUrl(endpoint), undefined, options);
  }
  
  /**
   * Build the full URL for a request
   */
  private buildUrl(endpoint: string): string {
    // If the endpoint already starts with http, assume it's a full URL
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // If the endpoint starts with a slash, remove it to avoid double slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure the base URL ends with a slash
    const baseUrl = this.options.baseUrl.endsWith('/') 
      ? this.options.baseUrl 
      : `${this.options.baseUrl}/`;
    
    return `${baseUrl}${normalizedEndpoint}`;
  }
}

/**
 * Create an API error
 */
export function createApiError(message: string, status: number, code: string = 'internal_error', details?: any): ApiError {
  return {
    error: code as any,
    message,
    details,
  };
}
