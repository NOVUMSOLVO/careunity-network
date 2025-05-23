/**
 * CareUnity Care Plan Monitoring
 * 
 * This module provides automated monitoring capabilities for care plans,
 * including alerts, trend analysis, and anomaly detection.
 */

(function() {
  // Initialize the care plan monitoring system
  const CareUnityCarePlanMonitoring = {
    // Configuration
    config: {
      pollingInterval: 5 * 60 * 1000, // Check every 5 minutes
      alertThresholds: {
        vital_signs: {
          temperature: { min: 35.5, max: 38.3, unit: '°C', urgent: { min: 35.0, max: 39.0 } },
          heart_rate: { min: 60, max: 100, unit: 'bpm', urgent: { min: 50, max: 120 } },
          blood_pressure_systolic: { min: 90, max: 140, unit: 'mmHg', urgent: { min: 80, max: 160 } },
          blood_pressure_diastolic: { min: 60, max: 90, unit: 'mmHg', urgent: { min: 50, max: 100 } },
          oxygen_saturation: { min: 95, max: 100, unit: '%', urgent: { min: 90, max: 100 } },
          respiratory_rate: { min: 12, max: 20, unit: 'breaths/min', urgent: { min: 10, max: 30 } }
        },
        medication_compliance: {
          threshold: 80, // Percentage
          urgent: 60
        },
        missed_visits: {
          threshold: 1,
          urgent: 2
        },
        task_completion: {
          threshold: 70, // Percentage
          urgent: 50
        }
      },
      predictiveModelEnabled: true,
      anomalyDetectionEnabled: true
    },
    
    // Current state
    state: {
      monitoring: false,
      activePlans: [],
      activeAlerts: [],
      lastCheck: null,
      predictionCache: new Map(),
      db: null,
      timerId: null
    },
    
    // Initialize the monitoring system
    init: async function() {
      console.log('Initializing care plan monitoring');
      
      try {
        // Open the database
        this.state.db = await this.openDatabase();
        
        // Load configuration from server or IndexedDB
        await this.loadConfiguration();
        
        // Start monitoring if we have active care plans
        await this.refreshActivePlans();
        
        // Register event listeners
        this.registerEventListeners();
        
        // Start monitoring loop
        this.startMonitoring();
        
        // Initial check
        await this.checkCarePlans();
        
        return this;
      } catch (error) {
        console.error('Failed to initialize care plan monitoring:', error);
        return null;
      }
    },
    
    // Open the database
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
          if (!db.objectStoreNames.contains('carePlanMonitoring')) {
            db.createObjectStore('carePlanMonitoring', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('carePlanAlerts')) {
            db.createObjectStore('carePlanAlerts', { keyPath: 'id', autoIncrement: true });
          }
        };
      });
    },
    
    // Load configuration
    loadConfiguration: async function() {
      try {
        // Try to get from server first
        if (navigator.onLine) {
          const response = await fetch('/api/care-plans/monitoring/config');
          if (response.ok) {
            const serverConfig = await response.json();
            this.config = { ...this.config, ...serverConfig };
            
            // Store in IndexedDB for offline use
            await this.storeInDB('config', 'carePlanMonitoring', this.config);
            
            return;
          }
        }
        
        // Fall back to stored config
        const storedConfig = await this.getFromDB('config', 'carePlanMonitoring');
        if (storedConfig) {
          this.config = { ...this.config, ...storedConfig };
        }
      } catch (error) {
        console.error('Error loading monitoring configuration:', error);
        // Continue with default config
      }
    },
    
    // Register event listeners
    registerEventListeners: function() {
      // Listen for care plan updates
      document.addEventListener('carePlanUpdated', (event) => {
        this.handleCarePlanUpdate(event.detail.carePlan);
      });
      
      // Listen for new measurements/recordings
      document.addEventListener('measurementRecorded', (event) => {
        this.handleNewMeasurement(event.detail);
      });
      
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.handleOnlineStatus(true);
      });
      
      window.addEventListener('offline', () => {
        this.handleOnlineStatus(false);
      });
      
      // Listen for navigation (to update UI if needed)
      window.addEventListener('popstate', () => {
        this.updateAlertsUI();
      });
      
      // Listen for alert response events
      document.addEventListener('alertResponded', (event) => {
        this.handleAlertResponse(event.detail);
      });
    },
    
    // Start the monitoring loop
    startMonitoring: function() {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
      }
      
      this.state.monitoring = true;
      this.state.timerId = setInterval(() => {
        this.checkCarePlans().catch(error => {
          console.error('Error checking care plans:', error);
        });
      }, this.config.pollingInterval);
      
      console.log('Care plan monitoring started');
    },
    
    // Stop monitoring
    stopMonitoring: function() {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
        this.state.timerId = null;
      }
      
      this.state.monitoring = false;
      console.log('Care plan monitoring stopped');
    },
    
    // Refresh the list of active care plans
    refreshActivePlans: async function() {
      try {
        // Clear current list
        this.state.activePlans = [];
        
        // Try to get from server if online
        if (navigator.onLine) {
          const response = await fetch('/api/care-plans/active');
          if (response.ok) {
            const activePlans = await response.json();
            this.state.activePlans = activePlans;
            
            // Store in IndexedDB for offline use
            await this.storeInDB('activePlans', 'carePlanMonitoring', activePlans);
            return;
          }
        }
        
        // Fall back to stored plans
        const storedPlans = await this.getFromDB('activePlans', 'carePlanMonitoring');
        if (storedPlans) {
          this.state.activePlans = storedPlans;
        }
      } catch (error) {
        console.error('Error refreshing active care plans:', error);
      }
    },
    
    // Check all care plans for conditions that need alerts
    checkCarePlans: async function() {
      if (!this.state.monitoring || this.state.activePlans.length === 0) {
        return;
      }
      
      console.log(`Checking ${this.state.activePlans.length} active care plans`);
      this.state.lastCheck = new Date();
      
      const newAlerts = [];
      
      // Check each care plan
      for (const plan of this.state.activePlans) {
        try {
          // Get latest data for this plan
          const planData = await this.getCarePlanData(plan.id);
          if (!planData) continue;
          
          // Check vital signs
          const vitalAlerts = this.checkVitalSigns(plan, planData);
          if (vitalAlerts.length > 0) {
            newAlerts.push(...vitalAlerts);
          }
          
          // Check medication compliance
          const medAlerts = this.checkMedicationCompliance(plan, planData);
          if (medAlerts.length > 0) {
            newAlerts.push(...medAlerts);
          }
          
          // Check missed visits
          const visitAlerts = this.checkMissedVisits(plan, planData);
          if (visitAlerts.length > 0) {
            newAlerts.push(...visitAlerts);
          }
          
          // Check task completion
          const taskAlerts = this.checkTaskCompletion(plan, planData);
          if (taskAlerts.length > 0) {
            newAlerts.push(...taskAlerts);
          }
          
          // Run anomaly detection if enabled
          if (this.config.anomalyDetectionEnabled) {
            const anomalyAlerts = await this.detectAnomalies(plan, planData);
            if (anomalyAlerts.length > 0) {
              newAlerts.push(...anomalyAlerts);
            }
          }
          
          // Run predictive model if enabled
          if (this.config.predictiveModelEnabled) {
            const predictionAlerts = await this.generatePredictions(plan, planData);
            if (predictionAlerts.length > 0) {
              newAlerts.push(...predictionAlerts);
            }
          }
        } catch (error) {
          console.error(`Error checking care plan ${plan.id}:`, error);
        }
      }
      
      // Process any new alerts
      if (newAlerts.length > 0) {
        await this.processNewAlerts(newAlerts);
      }
    },
    
    // Get latest data for a care plan
    getCarePlanData: async function(planId) {
      try {
        // Try to get from server if online
        if (navigator.onLine) {
          const response = await fetch(`/api/care-plans/${planId}/monitoring-data`);
          if (response.ok) {
            const data = await response.json();
            
            // Store in IndexedDB for offline use
            await this.storeInDB(`plan_${planId}`, 'carePlanMonitoring', data);
            
            return data;
          }
        }
        
        // Fall back to stored data
        return await this.getFromDB(`plan_${planId}`, 'carePlanMonitoring');
      } catch (error) {
        console.error(`Error getting data for care plan ${planId}:`, error);
        return null;
      }
    },
    
    // Check vital signs against thresholds
    checkVitalSigns: function(plan, data) {
      const alerts = [];
      const thresholds = this.config.alertThresholds.vital_signs;
      
      if (!data.vitalSigns || data.vitalSigns.length === 0) {
        return alerts;
      }
      
      // Get most recent measurements
      const latestVitals = {};
      data.vitalSigns.forEach(measurement => {
        const type = measurement.type;
        if (!latestVitals[type] || new Date(measurement.timestamp) > new Date(latestVitals[type].timestamp)) {
          latestVitals[type] = measurement;
        }
      });
      
      // Check each vital sign against thresholds
      Object.entries(latestVitals).forEach(([type, measurement]) => {
        const threshold = thresholds[type];
        if (!threshold) return; // Skip if no threshold defined
        
        const value = measurement.value;
        let alert = null;
        
        // Check against urgent thresholds first
        if (threshold.urgent && (value < threshold.urgent.min || value > threshold.urgent.max)) {
          alert = {
            id: `vital_${plan.id}_${type}_${Date.now()}`,
            carePlanId: plan.id,
            patientId: plan.patientId,
            type: 'vital_sign',
            subType: type,
            level: 'urgent',
            message: `Urgent: ${type.replace('_', ' ')} is ${value} ${threshold.unit} (outside safe range)`,
            data: {
              value,
              unit: threshold.unit,
              timestamp: measurement.timestamp,
              min: threshold.urgent.min,
              max: threshold.urgent.max
            },
            timestamp: new Date().toISOString(),
            status: 'new'
          };
        }
        // Then check against regular thresholds
        else if (value < threshold.min || value > threshold.max) {
          alert = {
            id: `vital_${plan.id}_${type}_${Date.now()}`,
            carePlanId: plan.id,
            patientId: plan.patientId,
            type: 'vital_sign',
            subType: type,
            level: 'warning',
            message: `${type.replace('_', ' ')} is ${value} ${threshold.unit} (outside normal range)`,
            data: {
              value,
              unit: threshold.unit,
              timestamp: measurement.timestamp,
              min: threshold.min,
              max: threshold.max
            },
            timestamp: new Date().toISOString(),
            status: 'new'
          };
        }
        
        if (alert) {
          alerts.push(alert);
        }
      });
      
      return alerts;
    },
    
    // Check medication compliance
    checkMedicationCompliance: function(plan, data) {
      const alerts = [];
      
      if (!data.medications || data.medications.length === 0) {
        return alerts;
      }
      
      // Calculate compliance percentage
      let totalScheduled = 0;
      let totalTaken = 0;
      
      data.medications.forEach(med => {
        if (med.status === 'scheduled') totalScheduled++;
        if (med.status === 'taken') totalTaken++;
      });
      
      if (totalScheduled === 0) {
        return alerts;
      }
      
      const compliancePercent = (totalTaken / totalScheduled) * 100;
      
      // Generate alerts based on thresholds
      const threshold = this.config.alertThresholds.medication_compliance;
      
      if (compliancePercent < threshold.urgent) {
        alerts.push({
          id: `med_compliance_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'medication_compliance',
          level: 'urgent',
          message: `Urgent: Medication compliance critically low at ${Math.round(compliancePercent)}%`,
          data: {
            compliancePercent,
            totalScheduled,
            totalTaken,
            threshold: threshold.urgent
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      } else if (compliancePercent < threshold.threshold) {
        alerts.push({
          id: `med_compliance_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'medication_compliance',
          level: 'warning',
          message: `Medication compliance low at ${Math.round(compliancePercent)}%`,
          data: {
            compliancePercent,
            totalScheduled,
            totalTaken,
            threshold: threshold.threshold
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      }
      
      return alerts;
    },
    
    // Check missed visits
    checkMissedVisits: function(plan, data) {
      const alerts = [];
      
      if (!data.visits || data.visits.length === 0) {
        return alerts;
      }
      
      // Count missed visits in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const missedVisits = data.visits.filter(visit => 
        visit.status === 'missed' && 
        new Date(visit.scheduledDate) >= oneWeekAgo
      );
      
      const missedCount = missedVisits.length;
      
      // Generate alerts based on thresholds
      const threshold = this.config.alertThresholds.missed_visits;
      
      if (missedCount >= threshold.urgent) {
        alerts.push({
          id: `missed_visits_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'missed_visits',
          level: 'urgent',
          message: `Urgent: ${missedCount} visits missed in the last week`,
          data: {
            missedCount,
            threshold: threshold.urgent,
            missedVisits: missedVisits
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      } else if (missedCount >= threshold.threshold) {
        alerts.push({
          id: `missed_visits_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'missed_visits',
          level: 'warning',
          message: `${missedCount} visits missed in the last week`,
          data: {
            missedCount,
            threshold: threshold.threshold,
            missedVisits: missedVisits
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      }
      
      return alerts;
    },
    
    // Check task completion
    checkTaskCompletion: function(plan, data) {
      const alerts = [];
      
      if (!data.tasks || data.tasks.length === 0) {
        return alerts;
      }
      
      // Calculate task completion percentage
      let totalTasks = 0;
      let completedTasks = 0;
      
      const now = new Date();
      
      data.tasks.forEach(task => {
        if (new Date(task.dueDate) <= now) {
          totalTasks++;
          if (task.status === 'completed') completedTasks++;
        }
      });
      
      if (totalTasks === 0) {
        return alerts;
      }
      
      const completionPercent = (completedTasks / totalTasks) * 100;
      
      // Generate alerts based on thresholds
      const threshold = this.config.alertThresholds.task_completion;
      
      if (completionPercent < threshold.urgent) {
        alerts.push({
          id: `task_completion_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'task_completion',
          level: 'urgent',
          message: `Urgent: Task completion critically low at ${Math.round(completionPercent)}%`,
          data: {
            completionPercent,
            totalTasks,
            completedTasks,
            threshold: threshold.urgent
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      } else if (completionPercent < threshold.threshold) {
        alerts.push({
          id: `task_completion_${plan.id}_${Date.now()}`,
          carePlanId: plan.id,
          patientId: plan.patientId,
          type: 'task_completion',
          level: 'warning',
          message: `Task completion low at ${Math.round(completionPercent)}%`,
          data: {
            completionPercent,
            totalTasks,
            completedTasks,
            threshold: threshold.threshold
          },
          timestamp: new Date().toISOString(),
          status: 'new'
        });
      }
      
      return alerts;
    },
    
    // Detect anomalies in care plan data
    detectAnomalies: async function(plan, data) {
      const alerts = [];
      
      // Check if we have enough data
      if (!data.vitalSigns || data.vitalSigns.length < 5) {
        return alerts;
      }
      
      // Group by vital sign type
      const vitalsByType = {};
      data.vitalSigns.forEach(vital => {
        if (!vitalsByType[vital.type]) {
          vitalsByType[vital.type] = [];
        }
        vitalsByType[vital.type].push(vital);
      });
      
      // Look for anomalies in each vital sign type
      for (const [type, vitals] of Object.entries(vitalsByType)) {
        // Need at least 5 measurements
        if (vitals.length < 5) continue;
        
        // Sort by timestamp
        vitals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Get just the values
        const values = vitals.map(v => v.value);
        
        // Calculate mean and standard deviation
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Check last value for anomaly (more than 2 std devs from mean)
        const latestValue = values[values.length - 1];
        const latestTimestamp = vitals[vitals.length - 1].timestamp;
        const zScore = Math.abs(latestValue - mean) / stdDev;
        
        if (zScore > 2) {
          alerts.push({
            id: `anomaly_${plan.id}_${type}_${Date.now()}`,
            carePlanId: plan.id,
            patientId: plan.patientId,
            type: 'anomaly',
            subType: type,
            level: zScore > 3 ? 'urgent' : 'warning',
            message: `${zScore > 3 ? 'Urgent: ' : ''}Unusual ${type.replace('_', ' ')} reading detected`,
            data: {
              value: latestValue,
              timestamp: latestTimestamp,
              mean,
              stdDev,
              zScore,
              history: vitals.slice(-5) // Include last 5 measurements
            },
            timestamp: new Date().toISOString(),
            status: 'new'
          });
        }
      }
      
      return alerts;
    },
    
    // Generate predictions based on care plan data
    generatePredictions: async function(plan, data) {
      const alerts = [];
      
      // Skip if already predicted recently for this plan
      const cacheKey = `prediction_${plan.id}`;
      const cachedPrediction = this.state.predictionCache.get(cacheKey);
      
      if (cachedPrediction && (Date.now() - cachedPrediction.timestamp) < 24 * 60 * 60 * 1000) {
        return alerts;
      }
      
      // Simple predictive model based on trends
      // In a real app, this would use ML models
      
      try {
        // Look for declining trends in vital signs
        const vitalTrends = this.analyzeVitalSignTrends(data.vitalSigns);
        
        for (const [type, trend] of Object.entries(vitalTrends)) {
          if (trend.direction === 'declining' && trend.significance > 0.7) {
            alerts.push({
              id: `prediction_${plan.id}_${type}_${Date.now()}`,
              carePlanId: plan.id,
              patientId: plan.patientId,
              type: 'prediction',
              subType: type,
              level: trend.significance > 0.9 ? 'warning' : 'info',
              message: `${type.replace('_', ' ')} shows a declining trend`,
              data: {
                trend: trend,
                recommendation: `Consider adjusting care plan to address ${type.replace('_', ' ')}`
              },
              timestamp: new Date().toISOString(),
              status: 'new'
            });
          }
        }
        
        // Cache this prediction
        this.state.predictionCache.set(cacheKey, {
          timestamp: Date.now(),
          predictions: alerts
        });
      } catch (error) {
        console.error('Error generating predictions:', error);
      }
      
      return alerts;
    },
    
    // Analyze trends in vital signs
    analyzeVitalSignTrends: function(vitalSigns) {
      if (!vitalSigns || vitalSigns.length === 0) {
        return {};
      }
      
      const results = {};
      
      // Group by type
      const byType = {};
      vitalSigns.forEach(vital => {
        if (!byType[vital.type]) {
          byType[vital.type] = [];
        }
        byType[vital.type].push(vital);
      });
      
      // Analyze each type
      for (const [type, vitals] of Object.entries(byType)) {
        // Need at least 3 measurements
        if (vitals.length < 3) continue;
        
        // Sort by timestamp
        vitals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Simple linear regression
        const n = vitals.length;
        const x = Array.from({length: n}, (_, i) => i); // 0, 1, 2, ...
        const y = vitals.map(v => v.value);
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + (val * y[i]), 0);
        const sumXX = x.reduce((sum, val) => sum + (val * val), 0);
        
        // Calculate slope
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        // Determine direction and significance
        let direction;
        if (slope > 0.1) direction = 'improving';
        else if (slope < -0.1) direction = 'declining';
        else direction = 'stable';
        
        // Calculate R-squared to measure significance
        const meanY = sumY / n;
        const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
        const ssResidual = y.reduce((sum, val, i) => {
          const predicted = slope * x[i] + (sumY - slope * sumX) / n;
          return sum + Math.pow(val - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);
        
        results[type] = {
          direction,
          slope,
          significance: Math.abs(rSquared),
          data: vitals.slice(-5) // Last 5 data points
        };
      }
      
      return results;
    },
    
    // Process new alerts
    processNewAlerts: async function(newAlerts) {
      try {
        // Store alerts in IndexedDB
        const transaction = this.state.db.transaction(['carePlanAlerts'], 'readwrite');
        const store = transaction.objectStore('carePlanAlerts');
        
        for (const alert of newAlerts) {
          store.add(alert);
        }
        
        // Add to active alerts
        this.state.activeAlerts = [...this.state.activeAlerts, ...newAlerts];
        
        // Try to send to server if online
        if (navigator.onLine) {
          await this.sendAlertsToServer(newAlerts);
        }
        
        // Update UI
        this.updateAlertsUI();
        
        // Trigger notifications for urgent alerts
        const urgentAlerts = newAlerts.filter(alert => alert.level === 'urgent');
        if (urgentAlerts.length > 0) {
          this.notifyUrgentAlerts(urgentAlerts);
        }
        
        // Dispatch event for new alerts
        document.dispatchEvent(new CustomEvent('carePlanAlertsUpdated', {
          detail: { alerts: newAlerts }
        }));
      } catch (error) {
        console.error('Error processing new alerts:', error);
      }
    },
    
    // Send alerts to server
    sendAlertsToServer: async function(alerts) {
      try {
        const response = await fetch('/api/care-plans/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ alerts })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        console.log(`Sent ${alerts.length} alerts to server`);
      } catch (error) {
        console.error('Error sending alerts to server:', error);
        
        // Queue for background sync
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-care-plan-monitoring');
        });
      }
    },
    
    // Update the alerts UI
    updateAlertsUI: function() {
      // Find alert containers
      const alertContainers = document.querySelectorAll('.care-plan-alerts-container');
      if (alertContainers.length === 0) return;
      
      alertContainers.forEach(container => {
        // Get care plan ID if specified
        const carePlanId = container.dataset.carePlanId;
        
        // Filter alerts for this container
        let containerAlerts;
        if (carePlanId) {
          containerAlerts = this.state.activeAlerts.filter(a => a.carePlanId === carePlanId);
        } else {
          containerAlerts = [...this.state.activeAlerts];
        }
        
        // Sort by urgency and timestamp
        containerAlerts.sort((a, b) => {
          if (a.level === 'urgent' && b.level !== 'urgent') return -1;
          if (a.level !== 'urgent' && b.level === 'urgent') return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Create HTML for alerts
        let html = '';
        if (containerAlerts.length === 0) {
          html = '<div class="care-plan-no-alerts">No active alerts</div>';
        } else {
          html = '<div class="care-plan-alerts-list">';
          containerAlerts.forEach(alert => {
            html += `
              <div class="care-plan-alert alert-${alert.level}" data-alert-id="${alert.id}">
                <div class="alert-header">
                  <span class="alert-type">${alert.type.replace('_', ' ')}</span>
                  <span class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-actions">
                  <button class="alert-action-acknowledge">Acknowledge</button>
                  <button class="alert-action-view">View Details</button>
                </div>
              </div>
            `;
          });
          html += '</div>';
        }
        
        // Update container
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelectorAll('.alert-action-acknowledge').forEach(button => {
          button.addEventListener('click', event => {
            const alertDiv = event.target.closest('.care-plan-alert');
            const alertId = alertDiv.dataset.alertId;
            this.acknowledgeAlert(alertId);
          });
        });
        
        container.querySelectorAll('.alert-action-view').forEach(button => {
          button.addEventListener('click', event => {
            const alertDiv = event.target.closest('.care-plan-alert');
            const alertId = alertDiv.dataset.alertId;
            this.viewAlertDetails(alertId);
          });
        });
      });
    },
    
    // Notify for urgent alerts
    notifyUrgentAlerts: function(urgentAlerts) {
      if (!('Notification' in window)) {
        return;
      }
      
      // Request permission if needed
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
        return;
      }
      
      // Show notifications for each alert
      urgentAlerts.forEach(alert => {
        const notification = new Notification('CareUnity Alert', {
          body: alert.message,
          icon: '/icon-192.png',
          tag: `careunity-alert-${alert.id}`,
          requireInteraction: true,
          data: {
            alertId: alert.id,
            carePlanId: alert.carePlanId
          }
        });
        
        notification.onclick = function() {
          window.focus();
          CareUnityCarePlanMonitoring.viewAlertDetails(this.data.alertId);
        };
      });
      
      // Also notify via service worker for better notifications if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CARE_PLAN_URGENT_ALERTS',
          alerts: urgentAlerts
        });
      }
    },
    
    // Acknowledge an alert
    acknowledgeAlert: async function(alertId) {
      try {
        // Find the alert
        const alertIndex = this.state.activeAlerts.findIndex(a => a.id === alertId);
        if (alertIndex === -1) return;
        
        const alert = this.state.activeAlerts[alertIndex];
        
        // Update status
        alert.status = 'acknowledged';
        alert.acknowledgedAt = new Date().toISOString();
        
        // Update in IndexedDB
        const transaction = this.state.db.transaction(['carePlanAlerts'], 'readwrite');
        const store = transaction.objectStore('carePlanAlerts');
        store.put(alert);
        
        // Remove from active alerts
        this.state.activeAlerts.splice(alertIndex, 1);
        
        // Update UI
        this.updateAlertsUI();
        
        // Send to server if online
        if (navigator.onLine) {
          await fetch(`/api/care-plans/alerts/${alertId}/acknowledge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timestamp: alert.acknowledgedAt })
          });
        } else {
          // Queue for sync
          const transaction = this.state.db.transaction(['pendingSync'], 'readwrite');
          const store = transaction.objectStore('pendingSync');
          
          store.add({
            id: `acknowledge_alert_${alertId}_${Date.now()}`,
            type: 'carePlanAlerts',
            action: 'acknowledge',
            data: {
              alertId,
              acknowledgedAt: alert.acknowledgedAt
            },
            timestamp: new Date().toISOString(),
            attempts: 0
          });
        }
      } catch (error) {
        console.error('Error acknowledging alert:', error);
      }
    },
    
    // View alert details
    viewAlertDetails: function(alertId) {
      // Find the alert
      const alert = this.state.activeAlerts.find(a => a.id === alertId);
      if (!alert) return;
      
      // Create modal for alert details
      const modal = document.createElement('div');
      modal.className = 'care-plan-alert-modal';
      modal.innerHTML = `
        <div class="alert-modal-content">
          <div class="alert-modal-header">
            <h3>Alert Details</h3>
            <button class="alert-modal-close">&times;</button>
          </div>
          <div class="alert-modal-body">
            <div class="alert-detail">
              <strong>Type:</strong> ${alert.type.replace('_', ' ')}
              ${alert.subType ? `(${alert.subType.replace('_', ' ')})` : ''}
            </div>
            <div class="alert-detail">
              <strong>Level:</strong> ${alert.level}
            </div>
            <div class="alert-detail">
              <strong>Message:</strong> ${alert.message}
            </div>
            <div class="alert-detail">
              <strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}
            </div>
            <div class="alert-detail-data">
              <h4>Alert Data</h4>
              <pre>${JSON.stringify(alert.data, null, 2)}</pre>
            </div>
          </div>
          <div class="alert-modal-footer">
            <button class="alert-modal-acknowledge">Acknowledge</button>
            <button class="alert-modal-view-plan">View Care Plan</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners
      const closeButton = modal.querySelector('.alert-modal-close');
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      const acknowledgeButton = modal.querySelector('.alert-modal-acknowledge');
      acknowledgeButton.addEventListener('click', () => {
        this.acknowledgeAlert(alertId);
        document.body.removeChild(modal);
      });
      
      const viewPlanButton = modal.querySelector('.alert-modal-view-plan');
      viewPlanButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        window.location.href = `/advanced-care-plan.html?id=${alert.carePlanId}`;
      });
    },
    
    // Helper: Store in IndexedDB
    storeInDB: function(id, storeName, data) {
      return new Promise((resolve, reject) => {
        const transaction = this.state.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.put({
          id: id,
          data: data,
          timestamp: Date.now()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    },
    
    // Helper: Get from IndexedDB
    getFromDB: function(id, storeName) {
      return new Promise((resolve, reject) => {
        const transaction = this.state.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          if (event.target.result) {
            resolve(event.target.result.data);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = (event) => reject(event.target.error);
      });
    },
    
    // Handle care plan update
    handleCarePlanUpdate: function(carePlan) {
      // Refresh active plans
      this.refreshActivePlans().then(() => {
        // Trigger immediate check for this plan
        if (carePlan && carePlan.id) {
          this.checkSpecificCarePlan(carePlan.id);
        }
      });
    },
    
    // Handle new measurement recorded
    handleNewMeasurement: function(measurement) {
      // Trigger check for the related care plan
      if (measurement && measurement.carePlanId) {
        this.checkSpecificCarePlan(measurement.carePlanId);
      }
    },
    
    // Handle online/offline status change
    handleOnlineStatus: function(isOnline) {
      if (isOnline) {
        console.log('Back online, syncing care plan monitoring data');
        
        // Trigger sync with server
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-care-plan-monitoring');
        });
      } else {
        console.log('Offline, continuing to monitor with local data');
      }
    },
    
    // Handle alert response
    handleAlertResponse: function(response) {
      // Update alert status based on response
      this.acknowledgeAlert(response.alertId);
      
      // Trigger actions based on the response
      if (response.action === 'adjust_plan') {
        // Redirect to care plan editor
        window.location.href = `/advanced-care-plan.html?id=${response.carePlanId}&edit=true`;
      } else if (response.action === 'schedule_visit') {
        // Redirect to visit scheduler
        window.location.href = `/scheduling.html?patientId=${response.patientId}`;
      }
    },
    
    // Check a specific care plan
    checkSpecificCarePlan: async function(planId) {
      try {
        // Find the plan
        const plan = this.state.activePlans.find(p => p.id === planId);
        if (!plan) return;
        
        // Get latest data for this plan
        const planData = await this.getCarePlanData(planId);
        if (!planData) return;
        
        console.log(`Checking specific care plan ${planId}`);
        
        const alerts = [];
        
        // Run all checks
        alerts.push(...this.checkVitalSigns(plan, planData));
        alerts.push(...this.checkMedicationCompliance(plan, planData));
        alerts.push(...this.checkMissedVisits(plan, planData));
        alerts.push(...this.checkTaskCompletion(plan, planData));
        
        if (this.config.anomalyDetectionEnabled) {
          alerts.push(...await this.detectAnomalies(plan, planData));
        }
        
        if (this.config.predictiveModelEnabled) {
          alerts.push(...await this.generatePredictions(plan, planData));
        }
        
        // Process any new alerts
        if (alerts.length > 0) {
          await this.processNewAlerts(alerts);
        }
      } catch (error) {
        console.error(`Error checking care plan ${planId}:`, error);
      }
    }
  };
  
  // Initialize and expose globally
  window.CareUnityCarePlanMonitoring = CareUnityCarePlanMonitoring;
  
  // Auto-initialize when document is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => CareUnityCarePlanMonitoring.init(), 1000);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => CareUnityCarePlanMonitoring.init(), 1000);
    });
  }
})();
