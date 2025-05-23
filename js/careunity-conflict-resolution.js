/**
 * CareUnity Conflict Resolution UI
 * Provides a user interface for resolving synchronization conflicts
 */

class ConflictResolutionUI {
  constructor(syncManager) {
    this.syncManager = syncManager;
    this.modalElement = null;
    this.conflicts = [];
    this.currentConflictIndex = 0;
  }

  /**
   * Initialize the conflict resolution UI
   */
  init() {
    // Listen for sync conflicts event
    window.addEventListener('syncConflicts', (event) => {
      if (event.detail && event.detail.conflicts && event.detail.conflicts.length > 0) {
        this.showConflictResolutionUI(event.detail.conflicts);
      }
    });

    console.log('[ConflictResolutionUI] Initialized');
    return this;
  }

  /**
   * Show the conflict resolution UI
   * @param {Array} conflicts - Conflicts to resolve
   */
  showConflictResolutionUI(conflicts) {
    this.conflicts = conflicts;
    this.currentConflictIndex = 0;
    
    if (!this.modalElement) {
      this._createModal();
    }
    
    this._showCurrentConflict();
  }

  /**
   * Create the modal element for conflict resolution
   * @private
   */
  _createModal() {
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.id = 'conflict-resolution-modal';
    this.modalElement.className = 'conflict-resolution-modal';
    this.modalElement.style.position = 'fixed';
    this.modalElement.style.top = '0';
    this.modalElement.style.left = '0';
    this.modalElement.style.right = '0';
    this.modalElement.style.bottom = '0';
    this.modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.modalElement.style.display = 'flex';
    this.modalElement.style.justifyContent = 'center';
    this.modalElement.style.alignItems = 'center';
    this.modalElement.style.zIndex = '9999';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'conflict-modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'hidden';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'conflict-modal-header';
    header.style.padding = '16px 20px';
    header.style.borderBottom = '1px solid #e5e7eb';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('h2');
    title.className = 'conflict-modal-title';
    title.textContent = 'Resolve Conflict';
    title.style.margin = '0';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    title.style.color = '#111827';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'conflict-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#6b7280';
    closeButton.addEventListener('click', () => this._hideModal());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'conflict-modal-body';
    body.style.padding = '20px';
    body.style.overflowY = 'auto';
    body.style.maxHeight = 'calc(90vh - 140px)';
    
    // Create footer
    const footer = document.createElement('div');
    footer.className = 'conflict-modal-footer';
    footer.style.padding = '16px 20px';
    footer.style.borderTop = '1px solid #e5e7eb';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '10px';
    
    const clientButton = document.createElement('button');
    clientButton.className = 'btn-client';
    clientButton.textContent = 'Use My Version';
    clientButton.style.backgroundColor = '#6366F1';
    clientButton.style.color = '#fff';
    clientButton.style.border = 'none';
    clientButton.style.borderRadius = '4px';
    clientButton.style.padding = '8px 16px';
    clientButton.style.fontWeight = '500';
    clientButton.style.cursor = 'pointer';
    clientButton.addEventListener('click', () => this._resolveCurrentConflict('client-wins'));
    
    const serverButton = document.createElement('button');
    serverButton.className = 'btn-server';
    serverButton.textContent = 'Use Server Version';
    serverButton.style.backgroundColor = '#fff';
    serverButton.style.color = '#374151';
    serverButton.style.border = '1px solid #d1d5db';
    serverButton.style.borderRadius = '4px';
    serverButton.style.padding = '8px 16px';
    serverButton.style.fontWeight = '500';
    serverButton.style.cursor = 'pointer';
    serverButton.addEventListener('click', () => this._resolveCurrentConflict('server-wins'));
    
    const mergeButton = document.createElement('button');
    mergeButton.className = 'btn-merge';
    mergeButton.textContent = 'Merge Changes';
    mergeButton.style.backgroundColor = '#059669';
    mergeButton.style.color = '#fff';
    mergeButton.style.border = 'none';
    mergeButton.style.borderRadius = '4px';
    mergeButton.style.padding = '8px 16px';
    mergeButton.style.fontWeight = '500';
    mergeButton.style.cursor = 'pointer';
    mergeButton.addEventListener('click', () => this._resolveCurrentConflict('merge'));
    
    footer.appendChild(serverButton);
    footer.appendChild(mergeButton);
    footer.appendChild(clientButton);
    
    // Assemble the modal
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    this.modalElement.appendChild(modalContent);
    
    // Add to DOM
    document.body.appendChild(this.modalElement);
  }

  /**
   * Show the current conflict in the modal
   * @private
   */
  _showCurrentConflict() {
    if (this.conflicts.length === 0) {
      this._hideModal();
      return;
    }
    
    const conflict = this.conflicts[this.currentConflictIndex];
    const body = this.modalElement.querySelector('.conflict-modal-body');
    const title = this.modalElement.querySelector('.conflict-modal-title');
    const mergeButton = this.modalElement.querySelector('.btn-merge');
    
    // Update title to show progress
    title.textContent = `Resolve Conflict (${this.currentConflictIndex + 1}/${this.conflicts.length})`;
    
    // Only show merge button if the conflict type supports merging
    const supportsCustomMerge = ['visits', 'carePlans', 'notes'].includes(conflict.type);
    mergeButton.style.display = supportsCustomMerge ? 'block' : 'none';
    
    // Create the conflict details
    let html = `
      <div class="conflict-info">
        <div class="conflict-type" style="margin-bottom: 15px;">
          <span style="font-weight: 600;">Type:</span> ${this._getTypeLabel(conflict.type)}
        </div>
        <div class="conflict-reason" style="margin-bottom: 15px; color: #EF4444;">
          <span style="font-weight: 600;">Conflict:</span> ${conflict.reason}
        </div>
      </div>
      
      <div class="conflict-comparison" style="display: flex; margin-top: 20px; gap: 15px;">
        <div class="local-version" style="flex: 1;">
          <h3 style="margin-top: 0; font-size: 16px;">Your Version</h3>
          <div class="data-display" style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; border-left: 4px solid #6366F1; max-height: 300px; overflow-y: auto;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${JSON.stringify(conflict.localData || {}, null, 2)}</pre>
          </div>
        </div>
        
        <div class="server-version" style="flex: 1;">
          <h3 style="margin-top: 0; font-size: 16px;">Server Version</h3>
          <div class="data-display" style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; border-left: 4px solid #059669; max-height: 300px; overflow-y: auto;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${JSON.stringify(conflict.serverData || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
      
      <div class="conflict-help" style="margin-top: 20px; padding: 10px; background-color: #fffbeb; border-radius: 4px; color: #92400e;">
        <p style="margin: 0; font-size: 14px;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">info</span> Choose which version to keep, or merge them if possible.</p>
      </div>
    `;
    
    body.innerHTML = html;
  }

  /**
   * Hide the modal
   * @private
   */
  _hideModal() {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }
  }

  /**
   * Resolve the current conflict
   * @private
   * @param {string} strategy - Resolution strategy
   */
  async _resolveCurrentConflict(strategy) {
    if (this.conflicts.length === 0) return;
    
    const conflict = this.conflicts[this.currentConflictIndex];
    
    try {
      // Show resolving state
      const body = this.modalElement.querySelector('.conflict-modal-body');
      body.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div class="spinner" style="border: 4px solid rgba(99, 102, 241, 0.3); border-radius: 50%; border-top: 4px solid #6366F1; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
          <p>Resolving conflict...</p>
        </div>
      `;
      
      // Add CSS animation for spinner
      if (!document.getElementById('conflict-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'conflict-spinner-style';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
      
      // Disable buttons while resolving
      const buttons = this.modalElement.querySelectorAll('button');
      buttons.forEach(button => {
        button.disabled = true;
      });
      
      // Resolve the conflict
      const result = await this.syncManager.resolveConflict({
        id: conflict.id,
        resolutionStrategy: strategy
      });
      
      // Handle the result
      if (result.success) {
        // Move to next conflict
        this.currentConflictIndex++;
        
        if (this.currentConflictIndex < this.conflicts.length) {
          this._showCurrentConflict();
        } else {
          // All conflicts resolved, show success message
          body.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
              <span class="material-icons" style="font-size: 48px; color: #10b981; margin-bottom: 20px;">check_circle</span>
              <h3 style="margin: 0 0 10px 0; font-size: 18px;">All Conflicts Resolved</h3>
              <p style="margin: 0; color: #6b7280;">Your changes will be synchronized shortly.</p>
            </div>
          `;
          
          // Re-enable close button
          const closeButton = this.modalElement.querySelector('.conflict-modal-close');
          if (closeButton) {
            closeButton.disabled = false;
          }
          
          // Hide modal after a delay
          setTimeout(() => {
            this._hideModal();
            
            // Trigger a sync
            if (this.syncManager && navigator.onLine) {
              this.syncManager.performSync();
            }
          }, 2000);
        }
      } else {
        // Error resolving conflict
        body.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <span class="material-icons" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">error</span>
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">Error Resolving Conflict</h3>
            <p style="margin: 0; color: #6b7280;">${result.error || 'An unknown error occurred.'}</p>
          </div>
        `;
        
        // Re-enable buttons
        buttons.forEach(button => {
          button.disabled = false;
        });
        
        // Return to conflict display after a delay
        setTimeout(() => {
          this._showCurrentConflict();
        }, 3000);
      }
    } catch (error) {
      console.error('[ConflictResolutionUI] Error resolving conflict:', error);
      
      // Show error
      const body = this.modalElement.querySelector('.conflict-modal-body');
      body.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <span class="material-icons" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">error</span>
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">Error</h3>
          <p style="margin: 0; color: #6b7280;">${error.message || 'An unknown error occurred.'}</p>
        </div>
      `;
      
      // Re-enable buttons
      const buttons = this.modalElement.querySelectorAll('button');
      buttons.forEach(button => {
        button.disabled = false;
      });
      
      // Return to conflict display after a delay
      setTimeout(() => {
        this._showCurrentConflict();
      }, 3000);
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
}

// Export the ConflictResolutionUI class
window.CareUnity = window.CareUnity || {};
window.CareUnity.ConflictResolutionUI = ConflictResolutionUI;
