/**
 * CareUnity Notifications
 * Handles in-app notifications and push notifications
 */

class NotificationManager {
  constructor() {
    this.notificationsList = [];
    this.permissionGranted = false;
    this.initialized = false;
    this.badge = null;
    this.notificationCount = 0;
  }

  /**
   * Initialize the notification manager
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('[NotificationManager] This browser does not support notifications');
      return;
    }

    // Check for permission
    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
    } else if (Notification.permission !== 'denied') {
      // Request permission
      try {
        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
      } catch (error) {
        console.error('[NotificationManager] Error requesting permission:', error);
      }
    }

    // Setup notification badge
    this.setupBadge();

    // Mark as initialized
    this.initialized = true;
    console.log('[NotificationManager] Initialized, permission granted:', this.permissionGranted);
  }

  /**
   * Setup the notification badge in the UI
   */
  setupBadge() {
    // Find the notification button
    const notificationBtn = document.getElementById('notifications-btn');
    if (!notificationBtn) return;

    // Create badge element if it doesn't exist
    if (!this.badge) {
      this.badge = document.createElement('span');
      this.badge.className = 'absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full';
      this.badge.style.minWidth = '18px';
      this.badge.style.height = '18px';
      this.badge.style.display = 'flex';
      this.badge.style.alignItems = 'center';
      this.badge.style.justifyContent = 'center';
      this.badge.textContent = '0';
      this.badge.style.display = 'none';
      
      // Make the notification button position relative for badge positioning
      notificationBtn.style.position = 'relative';
      notificationBtn.appendChild(this.badge);
    }
    
    // Setup notification panel toggle
    notificationBtn.addEventListener('click', () => this.toggleNotificationPanel());
  }

  /**
   * Toggle the notification panel
   */
  toggleNotificationPanel() {
    // Find or create the notification panel
    let panel = document.getElementById('notification-panel');
    
    if (panel) {
      // If panel exists, toggle visibility
      if (panel.classList.contains('hidden')) {
        this.showNotificationPanel(panel);
      } else {
        panel.classList.add('hidden');
      }
    } else {
      // Create panel if it doesn't exist
      panel = this.createNotificationPanel();
      this.showNotificationPanel(panel);
    }
  }
  
  /**
   * Show the notification panel and load notifications
   * @param {HTMLElement} panel - The notification panel element 
   */
  showNotificationPanel(panel) {
    panel.classList.remove('hidden');
    
    // Reset notification count and hide badge
    this.notificationCount = 0;
    if (this.badge) {
      this.badge.textContent = '0';
      this.badge.style.display = 'none';
    }
    
    // Load notifications
    this.loadNotificationsIntoPanel(panel);
  }
  
  /**
   * Create the notification panel
   * @returns {HTMLElement} The created notification panel
   */
  createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden';
    panel.style.top = '60px';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';
    
    // Create panel header
    const header = document.createElement('div');
    header.className = 'px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center';
    
    const title = document.createElement('h3');
    title.className = 'font-medium text-gray-700';
    title.textContent = 'Notifications';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'text-gray-400 hover:text-gray-600';
    closeBtn.innerHTML = '<span class="material-icons" style="font-size: 20px;">close</span>';
    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Create notifications container
    const notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'notifications-container';
    notificationsContainer.className = 'divide-y divide-gray-200';
    panel.appendChild(notificationsContainer);
    
    // Create empty state
    const emptyState = document.createElement('div');
    emptyState.id = 'empty-notifications';
    emptyState.className = 'p-4 text-center text-gray-500';
    emptyState.textContent = 'No notifications';
    panel.appendChild(emptyState);
    
    // Append to the document
    document.body.appendChild(panel);
    
    return panel;
  }
  
  /**
   * Load notifications into the panel
   * @param {HTMLElement} panel - The notification panel 
   */
  loadNotificationsIntoPanel(panel) {
    const container = panel.querySelector('#notifications-container');
    const emptyState = panel.querySelector('#empty-notifications');
    
    // Clear existing notifications
    container.innerHTML = '';
    
    if (this.notificationsList.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    // Add notifications to panel
    this.notificationsList.forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.className = 'p-4 hover:bg-gray-50 cursor-pointer transition';
      
      // Format the notification
      const timeAgo = this.getTimeAgo(new Date(notification.timestamp));
      
      notificationElement.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3">
            <span class="material-icons text-indigo-500">${notification.icon || 'notifications'}</span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">${notification.title}</p>
            <p class="text-sm text-gray-600">${notification.message}</p>
            <p class="text-xs text-gray-400 mt-1">${timeAgo}</p>
          </div>
          ${notification.unread ? '<div class="w-2 h-2 bg-indigo-500 rounded-full"></div>' : ''}
        </div>
      `;
      
      // Add click handler
      notificationElement.addEventListener('click', () => {
        this.markAsRead(notification.id);
        if (notification.action) {
          notification.action();
        }
      });
      
      container.appendChild(notificationElement);
    });
  }
  
  /**
   * Get a human-readable time ago string
   * @param {Date} date - The date to format
   * @returns {string} Human-readable time ago
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return 'Just now';
  }
  
  /**
   * Add a new notification
   * @param {Object} notification - The notification object
   * @returns {string} The ID of the added notification
   */
  addNotification(notification) {
    const id = notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newNotification = {
      id,
      title: notification.title || 'Notification',
      message: notification.message || '',
      icon: notification.icon || 'notifications',
      timestamp: notification.timestamp || new Date().toISOString(),
      unread: true,
      action: notification.action || null
    };
    
    // Add to the list
    this.notificationsList.unshift(newNotification);
    
    // Increment notification count
    this.notificationCount++;
    
    // Update badge
    this.updateBadge();
    
    // Show browser notification if permission granted
    if (this.permissionGranted) {
      this.showBrowserNotification(newNotification);
    }
    
    // Update panel if visible
    const panel = document.getElementById('notification-panel');
    if (panel && !panel.classList.contains('hidden')) {
      this.loadNotificationsIntoPanel(panel);
    }
    
    return id;
  }
  
  /**
   * Show a browser notification
   * @param {Object} notification - The notification to show
   */
  showBrowserNotification(notification) {
    try {
      const options = {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/badge-icon.png',
        tag: notification.id
      };
      
      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        if (notification.action) {
          notification.action();
        }
      };
    } catch (error) {
      console.error('[NotificationManager] Error showing browser notification:', error);
    }
  }
  
  /**
   * Update the notification badge
   */
  updateBadge() {
    if (!this.badge) return;
    
    if (this.notificationCount > 0) {
      this.badge.textContent = this.notificationCount > 99 ? '99+' : this.notificationCount;
      this.badge.style.display = 'flex';
    } else {
      this.badge.style.display = 'none';
    }
  }
  
  /**
   * Mark a notification as read
   * @param {string} id - The notification ID
   */
  markAsRead(id) {
    const notification = this.notificationsList.find(n => n.id === id);
    if (notification && notification.unread) {
      notification.unread = false;
      this.notificationCount = Math.max(0, this.notificationCount - 1);
      this.updateBadge();
      
      // Update panel if visible
      const panel = document.getElementById('notification-panel');
      if (panel && !panel.classList.contains('hidden')) {
        this.loadNotificationsIntoPanel(panel);
      }
    }
  }
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notificationsList.forEach(notification => {
      notification.unread = false;
    });
    
    this.notificationCount = 0;
    this.updateBadge();
    
    // Update panel if visible
    const panel = document.getElementById('notification-panel');
    if (panel && !panel.classList.contains('hidden')) {
      this.loadNotificationsIntoPanel(panel);
    }
  }
  
  /**
   * Clear all notifications
   */
  clearAll() {
    this.notificationsList = [];
    this.notificationCount = 0;
    this.updateBadge();
    
    // Update panel if visible
    const panel = document.getElementById('notification-panel');
    if (panel && !panel.classList.contains('hidden')) {
      this.loadNotificationsIntoPanel(panel);
    }
  }
}

// Export the NotificationManager class
window.CareUnity = window.CareUnity || {};
window.CareUnity.NotificationManager = NotificationManager;
