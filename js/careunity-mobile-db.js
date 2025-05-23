// CareUnity Mobile - Offline Database (IndexedDB)

// Database configuration
const DB_CONFIG = {
  name: 'careunity-mobile-db',
  version: 1,
  stores: {
    visits: { keyPath: 'id', indexes: ['userId', 'date', 'status'] },
    users: { keyPath: 'id', indexes: ['name'] },
    staff: { keyPath: 'id', indexes: ['name'] },
    incidents: { keyPath: 'id', indexes: ['userId', 'date', 'type', 'status'] },
    pendingSync: { keyPath: 'id' }
  }
};

// Database instance
let db = null;

/**
 * Initialize the database
 * @returns {Promise} Promise resolving when database is ready
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Check for IndexedDB support
    if (!window.indexedDB) {
      console.error('IndexedDB is not supported in this browser');
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    // Open the database
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
    
    // Handle database upgrade or creation
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
          
          // Create indexes
          if (config.indexes) {
            config.indexes.forEach(indexName => {
              store.createIndex(indexName, indexName);
            });
          }
          
          console.log(`Created object store: ${storeName}`);
        }
      });
    };
    
    // Handle success
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database initialized successfully');
      resolve(db);
    };
    
    // Handle error
    request.onerror = (event) => {
      console.error('Database initialization error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get a transaction and object store
 * @param {string} storeName - Name of the object store
 * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
 * @returns {Object} Object containing the transaction and store
 */
function getStore(storeName, mode = 'readonly') {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  
  return { transaction, store };
}

/**
 * Add or update an item in the database
 * @param {string} storeName - Name of the object store
 * @param {Object} item - Item to store
 * @returns {Promise} Promise resolving to the added/updated item
 */
function saveItem(storeName, item) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore(storeName, 'readwrite');
      
      // Add timestamp for syncing
      const itemToSave = {
        ...item,
        updatedAt: new Date().toISOString(),
        needsSync: true
      };
      
      // Add/update the item
      const request = store.put(itemToSave);
      
      request.onsuccess = () => {
        // Add to pending sync queue
        addPendingSync({
          type: 'save',
          store: storeName,
          itemId: itemToSave.id,
          timestamp: itemToSave.updatedAt
        });
        
        resolve(itemToSave);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      // Complete the transaction
      transaction.oncomplete = () => {
        // Request background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-data');
          });
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get an item from the database by ID
 * @param {string} storeName - Name of the object store
 * @param {string|number} id - ID of the item to get
 * @returns {Promise} Promise resolving to the item or null
 */
function getItem(storeName, id) {
  return new Promise((resolve, reject) => {
    try {
      const { store } = getStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete an item from the database
 * @param {string} storeName - Name of the object store
 * @param {string|number} id - ID of the item to delete
 * @returns {Promise} Promise resolving when the item is deleted
 */
function deleteItem(storeName, id) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore(storeName, 'readwrite');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        // Add to pending sync queue
        addPendingSync({
          type: 'delete',
          store: storeName,
          itemId: id,
          timestamp: new Date().toISOString()
        });
        
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      // Complete the transaction
      transaction.oncomplete = () => {
        // Request background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-data');
          });
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all items from the database
 * @param {string} storeName - Name of the object store
 * @param {string} indexName - Optional index to query by
 * @param {*} indexValue - Optional value for the index query
 * @returns {Promise} Promise resolving to an array of items
 */
function getAllItems(storeName, indexName = null, indexValue = null) {
  return new Promise((resolve, reject) => {
    try {
      const { store } = getStore(storeName);
      let request;
      
      if (indexName && indexValue !== null) {
        const index = store.index(indexName);
        request = index.getAll(indexValue);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add an item to the pending sync queue
 * @param {Object} syncItem - Item to add to the sync queue
 * @returns {Promise} Promise resolving when the sync item is added
 */
function addPendingSync(syncItem) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore('pendingSync', 'readwrite');
      
      // Create a unique ID for the sync item
      const syncItemToSave = {
        ...syncItem,
        id: `${syncItem.store}_${syncItem.itemId}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        synced: false,
        retryCount: 0
      };
      
      const request = store.add(syncItemToSave);
      
      request.onsuccess = () => {
        resolve(syncItemToSave);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all pending sync items
 * @returns {Promise} Promise resolving to an array of pending sync items
 */
function getPendingSyncItems() {
  return getAllItems('pendingSync');
}

/**
 * Mark a sync item as synced
 * @param {string} id - ID of the sync item
 * @returns {Promise} Promise resolving when the sync item is updated
 */
function markSyncItemAsSynced(id) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore('pendingSync', 'readwrite');
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        const syncItem = request.result;
        if (syncItem) {
          syncItem.synced = true;
          syncItem.syncedAt = new Date().toISOString();
          
          const updateRequest = store.put(syncItem);
          
          updateRequest.onsuccess = () => {
            resolve(syncItem);
          };
          
          updateRequest.onerror = (event) => {
            reject(event.target.error);
          };
        } else {
          reject(new Error('Sync item not found'));
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Synchronize data with the server
 * @returns {Promise} Promise resolving when sync is complete
 */
async function synchronizeData() {
  try {
    // Get all pending sync items
    const pendingSyncItems = await getPendingSyncItems();
    
    // Filter items that haven't been synced
    const unsynced = pendingSyncItems.filter(item => !item.synced);
    
    if (unsynced.length === 0) {
      console.log('No items to sync');
      return;
    }
    
    console.log(`Syncing ${unsynced.length} items...`);
    
    // Group by store to minimize API calls
    const groupedByStore = unsynced.reduce((acc, item) => {
      if (!acc[item.store]) {
        acc[item.store] = [];
      }
      acc[item.store].push(item);
      return acc;
    }, {});
    
    // Process each store group
    for (const [storeName, items] of Object.entries(groupedByStore)) {
      try {
        // This would be an API call in a real application
        console.log(`Syncing ${items.length} items for store ${storeName}`);
        
        // Placeholder for API call
        // await apiCall(`/api/${storeName}/sync`, { items });
        
        // Mark each item as synced
        for (const item of items) {
          await markSyncItemAsSynced(item.id);
        }
      } catch (error) {
        console.error(`Error syncing store ${storeName}:`, error);
      }
    }
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

// Export database API
const CareUnityDB = {
  init: initDatabase,
  save: saveItem,
  get: getItem,
  delete: deleteItem,
  getAll: getAllItems,
  sync: synchronizeData
};

// Automatically initialize when script is loaded
if (typeof window !== 'undefined') {
  window.CareUnityDB = CareUnityDB;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CareUnityDB;
}
