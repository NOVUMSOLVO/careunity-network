/**
 * CareUnity Analytics - Enhanced Reporting Dashboard
 * 
 * This module provides advanced analytics and reporting capabilities for CareUnity mobile,
 * including visualization, custom reports, and predictive analytics.
 */

(function() {
  // Initialize the analytics system
  const CareUnityAnalytics = {
    // Configuration
    config: {
      syncInterval: 15 * 60 * 1000, // Sync data every 15 minutes
      dataRetentionDays: 90, // Keep 90 days of data
      dataCompressionEnabled: true, // Enable data compression for storage
      samplingRate: 100, // Percentage of events to collect (100 = all)
      anonymizeData: false, // Whether to anonymize data for privacy
      predictiveAnalyticsEnabled: true // Enable predictive analytics
    },
    
    // State
    state: {
      initialized: false,
      user: null,
      deviceInfo: null,
      sessionId: null,
      db: null,
      charts: {},
      syncTimerId: null,
      currentDashboard: null,
      cachedData: new Map(),
      pendingEvents: []
    },
    
    // Initialize the analytics system
    init: async function() {
      console.log('Initializing CareUnity Analytics');
      
      try {
        // Generate or retrieve session ID
        this.state.sessionId = this.generateSessionId();
        
        // Collect device information
        this.state.deviceInfo = this.collectDeviceInfo();
        
        // Open database
        this.state.db = await this.openDatabase();
        
        // Load configuration
        await this.loadConfiguration();
        
        // Register event listeners
        this.registerEventListeners();
        
        // Start sync timer
        this.startSyncTimer();
        
        // Load user information if available
        await this.loadUserInfo();
        
        // Track session start
        this.trackEvent('session_start', {
          referrer: document.referrer,
          url: window.location.href
        });
        
        // Initialize dashboard if on analytics page
        if (window.location.pathname.includes('analytics-dashboard.html')) {
          this.initDashboard();
        }
        
        // Mark as initialized
        this.state.initialized = true;
        
        console.log('CareUnity Analytics initialized');
        return this;
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        return null;
      }
    },
    
    // Open IndexedDB database
    openDatabase: function() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('CareUnityDB', 1);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(new Error('Failed to open database: ' + event.target.error));
        };
        
        // Handle upgrade needed (might need to create stores)
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('analyticsEvents')) {
            const store = db.createObjectStore('analyticsEvents', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('eventType', 'eventType', { unique: false });
            store.createIndex('userId', 'userId', { unique: false });
          }
          
          if (!db.objectStoreNames.contains('analyticsReports')) {
            db.createObjectStore('analyticsReports', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('analyticsDashboards')) {
            db.createObjectStore('analyticsDashboards', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('analyticsMetrics')) {
            db.createObjectStore('analyticsMetrics', { keyPath: 'id' });
          }
        };
      });
    },
    
    // Load configuration
    loadConfiguration: async function() {
      try {
        // Try to get from server first
        if (navigator.onLine) {
          const response = await fetch('/api/analytics/config');
          if (response.ok) {
            const serverConfig = await response.json();
            this.config = { ...this.config, ...serverConfig };
            return;
          }
        }
        
        // Fall back to stored config if available
        const transaction = this.state.db.transaction(['analyticsMetrics'], 'readonly');
        const store = transaction.objectStore('analyticsMetrics');
        const request = store.get('config');
        
        const that = this;
        request.onsuccess = function(event) {
          if (event.target.result) {
            that.config = { ...that.config, ...event.target.result.value };
          }
        };
      } catch (error) {
        console.error('Error loading analytics configuration:', error);
        // Continue with default config
      }
    },
    
    // Load user information
    loadUserInfo: async function() {
      try {
        // Try to get from localStorage first (if user is logged in)
        const userJson = localStorage.getItem('careunity_user');
        if (userJson) {
          const user = JSON.parse(userJson);
          this.state.user = {
            id: user.id,
            role: user.role,
            // Don't include personally identifiable information
            userType: user.userType || 'staff'
          };
          return;
        }
        
        // Otherwise use anonymous tracking
        this.state.user = {
          id: 'anonymous_' + this.getDeviceId(),
          role: 'anonymous',
          userType: 'anonymous'
        };
      } catch (error) {
        console.error('Error loading user info:', error);
        // Use anonymous as fallback
        this.state.user = {
          id: 'anonymous_' + this.getDeviceId(),
          role: 'anonymous',
          userType: 'anonymous'
        };
      }
    },
    
    // Register event listeners
    registerEventListeners: function() {
      // Track page views
      window.addEventListener('popstate', () => {
        this.trackPageView();
      });
      
      // Custom CareUnity events
      document.addEventListener('carePlanUpdated', (event) => {
        this.trackEvent('care_plan_updated', event.detail);
      });
      
      document.addEventListener('visitCompleted', (event) => {
        this.trackEvent('visit_completed', event.detail);
      });
      
      document.addEventListener('medicationRecorded', (event) => {
        this.trackEvent('medication_recorded', event.detail);
      });
      
      document.addEventListener('taskCompleted', (event) => {
        this.trackEvent('task_completed', event.detail);
      });
      
      document.addEventListener('reportGenerated', (event) => {
        this.trackEvent('report_generated', event.detail);
      });
      
      document.addEventListener('userPreferenceChanged', (event) => {
        this.trackEvent('user_preference_changed', event.detail);
      });
      
      document.addEventListener('voiceCommandExecuted', (event) => {
        this.trackEvent('voice_command_executed', event.detail);
      });
      
      // Error tracking
      window.addEventListener('error', (event) => {
        this.trackError(event);
      });
      
      // Performance tracking
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPerformance();
        }, 0);
      });
      
      // Handle online/offline events
      window.addEventListener('online', () => {
        this.handleOnlineStatus(true);
      });
      
      window.addEventListener('offline', () => {
        this.handleOnlineStatus(false);
      });
      
      // Track initial page view
      this.trackPageView();
      
      // Custom event tracking for elements with data-track attribute
      document.addEventListener('click', (event) => {
        let trackElement = event.target.closest('[data-track]');
        if (trackElement) {
          const eventName = trackElement.dataset.track;
          const eventProps = {};
          
          // Collect additional tracking properties from data attributes
          Object.keys(trackElement.dataset).forEach(key => {
            if (key.startsWith('trackProp')) {
              const propName = key.replace('trackProp', '').toLowerCase();
              eventProps[propName] = trackElement.dataset[key];
            }
          });
          
          this.trackEvent(eventName, eventProps);
        }
      });
    },
    
    // Start sync timer
    startSyncTimer: function() {
      if (this.state.syncTimerId) {
        clearInterval(this.state.syncTimerId);
      }
      
      this.state.syncTimerId = setInterval(() => {
        this.syncData().catch(error => {
          console.error('Error syncing analytics data:', error);
        });
      }, this.config.syncInterval);
      
      // Also trigger an immediate sync
      if (navigator.onLine) {
        setTimeout(() => this.syncData(), 5000);
      }
    },
    
    // Track a page view
    trackPageView: function() {
      // Extract page information
      const url = new URL(window.location.href);
      const path = url.pathname;
      const pageTitle = document.title;
      const referrer = document.referrer;
      
      // Track the page view event
      this.trackEvent('page_view', {
        url: url.href,
        path: path,
        title: pageTitle,
        referrer: referrer,
        queryParams: Object.fromEntries(url.searchParams.entries())
      });
    },
    
    // Track a custom event
    trackEvent: function(eventType, eventData = {}) {
      // Skip if not initialized
      if (!this.state.initialized) {
        this.state.pendingEvents.push({ eventType, eventData });
        return;
      }
      
      // Apply sampling rate - randomly skip some events to reduce data volume
      if (this.config.samplingRate < 100) {
        const randomValue = Math.random() * 100;
        if (randomValue > this.config.samplingRate) {
          return; // Skip this event
        }
      }
      
      // Create event object
      const event = {
        id: this.generateEventId(),
        eventType: eventType,
        timestamp: new Date().toISOString(),
        sessionId: this.state.sessionId,
        userId: this.state.user?.id || 'anonymous',
        userRole: this.state.user?.role || 'anonymous',
        userType: this.state.user?.userType || 'anonymous',
        deviceInfo: this.state.deviceInfo,
        url: window.location.href,
        data: eventData
      };
      
      // Anonymize data if configured
      if (this.config.anonymizeData) {
        event.userId = this.hashValue(event.userId);
        if (event.data.patientId) {
          event.data.patientId = this.hashValue(event.data.patientId);
        }
        if (event.data.carePlanId) {
          event.data.carePlanId = this.hashValue(event.data.carePlanId);
        }
      }
      
      // Store the event
      this.storeEvent(event);
      
      // If online, consider sending immediately for important events
      if (navigator.onLine && ['error', 'critical_action'].includes(eventType)) {
        this.syncData();
      }
    },
    
    // Track an error
    trackError: function(errorEvent) {
      // Create error event
      const errorData = {
        message: errorEvent.message || 'Unknown error',
        source: errorEvent.filename || errorEvent.sourceURL || '',
        line: errorEvent.lineno || errorEvent.line || 0,
        column: errorEvent.colno || errorEvent.column || 0,
        stack: errorEvent.error?.stack || '',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      // Track the error event
      this.trackEvent('error', errorData);
    },
    
    // Track performance metrics
    trackPerformance: function() {
      // Skip if the Performance API is not available
      if (!window.performance) {
        return;
      }
      
      try {
        // Get performance metrics
        const perfData = {};
        
        // Navigation timing
        if (performance.timing) {
          const timing = performance.timing;
          
          perfData.pageLoad = timing.loadEventEnd - timing.navigationStart;
          perfData.domReady = timing.domComplete - timing.domLoading;
          perfData.networkLatency = timing.responseEnd - timing.fetchStart;
          perfData.redirectTime = timing.redirectEnd - timing.redirectStart;
          perfData.domInteractive = timing.domInteractive - timing.navigationStart;
          perfData.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        }
        
        // Memory info if available
        if (performance.memory) {
          perfData.memory = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        
        // Get resource timing information
        if (performance.getEntriesByType) {
          const resources = performance.getEntriesByType('resource');
          
          // Summarize resource loading
          const resourceStats = {
            totalResources: resources.length,
            totalSize: 0,
            slowestResource: null,
            slowestTime: 0,
            resourcesByType: {}
          };
          
          resources.forEach(resource => {
            const duration = resource.duration;
            const size = resource.transferSize || 0;
            const resourceType = resource.initiatorType || 'other';
            
            resourceStats.totalSize += size;
            
            if (duration > resourceStats.slowestTime) {
              resourceStats.slowestTime = duration;
              resourceStats.slowestResource = resource.name;
            }
            
            if (!resourceStats.resourcesByType[resourceType]) {
              resourceStats.resourcesByType[resourceType] = {
                count: 0,
                totalSize: 0,
                totalDuration: 0
              };
            }
            
            resourceStats.resourcesByType[resourceType].count++;
            resourceStats.resourcesByType[resourceType].totalSize += size;
            resourceStats.resourcesByType[resourceType].totalDuration += duration;
          });
          
          perfData.resources = resourceStats;
        }
        
        // Track the performance event
        this.trackEvent('performance', perfData);
      } catch (error) {
        console.error('Error tracking performance:', error);
      }
    },
    
    // Store an event in IndexedDB
    storeEvent: function(event) {
      try {
        const transaction = this.state.db.transaction(['analyticsEvents'], 'readwrite');
        const store = transaction.objectStore('analyticsEvents');
        
        // Compress data if configured to save space
        if (this.config.dataCompressionEnabled && event.data) {
          event.dataCompressed = true;
          event.data = this.compressData(event.data);
        }
        
        store.add(event);
      } catch (error) {
        console.error('Error storing event:', error);
      }
    },
    
    // Sync data with the server
    syncData: async function() {
      if (!navigator.onLine) {
        console.log('Device offline, skipping analytics sync');
        return;
      }
      
      try {
        // Get unsent events from IndexedDB
        const events = await this.getUnsentEvents();
        
        if (events.length === 0) {
          console.log('No analytics events to sync');
          return;
        }
        
        console.log(`Syncing ${events.length} analytics events`);
        
        // Try to send to server
        const response = await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        // Mark events as sent
        await this.markEventsAsSent(events);
        
        console.log(`Successfully synced ${events.length} analytics events`);
        
        // Trigger service worker sync for redundancy
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ANALYTICS_SYNCED',
            count: events.length
          });
        }
        
        // Clean up old data
        this.cleanupOldData();
      } catch (error) {
        console.error('Error syncing analytics data:', error);
        
        // Queue for background sync
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-analytics');
          });
        }
      }
    },
    
    // Get unsent events from IndexedDB
    getUnsentEvents: function() {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.state.db.transaction(['analyticsEvents'], 'readonly');
          const store = transaction.objectStore('analyticsEvents');
          const index = store.index('timestamp');
          
          // Get events from the last 24 hours that haven't been sent
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          const range = IDBKeyRange.lowerBound(oneDayAgo.toISOString());
          const request = index.getAll(range);
          
          request.onsuccess = (event) => {
            const allEvents = event.target.result;
            
            // Filter for events that haven't been marked as sent
            const unsentEvents = allEvents.filter(event => !event.sent);
            
            // Decompress data if needed
            unsentEvents.forEach(event => {
              if (event.dataCompressed) {
                event.data = this.decompressData(event.data);
                event.dataCompressed = false;
              }
            });
            
            resolve(unsentEvents);
          };
          
          request.onerror = (event) => {
            reject(new Error('Error getting unsent events: ' + event.target.error));
          };
        } catch (error) {
          reject(error);
        }
      });
    },
    
    // Mark events as sent
    markEventsAsSent: function(events) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.state.db.transaction(['analyticsEvents'], 'readwrite');
          const store = transaction.objectStore('analyticsEvents');
          
          let completed = 0;
          let total = events.length;
          
          events.forEach(event => {
            // Mark as sent
            event.sent = true;
            event.sentTimestamp = new Date().toISOString();
            
            // Re-compress if needed
            if (this.config.dataCompressionEnabled && !event.dataCompressed) {
              event.dataCompressed = true;
              event.data = this.compressData(event.data);
            }
            
            const request = store.put(event);
            
            request.onsuccess = () => {
              completed++;
              if (completed === total) {
                resolve();
              }
            };
            
            request.onerror = (event) => {
              reject(new Error('Error marking event as sent: ' + event.target.error));
            };
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    
    // Clean up old data
    cleanupOldData: function() {
      try {
        const transaction = this.state.db.transaction(['analyticsEvents'], 'readwrite');
        const store = transaction.objectStore('analyticsEvents');
        const index = store.index('timestamp');
        
        // Calculate retention date
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - this.config.dataRetentionDays);
        
        const range = IDBKeyRange.upperBound(retentionDate.toISOString());
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('Error cleaning up old analytics data:', error);
      }
    },
    
    // Handle online/offline status change
    handleOnlineStatus: function(isOnline) {
      this.trackEvent('connectivity_change', { online: isOnline });
      
      if (isOnline) {
        console.log('Back online, syncing analytics data');
        this.syncData();
      } else {
        console.log('Offline, will sync analytics data when back online');
      }
    },
    
    // Initialize dashboard
    initDashboard: function() {
      console.log('Initializing analytics dashboard');
      
      // Get dashboard element
      const dashboardEl = document.getElementById('analytics-dashboard');
      if (!dashboardEl) {
        console.error('Analytics dashboard element not found');
        return;
      }
      
      // Check for dashboard ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const dashboardId = urlParams.get('id') || 'default';
      
      // Load dashboard data
      this.loadDashboard(dashboardId).then(() => {
        // Initialize dashboard controls
        this.initDashboardControls();
        
        // Render the dashboard
        this.renderDashboard();
      }).catch(error => {
        console.error('Error loading dashboard:', error);
        dashboardEl.innerHTML = `
          <div class="analytics-error">
            <h3>Error Loading Dashboard</h3>
            <p>${error.message}</p>
            <button id="retry-dashboard">Retry</button>
          </div>
        `;
        
        document.getElementById('retry-dashboard')?.addEventListener('click', () => {
          this.initDashboard();
        });
      });
    },
    
    // Load dashboard configuration
    loadDashboard: async function(dashboardId) {
      try {
        let dashboard;
        
        // Try to get from server first if online
        if (navigator.onLine) {
          try {
            const response = await fetch(`/api/analytics/dashboards/${dashboardId}`);
            if (response.ok) {
              dashboard = await response.json();
              
              // Store in IndexedDB for offline use
              const transaction = this.state.db.transaction(['analyticsDashboards'], 'readwrite');
              const store = transaction.objectStore('analyticsDashboards');
              store.put(dashboard);
            }
          } catch (error) {
            console.warn('Failed to load dashboard from server:', error);
            // Continue to try loading from IndexedDB
          }
        }
        
        // If not loaded from server, try IndexedDB
        if (!dashboard) {
          dashboard = await new Promise((resolve, reject) => {
            const transaction = this.state.db.transaction(['analyticsDashboards'], 'readonly');
            const store = transaction.objectStore('analyticsDashboards');
            const request = store.get(dashboardId);
            
            request.onsuccess = (event) => {
              if (event.target.result) {
                resolve(event.target.result);
              } else {
                reject(new Error('Dashboard not found: ' + dashboardId));
              }
            };
            
            request.onerror = (event) => {
              reject(new Error('Error loading dashboard: ' + event.target.error));
            };
          });
        }
        
        // Set as current dashboard
        this.state.currentDashboard = dashboard;
        
        // Load data for dashboard metrics
        await this.loadDashboardData();
        
        return dashboard;
      } catch (error) {
        // If not found, create a default dashboard
        if (dashboardId === 'default') {
          return this.createDefaultDashboard();
        }
        
        throw error;
      }
    },
    
    // Create a default dashboard
    createDefaultDashboard: async function() {
      const dashboard = {
        id: 'default',
        title: 'CareUnity Analytics Dashboard',
        description: 'Key metrics and trends for your CareUnity platform',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        layout: 'grid',
        refreshInterval: 30, // minutes
        metrics: [
          {
            id: 'visits_completed',
            type: 'counter',
            title: 'Completed Visits',
            description: 'Total completed visits in the selected period',
            icon: 'check_circle',
            query: { eventType: 'visit_completed' },
            timeframe: 'last_30_days'
          },
          {
            id: 'medication_compliance',
            type: 'gauge',
            title: 'Medication Compliance',
            description: 'Percentage of medications taken as scheduled',
            icon: 'medication',
            query: { eventType: 'medication_recorded' },
            target: 95,
            timeframe: 'last_7_days'
          },
          {
            id: 'active_users',
            type: 'counter',
            title: 'Active Users',
            description: 'Number of unique users in the selected period',
            icon: 'people',
            query: { eventType: 'session_start' },
            timeframe: 'last_7_days'
          },
          {
            id: 'visits_trend',
            type: 'line_chart',
            title: 'Visits Trend',
            description: 'Daily visits over time',
            query: { eventType: 'visit_completed' },
            groupBy: 'day',
            timeframe: 'last_30_days'
          },
          {
            id: 'care_plan_updates',
            type: 'line_chart',
            title: 'Care Plan Updates',
            description: 'Number of care plan updates over time',
            query: { eventType: 'care_plan_updated' },
            groupBy: 'day',
            timeframe: 'last_30_days'
          },
          {
            id: 'error_rate',
            type: 'line_chart',
            title: 'Error Rate',
            description: 'Application errors over time',
            query: { eventType: 'error' },
            groupBy: 'day',
            timeframe: 'last_30_days'
          },
          {
            id: 'page_views',
            type: 'bar_chart',
            title: 'Top Pages',
            description: 'Most viewed pages',
            query: { eventType: 'page_view' },
            groupBy: 'path',
            limit: 10,
            timeframe: 'last_7_days'
          },
          {
            id: 'performance',
            type: 'gauge',
            title: 'Avg Page Load',
            description: 'Average page load time in milliseconds',
            icon: 'speed',
            query: { eventType: 'performance' },
            field: 'data.pageLoad',
            target: 1000, // target is 1 second
            warningThreshold: 2000, // 2 seconds is warning
            criticalThreshold: 3000, // 3 seconds is critical
            timeframe: 'last_7_days'
          }
        ]
      };
      
      // Store in IndexedDB
      const transaction = this.state.db.transaction(['analyticsDashboards'], 'readwrite');
      const store = transaction.objectStore('analyticsDashboards');
      store.put(dashboard);
      
      // Set as current dashboard
      this.state.currentDashboard = dashboard;
      
      // Load data for dashboard metrics
      await this.loadDashboardData();
      
      return dashboard;
    },
    
    // Load data for dashboard metrics
    loadDashboardData: async function() {
      if (!this.state.currentDashboard) {
        throw new Error('No dashboard loaded');
      }
      
      // Process each metric
      for (const metric of this.state.currentDashboard.metrics) {
        try {
          // Get data for this metric
          const data = await this.getMetricData(metric);
          
          // Cache the data
          this.state.cachedData.set(metric.id, {
            data: data,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error(`Error loading data for metric ${metric.id}:`, error);
        }
      }
    },
    
    // Get data for a specific metric
    getMetricData: async function(metric) {
      // Convert timeframe to start/end dates
      const { startDate, endDate } = this.timeframeToDateRange(metric.timeframe);
      
      // Query IndexedDB for the data
      return this.queryAnalyticsData({
        ...metric.query,
        startDate,
        endDate,
        groupBy: metric.groupBy,
        limit: metric.limit,
        field: metric.field
      });
    },
    
    // Query analytics data from IndexedDB
    queryAnalyticsData: function(query) {
      return new Promise((resolve, reject) => {
        try {
          const { eventType, startDate, endDate, groupBy, limit, field } = query;
          
          const transaction = this.state.db.transaction(['analyticsEvents'], 'readonly');
          const store = transaction.objectStore('analyticsEvents');
          const index = store.index('eventType');
          
          // Get events of the specified type
          const request = eventType ? 
            index.getAll(eventType) : 
            store.getAll();
          
          request.onsuccess = (event) => {
            let results = event.target.result;
            
            // Filter by date range
            if (startDate || endDate) {
              results = results.filter(event => {
                const eventDate = new Date(event.timestamp);
                if (startDate && eventDate < startDate) return false;
                if (endDate && eventDate > endDate) return false;
                return true;
              });
            }
            
            // Decompress data if needed
            results.forEach(event => {
              if (event.dataCompressed) {
                event.data = this.decompressData(event.data);
              }
            });
            
            // Process based on metric type
            if (groupBy) {
              const groupedData = this.groupDataBy(results, groupBy, field);
              resolve(groupedData);
            } else if (field) {
              // Extract specific field value
              const fieldValues = results.map(event => {
                return this.getNestedValue(event, field);
              }).filter(value => value !== undefined);
              
              resolve({
                count: fieldValues.length,
                sum: fieldValues.reduce((sum, val) => sum + val, 0),
                avg: fieldValues.length > 0 ? 
                  fieldValues.reduce((sum, val) => sum + val, 0) / fieldValues.length : 0,
                min: fieldValues.length > 0 ? Math.min(...fieldValues) : 0,
                max: fieldValues.length > 0 ? Math.max(...fieldValues) : 0,
                values: fieldValues
              });
            } else {
              // Just return count and data
              resolve({
                count: results.length,
                data: limit ? results.slice(0, limit) : results
              });
            }
          };
          
          request.onerror = (event) => {
            reject(new Error('Error querying analytics data: ' + event.target.error));
          };
        } catch (error) {
          reject(error);
        }
      });
    },
    
    // Group data by a specific field
    groupDataBy: function(data, groupBy, valueField) {
      const groups = {};
      const isDateGroup = ['day', 'week', 'month', 'hour'].includes(groupBy);
      
      data.forEach(item => {
        let groupKey;
        
        if (isDateGroup) {
          // Handle date grouping
          const date = new Date(item.timestamp);
          
          if (groupBy === 'hour') {
            groupKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
          } else if (groupBy === 'day') {
            groupKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          } else if (groupBy === 'week') {
            // Find the first day of the week (Sunday)
            const firstDay = new Date(date);
            const day = date.getDay();
            firstDay.setDate(date.getDate() - day);
            groupKey = `${firstDay.getFullYear()}-${(firstDay.getMonth()+1).toString().padStart(2, '0')}-${firstDay.getDate().toString().padStart(2, '0')}`;
          } else if (groupBy === 'month') {
            groupKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
          }
        } else {
          // Handle other grouping (nested properties)
          groupKey = this.getNestedValue(item, groupBy) || 'unknown';
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            key: groupKey,
            count: 0,
            items: []
          };
          
          if (valueField) {
            groups[groupKey].values = [];
            groups[groupKey].sum = 0;
          }
        }
        
        groups[groupKey].count++;
        groups[groupKey].items.push(item);
        
        if (valueField) {
          const value = this.getNestedValue(item, valueField);
          if (value !== undefined) {
            groups[groupKey].values.push(value);
            groups[groupKey].sum += value;
          }
        }
      });
      
      // Calculate averages if value field specified
      if (valueField) {
        Object.values(groups).forEach(group => {
          group.avg = group.values.length > 0 ? 
            group.sum / group.values.length : 0;
        });
      }
      
      // Sort by date for date groups
      const result = Object.values(groups);
      
      if (isDateGroup) {
        result.sort((a, b) => a.key.localeCompare(b.key));
      } else {
        result.sort((a, b) => b.count - a.count);
      }
      
      return result;
    },
    
    // Get a nested value from an object using dot notation
    getNestedValue: function(obj, path) {
      const keys = path.split('.');
      let value = obj;
      
      for (const key of keys) {
        if (value === null || value === undefined) {
          return undefined;
        }
        value = value[key];
      }
      
      return value;
    },
    
    // Convert a timeframe string to start/end dates
    timeframeToDateRange: function(timeframe) {
      const now = new Date();
      const endDate = new Date(now);
      let startDate;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
          
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(now.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
          
        case 'last_7_days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
          
        case 'last_30_days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
          
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
          
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;
          
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
          
        default:
          // If timeframe is something else, assume it's a custom range or 'all'
          startDate = null;
      }
      
      return { startDate, endDate };
    },
    
    // Initialize dashboard controls
    initDashboardControls: function() {
      // Get dashboard element
      const dashboardEl = document.getElementById('analytics-dashboard');
      if (!dashboardEl) return;
      
      // Add dashboard header
      const dashboard = this.state.currentDashboard;
      
      // Clear existing content
      dashboardEl.innerHTML = '';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'dashboard-header';
      header.innerHTML = `
        <h1>${dashboard.title}</h1>
        <p>${dashboard.description}</p>
        <div class="dashboard-controls">
          <div class="dashboard-timeframe">
            <label for="dashboard-timeframe">Timeframe:</label>
            <select id="dashboard-timeframe">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days" selected>Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
          <button id="refresh-dashboard">Refresh</button>
          <button id="export-dashboard">Export</button>
        </div>
      `;
      
      dashboardEl.appendChild(header);
      
      // Add metrics container
      const metricsContainer = document.createElement('div');
      metricsContainer.className = 'dashboard-metrics';
      metricsContainer.id = 'dashboard-metrics';
      dashboardEl.appendChild(metricsContainer);
      
      // Add event listeners
      document.getElementById('dashboard-timeframe')?.addEventListener('change', (event) => {
        this.updateDashboardTimeframe(event.target.value);
      });
      
      document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
        this.refreshDashboard();
      });
      
      document.getElementById('export-dashboard')?.addEventListener('click', () => {
        this.exportDashboard();
      });
    },
    
    // Render the dashboard
    renderDashboard: function() {
      if (!this.state.currentDashboard) return;
      
      const metricsContainer = document.getElementById('dashboard-metrics');
      if (!metricsContainer) return;
      
      // Clear container
      metricsContainer.innerHTML = '';
      
      // Add each metric
      this.state.currentDashboard.metrics.forEach(metric => {
        // Create metric card
        const metricCard = document.createElement('div');
        metricCard.className = `metric-card metric-type-${metric.type}`;
        metricCard.id = `metric-${metric.id}`;
        
        // Create card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'metric-header';
        cardHeader.innerHTML = `
          <h3>${metric.title}</h3>
          <div class="metric-info" title="${metric.description}">
            <span class="material-icons">info</span>
          </div>
        `;
        
        metricCard.appendChild(cardHeader);
        
        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'metric-body';
        
        // Create content based on metric type
        this.renderMetricContent(cardBody, metric);
        
        metricCard.appendChild(cardBody);
        
        // Add to container
        metricsContainer.appendChild(metricCard);
      });
    },
    
    // Render content for a specific metric
    renderMetricContent: function(container, metric) {
      // Get cached data
      const cachedData = this.state.cachedData.get(metric.id);
      
      if (!cachedData) {
        container.innerHTML = '<div class="metric-loading">Loading data...</div>';
        return;
      }
      
      const data = cachedData.data;
      
      switch (metric.type) {
        case 'counter':
          this.renderCounterMetric(container, metric, data);
          break;
          
        case 'gauge':
          this.renderGaugeMetric(container, metric, data);
          break;
          
        case 'line_chart':
          this.renderLineChartMetric(container, metric, data);
          break;
          
        case 'bar_chart':
          this.renderBarChartMetric(container, metric, data);
          break;
          
        case 'pie_chart':
          this.renderPieChartMetric(container, metric, data);
          break;
          
        case 'table':
          this.renderTableMetric(container, metric, data);
          break;
          
        default:
          container.innerHTML = `<div class="metric-error">Unknown metric type: ${metric.type}</div>`;
      }
    },
    
    // Render a counter metric
    renderCounterMetric: function(container, metric, data) {
      const count = data.count || 0;
      
      let iconHtml = '';
      if (metric.icon) {
        iconHtml = `<span class="material-icons metric-icon">${metric.icon}</span>`;
      }
      
      container.innerHTML = `
        <div class="counter-metric">
          ${iconHtml}
          <div class="counter-value">${count.toLocaleString()}</div>
        </div>
      `;
    },
    
    // Render a gauge metric
    renderGaugeMetric: function(container, metric, data) {
      let value;
      
      if (metric.field) {
        value = data.avg || 0;
      } else {
        value = data.count || 0;
      }
      
      const target = metric.target || 100;
      const percentage = Math.min(Math.round((value / target) * 100), 100);
      
      let gaugeClass = 'gauge-normal';
      let gaugeText = `${percentage}%`;
      
      // Check against thresholds if defined
      if (metric.warningThreshold && metric.criticalThreshold) {
        if (value >= metric.criticalThreshold) {
          gaugeClass = 'gauge-critical';
        } else if (value >= metric.warningThreshold) {
          gaugeClass = 'gauge-warning';
        } else {
          gaugeClass = 'gauge-good';
        }
        
        gaugeText = value.toLocaleString();
      } else {
        // For percentage-based gauges
        if (percentage < 50) {
          gaugeClass = 'gauge-critical';
        } else if (percentage < 75) {
          gaugeClass = 'gauge-warning';
        } else {
          gaugeClass = 'gauge-good';
        }
      }
      
      container.innerHTML = `
        <div class="gauge-metric">
          <div class="gauge-visualization">
            <div class="gauge-background"></div>
            <div class="gauge-fill ${gaugeClass}" style="width: ${percentage}%"></div>
            <div class="gauge-value">${gaugeText}</div>
          </div>
          <div class="gauge-target">Target: ${target.toLocaleString()}</div>
        </div>
      `;
    },
    
    // Render a line chart metric
    renderLineChartMetric: function(container, metric, data) {
      container.innerHTML = '<canvas class="chart-canvas"></canvas>';
      const canvas = container.querySelector('canvas');
      
      const labels = [];
      const values = [];
      
      data.forEach(group => {
        let label = group.key;
        
        // Format dates for better display
        if (metric.groupBy === 'day') {
          const date = new Date(group.key);
          label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else if (metric.groupBy === 'month') {
          const [year, month] = group.key.split('-');
          label = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        }
        
        labels.push(label);
        values.push(metric.field ? group.avg : group.count);
      });
      
      // Create chart using Chart.js if available
      if (window.Chart) {
        this.state.charts[metric.id] = new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: metric.title,
              data: values,
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.1)',
              tension: 0.2,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        // Fallback to simple visualization if Chart.js not loaded
        let html = '<div class="chart-fallback">';
        
        const max = Math.max(...values, 1);
        
        values.forEach((value, index) => {
          const height = (value / max) * 100;
          html += `
            <div class="chart-bar" style="height: ${height}%" title="${labels[index]}: ${value}"></div>
          `;
        });
        
        html += '</div>';
        container.innerHTML = html;
      }
    },
    
    // Render a bar chart metric
    renderBarChartMetric: function(container, metric, data) {
      container.innerHTML = '<canvas class="chart-canvas"></canvas>';
      const canvas = container.querySelector('canvas');
      
      const labels = [];
      const values = [];
      
      data.forEach(group => {
        labels.push(group.key);
        values.push(metric.field ? group.avg : group.count);
      });
      
      // Create chart using Chart.js if available
      if (window.Chart) {
        this.state.charts[metric.id] = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: metric.title,
              data: values,
              backgroundColor: '#4285F4'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        // Fallback to simple visualization if Chart.js not loaded
        let html = '<div class="chart-fallback">';
        
        const max = Math.max(...values, 1);
        
        values.forEach((value, index) => {
          const width = (value / max) * 100;
          html += `
            <div class="chart-row">
              <div class="chart-label">${labels[index]}</div>
              <div class="chart-bar-container">
                <div class="chart-bar" style="width: ${width}%" title="${value}"></div>
              </div>
              <div class="chart-value">${value}</div>
            </div>
          `;
        });
        
        html += '</div>';
        container.innerHTML = html;
      }
    },
    
    // Render a pie chart metric
    renderPieChartMetric: function(container, metric, data) {
      container.innerHTML = '<canvas class="chart-canvas"></canvas>';
      const canvas = container.querySelector('canvas');
      
      const labels = [];
      const values = [];
      
      data.forEach(group => {
        labels.push(group.key);
        values.push(metric.field ? group.avg : group.count);
      });
      
      // Create chart using Chart.js if available
      if (window.Chart) {
        const colors = [
          '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
          '#5E35B1', '#D81B60', '#039BE5', '#689F38'
        ];
        
        this.state.charts[metric.id] = new Chart(canvas, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      } else {
        // Fallback to simple visualization if Chart.js not loaded
        let html = '<div class="chart-fallback">';
        
        const total = values.reduce((sum, val) => sum + val, 0);
        
        values.forEach((value, index) => {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          html += `
            <div class="chart-row">
              <div class="chart-color-box" style="background-color: var(--color-${index % 8})"></div>
              <div class="chart-label">${labels[index]}</div>
              <div class="chart-value">${percentage}%</div>
            </div>
          `;
        });
        
        html += '</div>';
        container.innerHTML = html;
      }
    },
    
    // Render a table metric
    renderTableMetric: function(container, metric, data) {
      let html = '<div class="table-container"><table class="metric-table">';
      
      // Add header
      html += '<thead><tr>';
      html += `<th>Name</th>`;
      html += `<th>Value</th>`;
      html += '</tr></thead>';
      
      // Add body
      html += '<tbody>';
      data.forEach(group => {
        html += '<tr>';
        html += `<td>${group.key}</td>`;
        html += `<td>${metric.field ? group.avg.toFixed(2) : group.count.toLocaleString()}</td>`;
        html += '</tr>';
      });
      html += '</tbody>';
      
      html += '</table></div>';
      container.innerHTML = html;
    },
    
    // Update dashboard timeframe
    updateDashboardTimeframe: async function(timeframe) {
      if (!this.state.currentDashboard) return;
      
      // Update metrics with new timeframe
      for (const metric of this.state.currentDashboard.metrics) {
        try {
          // Convert timeframe to date range
          const { startDate, endDate } = this.timeframeToDateRange(timeframe);
          
          // Query data with new timeframe
          const data = await this.queryAnalyticsData({
            ...metric.query,
            startDate,
            endDate,
            groupBy: metric.groupBy,
            limit: metric.limit,
            field: metric.field
          });
          
          // Update cached data
          this.state.cachedData.set(metric.id, {
            data: data,
            timestamp: Date.now()
          });
          
          // Update the metric visualization
          const metricBody = document.querySelector(`#metric-${metric.id} .metric-body`);
          if (metricBody) {
            this.renderMetricContent(metricBody, metric);
          }
        } catch (error) {
          console.error(`Error updating metric ${metric.id}:`, error);
        }
      }
    },
    
    // Refresh the dashboard
    refreshDashboard: async function() {
      await this.loadDashboardData();
      this.renderDashboard();
    },
    
    // Export dashboard data
    exportDashboard: function() {
      if (!this.state.currentDashboard) return;
      
      // Prepare data for export
      const exportData = {
        dashboard: this.state.currentDashboard,
        data: {},
        exportDate: new Date().toISOString(),
        exportedBy: this.state.user?.id || 'anonymous'
      };
      
      // Add data for each metric
      this.state.currentDashboard.metrics.forEach(metric => {
        const cachedData = this.state.cachedData.get(metric.id);
        if (cachedData) {
          exportData.data[metric.id] = cachedData.data;
        }
      });
      
      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `careunity-dashboard-${this.state.currentDashboard.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    
    // Helper: Generate a session ID
    generateSessionId: function() {
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    },
    
    // Helper: Generate an event ID
    generateEventId: function() {
      return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    },
    
    // Helper: Collect device information
    collectDeviceInfo: function() {
      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio || 1,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // Add connection info if available
      if (navigator.connection) {
        info.connection = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData
        };
      }
      
      return info;
    },
    
    // Helper: Get device ID
    getDeviceId: function() {
      // Try to get from storage
      let deviceId = localStorage.getItem('careunity_device_id');
      
      // Generate if not found
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('careunity_device_id', deviceId);
      }
      
      return deviceId;
    },
    
    // Helper: Simple data compression using base64
    compressData: function(data) {
      try {
        if (!data) return data;
        const jsonString = JSON.stringify(data);
        
        // In a real app, use a proper compression library
        // This is a simple placeholder using base64
        return btoa(jsonString);
      } catch (error) {
        console.error('Error compressing data:', error);
        return data;
      }
    },
    
    // Helper: Data decompression
    decompressData: function(compressedData) {
      try {
        if (!compressedData) return compressedData;
        
        // In a real app, use a proper decompression library
        // This is a simple placeholder using base64
        const jsonString = atob(compressedData);
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Error decompressing data:', error);
        return compressedData;
      }
    },
    
    // Helper: Hash a value for anonymization
    hashValue: function(value) {
      if (!value) return value;
      
      // Simple hash function for demonstration
      // In a real app, use a cryptographic hash function
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return 'hash_' + Math.abs(hash).toString(16);
    }
  };
  
  // Initialize and expose globally
  window.CareUnityAnalytics = CareUnityAnalytics;
  
  // Auto-initialize when document is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => CareUnityAnalytics.init(), 1000);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => CareUnityAnalytics.init(), 1000);
    });
  }
})();
