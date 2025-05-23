// CareUnity Mobile - Care Plan Viewer
/**
 * Interactive Care Plan Viewer for CareUnity Mobile
 * Provides an interactive interface for viewing and updating care plans
 */

class CarePlanViewer {
  constructor(db) {
    this.db = db;
    this.currentPlan = null;
    this.container = null;
    this.editMode = false;
    this.changedItems = new Set();
    this.baseUrl = '/api';
  }

  /**
   * Initialize the care plan viewer
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Configuration options
   * @returns {CarePlanViewer} This instance
   */
  init(containerId, options = {}) {
    // Find container element
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('[CarePlanViewer] Container element not found:', containerId);
      return this;
    }

    // Apply options
    if (options.baseUrl) {
      this.baseUrl = options.baseUrl;
    }

    // Add event listener for toggling edit mode
    const editToggleButton = document.getElementById('care-plan-edit-toggle');
    if (editToggleButton) {
      editToggleButton.addEventListener('click', () => this.toggleEditMode());
    }

    // Add event listener for saving changes
    const saveButton = document.getElementById('care-plan-save');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveChanges());
    }

    console.log('[CarePlanViewer] Initialized');
    return this;
  }

  /**
   * Load a care plan by ID
   * @param {string} carePlanId - ID of the care plan to load
   * @returns {Promise<boolean>} Whether the care plan was loaded successfully
   */
  async loadCarePlan(carePlanId) {
    if (!this.container) return false;

    try {
      // Show loading state
      this.showLoadingState();

      // Fetch care plan data
      const carePlan = await this.fetchCarePlan(carePlanId);
      if (!carePlan) {
        this.showError('Care plan not found');
        return false;
      }

      // Store current plan
      this.currentPlan = carePlan;

      // Reset edit state
      this.editMode = false;
      this.changedItems.clear();

      // Render the care plan
      this.renderCarePlan(carePlan);
      return true;
    } catch (error) {
      console.error('[CarePlanViewer] Error loading care plan:', error);
      this.showError('Failed to load care plan. Please try again.');
      return false;
    }
  }

  /**
   * Fetch a care plan from storage or API
   * @param {string} carePlanId - ID of the care plan to fetch
   * @returns {Promise<Object>} The care plan data
   */
  async fetchCarePlan(carePlanId) {
    // Try to get from IndexedDB first (for offline support)
    try {
      const localPlan = await this.db.get('carePlans', carePlanId);
      if (localPlan) {
        console.log('[CarePlanViewer] Loaded care plan from local storage:', carePlanId);
        return localPlan;
      }
    } catch (error) {
      console.warn('[CarePlanViewer] Error fetching local care plan:', error);
    }

    // Fall back to API if online
    if (navigator.onLine) {
      try {
        const response = await fetch(`${this.baseUrl}/care-plans/${carePlanId}`);
        if (response.ok) {
          const carePlan = await response.json();
          
          // Save to local database for offline access
          try {
            await this.db.put('carePlans', carePlan);
          } catch (dbError) {
            console.warn('[CarePlanViewer] Error saving care plan to local DB:', dbError);
          }
          
          return carePlan;
        }
      } catch (fetchError) {
        console.error('[CarePlanViewer] Error fetching care plan from API:', fetchError);
      }
    }

    return null;
  }

  /**
   * Show loading state in the container
   */
  showLoadingState() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p class="mt-4 text-gray-600">Loading care plan...</p>
      </div>
    `;
  }

  /**
   * Show an error message in the container
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8">
        <div class="rounded-full h-12 w-12 flex items-center justify-center bg-red-100 text-red-500">
          <span class="material-icons">error_outline</span>
        </div>
        <p class="mt-4 text-gray-600">${message}</p>
        <button id="care-plan-retry" class="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md">
          Try Again
        </button>
      </div>
    `;

    // Add retry event listener
    const retryButton = document.getElementById('care-plan-retry');
    if (retryButton && this.currentPlan) {
      retryButton.addEventListener('click', () => this.loadCarePlan(this.currentPlan.id));
    }
  }

  /**
   * Render a care plan in the container
   * @param {Object} carePlan - The care plan data to render
   */
  renderCarePlan(carePlan) {
    if (!this.container || !carePlan) return;

    // Create header content
    const headerContent = `
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Care Plan</h2>
        <div class="flex space-x-2">
          <button id="care-plan-edit-toggle" class="p-2 rounded-full hover:bg-gray-200">
            <span class="material-icons">${this.editMode ? 'close' : 'edit'}</span>
          </button>
          ${this.editMode ? `
            <button id="care-plan-save" class="p-2 rounded-full hover:bg-gray-200 text-indigo-600">
              <span class="material-icons">save</span>
            </button>
          ` : ''}
        </div>
      </div>
      <div class="flex flex-col md:flex-row justify-between mb-4">
        <div>
          <h3 class="font-medium">${carePlan.serviceUser.name}</h3>
          <p class="text-sm text-gray-500">ID: ${carePlan.serviceUser.id}</p>
        </div>
        <div class="mt-2 md:mt-0">
          <p class="text-sm">Last updated: ${new Date(carePlan.updatedAt).toLocaleDateString()}</p>
          <p class="text-sm">Version: ${carePlan.version}</p>
        </div>
      </div>
    `;

    // Create care plan sections content
    const sectionsContent = carePlan.sections.map(section => {
      const items = section.items.map(item => this.renderCarePlanItem(item)).join('');
      
      return `
        <div class="care-plan-section mb-6">
          <h3 class="font-medium text-indigo-700 border-b border-gray-200 pb-2 mb-3">
            ${section.title}
          </h3>
          <div class="care-plan-items space-y-3">
            ${items.length ? items : '<p class="text-gray-500 text-sm">No items in this section</p>'}
          </div>
        </div>
      `;
    }).join('');

    // Create goals content
    const goalsContent = `
      <div class="care-plan-section mb-6">
        <h3 class="font-medium text-indigo-700 border-b border-gray-200 pb-2 mb-3">
          Goals & Outcomes
        </h3>
        <div class="care-plan-goals space-y-3">
          ${carePlan.goals.map(goal => `
            <div class="care-plan-goal bg-gray-50 p-3 rounded-md">
              <div class="flex justify-between">
                <span class="font-medium">${goal.title}</span>
                <span class="text-sm ${goal.achieved ? 'text-green-600' : 'text-amber-600'}">
                  ${goal.achieved ? 'Achieved' : 'In Progress'}
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">${goal.description}</p>
              <div class="mt-2 relative pt-1">
                <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div style="width:${goal.progress}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Started: ${new Date(goal.startDate).toLocaleDateString()}</span>
                  <span>Target: ${new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500 text-sm">No goals defined</p>'}
        </div>
      </div>
    `;

    // Create notes content
    const notesContent = `
      <div class="care-plan-section mb-6">
        <h3 class="font-medium text-indigo-700 border-b border-gray-200 pb-2 mb-3">
          Notes & Comments
        </h3>
        <div class="care-plan-notes space-y-3">
          ${carePlan.notes.map(note => `
            <div class="care-plan-note p-3 border-l-4 border-gray-300 bg-gray-50">
              <div class="flex justify-between items-start">
                <p class="text-sm">${note.text}</p>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>${note.author}</span>
                <span>${new Date(note.date).toLocaleString()}</span>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500 text-sm">No notes added</p>'}
          
          <div class="mt-4 ${this.editMode ? '' : 'hidden'}">
            <textarea id="new-note" class="w-full px-3 py-2 border rounded-md" placeholder="Add a note..."></textarea>
            <button id="add-note-btn" class="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md">
              Add Note
            </button>
          </div>
        </div>
      </div>
    `;

    // Assemble the complete content
    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-4">
        ${headerContent}
        <div class="care-plan-content mt-4">
          ${sectionsContent}
          ${goalsContent}
          ${notesContent}
        </div>
      </div>
    `;

    // Add event listeners after rendering
    this.addEventListeners();
  }

  /**
   * Render a single care plan item
   * @param {Object} item - The care plan item data
   * @returns {string} HTML for the care plan item
   */
  renderCarePlanItem(item) {
    if (this.editMode) {
      return this.renderEditableItem(item);
    } else {
      return this.renderReadOnlyItem(item);
    }
  }

  /**
   * Render a care plan item in read-only mode
   * @param {Object} item - The care plan item data
   * @returns {string} HTML for the care plan item
   */
  renderReadOnlyItem(item) {
    let itemContent = '';
    
    switch (item.type) {
      case 'text':
        itemContent = `
          <div class="flex justify-between items-start">
            <div>
              <label class="font-medium">${item.label}</label>
              <p class="text-gray-700">${item.value || 'Not specified'}</p>
            </div>
          </div>
        `;
        break;
        
      case 'checkbox':
        itemContent = `
          <div class="flex items-center justify-between">
            <label class="font-medium">${item.label}</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <span class="material-icons text-${item.value ? 'green' : 'gray'}-500">
                ${item.value ? 'check_circle' : 'cancel'}
              </span>
            </div>
          </div>
        `;
        break;
        
      case 'select':
        itemContent = `
          <div class="flex justify-between items-start">
            <div>
              <label class="font-medium">${item.label}</label>
              <p class="text-gray-700">${item.value || 'Not selected'}</p>
            </div>
          </div>
        `;
        break;
        
      case 'rating':
        const stars = Array(5).fill().map((_, i) => {
          return `
            <span class="material-icons text-${i < item.value ? 'yellow' : 'gray'}-400">
              ${i < item.value ? 'star' : 'star_border'}
            </span>
          `;
        }).join('');
        
        itemContent = `
          <div class="flex justify-between items-start">
            <div>
              <label class="font-medium">${item.label}</label>
              <div class="flex items-center mt-1">
                ${stars}
              </div>
            </div>
          </div>
        `;
        break;
        
      default:
        itemContent = `
          <div class="flex justify-between items-start">
            <div>
              <label class="font-medium">${item.label}</label>
              <p class="text-gray-700">${item.value || 'Not specified'}</p>
            </div>
          </div>
        `;
    }
    
    return `
      <div class="care-plan-item p-3 bg-gray-50 rounded-md" data-item-id="${item.id}" data-item-type="${item.type}">
        ${itemContent}
      </div>
    `;
  }

  /**
   * Render a care plan item in editable mode
   * @param {Object} item - The care plan item data
   * @returns {string} HTML for the editable care plan item
   */
  renderEditableItem(item) {
    let itemContent = '';
    const isChanged = this.changedItems.has(item.id);
    
    switch (item.type) {
      case 'text':
        itemContent = `
          <div class="flex justify-between items-start">
            <div class="w-full">
              <label class="font-medium">${item.label}</label>
              <textarea 
                class="w-full mt-1 px-3 py-2 border rounded-md ${isChanged ? 'border-indigo-500' : ''}" 
                data-original-value="${item.value || ''}"
              >${item.value || ''}</textarea>
            </div>
          </div>
        `;
        break;
        
      case 'checkbox':
        itemContent = `
          <div class="flex items-center justify-between">
            <label class="font-medium">${item.label}</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                data-original-value="${item.value ? 'true' : 'false'}"
                ${item.value ? 'checked' : ''}
                style="top: 0; outline: none; right: 0;"
              />
              <label 
                class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${isChanged ? 'bg-indigo-200' : ''}"
                style="transition: background-color 0.2s ease;"
              ></label>
            </div>
          </div>
        `;
        break;
        
      case 'select':
        const options = item.options.map(option => {
          return `<option value="${option}" ${item.value === option ? 'selected' : ''}>${option}</option>`;
        }).join('');
        
        itemContent = `
          <div class="flex justify-between items-start">
            <div class="w-full">
              <label class="font-medium">${item.label}</label>
              <select 
                class="w-full mt-1 px-3 py-2 border rounded-md ${isChanged ? 'border-indigo-500' : ''}"
                data-original-value="${item.value || ''}"
              >
                <option value="">Select an option</option>
                ${options}
              </select>
            </div>
          </div>
        `;
        break;
        
      case 'rating':
        itemContent = `
          <div class="flex justify-between items-start">
            <div class="w-full">
              <label class="font-medium">${item.label}</label>
              <div class="flex items-center mt-1 rating-input" data-original-value="${item.value || 0}">
                ${Array(5).fill().map((_, i) => {
                  return `
                    <span class="material-icons cursor-pointer text-${i < item.value ? 'yellow' : 'gray'}-400 rating-star" data-value="${i + 1}">
                      ${i < item.value ? 'star' : 'star_border'}
                    </span>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `;
        break;
        
      default:
        itemContent = `
          <div class="flex justify-between items-start">
            <div class="w-full">
              <label class="font-medium">${item.label}</label>
              <input 
                type="text" 
                class="w-full mt-1 px-3 py-2 border rounded-md ${isChanged ? 'border-indigo-500' : ''}"
                value="${item.value || ''}"
                data-original-value="${item.value || ''}"
              />
            </div>
          </div>
        `;
    }
    
    return `
      <div class="care-plan-item p-3 bg-gray-50 rounded-md ${isChanged ? 'border-l-4 border-indigo-500' : ''}" data-item-id="${item.id}" data-item-type="${item.type}">
        ${itemContent}
      </div>
    `;
  }

  /**
   * Add event listeners to interactive elements
   */
  addEventListeners() {
    if (!this.container) return;

    // Find all editable items
    if (this.editMode) {
      // Add listeners for text inputs and textareas
      const textInputs = this.container.querySelectorAll('input[type="text"], textarea');
      textInputs.forEach(input => {
        input.addEventListener('input', (event) => {
          const item = event.target.closest('.care-plan-item');
          const itemId = item.dataset.itemId;
          const originalValue = event.target.dataset.originalValue;
          
          if (event.target.value !== originalValue) {
            this.changedItems.add(itemId);
            item.classList.add('border-l-4', 'border-indigo-500');
          } else {
            this.changedItems.delete(itemId);
            item.classList.remove('border-l-4', 'border-indigo-500');
          }
        });
      });
      
      // Add listeners for checkboxes
      const checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
          const item = event.target.closest('.care-plan-item');
          const itemId = item.dataset.itemId;
          const originalValue = event.target.dataset.originalValue === 'true';
          
          if (event.target.checked !== originalValue) {
            this.changedItems.add(itemId);
            item.classList.add('border-l-4', 'border-indigo-500');
          } else {
            this.changedItems.delete(itemId);
            item.classList.remove('border-l-4', 'border-indigo-500');
          }
          
          // Update toggle label color
          const label = event.target.nextElementSibling;
          if (this.changedItems.has(itemId)) {
            label.classList.add('bg-indigo-200');
          } else {
            label.classList.remove('bg-indigo-200');
          }
        });
      });
      
      // Add listeners for select inputs
      const selects = this.container.querySelectorAll('select');
      selects.forEach(select => {
        select.addEventListener('change', (event) => {
          const item = event.target.closest('.care-plan-item');
          const itemId = item.dataset.itemId;
          const originalValue = event.target.dataset.originalValue;
          
          if (event.target.value !== originalValue) {
            this.changedItems.add(itemId);
            item.classList.add('border-l-4', 'border-indigo-500');
            event.target.classList.add('border-indigo-500');
          } else {
            this.changedItems.delete(itemId);
            item.classList.remove('border-l-4', 'border-indigo-500');
            event.target.classList.remove('border-indigo-500');
          }
        });
      });
      
      // Add listeners for rating stars
      const ratingContainers = this.container.querySelectorAll('.rating-input');
      ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.rating-star');
        const originalValue = parseInt(container.dataset.originalValue, 10) || 0;
        
        stars.forEach(star => {
          star.addEventListener('click', (event) => {
            const value = parseInt(event.target.dataset.value, 10);
            const item = event.target.closest('.care-plan-item');
            const itemId = item.dataset.itemId;
            
            // Update star display
            stars.forEach((s, i) => {
              if (i < value) {
                s.textContent = 'star';
                s.classList.remove('text-gray-400');
                s.classList.add('text-yellow-400');
              } else {
                s.textContent = 'star_border';
                s.classList.remove('text-yellow-400');
                s.classList.add('text-gray-400');
              }
            });
            
            // Track changes
            if (value !== originalValue) {
              this.changedItems.add(itemId);
              item.classList.add('border-l-4', 'border-indigo-500');
            } else {
              this.changedItems.delete(itemId);
              item.classList.remove('border-l-4', 'border-indigo-500');
            }
          });
        });
      });
      
      // Add note button listener
      const addNoteBtn = this.container.querySelector('#add-note-btn');
      if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => this.addNote());
      }
    }
    
    // Edit toggle button
    const editToggleButton = this.container.querySelector('#care-plan-edit-toggle');
    if (editToggleButton) {
      editToggleButton.addEventListener('click', () => this.toggleEditMode());
    }
    
    // Save button
    const saveButton = this.container.querySelector('#care-plan-save');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveChanges());
    }
  }

  /**
   * Toggle between edit and view modes
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    
    // If disabling edit mode with unsaved changes, confirm
    if (!this.editMode && this.changedItems.size > 0) {
      if (!confirm('You have unsaved changes. Discard changes?')) {
        this.editMode = true;
        return;
      }
      
      // Reset changed items
      this.changedItems.clear();
    }
    
    // Re-render the care plan with the new mode
    this.renderCarePlan(this.currentPlan);
  }

  /**
   * Save changes to the care plan
   */
  async saveChanges() {
    if (!this.currentPlan || this.changedItems.size === 0) {
      return;
    }
    
    try {
      // Collect changed values
      const updates = {};
      
      this.changedItems.forEach(itemId => {
        const itemElement = this.container.querySelector(`.care-plan-item[data-item-id="${itemId}"]`);
        if (!itemElement) return;
        
        const itemType = itemElement.dataset.itemType;
        let newValue;
        
        switch (itemType) {
          case 'text':
            const textarea = itemElement.querySelector('textarea');
            newValue = textarea ? textarea.value : null;
            break;
            
          case 'checkbox':
            const checkbox = itemElement.querySelector('input[type="checkbox"]');
            newValue = checkbox ? checkbox.checked : null;
            break;
            
          case 'select':
            const select = itemElement.querySelector('select');
            newValue = select ? select.value : null;
            break;
            
          case 'rating':
            const stars = itemElement.querySelectorAll('.rating-star');
            let rating = 0;
            stars.forEach(star => {
              if (star.textContent === 'star') {
                rating = Math.max(rating, parseInt(star.dataset.value, 10));
              }
            });
            newValue = rating;
            break;
            
          default:
            const input = itemElement.querySelector('input');
            newValue = input ? input.value : null;
        }
        
        if (newValue !== null && newValue !== undefined) {
          updates[itemId] = {
            type: itemType,
            value: newValue
          };
        }
      });
      
      // Create a local copy of the updated plan
      const updatedPlan = JSON.parse(JSON.stringify(this.currentPlan));
      
      // Update the values in the plan
      updatedPlan.sections.forEach(section => {
        section.items.forEach(item => {
          if (updates[item.id]) {
            item.value = updates[item.id].value;
          }
        });
      });
      
      // Update the updatedAt timestamp
      updatedPlan.updatedAt = new Date().toISOString();
      
      // Save to local database first
      await this.db.put('carePlans', updatedPlan);
      
      // If online, send to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${this.baseUrl}/care-plans/${updatedPlan.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              updates,
              timestamp: updatedPlan.updatedAt
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          // Queue for sync if offline
        } catch (fetchError) {
          console.error('[CarePlanViewer] Error updating care plan on server:', fetchError);
          
          // Queue for sync if we have a SyncManager
          if (window.CareUnity && window.CareUnity.SyncManager) {
            const syncManagerInstance = window.CareUnity.syncManagerInstance;
            if (syncManagerInstance) {
              syncManagerInstance.queueOperation({
                type: 'carePlans',
                action: 'update',
                data: {
                  id: updatedPlan.id,
                  updates,
                  timestamp: updatedPlan.updatedAt
                }
              });
            }
          }
        }
      } else {
        // Queue for sync if offline
        if (window.CareUnity && window.CareUnity.SyncManager) {
          const syncManagerInstance = window.CareUnity.syncManagerInstance;
          if (syncManagerInstance) {
            syncManagerInstance.queueOperation({
              type: 'carePlans',
              action: 'update',
              data: {
                id: updatedPlan.id,
                updates,
                timestamp: updatedPlan.updatedAt
              }
            });
          }
        }
      }
      
      // Update current plan and reset state
      this.currentPlan = updatedPlan;
      this.changedItems.clear();
      
      // Show success message
      this.showToast('Care plan updated successfully');
      
      // Re-render in view mode
      this.editMode = false;
      this.renderCarePlan(updatedPlan);
      
    } catch (error) {
      console.error('[CarePlanViewer] Error saving changes:', error);
      this.showToast('Failed to save changes. Please try again.', 'error');
    }
  }

  /**
   * Add a new note to the care plan
   */
  async addNote() {
    const textarea = document.getElementById('new-note');
    if (!textarea || !textarea.value.trim() || !this.currentPlan) {
      return;
    }
    
    try {
      const noteText = textarea.value.trim();
      
      // Create a note object
      const note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text: noteText,
        author: 'Current User', // This would be the actual user in a real app
        date: new Date().toISOString()
      };
      
      // Add to the current plan
      const updatedPlan = JSON.parse(JSON.stringify(this.currentPlan));
      updatedPlan.notes.unshift(note);
      updatedPlan.updatedAt = new Date().toISOString();
      
      // Save to local database
      await this.db.put('carePlans', updatedPlan);
      
      // If online, send to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${this.baseUrl}/care-plans/${updatedPlan.id}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(note)
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
        } catch (fetchError) {
          console.error('[CarePlanViewer] Error adding note on server:', fetchError);
          
          // Queue for sync
          if (window.CareUnity && window.CareUnity.SyncManager) {
            const syncManagerInstance = window.CareUnity.syncManagerInstance;
            if (syncManagerInstance) {
              syncManagerInstance.queueOperation({
                type: 'carePlanNotes',
                action: 'create',
                data: {
                  carePlanId: updatedPlan.id,
                  note
                }
              });
            }
          }
        }
      } else {
        // Queue for sync if offline
        if (window.CareUnity && window.CareUnity.SyncManager) {
          const syncManagerInstance = window.CareUnity.syncManagerInstance;
          if (syncManagerInstance) {
            syncManagerInstance.queueOperation({
              type: 'carePlanNotes',
              action: 'create',
              data: {
                carePlanId: updatedPlan.id,
                note
              }
            });
          }
        }
      }
      
      // Update current plan
      this.currentPlan = updatedPlan;
      
      // Show success message
      this.showToast('Note added successfully');
      
      // Clear the textarea
      textarea.value = '';
      
      // Re-render the notes section
      this.renderCarePlan(updatedPlan);
      
    } catch (error) {
      console.error('[CarePlanViewer] Error adding note:', error);
      this.showToast('Failed to add note. Please try again.', 'error');
    }
  }

  /**
   * Show a toast message
   * @param {string} message - The message to display
   * @param {string} type - The message type ('success', 'error', 'info')
   */
  showToast(message, type = 'success') {
    // Check if there's a SyncManager with modal support
    if (window.CareUnity && window.CareUnity.SyncManager) {
      const syncManagerInstance = window.CareUnity.syncManagerInstance;
      if (syncManagerInstance && typeof syncManagerInstance.showModal === 'function') {
        let title = 'Success';
        if (type === 'error') title = 'Error';
        if (type === 'info') title = 'Information';
        
        syncManagerInstance.showModal(type, title, message);
        return;
      }
    }
    
    // Fallback toast implementation
    const toast = document.createElement('div');
    toast.className = 'care-plan-toast';
    toast.textContent = message;
    
    // Set style based on type
    let bgColor = '#10B981'; // green/success
    if (type === 'error') bgColor = '#EF4444'; // red/error
    if (type === 'info') bgColor = '#3B82F6'; // blue/info
    
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${bgColor};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 1000;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
}

// Export the CarePlanViewer class
window.CareUnity = window.CareUnity || {};
window.CareUnity.CarePlanViewer = CarePlanViewer;
