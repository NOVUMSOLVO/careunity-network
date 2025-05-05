// Service Worker for CareUnity
const CACHE_NAME = 'careunity-cache-v1';
const RUNTIME_CACHE = 'careunity-runtime-v1';

// Assets to cache immediately when the service worker is installed
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx'
];

// Installation event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for static assets, network-first for API calls
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

  // For API requests, use network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            // Clone the response because it can only be consumed once
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For non-API requests, use cache-first strategy
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
        // If both cache and network fail, return a custom offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Network error happened', {
          status: 408,
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
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Sync stored messages when online
async function syncMessages() {
  try {
    // This would retrieve stored messages from IndexedDB
    // and send them to the server
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'MESSAGES_SYNCED',
          timestamp: new Date().toISOString()
        });
      });
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Sync stored form submissions when online
async function syncForms() {
  try {
    // This would retrieve stored form data from IndexedDB
    // and send them to the server
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FORMS_SYNCED',
          timestamp: new Date().toISOString()
        });
      });
    });
    return true;
  } catch (error) {
    return false;
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