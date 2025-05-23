/**
 * ML Models Offline Database
 * 
 * This module provides functions for storing and retrieving ML model data
 * in IndexedDB for offline access.
 */

const DB_NAME = 'ml-models-db';
const DB_VERSION = 1;
const MODELS_STORE = 'models';
const PREDICTIONS_STORE = 'predictions';
const SYNC_QUEUE_STORE = 'syncQueue';

// Open the database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(MODELS_STORE)) {
        const modelsStore = db.createObjectStore(MODELS_STORE, { keyPath: 'id' });
        modelsStore.createIndex('type', 'type', { unique: false });
        modelsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(PREDICTIONS_STORE)) {
        const predictionsStore = db.createObjectStore(PREDICTIONS_STORE, { keyPath: 'id', autoIncrement: true });
        predictionsStore.createIndex('modelId', 'modelId', { unique: false });
        predictionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        syncQueueStore.createIndex('type', 'type', { unique: false });
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Cache a model for offline use
async function cacheModel(model) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MODELS_STORE], 'readwrite');
    const store = transaction.objectStore(MODELS_STORE);
    
    // Add cachedAt timestamp
    const modelToCache = {
      ...model,
      cachedAt: new Date().toISOString()
    };
    
    // Add or update the model
    const request = store.put(modelToCache);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(modelToCache);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error caching model:', error);
    throw error;
  }
}

// Get all cached models
async function getCachedModels() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MODELS_STORE], 'readonly');
    const store = transaction.objectStore(MODELS_STORE);
    
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error getting cached models:', error);
    throw error;
  }
}

// Get a specific cached model by ID
async function getCachedModel(modelId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MODELS_STORE], 'readonly');
    const store = transaction.objectStore(MODELS_STORE);
    
    const request = store.get(modelId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Error getting cached model ${modelId}:`, error);
    throw error;
  }
}

// Cache a prediction result
async function cachePrediction(modelId, features, result) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([PREDICTIONS_STORE], 'readwrite');
    const store = transaction.objectStore(PREDICTIONS_STORE);
    
    const prediction = {
      modelId,
      features,
      result,
      timestamp: new Date().toISOString()
    };
    
    const request = store.add(prediction);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(prediction);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error caching prediction:', error);
    throw error;
  }
}

// Get cached predictions for a model
async function getCachedPredictions(modelId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([PREDICTIONS_STORE], 'readonly');
    const store = transaction.objectStore(PREDICTIONS_STORE);
    const index = store.index('modelId');
    
    const request = index.getAll(modelId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Error getting cached predictions for model ${modelId}:`, error);
    throw error;
  }
}

// Add an item to the sync queue
async function addToSyncQueue(item) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    const queueItem = {
      ...item,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    const request = store.add(queueItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(queueItem);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
}

// Get all items in the sync queue
async function getSyncQueue() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Error getting sync queue:', error);
    throw error;
  }
}

// Mark an item in the sync queue as synced
async function markAsSynced(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    // Get the item first
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error(`Item with ID ${id} not found in sync queue`));
          return;
        }
        
        // Update the item
        item.synced = true;
        item.syncedAt = new Date().toISOString();
        
        const updateRequest = store.put(item);
        
        updateRequest.onsuccess = () => resolve(item);
        updateRequest.onerror = (event) => reject(event.target.error);
      };
      
      getRequest.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Error marking item ${id} as synced:`, error);
    throw error;
  }
}

// Export the functions
window.mlModelsOfflineDB = {
  cacheModel,
  getCachedModels,
  getCachedModel,
  cachePrediction,
  getCachedPredictions,
  addToSyncQueue,
  getSyncQueue,
  markAsSynced
};
