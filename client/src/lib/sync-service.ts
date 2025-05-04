import { v4 as uuid } from 'uuid';
import { apiClient } from './api-client';

// Define types for sync operations
interface SyncOperation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'error';
  errorMessage?: string;
}

const SYNC_QUEUE_KEY = 'careunity_sync_queue';
const MAX_RETRIES = 5;

/**
 * Service for handling offline data synchronization
 */
export const syncService = {
  /**
   * Initialize the sync service
   */
  initialize() {
    // Set up online/offline event listeners
    window.addEventListener('online', this.processQueue.bind(this));
    
    // Attempt to process the queue on startup
    if (navigator.onLine) {
      this.processQueue();
    }
    
    // Set up periodic sync
    setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, 60000); // Check every minute
    
    console.log('[SyncService] Initialized');
  },
  
  /**
   * Queue an operation for synchronization
   */
  queueOperation(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any
  ): string {
    const operations = this.getQueue();
    
    const operationId = uuid();
    const operation: SyncOperation = {
      id: operationId,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };
    
    operations.push(operation);
    this.saveQueue(operations);
    
    // Try to process the queue immediately if we're online
    if (navigator.onLine) {
      this.processQueue();
    }
    
    return operationId;
  },
  
  /**
   * Process the queue of pending operations
   */
  async processQueue() {
    // If we're offline, don't try to process the queue
    if (!navigator.onLine) {
      return;
    }
    
    const operations = this.getQueue();
    if (operations.length === 0) {
      return;
    }
    
    console.log(`[SyncService] Processing queue with ${operations.length} operations`);
    
    // Process operations in order (oldest first)
    const sortedOperations = [...operations].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of sortedOperations) {
      // Skip operations that are already being processed
      if (operation.status === 'processing') {
        continue;
      }
      
      // Update status to processing
      this.updateOperationStatus(operation.id, 'processing');
      
      try {
        let response;
        
        switch (operation.method) {
          case 'POST':
            response = await apiClient.post(operation.endpoint, operation.data);
            break;
          case 'PUT':
            response = await apiClient.put(operation.endpoint, operation.data);
            break;
          case 'PATCH':
            response = await apiClient.patch(operation.endpoint, operation.data);
            break;
          case 'DELETE':
            response = await apiClient.delete(operation.endpoint);
            break;
        }
        
        if (response.error) {
          throw response.error;
        }
        
        // If successful, remove from queue
        this.removeOperation(operation.id);
        console.log(`[SyncService] Successfully processed operation ${operation.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Increment retry count
        const retries = operation.retries + 1;
        
        if (retries >= MAX_RETRIES) {
          // If we've reached the maximum number of retries, mark as error
          this.updateOperation(operation.id, {
            status: 'error',
            retries,
            errorMessage
          });
          
          console.error(`[SyncService] Operation ${operation.id} failed after ${MAX_RETRIES} retries:`, errorMessage);
        } else {
          // Otherwise, mark as pending and increment retry count
          this.updateOperation(operation.id, {
            status: 'pending',
            retries,
            errorMessage
          });
          
          console.warn(`[SyncService] Operation ${operation.id} failed (retry ${retries}/${MAX_RETRIES}):`, errorMessage);
        }
      }
    }
  },
  
  /**
   * Get the status of an operation
   */
  getOperationStatus(id: string): SyncOperation | undefined {
    const operations = this.getQueue();
    return operations.find(op => op.id === id);
  },
  
  /**
   * Get the queue of operations
   */
  getQueue(): SyncOperation[] {
    try {
      const queueData = localStorage.getItem(SYNC_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('[SyncService] Error retrieving queue:', error);
      return [];
    }
  },
  
  /**
   * Save the queue of operations
   */
  saveQueue(operations: SyncOperation[]) {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(operations));
    } catch (error) {
      console.error('[SyncService] Error saving queue:', error);
    }
  },
  
  /**
   * Update the status of an operation
   */
  updateOperationStatus(id: string, status: SyncOperation['status']) {
    this.updateOperation(id, { status });
  },
  
  /**
   * Update an operation
   */
  updateOperation(id: string, updates: Partial<SyncOperation>) {
    const operations = this.getQueue();
    const index = operations.findIndex(op => op.id === id);
    
    if (index !== -1) {
      operations[index] = { ...operations[index], ...updates };
      this.saveQueue(operations);
    }
  },
  
  /**
   * Remove an operation from the queue
   */
  removeOperation(id: string) {
    const operations = this.getQueue();
    const updatedOperations = operations.filter(op => op.id !== id);
    this.saveQueue(updatedOperations);
  },
  
  /**
   * Clear all operations from the queue
   */
  clearQueue() {
    this.saveQueue([]);
  },
  
  /**
   * Get the number of pending operations
   */
  getPendingCount(): number {
    const operations = this.getQueue();
    return operations.filter(op => op.status === 'pending' || op.status === 'processing').length;
  },
  
  /**
   * Get the number of failed operations
   */
  getFailedCount(): number {
    const operations = this.getQueue();
    return operations.filter(op => op.status === 'error').length;
  }
};