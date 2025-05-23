/**
 * Mobile Configuration
 * 
 * This file contains configuration settings for mobile optimizations.
 */

// Device breakpoints
export const deviceBreakpoints = {
  mobile: 640,  // Max width for mobile devices
  tablet: 1024, // Max width for tablet devices
};

// Progressive loading configuration
export const progressiveLoadingConfig = {
  // Default page sizes for different device types
  defaultPageSizes: {
    mobile: 10,
    tablet: 15,
    desktop: 20,
  },
  
  // Threshold for when to load more items (0-1, percentage of visibility)
  loadMoreThreshold: 0.2,
  
  // Whether to show loading indicators
  showLoadingIndicators: true,
  
  // Whether to cache loaded items
  cacheItems: true,
  
  // Maximum number of items to keep in memory
  maxCachedItems: 200,
};

// Touch interaction configuration
export const touchInteractionConfig = {
  // Minimum distance (in pixels) to trigger a swipe
  swipeThreshold: 50,
  
  // Duration (in milliseconds) to trigger a long press
  longPressDuration: 500,
  
  // Whether to prevent default behavior of touch events on mobile
  preventDefault: true,
  
  // Whether to stop propagation of touch events
  stopPropagation: true,
};

// WebSocket configuration for mobile
export const webSocketConfig = {
  // Whether to enable mobile optimizations for WebSockets
  mobileOptimization: true,
  
  // Base heartbeat interval in milliseconds
  heartbeatInterval: 30000,
  
  // Multiplier for heartbeat interval when on mobile
  mobileHeartbeatMultiplier: 1.5,
  
  // Multiplier for heartbeat interval when app is backgrounded
  backgroundedHeartbeatMultiplier: 3,
  
  // Multiplier for heartbeat interval when battery is low
  lowBatteryHeartbeatMultiplier: 2,
  
  // Battery level threshold for low battery mode (0-1)
  lowBatteryThreshold: 0.2,
  
  // Whether to queue messages when offline
  queueOfflineMessages: true,
  
  // Maximum number of messages to queue
  maxQueueSize: 100,
};

// Offline storage configuration
export const offlineStorageConfig = {
  // Whether to enable offline storage
  enabled: true,
  
  // Database name
  dbName: 'careunity-offline',
  
  // Database version
  dbVersion: 1,
  
  // Stores to create in the database
  stores: [
    'serviceUsers',
    'carePlans',
    'visits',
    'tasks',
    'documents',
    'pendingRequests',
    'syncState',
  ],
  
  // Default expiry time for cached data (in milliseconds)
  defaultExpiryTime: 24 * 60 * 60 * 1000, // 24 hours
  
  // Maximum size of the database (in bytes)
  maxDatabaseSize: 50 * 1024 * 1024, // 50 MB
  
  // Sync interval (in milliseconds)
  syncInterval: 60 * 1000, // 1 minute
  
  // Whether to sync automatically when online
  autoSync: true,
  
  // Maximum number of sync attempts
  maxSyncAttempts: 5,
  
  // Delay between sync attempts (in milliseconds)
  syncRetryDelay: 5000, // 5 seconds
};

// Image optimization configuration
export const imageOptimizationConfig = {
  // Whether to enable image optimization
  enabled: true,
  
  // Default quality for compressed images (0-100)
  defaultQuality: 80,
  
  // Maximum width for images on mobile devices
  mobileMaxWidth: 640,
  
  // Maximum width for images on tablet devices
  tabletMaxWidth: 1024,
  
  // Whether to use WebP format when supported
  useWebP: true,
  
  // Whether to lazy load images
  lazyLoad: true,
  
  // Threshold for lazy loading (0-1, percentage of visibility)
  lazyLoadThreshold: 0.1,
  
  // Placeholder image URL
  placeholderImage: '/images/placeholder.svg',
};

// Export all configurations
export const mobileConfig = {
  deviceBreakpoints,
  progressiveLoading: progressiveLoadingConfig,
  touchInteraction: touchInteractionConfig,
  webSocket: webSocketConfig,
  offlineStorage: offlineStorageConfig,
  imageOptimization: imageOptimizationConfig,
};
