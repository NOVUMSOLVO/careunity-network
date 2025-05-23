module.exports = {
  globDirectory: 'client/public/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,webp,avif,ico,json}'
  ],
  swDest: 'client/public/workbox-service-worker.js',
  swSrc: 'client/public/workbox-service-worker.js',
  // Don't include workbox libraries in the bundle as we're importing them from CDN
  importWorkboxFrom: 'cdn',
  // Increase the limit for inlining assets
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  // Define runtime caching rules
  runtimeCaching: [
    {
      // Cache API calls
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'careunity-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'careunity-image-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      // ML model API requests with stale-while-revalidate
      urlPattern: /\/api\/v2\/ml-models/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'careunity-ml-models-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      // Cache font files
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'careunity-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      // Cache CSS and JS
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'careunity-assets-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    }
  ]
};
