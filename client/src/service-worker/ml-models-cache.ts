/**
 * ML Models API Caching Strategy
 * 
 * This module defines caching strategies for ML models API endpoints
 * to enable offline functionality.
 */

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Cache names
export const ML_MODELS_CACHE = 'ml-models-cache-v1';
export const ML_MODELS_API_CACHE = 'ml-models-api-cache-v1';
export const ML_MODELS_IMAGES_CACHE = 'ml-models-images-cache-v1';

/**
 * Register ML models API caching routes
 */
export function registerMLModelsCacheRoutes() {
  // Cache ML models list (NetworkFirst strategy with fallback)
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/v2/ml-models') && !url.pathname.includes('/predict'),
    new NetworkFirst({
      cacheName: ML_MODELS_API_CACHE,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }),
      ],
    })
  );

  // Cache ML model predictions (StaleWhileRevalidate strategy)
  // This allows quick responses from cache while updating in the background
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/v2/ml-models/predict'),
    new StaleWhileRevalidate({
      cacheName: ML_MODELS_API_CACHE,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // Cache ML model images and visualizations (CacheFirst strategy)
  registerRoute(
    ({ request, url }) => 
      request.destination === 'image' && 
      url.pathname.includes('/ml-models/'),
    new CacheFirst({
      cacheName: ML_MODELS_IMAGES_CACHE,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );
}

/**
 * Prefetch critical ML models data for offline use
 */
export async function prefetchMLModelsData() {
  try {
    // Prefetch ML models list
    await fetch('/api/v2/ml-models');
    
    // Prefetch model families
    await fetch('/api/v2/ml-models/registry');
    
    console.log('ML models data prefetched for offline use');
  } catch (error) {
    console.error('Failed to prefetch ML models data:', error);
  }
}
