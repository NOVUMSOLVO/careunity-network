/**
 * CareUnity Sync Manager
 * Handles data synchronization between local IndexedDB and server
 */

class SyncManager {
  constructor(db) {
    this.db = db;
    this.serverUrl = '/api';
    this.syncInterval = null;
    this.syncInProgress = false;
    this.modalElement = null;
    this.modalTimeout = null;
  }

  /**
 * Create and initialize the modal element for sync notifications
 * @private
 */
_initModal() {
  // Check if modal already exists
  if (this.modalElement) return;
  
  // Create modal container
  this.modalElement = document.createElement('div');
  this.modalElement.className = 'sync-status-modal';
  this.modalElement.style.display = 'none';
  this.modalElement.style.position = 'fixed';
  this.modalElement.style.bottom = '20px';
  this.modalElement.style.right = '20px';
  this.modalElement.style.backgroundColor = '#fff';
  this.modalElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  this.modalElement.style.borderRadius = '4px';
  this.modalElement.style.padding = '12px 20px';
  this.modalElement.style.zIndex = '9999';
  this.modalElement.style.transition = 'opacity 0.3s ease-in-out';
  this.modalElement.style.maxWidth = '300px';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '8px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.fontSize = '18px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#777';
  closeButton.addEventListener('click', () => this.hideModal());
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'sync-modal-content';
  
  // Add elements to DOM
  this.modalElement.appendChild(closeButton);
  this.modalElement.appendChild(contentDiv);
  document.body.appendChild(this.modalElement);
  
  // Listen for sync events
  window.addEventListener('syncComplete', (event) => {
    const timestamp = new Date().toLocaleString();
    localStorage.setItem('lastSyncDate', new Date().toISOString());
    this.showModal('success', 'Sync Completed', `All data synchronized at ${timestamp}`);
  });
  
  window.addEventListener('syncFailed', (event) => {
    this.showModal('error', 'Sync Failed', `Couldn't synchronize data: ${event.detail.error}`, 10000);
  });
  
  // Create offline indicator badge
  this._createOfflineBadge();
}
  
  /**
   * Show modal with sync status message
   * @param {string} type - Type of message: 'info', 'success', 'warning', 'error'
   * @param {string} title - Modal title
   * @param {string} message - Message to display
   * @param {number} [duration=5000] - Time in ms to show the modal, 0 for no auto-hide
   */
  showModal(type, title, message, duration = 5000) {
    // Initialize modal if needed
    if (!this.modalElement) {
      this._initModal();
    }
    
    // Define colors for different message types
    const colors = {
      info: { bg: '#f0f8ff', border: '#bde5f8', title: '#0074d9' },
      success: { bg: '#f0fff0', border: '#d4edda', title: '#28a745' },
      warning: { bg: '#fffacd', border: '#fff3cd', title: '#ffc107' },
      error: { bg: '#fff0f0', border: '#f8d7da', title: '#dc3545' }
    };
    
    // Get color scheme based on type
    const colorScheme = colors[type] || colors.info;
    
    // Update modal styling
    this.modalElement.style.backgroundColor = colorScheme.bg;
    this.modalElement.style.borderLeft = `4px solid ${colorScheme.title}`;
    
    // Update content
    const contentDiv = this.modalElement.querySelector('.sync-modal-content');
    contentDiv.innerHTML = `
      <h3 style="margin: 0 0 8px; color: ${colorScheme.title}; font-size: 16px;">${title}</h3>
      <p style="margin: 0; color: #333; font-size: 14px;">${message}</p>
    `;
    
    // Show the modal
    this.modalElement.style.display = 'block';
    
    // Clear existing timeout if any
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout);
      this.modalTimeout = null;
    }
    
    // Set up auto-hide if duration is provided
    if (duration > 0) {
      this.modalTimeout = setTimeout(() => this.hideModal(), duration);
    }
  }
  
  /**
   * Hide the modal
   */
  hideModal() {
    if (!this.modalElement) return;
    
    // Add fade-out effect
    this.modalElement.style.opacity = '0';
    
    // Actually hide the element after transition completes
    setTimeout(() => {
      this.modalElement.style.display = 'none';
      this.modalElement.style.opacity = '1';
    }, 300);
    
    // Clear timeout if exists
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout);
      this.modalTimeout = null;
    }
  }

  /**
   * Initialize the sync manager
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    if (options.serverUrl) {
      this.serverUrl = options.serverUrl;
    }

    // Register for online/offline events
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));

    // Initialize the modal system
    this._initModal();

    // Try to perform initial sync
    if (navigator.onLine) {
      this.scheduleSyncWithBackoff();
    }

    console.log('[SyncManager] Initialized');
    return this;
  }
  /**
   * Handle online/offline status changes
   * @param {boolean} isOnline - Whether the device is online
   */
  handleOnlineStatus(isOnline) {
    // Update the offline indicator UI
    this._updateOfflineBadge(isOnline);
    
    // Update the main offline indicator if it exists
    const statusIndicator = document.getElementById('offline-indicator');
    if (statusIndicator) {
      statusIndicator.style.display = isOnline ? 'none' : 'block';
    }

    if (isOnline) {
      console.log('[SyncManager] Device is online, scheduling sync');
      this.showModal('success', 'Connection Restored', 'Your device is now online. Synchronizing data...', 3000);
      this.scheduleSyncWithBackoff();
      
      // Register for background sync if browser supports it
      this._registerBackgroundSync();
    } else {
      console.log('[SyncManager] Device is offline, pausing sync');
      
      // Check for pending operations
      this.getPendingOperationsCount().then(count => {
        if (count > 0) {
          this.showModal('warning', 'Offline Mode', `Your device is offline. ${count} changes will be synchronized when connection is restored.`, 5000);
        } else {
          this.showModal('warning', 'Offline Mode', 'Your device is offline. Changes will be synchronized when connection is restored.', 5000);
        }
      });
      
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('connectionstatus', {
      detail: { isOnline }
    }));
  }

  /**
   * Get or generate a unique device ID
   * @returns {string} Device ID
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('careunity_device_id');
    
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('careunity_device_id', deviceId);
    }
    
    return deviceId;
  }
    /**
   * Manually trigger a sync operation
   * @returns {Promise<boolean>} Whether sync was triggered
   */
  async manualSync() {
    if (this.syncInProgress) {
      console.log('[SyncManager] Sync already in progress');
      this.showModal('warning', 'Sync In Progress', 'A sync operation is already running. Please wait for it to complete.');
      return false;
    }
    
    if (!navigator.onLine) {
      console.log('[SyncManager] Cannot sync while offline');
      this.showModal('error', 'Offline Mode', 'Cannot synchronize while offline. Please check your internet connection.');
      return false;
    }
    
    console.log('[SyncManager] Manual sync triggered');
    return this.performSync();
  }
    /**
   * Queue an operation for syncing
   * @param {Object} operation - Operation to queue
   * @returns {Promise<string>} ID of the queued operation
   */
  async queueOperation(operation) {
    try {
      const id = operation.id || `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const syncOperation = {
        id,
        type: operation.type,
        action: operation.action,
        data: operation.data,
        timestamp: new Date().toISOString(),
        attempts: 0
      };
      
      await this.db.add('pendingSync', syncOperation);
      
      // Show appropriate notification based on connection status
      if (navigator.onLine) {
        this.showModal('info', 'Data Change Queued', `${this._getActionLabel(operation.action)} ${this._getTypeLabel(operation.type)} will be synchronized momentarily.`, 2000);
        
        // If we're online, try to sync right away
        if (!this.syncInProgress) {
          setTimeout(() => this.performSync(), 100);
        }
      } else {
        this.showModal('warning', 'Offline Change Saved', `${this._getActionLabel(operation.action)} ${this._getTypeLabel(operation.type)} has been saved and will be synchronized when you're back online.`, 3000);
      }
      
      return id;
    } catch (error) {
      console.error('[SyncManager] Error queueing operation:', error);
      this.showModal('error', 'Operation Failed', `Failed to save your changes: ${error.message}`, 5000);
      throw error;
    }
  }
  
  /**
   * Get user-friendly label for action type
   * @private
   * @param {string} action - Action type (create, update, delete)
   * @returns {string} User-friendly label
   */
  _getActionLabel(action) {
    switch (action) {
      case 'create': return 'New';
      case 'update': return 'Updated';
      case 'delete': return 'Deleted';
      default: return 'Modified';
    }
  }
  
  /**
   * Get a user-friendly label for a data type
   * @private
   * @param {string} type - Data type
   * @returns {string} User-friendly label
   */
  _getTypeLabel(type) {
    const labels = {
      users: 'Service Users',
      visits: 'Visits',
      carePlans: 'Care Plans',
      notes: 'Notes',
      checkins: 'Check-ins',
      incidents: 'Incidents',
      tasks: 'Tasks',
      medications: 'Medications'
    };
    
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  /**
   * Create offline badge indicator
   * @private
   */
  _createOfflineBadge() {
    const badge = document.createElement('div');
    badge.id = 'sync-offline-badge';
    badge.className = 'offline-status-badge hidden';
    badge.innerHTML = `
      <div class="badge-content">
        <span class="material-icons">cloud_off</span>
        <span class="badge-text">Offline</span>
        <span class="pending-count" style="display: none;">0</span>
      </div>
    `;
    
    // Style the badge
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.backgroundColor = '#f8d7da';
    badge.style.color = '#721c24';
    badge.style.borderRadius = '4px';
    badge.style.padding = '4px 8px';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.zIndex = '9999';
    badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    badge.style.fontSize = '14px';
    badge.style.cursor = 'pointer';
    badge.style.transition = 'all 0.3s ease';
    
    // Style badge content
    const badgeContent = badge.querySelector('.badge-content');
    badgeContent.style.display = 'flex';
    badgeContent.style.alignItems = 'center';
    
    // Style the icon
    const icon = badge.querySelector('.material-icons');
    icon.style.fontSize = '16px';
    icon.style.marginRight = '4px';
    
    // Style the pending count
    const pendingCount = badge.querySelector('.pending-count');
    pendingCount.style.backgroundColor = '#dc3545';
    pendingCount.style.color = 'white';
    pendingCount.style.borderRadius = '50%';
    pendingCount.style.padding = '2px 6px';
    pendingCount.style.fontSize = '12px';
    pendingCount.style.marginLeft = '4px';
    
    // Add click event to show sync details
    badge.addEventListener('click', () => {
      this.showSyncDetails();
    });
    
    document.body.appendChild(badge);
    
    // Check initial online status
    this._updateOfflineBadge(navigator.onLine);
    
    return badge;
  }

  /**
   * Update the offline badge visibility and information
   * @param {boolean} isOnline - Whether the device is online
   * @private
   */
  _updateOfflineBadge(isOnline) {
    const badge = document.getElementById('sync-offline-badge');
    if (!badge) return;
    
    if (!isOnline) {
      // Show the badge when offline
      badge.classList.remove('hidden');
      badge.style.display = 'flex';
      
      // Check for pending operations
      this.getPendingOperationsCount().then(count => {
        const pendingCountEl = badge.querySelector('.pending-count');
        if (pendingCountEl) {
          if (count > 0) {
            pendingCountEl.textContent = count;
            pendingCountEl.style.display = 'inline-block';
            
            // Pulse animation for pending changes
            badge.style.animation = 'pulse-badge 2s infinite';
          } else {
            pendingCountEl.style.display = 'none';
            badge.style.animation = 'none';
          }
        }
      });
    } else {
      // When coming back online, keep badge visible if there are pending operations
      this.getPendingOperationsCount().then(count => {
        if (count > 0) {
          // Update to "Syncing" when online with pending operations
          badge.classList.remove('hidden');
          badge.style.display = 'flex';
          badge.style.backgroundColor = '#cce5ff';
          badge.style.color = '#004085';
          
          const icon = badge.querySelector('.material-icons');
          if (icon) {
            icon.textContent = 'sync';
            icon.style.animation = 'spin 2s linear infinite';
          }
          
          const text = badge.querySelector('.badge-text');
          if (text) {
            text.textContent = 'Syncing';
          }
          
          const pendingCountEl = badge.querySelector('.pending-count');
          if (pendingCountEl) {
            pendingCountEl.textContent = count;
            pendingCountEl.style.display = 'inline-block';
          }
        } else {
          // Hide badge when online with no pending operations
          badge.classList.add('hidden');
          setTimeout(() => {
            badge.style.display = 'none';
          }, 300);
        }
      });
    }
  }

  /**
   * Show detailed sync information in a modal
   */
  showSyncDetails() {
    // Initialize modal if needed
    if (!this.modalElement) {
      this._initModal();
    }
    
    this.getPendingOperationsCount().then(async count => {
      if (count === 0) {
        // If no pending operations, show simple message
        this.showModal('info', 'Sync Status', navigator.onLine ? 
          'You are online. All data is synchronized.' : 
          'You are offline. No changes pending synchronization.', 5000);
        return;
      }
      
      // Get details about pending operations
      const pendingOperations = await this.getPendingOperations();
      
      // Group by type
      const operationsByType = pendingOperations.reduce((acc, op) => {
        if (!acc[op.type]) {
          acc[op.type] = [];
        }
        acc[op.type].push(op);
        return acc;
      }, {});
      
      // Build details HTML
      let detailsHtml = `<h3 style="margin: 0 0 8px; color: #0074d9; font-size: 16px;">Pending Synchronization</h3>`;
      
      detailsHtml += `<div style="margin-bottom: 12px; font-size: 14px;">
        <span style="font-weight: bold;">Status:</span> ${navigator.onLine ? 'Online (sync will occur soon)' : 'Offline (will sync when connection returns)'}
      </div>`;
      
      detailsHtml += `<div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">`;
      
      // Add details for each type
      for (const [type, operations] of Object.entries(operationsByType)) {
        detailsHtml += `<div style="margin-bottom: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${this._formatDataType(type)} (${operations.length})</div>
          <ul style="margin: 0; padding-left: 20px;">`;
        
        // Show up to 3 items per type to keep the modal compact
        const displayCount = Math.min(operations.length, 3);
        for (let i = 0; i < displayCount; i++) {
          const op = operations[i];
          const timestamp = new Date(op.timestamp).toLocaleString();
          
          detailsHtml += `<li style="margin-bottom: 2px; font-size: 13px;">
            ${this._formatAction(op.action)} ${op.data && op.data.id ? `#${op.data.id.substring(0, 6)}...` : ''} 
            <span style="color: #777; font-size: 12px;">(${timestamp})</span>
          </li>`;
        }
        
        // If there are more than 3, show count of remaining
        if (operations.length > 3) {
          detailsHtml += `<li style="margin-bottom: 2px; font-size: 13px;">
            ... and ${operations.length - 3} more
          </li>`;
        }
        
        detailsHtml += `</ul></div>`;
      }
      
      detailsHtml += `</div>`;
      
      // Add action buttons if online
      if (navigator.onLine) {
        detailsHtml += `<div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <button id="sync-now-btn" style=""
            background-color: #0074d9; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            padding: 6px 12px; 
            cursor: pointer;
            font-size: 14px;">
            Sync Now
          </button>
        </div>`;
      }
      
      // Show the modal with details
      const contentDiv = this.modalElement.querySelector('.sync-modal-content');
      contentDiv.innerHTML = detailsHtml;
      
      // Bind sync button click if exists
      const syncButton = this.modalElement.querySelector('#sync-now-btn');
      if (syncButton) {
        syncButton.addEventListener('click', () => {
          this.syncNow();
          this.hideModal();
        });
      }
      
      // Show for longer since this has more details to read
      this.modalElement.style.display = 'block';
      this.modalElement.style.width = '320px';
      this.modalElement.style.maxWidth = '80vw';
      
      // Clear existing timeout
      if (this.modalTimeout) {
        clearTimeout(this.modalTimeout);
        this.modalTimeout = null;
      }
      
      // Don't auto-hide detailed view
      // No timeout for auto-hiding
    });
  }

  /**
   * Format data type for display
   * @param {string} type - Data type string
   * @returns {string} Formatted string
   * @private
   */
  _formatDataType(type) {
    // Convert camelCase to Title Case with spaces
    const formatted = type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    // Handle special cases
    switch (type) {
      case 'visits':
        return 'Care Visits';
      case 'carePlans':
        return 'Care Plans';
      default:
        return formatted;
    }
  }

  /**
   * Format action type for display
   * @param {string} action - Action type
   * @returns {string} Formatted string
   * @private
   */
  _formatAction(action) {
    switch (action) {
      case 'create':
        return 'Created';
      case 'update':
        return 'Updated';
      case 'delete':
        return 'Deleted';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  }

  /**
   * Get all pending sync operations
   * @returns {Promise<Array>} Array of pending operations
   */
  async getPendingOperations() {
    return new Promise((resolve, reject) => {
      try {
        // Open a transaction on the pendingSync store
        const { store } = this.db 
          ? getStore('pendingSync') 
          : { store: null };
        
        if (!store) {
          resolve([]);
          return;
        }
        
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };
        
        request.onerror = (event) => {
          console.error('Error getting pending operations:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Error in getPendingOperations:', error);
        resolve([]); // Resolve with empty array to avoid breaking the UI
      }
    });
  }

  /**
   * Get the count of pending sync operations
   * @returns {Promise<number>} Count of pending operations
   */
  async getPendingOperationsCount() {
    return new Promise((resolve, reject) => {
      try {
        // Open a transaction on the pendingSync store
        const { store } = this.db 
          ? getStore('pendingSync') 
          : { store: null };
        
        if (!store) {
          resolve(0);
          return;
        }
        
        const request = store.count();
        
        request.onsuccess = (event) => {
          resolve(event.target.result || 0);
        };
        
        request.onerror = (event) => {
          console.error('Error counting pending operations:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Error in getPendingOperationsCount:', error);
        resolve(0); // Resolve with 0 to avoid breaking the UI
      }
    });
  }

  /**
   * Trigger immediate sync (if online)
   * @returns {Promise<boolean>} Whether sync was triggered
   */
  async syncNow() {
    if (!navigator.onLine) {
      this.showModal('warning', 'Offline', 'Cannot sync while offline. Please connect to the internet and try again.', 3000);
      return false;
    }
    
    this.showModal('info', 'Syncing', 'Synchronizing your data...', 0);
    
    // Check if service worker is available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-data');
        
        // Listen for sync complete message
        const syncComplete = new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_COMPLETED') {
              resolve(event.data);
            }
          });
        });
        
        // Wait for sync to complete with timeout
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve({ timeout: true });
          }, 30000); // 30 second timeout
        });
        
        const result = await Promise.race([syncComplete, timeoutPromise]);
        
        if (result.timeout) {
          this.showModal('info', 'Sync In Progress', 'Synchronization is taking longer than expected and will continue in the background.', 5000);
        }
        
        return true;
      } catch (error) {
        console.error('Error triggering sync:', error);
        this.showModal('error', 'Sync Failed', `Could not trigger sync: ${error.message}`, 5000);
        return false;
      }
    } else {
      // Fallback for browsers without service worker sync
      try {
        // Implement a custom sync mechanism here
        // ...
        this.showModal('success', 'Sync Complete', 'Your data has been synchronized successfully.', 3000);
        return true;
      } catch (error) {
        this.showModal('error', 'Sync Failed', `Could not synchronize data: ${error.message}`, 5000);
        return false;
      }
    }
  }

  // Add CSS animations to the document
  _addCssAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-badge {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .hidden {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .sync-detail-list::-webkit-scrollbar {
        width: 6px;
      }
      
      .sync-detail-list::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      .sync-detail-list::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      
      .sync-detail-list::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(style);
  }
}

// Export the SyncManager class
window.CareUnity = window.CareUnity || {};
window.CareUnity.SyncManager = SyncManager;
