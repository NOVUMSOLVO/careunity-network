/**
 * CareUnity Conflict Resolver
 * A module for detecting, managing, and resolving data conflicts during synchronization
 */

class ConflictResolver {
  constructor() {
    this.conflictsQueue = [];
    this.resolutionStrategies = {
      // Default strategy is 'server-wins'
      default: 'server-wins',
      // Custom strategies for specific data types
      visits: 'field-level-merge',
      'care-plans': 'client-wins-if-newer',
      checkins: 'create-duplicate'
    };
    
    // Resolution methods
    this.resolutionMethods = {
      'server-wins': this.resolveServerWins.bind(this),
      'client-wins': this.resolveClientWins.bind(this),
      'client-wins-if-newer': this.resolveClientWinsIfNewer.bind(this),
      'field-level-merge': this.resolveFieldLevelMerge.bind(this),
      'create-duplicate': this.resolveCreateDuplicate.bind(this),
      'manual': this.queueForManualResolution.bind(this)
    };
    
    // Initialize UI components for manual conflict resolution
    this._initConflictUI();
  }
  
  /**
   * Resolve a conflict based on the appropriate strategy for the data type
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @param {string} dataType - Type of data
   * @returns {Promise<Object>} Resolved data
   */
  async resolveConflict(clientData, serverData, dataType) {
    console.log(`[ConflictResolver] Resolving conflict for ${dataType}`, { clientData, serverData });
    
    // Determine the resolution strategy
    const strategy = this.resolutionStrategies[dataType] || this.resolutionStrategies.default;
    console.log(`[ConflictResolver] Using strategy: ${strategy}`);
    
    // Get the resolution method
    const resolveMethod = this.resolutionMethods[strategy];
    if (!resolveMethod) {
      console.error(`[ConflictResolver] No resolution method found for strategy: ${strategy}`);
      // Fall back to server-wins as default
      return this.resolutionMethods['server-wins'](clientData, serverData, dataType);
    }
    
    // Apply the resolution method
    return resolveMethod(clientData, serverData, dataType);
  }
  
  /**
   * Server always wins strategy
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @returns {Object} Server data
   */
  resolveServerWins(clientData, serverData) {
    return {
      ...serverData,
      _conflictResolution: {
        strategy: 'server-wins',
        timestamp: new Date().toISOString(),
        hadConflict: true
      }
    };
  }
  
  /**
   * Client always wins strategy
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @returns {Object} Client data
   */
  resolveClientWins(clientData, serverData) {
    return {
      ...clientData,
      _conflictResolution: {
        strategy: 'client-wins',
        timestamp: new Date().toISOString(),
        hadConflict: true,
        serverVersion: serverData.version || null
      }
    };
  }
  
  /**
   * Client wins if it has a newer timestamp
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @returns {Object} Resolved data
   */
  resolveClientWinsIfNewer(clientData, serverData) {
    const clientTimestamp = new Date(clientData.updatedAt || clientData.timestamp || 0).getTime();
    const serverTimestamp = new Date(serverData.updatedAt || serverData.timestamp || 0).getTime();
    
    if (clientTimestamp > serverTimestamp) {
      return {
        ...clientData,
        _conflictResolution: {
          strategy: 'client-wins-if-newer',
          timestamp: new Date().toISOString(),
          hadConflict: true,
          serverVersion: serverData.version || null
        }
      };
    } else {
      return {
        ...serverData,
        _conflictResolution: {
          strategy: 'client-wins-if-newer',
          timestamp: new Date().toISOString(),
          hadConflict: true,
          clientVersion: clientData.version || null
        }
      };
    }
  }
  
  /**
   * Field-level merge strategy for more granular conflict resolution
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @returns {Object} Merged data
   */
  resolveFieldLevelMerge(clientData, serverData) {
    // Start with the server data as base
    const result = { ...serverData };
    
    // Field-specific rules for merging
    if (clientData.status && clientData.status !== serverData.status) {
      // For status field, use most recent one based on status timestamp
      const clientStatusTime = new Date(clientData.statusUpdatedAt || 0).getTime();
      const serverStatusTime = new Date(serverData.statusUpdatedAt || 0).getTime();
      
      if (clientStatusTime > serverStatusTime) {
        result.status = clientData.status;
        result.statusUpdatedAt = clientData.statusUpdatedAt;
      }
    }
    
    // For notes, we might want to concatenate if they differ
    if (clientData.notes && clientData.notes !== serverData.notes) {
      result.notes = serverData.notes 
        ? `${serverData.notes}\n---\nClient update: ${clientData.notes}`
        : clientData.notes;
    }
    
    // For arrays like tasks or activities, merge based on unique IDs
    if (clientData.tasks && Array.isArray(clientData.tasks)) {
      // Create a map of server tasks by ID
      const serverTasksMap = new Map();
      if (serverData.tasks && Array.isArray(serverData.tasks)) {
        serverData.tasks.forEach(task => {
          serverTasksMap.set(task.id, task);
        });
      }
      
      // Merge client tasks with server tasks
      const mergedTasks = [];
      
      // Add client tasks, using the server version if it's more recent
      clientData.tasks.forEach(clientTask => {
        const serverTask = serverTasksMap.get(clientTask.id);
        
        if (!serverTask) {
          // Task only exists in client, add it
          mergedTasks.push(clientTask);
        } else {
          // Task exists in both, use the more recent one
          const clientTime = new Date(clientTask.updatedAt || 0).getTime();
          const serverTime = new Date(serverTask.updatedAt || 0).getTime();
          
          if (clientTime > serverTime) {
            mergedTasks.push(clientTask);
          } else {
            mergedTasks.push(serverTask);
          }
          
          // Remove from server map to track processed tasks
          serverTasksMap.delete(clientTask.id);
        }
      });
      
      // Add remaining server tasks that weren't in the client
      serverTasksMap.forEach(task => {
        mergedTasks.push(task);
      });
      
      result.tasks = mergedTasks;
    }
    
    // Add metadata about the conflict resolution
    result._conflictResolution = {
      strategy: 'field-level-merge',
      timestamp: new Date().toISOString(),
      hadConflict: true,
      clientVersion: clientData.version || null,
      serverVersion: serverData.version || null
    };
    
    return result;
  }
  
  /**
   * Create duplicate strategy - keeps both versions
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @returns {Object} Object with both versions
   */
  resolveCreateDuplicate(clientData, serverData) {
    // Generate a new ID for the client version
    const newClientData = {
      ...clientData,
      id: `${clientData.id}-duplicate-${Date.now()}`,
      _conflictResolution: {
        strategy: 'create-duplicate',
        timestamp: new Date().toISOString(),
        hadConflict: true,
        originalId: clientData.id
      }
    };
    
    // Return an object indicating to create a new record and keep the server one
    return {
      createDuplicate: true,
      serverData: serverData,
      newClientData: newClientData
    };
  }
  
  /**
   * Queue a conflict for manual resolution by the user
   * @param {Object} clientData - Data from client
   * @param {Object} serverData - Data from server
   * @param {string} dataType - Type of data
   * @returns {Object} Temporarily resolved data (server version)
   */
  queueForManualResolution(clientData, serverData, dataType) {
    // Add to the conflicts queue
    const conflictId = `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.conflictsQueue.push({
      id: conflictId,
      dataType: dataType,
      clientData: clientData,
      serverData: serverData,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    
    // Store the conflict in IndexedDB for persistence
    this._storeConflictInDB({
      id: conflictId,
      dataType: dataType,
      clientData: clientData,
      serverData: serverData,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    
    // Notify the UI about the pending conflict
    this._showConflictNotification(dataType, conflictId);
    
    // For now, use the server version but flag it as having a pending conflict
    return {
      ...serverData,
      _conflictResolution: {
        strategy: 'manual',
        timestamp: new Date().toISOString(),
        hadConflict: true,
        conflictId: conflictId,
        status: 'pending'
      }
    };
  }
  
  /**
   * Initialize the UI components for manual conflict resolution
   * @private
   */
  _initConflictUI() {
    // This would be implemented on the client side, not in the Service Worker
    console.log('[ConflictResolver] UI components would be initialized on client');
  }
  
  /**
   * Show a notification for a conflict that needs manual resolution
   * @param {string} dataType - Type of data with conflict
   * @param {string} conflictId - ID of the conflict
   * @private
   */
  _showConflictNotification(dataType, conflictId) {
    // In a service worker, this would post a message to clients
    // In a client context, this would display a notification
    console.log(`[ConflictResolver] Conflict notification for ${dataType}`, { conflictId });
  }
  
  /**
   * Store a conflict in IndexedDB for persistence
   * @param {Object} conflict - Conflict object
   * @private
   */
  _storeConflictInDB(conflict) {
    // This would interact with IndexedDB to save the conflict
    // For service worker context, this would need to be moved to a function
    // that can access IndexedDB
    console.log('[ConflictResolver] Would store conflict in DB', conflict);
  }
  
  /**
   * Get all pending conflicts
   * @returns {Promise<Array>} Conflicts queue
   */
  async getPendingConflicts() {
    return this.conflictsQueue.filter(conflict => conflict.status === 'pending');
  }
  
  /**
   * Manually resolve a conflict
   * @param {string} conflictId - ID of the conflict
   * @param {string} resolution - Resolution type ('use-client', 'use-server', 'merge')
   * @param {Object} [customData] - Custom merged data if resolution is 'merge'
   * @returns {Promise<Object>} Resolved data
   */
  async manuallyResolveConflict(conflictId, resolution, customData = null) {
    // Find the conflict in the queue
    const conflictIndex = this.conflictsQueue.findIndex(c => c.id === conflictId);
    
    if (conflictIndex === -1) {
      throw new Error(`Conflict with ID ${conflictId} not found`);
    }
    
    const conflict = this.conflictsQueue[conflictIndex];
    let resolvedData;
    
    // Apply the manual resolution
    switch (resolution) {
      case 'use-client':
        resolvedData = {
          ...conflict.clientData,
          _conflictResolution: {
            strategy: 'manual',
            resolution: 'use-client',
            timestamp: new Date().toISOString(),
            hadConflict: true,
            resolvedBy: 'user'
          }
        };
        break;
        
      case 'use-server':
        resolvedData = {
          ...conflict.serverData,
          _conflictResolution: {
            strategy: 'manual',
            resolution: 'use-server',
            timestamp: new Date().toISOString(),
            hadConflict: true,
            resolvedBy: 'user'
          }
        };
        break;
        
      case 'merge':
        if (customData) {
          resolvedData = {
            ...customData,
            _conflictResolution: {
              strategy: 'manual',
              resolution: 'custom-merge',
              timestamp: new Date().toISOString(),
              hadConflict: true,
              resolvedBy: 'user'
            }
          };
        } else {
          // Default to field-level merge if no custom data provided
          resolvedData = this.resolveFieldLevelMerge(
            conflict.clientData,
            conflict.serverData,
            conflict.dataType
          );
          resolvedData._conflictResolution.resolvedBy = 'user';
        }
        break;
        
      default:
        throw new Error(`Unknown resolution type: ${resolution}`);
    }
    
    // Update the conflict status
    this.conflictsQueue[conflictIndex].status = 'resolved';
    this.conflictsQueue[conflictIndex].resolvedAt = new Date().toISOString();
    this.conflictsQueue[conflictIndex].resolution = resolution;
    
    // Update the conflict in IndexedDB
    this._updateConflictInDB(this.conflictsQueue[conflictIndex]);
    
    // Return the resolved data
    return resolvedData;
  }
  
  /**
   * Update a conflict in IndexedDB
   * @param {Object} conflict - Updated conflict object
   * @private
   */
  _updateConflictInDB(conflict) {
    // This would interact with IndexedDB to update the conflict
    console.log('[ConflictResolver] Would update conflict in DB', conflict);
  }
}

// Export for use in both client and service worker contexts
if (typeof self !== 'undefined') {
  // Service worker context
  self.ConflictResolver = ConflictResolver;
} else if (typeof window !== 'undefined') {
  // Browser context
  window.ConflictResolver = ConflictResolver;
} else {
  // Node.js or other context
  if (typeof module !== 'undefined') {
    module.exports = { ConflictResolver };
  }
}
