/**
 * ML Models Error Reporter
 * 
 * This module provides error reporting and diagnostics for the ML Models application.
 * It captures errors from various modules and provides tools for debugging.
 */

class MLModelsErrorReporter {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.initialized = false;
    this.modules = {
      gestures: { errors: 0, lastError: null },
      voice: { errors: 0, lastError: null },
      notifications: { errors: 0, lastError: null },
      offline: { errors: 0, lastError: null }
    };
    
    // Initialize
    this.init();
  }
  
  // Initialize error reporter
  init() {
    try {
      // Listen for unhandled errors
      window.addEventListener('error', this.handleGlobalError.bind(this));
      
      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      
      // Listen for custom error events from modules
      document.addEventListener('mlModelsGestureError', this.handleModuleError.bind(this, 'gestures'));
      document.addEventListener('mlModelsVoiceError', this.handleModuleError.bind(this, 'voice'));
      document.addEventListener('mlModelsNotificationError', this.handleModuleError.bind(this, 'notifications'));
      document.addEventListener('mlModelsOfflineError', this.handleModuleError.bind(this, 'offline'));
      
      this.initialized = true;
      console.log('[Error Reporter] Initialized');
    } catch (error) {
      console.error('[Error Reporter] Failed to initialize:', error);
    }
  }
  
  // Handle global errors
  handleGlobalError(event) {
    this.reportError('global', {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  }
  
  // Handle unhandled promise rejections
  handleUnhandledRejection(event) {
    this.reportError('promise', {
      message: event.reason?.message || 'Unhandled promise rejection',
      error: event.reason
    });
  }
  
  // Handle module-specific errors
  handleModuleError(module, event) {
    this.reportError(module, event.detail);
  }
  
  // Report an error
  reportError(source, errorData) {
    try {
      // Create error object
      const error = {
        source,
        timestamp: new Date().toISOString(),
        ...errorData
      };
      
      // Add to errors array
      this.errors.unshift(error);
      
      // Limit array size
      if (this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors);
      }
      
      // Update module stats
      if (this.modules[source]) {
        this.modules[source].errors++;
        this.modules[source].lastError = error;
      }
      
      // Log to console
      console.error(`[${source}] ${errorData.message}`, errorData.error);
      
      // Save to local storage
      this.saveErrors();
      
      return error;
    } catch (e) {
      console.error('[Error Reporter] Failed to report error:', e);
      return null;
    }
  }
  
  // Save errors to local storage
  saveErrors() {
    try {
      localStorage.setItem('ml-models-errors', JSON.stringify({
        errors: this.errors.slice(0, 20), // Save only the most recent errors
        modules: this.modules,
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.error('[Error Reporter] Failed to save errors to local storage:', e);
    }
  }
  
  // Load errors from local storage
  loadErrors() {
    try {
      const savedData = localStorage.getItem('ml-models-errors');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.errors) {
          // Merge with existing errors, avoiding duplicates
          const existingTimestamps = new Set(this.errors.map(e => e.timestamp));
          const newErrors = data.errors.filter(e => !existingTimestamps.has(e.timestamp));
          this.errors = [...newErrors, ...this.errors].slice(0, this.maxErrors);
        }
        if (data.modules) {
          this.modules = { ...this.modules, ...data.modules };
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Error Reporter] Failed to load errors from local storage:', e);
      return false;
    }
  }
  
  // Get all errors
  getErrors() {
    return this.errors;
  }
  
  // Get errors for a specific module
  getModuleErrors(module) {
    return this.errors.filter(error => error.source === module);
  }
  
  // Get module statistics
  getModuleStats() {
    return this.modules;
  }
  
  // Clear all errors
  clearErrors() {
    this.errors = [];
    
    // Reset module stats
    Object.keys(this.modules).forEach(module => {
      this.modules[module] = { errors: 0, lastError: null };
    });
    
    // Clear local storage
    try {
      localStorage.removeItem('ml-models-errors');
    } catch (e) {
      console.error('[Error Reporter] Failed to clear errors from local storage:', e);
    }
  }
  
  // Create diagnostic report
  createDiagnosticReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        modules: this.modules,
        recentErrors: this.errors.slice(0, 10),
        localStorage: this.isLocalStorageAvailable(),
        sessionStorage: this.isSessionStorageAvailable(),
        indexedDB: this.isIndexedDBAvailable(),
        serviceWorker: this.isServiceWorkerAvailable(),
        touchSupport: 'ontouchstart' in window,
        pointerSupport: 'PointerEvent' in window
      };
      
      return report;
    } catch (e) {
      console.error('[Error Reporter] Failed to create diagnostic report:', e);
      return { error: e.message };
    }
  }
  
  // Check if localStorage is available
  isLocalStorageAvailable() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Check if sessionStorage is available
  isSessionStorageAvailable() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Check if IndexedDB is available
  isIndexedDBAvailable() {
    return !!window.indexedDB;
  }
  
  // Check if Service Worker is available
  isServiceWorkerAvailable() {
    return 'serviceWorker' in navigator;
  }
}

// Create global instance
window.mlModelsErrorReporter = new MLModelsErrorReporter();
