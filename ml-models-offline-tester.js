/**
 * ML Models Offline Tester
 * 
 * This module provides tools for testing offline functionality of ML models.
 */

class MLModelsOfflineTester {
  constructor() {
    this.offlineMode = !navigator.onLine;
    this.cachedModels = [];
    this.cachedPredictions = [];
    this.syncQueue = [];
    this.testResults = [];
    
    // Initialize
    this.init();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.notifyStatusChange();
    });
    
    window.addEventListener('offline', () => {
      this.offlineMode = true;
      this.notifyStatusChange();
    });
  }
  
  // Initialize
  async init() {
    // Load cached data
    await this.loadCachedData();
    
    // Create UI if needed
    this.createUI();
  }
  
  // Load cached data
  async loadCachedData() {
    if (!window.mlModelsOfflineDB) {
      console.warn('Offline DB module not available');
      return;
    }
    
    try {
      // Load cached models
      this.cachedModels = await window.mlModelsOfflineDB.getCachedModels();
      console.log('Loaded cached models:', this.cachedModels);
      
      // Load sync queue
      this.syncQueue = await window.mlModelsOfflineDB.getSyncQueue();
      console.log('Loaded sync queue:', this.syncQueue);
      
      // Load cached predictions for each model
      for (const model of this.cachedModels) {
        const predictions = await window.mlModelsOfflineDB.getCachedPredictions(model.id);
        this.cachedPredictions.push(...predictions);
      }
      console.log('Loaded cached predictions:', this.cachedPredictions);
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }
  
  // Create UI
  createUI() {
    // Create container if it doesn't exist
    if (!document.getElementById('ml-offline-tester')) {
      const container = document.createElement('div');
      container.id = 'ml-offline-tester';
      container.className = 'card mt-4';
      
      // Add to the page
      const root = document.getElementById('root');
      if (root) {
        root.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
      
      // Render UI
      this.renderUI();
    }
  }
  
  // Render UI
  renderUI() {
    const container = document.getElementById('ml-offline-tester');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold';
    title.textContent = 'Offline Functionality Tester';
    
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge ${this.offlineMode ? 'error' : 'success'}`;
    statusBadge.textContent = this.offlineMode ? 'Offline' : 'Online';
    
    header.appendChild(title);
    header.appendChild(statusBadge);
    
    // Controls
    const controls = document.createElement('div');
    controls.className = 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4';
    
    // Toggle offline mode button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn';
    toggleButton.textContent = this.offlineMode ? 'Go Online' : 'Go Offline';
    toggleButton.onclick = () => this.toggleOfflineMode();
    
    // Cache model button
    const cacheButton = document.createElement('button');
    cacheButton.className = 'btn';
    cacheButton.textContent = 'Cache Test Model';
    cacheButton.onclick = () => this.cacheTestModel();
    
    // Test prediction button
    const predictionButton = document.createElement('button');
    predictionButton.className = 'btn';
    predictionButton.textContent = 'Test Prediction';
    predictionButton.onclick = () => this.testPrediction();
    
    // Sync data button
    const syncButton = document.createElement('button');
    syncButton.className = 'btn';
    syncButton.textContent = 'Sync Data';
    syncButton.onclick = () => this.syncData();
    
    controls.appendChild(toggleButton);
    controls.appendChild(cacheButton);
    controls.appendChild(predictionButton);
    controls.appendChild(syncButton);
    
    // Stats
    const stats = document.createElement('div');
    stats.className = 'grid grid-cols-2 md:grid-cols-3 gap-4 mb-4';
    
    // Cached models
    const modelsCard = document.createElement('div');
    modelsCard.className = 'metric-card';
    modelsCard.innerHTML = `
      <div class="text-xs text-gray-500">Cached Models</div>
      <div class="metric-value">${this.cachedModels.length}</div>
    `;
    
    // Cached predictions
    const predictionsCard = document.createElement('div');
    predictionsCard.className = 'metric-card';
    predictionsCard.innerHTML = `
      <div class="text-xs text-gray-500">Cached Predictions</div>
      <div class="metric-value">${this.cachedPredictions.length}</div>
    `;
    
    // Sync queue
    const syncCard = document.createElement('div');
    syncCard.className = 'metric-card';
    syncCard.innerHTML = `
      <div class="text-xs text-gray-500">Sync Queue</div>
      <div class="metric-value">${this.syncQueue.length}</div>
    `;
    
    stats.appendChild(modelsCard);
    stats.appendChild(predictionsCard);
    stats.appendChild(syncCard);
    
    // Test results
    const results = document.createElement('div');
    results.className = 'mt-4';
    
    const resultsTitle = document.createElement('h4');
    resultsTitle.className = 'font-semibold mb-2';
    resultsTitle.textContent = 'Test Results';
    
    const resultsList = document.createElement('div');
    resultsList.className = 'bg-gray-100 p-3 rounded max-h-40 overflow-y-auto';
    
    if (this.testResults.length === 0) {
      resultsList.innerHTML = '<p class="text-gray-500">No tests run yet</p>';
    } else {
      this.testResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `mb-2 p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`;
        resultItem.innerHTML = `
          <div class="flex justify-between">
            <span class="font-medium">${result.test}</span>
            <span>${result.success ? '✓' : '✗'}</span>
          </div>
          <div class="text-sm text-gray-600">${result.message}</div>
          <div class="text-xs text-gray-500">${new Date(result.timestamp).toLocaleString()}</div>
        `;
        resultsList.appendChild(resultItem);
      });
    }
    
    results.appendChild(resultsTitle);
    results.appendChild(resultsList);
    
    // Add all sections to container
    container.appendChild(header);
    container.appendChild(controls);
    container.appendChild(stats);
    container.appendChild(results);
  }
  
  // Toggle offline mode
  toggleOfflineMode() {
    this.offlineMode = !this.offlineMode;
    
    // Dispatch event to simulate online/offline status
    const event = new Event(this.offlineMode ? 'offline' : 'online');
    window.dispatchEvent(event);
    
    // Update UI
    this.renderUI();
    
    // Add test result
    this.addTestResult({
      test: 'Toggle Offline Mode',
      success: true,
      message: `Switched to ${this.offlineMode ? 'offline' : 'online'} mode`
    });
  }
  
  // Cache a test model
  async cacheTestModel() {
    if (!window.mlModelsOfflineDB) {
      this.addTestResult({
        test: 'Cache Test Model',
        success: false,
        message: 'Offline DB module not available'
      });
      return;
    }
    
    try {
      // Create a test model
      const testModel = {
        id: 'test-model-' + Date.now(),
        name: 'Test Model',
        version: '1.0',
        type: 'classification',
        metrics: {
          accuracy: 0.9,
          precision: 0.85,
          recall: 0.88,
          f1: 0.86
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Cache the model
      await window.mlModelsOfflineDB.cacheModel(testModel);
      
      // Reload cached data
      await this.loadCachedData();
      
      // Update UI
      this.renderUI();
      
      // Add test result
      this.addTestResult({
        test: 'Cache Test Model',
        success: true,
        message: `Model ${testModel.id} cached successfully`
      });
    } catch (error) {
      console.error('Error caching test model:', error);
      
      this.addTestResult({
        test: 'Cache Test Model',
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }
  
  // Test prediction
  async testPrediction() {
    if (!window.mlModelsOfflineDB) {
      this.addTestResult({
        test: 'Test Prediction',
        success: false,
        message: 'Offline DB module not available'
      });
      return;
    }
    
    try {
      // Get a model to test
      const model = this.cachedModels[0] || {
        id: 'test-model',
        type: 'classification'
      };
      
      // Create test features
      const features = {
        timestamp: new Date().toISOString(),
        testFeature1: Math.random(),
        testFeature2: Math.random() > 0.5
      };
      
      // Create test result
      const result = model.type === 'classification'
        ? Math.random() > 0.5
        : Math.random() * 10;
      
      // Cache the prediction
      await window.mlModelsOfflineDB.cachePrediction(model.id, features, result);
      
      // Add to sync queue
      await window.mlModelsOfflineDB.addToSyncQueue({
        type: 'prediction',
        modelId: model.id,
        features,
        result
      });
      
      // Reload cached data
      await this.loadCachedData();
      
      // Update UI
      this.renderUI();
      
      // Add test result
      this.addTestResult({
        test: 'Test Prediction',
        success: true,
        message: `Prediction cached for model ${model.id}`
      });
    } catch (error) {
      console.error('Error testing prediction:', error);
      
      this.addTestResult({
        test: 'Test Prediction',
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }
  
  // Sync data
  async syncData() {
    if (!window.mlModelsOfflineDB) {
      this.addTestResult({
        test: 'Sync Data',
        success: false,
        message: 'Offline DB module not available'
      });
      return;
    }
    
    if (this.offlineMode) {
      this.addTestResult({
        test: 'Sync Data',
        success: false,
        message: 'Cannot sync while offline'
      });
      return;
    }
    
    try {
      // Get sync queue
      const queue = await window.mlModelsOfflineDB.getSyncQueue();
      
      if (queue.length === 0) {
        this.addTestResult({
          test: 'Sync Data',
          success: true,
          message: 'No data to sync'
        });
        return;
      }
      
      // Simulate syncing data
      let syncedCount = 0;
      for (const item of queue) {
        // Mark as synced
        await window.mlModelsOfflineDB.markAsSynced(item.id);
        syncedCount++;
      }
      
      // Show notification
      if (window.mlModelsNotifications) {
        window.mlModelsNotifications.showOfflineSyncNotification({
          count: syncedCount,
          timestamp: new Date().toISOString()
        });
      }
      
      // Reload cached data
      await this.loadCachedData();
      
      // Update UI
      this.renderUI();
      
      // Add test result
      this.addTestResult({
        test: 'Sync Data',
        success: true,
        message: `Synced ${syncedCount} items`
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      
      this.addTestResult({
        test: 'Sync Data',
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }
  
  // Add test result
  addTestResult(result) {
    this.testResults.unshift({
      ...result,
      timestamp: new Date().toISOString()
    });
    
    // Limit to 10 results
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
    
    // Update UI
    this.renderUI();
  }
  
  // Notify status change
  notifyStatusChange() {
    // Update UI
    this.renderUI();
    
    // Add test result
    this.addTestResult({
      test: 'Connection Status',
      success: true,
      message: `Connection status changed to ${this.offlineMode ? 'offline' : 'online'}`
    });
  }
}

// Create instance when the page is loaded
window.addEventListener('load', function() {
  window.mlModelsOfflineTester = new MLModelsOfflineTester();
});
