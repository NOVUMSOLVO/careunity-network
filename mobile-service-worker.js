// CareUnity Mobile Service Worker - Optimized Version

const CACHE_NAME = 'careunity-mobile-cache-v4'; // Updated cache version
const STATIC_CACHE_NAME = 'careunity-static-cache-v4';
const DYNAMIC_CACHE_NAME = 'careunity-dynamic-cache-v4';
const API_CACHE_NAME = 'careunity-api-cache-v4';
const IMAGE_CACHE_NAME = 'careunity-image-cache-v1'; // New cache for optimized images

// Assets to preload and cache - Now using bundled JS files
const STATIC_ASSETS = [
  '/',
  '/careunity-mobile.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/favicon.ico',
  '/assets/main-*.js', // Main bundled JS (hash will vary)
  '/assets/vendor-*.js', // Vendor bundle
  '/assets/voice-features-*.js', // Voice features bundle
  '/assets/care-plan-features-*.js', // Care plan features bundle
  '/assets/biometric-features-*.js', // Biometric features bundle
  '/assets/sync-features-*.js', // Sync features bundle
  '/js/careunity-mobile-main.js', // Entry point for dynamic loading
  '/offline.html'
];

// API endpoints that should be cached with network-first strategy
const API_ENDPOINTS = [
  '/api/users',
  '/api/visits',
  '/api/care-plans',
  '/api/care-plans/advanced', // Advanced care plan endpoint
  '/api/care-plans/templates', // New: Care plan templates
  '/api/care-plans/suggestions', // New: ML-based suggestions for care plans
  '/api/care-plans/monitoring', // New: Automated care plan monitoring
  '/api/care-plans/collaboration', // New: Real-time collaboration data
  '/api/care-plans/history', // New: Care plan version history
  '/api/staff',
  '/api/analytics', // Analytics endpoint
  '/api/analytics/dashboard', // New: Analytics dashboard data
  '/api/analytics/metrics', // New: Analytics metrics
  '/api/analytics/predictions', // New: Predictive analytics
  '/api/analytics/export', // New: Data export capabilities
  '/api/reports', // Reporting endpoint
  '/api/reports/templates', // New: Report templates
  '/api/reports/scheduled', // New: Scheduled reports
  '/api/reports/custom', // New: Custom report builder
  '/api/voice-commands', // Voice commands configuration
  '/api/voice-commands/intents', // New: Voice intent definitions
  '/api/voice-commands/nlp', // New: NLP models for voice processing
  '/api/voice-commands/context', // New: Context-aware voice commands
  '/api/voice-commands/accessibility', // New: Accessibility settings for voice
  '/api/integrations', // Integrations endpoint
  '/api/integrations/health', // New: Healthcare system integrations
  '/api/integrations/ehr', // New: Electronic Health Record integrations
  '/api/integrations/devices', // New: Medical device integrations
  '/api/integrations/payments', // New: Payment system integrations
  '/api/integrations/communications' // New: Communication platform integrations
];

// Maximum age for cached API responses (in milliseconds)
const API_CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Image handling helpers for modern formats
function isImageUrl(url) {
  return /\.(png|jpg|jpeg|gif|webp|avif)(\?.*)?$/.test(url);
}

function getBestImageFormat(request) {
  const acceptHeader = request.headers.get('Accept') || '';
  if (acceptHeader.includes('image/avif')) return 'avif';
  if (acceptHeader.includes('image/webp')) return 'webp';
  return null;
}

function createModernImageRequest(request) {
  const url = new URL(request.url);
  const originalPath = url.pathname;
  const extension = originalPath.split('.').pop().toLowerCase();
  
  if (!['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
    return request;
  }
  
  const bestFormat = getBestImageFormat(request);
  if (!bestFormat) return request;
  
  const basePath = originalPath.substring(0, originalPath.lastIndexOf('.'));
  url.pathname = `${basePath}.${bestFormat}`;
  
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect
  });
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Mobile Service Worker] Install');
  
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Mobile Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Create other caches
      caches.open(DYNAMIC_CACHE_NAME),
      caches.open(API_CACHE_NAME)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Mobile Service Worker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete old caches but not the current ones
        if (![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME].includes(key)) {
          console.log('[Mobile Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      // Claim clients so the service worker is in control from the start
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request is for an API endpoint
function isApiRequest(url) {
  const requestUrl = new URL(url);
  return API_ENDPOINTS.some(endpoint => requestUrl.pathname.startsWith(endpoint));
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(url) {
  const requestUrl = new URL(url);
  return STATIC_ASSETS.some(asset => {
    // Handle both absolute and relative URLs in the STATIC_ASSETS list
    if (asset.startsWith('http')) {
      return asset === url;
    } else {
      return requestUrl.pathname === asset || requestUrl.pathname.endsWith(asset);
    }
  });
}

// Helper function to determine if a cached API response is stale
function isApiResponseStale(response) {
  if (!response || !response.headers || !response.headers.has('date')) {
    return true;
  }
  
  const dateHeader = response.headers.get('date');
  const cachedDate = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - cachedDate) > API_CACHE_MAX_AGE;
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests except for CDNs we explicitly want to cache
  const allowedHosts = [
    self.location.hostname,
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'randomuser.me'
  ];
  
  if (!allowedHosts.some(host => url.hostname.includes(host))) {
    return;
  }
  
  // Different caching strategies based on request type
  if (isApiRequest(event.request.url)) {
    // Network-first for API requests with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(event.request));
  } else if (isStaticAsset(event.request.url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirstWithNetworkFallback(event.request));
  } else {
    // Stale-while-revalidate for all other requests
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Cache-first strategy with network fallback
async function cacheFirstWithNetworkFallback(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try to get from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, get from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first strategy error:', error);
    
    // If request is for HTML document, return offline page
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise just return the error
    throw error;
  }
}

// Network-first strategy with offline fallback
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try to get fresh data from network
    const networkResponse = await fetch(request);
    
    // Cache the fresh response
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to cache');
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If nothing in cache, return JSON with offline indicator
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'You are currently offline and this data is not cached.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  // Try to get from cache immediately
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in the background
  const networkResponsePromise = fetch(request).then(networkResponse => {
    // Cache the new response for next time
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(error => {
    console.error('[Service Worker] Stale while revalidate fetch error:', error);
    throw error;
  });
  
  // Return the cached response immediately if we have it
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for the network response
  try {
    return await networkResponsePromise;
  } catch (error) {
    // If both cache and network fail, try to return offline page for HTML
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise just return the error
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[Mobile Service Worker] Syncing data');
    event.waitUntil(syncData());
  } else if (event.tag === 'sync-visits') {
    console.log('[Mobile Service Worker] Syncing visits');
    event.waitUntil(syncSpecificData('visits'));
  } else if (event.tag === 'sync-care-plans') {
    console.log('[Mobile Service Worker] Syncing care plans');
    event.waitUntil(syncSpecificData('carePlans'));
  } else if (event.tag === 'sync-advanced-care-plans') {
    console.log('[Mobile Service Worker] Syncing advanced care plans');
    event.waitUntil(syncSpecificData('advancedCarePlans'));
  } else if (event.tag === 'sync-care-plan-templates') {
    console.log('[Mobile Service Worker] Syncing care plan templates');
    event.waitUntil(syncSpecificData('carePlanTemplates'));
  } else if (event.tag === 'sync-care-plan-monitoring') {
    console.log('[Mobile Service Worker] Syncing care plan monitoring data');
    event.waitUntil(syncSpecificData('carePlanMonitoring'));
  } else if (event.tag === 'sync-care-plan-history') {
    console.log('[Mobile Service Worker] Syncing care plan history');
    event.waitUntil(syncSpecificData('carePlanHistory'));
  } else if (event.tag === 'sync-analytics') {
    console.log('[Mobile Service Worker] Syncing analytics data');
    event.waitUntil(syncSpecificData('analytics'));
  } else if (event.tag === 'sync-analytics-metrics') {
    console.log('[Mobile Service Worker] Syncing analytics metrics');
    event.waitUntil(syncSpecificData('analyticsMetrics'));
  } else if (event.tag === 'sync-analytics-predictions') {
    console.log('[Mobile Service Worker] Syncing prediction models');
    event.waitUntil(syncSpecificData('analyticsPredictions'));
  } else if (event.tag === 'sync-reports') {
    console.log('[Mobile Service Worker] Syncing reports');
    event.waitUntil(syncSpecificData('reports'));
  } else if (event.tag === 'sync-report-templates') {
    console.log('[Mobile Service Worker] Syncing report templates');
    event.waitUntil(syncSpecificData('reportTemplates'));
  } else if (event.tag === 'sync-custom-reports') {
    console.log('[Mobile Service Worker] Syncing custom reports');
    event.waitUntil(syncSpecificData('customReports'));
  } else if (event.tag === 'sync-voice-commands') {
    console.log('[Mobile Service Worker] Syncing voice command preferences');
    event.waitUntil(syncSpecificData('voiceCommands'));
  } else if (event.tag === 'sync-voice-intents') {
    console.log('[Mobile Service Worker] Syncing voice intent models');
    event.waitUntil(syncSpecificData('voiceIntents'));
  } else if (event.tag === 'sync-voice-context') {
    console.log('[Mobile Service Worker] Syncing voice context data');
    event.waitUntil(syncSpecificData('voiceContext'));
  } else if (event.tag === 'sync-checkins') {
    console.log('[Mobile Service Worker] Syncing check-ins');
    event.waitUntil(syncSpecificData('checkins'));
  } else if (event.tag === 'sync-priority') {
    console.log('[Mobile Service Worker] Syncing priority data');
    event.waitUntil(syncPriorityData());
  } else if (event.tag === 'sync-integrations') {
    console.log('[Mobile Service Worker] Syncing integration configurations');
    event.waitUntil(syncSpecificData('integrations'));
  } else if (event.tag === 'sync-health-integrations') {
    console.log('[Mobile Service Worker] Syncing healthcare integrations');
    event.waitUntil(syncSpecificData('healthIntegrations'));
  } else if (event.tag === 'sync-ehr-integrations') {
    console.log('[Mobile Service Worker] Syncing EHR integrations');
    event.waitUntil(syncSpecificData('ehrIntegrations'));
  } else if (event.tag === 'sync-device-integrations') {
    console.log('[Mobile Service Worker] Syncing medical device integrations');
    event.waitUntil(syncSpecificData('deviceIntegrations'));
  } else if (event.tag === 'sync-user-preferences') {
    console.log('[Mobile Service Worker] Syncing user experience preferences');
    event.waitUntil(syncSpecificData('userPreferences'));
  }
});

// Function to sync prioritized data first
async function syncPriorityData() {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error('[Mobile Service Worker] Database error:', event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] No pendingSync store found');
        return;
      }
      
      // Get only priority operations
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error('[Mobile Service Worker] Error getting pending operations:', event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const allOperations = event.target.result;
        
        // Filter priority operations - those marked as priority or with specific types
        const priorityTypes = [
          'emergency', 
          'alerts', 
          'critical-care-plans', 
          'advanced-care-plans',
          'care-plan-monitoring',
          'care-plan-safety-alerts',
          'urgent-reports', 
          'high-priority-analytics',
          'real-time-analytics',
          'critical-predictions',
          'critical-integrations',
          'health-system-integrations',
          'ehr-critical-updates',
          'medical-device-alerts',
          'voice-command-updates',
          'voice-emergency-commands',
          'voice-accessibility-settings',
          'checkins',
          'user-safety-preferences'
        ];
        const priorityOperations = allOperations.filter(op => 
          op.priority === true || 
          priorityTypes.includes(op.type) ||
          (op.data && op.data.priority === true)
        );
        
        if (priorityOperations.length === 0) {
          console.log('[Mobile Service Worker] No priority operations to sync');
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${priorityOperations.length} priority operations`);
        
        // Notify clients that priority sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'PRIORITY_SYNC_STARTED',
            timestamp: new Date().toISOString(),
            operationsCount: priorityOperations.length
          });
        });
        
        // Process priority operations with enhanced conflict resolution
        await processSyncOperations(priorityOperations, db, true);
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Priority sync error:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'PRIORITY_SYNC_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Function to sync data when back online
async function syncData() {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error('[Mobile Service Worker] Database error:', event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] No pendingSync store found');
        
        // Notify clients that sync is complete (nothing to sync)
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            timestamp: new Date().toISOString(),
            operationsCount: 0
          });
        });
        
        return;
      }
      
      // Get all pending operations
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error('[Mobile Service Worker] Error getting pending operations:', event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const pendingOperations = event.target.result;
        
        if (pendingOperations.length === 0) {
          console.log('[Mobile Service Worker] No pending operations to sync');
          
          // Notify clients that sync is complete
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETED',
              timestamp: new Date().toISOString(),
              operationsCount: 0
            });
          });
          
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${pendingOperations.length} pending operations`);
        
        // Notify clients that sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_STARTED',
            timestamp: new Date().toISOString(),
            operationsCount: pendingOperations.length
          });
        });
        
        // Process operations with enhanced conflict resolution
        await processSyncOperations(pendingOperations, db);
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Sync error:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Function to sync specific data type
async function syncSpecificData(dataType) {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error(`[Mobile Service Worker] Database error syncing ${dataType}:`, event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log(`[Mobile Service Worker] No pendingSync store found for ${dataType}`);
        
        // Notify clients that sync is complete (nothing to sync)
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            dataType: dataType,
            timestamp: new Date().toISOString(),
            operationsCount: 0
          });
        });
        
        return;
      }
      
      // Get pending operations for the specific data type
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error(`[Mobile Service Worker] Error getting pending ${dataType} operations:`, event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const allOperations = event.target.result;
        // Filter to only include operations of the requested type
        const typeOperations = allOperations.filter(op => op.type === dataType);
        
        if (typeOperations.length === 0) {
          console.log(`[Mobile Service Worker] No pending ${dataType} operations to sync`);
          
          // Notify clients that sync is complete
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETED',
              dataType: dataType,
              timestamp: new Date().toISOString(),
              operationsCount: 0
            });
          });
          
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${typeOperations.length} pending ${dataType} operations`);
        
        // Notify clients that sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_STARTED',
            dataType: dataType,
            timestamp: new Date().toISOString(),
            operationsCount: typeOperations.length
          });
        });
        
        // Process operations with enhanced conflict resolution
        await processSyncOperations(typeOperations, db);
      };
    };
  } catch (error) {
    console.error(`[Mobile Service Worker] ${dataType} sync error:`, error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        dataType: dataType,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Helper function to get the device ID
function getDeviceId() {
  // Try to get from storage
  const storedId = self.registration.scope + '_device_id';
  
  // If already generated, return it
  if (self._deviceId) {
    return self._deviceId;
  }
  
  // Generate a new ID if none exists
  self._deviceId = `careunity_mobile_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Return the device ID
  return self._deviceId;
}

// Enhanced function to process sync operations with conflict resolution
async function processSyncOperations(operations, db, isPriority = false) {
  // Create conflict resolver instance
  const conflictResolver = new self.ConflictResolver();
  
  // Group operations by type
  const operationsByType = operations.reduce((acc, op) => {
    if (!acc[op.type]) {
      acc[op.type] = [];
    }
    acc[op.type].push(op);
    return acc;
  }, {});
  
  let successCount = 0;
  let failCount = 0;
  let conflictCount = 0;
  
  for (const [type, typeOperations] of Object.entries(operationsByType)) {
    try {
      // Endpoint for this operation type
      const endpoint = `/api/${type}`;
      
      // Prepare the payload with version information for conflict detection
      const payload = {
        operations: typeOperations.map(op => ({
          id: op.id,
          action: op.action,
          data: op.data,
          timestamp: op.timestamp,
          deviceId: getDeviceId(),
          version: op.version || 1,
          priority: isPriority || op.priority || false
        }))
      };
      
      // Send to server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': getDeviceId(),
          'X-Device-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      
      // Process successful operations
      if (result.successful && result.successful.length > 0) {
        // Remove successful operations
        const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('pendingSync');
        
        for (const id of result.successful) {
          deleteStore.delete(id);
        }
        
        successCount += result.successful.length;
      }
      
      // Process conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        conflictCount += result.conflicts.length;
        
        for (const conflict of result.conflicts) {
          try {
            // Get the client data from the pending operation
            const opIndex = typeOperations.findIndex(op => op.id === conflict.id);
            if (opIndex === -1) continue;
            
            const clientData = typeOperations[opIndex].data;
            const serverData = conflict.serverData;
            
            // Resolve the conflict using our conflict resolver
            const resolvedData = await conflictResolver.resolveConflict(
              clientData,
              serverData,
              type
            );
            
            // Handle the resolution result
            if (resolvedData.createDuplicate) {
              // Special case for duplicate creation strategy
              
              // We're good with the server version, but also need to create a new record
              const duplicateTransaction = db.transaction(['pendingSync'], 'readwrite');
              const duplicateStore = duplicateTransaction.objectStore('pendingSync');
              
              // Add a new operation to create the duplicate
              const newOp = {
                id: `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                action: 'create',
                data: resolvedData.newClientData,
                timestamp: new Date().toISOString(),
                attempts: 0,
                priority: isPriority
              };
              
              duplicateStore.add(newOp);
              
              // Remove the original conflicting operation
              const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
              const deleteStore = deleteTransaction.objectStore('pendingSync');
              deleteStore.delete(conflict.id);
              
              successCount++; // Count as success for reporting purposes
            } else if (resolvedData._conflictResolution.strategy === 'manual') {
              // For manual resolution, keep the operation in pending
              // but update it with conflict info
              const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
              const updateStore = updateTransaction.objectStore('pendingSync');
              
              const pendingOp = typeOperations[opIndex];
              pendingOp.hasConflict = true;
              pendingOp.conflictId = resolvedData._conflictResolution.conflictId;
              pendingOp.conflictTimestamp = resolvedData._conflictResolution.timestamp;
              pendingOp.attempts = (pendingOp.attempts || 0) + 1;
              pendingOp.lastAttempt = new Date().toISOString();
              
              updateStore.put(pendingOp);
            } else {
              // For other resolution strategies, send the resolved data to the server
              const resolveResponse = await fetch(`${endpoint}/resolve-conflict`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Client-ID': getDeviceId()
                },
                body: JSON.stringify({
                  id: conflict.id,
                  resolvedData: resolvedData,
                  resolution: resolvedData._conflictResolution
                })
              });
              
              if (resolveResponse.ok) {
                // Conflict resolved successfully
                const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
                const deleteStore = deleteTransaction.objectStore('pendingSync');
                deleteStore.delete(conflict.id);
                
                successCount++;
              } else {
                // Failed to resolve conflict
                const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
                const updateStore = updateTransaction.objectStore('pendingSync');
                
                const pendingOp = typeOperations[opIndex];
                pendingOp.hasConflict = true;
                pendingOp.conflictError = 'Failed to apply conflict resolution';
                pendingOp.attempts = (pendingOp.attempts || 0) + 1;
                pendingOp.lastAttempt = new Date().toISOString();
                
                updateStore.put(pendingOp);
                
                failCount++;
              }
            }
          } catch (conflictError) {
            console.error(`[Mobile Service Worker] Error resolving conflict:`, conflictError);
            failCount++;
          }
        }
      }
      
      // Process failed operations
      if (result.failed && result.failed.length > 0) {
        // Update failed operations
        const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
        const updateStore = updateTransaction.objectStore('pendingSync');
        
        for (const failedOp of result.failed) {
          const getRequest = updateStore.get(failedOp.id);
          
          getRequest.onsuccess = (event) => {
            const operation = event.target.result;
            if (operation) {
              operation.attempts = (operation.attempts || 0) + 1;
              operation.lastAttempt = new Date().toISOString();
              operation.conflictReason = failedOp.reason;
              
              // Add exponential backoff for retries
              const backoffMinutes = Math.min(Math.pow(2, operation.attempts), 60); // Max 60 minutes
              operation.nextAttempt = new Date(Date.now() + (backoffMinutes * 60 * 1000)).toISOString();
              
              updateStore.put(operation);
            }
          };
        }
        
        failCount += result.failed.length;
      }
    } catch (error) {
      console.error(`[Mobile Service Worker] Error syncing ${type}:`, error);
      failCount += typeOperations.length;
      
      // Update attempt count for failed operations
      const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
      const updateStore = updateTransaction.objectStore('pendingSync');
      
      for (const op of typeOperations) {
        const getRequest = updateStore.get(op.id);
        
        getRequest.onsuccess = (event) => {
          const operation = event.target.result;
          if (operation) {
            operation.attempts = (operation.attempts || 0) + 1;
            operation.lastAttempt = new Date().toISOString();
            operation.error = error.message;
            
            // Add exponential backoff for retries
            const backoffMinutes = Math.min(Math.pow(2, operation.attempts), 60); // Max 60 minutes
            operation.nextAttempt = new Date(Date.now() + (backoffMinutes * 60 * 1000)).toISOString();
            
            updateStore.put(operation);
          }
        };
      }
    }
  }
  
  console.log(`[Mobile Service Worker] Sync completed: ${successCount} successful, ${failCount} failed, ${conflictCount} conflicts`);
  
  // Notify clients that sync is complete
  const finalClients = await self.clients.matchAll();
  finalClients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETED',
      timestamp: new Date().toISOString(),
      operationsCount: operations.length,
      successCount: successCount,
      failCount: failCount,
      conflictCount: conflictCount
    });
  });
  
  return { successCount, failCount, conflictCount };
}

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  // Enhanced options with category support
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/careunity-mobile.html',
      timestamp: Date.now(),
      category: data.category || 'general',
      priority: data.priority || 'normal',
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      carePlanId: data.carePlanId,
      carePlanTemplateId: data.carePlanTemplateId,
      carePlanMonitoringAlert: data.carePlanMonitoringAlert,
      reportId: data.reportId,
      reportTemplateId: data.reportTemplateId,
      analyticsId: data.analyticsId,
      analyticsMetricId: data.analyticsMetricId,
      analyticsPredictionId: data.analyticsPredictionId,
      analyticsDashboardId: data.analyticsDashboardId,
      integrationId: data.integrationId,
      healthIntegrationId: data.healthIntegrationId,
      ehrIntegrationId: data.ehrIntegrationId,
      deviceIntegrationId: data.deviceIntegrationId,
      voiceCommandId: data.voiceCommandId,
      voiceIntentId: data.voiceIntentId,
      userPreferenceUpdate: data.userPreferenceUpdate,
      accessibilityAction: data.accessibilityAction
    },
    actions: data.actions || [],
    tag: data.tag || 'careunity-notification',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    renotify: data.renotify || false,
    image: data.image
  };
  
  // Handle priority notifications differently
  if (data.priority === 'high' || data.priority === 'urgent') {
    // For high priority, ensure it's not silent and requires interaction
    options.silent = false;
    options.requireInteraction = true;
    options.vibrate = [200, 100, 200, 100, 200]; // More noticeable vibration pattern
    options.sound = data.sound || '/sounds/high-priority.mp3'; // Custom sound
    
    // Ensure notification is shown even if UI is open
    options.renotify = true;
  }

  // Handle accessibility needs
  if (data.accessibilityNeeds) {
    if (data.accessibilityNeeds.includes('vision-impaired')) {
      options.vibrate = [300, 200, 300, 200, 300]; // Distinctive pattern
    }
    if (data.accessibilityNeeds.includes('hearing-impaired')) {
      options.vibrate = [500, 200, 500, 200, 500]; // Stronger vibration
    }
  }
  
  // Enhanced notification with analytics
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      // Log notification for analytics
      logNotificationForAnalytics(data)
    ])
  );
});

// Helper function to log notifications for analytics
async function logNotificationForAnalytics(notificationData) {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      
      // Make sure the store exists
      if (!db.objectStoreNames.contains('notificationAnalytics')) {
        return;
      }
      
      // Enhanced analytics with more detailed categorization
      const analyticsEntry = {
        title: notificationData.title,
        body: notificationData.body,
        category: notificationData.category || 'general',
        subCategory: notificationData.subCategory || '',
        priority: notificationData.priority || 'normal',
        source: notificationData.source || 'system',
        featureArea: getFeatureArea(notificationData),
        timestamp: Date.now(),
        received: true,
        clicked: false,
        actioned: false,
        dismissed: false,
        deviceId: getDeviceId(),
        userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionId: self._sessionId || generateSessionId(),
        networkStatus: navigator.onLine ? 'online' : 'offline',
        accessibilitySettings: notificationData.accessibilityNeeds || []
      };
      
      // Log the notification
      const transaction = db.transaction(['notificationAnalytics'], 'readwrite');
      const store = transaction.objectStore('notificationAnalytics');
      
      store.add(analyticsEntry);
      
      // If high priority, also log to critical events store
      if (notificationData.priority === 'high' || notificationData.priority === 'urgent') {
        if (db.objectStoreNames.contains('criticalEvents')) {
          const criticalTransaction = db.transaction(['criticalEvents'], 'readwrite');
          const criticalStore = criticalTransaction.objectStore('criticalEvents');
          
          criticalStore.add({
            type: 'notification',
            data: analyticsEntry,
            priority: notificationData.priority,
            timestamp: Date.now(),
            processed: false
          });
        }
      }
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Failed to log notification:', error);
  }
}

// Helper to determine feature area from notification data
function getFeatureArea(data) {
  if (data.carePlanId || data.carePlanTemplateId || data.carePlanMonitoringAlert) {
    return 'care-plans';
  } else if (data.reportId || data.reportTemplateId) {
    return 'reporting';
  } else if (data.analyticsId || data.analyticsMetricId || data.analyticsPredictionId || data.analyticsDashboardId) {
    return 'analytics';
  } else if (data.integrationId || data.healthIntegrationId || data.ehrIntegrationId || data.deviceIntegrationId) {
    return 'integrations';
  } else if (data.voiceCommandId || data.voiceIntentId) {
    return 'voice-commands';
  } else if (data.userPreferenceUpdate || data.accessibilityAction) {
    return 'user-experience';
  } else if (data.category) {
    return data.category;
  } else {
    return 'other';
  }
}

// Generate unique session ID
function generateSessionId() {
  self._sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return self._sessionId;
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  // Log for analytics
  logNotificationInteraction(event.notification, 'clicked', event.action);
  
  // Close the notification
  event.notification.close();
  
  // Store notification data
  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/careunity-mobile.html';
  
  // Handle based on action and notification data
  if (event.action) {
    // Handle different actions
    console.log(`[Mobile Service Worker] Notification action clicked: ${event.action}`);
    
    switch (event.action) {
      case 'view-care-plan':
        if (notificationData.carePlanId) {
          targetUrl = `/advanced-care-plan.html?id=${notificationData.carePlanId}`;
        }
        break;
        
      case 'view-care-plan-template':
        if (notificationData.carePlanTemplateId) {
          targetUrl = `/advanced-care-plan.html?templateId=${notificationData.carePlanTemplateId}`;
        }
        break;
        
      case 'view-monitoring-alert':
        if (notificationData.carePlanMonitoringAlert) {
          targetUrl = `/advanced-care-plan.html?alertId=${notificationData.carePlanMonitoringAlert}`;
        }
        break;
        
      case 'view-report':
        if (notificationData.reportId) {
          targetUrl = `/reports.html?id=${notificationData.reportId}`;
        }
        break;
        
      case 'view-analytics':
        if (notificationData.analyticsId) {
          targetUrl = `/analytics-dashboard.html?id=${notificationData.analyticsId}`;
        }
        break;
        
      case 'view-integration':
        if (notificationData.integrationId) {
          targetUrl = `/integration-center.html?id=${notificationData.integrationId}`;
        }
        break;
        
      case 'view-voice-commands':
        if (notificationData.voiceCommandId) {
          targetUrl = `/careunity-mobile.html?voiceCommandId=${notificationData.voiceCommandId}`;
        }
        break;
        
      case 'dismiss':
        // Just dismiss the notification
        logNotificationInteraction(event.notification, 'dismissed');
        return;
        
      case 'snooze':
        // Schedule to show again later
        scheduleReminderNotification(event.notification);
        return;
        
      default:
        // If custom actions defined in the notification data, use those URLs
        if (notificationData.actions) {
          const actionData = notificationData.actions.find(a => a.action === event.action);
          if (actionData && actionData.url) {
            targetUrl = actionData.url;
          }
        }
    }
  } else {
    // Default click behavior - based on notification category
    if (notificationData.category === 'care-plans' && notificationData.carePlanId) {
      targetUrl = `/advanced-care-plan.html?id=${notificationData.carePlanId}`;
    } else if (notificationData.category === 'reports' && notificationData.reportId) {
      targetUrl = `/reports.html?id=${notificationData.reportId}`;
    } else if (notificationData.category === 'analytics' && notificationData.analyticsId) {
      targetUrl = `/analytics-dashboard.html?id=${notificationData.analyticsId}`;
    } else if (notificationData.category === 'integrations' && notificationData.integrationId) {
      targetUrl = `/integration-center.html?id=${notificationData.integrationId}`;
    } else if (notificationData.category === 'voice-commands' && notificationData.voiceCommandId) {
      targetUrl = `/careunity-mobile.html?voiceCommandId=${notificationData.voiceCommandId}`;
    }
  }
  
  // Open window based on notification data
  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});

// Helper function to log notification interactions
async function logNotificationInteraction(notification, interaction, action = null) {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      
      // Make sure the store exists
      if (!db.objectStoreNames.contains('notificationAnalytics')) {
        return;
      }
      
      // Find the original notification entry
      const transaction = db.transaction(['notificationAnalytics'], 'readwrite');
      const store = transaction.objectStore('notificationAnalytics');
      
      // Use a cursor to find notifications with matching info
      const cursorRequest = store.openCursor();
      
      cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        
        if (cursor) {
          const value = cursor.value;
          
          // Match based on title, timestamp, etc.
          if (value.title === notification.title && 
              value.deviceId === getDeviceId() &&
              Math.abs(value.timestamp - notification.data.timestamp) < 1000) {
            
            // Update the interaction data
            const updatedValue = { ...value };
            
            // Set appropriate flags based on interaction type
            if (interaction === 'clicked') {
              updatedValue.clicked = true;
              updatedValue.clickedTimestamp = Date.now();
            } else if (interaction === 'actioned') {
              updatedValue.actioned = true;
              updatedValue.actionType = action;
              updatedValue.actionedTimestamp = Date.now();
            } else if (interaction === 'dismissed') {
              updatedValue.dismissed = true;
              updatedValue.dismissedTimestamp = Date.now();
            }
            
            // Update the record
            cursor.update(updatedValue);
            return;
          }
          
          // Move to next record
          cursor.continue();
        }
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Failed to log notification interaction:', error);
  }
}

// Helper function to schedule a reminder notification
async function scheduleReminderNotification(notification) {
  // Get the original notification data
  const data = notification.data;
  
  // Set a timeout to show the notification again
  setTimeout(() => {
    // Show a slightly modified notification
    self.registration.showNotification(`${notification.title} (Reminder)`, {
      body: notification.options.body,
      icon: notification.options.icon,
      badge: notification.options.badge,
      data: {
        ...data,
        isReminder: true,
        originalTimestamp: data.timestamp
      },
      actions: notification.options.actions,
      requireInteraction: notification.options.requireInteraction
    });
  }, 30 * 60 * 1000); // Default: 30 minutes later
}

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-periodic') {
    console.log('[Mobile Service Worker] Periodic sync triggered');
    event.waitUntil(syncData());
  } else if (event.tag === 'sync-care-plans-periodic') {
    console.log('[Mobile Service Worker] Periodic care plans sync triggered');
    event.waitUntil(syncSpecificData('carePlans'));
  } else if (event.tag === 'sync-analytics-periodic') {
    console.log('[Mobile Service Worker] Periodic analytics sync triggered');
    event.waitUntil(syncSpecificData('analytics'));
  } else if (event.tag === 'sync-reports-periodic') {
    console.log('[Mobile Service Worker] Periodic reports sync triggered');
    event.waitUntil(syncSpecificData('reports'));
  } else if (event.tag === 'sync-voice-periodic') {
    console.log('[Mobile Service Worker] Periodic voice commands sync triggered');
    event.waitUntil(syncSpecificData('voiceCommands'));
  } else if (event.tag === 'sync-integrations-periodic') {
    console.log('[Mobile Service Worker] Periodic integrations sync triggered');
    event.waitUntil(syncSpecificData('integrations'));
  } else if (event.tag === 'sync-user-preferences-periodic') {
    console.log('[Mobile Service Worker] Periodic user preferences sync triggered');
    event.waitUntil(syncSpecificData('userPreferences'));
  } else if (event.tag === 'sync-monitoring-periodic') {
    console.log('[Mobile Service Worker] Periodic care plan monitoring sync triggered');
    event.waitUntil(syncSpecificData('carePlanMonitoring'));
  } else if (event.tag === 'analytics-collection-periodic') {
    console.log('[Mobile Service Worker] Periodic analytics collection triggered');
    event.waitUntil(collectAndSyncAnalytics());
  }
});

// Function to collect and sync analytics data
async function collectAndSyncAnalytics() {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check for required stores
      if (!db.objectStoreNames.contains('analyticsData') || 
          !db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] Analytics stores not found');
        return;
      }
      
      // Collect client performance metrics
      const performanceData = collectPerformanceData();
      
      // Get stored notification analytics
      const notificationAnalytics = await getStoredAnalytics(db, 'notificationAnalytics');
      
      // Get stored feature usage analytics
      const featureUsage = await getStoredAnalytics(db, 'featureUsage');
      
      // Get stored error reports
      const errorReports = await getStoredAnalytics(db, 'errorReports');
      
      // Combine all analytics
      const analyticsPackage = {
        deviceId: getDeviceId(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        performance: performanceData,
        notifications: notificationAnalytics,
        features: featureUsage,
        errors: errorReports
      };
      
      // Create a new sync operation
      const newSyncOp = {
        id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'analytics',
        action: 'create',
        data: analyticsPackage,
        timestamp: new Date().toISOString(),
        attempts: 0
      };
      
      // Add to pending sync
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      store.add(newSyncOp);
      
      // Trigger sync if online
      if (navigator.onLine) {
        await syncSpecificData('analytics');
      }
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Analytics collection error:', error);
  }
}

// Helper to collect performance data
function collectPerformanceData() {
  let performance = {};
  
  // Basic connection info
  if (navigator.connection) {
    performance.connection = {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }
  
  // Memory usage
  if (performance.memory) {
    performance.memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    };
  }
  
  // Service worker performance
  performance.serviceWorker = {
    uptime: Date.now() - self._startTime,
    syncOperationsProcessed: self._syncOpsProcessed || 0,
    notificationsShown: self._notificationsShown || 0
  };
  
  return performance;
}

// Helper to get stored analytics
async function getStoredAnalytics(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      resolve([]);
      return;
    }
    
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const result = event.target.result;
      resolve(result);
    };
    
    request.onerror = (event) => {
      reject(new Error(`Failed to get ${storeName} data`));
    };
  });
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Mobile Service Worker] Install');
  
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Mobile Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Create other caches
      caches.open(DYNAMIC_CACHE_NAME),
      caches.open(API_CACHE_NAME)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Mobile Service Worker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete old caches but not the current ones
        if (![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME].includes(key)) {
          console.log('[Mobile Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      // Claim clients so the service worker is in control from the start
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request is for an API endpoint
function isApiRequest(url) {
  const requestUrl = new URL(url);
  return API_ENDPOINTS.some(endpoint => requestUrl.pathname.startsWith(endpoint));
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(url) {
  const requestUrl = new URL(url);
  return STATIC_ASSETS.some(asset => {
    // Handle both absolute and relative URLs in the STATIC_ASSETS list
    if (asset.startsWith('http')) {
      return asset === url;
    } else {
      return requestUrl.pathname === asset || requestUrl.pathname.endsWith(asset);
    }
  });
}

// Helper function to determine if a cached API response is stale
function isApiResponseStale(response) {
  if (!response || !response.headers || !response.headers.has('date')) {
    return true;
  }
  
  const dateHeader = response.headers.get('date');
  const cachedDate = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - cachedDate) > API_CACHE_MAX_AGE;
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests except for CDNs we explicitly want to cache
  const allowedHosts = [
    self.location.hostname,
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'randomuser.me'
  ];
  
  if (!allowedHosts.some(host => url.hostname.includes(host))) {
    return;
  }
  
  // Different caching strategies based on request type
  if (isApiRequest(event.request.url)) {
    // Network-first for API requests with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(event.request));
  } else if (isStaticAsset(event.request.url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirstWithNetworkFallback(event.request));
  } else {
    // Stale-while-revalidate for all other requests
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Cache-first strategy with network fallback
async function cacheFirstWithNetworkFallback(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try to get from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, get from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first strategy error:', error);
    
    // If request is for HTML document, return offline page
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise just return the error
    throw error;
  }
}

// Network-first strategy with offline fallback
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try to get fresh data from network
    const networkResponse = await fetch(request);
    
    // Cache the fresh response
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to cache');
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If nothing in cache, return JSON with offline indicator
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'You are currently offline and this data is not cached.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  // Try to get from cache immediately
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in the background
  const networkResponsePromise = fetch(request).then(networkResponse => {
    // Cache the new response for next time
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(error => {
    console.error('[Service Worker] Stale while revalidate fetch error:', error);
    throw error;
  });
  
  // Return the cached response immediately if we have it
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for the network response
  try {
    return await networkResponsePromise;
  } catch (error) {
    // If both cache and network fail, try to return offline page for HTML
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise just return the error
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[Mobile Service Worker] Syncing data');
    event.waitUntil(syncData());
  } else if (event.tag === 'sync-visits') {
    console.log('[Mobile Service Worker] Syncing visits');
    event.waitUntil(syncSpecificData('visits'));
  } else if (event.tag === 'sync-care-plans') {
    console.log('[Mobile Service Worker] Syncing care plans');
    event.waitUntil(syncSpecificData('carePlans'));
  } else if (event.tag === 'sync-advanced-care-plans') {
    console.log('[Mobile Service Worker] Syncing advanced care plans');
    event.waitUntil(syncSpecificData('advancedCarePlans'));
  } else if (event.tag === 'sync-care-plan-templates') {
    console.log('[Mobile Service Worker] Syncing care plan templates');
    event.waitUntil(syncSpecificData('carePlanTemplates'));
  } else if (event.tag === 'sync-care-plan-monitoring') {
    console.log('[Mobile Service Worker] Syncing care plan monitoring data');
    event.waitUntil(syncSpecificData('carePlanMonitoring'));
  } else if (event.tag === 'sync-care-plan-history') {
    console.log('[Mobile Service Worker] Syncing care plan history');
    event.waitUntil(syncSpecificData('carePlanHistory'));
  } else if (event.tag === 'sync-analytics') {
    console.log('[Mobile Service Worker] Syncing analytics data');
    event.waitUntil(syncSpecificData('analytics'));
  } else if (event.tag === 'sync-analytics-metrics') {
    console.log('[Mobile Service Worker] Syncing analytics metrics');
    event.waitUntil(syncSpecificData('analyticsMetrics'));
  } else if (event.tag === 'sync-analytics-predictions') {
    console.log('[Mobile Service Worker] Syncing prediction models');
    event.waitUntil(syncSpecificData('analyticsPredictions'));
  } else if (event.tag === 'sync-reports') {
    console.log('[Mobile Service Worker] Syncing reports');
    event.waitUntil(syncSpecificData('reports'));
  } else if (event.tag === 'sync-report-templates') {
    console.log('[Mobile Service Worker] Syncing report templates');
    event.waitUntil(syncSpecificData('reportTemplates'));
  } else if (event.tag === 'sync-custom-reports') {
    console.log('[Mobile Service Worker] Syncing custom reports');
    event.waitUntil(syncSpecificData('customReports'));
  } else if (event.tag === 'sync-voice-commands') {
    console.log('[Mobile Service Worker] Syncing voice command preferences');
    event.waitUntil(syncSpecificData('voiceCommands'));
  } else if (event.tag === 'sync-voice-intents') {
    console.log('[Mobile Service Worker] Syncing voice intent models');
    event.waitUntil(syncSpecificData('voiceIntents'));
  } else if (event.tag === 'sync-voice-context') {
    console.log('[Mobile Service Worker] Syncing voice context data');
    event.waitUntil(syncSpecificData('voiceContext'));
  } else if (event.tag === 'sync-checkins') {
    console.log('[Mobile Service Worker] Syncing check-ins');
    event.waitUntil(syncSpecificData('checkins'));
  } else if (event.tag === 'sync-priority') {
    console.log('[Mobile Service Worker] Syncing priority data');
    event.waitUntil(syncPriorityData());
  } else if (event.tag === 'sync-integrations') {
    console.log('[Mobile Service Worker] Syncing integration configurations');
    event.waitUntil(syncSpecificData('integrations'));
  } else if (event.tag === 'sync-health-integrations') {
    console.log('[Mobile Service Worker] Syncing healthcare integrations');
    event.waitUntil(syncSpecificData('healthIntegrations'));
  } else if (event.tag === 'sync-ehr-integrations') {
    console.log('[Mobile Service Worker] Syncing EHR integrations');
    event.waitUntil(syncSpecificData('ehrIntegrations'));
  } else if (event.tag === 'sync-device-integrations') {
    console.log('[Mobile Service Worker] Syncing medical device integrations');
    event.waitUntil(syncSpecificData('deviceIntegrations'));
  } else if (event.tag === 'sync-user-preferences') {
    console.log('[Mobile Service Worker] Syncing user experience preferences');
    event.waitUntil(syncSpecificData('userPreferences'));
  }
});

// Function to sync prioritized data first
async function syncPriorityData() {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error('[Mobile Service Worker] Database error:', event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] No pendingSync store found');
        return;
      }
      
      // Get only priority operations
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error('[Mobile Service Worker] Error getting pending operations:', event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const allOperations = event.target.result;
        
        // Filter priority operations - those marked as priority or with specific types
        const priorityTypes = [
          'emergency', 
          'alerts', 
          'critical-care-plans', 
          'advanced-care-plans',
          'care-plan-monitoring',
          'care-plan-safety-alerts',
          'urgent-reports', 
          'high-priority-analytics',
          'real-time-analytics',
          'critical-predictions',
          'critical-integrations',
          'health-system-integrations',
          'ehr-critical-updates',
          'medical-device-alerts',
          'voice-command-updates',
          'voice-emergency-commands',
          'voice-accessibility-settings',
          'checkins',
          'user-safety-preferences'
        ];
        const priorityOperations = allOperations.filter(op => 
          op.priority === true || 
          priorityTypes.includes(op.type) ||
          (op.data && op.data.priority === true)
        );
        
        if (priorityOperations.length === 0) {
          console.log('[Mobile Service Worker] No priority operations to sync');
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${priorityOperations.length} priority operations`);
        
        // Notify clients that priority sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'PRIORITY_SYNC_STARTED',
            timestamp: new Date().toISOString(),
            operationsCount: priorityOperations.length
          });
        });
        
        // Process priority operations with enhanced conflict resolution
        await processSyncOperations(priorityOperations, db, true);
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Priority sync error:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'PRIORITY_SYNC_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Function to sync data when back online
async function syncData() {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error('[Mobile Service Worker] Database error:', event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] No pendingSync store found');
        
        // Notify clients that sync is complete (nothing to sync)
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            timestamp: new Date().toISOString(),
            operationsCount: 0
          });
        });
        
        return;
      }
      
      // Get all pending operations
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error('[Mobile Service Worker] Error getting pending operations:', event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const pendingOperations = event.target.result;
        
        if (pendingOperations.length === 0) {
          console.log('[Mobile Service Worker] No pending operations to sync');
          
          // Notify clients that sync is complete
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETED',
              timestamp: new Date().toISOString(),
              operationsCount: 0
            });
          });
          
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${pendingOperations.length} pending operations`);
        
        // Notify clients that sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_STARTED',
            timestamp: new Date().toISOString(),
            operationsCount: pendingOperations.length
          });
        });
        
        // Process operations with enhanced conflict resolution
        await processSyncOperations(pendingOperations, db);
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Sync error:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Function to sync specific data type
async function syncSpecificData(dataType) {
  try {
    // Open a connection to IndexedDB
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onerror = (event) => {
      console.error(`[Mobile Service Worker] Database error syncing ${dataType}:`, event.target.error);
      throw new Error('Failed to open database');
    };
    
    // When database is opened
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check if store exists
      if (!db.objectStoreNames.contains('pendingSync')) {
        console.log(`[Mobile Service Worker] No pendingSync store found for ${dataType}`);
        
        // Notify clients that sync is complete (nothing to sync)
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            dataType: dataType,
            timestamp: new Date().toISOString(),
            operationsCount: 0
          });
        });
        
        return;
      }
      
      // Get pending operations for the specific data type
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = (event) => {
        console.error(`[Mobile Service Worker] Error getting pending ${dataType} operations:`, event.target.error);
        throw new Error('Failed to get pending operations');
      };
      
      request.onsuccess = async (event) => {
        const allOperations = event.target.result;
        // Filter to only include operations of the requested type
        const typeOperations = allOperations.filter(op => op.type === dataType);
        
        if (typeOperations.length === 0) {
          console.log(`[Mobile Service Worker] No pending ${dataType} operations to sync`);
          
          // Notify clients that sync is complete
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETED',
              dataType: dataType,
              timestamp: new Date().toISOString(),
              operationsCount: 0
            });
          });
          
          return;
        }
        
        console.log(`[Mobile Service Worker] Found ${typeOperations.length} pending ${dataType} operations`);
        
        // Notify clients that sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_STARTED',
            dataType: dataType,
            timestamp: new Date().toISOString(),
            operationsCount: typeOperations.length
          });
        });
        
        // Process operations with enhanced conflict resolution
        await processSyncOperations(typeOperations, db);
      };
    };
  } catch (error) {
    console.error(`[Mobile Service Worker] ${dataType} sync error:`, error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        dataType: dataType,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Helper function to get the device ID
function getDeviceId() {
  // Try to get from storage
  const storedId = self.registration.scope + '_device_id';
  
  // If already generated, return it
  if (self._deviceId) {
    return self._deviceId;
  }
  
  // Generate a new ID if none exists
  self._deviceId = `careunity_mobile_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Return the device ID
  return self._deviceId;
}

// Enhanced function to process sync operations with conflict resolution
async function processSyncOperations(operations, db, isPriority = false) {
  // Create conflict resolver instance
  const conflictResolver = new self.ConflictResolver();
  
  // Group operations by type
  const operationsByType = operations.reduce((acc, op) => {
    if (!acc[op.type]) {
      acc[op.type] = [];
    }
    acc[op.type].push(op);
    return acc;
  }, {});
  
  let successCount = 0;
  let failCount = 0;
  let conflictCount = 0;
  
  for (const [type, typeOperations] of Object.entries(operationsByType)) {
    try {
      // Endpoint for this operation type
      const endpoint = `/api/${type}`;
      
      // Prepare the payload with version information for conflict detection
      const payload = {
        operations: typeOperations.map(op => ({
          id: op.id,
          action: op.action,
          data: op.data,
          timestamp: op.timestamp,
          deviceId: getDeviceId(),
          version: op.version || 1,
          priority: isPriority || op.priority || false
        }))
      };
      
      // Send to server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': getDeviceId(),
          'X-Device-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      
      // Process successful operations
      if (result.successful && result.successful.length > 0) {
        // Remove successful operations
        const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('pendingSync');
        
        for (const id of result.successful) {
          deleteStore.delete(id);
        }
        
        successCount += result.successful.length;
      }
      
      // Process conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        conflictCount += result.conflicts.length;
        
        for (const conflict of result.conflicts) {
          try {
            // Get the client data from the pending operation
            const opIndex = typeOperations.findIndex(op => op.id === conflict.id);
            if (opIndex === -1) continue;
            
            const clientData = typeOperations[opIndex].data;
            const serverData = conflict.serverData;
            
            // Resolve the conflict using our conflict resolver
            const resolvedData = await conflictResolver.resolveConflict(
              clientData,
              serverData,
              type
            );
            
            // Handle the resolution result
            if (resolvedData.createDuplicate) {
              // Special case for duplicate creation strategy
              
              // We're good with the server version, but also need to create a new record
              const duplicateTransaction = db.transaction(['pendingSync'], 'readwrite');
              const duplicateStore = duplicateTransaction.objectStore('pendingSync');
              
              // Add a new operation to create the duplicate
              const newOp = {
                id: `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                action: 'create',
                data: resolvedData.newClientData,
                timestamp: new Date().toISOString(),
                attempts: 0,
                priority: isPriority
              };
              
              duplicateStore.add(newOp);
              
              // Remove the original conflicting operation
              const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
              const deleteStore = deleteTransaction.objectStore('pendingSync');
              deleteStore.delete(conflict.id);
              
              successCount++; // Count as success for reporting purposes
            } else if (resolvedData._conflictResolution.strategy === 'manual') {
              // For manual resolution, keep the operation in pending
              // but update it with conflict info
              const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
              const updateStore = updateTransaction.objectStore('pendingSync');
              
              const pendingOp = typeOperations[opIndex];
              pendingOp.hasConflict = true;
              pendingOp.conflictId = resolvedData._conflictResolution.conflictId;
              pendingOp.conflictTimestamp = resolvedData._conflictResolution.timestamp;
              pendingOp.attempts = (pendingOp.attempts || 0) + 1;
              pendingOp.lastAttempt = new Date().toISOString();
              
              updateStore.put(pendingOp);
            } else {
              // For other resolution strategies, send the resolved data to the server
              const resolveResponse = await fetch(`${endpoint}/resolve-conflict`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Client-ID': getDeviceId()
                },
                body: JSON.stringify({
                  id: conflict.id,
                  resolvedData: resolvedData,
                  resolution: resolvedData._conflictResolution
                })
              });
              
              if (resolveResponse.ok) {
                // Conflict resolved successfully
                const deleteTransaction = db.transaction(['pendingSync'], 'readwrite');
                const deleteStore = deleteTransaction.objectStore('pendingSync');
                deleteStore.delete(conflict.id);
                
                successCount++;
              } else {
                // Failed to resolve conflict
                const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
                const updateStore = updateTransaction.objectStore('pendingSync');
                
                const pendingOp = typeOperations[opIndex];
                pendingOp.hasConflict = true;
                pendingOp.conflictError = 'Failed to apply conflict resolution';
                pendingOp.attempts = (pendingOp.attempts || 0) + 1;
                pendingOp.lastAttempt = new Date().toISOString();
                
                updateStore.put(pendingOp);
                
                failCount++;
              }
            }
          } catch (conflictError) {
            console.error(`[Mobile Service Worker] Error resolving conflict:`, conflictError);
            failCount++;
          }
        }
      }
      
      // Process failed operations
      if (result.failed && result.failed.length > 0) {
        // Update failed operations
        const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
        const updateStore = updateTransaction.objectStore('pendingSync');
        
        for (const failedOp of result.failed) {
          const getRequest = updateStore.get(failedOp.id);
          
          getRequest.onsuccess = (event) => {
            const operation = event.target.result;
            if (operation) {
              operation.attempts = (operation.attempts || 0) + 1;
              operation.lastAttempt = new Date().toISOString();
              operation.conflictReason = failedOp.reason;
              
              // Add exponential backoff for retries
              const backoffMinutes = Math.min(Math.pow(2, operation.attempts), 60); // Max 60 minutes
              operation.nextAttempt = new Date(Date.now() + (backoffMinutes * 60 * 1000)).toISOString();
              
              updateStore.put(operation);
            }
          };
        }
        
        failCount += result.failed.length;
      }
    } catch (error) {
      console.error(`[Mobile Service Worker] Error syncing ${type}:`, error);
      failCount += typeOperations.length;
      
      // Update attempt count for failed operations
      const updateTransaction = db.transaction(['pendingSync'], 'readwrite');
      const updateStore = updateTransaction.objectStore('pendingSync');
      
      for (const op of typeOperations) {
        const getRequest = updateStore.get(op.id);
        
        getRequest.onsuccess = (event) => {
          const operation = event.target.result;
          if (operation) {
            operation.attempts = (operation.attempts || 0) + 1;
            operation.lastAttempt = new Date().toISOString();
            operation.error = error.message;
            
            // Add exponential backoff for retries
            const backoffMinutes = Math.min(Math.pow(2, operation.attempts), 60); // Max 60 minutes
            operation.nextAttempt = new Date(Date.now() + (backoffMinutes * 60 * 1000)).toISOString();
            
            updateStore.put(operation);
          }
        };
      }
    }
  }
  
  console.log(`[Mobile Service Worker] Sync completed: ${successCount} successful, ${failCount} failed, ${conflictCount} conflicts`);
  
  // Notify clients that sync is complete
  const finalClients = await self.clients.matchAll();
  finalClients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETED',
      timestamp: new Date().toISOString(),
      operationsCount: operations.length,
      successCount: successCount,
      failCount: failCount,
      conflictCount: conflictCount
    });
  });
  
  return { successCount, failCount, conflictCount };
}

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  // Enhanced options with category support
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/careunity-mobile.html',
      timestamp: Date.now(),
      category: data.category || 'general',
      priority: data.priority || 'normal',
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      carePlanId: data.carePlanId,
      carePlanTemplateId: data.carePlanTemplateId,
      carePlanMonitoringAlert: data.carePlanMonitoringAlert,
      reportId: data.reportId,
      reportTemplateId: data.reportTemplateId,
      analyticsId: data.analyticsId,
      analyticsMetricId: data.analyticsMetricId,
      analyticsPredictionId: data.analyticsPredictionId,
      analyticsDashboardId: data.analyticsDashboardId,
      integrationId: data.integrationId,
      healthIntegrationId: data.healthIntegrationId,
      ehrIntegrationId: data.ehrIntegrationId,
      deviceIntegrationId: data.deviceIntegrationId,
      voiceCommandId: data.voiceCommandId,
      voiceIntentId: data.voiceIntentId,
      userPreferenceUpdate: data.userPreferenceUpdate,
      accessibilityAction: data.accessibilityAction
    },
    actions: data.actions || [],
    tag: data.tag || 'careunity-notification',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    renotify: data.renotify || false,
    image: data.image
  };
  
  // Handle priority notifications differently
  if (data.priority === 'high' || data.priority === 'urgent') {
    // For high priority, ensure it's not silent and requires interaction
    options.silent = false;
    options.requireInteraction = true;
    options.vibrate = [200, 100, 200, 100, 200]; // More noticeable vibration pattern
    options.sound = data.sound || '/sounds/high-priority.mp3'; // Custom sound
    
    // Ensure notification is shown even if UI is open
    options.renotify = true;
  }

  // Handle accessibility needs
  if (data.accessibilityNeeds) {
    if (data.accessibilityNeeds.includes('vision-impaired')) {
      options.vibrate = [300, 200, 300, 200, 300]; // Distinctive pattern
    }
    if (data.accessibilityNeeds.includes('hearing-impaired')) {
      options.vibrate = [500, 200, 500, 200, 500]; // Stronger vibration
    }
  }
  
  // Enhanced notification with analytics
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      // Log notification for analytics
      logNotificationForAnalytics(data)
    ])
  );
});

// Helper function to log notifications for analytics
async function logNotificationForAnalytics(notificationData) {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      
      // Make sure the store exists
      if (!db.objectStoreNames.contains('notificationAnalytics')) {
        return;
      }
      
      // Enhanced analytics with more detailed categorization
      const analyticsEntry = {
        title: notificationData.title,
        body: notificationData.body,
        category: notificationData.category || 'general',
        subCategory: notificationData.subCategory || '',
        priority: notificationData.priority || 'normal',
        source: notificationData.source || 'system',
        featureArea: getFeatureArea(notificationData),
        timestamp: Date.now(),
        received: true,
        clicked: false,
        actioned: false,
        dismissed: false,
        deviceId: getDeviceId(),
        userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionId: self._sessionId || generateSessionId(),
        networkStatus: navigator.onLine ? 'online' : 'offline',
        accessibilitySettings: notificationData.accessibilityNeeds || []
      };
      
      // Log the notification
      const transaction = db.transaction(['notificationAnalytics'], 'readwrite');
      const store = transaction.objectStore('notificationAnalytics');
      
      store.add(analyticsEntry);
      
      // If high priority, also log to critical events store
      if (notificationData.priority === 'high' || notificationData.priority === 'urgent') {
        if (db.objectStoreNames.contains('criticalEvents')) {
          const criticalTransaction = db.transaction(['criticalEvents'], 'readwrite');
          const criticalStore = criticalTransaction.objectStore('criticalEvents');
          
          criticalStore.add({
            type: 'notification',
            data: analyticsEntry,
            priority: notificationData.priority,
            timestamp: Date.now(),
            processed: false
          });
        }
      }
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Failed to log notification:', error);
  }
}

// Helper to determine feature area from notification data
function getFeatureArea(data) {
  if (data.carePlanId || data.carePlanTemplateId || data.carePlanMonitoringAlert) {
    return 'care-plans';
  } else if (data.reportId || data.reportTemplateId) {
    return 'reporting';
  } else if (data.analyticsId || data.analyticsMetricId || data.analyticsPredictionId || data.analyticsDashboardId) {
    return 'analytics';
  } else if (data.integrationId || data.healthIntegrationId || data.ehrIntegrationId || data.deviceIntegrationId) {
    return 'integrations';
  } else if (data.voiceCommandId || data.voiceIntentId) {
    return 'voice-commands';
  } else if (data.userPreferenceUpdate || data.accessibilityAction) {
    return 'user-experience';
  } else if (data.category) {
    return data.category;
  } else {
    return 'other';
  }
}

// Generate unique session ID
function generateSessionId() {
  self._sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return self._sessionId;
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  // Log for analytics
  logNotificationInteraction(event.notification, 'clicked', event.action);
  
  // Close the notification
  event.notification.close();
  
  // Store notification data
  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/careunity-mobile.html';
  
  // Handle based on action and notification data
  if (event.action) {
    // Handle different actions
    console.log(`[Mobile Service Worker] Notification action clicked: ${event.action}`);
    
    switch (event.action) {
      case 'view-care-plan':
        if (notificationData.carePlanId) {
          targetUrl = `/advanced-care-plan.html?id=${notificationData.carePlanId}`;
        }
        break;
        
      case 'view-care-plan-template':
        if (notificationData.carePlanTemplateId) {
          targetUrl = `/advanced-care-plan.html?templateId=${notificationData.carePlanTemplateId}`;
        }
        break;
        
      case 'view-monitoring-alert':
        if (notificationData.carePlanMonitoringAlert) {
          targetUrl = `/advanced-care-plan.html?alertId=${notificationData.carePlanMonitoringAlert}`;
        }
        break;
        
      case 'view-report':
        if (notificationData.reportId) {
          targetUrl = `/reports.html?id=${notificationData.reportId}`;
        }
        break;
        
      case 'view-analytics':
        if (notificationData.analyticsId) {
          targetUrl = `/analytics-dashboard.html?id=${notificationData.analyticsId}`;
        }
        break;
        
      case 'view-integration':
        if (notificationData.integrationId) {
          targetUrl = `/integration-center.html?id=${notificationData.integrationId}`;
        }
        break;
        
      case 'view-voice-commands':
        if (notificationData.voiceCommandId) {
          targetUrl = `/careunity-mobile.html?voiceCommandId=${notificationData.voiceCommandId}`;
        }
        break;
        
      case 'dismiss':
        // Just dismiss the notification
        logNotificationInteraction(event.notification, 'dismissed');
        return;
        
      case 'snooze':
        // Schedule to show again later
        scheduleReminderNotification(event.notification);
        return;
        
      default:
        // If custom actions defined in the notification data, use those URLs
        if (notificationData.actions) {
          const actionData = notificationData.actions.find(a => a.action === event.action);
          if (actionData && actionData.url) {
            targetUrl = actionData.url;
          }
        }
    }
  } else {
    // Default click behavior - based on notification category
    if (notificationData.category === 'care-plans' && notificationData.carePlanId) {
      targetUrl = `/advanced-care-plan.html?id=${notificationData.carePlanId}`;
    } else if (notificationData.category === 'reports' && notificationData.reportId) {
      targetUrl = `/reports.html?id=${notificationData.reportId}`;
    } else if (notificationData.category === 'analytics' && notificationData.analyticsId) {
      targetUrl = `/analytics-dashboard.html?id=${notificationData.analyticsId}`;
    } else if (notificationData.category === 'integrations' && notificationData.integrationId) {
      targetUrl = `/integration-center.html?id=${notificationData.integrationId}`;
    } else if (notificationData.category === 'voice-commands' && notificationData.voiceCommandId) {
      targetUrl = `/careunity-mobile.html?voiceCommandId=${notificationData.voiceCommandId}`;
    }
  }
  
  // Open window based on notification data
  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});

// Helper function to log notification interactions
async function logNotificationInteraction(notification, interaction, action = null) {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      
      // Make sure the store exists
      if (!db.objectStoreNames.contains('notificationAnalytics')) {
        return;
      }
      
      // Find the original notification entry
      const transaction = db.transaction(['notificationAnalytics'], 'readwrite');
      const store = transaction.objectStore('notificationAnalytics');
      
      // Use a cursor to find notifications with matching info
      const cursorRequest = store.openCursor();
      
      cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        
        if (cursor) {
          const value = cursor.value;
          
          // Match based on title, timestamp, etc.
          if (value.title === notification.title && 
              value.deviceId === getDeviceId() &&
              Math.abs(value.timestamp - notification.data.timestamp) < 1000) {
            
            // Update the interaction data
            const updatedValue = { ...value };
            
            // Set appropriate flags based on interaction type
            if (interaction === 'clicked') {
              updatedValue.clicked = true;
              updatedValue.clickedTimestamp = Date.now();
            } else if (interaction === 'actioned') {
              updatedValue.actioned = true;
              updatedValue.actionType = action;
              updatedValue.actionedTimestamp = Date.now();
            } else if (interaction === 'dismissed') {
              updatedValue.dismissed = true;
              updatedValue.dismissedTimestamp = Date.now();
            }
            
            // Update the record
            cursor.update(updatedValue);
            return;
          }
          
          // Move to next record
          cursor.continue();
        }
      };
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Failed to log notification interaction:', error);
  }
}

// Helper function to schedule a reminder notification
async function scheduleReminderNotification(notification) {
  // Get the original notification data
  const data = notification.data;
  
  // Set a timeout to show the notification again
  setTimeout(() => {
    // Show a slightly modified notification
    self.registration.showNotification(`${notification.title} (Reminder)`, {
      body: notification.options.body,
      icon: notification.options.icon,
      badge: notification.options.badge,
      data: {
        ...data,
        isReminder: true,
        originalTimestamp: data.timestamp
      },
      actions: notification.options.actions,
      requireInteraction: notification.options.requireInteraction
    });
  }, 30 * 60 * 1000); // Default: 30 minutes later
}

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-periodic') {
    console.log('[Mobile Service Worker] Periodic sync triggered');
    event.waitUntil(syncData());
  } else if (event.tag === 'sync-care-plans-periodic') {
    console.log('[Mobile Service Worker] Periodic care plans sync triggered');
    event.waitUntil(syncSpecificData('carePlans'));
  } else if (event.tag === 'sync-analytics-periodic') {
    console.log('[Mobile Service Worker] Periodic analytics sync triggered');
    event.waitUntil(syncSpecificData('analytics'));
  } else if (event.tag === 'sync-reports-periodic') {
    console.log('[Mobile Service Worker] Periodic reports sync triggered');
    event.waitUntil(syncSpecificData('reports'));
  } else if (event.tag === 'sync-voice-periodic') {
    console.log('[Mobile Service Worker] Periodic voice commands sync triggered');
    event.waitUntil(syncSpecificData('voiceCommands'));
  } else if (event.tag === 'sync-integrations-periodic') {
    console.log('[Mobile Service Worker] Periodic integrations sync triggered');
    event.waitUntil(syncSpecificData('integrations'));
  } else if (event.tag === 'sync-user-preferences-periodic') {
    console.log('[Mobile Service Worker] Periodic user preferences sync triggered');
    event.waitUntil(syncSpecificData('userPreferences'));
  } else if (event.tag === 'sync-monitoring-periodic') {
    console.log('[Mobile Service Worker] Periodic care plan monitoring sync triggered');
    event.waitUntil(syncSpecificData('carePlanMonitoring'));
  } else if (event.tag === 'analytics-collection-periodic') {
    console.log('[Mobile Service Worker] Periodic analytics collection triggered');
    event.waitUntil(collectAndSyncAnalytics());
  }
});

// Function to collect and sync analytics data
async function collectAndSyncAnalytics() {
  try {
    // Open the database
    const dbPromise = indexedDB.open('CareUnityDB', 1);
    
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check for required stores
      if (!db.objectStoreNames.contains('analyticsData') || 
          !db.objectStoreNames.contains('pendingSync')) {
        console.log('[Mobile Service Worker] Analytics stores not found');
        return;
      }
      
      // Collect client performance metrics
      const performanceData = collectPerformanceData();
      
      // Get stored notification analytics
      const notificationAnalytics = await getStoredAnalytics(db, 'notificationAnalytics');
      
      // Get stored feature usage analytics
      const featureUsage = await getStoredAnalytics(db, 'featureUsage');
      
      // Get stored error reports
      const errorReports = await getStoredAnalytics(db, 'errorReports');
      
      // Combine all analytics
      const analyticsPackage = {
        deviceId: getDeviceId(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        performance: performanceData,
        notifications: notificationAnalytics,
        features: featureUsage,
        errors: errorReports
      };
      
      // Create a new sync operation
      const newSyncOp = {
        id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'analytics',
        action: 'create',
        data: analyticsPackage,
        timestamp: new Date().toISOString(),
        attempts: 0
      };
      
      // Add to pending sync
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      store.add(newSyncOp);
      
      // Trigger sync if online
      if (navigator.onLine) {
        await syncSpecificData('analytics');
      }
    };
  } catch (error) {
    console.error('[Mobile Service Worker] Analytics collection error:', error);
  }
}

// Helper to collect performance data
function collectPerformanceData() {
  let performance = {};
  
  // Basic connection info
  if (navigator.connection) {
    performance.connection = {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }
  
  // Memory usage
  if (performance.memory) {
    performance.memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    };
  }
  
  // Service worker performance
  performance.serviceWorker = {
    uptime: Date.now() - self._startTime,
    syncOperationsProcessed: self._syncOpsProcessed || 0,
    notificationsShown: self._notificationsShown || 0
  };
  
  return performance;
}

// Helper to get stored analytics
async function getStoredAnalytics(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      resolve([]);
      return;
    }
    
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const result = event.target.result;
      resolve(result);
    };
    
    request.onerror = (event) => {
      reject(new Error(`Failed to get ${storeName} data`));
    };
  });
}