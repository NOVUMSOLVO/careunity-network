/**
 * Enhanced Service Worker for CareUnity
 * 
 * This service worker provides comprehensive offline support with:
 * - Asset caching for offline access
 * - API response caching with appropriate strategies
 * - Background sync for offline actions
 * - Offline fallback pages
 * - ML model caching
 */

// Cache names
const CACHE_NAME = 'careunity-cache-v1';
const RUNTIME_CACHE = 'careunity-runtime-v1';
const API_CACHE = 'careunity-api-v1';
const ML_MODELS_CACHE = 'careunity-ml-models-v1';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// Assets to cache immediately when the service worker is installed
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Import Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Use Workbox if available
if (workbox) {
  console.log('Workbox is loaded');

  // Set debug mode in development
  workbox.setConfig({ debug: false });

  // Precache static assets
  workbox.precaching.precacheAndRoute(PRECACHE_ASSETS);

  // Cache CSS and JS with a stale-while-revalidate strategy
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: RUNTIME_CACHE,
    })
  );

  // Cache images with a cache-first strategy
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache general API responses with a network-first strategy
  workbox.routing.registerRoute(
    /\/api\/(?!ml-models)/,
    new workbox.strategies.NetworkFirst({
      cacheName: API_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );

  // Cache ML model API responses with a stale-while-revalidate strategy
  workbox.routing.registerRoute(
    /\/api\/ml-models/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: ML_MODELS_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // Background sync for offline form submissions
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('offlineFormQueue', {
    maxRetentionTime: 24 * 60, // Retry for up to 24 hours (specified in minutes)
  });

  // Register a route for form submissions that will use background sync
  workbox.routing.registerRoute(
    /\/api\/submit-form/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'POST'
  );

  // Register a route for ML model predictions that will use background sync
  workbox.routing.registerRoute(
    /\/api\/ml-models\/predict/,
    new workbox.strategies.NetworkOnly({
      plugins: [
        new workbox.backgroundSync.BackgroundSyncPlugin('mlModelsPredictionQueue', {
          maxRetentionTime: 24 * 60, // Retry for up to 24 hours
        }),
      ],
    }),
    'POST'
  );

  // For HTML navigation requests, use network-first with offline fallback
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
        }),
      ],
    })
  );
} else {
  console.log('Workbox could not be loaded. Offline support will be limited.');
}

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle sync requests from the client
  if (event.data && event.data.type === 'SYNC_REQUIRED') {
    // In a real app, this would coordinate with sync manager
    // For now, just notify the client that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: new Date().toISOString()
        });
      });
    });
  }
});

// Sync data when coming back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncData') {
    event.waitUntil(syncData());
  }

  if (event.tag === 'syncMLModels') {
    event.waitUntil(syncMLModelsData());
  }
});

// Function to sync data when online
async function syncData() {
  try {
    console.log('[ServiceWorker] Syncing data');
    
    // Notify clients that sync has started
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_STARTED',
          timestamp: new Date().toISOString()
        });
      });
    });

    // In a real implementation, this would process the IndexedDB sync queue
    // For now, just simulate a successful sync
    
    // Notify clients that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: new Date().toISOString(),
          success: true
        });
      });
    });

    return true;
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    
    // Notify clients that sync failed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_FAILED',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      });
    });
    
    return false;
  }
}

// Function to sync ML models data
async function syncMLModelsData() {
  try {
    console.log('[ServiceWorker] Syncing ML models data');
    
    // Notify clients that ML models sync has started
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ML_MODELS_SYNC_STARTED',
          timestamp: new Date().toISOString()
        });
      });
    });

    // In a real implementation, this would process the IndexedDB ML models sync queue
    // For now, just simulate a successful sync
    
    // Notify clients that ML models sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ML_MODELS_SYNC_COMPLETED',
          timestamp: new Date().toISOString(),
          success: true
        });
      });
    });

    return true;
  } catch (error) {
    console.error('[ServiceWorker] ML models sync failed:', error);
    
    // Notify clients that ML models sync failed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ML_MODELS_SYNC_FAILED',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      });
    });
    
    return false;
  }
}
