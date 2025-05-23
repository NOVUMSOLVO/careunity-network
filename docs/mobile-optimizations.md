# Mobile Optimizations Guide

This document provides an overview of the mobile optimizations implemented in the CareUnity application, including progressive loading, touch interactions, offline capabilities, and WebSocket optimizations.

## Overview

The CareUnity application is designed to work seamlessly across desktop and mobile devices. To provide the best possible experience on mobile devices, we've implemented several optimizations:

1. **Progressive Loading**: Load data incrementally as the user scrolls to reduce initial load time and improve perceived performance.
2. **Touch Interactions**: Support for mobile-specific gestures such as swipe, pinch-to-zoom, and long press.
3. **Offline Capabilities**: Store data locally and sync when online to allow the app to function without an internet connection.
4. **WebSocket Optimizations**: Adjust WebSocket behavior based on device type, battery level, and app state to conserve battery life.
5. **Responsive Design**: Adapt the UI to different screen sizes and device capabilities.

## Progressive Loading

The `ProgressiveLoader` component (`client/src/components/mobile/ProgressiveLoader.tsx`) implements progressive loading for data-heavy pages. It loads data incrementally as the user scrolls, reducing initial load time and improving perceived performance.

### Usage

```tsx
import { ProgressiveLoader } from '../components/mobile/ProgressiveLoader';

function MyComponent() {
  const loadData = async (page, pageSize) => {
    // Load data from API
    const response = await api.get(`/items?page=${page}&limit=${pageSize}`);
    return {
      items: response.data.items,
      total: response.data.total,
    };
  };
  
  const renderItem = (item, index) => (
    <div key={index}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
  
  return (
    <ProgressiveLoader
      loadData={loadData}
      renderItem={renderItem}
      pageSize={20}
      mobileOptimized={true}
    />
  );
}
```

### Configuration

The progressive loading behavior can be configured in `client/src/config/mobile-config.ts`:

```typescript
export const progressiveLoadingConfig = {
  defaultPageSizes: {
    mobile: 10,
    tablet: 15,
    desktop: 20,
  },
  loadMoreThreshold: 0.2,
  showLoadingIndicators: true,
  cacheItems: true,
  maxCachedItems: 200,
};
```

## Touch Interactions

The `TouchInteraction` component (`client/src/components/mobile/TouchInteractions.tsx`) adds support for mobile-specific gestures such as swipe, pinch-to-zoom, and long press.

### Usage

```tsx
import { TouchInteraction } from '../components/mobile/TouchInteractions';

function MyComponent() {
  const handleSwipe = (direction, distance) => {
    if (direction === 'left') {
      // Handle swipe left
    } else if (direction === 'right') {
      // Handle swipe right
    }
  };
  
  const handleTap = (event) => {
    // Handle tap
  };
  
  const handleLongPress = (event) => {
    // Handle long press
  };
  
  return (
    <TouchInteraction
      onSwipe={handleSwipe}
      onTap={handleTap}
      onLongPress={handleLongPress}
    >
      <div>Swipe me!</div>
    </TouchInteraction>
  );
}
```

### Configuration

The touch interaction behavior can be configured in `client/src/config/mobile-config.ts`:

```typescript
export const touchInteractionConfig = {
  swipeThreshold: 50,
  longPressDuration: 500,
  preventDefault: true,
  stopPropagation: true,
};
```

## Offline Capabilities

The CareUnity application supports offline operation through a combination of:

1. **Service Workers**: Cache static assets and API responses for offline use.
2. **IndexedDB**: Store application data locally for offline access.
3. **Sync Service**: Synchronize local changes with the server when online.

### Service Worker

The service worker is registered in `client/src/utils/service-worker-registration.ts` and handles caching of static assets and API responses.

### Offline Storage

The offline storage service (`client/src/services/offline-storage-service.ts`) provides a wrapper around IndexedDB for storing and retrieving data locally.

### Sync Service

The sync service (`client/src/services/sync-service.ts`) handles synchronization of local changes with the server when the device comes back online.

### Configuration

The offline capabilities can be configured in `client/src/config/mobile-config.ts`:

```typescript
export const offlineStorageConfig = {
  enabled: true,
  dbName: 'careunity-offline',
  dbVersion: 1,
  stores: [
    'serviceUsers',
    'carePlans',
    'visits',
    'tasks',
    'documents',
    'pendingRequests',
    'syncState',
  ],
  defaultExpiryTime: 24 * 60 * 60 * 1000, // 24 hours
  syncInterval: 60 * 1000, // 1 minute
  autoSync: true,
};
```

## WebSocket Optimizations

The WebSocket service (`client/src/services/websocket-service.ts`) includes optimizations for mobile devices to conserve battery life:

1. **Adaptive Heartbeat**: Adjust heartbeat interval based on device type, battery level, and app state.
2. **Background Mode**: Reduce connection frequency when the app is in the background.
3. **Low Battery Mode**: Further reduce connection frequency when the device battery is low.
4. **Message Queuing**: Queue messages when offline and send them when the connection is restored.

### Configuration

The WebSocket optimizations can be configured in `client/src/config/mobile-config.ts`:

```typescript
export const webSocketConfig = {
  mobileOptimization: true,
  heartbeatInterval: 30000,
  mobileHeartbeatMultiplier: 1.5,
  backgroundedHeartbeatMultiplier: 3,
  lowBatteryHeartbeatMultiplier: 2,
  lowBatteryThreshold: 0.2,
  queueOfflineMessages: true,
  maxQueueSize: 100,
};
```

## Testing Mobile Optimizations

To test the mobile optimizations, you can use the following approaches:

1. **Device Emulation**: Use browser developer tools to emulate different devices and screen sizes.
2. **Network Throttling**: Use browser developer tools to simulate slow network connections.
3. **Offline Mode**: Use browser developer tools to simulate offline mode.
4. **Real Devices**: Test on actual mobile devices to verify the optimizations work as expected.

### Automated Tests

The mobile optimizations are covered by automated tests:

- **Unit Tests**: Test individual components and functions.
- **Integration Tests**: Test interactions between components.
- **End-to-End Tests**: Test complete user flows on different device types.

To run the mobile optimization tests:

```bash
npm run test:mobile-optimizations
```

## Best Practices

When developing mobile-optimized features, follow these best practices:

1. **Use Progressive Loading**: For data-heavy pages, use the `ProgressiveLoader` component to load data incrementally.
2. **Add Touch Interactions**: For interactive elements, use the `TouchInteraction` component to add support for mobile gestures.
3. **Support Offline Mode**: Design features to work offline by storing data locally and syncing when online.
4. **Optimize Images**: Use responsive images and lazy loading to reduce data usage and improve performance.
5. **Test on Real Devices**: Always test on actual mobile devices to ensure the optimizations work as expected.
6. **Monitor Performance**: Use performance monitoring tools to identify and address performance issues on mobile devices.

## Further Reading

- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Offline First](https://offlinefirst.org/)
- [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
