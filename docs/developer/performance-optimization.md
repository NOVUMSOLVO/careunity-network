# Performance Optimization Guide

This guide provides information on the performance optimization tools and techniques used in the CareUnity application.

## Table of Contents

1. [Overview](#overview)
2. [Database Query Optimization](#database-query-optimization)
3. [Caching System](#caching-system)
4. [Lazy Loading](#lazy-loading)
5. [Performance Monitoring](#performance-monitoring)
6. [Best Practices](#best-practices)

## Overview

CareUnity includes several performance optimization features to ensure the application remains responsive and efficient even under heavy load. These optimizations include:

- Database query optimization and monitoring
- Caching for frequently accessed data
- Lazy loading for client-side resources
- Performance monitoring and alerting

## Database Query Optimization

### Query Optimizer Service

The Query Optimizer Service (`server/db/query-optimizer.ts`) provides tools for tracking and optimizing database queries.

#### Key Features

- **Query Metrics Tracking**: Records execution time and rows returned for each query
- **Slow Query Identification**: Identifies queries that exceed performance thresholds
- **Index Recommendations**: Analyzes query patterns and recommends indexes
- **Query Transformation**: Optimizes queries by adding hints or transforming them

#### Usage

```typescript
import queryOptimizer from '../db/query-optimizer';

// Wrap a database query with metrics tracking
const results = await queryOptimizer.withQueryMetrics('users:list', async () => {
  return await db.select().from(users).where(eq(users.isActive, true));
});

// Get slow queries for analysis
const slowQueries = queryOptimizer.getSlowQueries(500); // Threshold in ms

// Get index recommendations
const recommendations = await queryOptimizer.analyzeAndRecommendIndexes();
```

### Best Practices

1. **Use the Query Metrics Middleware**: Wrap all database queries with the `withQueryMetrics` function to track performance.
2. **Review Slow Queries Regularly**: Check the Performance Dashboard for slow queries and optimize them.
3. **Consider Index Recommendations**: Evaluate and implement index recommendations, but test them in staging first.
4. **Limit Result Sets**: Always limit the number of rows returned from queries, especially for large tables.

## Caching System

### Cache Service

The Cache Service (`server/services/cache-service.ts`) provides in-memory caching with TTL (Time To Live) for frequently accessed data.

#### Key Features

- **In-Memory Caching**: Fast access to cached data
- **TTL Support**: Automatically expires cached data after a specified time
- **Cache Statistics**: Tracks hits, misses, and other metrics
- **Cache Invalidation**: Methods for clearing specific keys or the entire cache

#### Usage

```typescript
import cacheService from '../services/cache-service';

// Get data from cache or compute it
const getData = async (id) => {
  const cacheKey = `data:${id}`;
  
  // Try to get from cache
  const cachedData = cacheService.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Compute data
  const data = await computeExpensiveData(id);
  
  // Cache for 5 minutes (300 seconds)
  cacheService.set(cacheKey, data, 300);
  
  return data;
};

// Cache decorator for async functions
const getDataCached = cacheService.cached(
  'data',
  async (id) => await computeExpensiveData(id),
  300 // TTL in seconds
);

// Clear specific cache keys
cacheService.del('data:123');

// Clear all cache keys with a specific prefix
cacheService.del(cacheService.getKeys().filter(key => key.startsWith('data:')));

// Flush the entire cache
cacheService.flush();
```

### Best Practices

1. **Cache Appropriate Data**: Cache data that is expensive to compute and doesn't change frequently.
2. **Set Appropriate TTL**: Choose TTL values based on how frequently the data changes.
3. **Invalidate Cache When Data Changes**: Clear relevant cache entries when the underlying data is modified.
4. **Monitor Cache Performance**: Check the hit ratio and adjust caching strategy accordingly.

## Lazy Loading

### Lazy Loading Hooks

The Lazy Loading Hooks (`client/src/hooks/use-lazy-loading.ts`) provide React hooks for lazy loading data and components.

#### Key Features

- **Intersection Observer**: Uses the Intersection Observer API to detect when elements enter the viewport
- **Lazy Data Loading**: Loads data only when needed
- **Pagination Support**: Handles infinite scrolling with pagination
- **Image Lazy Loading**: Loads images only when they enter the viewport

#### Usage

```tsx
import { useLazyLoad, useLazyLoadPagination, useLazyImage } from '@/hooks/use-lazy-loading';

// Lazy load data when an element comes into view
const MyComponent = () => {
  const { data, loading, error, elementRef } = useLazyLoad(
    () => fetchData(),
    { threshold: 0.1 }
  );
  
  return (
    <div ref={elementRef}>
      {loading ? <Spinner /> : data && <DataDisplay data={data} />}
    </div>
  );
};

// Lazy load paginated data for infinite scrolling
const InfiniteList = () => {
  const { data, loading, hasMore, loaderRef } = useLazyLoadPagination(
    (page, pageSize) => fetchPaginatedData(page, pageSize),
    { pageSize: 20 }
  );
  
  return (
    <div>
      {data.map(item => <ListItem key={item.id} item={item} />)}
      {hasMore && <div ref={loaderRef}>{loading ? <Spinner /> : null}</div>}
    </div>
  );
};

// Lazy load images
const LazyImage = ({ src, alt }) => {
  const { currentSrc, loaded, imgRef } = useLazyImage(
    src,
    { placeholder: '/placeholder.jpg' }
  );
  
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={loaded ? 'loaded' : 'loading'}
    />
  );
};
```

### Best Practices

1. **Use for Long Lists**: Apply lazy loading for long lists of items to improve initial load time.
2. **Set Appropriate Thresholds**: Adjust the threshold value to start loading before the element is fully visible.
3. **Provide Placeholders**: Always provide placeholders for content that will be lazy loaded.
4. **Consider Network Conditions**: Be mindful of users on slow connections and provide appropriate loading indicators.

## Performance Monitoring

### Performance Dashboard

The Performance Dashboard (`client/src/pages/admin/performance-dashboard.tsx`) provides insights into application performance metrics.

#### Key Features

- **API Performance**: Tracks API response times and request volume
- **Database Performance**: Monitors query execution times and provides optimization recommendations
- **Cache Performance**: Shows cache hit rates and distribution
- **System Resources**: Monitors CPU and memory usage

#### Access

The Performance Dashboard is available at `/admin/performance-dashboard` for users with admin privileges.

### Performance API Routes

The Performance API Routes (`server/routes/performance-routes.ts`) provide endpoints for accessing performance metrics.

#### Key Endpoints

- `GET /api/v2/performance/queries`: Get query performance metrics
- `GET /api/v2/performance/slow-queries`: Get slow queries
- `GET /api/v2/performance/index-recommendations`: Get index recommendations
- `GET /api/v2/performance/cache-stats`: Get cache statistics
- `POST /api/v2/performance/clear-cache`: Clear the cache
- `GET /api/v2/performance/api`: Get API performance metrics
- `GET /api/v2/performance/system`: Get system metrics

### Best Practices

1. **Regular Monitoring**: Check the Performance Dashboard regularly to identify performance issues.
2. **Set Performance Budgets**: Define acceptable thresholds for key metrics like response time.
3. **Investigate Anomalies**: Investigate any sudden changes in performance metrics.
4. **Optimize Based on Data**: Use the performance data to guide optimization efforts.

## Best Practices

### General Performance Best Practices

1. **Measure First**: Always measure performance before and after optimizations to ensure they're effective.
2. **Focus on User Experience**: Prioritize optimizations that improve the user experience.
3. **Progressive Enhancement**: Ensure the application works without optimizations and enhance progressively.
4. **Test on Real Devices**: Test performance on devices similar to what your users will use.
5. **Consider All Users**: Be mindful of users on slow connections or less powerful devices.

### Database Best Practices

1. **Index Wisely**: Add indexes for frequently queried columns, but be aware that too many indexes can slow down writes.
2. **Limit Result Sets**: Always limit the number of rows returned from queries.
3. **Use Efficient Joins**: Minimize the number of joins and ensure joined tables are properly indexed.
4. **Batch Operations**: Batch multiple operations together when possible.

### Caching Best Practices

1. **Cache Invalidation Strategy**: Have a clear strategy for when and how to invalidate cache entries.
2. **Cache Hierarchy**: Consider using multiple levels of caching (memory, distributed, browser).
3. **Cache Warm-Up**: Pre-populate cache with frequently accessed data during application startup.
4. **Monitor Cache Size**: Ensure the cache doesn't grow too large and consume too much memory.

### Frontend Best Practices

1. **Code Splitting**: Split your JavaScript bundles to load only what's needed.
2. **Tree Shaking**: Use tree shaking to eliminate dead code.
3. **Image Optimization**: Optimize images and use appropriate formats.
4. **Critical CSS**: Inline critical CSS to improve perceived load time.
5. **Debounce and Throttle**: Use debounce and throttle for expensive operations triggered by user input.
