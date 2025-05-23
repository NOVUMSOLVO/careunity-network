// Service Worker for CareUnity
const CACHE_NAME = 'careunity-cache-v3';
const RUNTIME_CACHE = 'careunity-runtime-v3';
const API_CACHE = 'careunity-api-v3';
const IMAGE_CACHE = 'careunity-images-v3';
const OPTIMIZED_IMAGE_CACHE = 'careunity-optimized-images-v1';
const ML_MODELS_CACHE = 'careunity-ml-models-v1';
const ML_MODELS_API_CACHE = 'careunity-ml-models-api-v1';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// Assets to cache immediately when the service worker is installed
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Installation event
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(PRECACHE_ASSETS);
        }),

      // Prefetch ML models data if possible
      fetch('/api/v2/ml-models')
        .then(response => {
          if (response.ok) {
            return caches.open(ML_MODELS_CACHE)
              .then(cache => cache.put('/api/v2/ml-models', response));
          }
        })
        .catch(error => {
          console.log('Failed to prefetch ML models data:', error);
          // Continue installation even if prefetch fails
        }),

      // Prefetch ML model families if possible
      fetch('/api/v2/ml-models/registry')
        .then(response => {
          if (response.ok) {
            return caches.open(ML_MODELS_CACHE)
              .then(cache => cache.put('/api/v2/ml-models/registry', response));
          }
        })
        .catch(error => {
          console.log('Failed to prefetch ML model families:', error);
          // Continue installation even if prefetch fails
        })
    ])
    .then(() => self.skipWaiting())
  );
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [
    CACHE_NAME,
    RUNTIME_CACHE,
    API_CACHE,
    IMAGE_CACHE,
    OPTIMIZED_IMAGE_CACHE,
    ML_MODELS_CACHE,
    ML_MODELS_API_CACHE
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        console.log(`Deleting old cache: ${cacheToDelete}`);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => {
      console.log('Service worker now controls all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - different strategies based on request type
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like CDN resources
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip browser extension requests
  if (event.request.url.includes('chrome-extension://')) {
    return;
  }

  // Skip WebSocket requests
  if (event.request.url.startsWith('ws://') || event.request.url.startsWith('wss://')) {
    return;
  }

  // Handle POST requests with background sync
  if (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'DELETE') {
    // If offline, queue the request for later
    if (!navigator.onLine) {
      event.respondWith(
        (async () => {
          try {
            // Store the request in IndexedDB for later sync
            const db = await openDB();
            const tx = db.transaction('sync-queue', 'readwrite');
            const store = tx.objectStore('sync-queue');

            // Clone the request to get its body
            const requestClone = event.request.clone();
            const body = await requestClone.text();

            // Create a unique ID for this operation
            const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

            // Store the operation
            await store.add({
              id,
              url: event.request.url,
              method: event.request.method,
              body,
              headers: Array.from(event.request.headers.entries()).reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
              }, {}),
              timestamp: Date.now(),
              status: 'pending',
              retries: 0
            });

            await tx.complete;

            // Register for background sync if available
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
              await self.registration.sync.register('syncData');
            }

            // Return a "success" response to the app
            return new Response(JSON.stringify({
              success: true,
              offline: true,
              message: 'Request queued for background sync',
              id
            }), {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            console.error('[ServiceWorker] Error queueing request:', error);

            // Return an error response
            return new Response(JSON.stringify({
              success: false,
              offline: true,
              message: 'Failed to queue request for background sync',
              error: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })()
      );
      return;
    }

    // If online, proceed with the request normally
    return;
  }

  // For ML Models API requests, use specialized caching strategy
  if (event.request.url.includes('/api/v2/ml-models')) {
    // For prediction requests, use stale-while-revalidate strategy
    if (event.request.url.includes('/predict')) {
      event.respondWith(
        caches.open(ML_MODELS_API_CACHE).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            // Clone the request because it can only be used once
            const fetchPromise = fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(() => {
              // If network fails and we have a cached response, return it
              if (cachedResponse) {
                return cachedResponse;
              }

              // Otherwise, return an offline response
              return new Response(JSON.stringify({
                success: false,
                offline: true,
                message: 'You are offline. Using cached prediction model.',
                usingOfflineModel: true
              }), {
                status: 200, // Return 200 so the app can handle it gracefully
                headers: { 'Content-Type': 'application/json' }
              });
            });

            // Return the cached response if we have one, otherwise wait for the network
            return cachedResponse || fetchPromise;
          });
        })
      );
      return;
    }

    // For other ML model requests, use network-first with longer cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(ML_MODELS_CACHE).then((cache) => {
            // Clone the response because it can only be consumed once
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If no cached response, return an offline API response
            return new Response(JSON.stringify({
              success: false,
              offline: true,
              message: 'You are offline. Using cached ML models data.',
              usingOfflineData: true
            }), {
              status: 200, // Return 200 so the app can handle it gracefully
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // For other API requests, use network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(API_CACHE).then((cache) => {
            // Clone the response because it can only be consumed once
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If no cached response, return an offline API response
            return new Response(JSON.stringify({
              success: false,
              offline: true,
              message: 'You are currently offline. Please try again when you have an internet connection.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // For optimized image API requests, use cache-first with long expiration
  if (event.request.url.includes('/api/v2/images/optimize')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Cache optimized images for longer periods
            return caches.open(OPTIMIZED_IMAGE_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            // If network fails and we can't find in cache, try to return a placeholder
            return caches.match('/images/placeholder.png')
              .then(placeholderResponse => placeholderResponse || new Response('Image not available offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              }));
          });
      })
    );
    return;
  }

  // For regular image requests, use cache-first strategy with network fallback
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Cache the image
            return caches.open(IMAGE_CACHE).then((cache) => {
              // Clone the response because it can only be consumed once
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            // Return a placeholder image if available
            return caches.match('/images/placeholder.png')
              .then(placeholderResponse => placeholderResponse || new Response('Image not available offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              }));
          });
      })
    );
    return;
  }

  // For HTML navigation requests, use network-first with offline fallback
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' &&
       event.request.headers.get('accept') &&
       event.request.headers.get('accept').includes('text/html'))) {

    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached version, serve the offline fallback page
              return caches.match(OFFLINE_FALLBACK_PAGE);
            });
        })
    );
    return;
  }

  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response because it can only be consumed once
        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // If both cache and network fail, return a generic offline response
        return new Response('Network error happened. You are offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
    })
  );
});

// Message event for communication with client
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

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncData') {
    event.waitUntil(syncData());
  }
});

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('careunityOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create sync-queue store if it doesn't exist
      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncQueueStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-status', 'status');
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create offline-data store if it doesn't exist
      if (!db.objectStoreNames.contains('offline-data')) {
        const offlineDataStore = db.createObjectStore('offline-data', { keyPath: 'id' });
        offlineDataStore.createIndex('by-store', 'storeName');
      }

      // Create cache store if it doesn't exist
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('by-expiry', 'expiry');
      }
    };
  });
}

// Sync data when online
async function syncData() {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      console.log('[ServiceWorker] Cannot sync while offline');
      return false;
    }

    // Open the database
    const db = await openDB();

    // Get all pending operations
    const tx = db.transaction('sync-queue', 'readwrite');
    const store = tx.objectStore('sync-queue');
    const index = store.index('by-status');
    const pendingOperations = await index.getAll('pending');

    if (pendingOperations.length === 0) {
      // No pending operations, notify clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            timestamp: new Date().toISOString(),
            success: 0,
            failed: 0,
            pending: 0
          });
        });
      });
      return true;
    }

    console.log(`[ServiceWorker] Syncing ${pendingOperations.length} operations`);

    // Group operations by resource URL to detect potential conflicts
    const operationsByResource = {};

    // Sort operations by timestamp (oldest first)
    const sortedOperations = pendingOperations.sort((a, b) => a.timestamp - b.timestamp);

    // Group operations by resource URL
    for (const operation of sortedOperations) {
      const resourceUrl = operation.url;
      if (!operationsByResource[resourceUrl]) {
        operationsByResource[resourceUrl] = [];
      }
      operationsByResource[resourceUrl].push(operation);
    }

    // Process operations by resource
    let successCount = 0;
    let failedCount = 0;

    for (const resourceUrl in operationsByResource) {
      const operations = operationsByResource[resourceUrl];

      // If there are multiple operations on the same resource, we need to handle potential conflicts
      if (operations.length > 1) {
        // For simplicity, we'll use a last-write-wins strategy
        // In a real app, you might want to implement more sophisticated conflict resolution
        console.log(`[ServiceWorker] Potential conflict detected for ${resourceUrl} with ${operations.length} operations`);

        // Sort by timestamp (newest first) for last-write-wins
        operations.sort((a, b) => b.timestamp - a.timestamp);

        // Process the newest operation first
        const newestOperation = operations[0];
        const result = await processOperation(newestOperation, store);

        if (result.success) {
          successCount++;

          // Mark older operations as superseded
          for (let i = 1; i < operations.length; i++) {
            operations[i].status = 'superseded';
            operations[i].supersededBy = newestOperation.id;
            await store.put(operations[i]);
          }
        } else {
          failedCount++;

          // If newest operation fails, try the next one
          let processed = false;
          for (let i = 1; i < operations.length && !processed; i++) {
            const result = await processOperation(operations[i], store);
            if (result.success) {
              successCount++;
              processed = true;

              // Mark other operations as superseded
              for (let j = 0; j < operations.length; j++) {
                if (j !== i) {
                  operations[j].status = 'superseded';
                  operations[j].supersededBy = operations[i].id;
                  await store.put(operations[j]);
                }
              }
            } else {
              failedCount++;
            }
          }
        }
      } else {
        // Single operation, no conflict
        const result = await processOperation(operations[0], store);
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      }
    }

    // Get remaining pending operations count
    const remainingPending = await index.count('pending');

    // Notify clients that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: new Date().toISOString(),
          success: successCount,
          failed: failedCount,
          pending: remainingPending
        });
      });
    });

    return true;
  } catch (error) {
    console.error('[ServiceWorker] Error syncing data:', error);
    return false;
  }
}

// Process a single operation
async function processOperation(operation, store) {
  try {
    // Update status to processing
    operation.status = 'processing';
    await store.put(operation);

    // Make the request
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: {
        'Content-Type': 'application/json',
        ...operation.headers,
      },
      body: operation.body,
    });

    if (response.ok) {
      // If successful, mark as completed
      operation.status = 'completed';
      operation.completedAt = Date.now();
      operation.responseStatus = response.status;

      try {
        // Try to parse and store the response data
        const responseData = await response.json();
        operation.responseData = responseData;
      } catch (e) {
        // If response is not JSON, store as text
        const responseText = await response.text();
        operation.responseText = responseText;
      }

      await store.put(operation);
      return { success: true, operation };
    } else {
      // If failed, mark as error
      operation.status = 'error';
      operation.errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
      operation.retries += 1;
      operation.lastRetry = Date.now();

      // If we've retried too many times, mark as failed
      if (operation.retries >= 5) {
        operation.status = 'failed';
        operation.failedAt = Date.now();
      }

      await store.put(operation);
      return { success: false, operation };
    }
  } catch (error) {
    // If network error, mark as error
    operation.status = 'error';
    operation.errorMessage = error.message || 'Network error';
    operation.retries += 1;
    operation.lastRetry = Date.now();

    // If we've retried too many times, mark as failed
    if (operation.retries >= 5) {
      operation.status = 'failed';
      operation.failedAt = Date.now();
    }

    await store.put(operation);
    return { success: false, operation };
  }
}

// Listen for push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/favicon.ico',
      badge: '/badge.png',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'CareUnity Notification', options)
    );
  } catch (error) {
    // If data is not JSON, use as string
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/badge.png'
    };

    event.waitUntil(
      self.registration.showNotification('CareUnity Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

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