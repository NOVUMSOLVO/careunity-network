import { useState, useEffect } from 'react';

/**
 * Custom hook to track online/offline status
 * @returns {boolean} isOffline - Whether the app is currently offline
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Set up online/offline listeners directly
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // Listen for both window events and custom events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('app:online', handleOnline);
    document.addEventListener('app:offline', handleOffline);
    
    // Check initial status
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('app:online', handleOnline);
      document.removeEventListener('app:offline', handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * Custom hook to create a synchronized queue for offline operations
 * @param {string} queueName - Name to identify this queue
 * @param {Function} processFn - Function to process items in the queue when back online
 * @returns {Object} Queue operations
 */
export function useOfflineQueue<T>(
  queueName: string,
  processFn: (items: T[]) => Promise<void>
) {
  const [queue, setQueue] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isOffline = useOffline();

  // Initialize queue from local storage
  useEffect(() => {
    const storedQueue = localStorage.getItem(`offline_queue_${queueName}`);
    if (storedQueue) {
      try {
        const parsedQueue = JSON.parse(storedQueue);
        setQueue(parsedQueue);
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, [queueName]);

  // Save queue to local storage when it changes
  useEffect(() => {
    localStorage.setItem(`offline_queue_${queueName}`, JSON.stringify(queue));
  }, [queue, queueName]);

  // Process queue when coming back online
  useEffect(() => {
    if (!isOffline && queue.length > 0 && !isProcessing) {
      const processQueue = async () => {
        setIsProcessing(true);
        try {
          await processFn(queue);
          // On successful processing, clear the queue
          setQueue([]);
        } catch (e) {
          console.error('Failed to process offline queue:', e);
        } finally {
          setIsProcessing(false);
        }
      };

      processQueue();
    }
  }, [isOffline, queue, processFn, isProcessing]);

  // Add an item to the queue
  const addToQueue = (item: T) => {
    setQueue(prevQueue => [...prevQueue, item]);
  };

  // Clear the queue
  const clearQueue = () => {
    setQueue([]);
  };

  return {
    isOffline,
    isProcessing,
    queueLength: queue.length,
    addToQueue,
    clearQueue,
    queue
  };
}