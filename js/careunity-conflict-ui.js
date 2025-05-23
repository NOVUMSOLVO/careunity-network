/**
 * CareUnity Conflict Resolution UI
 * Provides user interface for manually resolving data conflicts
 */

class ConflictResolutionUI {
  constructor(conflictResolver) {
    this.conflictResolver = conflictResolver || new ConflictResolver();
    this.modalElement = null;
    this.conflicts = [];
    this.currentConflictIndex = 0;
    
    // Initialize the UI
    this._initUI();
  }
  
  /**
   * Initialize the UI components
   * @private
   */
  _initUI() {
    // Listen for app events
    document.addEventListener('conflictsLoaded', this._handleConflictsLoaded.bind(this));
    
    // Add CSS to the document
    this._addStyles();
  }
  
  /**
   * Load conflicts from the conflict resolver
   * @returns {Promise<void>}
   */
  async loadConflicts() {
    try {
      this.conflicts = await this.conflictResolver.getPendingConflicts();
      
      // Dispatch event
      const event = new CustomEvent('conflictsLoaded', {
        detail: { conflicts: this.conflicts }
      });
      document.dispatchEvent(event);
      
      return this.conflicts;
    } catch (error) {
      console.error('Error loading conflicts:', error);
      return [];
    }
  }
  
  /**
   * Handle conflicts loaded event
   * @param {CustomEvent} event - The event object
   * @private
   */
  _handleConflictsLoaded(event) {
    const conflicts = event.detail.conflicts;
    
    // Update UI if there are conflicts
    if (conflicts && conflicts.length > 0) {
      // Show notification badge
      this._showConflictBadge(conflicts.length);
      
      // If auto-show is enabled, show the first conflict
      if (localStorage.getItem('autoShowConflicts') === 'true') {
        this.showConflictResolutionModal(0);
      }
    } else {
      // Hide badge if no conflicts
      this._hideConflictBadge();
    }
  }
  
  /**
   * Show conflict notification badge
   * @param {number} count - Number of conflicts
   * @private
   */
  _showConflictBadge(count) {
    // Check if badge already exists
    let badge = document.getElementById('conflict-badge');
    
    if (!badge) {
      // Create badge
      badge = document.createElement('div');
      badge.id = 'conflict-badge';
      badge.className = 'conflict-badge';
      badge.style.position = 'fixed';
      badge.style.bottom = '20px';
      badge.style.left = '20px';
      badge.style.backgroundColor = '#ffc107';
      badge.style.color = '#212529';
      badge.style.padding = '10px 15px';
      badge.style.borderRadius = '4px';
      badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      badge.style.cursor = 'pointer';
      badge.style.zIndex = '9999';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'space-between';
      badge.style.minWidth = '220px';
      
      // Add click handler
      badge.addEventListener('click', () => {
        this.showConflictResolutionModal(0);
      });
      
      document.body.appendChild(badge);
    }
    
    // Update badge content
    badge.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span class="material-icons" style="margin-right: 10px; font-size: 20px;">warning</span>
        <div>
          <div style="font-weight: bold; font-size: 14px;">Data Conflicts</div>
          <div style="font-size: 12px;">${count} item${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} resolution</div>
        </div>
      </div>
      <button style="
        background-color: #212529;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
      ">Resolve</button>
    `;
  }
  
  /**
   * Hide conflict badge
   * @private
   */
  _hideConflictBadge() {
    const badge = document.getElementById('conflict-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }
  
  /**
   * Show conflict resolution modal
   * @param {number} index - Index of the conflict to show
   */
  showConflictResolutionModal(index = 0) {
    // If no conflicts, nothing to show
    if (!this.conflicts || this.conflicts.length === 0) {
      return;
    }
    
    // Set current index
    this.currentConflictIndex = index;
    
    // Get current conflict
    const conflict = this.conflicts[this.currentConflictIndex];
    
    // Create modal if it doesn't exist
    if (!this.modalElement) {
      this.modalElement = document.createElement('div');
      this.modalElement.className = 'conflict-resolution-modal';
      this.modalElement.style.position = 'fixed';
      this.modalElement.style.top = '0';
      this.modalElement.style.left = '0';
      this.modalElement.style.width = '100%';
      this.modalElement.style.height = '100%';
      this.modalElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
      this.modalElement.style.display = 'flex';
      this.modalElement.style.alignItems = 'center';
      this.modalElement.style.justifyContent = 'center';
      this.modalElement.style.zIndex = '10000';
      
      document.body.appendChild(this.modalElement);
    }
    
    // Prepare content with diff view between client and server data
    const contentHtml = this._prepareConflictContent(conflict);
    
    // Update modal content
    this.modalElement.innerHTML = `
      <div class="conflict-modal-content" style="
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 20px; color: #333;">
            <span class="material-icons" style="vertical-align: middle; margin-right: 8px; color: #ffc107;">warning</span>
            Data Conflict
          </h2>
          <button class="close-button" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #777;
          ">×</button>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 10px; font-size: 14px;">
            There's a conflict between your local changes and the server data for a 
            <strong>${this._formatDataType(conflict.dataType)}</strong> record.
            Please choose how to resolve this conflict:
          </p>
        </div>
        
        ${contentHtml}
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 13px; color: #555;">
                ${this.currentConflictIndex + 1} of ${this.conflicts.length} conflicts
              </span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="resolve-button client-button" data-resolution="use-client" style="
                background-color: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
              ">Use My Version</button>
              <button class="resolve-button server-button" data-resolution="use-server" style="
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
              ">Use Server Version</button>
              <button class="resolve-button merge-button" data-resolution="merge" style="
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
              ">Merge Both</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const closeButton = this.modalElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Add event listeners for resolution buttons
    const resolveButtons = this.modalElement.querySelectorAll('.resolve-button');
    resolveButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const resolution = button.getAttribute('data-resolution');
        await this._resolveCurrentConflict(resolution);
      });
    });
    
    // Show the modal
    this.modalElement.style.display = 'flex';
  }
  
  /**
   * Hide the conflict resolution modal
   */
  hideModal() {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }
  }
  
  /**
   * Resolve the current conflict
   * @param {string} resolution - Resolution type ('use-client', 'use-server', 'merge')
   * @returns {Promise<void>}
   * @private
   */
  async _resolveCurrentConflict(resolution) {
    try {
      // Get current conflict
      const conflict = this.conflicts[this.currentConflictIndex];
      
      // Resolve the conflict
      await this.conflictResolver.manuallyResolveConflict(
        conflict.id,
        resolution,
        resolution === 'merge' ? this._getMergedData(conflict) : null
      );
      
      // Show success message
      this._showToast('Conflict resolved successfully');
      
      // Remove resolved conflict
      this.conflicts.splice(this.currentConflictIndex, 1);
      
      // If there are more conflicts, show the next one
      if (this.conflicts.length > 0) {
        // Adjust index if needed
        if (this.currentConflictIndex >= this.conflicts.length) {
          this.currentConflictIndex = this.conflicts.length - 1;
        }
        
        this.showConflictResolutionModal(this.currentConflictIndex);
      } else {
        // No more conflicts, hide the modal
        this.hideModal();
        this._hideConflictBadge();
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      this._showToast('Error resolving conflict: ' + error.message, 'error');
    }
  }
  
  /**
   * Get merged data for manual merge resolution
   * @param {Object} conflict - The conflict object
   * @returns {Object} Merged data
   * @private
   */
  _getMergedData(conflict) {
    // For now, this is a placeholder that would be replaced with
    // a real UI for allowing the user to select fields from each version
    
    // In a real implementation, we might collect user selections from UI elements
    
    // For this example, we'll just do a basic merge
    const merged = {};
    
    // Start with all server fields
    Object.assign(merged, conflict.serverData);
    
    // Get form data if available (from UI inputs the user has modified)
    const formElements = document.querySelectorAll('[data-field]');
    formElements.forEach(element => {
      const fieldName = element.getAttribute('data-field');
      const source = element.getAttribute('data-source');
      
      if (source === 'client') {
        merged[fieldName] = conflict.clientData[fieldName];
      }
    });
    
    return merged;
  }
  
  /**
   * Format data type for display
   * @param {string} type - Data type
   * @returns {string} Formatted type
   * @private
   */
  _formatDataType(type) {
    // Convert camelCase to spaces and title case
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Prepare content HTML with diff view
   * @param {Object} conflict - The conflict object
   * @returns {string} HTML content
   * @private
   */
  _prepareConflictContent(conflict) {
    // Get client and server data
    const clientData = conflict.clientData;
    const serverData = conflict.serverData;
    
    let html = `
      <div class="conflict-data" style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      ">
        <div class="client-data" style="
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #495057;">
            Your Version
            <span style="font-size: 12px; color: #6c757d; font-weight: normal;">
              (Last modified: ${new Date(clientData.updatedAt || clientData.timestamp).toLocaleString()})
            </span>
          </h3>
          <div class="data-fields">
    `;
    
    // Add client data fields
    for (const [key, value] of Object.entries(clientData)) {
      // Skip metadata fields
      if (key.startsWith('_') || key === 'id' || key === 'updatedAt' || key === 'timestamp') continue;
      
      // Check if this field differs from server
      const differs = JSON.stringify(value) !== JSON.stringify(serverData[key]);
      const fieldStyle = differs ? 'background-color: #fff3cd; padding: 3px;' : '';
      
      html += `
        <div class="field" style="margin-bottom: 8px;">
          <div style="font-size: 12px; color: #6c757d; margin-bottom: 2px;">${key}</div>
          <div style="font-size: 14px; ${fieldStyle}" data-field="${key}" data-source="client">
            ${this._formatValue(value)}
          </div>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
        <div class="server-data" style="
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #495057;">
            Server Version
            <span style="font-size: 12px; color: #6c757d; font-weight: normal;">
              (Last modified: ${new Date(serverData.updatedAt || serverData.timestamp).toLocaleString()})
            </span>
          </h3>
          <div class="data-fields">
    `;
    
    // Add server data fields
    for (const [key, value] of Object.entries(serverData)) {
      // Skip metadata fields
      if (key.startsWith('_') || key === 'id' || key === 'updatedAt' || key === 'timestamp') continue;
      
      // Check if this field differs from client
      const differs = JSON.stringify(value) !== JSON.stringify(clientData[key]);
      const fieldStyle = differs ? 'background-color: #cce5ff; padding: 3px;' : '';
      
      html += `
        <div class="field" style="margin-bottom: 8px;">
          <div style="font-size: 12px; color: #6c757d; margin-bottom: 2px;">${key}</div>
          <div style="font-size: 14px; ${fieldStyle}" data-field="${key}" data-source="server">
            ${this._formatValue(value)}
          </div>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Format a value for display
   * @param {any} value - The value to format
   * @returns {string} Formatted value
   * @private
   */
  _formatValue(value) {
    if (value === null || value === undefined) {
      return '<span style="color: #6c757d; font-style: italic;">null</span>';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '<span style="color: #6c757d; font-style: italic;">empty array</span>';
        }
        
        return `Array(${value.length}) [ ${value.map(v => this._formatValue(v)).join(', ')} ]`;
      }
      
      return JSON.stringify(value, null, 2);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    return String(value);
  }
  
  /**
   * Show toast notification
   * @param {string} message - The message to display
   * @param {string} [type='success'] - The type of toast ('success', 'error', 'info')
   * @private
   */
  _showToast(message, type = 'success') {
    // Colors for different toast types
    const colors = {
      success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
      error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
      info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' }
    };
    
    // Get color scheme
    const colorScheme = colors[type] || colors.info;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = colorScheme.bg;
    toast.style.color = colorScheme.text;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    toast.style.zIndex = '10001';
    toast.style.animation = 'fadein 0.5s, fadeout 0.5s 2.5s';
    toast.style.borderLeft = `4px solid ${colorScheme.border}`;
    
    // Add message
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
  
  /**
   * Add CSS styles to the document
   * @private
   */
  _addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadein {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeout {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
      
      .conflict-badge {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.ConflictResolutionUI = ConflictResolutionUI;
}
