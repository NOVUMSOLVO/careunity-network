// Minimal service worker - pass-through only
console.log('Service worker loaded - minimal version');

// Skip waiting for the page to reload
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Simple pass-through fetch handler - no caching
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('chrome-extension:')) {
    // Skip chrome extension URLs that cause errors
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(error => {
        console.error('Fetch error in service worker:', error);
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});

// Activate immediately
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});