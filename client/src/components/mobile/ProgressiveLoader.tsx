import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '../ui/loader';
import { useInView } from 'react-intersection-observer';
import { useDevice } from '../../hooks/use-mobile';

interface ProgressiveLoaderProps<T> {
  /**
   * Function to load data
   * @param page Page number to load
   * @param pageSize Number of items per page
   * @returns Promise that resolves to an array of items and total count
   */
  loadData: (page: number, pageSize: number) => Promise<{ items: T[], total: number }>;

  /**
   * Function to render an item
   * @param item Item to render
   * @param index Index of the item
   * @returns React element
   */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Number of items to load per page
   * @default 20
   */
  pageSize?: number;

  /**
   * Initial items to display
   * @default []
   */
  initialItems?: T[];

  /**
   * Total number of items (if known)
   * @default undefined
   */
  totalItems?: number;

  /**
   * Whether to show a loading indicator
   * @default true
   */
  showLoading?: boolean;

  /**
   * Text to display when there are no items
   * @default "No items found"
   */
  emptyText?: string;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether to optimize for mobile devices
   * @default true
   */
  mobileOptimized?: boolean;
}

/**
 * Progressive Loader Component
 *
 * This component implements progressive loading (load more as you scroll)
 * with optimizations for mobile devices.
 */
export function ProgressiveLoader<T>({
  loadData,
  renderItem,
  pageSize = 20,
  initialItems = [],
  totalItems,
  showLoading = true,
  emptyText = "No items found",
  className = "",
  mobileOptimized = true,
}: ProgressiveLoaderProps<T>) {
  // State
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(totalItems || 0);

  // Device info
  const { isMobile } = useDevice();

  // Adjust page size based on device type if mobile optimized
  const effectivePageSize = mobileOptimized && isMobile ? Math.max(10, Math.floor(pageSize / 2)) : pageSize;

  // Intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load initial data
  useEffect(() => {
    if (initialItems.length === 0) {
      loadMoreItems();
    } else {
      // If we have initial items, check if we need to set hasMore
      setHasMore(initialItems.length < (totalItems || Infinity));
    }
  }, []);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreItems();
    }
  }, [inView, hasMore, loading]);

  // Load more items
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const result = await loadData(page, effectivePageSize);

      // Update state
      setItems(prevItems => [...prevItems, ...result.items]);
      setPage(prevPage => prevPage + 1);
      setTotal(result.total);

      // Check if we have more items to load
      setHasMore(items.length + result.items.length < result.total);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="progressive-item">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {loading && showLoading && (
          <Loader size="sm" />
        )}

        {!loading && hasMore && (
          <button
            onClick={loadMoreItems}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Load more
          </button>
        )}

        {!hasMore && items.length > 0 && (
          <p className="text-sm text-gray-500">
            {`Showing ${items.length} of ${total} items`}
          </p>
        )}
      </div>
    </div>
  );
}
