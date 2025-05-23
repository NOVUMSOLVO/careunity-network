// CareUnity Mobile Service Worker - Optimized Version

const CACHE_NAME = 'careunity-mobile-cache-v4'; // Updated cache version
const STATIC_CACHE_NAME = 'careunity-static-cache-v4';
const DYNAMIC_CACHE_NAME = 'careunity-dynamic-cache-v4';
const API_CACHE_NAME = 'careunity-api-cache-v4';
const IMAGE_CACHE_NAME = 'careunity-image-cache-v1'; // New cache for optimized images

// Import the image handler
importScripts('/js/image-handler.js');

// Assets to preload and cache - Now using bundled JS files
const STATIC_ASSETS = [
  '/',
  '/careunity-mobile.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/favicon.ico',
  '/assets/main-bundle.js', // Main bundled JS
  '/assets/vendor-bundle.js', // Vendor bundle
  '/assets/voice-features-bundle.js', // Voice features bundle
  '/assets/care-plan-features-bundle.js', // Care plan features bundle
  '/assets/biometric-features-bundle.js', // Biometric features bundle
  '/assets/sync-features-bundle.js', // Sync features bundle
  '/js/careunity-mobile-main.js', // Entry point for dynamic loading
  '/offline.html'
];

// API endpoints that should be cached with network-first strategy
const API_ENDPOINTS = [
  '/api/users',
  '/api/visits',
  '/api/care-plans',
  '/api/care-plans/advanced',
  '/api/care-plans/templates',
  '/api/care-plans/suggestions',
  '/api/care-plans/monitoring',
  '/api/care-plans/collaboration',
  '/api/care-plans/history',
  '/api/staff',
  '/api/analytics',
  '/api/analytics/dashboard',
  '/api/analytics/metrics',
  '/api/analytics/predictions',
  '/api/analytics/export',
  '/api/reports',
  '/api/reports/templates',
  '/api/reports/scheduled',
  '/api/reports/custom',
  '/api/voice-commands',
  '/api/voice-commands/intents',
  '/api/voice-commands/nlp',
  '/api/voice-commands/context',
  '/api/voice-commands/accessibility',
  '/api/integrations',
  '/api/integrations/health',
  '/api/integrations/ehr',
  '/api/integrations/devices',
  '/api/integrations/payments',
  '/api/integrations/communications'
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
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Mobile Service Worker] Activate');
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old versions of our caches
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME &&
            cacheName.startsWith('careunity-')
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle requests with appropriate strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Check if this is an image request and try to serve modern format if supported
  if (isImageUrl(url.pathname)) {
    event.respondWith(handleImageRequest(event.request));
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
  
  if (!allowedHosts.includes(url.hostname) && !url.hostname.endsWith(self.location.hostname)) {
    return;
  }

  // Check if this is an API request
  const isApiRequest = API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
  
  if (isApiRequest) {
    // Use network-first strategy for API requests
    event.respondWith(networkFirstWithTimeout(event.request));
    return;
  }
  
  // For static assets, use cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  
  // For other requests, use cache-first with network fallback
  event.respondWith(cacheFirstWithNetworkFallback(event.request));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first fetch failed:', error);
    
    // Check if it's an HTML request for offline fallback
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error', { status: 408 });
  }
}

// Network-first with timeout strategy for API requests
async function networkFirstWithTimeout(request) {
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, 3000); // 3 second timeout
  });
  
  // Try network first
  try {
    const networkPromise = fetch(request).then(response => {
      // Cache the response if it's successful
      if (response.ok) {
        const clonedResponse = response.clone();
        caches.open(API_CACHE_NAME).then(cache => {
          cache.put(request, clonedResponse);
          
          // Set expiration for this cache entry
          const now = new Date().getTime();
          const expirationData = {
            cachedAt: now,
            expires: now + API_CACHE_MAX_AGE
          };
          localStorage.setItem(`api-cache-${request.url}`, JSON.stringify(expirationData));
        });
      }
      return response;
    });
    
    // Race network against timeout
    const response = await Promise.race([networkPromise, timeoutPromise]);
    if (response) {
      return response;
    }
  } catch (error) {
    console.log('[Service Worker] Network request failed:', error);
  }
  
  // If network fails or times out, try cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Check if the cached response is expired
    const expirationData = localStorage.getItem(`api-cache-${request.url}`);
    if (expirationData) {
      const { expires } = JSON.parse(expirationData);
      if (expires > new Date().getTime()) {
        // Not expired yet, return cached response
        return cachedResponse;
      } else {
        // Expired, remove from cache
        caches.open(API_CACHE_NAME).then(cache => cache.delete(request));
      }
    }
    return cachedResponse;
  }
  
  // If not in cache, return a custom offline response for API
  return new Response(JSON.stringify({
    error: 'offline',
    message: 'You are currently offline and this data is not cached.'
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503
  });
}

// Cache-first with network fallback strategy for other requests
async function cacheFirstWithNetworkFallback(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Check if it's an HTML request for offline fallback
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error', { status: 408 });
  }
}

// Listen for the 'message' event to handle commands from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action) {
    switch (event.data.action) {
      case 'skipWaiting':
        self.skipWaiting();
        break;
      case 'clearCache':
        clearCache();
        break;
      case 'clearApiCache':
        clearApiCache();
        break;
    }
  }
});

// Function to clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.filter(name => name.startsWith('careunity-')).map(name => caches.delete(name))
  );
  console.log('[Service Worker] All caches cleared');
}

// Function to clear only API cache
async function clearApiCache() {
  await caches.delete(API_CACHE_NAME);
  console.log('[Service Worker] API cache cleared');
}
