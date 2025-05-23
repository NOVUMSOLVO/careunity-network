/**
 * Enhanced Notification System for CareUnity Mobile
 * Provides categorization, prioritization, scheduling, and smart delivery
 */

class EnhancedNotificationManager {
  constructor() {
    // Initialize base notification manager
    this.baseManager = new CareUnity.NotificationManager();
    
    // Notification categories
    this.categories = {
      CARE_PLAN: 'care_plan',
      MEDICATION: 'medication',
      APPOINTMENT: 'appointment',
      ALERT: 'alert',
      SYSTEM: 'system',
      MESSAGE: 'message'
    };
    
    // Priority levels
    this.priorities = {
      CRITICAL: 'critical',    // Immediate attention required (e.g., emergency alerts)
      HIGH: 'high',            // Important but not critical (e.g., medication reminder)
      MEDIUM: 'medium',        // Default priority (e.g., appointment reminder)
      LOW: 'low'               // Informational (e.g., new feature announcement)
    };
    
    // Category settings with defaults
    this.categorySettings = {
      [this.categories.CARE_PLAN]: {
        icon: 'assignment',
        color: '#4f46e5', // Indigo
        sound: 'gentle',
        defaultPriority: this.priorities.MEDIUM,
        enabled: true
      },
      [this.categories.MEDICATION]: {
        icon: 'medication',
        color: '#0891b2', // Cyan
        sound: 'alert',
        defaultPriority: this.priorities.HIGH,
        enabled: true
      },
      [this.categories.APPOINTMENT]: {
        icon: 'event',
        color: '#059669', // Emerald
        sound: 'gentle',
        defaultPriority: this.priorities.MEDIUM,
        enabled: true
      },
      [this.categories.ALERT]: {
        icon: 'warning',
        color: '#dc2626', // Red
        sound: 'urgent',
        defaultPriority: this.priorities.CRITICAL,
        enabled: true
      },
      [this.categories.SYSTEM]: {
        icon: 'settings',
        color: '#6b7280', // Gray
        sound: 'none',
        defaultPriority: this.priorities.LOW,
        enabled: true
      },
      [this.categories.MESSAGE]: {
        icon: 'chat',
        color: '#8b5cf6', // Violet
        sound: 'message',
        defaultPriority: this.priorities.MEDIUM,
        enabled: true
      }
    };
    
    // Scheduled notifications queue
    this.scheduledNotifications = [];
    
    // Notification channels (system can send to multiple channels)
    this.channels = {
      IN_APP: 'in_app',        // Notifications within the app
      PUSH: 'push',            // Push notifications to the device
      SMS: 'sms',              // SMS messages
      EMAIL: 'email'           // Email notifications
    };
    
    // User preferences
    this.userPreferences = {
      doNotDisturb: false,
      doNotDisturbStart: '22:00', // 10 PM
      doNotDisturbEnd: '08:00',   // 8 AM
      channels: {
        [this.channels.IN_APP]: true,
        [this.channels.PUSH]: true,
        [this.channels.SMS]: false,
        [this.channels.EMAIL]: false
      },
      categoryPreferences: {} // Populated during init
    };
    
    // Notification history for analytics
    this.notificationHistory = [];
    
    // Rate limiting to prevent notification fatigue
    this.deliveryTracking = {
      lastDeliveryTime: {},
      deliveryCount: {}
    };
    
    // Scheduled timers
    this.scheduledTimers = [];
    
    // Flag for initialized state
    this.initialized = false;
  }
  
  /**
   * Initialize the enhanced notification manager
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;
    
    // Initialize base notification manager
    await this.baseManager.init();
    
    // Load user preferences
    await this.loadUserPreferences();
    
    // Initialize default category preferences
    for (const category in this.categories) {
      const categoryValue = this.categories[category];
      if (!this.userPreferences.categoryPreferences[categoryValue]) {
        this.userPreferences.categoryPreferences[categoryValue] = {
          enabled: this.categorySettings[categoryValue].enabled,
          priority: {
            [this.priorities.CRITICAL]: true,
            [this.priorities.HIGH]: true,
            [this.priorities.MEDIUM]: true,
            [this.priorities.LOW]: true
          },
          channels: { ...this.userPreferences.channels }
        };
      }
    }
    
    // Check notification permission
    if ('Notification' in window && this.userPreferences.channels[this.channels.PUSH]) {
      if (Notification.permission === 'default') {
        // Request permission
        try {
          const permission = await Notification.requestPermission();
          console.log('[EnhancedNotificationManager] Notification permission:', permission);
        } catch (error) {
          console.error('[EnhancedNotificationManager] Error requesting notification permission:', error);
        }
      }
    }
    
    // Start processing scheduled notifications
    this.processScheduledNotifications();
    
    // Initialize the notification badge and UI elements
    this.initNotificationUI();
    
    // Load saved notifications from storage
    await this.loadNotificationHistory();
    
    this.initialized = true;
    console.log('[EnhancedNotificationManager] Initialized');
  }
  
  /**
   * Load user notification preferences from storage
   * @private
   */
  async loadUserPreferences() {
    try {
      const savedPreferences = localStorage.getItem('careunity_notification_preferences');
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        this.userPreferences = { ...this.userPreferences, ...parsedPreferences };
      }
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error loading user preferences:', error);
    }
  }
  
  /**
   * Save user notification preferences to storage
   * @private
   */
  async saveUserPreferences() {
    try {
      localStorage.setItem('careunity_notification_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error saving user preferences:', error);
    }
  }
  
  /**
   * Load notification history from storage
   * @private
   */
  async loadNotificationHistory() {
    try {
      const savedHistory = localStorage.getItem('careunity_notification_history');
      if (savedHistory) {
        this.notificationHistory = JSON.parse(savedHistory);
        
        // Filter out expired notifications
        const now = new Date();
        this.notificationHistory = this.notificationHistory.filter(notification => {
          // Keep notifications without expiry or those not yet expired
          return !notification.expiresAt || new Date(notification.expiresAt) > now;
        });
      }
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error loading notification history:', error);
    }
  }
  
  /**
   * Save notification history to storage
   * @private
   */
  async saveNotificationHistory() {
    try {
      // Only store the last 100 notifications to prevent storage bloat
      const historyToSave = this.notificationHistory.slice(0, 100);
      localStorage.setItem('careunity_notification_history', JSON.stringify(historyToSave));
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error saving notification history:', error);
    }
  }
  
  /**
   * Initialize enhanced notification UI
   * @private
   */
  initNotificationUI() {
    // Create notification settings button
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
      // Create settings button next to notifications button
      const settingsBtn = document.createElement('button');
      settingsBtn.id = 'notification-settings-btn';
      settingsBtn.className = 'ml-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none';
      settingsBtn.innerHTML = '<span class="material-icons">settings</span>';
      settingsBtn.title = 'Notification Settings';
      
      // Insert after notifications button
      notificationsBtn.parentNode.insertBefore(settingsBtn, notificationsBtn.nextSibling);
      
      // Add click handler
      settingsBtn.addEventListener('click', () => this.showNotificationSettings());
    }
  }
  
  /**
   * Show notification settings panel
   */
  showNotificationSettings() {
    // Check if settings panel already exists
    let settingsPanel = document.getElementById('notification-settings-panel');
    if (settingsPanel) {
      settingsPanel.classList.remove('hidden');
      return;
    }
    
    // Create settings panel
    settingsPanel = document.createElement('div');
    settingsPanel.id = 'notification-settings-panel';
    settingsPanel.className = 'fixed inset-0 z-50 overflow-y-auto';
    
    settingsPanel.innerHTML = `
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Notification Settings
                </h3>
                
                <!-- General settings -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-700 mb-2">General Settings</h4>
                  
                  <div class="flex items-center justify-between mb-3">
                    <label for="dnd-toggle" class="text-sm text-gray-700">Do Not Disturb</label>
                    <div class="relative inline-block w-10 align-middle select-none">
                      <input type="checkbox" id="dnd-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                        ${this.userPreferences.doNotDisturb ? 'checked' : ''}>
                      <label for="dnd-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label for="dnd-start" class="block text-sm text-gray-700 mb-1">DND Start Time</label>
                      <input type="time" id="dnd-start" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        value="${this.userPreferences.doNotDisturbStart}">
                    </div>
                    <div>
                      <label for="dnd-end" class="block text-sm text-gray-700 mb-1">DND End Time</label>
                      <input type="time" id="dnd-end" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value="${this.userPreferences.doNotDisturbEnd}">
                    </div>
                  </div>
                </div>
                
                <!-- Notification channels -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-700 mb-2">Notification Channels</h4>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <label for="in-app-toggle" class="text-sm text-gray-700">In-App Notifications</label>
                      <div class="relative inline-block w-10 align-middle select-none">
                        <input type="checkbox" id="in-app-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          ${this.userPreferences.channels[this.channels.IN_APP] ? 'checked' : ''}>
                        <label for="in-app-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <label for="push-toggle" class="text-sm text-gray-700">Push Notifications</label>
                      <div class="relative inline-block w-10 align-middle select-none">
                        <input type="checkbox" id="push-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          ${this.userPreferences.channels[this.channels.PUSH] ? 'checked' : ''}>
                        <label for="push-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <label for="sms-toggle" class="text-sm text-gray-700">SMS Notifications</label>
                      <div class="relative inline-block w-10 align-middle select-none">
                        <input type="checkbox" id="sms-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          ${this.userPreferences.channels[this.channels.SMS] ? 'checked' : ''}>
                        <label for="sms-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <label for="email-toggle" class="text-sm text-gray-700">Email Notifications</label>
                      <div class="relative inline-block w-10 align-middle select-none">
                        <input type="checkbox" id="email-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          ${this.userPreferences.channels[this.channels.EMAIL] ? 'checked' : ''}>
                        <label for="email-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Category settings -->
                <div>
                  <h4 class="font-medium text-gray-700 mb-2">Notification Categories</h4>
                  
                  <div class="space-y-4 max-h-64 overflow-y-auto pb-2">
                    ${this.generateCategorySettingsHTML()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" id="save-notification-settings" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              Save
            </button>
            <button type="button" id="close-notification-settings" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add panel to document
    document.body.appendChild(settingsPanel);
    
    // Initialize custom styles for toggles
    this.initToggleStyles();
    
    // Add event listeners
    document.getElementById('close-notification-settings').addEventListener('click', () => {
      settingsPanel.classList.add('hidden');
    });
    
    document.getElementById('save-notification-settings').addEventListener('click', () => {
      this.saveSettings();
      settingsPanel.classList.add('hidden');
    });
    
    // Add event listeners for each category expander
    document.querySelectorAll('.category-expander').forEach(expander => {
      expander.addEventListener('click', (e) => {
        const categoryId = e.currentTarget.dataset.category;
        const details = document.getElementById(`category-details-${categoryId}`);
        const icon = e.currentTarget.querySelector('.material-icons');
        
        if (details.classList.contains('hidden')) {
          details.classList.remove('hidden');
          icon.textContent = 'expand_less';
        } else {
          details.classList.add('hidden');
          icon.textContent = 'expand_more';
        }
      });
    });
  }
  
  /**
   * Generate HTML for category settings
   * @private
   * @returns {string} HTML for category settings
   */
  generateCategorySettingsHTML() {
    let html = '';
    
    for (const category in this.categories) {
      const categoryValue = this.categories[category];
      const settings = this.categorySettings[categoryValue];
      const preferences = this.userPreferences.categoryPreferences[categoryValue] || {
        enabled: settings.enabled,
        priority: {
          [this.priorities.CRITICAL]: true,
          [this.priorities.HIGH]: true,
          [this.priorities.MEDIUM]: true,
          [this.priorities.LOW]: true
        },
        channels: { ...this.userPreferences.channels }
      };
      
      html += `
        <div class="border border-gray-200 rounded-md overflow-hidden">
          <div class="bg-gray-50 px-4 py-2 flex items-center justify-between">
            <div class="flex items-center">
              <span class="material-icons mr-2" style="color: ${settings.color}">${settings.icon}</span>
              <span class="font-medium">${this.formatCategoryName(categoryValue)}</span>
            </div>
            
            <div class="flex items-center">
              <div class="relative inline-block w-10 align-middle select-none mr-2">
                <input type="checkbox" id="category-${categoryValue}" class="toggle-checkbox category-toggle absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  data-category="${categoryValue}" ${preferences.enabled ? 'checked' : ''}>
                <label for="category-${categoryValue}" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
              
              <button type="button" class="category-expander text-gray-500 hover:text-gray-700" data-category="${categoryValue}">
                <span class="material-icons">expand_more</span>
              </button>
            </div>
          </div>
          
          <div id="category-details-${categoryValue}" class="px-4 py-3 hidden">
            <div class="mb-3">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Priority Levels</h5>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="priority-${categoryValue}-critical" class="text-sm text-gray-700 flex items-center">
                    <span class="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                    Critical
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="priority-${categoryValue}-critical" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-priority="${this.priorities.CRITICAL}" ${preferences.priority[this.priorities.CRITICAL] ? 'checked' : ''}>
                    <label for="priority-${categoryValue}-critical" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="priority-${categoryValue}-high" class="text-sm text-gray-700 flex items-center">
                    <span class="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                    High
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="priority-${categoryValue}-high" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-priority="${this.priorities.HIGH}" ${preferences.priority[this.priorities.HIGH] ? 'checked' : ''}>
                    <label for="priority-${categoryValue}-high" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="priority-${categoryValue}-medium" class="text-sm text-gray-700 flex items-center">
                    <span class="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Medium
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="priority-${categoryValue}-medium" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-priority="${this.priorities.MEDIUM}" ${preferences.priority[this.priorities.MEDIUM] ? 'checked' : ''}>
                    <label for="priority-${categoryValue}-medium" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="priority-${categoryValue}-low" class="text-sm text-gray-700 flex items-center">
                    <span class="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                    Low
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="priority-${categoryValue}-low" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-priority="${this.priorities.LOW}" ${preferences.priority[this.priorities.LOW] ? 'checked' : ''}>
                    <label for="priority-${categoryValue}-low" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-2">Delivery Channels</h5>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="channel-${categoryValue}-in_app" class="text-sm text-gray-700">
                    In-App
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="channel-${categoryValue}-in_app" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-channel="${this.channels.IN_APP}" ${preferences.channels[this.channels.IN_APP] ? 'checked' : ''}>
                    <label for="channel-${categoryValue}-in_app" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="channel-${categoryValue}-push" class="text-sm text-gray-700">
                    Push
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="channel-${categoryValue}-push" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-channel="${this.channels.PUSH}" ${preferences.channels[this.channels.PUSH] ? 'checked' : ''}>
                    <label for="channel-${categoryValue}-push" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="channel-${categoryValue}-sms" class="text-sm text-gray-700">
                    SMS
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="channel-${categoryValue}-sms" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-channel="${this.channels.SMS}" ${preferences.channels[this.channels.SMS] ? 'checked' : ''}>
                    <label for="channel-${categoryValue}-sms" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <label for="channel-${categoryValue}-email" class="text-sm text-gray-700">
                    Email
                  </label>
                  <div class="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" id="channel-${categoryValue}-email" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      data-category="${categoryValue}" data-channel="${this.channels.EMAIL}" ${preferences.channels[this.channels.EMAIL] ? 'checked' : ''}>
                    <label for="channel-${categoryValue}-email" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    return html;
  }
  
  /**
   * Initialize toggle button styles
   * @private
   */
  initToggleStyles() {
    // Check if styles already exist
    if (document.getElementById('toggle-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'toggle-styles';
    style.textContent = `
      .toggle-checkbox:checked {
        right: 0;
        border-color: #4f46e5;
      }
      .toggle-checkbox:checked + .toggle-label {
        background-color: #4f46e5;
      }
      .toggle-checkbox {
        right: 0;
        transition: all 0.3s;
        z-index: 1;
      }
      .toggle-label {
        transition: background-color 0.3s;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Save notification settings from the settings panel
   * @private
   */
  saveSettings() {
    try {
      // Get general settings
      this.userPreferences.doNotDisturb = document.getElementById('dnd-toggle').checked;
      this.userPreferences.doNotDisturbStart = document.getElementById('dnd-start').value;
      this.userPreferences.doNotDisturbEnd = document.getElementById('dnd-end').value;
      
      // Get channel settings
      this.userPreferences.channels[this.channels.IN_APP] = document.getElementById('in-app-toggle').checked;
      this.userPreferences.channels[this.channels.PUSH] = document.getElementById('push-toggle').checked;
      this.userPreferences.channels[this.channels.SMS] = document.getElementById('sms-toggle').checked;
      this.userPreferences.channels[this.channels.EMAIL] = document.getElementById('email-toggle').checked;
      
      // Get category settings
      for (const category in this.categories) {
        const categoryValue = this.categories[category];
        
        // Initialize if not exists
        if (!this.userPreferences.categoryPreferences[categoryValue]) {
          this.userPreferences.categoryPreferences[categoryValue] = {
            enabled: true,
            priority: {
              [this.priorities.CRITICAL]: true,
              [this.priorities.HIGH]: true,
              [this.priorities.MEDIUM]: true,
              [this.priorities.LOW]: true
            },
            channels: { ...this.userPreferences.channels }
          };
        }
        
        // Update category enabled state
        const categoryToggle = document.getElementById(`category-${categoryValue}`);
        if (categoryToggle) {
          this.userPreferences.categoryPreferences[categoryValue].enabled = categoryToggle.checked;
        }
        
        // Update priority preferences
        for (const priority in this.priorities) {
          const priorityValue = this.priorities[priority];
          const priorityToggle = document.getElementById(`priority-${categoryValue}-${priorityValue}`);
          if (priorityToggle) {
            this.userPreferences.categoryPreferences[categoryValue].priority[priorityValue] = priorityToggle.checked;
          }
        }
        
        // Update channel preferences
        for (const channel in this.channels) {
          const channelValue = this.channels[channel];
          const channelToggle = document.getElementById(`channel-${categoryValue}-${channelValue}`);
          if (channelToggle) {
            this.userPreferences.categoryPreferences[categoryValue].channels[channelValue] = channelToggle.checked;
          }
        }
      }
      
      // Save preferences to storage
      this.saveUserPreferences();
      
      // Show success message
      this.showToast('Notification settings saved successfully');
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error saving settings:', error);
      this.showToast('Error saving notification settings', true);
    }
  }
  
  /**
   * Show a toast message
   * @param {string} message - Message to show
   * @param {boolean} isError - Whether this is an error message
   * @private
   */
  showToast(message, isError = false) {
    // Check if toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed bottom-4 right-4 z-50';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `py-2 px-4 rounded-md shadow-md text-white mb-2 flex items-center ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    toast.innerHTML = `
      <span class="material-icons mr-2">${isError ? 'error' : 'check_circle'}</span>
      <span>${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.add('opacity-0');
      toast.style.transition = 'opacity 0.5s ease-out';
      
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }
  
  /**
   * Format category name for display
   * @param {string} category - Category identifier
   * @returns {string} Formatted category name
   * @private
   */
  formatCategoryName(category) {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Create and add a notification
   * @param {Object} notification - Notification object
   * @returns {string} ID of the created notification
   */
  addNotification(notification) {
    if (!this.initialized) {
      console.warn('[EnhancedNotificationManager] Manager not initialized');
      return null;
    }
    
    // Generate notification ID if not provided
    const id = notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Ensure category is valid
    const category = notification.category || this.categories.SYSTEM;
    if (!this.categorySettings[category]) {
      console.warn(`[EnhancedNotificationManager] Unknown category: ${category}`);
      notification.category = this.categories.SYSTEM;
    }
    
    // Determine priority
    const priority = notification.priority || this.categorySettings[category].defaultPriority;
    
    // Create enhanced notification object
    const enhancedNotification = {
      id,
      title: notification.title || 'Notification',
      message: notification.message || '',
      category,
      priority,
      timestamp: notification.timestamp || new Date().toISOString(),
      expiresAt: notification.expiresAt || null,
      unread: true,
      action: notification.action || null,
      data: notification.data || {},
      channels: notification.channels || Object.values(this.channels),
      deliveryTracking: {
        created: new Date().toISOString(),
        delivered: {},
        viewed: null
      }
    };
    
    // Add icon and color based on category settings
    enhancedNotification.icon = notification.icon || this.categorySettings[category].icon;
    enhancedNotification.color = notification.color || this.categorySettings[category].color;
    
    // Check if notification should be delivered now or scheduled
    if (notification.deliverAt) {
      return this.scheduleNotification(enhancedNotification, new Date(notification.deliverAt));
    } else {
      // Deliver immediately
      return this.deliverNotification(enhancedNotification);
    }
  }
  
  /**
   * Schedule a notification for future delivery
   * @param {Object} notification - Notification object
   * @param {Date} deliverAt - When to deliver the notification
   * @returns {string} ID of the scheduled notification
   */
  scheduleNotification(notification, deliverAt) {
    const id = notification.id;
    const now = new Date();
    
    // If delivery time is in the past, deliver immediately
    if (deliverAt <= now) {
      return this.deliverNotification(notification);
    }
    
    // Add to scheduled notifications queue
    this.scheduledNotifications.push({
      notification,
      deliverAt
    });
    
    // Sort scheduled notifications by delivery time
    this.scheduledNotifications.sort((a, b) => a.deliverAt - b.deliverAt);
    
    // Schedule timer for this notification
    const delay = deliverAt.getTime() - now.getTime();
    const timerId = setTimeout(() => {
      this.deliverNotification(notification);
      
      // Remove from scheduled queue
      this.scheduledNotifications = this.scheduledNotifications.filter(item => item.notification.id !== id);
    }, delay);
    
    // Store timer ID for cleanup
    this.scheduledTimers.push({
      id,
      timerId
    });
    
    console.log(`[EnhancedNotificationManager] Scheduled notification ${id} for ${deliverAt.toLocaleString()}`);
    return id;
  }
  
  /**
   * Process scheduled notifications, checking if any need to be delivered
   * @private
   */
  processScheduledNotifications() {
    const now = new Date();
    const notificationsToDeliver = [];
    
    // Find notifications that should be delivered
    this.scheduledNotifications = this.scheduledNotifications.filter(item => {
      if (item.deliverAt <= now) {
        notificationsToDeliver.push(item.notification);
        return false;
      }
      return true;
    });
    
    // Deliver notifications
    notificationsToDeliver.forEach(notification => {
      this.deliverNotification(notification);
    });
    
    // Schedule next check
    setTimeout(() => this.processScheduledNotifications(), 10000); // Check every 10 seconds
  }
  
  /**
   * Cancel a scheduled notification
   * @param {string} id - Notification ID
   * @returns {boolean} Whether the notification was canceled
   */
  cancelScheduledNotification(id) {
    // Find the notification in the scheduled queue
    const index = this.scheduledNotifications.findIndex(item => item.notification.id === id);
    
    if (index >= 0) {
      // Remove from scheduled queue
      this.scheduledNotifications.splice(index, 1);
      
      // Clear the associated timer
      const timerIndex = this.scheduledTimers.findIndex(timer => timer.id === id);
      if (timerIndex >= 0) {
        clearTimeout(this.scheduledTimers[timerIndex].timerId);
        this.scheduledTimers.splice(timerIndex, 1);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Deliver a notification through appropriate channels
   * @param {Object} notification - Notification object
   * @returns {string} Notification ID
   * @private
   */
  deliverNotification(notification) {
    // Check if notification can be delivered based on preferences
    if (!this.canDeliverNotification(notification)) {
      console.log(`[EnhancedNotificationManager] Notification ${notification.id} blocked by preferences`);
      return notification.id;
    }
    
    // Deliver through each allowed channel
    this.getEnabledChannels(notification).forEach(channel => {
      this.deliverToChannel(notification, channel);
    });
    
    // Add to notification history
    this.notificationHistory.unshift(notification);
    this.saveNotificationHistory();
    
    return notification.id;
  }
  
  /**
   * Check if a notification can be delivered based on preferences
   * @param {Object} notification - Notification object
   * @returns {boolean} Whether notification can be delivered
   * @private
   */
  canDeliverNotification(notification) {
    // Always deliver critical notifications
    if (notification.priority === this.priorities.CRITICAL) {
      return true;
    }
    
    // Check Do Not Disturb
    if (this.userPreferences.doNotDisturb) {
      const now = new Date();
      const nowTime = now.getHours() * 60 + now.getMinutes();
      
      const startParts = this.userPreferences.doNotDisturbStart.split(':');
      const startTime = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      
      const endParts = this.userPreferences.doNotDisturbEnd.split(':');
      const endTime = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      // Check if current time is in DND period
      // Handle cases where DND period crosses midnight
      if (startTime > endTime) {
        if (nowTime >= startTime || nowTime <= endTime) {
          // Only block if not critical
          return false;
        }
      } else if (nowTime >= startTime && nowTime <= endTime) {
        // Only block if not critical
        return false;
      }
    }
    
    // Check category enabled
    const categoryPrefs = this.userPreferences.categoryPreferences[notification.category];
    if (!categoryPrefs || !categoryPrefs.enabled) {
      return false;
    }
    
    // Check priority enabled for this category
    if (!categoryPrefs.priority[notification.priority]) {
      return false;
    }
    
    // Check rate limiting
    if (this.isRateLimited(notification)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if notification is rate limited
   * @param {Object} notification - Notification object
   * @returns {boolean} Whether notification is rate limited
   * @private
   */
  isRateLimited(notification) {
    const category = notification.category;
    const now = Date.now();
    
    // Initialize tracking for this category if needed
    if (!this.deliveryTracking.lastDeliveryTime[category]) {
      this.deliveryTracking.lastDeliveryTime[category] = 0;
      this.deliveryTracking.deliveryCount[category] = 0;
    }
    
    // Get time since last notification for this category
    const timeSinceLastDelivery = now - this.deliveryTracking.lastDeliveryTime[category];
    const count = this.deliveryTracking.deliveryCount[category];
    
    // Rate limiting rules based on category and priority
    let minInterval = 0;
    if (notification.priority !== this.priorities.CRITICAL) {
      if (category === this.categories.SYSTEM) {
        minInterval = 60 * 1000; // 1 minute between system notifications
      } else if (count > 5) {
        minInterval = 5 * 60 * 1000; // 5 minutes after 5 notifications
      } else if (count > 2) {
        minInterval = 30 * 1000; // 30 seconds after 3 notifications
      }
    }
    
    // Check if we're within the minimum interval
    if (timeSinceLastDelivery < minInterval) {
      return true; // Rate limited
    }
    
    // Update tracking
    this.deliveryTracking.lastDeliveryTime[category] = now;
    this.deliveryTracking.deliveryCount[category]++;
    
    // Reset count if it's been a while
    if (timeSinceLastDelivery > 30 * 60 * 1000) { // 30 minutes
      this.deliveryTracking.deliveryCount[category] = 1;
    }
    
    return false;
  }
  
  /**
   * Get channels enabled for a notification
   * @param {Object} notification - Notification object
   * @returns {Array} Enabled channels
   * @private
   */
  getEnabledChannels(notification) {
    // Get channels requested for this notification
    const requestedChannels = notification.channels || Object.values(this.channels);
    
    // Get enabled channels from user preferences for this category
    const categoryPrefs = this.userPreferences.categoryPreferences[notification.category];
    if (!categoryPrefs) {
      // Fallback to global channel preferences
      return requestedChannels.filter(channel => this.userPreferences.channels[channel]);
    }
    
    // For critical notifications, override preferences for push and in-app
    if (notification.priority === this.priorities.CRITICAL) {
      const criticalChannels = [this.channels.IN_APP];
      if (this.userPreferences.channels[this.channels.PUSH]) {
        criticalChannels.push(this.channels.PUSH);
      }
      return criticalChannels;
    }
    
    // Intersect requested channels with enabled channels for this category
    return requestedChannels.filter(channel => categoryPrefs.channels[channel]);
  }
  
  /**
   * Deliver notification to a specific channel
   * @param {Object} notification - Notification object
   * @param {string} channel - Channel to deliver to
   * @private
   */
  deliverToChannel(notification, channel) {
    // Track delivery
    notification.deliveryTracking.delivered[channel] = new Date().toISOString();
    
    switch (channel) {
      case this.channels.IN_APP:
        this.deliverInApp(notification);
        break;
        
      case this.channels.PUSH:
        this.deliverPush(notification);
        break;
        
      case this.channels.SMS:
        this.deliverSMS(notification);
        break;
        
      case this.channels.EMAIL:
        this.deliverEmail(notification);
        break;
    }
  }
  
  /**
   * Deliver notification in-app
   * @param {Object} notification - Notification to deliver
   * @private
   */
  deliverInApp(notification) {
    // Add to base notification manager
    this.baseManager.addNotification({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      timestamp: notification.timestamp,
      action: notification.action
    });
    
    // Handle persistent notification display if appropriate
    if (notification.priority === this.priorities.CRITICAL) {
      this.showPersistentNotification(notification);
    }
  }
  
  /**
   * Show a persistent notification for critical alerts
   * @param {Object} notification - Notification to show
   * @private
   */
  showPersistentNotification(notification) {
    // Check if persistent notification container exists
    let persistentContainer = document.getElementById('persistent-notification-container');
    
    if (!persistentContainer) {
      persistentContainer = document.createElement('div');
      persistentContainer.id = 'persistent-notification-container';
      persistentContainer.className = 'fixed inset-x-0 top-0 z-50';
      document.body.appendChild(persistentContainer);
    }
    
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.id = `persistent-${notification.id}`;
    notificationEl.className = 'bg-red-500 text-white px-4 py-3 shadow-md flex items-center justify-between';
    
    notificationEl.innerHTML = `
      <div class="flex items-center">
        <span class="material-icons mr-2">${notification.icon}</span>
        <div>
          <p class="font-bold">${notification.title}</p>
          <p class="text-sm">${notification.message}</p>
        </div>
      </div>
      <button type="button" class="dismiss-btn text-white">
        <span class="material-icons">close</span>
      </button>
    `;
    
    // Add click handlers
    notificationEl.querySelector('.dismiss-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      notificationEl.remove();
    });
    
    notificationEl.addEventListener('click', () => {
      if (notification.action) {
        notification.action();
      }
      notificationEl.remove();
    });
    
    // Add to container
    persistentContainer.appendChild(notificationEl);
    
    // Auto-remove after 1 minute (but keep in notification center)
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.remove();
      }
    }, 60000);
  }
  
  /**
   * Deliver push notification
   * @param {Object} notification - Notification to deliver
   * @private
   */
  deliverPush(notification) {
    // Check if push notifications are supported and permitted
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('[EnhancedNotificationManager] Push notifications not available');
      return;
    }
    
    try {
      // Prepare notification options
      const options = {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/badge-icon.png',
        tag: notification.id,
        vibrate: notification.priority === this.priorities.CRITICAL ? [100, 50, 100, 50, 100] : [100, 50, 100],
        renotify: notification.priority === this.priorities.CRITICAL,
        requireInteraction: notification.priority === this.priorities.CRITICAL || notification.priority === this.priorities.HIGH,
        data: {
          ...notification.data,
          id: notification.id,
          category: notification.category,
          priority: notification.priority,
          timestamp: notification.timestamp
        }
      };
      
      // Set notification actions based on category
      switch (notification.category) {
        case this.categories.MEDICATION:
          options.actions = [
            { action: 'taken', title: 'Mark as Taken' },
            { action: 'snooze', title: 'Remind Later' }
          ];
          break;
          
        case this.categories.APPOINTMENT:
          options.actions = [
            { action: 'view', title: 'View Details' },
            { action: 'reschedule', title: 'Reschedule' }
          ];
          break;
          
        case this.categories.ALERT:
          options.actions = [
            { action: 'acknowledge', title: 'Acknowledge' },
            { action: 'respond', title: 'Respond' }
          ];
          break;
      }
      
      // Create and show notification
      const pushNotification = new Notification(notification.title, options);
      
      // Set up click handler
      pushNotification.onclick = () => {
        window.focus();
        if (notification.action) {
          notification.action();
        }
        pushNotification.close();
      };
      
      // Set up action handlers through service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.active.postMessage({
            type: 'NOTIFICATION_DELIVERED',
            notification: {
              id: notification.id,
              category: notification.category,
              priority: notification.priority
            }
          });
        });
      }
    } catch (error) {
      console.error('[EnhancedNotificationManager] Error showing push notification:', error);
    }
  }
  
  /**
   * Deliver SMS notification (simulated)
   * @param {Object} notification - Notification to deliver
   * @private
   */
  deliverSMS(notification) {
    // In a real implementation, this would make an API call to send an SMS
    console.log('[EnhancedNotificationManager] SMS notification (simulated):', notification.title);
  }
  
  /**
   * Deliver email notification (simulated)
   * @param {Object} notification - Notification to deliver
   * @private
   */
  deliverEmail(notification) {
    // In a real implementation, this would make an API call to send an email
    console.log('[EnhancedNotificationManager] Email notification (simulated):', notification.title);
  }
  
  /**
   * Schedule a medication reminder
   * @param {Object} medication - Medication information
   * @param {Date} time - Time to deliver the reminder
   * @returns {string} Notification ID
   */
  scheduleMedicationReminder(medication, time) {
    return this.addNotification({
      title: `Medication Reminder: ${medication.name}`,
      message: `It's time to take ${medication.dosage} of ${medication.name}`,
      category: this.categories.MEDICATION,
      priority: this.priorities.HIGH,
      icon: 'medication',
      deliverAt: time,
      data: {
        medicationId: medication.id,
        dosage: medication.dosage,
        instructions: medication.instructions
      },
      action: () => {
        // In a real implementation, this would open the medication details
        console.log(`Opening medication details for: ${medication.name}`);
      }
    });
  }
  
  /**
   * Schedule an appointment reminder
   * @param {Object} appointment - Appointment information
   * @returns {Array} Array of scheduled notification IDs
   */
  scheduleAppointmentReminders(appointment) {
    const appointmentTime = new Date(appointment.datetime);
    const notificationIds = [];
    
    // Reminder 1 day before
    const dayBefore = new Date(appointmentTime);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(9, 0, 0); // 9 AM
    
    if (dayBefore > new Date()) {
      notificationIds.push(this.addNotification({
        title: 'Appointment Tomorrow',
        message: `You have an appointment with ${appointment.provider} tomorrow at ${appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        category: this.categories.APPOINTMENT,
        priority: this.priorities.MEDIUM,
        deliverAt: dayBefore,
        data: { appointmentId: appointment.id },
        action: () => {
          // Open appointment details
          console.log(`Opening appointment details for: ${appointment.id}`);
        }
      }));
    }
    
    // Reminder 2 hours before
    const twoHoursBefore = new Date(appointmentTime);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    
    if (twoHoursBefore > new Date()) {
      notificationIds.push(this.addNotification({
        title: 'Upcoming Appointment',
        message: `Your appointment with ${appointment.provider} is in 2 hours`,
        category: this.categories.APPOINTMENT,
        priority: this.priorities.HIGH,
        deliverAt: twoHoursBefore,
        data: { appointmentId: appointment.id },
        action: () => {
          // Open appointment details
          console.log(`Opening appointment details for: ${appointment.id}`);
        }
      }));
    }
    
    return notificationIds;
  }
  
  /**
   * Send a care plan update notification
   * @param {Object} carePlan - Care plan information
   */
  sendCarePlanUpdate(carePlan) {
    return this.addNotification({
      title: 'Care Plan Updated',
      message: `Your care plan "${carePlan.title}" has been updated with new information`,
      category: this.categories.CARE_PLAN,
      priority: this.priorities.MEDIUM,
      data: { carePlanId: carePlan.id },
      action: () => {
        // Open care plan details
        console.log(`Opening care plan details for: ${carePlan.id}`);
      }
    });
  }
  
  /**
   * Send an emergency alert notification
   * @param {Object} alert - Alert information
   */
  sendEmergencyAlert(alert) {
    return this.addNotification({
      title: 'EMERGENCY ALERT',
      message: alert.message,
      category: this.categories.ALERT,
      priority: this.priorities.CRITICAL,
      data: { alertId: alert.id },
      action: () => {
        // Open alert response screen
        console.log(`Opening emergency alert: ${alert.id}`);
      }
    });
  }
  
  /**
   * Get notification statistics
   * @returns {Object} Notification statistics
   */
  getNotificationStats() {
    const stats = {
      total: this.notificationHistory.length,
      byCategory: {},
      byPriority: {},
      byDay: {}
    };
    
    // Count by category and priority
    for (const category in this.categories) {
      stats.byCategory[this.categories[category]] = 0;
    }
    
    for (const priority in this.priorities) {
      stats.byPriority[this.priorities[priority]] = 0;
    }
    
    // Analyze notification history
    this.notificationHistory.forEach(notification => {
      // Count by category
      if (stats.byCategory[notification.category] !== undefined) {
        stats.byCategory[notification.category]++;
      }
      
      // Count by priority
      if (stats.byPriority[notification.priority] !== undefined) {
        stats.byPriority[notification.priority]++;
      }
      
      // Count by day
      const date = new Date(notification.timestamp).toLocaleDateString();
      if (!stats.byDay[date]) {
        stats.byDay[date] = 0;
      }
      stats.byDay[date]++;
    });
    
    return stats;
  }
}

// Export the EnhancedNotificationManager class
window.CareUnity = window.CareUnity || {};
window.CareUnity.EnhancedNotificationManager = EnhancedNotificationManager;
