/**
 * API client index file
 * Re-exports all API client components and provides factory functions
 */

// Re-export types
export * from '../types/api';

// Re-export core components
export * from './core';
export * from './web-adapter';
export * from './mobile-adapter';

// Import components
import { ApiClient, createApiError } from './core';
import { WebApiAdapter } from './web-adapter';
import { MobileApiAdapter } from './mobile-adapter';
import { ApiClientOptions } from '../types/api';

/**
 * Create a web API client
 */
export function createWebApiClient(options: ApiClientOptions) {
  const adapter = new WebApiAdapter();
  return new ApiClient(adapter, options);
}

/**
 * Create a mobile API client
 */
export function createMobileApiClient(
  options: ApiClientOptions,
  getAuthToken: () => Promise<string | null>
) {
  const adapter = new MobileApiAdapter(getAuthToken);
  return new ApiClient(adapter, options);
}
