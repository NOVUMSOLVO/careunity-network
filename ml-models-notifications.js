/**
 * ML Models Notifications
 * 
 * This module provides push notification functionality for ML model updates.
 */

class MLModelsNotifications {
  constructor() {
    this.hasPermission = false;
    this.serviceWorkerRegistration = null;
    this.notificationQueue = [];
    this.notificationHistory = [];
    this.maxHistoryLength = 50;
    
    // Initialize
    this.init();
  }
  
  // Initialize notifications
  async init() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    // Check permission status
    this.hasPermission = Notification.permission === 'granted';
    
    // Get service worker registration if available
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
      } catch (error) {
        console.error('Error getting service worker registration:', error);
      }
    }
    
    // Load notification history from local storage
    this.loadNotificationHistory();
    
    return true;
  }
  
  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (this.hasPermission) {
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Show a notification
  async showNotification(title, options = {}) {
    // Default options
    const defaultOptions = {
      body: '',
      icon: '/icon.png',
      badge: '/badge.png',
      tag: 'ml-models-notification',
      requireInteraction: false,
      renotify: false,
      silent: false,
      timestamp: Date.now(),
      data: {}
    };
    
    // Merge options
    const notificationOptions = { ...defaultOptions, ...options };
    
    // Add to notification history
    this.addToHistory({
      title,
      ...notificationOptions,
      timestamp: Date.now()
    });
    
    // Check permission
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        // Add to queue for later
        this.notificationQueue.push({ title, options: notificationOptions });
        return false;
      }
    }
    
    try {
      // Use service worker if available
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(title, notificationOptions);
      } else {
        // Fall back to regular notification
        new Notification(title, notificationOptions);
      }
      
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }
  
  // Show model update notification
  async showModelUpdateNotification(model) {
    return this.showNotification(
      `Model Update: ${model.name}`,
      {
        body: `Version ${model.version} is now available with improved performance.`,
        tag: `model-update-${model.id}`,
        requireInteraction: true,
        data: {
          type: 'model-update',
          modelId: model.id,
          version: model.version
        },
        actions: [
          {
            action: 'view',
            title: 'View Model'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      }
    );
  }
  
  // Show model performance notification
  async showModelPerformanceNotification(model, performance) {
    let performanceText = '';
    let performanceLevel = '';
    
    if (performance.accuracy) {
      const accuracy = performance.accuracy * 100;
      performanceText = `Accuracy: ${accuracy.toFixed(1)}%`;
      performanceLevel = accuracy > 90 ? 'high' : accuracy > 75 ? 'medium' : 'low';
    } else if (performance.rmse) {
      performanceText = `RMSE: ${performance.rmse.toFixed(2)}`;
      performanceLevel = performance.rmse < 1 ? 'high' : performance.rmse < 2 ? 'medium' : 'low';
    }
    
    return this.showNotification(
      `Model Performance: ${model.name}`,
      {
        body: `${performanceText} - ${performanceLevel === 'high' ? 'Excellent' : performanceLevel === 'medium' ? 'Good' : 'Needs improvement'}`,
        tag: `model-performance-${model.id}`,
        data: {
          type: 'model-performance',
          modelId: model.id,
          performance
        }
      }
    );
  }
  
  // Show model drift notification
  async showModelDriftNotification(model, driftDetails) {
    return this.showNotification(
      `Data Drift Detected: ${model.name}`,
      {
        body: `Data drift detected in ${driftDetails.driftingFeatures.length} features. Model retraining recommended.`,
        tag: `model-drift-${model.id}`,
        requireInteraction: true,
        data: {
          type: 'model-drift',
          modelId: model.id,
          driftDetails
        },
        actions: [
          {
            action: 'retrain',
            title: 'Retrain Model'
          },
          {
            action: 'view',
            title: 'View Details'
          }
        ]
      }
    );
  }
  
  // Show offline sync notification
  async showOfflineSyncNotification(syncDetails) {
    return this.showNotification(
      'Offline Data Synced',
      {
        body: `${syncDetails.count} items have been synchronized with the server.`,
        tag: 'offline-sync',
        data: {
          type: 'offline-sync',
          syncDetails
        }
      }
    );
  }
  
  // Process notification queue
  async processQueue() {
    if (!this.hasPermission || this.notificationQueue.length === 0) {
      return;
    }
    
    // Process each notification in the queue
    for (const notification of this.notificationQueue) {
      await this.showNotification(notification.title, notification.options);
    }
    
    // Clear the queue
    this.notificationQueue = [];
  }
  
  // Add notification to history
  addToHistory(notification) {
    this.notificationHistory.unshift(notification);
    
    // Limit history length
    if (this.notificationHistory.length > this.maxHistoryLength) {
      this.notificationHistory = this.notificationHistory.slice(0, this.maxHistoryLength);
    }
    
    // Save to local storage
    this.saveNotificationHistory();
  }
  
  // Save notification history to local storage
  saveNotificationHistory() {
    try {
      localStorage.setItem('ml-models-notification-history', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }
  
  // Load notification history from local storage
  loadNotificationHistory() {
    try {
      const history = localStorage.getItem('ml-models-notification-history');
      if (history) {
        this.notificationHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }
  
  // Clear notification history
  clearHistory() {
    this.notificationHistory = [];
    this.saveNotificationHistory();
  }
  
  // Get notification history
  getHistory() {
    return this.notificationHistory;
  }
}

// Create global instance
window.mlModelsNotifications = new MLModelsNotifications();
