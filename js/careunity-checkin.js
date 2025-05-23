/**
 * CareUnity Check-in Manager
 * Handles visit check-ins, checkouts, and attendance tracking
 */

class CheckInManager {
  constructor(db) {
    this.db = db;
    this.currentVisit = null;
    this.locationEnabled = false;
    this.watchId = null;
    this.currentLocation = null;
  }

  /**
   * Initialize the check-in manager
   * @returns {Promise<void>}
   */
  async init() {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
      try {
        // Request permission by getting the position once
        await this.getCurrentPosition();
        this.locationEnabled = true;
        console.log('[CheckInManager] Geolocation initialized successfully');
      } catch (error) {
        console.warn('[CheckInManager] Geolocation permission denied or unavailable:', error);
        this.locationEnabled = false;
      }
    } else {
      console.warn('[CheckInManager] Geolocation not supported by this browser');
      this.locationEnabled = false;
    }

    // Initialize active visit
    await this.checkForActiveVisit();
    
    console.log('[CheckInManager] Initialized');
    return this;
  }

  /**
   * Get the current position
   * @returns {Promise<GeolocationPosition>}
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          resolve(position);
        },
        error => {
          console.error('[CheckInManager] Error getting position:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Start watching the user's position
   */
  startWatchingPosition() {
    if (!this.locationEnabled || this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      position => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
      },
      error => {
        console.error('[CheckInManager] Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  /**
   * Stop watching the user's position
   */
  stopWatchingPosition() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Check for any active visit
   * @returns {Promise<void>}
   */
  async checkForActiveVisit() {
    try {
      // Query for any in-progress visit
      const activeVisits = await this.db.getByIndex('visits', 'status', 'in_progress');
      
      if (activeVisits && activeVisits.length > 0) {
        this.currentVisit = activeVisits[0];
        console.log('[CheckInManager] Found active visit:', this.currentVisit);
        
        // Start watching position if we have an active visit
        this.startWatchingPosition();
      } else {
        this.currentVisit = null;
      }
    } catch (error) {
      console.error('[CheckInManager] Error checking for active visit:', error);
    }
  }

  /**
   * Check in to a visit
   * @param {string} visitId - ID of the visit to check in to
   * @returns {Promise<Object>} The checked-in visit
   */
  async checkIn(visitId) {
    try {
      // Check if there's already an active visit
      if (this.currentVisit) {
        throw new Error('You already have an active visit. Please check out first.');
      }
      
      // Get the visit from the database
      const visit = await this.db.get('visits', visitId);
      if (!visit) {
        throw new Error('Visit not found');
      }
      
      // Make sure the visit is in a state where check-in is possible
      if (visit.status !== 'scheduled') {
        throw new Error(`Cannot check in to a visit with status: ${visit.status}`);
      }
      
      // Get current location if enabled
      let location = null;
      if (this.locationEnabled) {
        try {
          const position = await this.getCurrentPosition();
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.warn('[CheckInManager] Unable to get location for check-in:', error);
          // We'll continue without location data
        }
      }
      
      // Update the visit
      const updatedVisit = {
        ...visit,
        status: 'in_progress',
        checkInTime: new Date().toISOString(),
        checkInLocation: location
      };
      
      // Save to database
      await this.db.put('visits', updatedVisit);
      
      // Queue for sync
      const syncManager = window.CareUnity.syncManager;
      if (syncManager) {
        await syncManager.queueOperation({
          type: 'visits',
          action: 'update',
          data: updatedVisit
        });
      }
      
      // Set as current visit
      this.currentVisit = updatedVisit;
      
      // Start watching position
      this.startWatchingPosition();
      
      // Show notification
      const notificationManager = window.CareUnity.notificationManager;
      if (notificationManager) {
        notificationManager.addNotification({
          title: 'Visit Check-In',
          message: `You have checked in to visit with ${visit.userName}`,
          icon: 'login'
        });
      }
      
      console.log('[CheckInManager] Checked in to visit:', updatedVisit);
      return updatedVisit;
    } catch (error) {
      console.error('[CheckInManager] Check-in failed:', error);
      throw error;
    }
  }

  /**
   * Check out from the current visit
   * @param {Object} checkoutData - Additional checkout data
   * @returns {Promise<Object>} The checked-out visit
   */
  async checkOut(checkoutData = {}) {
    try {
      // Make sure there's an active visit
      if (!this.currentVisit) {
        throw new Error('No active visit to check out from');
      }
      
      // Get current location if enabled
      let location = null;
      if (this.locationEnabled) {
        try {
          const position = await this.getCurrentPosition();
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.warn('[CheckInManager] Unable to get location for check-out:', error);
          // We'll continue without location data
        }
      }
      
      // Calculate duration
      const checkInTime = new Date(this.currentVisit.checkInTime);
      const checkOutTime = new Date();
      const durationMs = checkOutTime.getTime() - checkInTime.getTime();
      const durationMinutes = Math.round(durationMs / 60000);
      
      // Update the visit
      const updatedVisit = {
        ...this.currentVisit,
        status: 'completed',
        checkOutTime: checkOutTime.toISOString(),
        checkOutLocation: location,
        durationMinutes,
        notes: checkoutData.notes || this.currentVisit.notes || '',
        tasks: checkoutData.tasks || this.currentVisit.tasks || [],
        medications: checkoutData.medications || this.currentVisit.medications || []
      };
      
      // Save to database
      await this.db.put('visits', updatedVisit);
      
      // Queue for sync
      const syncManager = window.CareUnity.syncManager;
      if (syncManager) {
        await syncManager.queueOperation({
          type: 'visits',
          action: 'update',
          data: updatedVisit
        });
      }
      
      // Clear current visit
      this.currentVisit = null;
      
      // Stop watching position
      this.stopWatchingPosition();
      
      // Show notification
      const notificationManager = window.CareUnity.notificationManager;
      if (notificationManager) {
        notificationManager.addNotification({
          title: 'Visit Completed',
          message: `You have checked out from visit with ${updatedVisit.userName}`,
          icon: 'logout'
        });
      }
      
      console.log('[CheckInManager] Checked out from visit:', updatedVisit);
      return updatedVisit;
    } catch (error) {
      console.error('[CheckInManager] Check-out failed:', error);
      throw error;
    }
  }

  /**
   * Check if a visit is within the allowed time window
   * @param {Object} visit - The visit to check
   * @returns {boolean} Whether the visit is within the time window
   */
  isVisitInTimeWindow(visit) {
    if (!visit || !visit.scheduledTime) return false;
    
    const scheduledTime = new Date(visit.scheduledTime);
    const now = new Date();
    
    // Allow check-in 15 minutes before and 30 minutes after scheduled time
    const earliestTime = new Date(scheduledTime);
    earliestTime.setMinutes(scheduledTime.getMinutes() - 15);
    
    const latestTime = new Date(scheduledTime);
    latestTime.setMinutes(scheduledTime.getMinutes() + 30);
    
    return now >= earliestTime && now <= latestTime;
  }

  /**
   * Get upcoming visits for today
   * @returns {Promise<Array>} Array of upcoming visits
   */
  async getTodayVisits() {
    try {
      // Get all visits
      const allVisits = await this.db.getAll('visits');
      
      // Filter to visits for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayVisits = allVisits.filter(visit => {
        const visitDate = new Date(visit.scheduledTime);
        return visitDate >= today && visitDate < tomorrow;
      });
      
      // Sort by scheduled time
      todayVisits.sort((a, b) => {
        return new Date(a.scheduledTime) - new Date(b.scheduledTime);
      });
      
      return todayVisits;
    } catch (error) {
      console.error('[CheckInManager] Error getting today\'s visits:', error);
      return [];
    }
  }

  /**
   * Record an incident during a visit
   * @param {Object} incidentData - The incident data
   * @returns {Promise<Object>} The recorded incident
   */
  async recordIncident(incidentData) {
    try {
      // Make sure there's an active visit
      if (!this.currentVisit) {
        throw new Error('No active visit to record an incident for');
      }
      
      // Create incident object
      const incident = {
        id: `incident_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        visitId: this.currentVisit.id,
        userId: this.currentVisit.userId,
        type: incidentData.type,
        description: incidentData.description,
        severity: incidentData.severity || 'medium',
        location: this.currentLocation,
        timestamp: new Date().toISOString(),
        status: 'reported',
        reportedBy: this.currentVisit.staffId,
        actions: incidentData.immediateActions || []
      };
      
      // Save to database
      await this.db.add('incidents', incident);
      
      // Queue for sync
      const syncManager = window.CareUnity.syncManager;
      if (syncManager) {
        await syncManager.queueOperation({
          type: 'incidents',
          action: 'add',
          data: incident
        });
      }
      
      // Show notification
      const notificationManager = window.CareUnity.notificationManager;
      if (notificationManager) {
        notificationManager.addNotification({
          title: 'Incident Reported',
          message: `${incident.type} incident has been reported`,
          icon: 'warning'
        });
      }
      
      console.log('[CheckInManager] Recorded incident:', incident);
      return incident;
    } catch (error) {
      console.error('[CheckInManager] Error recording incident:', error);
      throw error;
    }
  }
}

// Export the CheckInManager class
window.CareUnity = window.CareUnity || {};
window.CareUnity.CheckInManager = CheckInManager;
