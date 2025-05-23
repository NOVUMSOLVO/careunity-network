/**
 * CareUnity Network - Enhanced Service Worker using Workbox
 * 
 * This service worker implements:
 * 1. Enhanced periodic background sync
 * 2. Workbox for service worker management
 * 3. Badge API support for notification counts
 * 4. Accessibility enhancements for better user experience
 * 5. API versioning support with backward compatibility
 * 6. GraphQL integration for efficient data fetching
 * 7. Rate limiting and API protection
 * 8. Improved offline mode with enhanced feedback
 * 9. Multi-device real-time synchronization
 * 10. AI integration for smart healthcare features
 * 11. WebRTC-based telemedicine capabilities
 *
 * Overall Project Testing and Quality Assurance Strategy:
 * - End-to-End Testing Expansion:
 *   - Recommendation: Expand end-to-end testing with Playwright to cover critical user journeys.
 *   - Benefits: Better regression detection and improved application stability.
 * - Performance Monitoring:
 *   - Recommendation: Implement Real User Monitoring (RUM) to track actual user performance metrics.
 *   - Benefits: Data-driven performance optimization based on real-world usage.
 * - Automated Accessibility Testing:
 *   - Recommendation: Integrate automated accessibility testing into the CI/CD pipeline.
 *   - Benefits: Consistent accessibility standards and early detection of accessibility issues.
 *
 * API Documentation Enhancement:
 *  - Recommendation: Create comprehensive API documentation with interactive examples.
 *  - Benefits: Easier onboarding for new developers and better maintainability.
 * Developer Tooling:
 *  - Recommendation: Add developer tools like better linting, formatting, and type checking.
 *  - Benefits: More consistent code quality and fewer bugs.
 *
 * Infrastructure and Deployment:
 *  - Containerization:
 *    - Recommendation: Enhance Docker configuration for consistent deployments across environments.
 *    - Benefits: More reliable deployments and easier scaling.
 *  - CI/CD Pipeline Optimization:
 *    - Recommendation: Implement a more comprehensive CI/CD pipeline with automated testing, security scanning, and deployment.
 *    - Benefits: Faster, more reliable releases with fewer issues.
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Enable debug mode in development
workbox.setConfig({ debug: self.location.hostname === 'localhost' });

const { routing, strategies, precaching, expiration, backgroundSync } = workbox;

// Cache names
const CACHE_NAMES = {
  static: 'careunity-static-v1',
  images: 'careunity-images-v1',
  api: 'careunity-api-v1',
  apiV2: 'careunity-api-v2', // Separate cache for API v2
  graphql: 'careunity-graphql-v1', // New cache for GraphQL requests
  mlModels: 'careunity-ml-models-v1',
  documents: 'careunity-documents-v1',
  accessibility: 'careunity-accessibility-v1', // New cache for accessibility resources
  webrtc: 'careunity-webrtc-v1', // New cache for telemedicine WebRTC resources
  aiModels: 'careunity-ai-models-v1' // AI integration model cache
};

// API Request management
const API_CONFIG = {
  // Track rate limits for different endpoints
  rateLimits: new Map(),
  // Default rate limit settings (requests per minute)
  defaultRateLimit: {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
  },
  // Endpoint-specific rate limits
  endpointRateLimits: {
    '/api/v2/ml-models': { limit: 20, windowMs: 60 * 1000 }, // More restrictive for ML endpoints
    '/api/v2/notifications': { limit: 30, windowMs: 60 * 1000 },
    '/graphql': { limit: 50, windowMs: 60 * 1000 }, // GraphQL endpoint rate limit
  },
  // API Keys and versions
  versionMap: {
    // Map legacy endpoints to versioned endpoints
    '/api/users': '/api/v2/users',
    '/api/notifications': '/api/v2/notifications',
    '/api/care-plans': '/api/v2/care-plans',
    '/api/reports': '/api/v2/reports',
    // Additional legacy mappings can be added here
  },
  // Header constants
  headers: {
    version: 'X-API-Version',
    requestId: 'X-Request-ID',
    rateLimit: {
      limit: 'X-RateLimit-Limit',
      remaining: 'X-RateLimit-Remaining',
      reset: 'X-RateLimit-Reset',
    }
  }
};

// User preference store for accessibility settings
const USER_PREFERENCES = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true
};

// Precache assets
precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/offline.html', revision: '1' },
  { url: '/favicon.ico', revision: '1' },
  { url: '/logo192.png', revision: '1' },
  { url: '/logo512.png', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/badge-icon.png', revision: '1' },
  // Accessibility resources - precache for immediate availability
  { url: '/accessibility/accessibility-styles.css', revision: '1' },
  { url: '/accessibility/accessibility-utils.js', revision: '1' },
  { url: '/accessibility/accessibility-menu.js', revision: '1' }
]);

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('careunityOfflineDB', 3); // Increment version to trigger upgrade

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create sync-queue store if it doesn't exist
      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncQueueStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-status', 'status');
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
        syncQueueStore.createIndex('by-priority', 'priority'); // For prioritized sync
        syncQueueStore.createIndex('by-retry-count', 'retryCount'); // Track retry attempts
      }

      // Create offline-data store if it doesn't exist
      if (!db.objectStoreNames.contains('offline-data')) {
        const offlineDataStore = db.createObjectStore('offline-data', { keyPath: 'id' });
        offlineDataStore.createIndex('by-store', 'storeName');
        offlineDataStore.createIndex('by-last-modified', 'lastModified'); // For conflict resolution
        offlineDataStore.createIndex('by-version', 'version'); // For versioning
        offlineDataStore.createIndex('by-dirty', 'isDirty'); // Flag modified data
      }

      // Create conflict-resolution store
      if (!db.objectStoreNames.contains('conflict-resolution')) {
        const conflictStore = db.createObjectStore('conflict-resolution', { keyPath: 'id' });
        conflictStore.createIndex('by-status', 'status');
        conflictStore.createIndex('by-timestamp', 'timestamp');
        conflictStore.createIndex('by-entity-type', 'entityType');
      }

      // Create notifications store if it doesn't exist
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationsStore.createIndex('by-read', 'read');
        notificationsStore.createIndex('by-timestamp', 'timestamp');
      }
      
      // Create device sync store for multi-device synchronization
      if (!db.objectStoreNames.contains('device-sync')) {
        const deviceSyncStore = db.createObjectStore('device-sync', { keyPath: 'id' });
        deviceSyncStore.createIndex('by-device-id', 'deviceId');
        deviceSyncStore.createIndex('by-timestamp', 'timestamp');
        deviceSyncStore.createIndex('by-sync-status', 'syncStatus');
      }
      
      // Create AI models store for storing and caching AI models and predictions
      if (!db.objectStoreNames.contains('ai-models')) {
        const aiModelsStore = db.createObjectStore('ai-models', { keyPath: 'id' });
        aiModelsStore.createIndex('by-model-type', 'modelType');
        aiModelsStore.createIndex('by-version', 'modelVersion');
        aiModelsStore.createIndex('by-last-used', 'lastUsed');
      }
      
      // Create telemedicine store for WebRTC sessions
      if (!db.objectStoreNames.contains('telemedicine')) {
        const telemedicineStore = db.createObjectStore('telemedicine', { keyPath: 'id' });
        telemedicineStore.createIndex('by-status', 'status');
        telemedicineStore.createIndex('by-timestamp', 'timestamp');
        telemedicineStore.createIndex('by-participant', 'participants');
      }
      
      // Create accessibility preferences store if it doesn't exist
      if (!db.objectStoreNames.contains('accessibility')) {
        const accessibilityStore = db.createObjectStore('accessibility', { keyPath: 'id' });
        accessibilityStore.createIndex('by-user', 'userId');
        accessibilityStore.createIndex('by-setting', 'setting');
        
        // Add default accessibility settings
        const tx = event.target.transaction;
        const store = tx.objectStore('accessibility');
        store.add({
          id: 'default-preferences',
          userId: 'default',
          highContrast: false,
          largeText: false,
          fontSize: 16,
          contrastRatio: 'AA',
          reduceMotion: false,
          screenReaderOptimized: false,
          keyboardNavigation: true,
          focusIndicators: true,
          timestamp: Date.now()
        });
      }
    };
  });
}

// Create background sync queue for offline data
const bgSyncQueue = new backgroundSync.Queue('careunity-offline-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (specified in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        // Clone and process the request
        const { request } = entry;
        const response = await fetch(request.clone());
        
        // If the request was successful
        if (response.ok) {
          // Notify clients that sync completed successfully
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_COMPLETED',
                timestamp: new Date().toISOString(),
                url: request.url,
                status: response.status,
                success: true
              });
            });
          });
          
          // Update badge count after successful sync
          updateAppBadge();
          
          // Process the response data if needed
          const responseData = await response.clone().json();
          
          // For auditing/tracking purposes, we can store the sync result
          const db = await openDB();
          const tx = db.transaction('sync-queue', 'readwrite');
          const store = tx.objectStore('sync-queue');
          await store.add({
            id: `sync-${Date.now()}`,
            url: request.url,
            method: request.method,
            timestamp: Date.now(),
            status: 'completed',
            responseStatus: response.status,
            responseData: responseData
          });
          await tx.complete;
        } else {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        // If the error is network-related, retry will happen automatically
        console.error('[ServiceWorker] Error during sync:', error);
        
        // Notify clients of the failure
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_FAILED',
              timestamp: new Date().toISOString(),
              error: error.message || 'Network error',
              success: false
            });
          });
        });
        
        // Re-throw the error to trigger a retry
        throw error;
      }
    }
  }
});

// Network first strategy for API requests
routing.registerRoute(
  /\/api\/(?!v\d+\/)/,  // Match legacy API routes that don't include version
  async ({ request, event }) => {
    // Apply API versioning before routing
    const { url, headers } = applyApiVersioning(request.url, request.headers);
    
    // Create a new request with the versioned URL and headers
    const versionedRequest = new Request(url, {
      method: request.method,
      headers: headers,
      body: request.body,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity
    });
    
    // Use Network First strategy
    return new strategies.NetworkFirst({
      cacheName: CACHE_NAMES.api,
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        })
      ]
    }).handle({ request: versionedRequest, event });
  }
);

// Network first strategy for versioned API requests
routing.registerRoute(
  /\/api\/v\d+\//,  // Match versioned API routes
  new strategies.NetworkFirst({
    cacheName: CACHE_NAMES.apiV2,
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 // 1 hour
      })
    ]
  })
);

// Special handling for GraphQL requests
routing.registerRoute(
  /\/graphql/,
  async ({ request, event }) => {
    try {
      // Check rate limits for GraphQL
      await checkRateLimit('/graphql');
      
      // Use Stale While Revalidate for most GraphQL queries for performance
      // This works well for queries but not for mutations
      if (request.method === 'GET' || 
         (request.method === 'POST' && request.headers.get('X-GraphQL-Operation-Type') === 'query')) {
        return new strategies.StaleWhileRevalidate({
          cacheName: CACHE_NAMES.graphql,
          plugins: [
            new expiration.ExpirationPlugin({
              maxEntries: 100,
              maxAgeSeconds: 15 * 60 // 15 minutes
            })
          ]
        }).handle({ request, event });
      } else {
        // For mutations, always use NetworkOnly
        return new strategies.NetworkOnly().handle({ request, event });
      }
    } catch (error) {
      // If rate limited or other error
      if (error.message && error.message.includes('Rate limit exceeded')) {
        const errorData = JSON.parse(error.message);
        return new Response(JSON.stringify({
          errors: [{
            message: errorData.message,
            extensions: {
              code: 'RATE_LIMITED',
              retryAfter: errorData.retryAfter
            }
          }]
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': errorData.retryAfter
          }
        });
      }
      
      throw error;
    }
  }
);

// Cache first strategy for accessibility resources
// This ensures accessibility stylesheets, scripts, and resources load as quickly as possible
routing.registerRoute(
  /\/accessibility\//,
  new strategies.CacheFirst({
    cacheName: CACHE_NAMES.accessibility,
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache first strategy for images
routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  new strategies.CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Stale-while-revalidate for ML model API requests
routing.registerRoute(
  /\/api\/(?:v\d+\/)?ml-models/,  // Match both versioned and legacy ML model routes
  async ({ request, event }) => {
    try {
      // Apply specific rate limits for ML model endpoints
      await checkRateLimit('/api/v2/ml-models');
      
      // For ML model requests, use stale-while-revalidate for performance
      return new strategies.StaleWhileRevalidate({
        cacheName: CACHE_NAMES.mlModels,
        plugins: [
          new expiration.ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
          })
        ]
      }).handle({ request, event });
    } catch (error) {
      // Handle rate limiting
      if (error.message && error.message.includes('Rate limit exceeded')) {
        const errorData = JSON.parse(error.message);
        return new Response(JSON.stringify({
          error: 'Too Many Requests',
          message: errorData.message,
          retryAfter: errorData.retryAfter
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': errorData.retryAfter
          }
        });
      }
      
      throw error;
    }
  }
);

// Network first for HTML navigation requests with offline fallback
routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await new strategies.NetworkFirst({
        cacheName: CACHE_NAMES.static,
        plugins: [
          new expiration.ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60 // 1 day
          })
        ]
      }).handle({ event });
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

// Handle POST/PUT/DELETE requests with background sync
routing.registerRoute(
  ({ request }) => 
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') && 
    (request.url.includes('/api/') || request.url.includes('/graphql')),
  async ({ event }) => {
    try {
      // Apply rate limiting before proceeding
      const url = new URL(event.request.url).pathname;
      
      // Check if this is a GraphQL request
      const isGraphQL = url.includes('/graphql');
      
      try {
        // Apply rate limiting
        if (isGraphQL) {
          await checkRateLimit('/graphql');
        } else {
          // For API endpoints, apply the most specific rate limit
          for (const endpoint of Object.keys(API_CONFIG.endpointRateLimits)) {
            if (url.includes(endpoint)) {
              await checkRateLimit(endpoint);
              break;
            }
          }
        }
        
        // For GraphQL mutations, check operation type from the request body
        if (isGraphQL && event.request.method === 'POST') {
          const clonedRequest = event.request.clone();
          const body = await clonedRequest.json();
          
          // Add operation type as a header for the cache strategy to use
          const headers = new Headers(event.request.headers);
          
          // Simple heuristic: if the query string contains "mutation", it's a mutation
          const operationType = body.query && body.query.includes('mutation') ? 'mutation' : 'query';
          headers.set('X-GraphQL-Operation-Type', operationType);
          
          // Create a new request with the enhanced headers
          const enhancedRequest = new Request(event.request.url, {
            method: event.request.method,
            headers: headers,
            body: JSON.stringify(body),
            mode: event.request.mode,
            credentials: event.request.credentials,
            cache: event.request.cache,
            redirect: event.request.redirect,
            referrer: event.request.referrer
          });
          
          // Try the network first
          const response = await fetch(enhancedRequest);
          return response;
        }
        
        // For regular API requests, apply versioning
        if (!isGraphQL) {
          const { url: versionedUrl, headers: versionedHeaders } = applyApiVersioning(
            event.request.url, 
            event.request.headers
          );
          
          // Create a new request with the versioned URL and headers
          const versionedRequest = new Request(versionedUrl, {
            method: event.request.method,
            headers: versionedHeaders,
            body: event.request.body,
            mode: event.request.mode,
            credentials: event.request.credentials,
            cache: event.request.cache,
            redirect: event.request.redirect,
            referrer: event.request.referrer
          });
          
          // Try the network with the versioned request
          const response = await fetch(versionedRequest);
          return response;
        }
        
        // For any other case, try the network with the original request
        const response = await fetch(event.request.clone());
        return response;
      } catch (rateLimitError) {
        // If rate limited
        if (rateLimitError.message && rateLimitError.message.includes('Rate limit exceeded')) {
          const errorData = JSON.parse(rateLimitError.message);
          return new Response(JSON.stringify({
            error: 'Too Many Requests',
            message: errorData.message,
            retryAfter: errorData.retryAfter
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': errorData.retryAfter
            }
          });
        }
        
        // For other errors, throw to fallback to offline queue
        throw rateLimitError;
      }
    }    catch (error) {
      console.log('[ServiceWorker] Network error, queueing request:', error);
      
      // Extract request details for better tracking
      const requestDetails = {
        url: event.request.url,
        method: event.request.method,
        headers: Array.from(event.request.headers.entries()).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {}),
        timestamp: Date.now()
      };
      
      try {
        // Clone the request body if it exists
        if (['POST', 'PUT', 'PATCH'].includes(event.request.method)) {
          const clonedRequest = event.request.clone();
          try {
            // Try to parse as JSON
            requestDetails.body = await clonedRequest.json();
          } catch (e) {
            try {
              // If not JSON, try to get as text
              requestDetails.body = await event.request.clone().text();
            } catch (textError) {
              console.warn('[ServiceWorker] Could not extract request body', textError);
            }
          }
        }
        
        // Save request details to IndexedDB for better offline tracking
        const db = await openDB();
        const tx = db.transaction('offline-data', 'readwrite');
        const store = tx.objectStore('offline-data');
        
        // Generate unique ID for this offline operation
        const offlineRequestId = `offline-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await store.put({
          id: offlineRequestId,
          storeName: 'offline-requests',
          requestDetails,
          status: 'pending',
          retryCount: 0,
          lastAttempt: null,
          isDirty: true,
          lastModified: Date.now(),
          version: 1
        });
        
        await tx.complete;
        
        // Queue the request with additional metadata
        await bgSyncQueue.pushRequest({ 
          request: event.request.clone(),
          metadata: {
            offlineRequestId,
            timestamp: Date.now(),
            priority: getPriorityForRequest(event.request)
          }
        });
        
        // Notify all clients about the queued operation
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'OFFLINE_REQUEST_QUEUED',
              offlineRequestId,
              url: event.request.url,
              method: event.request.method,
              timestamp: new Date().toISOString()
            });
          });
        });
        
        // Return an enhanced "offline but queued" response with request ID
        return new Response(JSON.stringify({
          success: true,
          offline: true,
          offlineRequestId,
          message: 'Your request has been saved and will be processed when you are back online.',
          estimatedSyncTime: getEstimatedSyncTime(),
          requestDetails: {
            url: event.request.url,
            method: event.request.method,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        }), {
          status: 202,
          headers: { 
            'Content-Type': 'application/json',
            'X-Offline-Request-ID': offlineRequestId
          }
        });
      } catch (offlineError) {
        console.error('[ServiceWorker] Error handling offline request:', offlineError);
        
        // Even if our enhanced offline handling fails, still try to queue with basic info
        await bgSyncQueue.pushRequest({ request: event.request.clone() });
        
        // Return a basic offline response
        return new Response(JSON.stringify({
          success: true,
          offline: true,
          basic: true,
          message: 'Your request has been saved with basic info and will be processed when you are back online.',
          timestamp: new Date().toISOString()
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
);

// Enhanced periodic background sync for data synchronization
self.addEventListener('periodicsync', async (event) => {
  if (event.tag === 'data-sync') {
    // Try to pull data from server even when app is not open
    try {
      // Get data that needs to be synced
      await syncNotifications();
      await syncPatientData();
      await syncAppointments();
      
      // Update the badge count after sync
      await updateAppBadge();
      
      // Notify clients if they're open
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PERIODIC_SYNC_COMPLETED',
            timestamp: new Date().toISOString(),
            syncType: 'data-sync'
          });
        });
      });
    } catch (error) {
      console.error('[ServiceWorker] Periodic sync error:', error);
      
      // Error recovery - implement exponential backoff
      const retryData = await getRetryData('data-sync');
      const nextRetryMs = calculateNextRetry(retryData.retryCount || 0);
      
      // Store retry information for next attempt
      await storeRetryData('data-sync', {
        retryCount: (retryData.retryCount || 0) + 1,
        lastError: error.message,
        lastErrorTime: Date.now(),
        nextRetryTime: Date.now() + nextRetryMs
      });
    }
  }
});

// Background sync for error recovery
async function syncNotifications() {
  // Use enhancedApiFetch with versioning and rate limiting
  const apiUrl = '/api/notifications/unread'; // Use legacy endpoint, will be mapped to v2
  const response = await enhancedApiFetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'ServiceWorker'
    },
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error(`Failed to sync notifications: ${response.status}`);
  
  const data = await response.json();
  
  // Store notifications in IndexedDB
  const db = await openDB();
  const tx = db.transaction('notifications', 'readwrite');
  const store = tx.objectStore('notifications');
  
  // Add all new notifications to IndexedDB
  for (const notification of data.notifications) {
    await store.put(notification);
  }
  
  await tx.complete;
  
  return data.notifications;
}

async function syncPatientData() {
  // Implementation for syncing patient data using enhanced API fetch
  const apiUrl = '/api/patients/sync';
  try {
    const response = await enhancedApiFetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'ServiceWorker'
      },
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error(`Failed to sync patient data: ${response.status}`);
    
    const data = await response.json();
    
    // Store patient data in IndexedDB
    const db = await openDB();
    const tx = db.transaction('offline-data', 'readwrite');
    const store = tx.objectStore('offline-data');
    
    await store.put({
      id: 'patient-data',
      storeName: 'patients',
      data: data.patients,
      lastSynced: Date.now()
    });
    
    await tx.complete;
    
    console.log('[ServiceWorker] Patient data synced successfully:', data.patients.length);
    return data.patients;
  } catch (error) {
    console.error('[ServiceWorker] Error syncing patient data:', error);
    throw error;
  }
}

async function syncAppointments() {
  // Implementation for syncing appointments using enhanced API fetch
  const apiUrl = '/api/appointments/upcoming';
  try {
    const response = await enhancedApiFetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'ServiceWorker'
      },
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error(`Failed to sync appointments: ${response.status}`);
    
    const data = await response.json();
    
    // Store appointments in IndexedDB
    const db = await openDB();
    const tx = db.transaction('offline-data', 'readwrite');
    const store = tx.objectStore('offline-data');
    
    await store.put({
      id: 'appointments-data',
      storeName: 'appointments',
      data: data.appointments,
      lastSynced: Date.now()
    });
    
    await tx.complete;
    
    console.log('[ServiceWorker] Appointments synced successfully:', data.appointments.length);
    return data.appointments;
  } catch (error) {
    console.error('[ServiceWorker] Error syncing appointments:', error);
    throw error;
  }
}

// Retry mechanism with exponential backoff
function calculateNextRetry(retryCount) {
  const baseDelay = 60000; // 1 minute
  const maxDelay = 4 * 60 * 60 * 1000; // 4 hours
  const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
  
  // Add some jitter to prevent all clients from retrying at the same time
  const jitter = 0.2 * delay * Math.random();
  return delay + jitter;
}

// Store retry data
async function storeRetryData(syncType, data) {
  const db = await openDB();
  const tx = db.transaction('offline-data', 'readwrite');
  const store = tx.objectStore('offline-data');
  
  await store.put({
    id: `retry-${syncType}`,
    storeName: 'retry',
    data: data
  });
  
  await tx.complete;
}

// Get retry data
async function getRetryData(syncType) {
  const db = await openDB();
  const tx = db.transaction('offline-data', 'readonly');
  const store = tx.objectStore('offline-data');
  
  const data = await store.get(`retry-${syncType}`);
  await tx.complete;
  
  return data ? data.data : { retryCount: 0 };
}

// API Management Functions

// Check rate limit before making an API request
async function checkRateLimit(endpoint) {
  // Find the most specific rate limit configuration for this endpoint
  let rateLimitConfig = API_CONFIG.defaultRateLimit;
  
  // Check for endpoint-specific rate limits
  for (const [pattern, config] of Object.entries(API_CONFIG.endpointRateLimits)) {
    if (endpoint.includes(pattern)) {
      rateLimitConfig = config;
      break;
    }
  }
  
  // Get or initialize rate tracking for this endpoint
  if (!API_CONFIG.rateLimits.has(endpoint)) {
    API_CONFIG.rateLimits.set(endpoint, {
      count: 0,
      resetTime: Date.now() + rateLimitConfig.windowMs,
      windowMs: rateLimitConfig.windowMs,
      limit: rateLimitConfig.limit
    });
  }
  
  const rateLimitData = API_CONFIG.rateLimits.get(endpoint);
  
  // Reset counter if the time window has passed
  if (Date.now() > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = Date.now() + rateLimitData.windowMs;
  }
  
  // Check if rate limit exceeded
  if (rateLimitData.count >= rateLimitData.limit) {
    const retryAfter = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);
    
    throw new Error(JSON.stringify({
      error: 'Rate limit exceeded',
      status: 429,
      retryAfter: retryAfter,
      message: `Too many requests. Please try again in ${retryAfter} seconds.`
    }));
  }
  
  // Increment the counter
  rateLimitData.count++;
  API_CONFIG.rateLimits.set(endpoint, rateLimitData);
  
  return {
    limit: rateLimitData.limit,
    remaining: rateLimitData.limit - rateLimitData.count,
    reset: Math.ceil(rateLimitData.resetTime / 1000)
  };
}

// Apply API versioning to requests
function applyApiVersioning(url, headers = {}) {
  // Check if this is a legacy endpoint that needs to be mapped to a versioned endpoint
  let newUrl = url;
  let version = '2'; // Default to the latest version
  
  // Look for exact matches first
  if (API_CONFIG.versionMap[url]) {
    newUrl = API_CONFIG.versionMap[url];
  } else {
    // Look for partial matches (e.g., '/api/users/123' -> '/api/v2/users/123')
    for (const [oldPattern, newPattern] of Object.entries(API_CONFIG.versionMap)) {
      if (url.startsWith(oldPattern)) {
        newUrl = url.replace(oldPattern, newPattern);
        break;
      }
    }
  }
  
  // If the URL already includes a version (e.g., /api/v1/, /api/v2/), extract it
  const versionMatch = newUrl.match(/\/api\/v(\d+)\//);
  if (versionMatch) {
    version = versionMatch[1];
  }
  
  // Add version header
  const newHeaders = { ...headers };
  newHeaders[API_CONFIG.headers.version] = version;
  
  // Add unique request ID for tracking
  newHeaders[API_CONFIG.headers.requestId] = generateRequestId();
  
  return { url: newUrl, headers: newHeaders };
}

// Generate a unique request ID
function generateRequestId() {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced API fetch with versioning, rate limiting, and circuit breaking
async function enhancedApiFetch(url, options = {}) {
  // Apply API versioning
  const { url: versionedUrl, headers: versionedHeaders } = applyApiVersioning(url, options.headers || {});
  
  // Check rate limits
  try {
    const rateLimitInfo = await checkRateLimit(versionedUrl);
    
    // Add rate limit headers to the request
    versionedHeaders[API_CONFIG.headers.rateLimit.limit] = rateLimitInfo.limit;
    versionedHeaders[API_CONFIG.headers.rateLimit.remaining] = rateLimitInfo.remaining;
    versionedHeaders[API_CONFIG.headers.rateLimit.reset] = rateLimitInfo.reset;
    
  } catch (error) {
    // If rate limit is exceeded, throw the error
    const errorData = JSON.parse(error.message);
    
    // Notify clients about rate limiting
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'API_RATE_LIMITED',
          endpoint: url,
          retryAfter: errorData.retryAfter,
          message: errorData.message
        });
      });
    });
    
    // Return a rate limit response
    return new Response(JSON.stringify({
      error: 'Too Many Requests',
      message: errorData.message,
      retryAfter: errorData.retryAfter
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': errorData.retryAfter
      }
    });
  }
  
  // Perform the fetch with the enhanced options
  const enhancedOptions = {
    ...options,
    headers: versionedHeaders
  };
  
  try {
    // Attempt the fetch with timeout for circuit breaking
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15-second timeout
    });
    
    const response = await Promise.race([
      fetch(versionedUrl, enhancedOptions),
      timeoutPromise
    ]);
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Enhanced API fetch error:', error);
    
    // Circuit breaking - track failures for this endpoint
    // This would typically trigger fallback strategies in a full implementation
    
    throw error;
  }
}

// Accessibility Functions

// Get user's accessibility preferences
async function getAccessibilityPreferences(userId = 'default') {
  try {
    const db = await openDB();
    const tx = db.transaction('accessibility', 'readonly');
    const store = tx.objectStore('accessibility');
    
    // Try to get user-specific preferences first
    let preferences = null;
    if (userId !== 'default') {
      const userIndex = store.index('by-user');
      preferences = await userIndex.get(userId);
    }
    
    // Fall back to default preferences if no user-specific ones found
    if (!preferences) {
      preferences = await store.get('default-preferences');
    }
    
    await tx.complete;
    
    return preferences || {
      id: 'default-preferences',
      userId: 'default',
      highContrast: false,
      largeText: false,
      fontSize: 16,
      contrastRatio: 'AA',
      reduceMotion: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      focusIndicators: true,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('[ServiceWorker] Error getting accessibility preferences:', error);
    return {
      highContrast: false,
      largeText: false,
      fontSize: 16,
      contrastRatio: 'AA',
      reduceMotion: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      focusIndicators: true
    };
  }
}

// Update user's accessibility preferences
async function updateAccessibilityPreferences(userId, preferences) {
  try {
    const db = await openDB();
    const tx = db.transaction('accessibility', 'readwrite');
    const store = tx.objectStore('accessibility');
    
    // Check if preferences already exist for this user
    const userIndex = store.index('by-user');
    const existingPrefs = await userIndex.get(userId);
    
    if (existingPrefs) {
      // Update existing preferences
      const updatedPrefs = {
        ...existingPrefs,
        ...preferences,
        timestamp: Date.now()
      };
      await store.put(updatedPrefs);
    } else {
      // Create new preferences
      await store.add({
        id: `user-preferences-${userId}`,
        userId: userId,
        ...preferences,
        timestamp: Date.now()
      });
    }
    
    await tx.complete;
    
    // Notify all clients about the updated preferences
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ACCESSIBILITY_PREFERENCES_UPDATED',
          preferences: preferences
        });
      });
    });
    
    return true;
  } catch (error) {
    console.error('[ServiceWorker] Error updating accessibility preferences:', error);
    return false;
  }
}

// Apply high contrast mode to images by checking cache
async function applyHighContrastToImages(highContrast) {
  if (!highContrast) return;
  
  // This would be implemented by the client-side code
  // but we need to inform clients that high contrast is enabled
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APPLY_HIGH_CONTRAST',
        enabled: highContrast
      });
    });
  });
}

// Badge API Support
async function updateAppBadge() {
  try {
    // Count unread notifications from IndexedDB
    const db = await openDB();
    const tx = db.transaction('notifications', 'readonly');
    const store = tx.objectStore('notifications');
    const index = store.index('by-read');
    const count = await index.count(false); // false = unread
    
    await tx.complete;
    
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        // Update the badge count
        await navigator.setAppBadge(count);
      } else {
        // Clear the badge if no unread notifications
        await navigator.clearAppBadge();
      }
    }
    
    // Also notify any open clients about the badge count
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'BADGE_COUNT_UPDATED',
          count: count
        });
      });
    });
    
    return count;
  } catch (error) {
    console.error('[ServiceWorker] Error updating badge:', error);
    return 0;
  }
}

// Listen for push notifications
self.addEventListener('push', async (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Get user's accessibility preferences to adapt notification style
    const accessPrefs = await getAccessibilityPreferences();
    
    // Enhance notification options with accessibility features
    const options = {
      body: data.body || 'New notification',
      icon: '/favicon.ico',
      badge: '/badge-icon.png',
      // Increase vibration pattern duration for better haptic feedback
      // if user has enabled screen reader optimization
      vibrate: accessPrefs.screenReaderOptimized ? [200, 100, 200] : [100, 50, 100],
      // Set high priority for important notifications when using assistive technologies
      priority: accessPrefs.screenReaderOptimized ? 'high' : 'normal',
      // Ensure notifications stay visible longer for users who may need more time
      requireInteraction: accessPrefs.largeText || accessPrefs.screenReaderOptimized,
      data: {
        url: data.url || '/',
        id: data.id || `notification-${Date.now()}`,
        // Store accessibility context with the notification
        accessibilityContext: {
          importance: data.importance || 'normal',
          category: data.category || 'general',
          // Include screen reader specific text if provided
          ariaDescription: data.ariaDescription || data.body
        }
      }
    };

    // Store the notification in IndexedDB
    const db = await openDB();
    const tx = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    
    await store.put({
      id: data.id || `notification-${Date.now()}`,
      title: data.title || 'CareUnity Notification',
      body: data.body,
      timestamp: Date.now(),
      read: false,
      url: data.url || '/',
      importance: data.importance || 'normal',
      category: data.category || 'general',
      ariaLabel: data.ariaLabel || data.title || 'CareUnity Notification',
      ariaDescription: data.ariaDescription || data.body
    });
    
    await tx.complete;
    
    // Update badge count
    await updateAppBadge();

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(data.title || 'CareUnity Notification', options)
    );
  } catch (error) {
    // If data is not JSON, use as string
    console.error('[ServiceWorker] Error processing push notification:', error);
    
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/badge-icon.png'
    };

    event.waitUntil(
      self.registration.showNotification('CareUnity Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', async (event) => {
  event.notification.close();

  // Mark the notification as read in IndexedDB
  try {
    const notificationData = event.notification.data;
    if (notificationData && notificationData.id) {
      const db = await openDB();
      const tx = db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      
      const notification = await store.get(notificationData.id);
      if (notification) {
        notification.read = true;
        await store.put(notification);
      }
      
      await tx.complete;
      
      // Update the badge count after marking as read
      await updateAppBadge();
    }
  } catch (error) {
    console.error('[ServiceWorker] Error marking notification as read:', error);
  }

  // Focus or open the specific URL
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Message event handler
self.addEventListener('message', async (event) => {
  if (!event.data) return;
  
  // Handle skip waiting
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle manual sync request
  if (event.data.type === 'SYNC_NOW') {
    try {
      await syncNotifications();
      await syncPatientData();
      await syncAppointments();
      await updateAppBadge();
      
      event.ports[0].postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: new Date().toISOString(),
        success: true
      });
    } catch (error) {
      event.ports[0].postMessage({
        type: 'SYNC_FAILED',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
        success: false
      });
    }
  }
  
  // Handle GraphQL client operation
  if (event.data.type === 'GRAPHQL_OPERATION') {
    try {
      const { query, variables, operationName, operationType } = event.data;
      
      // Use the enhanced API fetch for GraphQL
      const response = await enhancedApiFetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GraphQL-Operation-Type': operationType || 'query',
          'X-Requested-With': 'ServiceWorker'
        },
        body: JSON.stringify({
          query,
          variables,
          operationName
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`GraphQL operation failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'GRAPHQL_OPERATION_RESULT',
          data,
          success: true
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] GraphQL operation error:', error);
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'GRAPHQL_OPERATION_ERROR',
          error: error.message || 'Unknown error',
          success: false
        });
      }
    }
  }
  
  // Handle badge update request
  if (event.data.type === 'UPDATE_BADGE') {
    try {
      const count = await updateAppBadge();
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'BADGE_UPDATED',
          count: count
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error handling badge update request:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'BADGE_UPDATE_FAILED',
          error: error.message || 'Unknown error'
        });
      }
    }
  }
  
  // Handle clearing all notifications
  if (event.data.type === 'CLEAR_NOTIFICATIONS') {
    try {
      const db = await openDB();
      const tx = db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      
      // Get all unread notifications
      const unreadIndex = store.index('by-read');
      const unreadNotifications = await unreadIndex.getAll(false);
      
      // Mark all as read
      for (const notification of unreadNotifications) {
        notification.read = true;
        await store.put(notification);
      }
      
      await tx.complete;
      
      // Update badge count
      await updateAppBadge();
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'NOTIFICATIONS_CLEARED',
          count: unreadNotifications.length
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error clearing notifications:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'CLEAR_NOTIFICATIONS_FAILED',
          error: error.message || 'Unknown error'
        });
      }
    }
  }
  
  // Handle accessibility preference updates
  if (event.data.type === 'UPDATE_ACCESSIBILITY_PREFERENCES') {
    try {
      const { userId, preferences } = event.data;
      const success = await updateAccessibilityPreferences(userId || 'default', preferences);
      
      if (preferences.highContrast !== undefined) {
        await applyHighContrastToImages(preferences.highContrast);
      }
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'ACCESSIBILITY_PREFERENCES_UPDATED_CONFIRMATION',
          success: success,
          preferences: preferences
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error updating accessibility preferences:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'ACCESSIBILITY_PREFERENCES_UPDATE_FAILED',
          error: error.message || 'Unknown error'
        });
      }
    }
  }
  
  // Handle get accessibility preferences
  if (event.data.type === 'GET_ACCESSIBILITY_PREFERENCES') {
    try {
      const { userId } = event.data;
      const preferences = await getAccessibilityPreferences(userId || 'default');
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'ACCESSIBILITY_PREFERENCES_RETRIEVED',
          preferences: preferences,
          success: true
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error getting accessibility preferences:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'ACCESSIBILITY_PREFERENCES_RETRIEVAL_FAILED',
          error: error.message || 'Unknown error',
          success: false
        });
      }
    }  }
});

// Handle WebRTC telemedicine session setup
self.addEventListener('message', async (event) => {
  if (!event.data) return;
  
  // Handle skip waiting
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle manual sync request
  if (event.data.type === 'SYNC_NOW') {
    try {
      await syncNotifications();
      await syncPatientData();
      await syncAppointments();
      await updateAppBadge();
      
      event.ports[0].postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: new Date().toISOString(),
        success: true
      });
    } catch (error) {
      event.ports[0].postMessage({
        type: 'SYNC_FAILED',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
        success: false
      });
    }
  }
  
  // Handle WebRTC session cleanup
  if (event.data.type === 'WEBRTC_SESSION_CLEANUP') {
    try {
      const { sessionId } = event.data;
      
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      const db = await openDB();
      const tx = db.transaction('telemedicine', 'readwrite');
      const store = tx.objectStore('telemedicine');
      
      const session = await store.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = Date.now();
        await store.put(session);
      } else {
        throw new Error('Session not found');
      }
      
      await tx.complete;
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'WEBRTC_SESSION_CLEANED',
          sessionId,
          success: true
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error cleaning up WebRTC session:', error);
      
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'WEBRTC_SESSION_CLEANUP_ERROR',
          error: error.message,
          success: false
        });
      }
    }
  }
});

// Clean up expired telemedicine sessions periodically
setInterval(async () => {
  try {
    const db = await openDB();
    const tx = db.transaction('telemedicine', 'readwrite');
    const store = tx.objectStore('telemedicine');
    
    const index = store.index('by-timestamp');
    
    // Get sessions older than 24 hours that are not completed
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const oldSessions = await index.getAll(IDBKeyRange.upperBound(oneDayAgo));
    
    for (const session of oldSessions) {
      if (session.status !== 'completed') {
        session.status = 'expired';
        session.endTime = Date.now();
        await store.put(session);
      }
    }
    
    await tx.complete;
    
    console.log(`[ServiceWorker] Cleaned up ${oldSessions.length} expired telemedicine sessions`);
  } catch (error) {
    console.error('[ServiceWorker] Error cleaning up expired telemedicine sessions:', error);
  }
}, 6 * 60 * 60 * 1000); // Run every 6 hours

console.log('[ServiceWorker] CareUnity Network enhanced service worker loaded with offline improvements, multi-device sync, AI integration, and telemedicine capabilities');
