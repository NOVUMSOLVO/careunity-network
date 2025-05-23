/**
 * Lazy Loading Hooks
 * 
 * This file provides React hooks for lazy loading data and components
 * to improve performance in the CareUnity application.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for lazy loading data when an element comes into view
 */
export function useLazyLoad<T>(
  fetchFn: () => Promise<T>,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const elementRef = useRef<HTMLElement | null>(null);

  // Function to load data
  const loadData = useCallback(async () => {
    if (!enabled || loading || data) return;
    
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled, loading, data, onSuccess, onError]);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setInView(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          loadData();
        }
      },
      { threshold, rootMargin }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [enabled, loadData, threshold, rootMargin]);

  // Function to manually trigger loading
  const refetch = useCallback(() => {
    setData(null);
    loadData();
  }, [loadData]);

  return { data, loading, error, elementRef, inView, refetch };
}

/**
 * Hook for lazy loading paginated data
 */
export function useLazyLoadPagination<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; totalCount: number }>,
  options: {
    pageSize?: number;
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
    onSuccess?: (data: T[], totalCount: number) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    pageSize = 20,
    threshold = 0.1,
    rootMargin = '0px',
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const loaderRef = useRef<HTMLElement | null>(null);

  // Function to load more data
  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await fetchFn(page, pageSize);
      
      setData(prevData => [...prevData, ...result.data]);
      setTotalCount(result.totalCount);
      setHasMore(page * pageSize < result.totalCount);
      setError(null);
      
      if (onSuccess) onSuccess(result.data, result.totalCount);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, enabled, loading, hasMore, onSuccess, onError]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!enabled) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold, rootMargin }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [enabled, hasMore, loading, threshold, rootMargin]);

  // Load data when page changes
  useEffect(() => {
    loadMore();
  }, [page, loadMore]);

  // Function to manually reset and reload
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loaderRef,
    totalCount,
    loadMore,
    reset
  };
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(
  src: string,
  options: {
    placeholder?: string;
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const {
    placeholder = '',
    threshold = 0.1,
    rootMargin = '0px'
  } = options;

  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Start loading the image
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setCurrentSrc(src);
            setLoaded(true);
          };
          
          // Unobserve once we start loading
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [src, threshold, rootMargin]);

  return { currentSrc, loaded, imgRef };
}

export default {
  useLazyLoad,
  useLazyLoadPagination,
  useLazyImage
};
