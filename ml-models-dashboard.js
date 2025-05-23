/**
 * ML Models Dashboard
 * 
 * This module provides a visual dashboard for ML model metrics and testing.
 */

class MLModelsDashboard {
  constructor(containerId = 'ml-dashboard') {
    this.containerId = containerId;
    this.container = null;
    this.models = [];
    this.selectedModelId = null;
    this.realtimeStatus = 'disconnected';
    this.offlineMode = !navigator.onLine;
    
    // Initialize the dashboard
    this.init();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.updateConnectionStatus();
      this.renderStatusBar();
    });
    
    window.addEventListener('offline', () => {
      this.offlineMode = true;
      this.updateConnectionStatus();
      this.renderStatusBar();
    });
    
    // Listen for real-time connection status changes
    document.addEventListener('realTimeConnectionStatus', (event) => {
      this.realtimeStatus = event.detail.status;
      this.renderStatusBar();
    });
    
    // Listen for model updates
    document.addEventListener('mlModelsUpdate', (event) => {
      this.handleModelUpdate(event.detail);
    });
  }
  
  // Initialize the dashboard
  init() {
    // Create container if it doesn't exist
    if (!document.getElementById(this.containerId)) {
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      this.container.className = 'card';
      document.getElementById('root').appendChild(this.container);
    } else {
      this.container = document.getElementById(this.containerId);
    }
    
    // Load mock models
    this.loadMockModels();
    
    // Render the dashboard
    this.render();
  }
  
  // Load mock models for testing
  loadMockModels() {
    this.models = [
      {
        id: 'recommendation-1',
        name: 'Caregiver Recommendation',
        version: '1.0',
        type: 'classification',
        metrics: { accuracy: 0.92, precision: 0.89, recall: 0.94, f1: 0.91 },
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'timeseries-1',
        name: 'Visit Prediction',
        version: '1.2',
        type: 'regression',
        metrics: { rmse: 1.2, mae: 0.9, r2: 0.78 },
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'satisfaction-1',
        name: 'Satisfaction Prediction',
        version: '0.8',
        type: 'classification',
        metrics: { accuracy: 0.85, precision: 0.82, recall: 0.79, f1: 0.80 },
        lastUpdated: new Date().toISOString()
      }
    ];
    
    // Cache models for offline use
    if (window.mlModelsOfflineDB) {
      this.models.forEach(model => {
        window.mlModelsOfflineDB.cacheModel(model)
          .then(() => console.log(`Model ${model.id} cached for offline use`))
          .catch(error => console.error(`Error caching model ${model.id}:`, error));
      });
    }
  }
  
  // Render the dashboard
  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Add status bar
    this.renderStatusBar();
    
    // Add model selection
    this.renderModelSelection();
    
    // Add selected model details or welcome message
    if (this.selectedModelId) {
      this.renderModelDetails();
    } else {
      this.renderWelcomeMessage();
    }
    
    // Add testing controls
    this.renderTestingControls();
  }
  
  // Render status bar
  renderStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.className = 'flex justify-between items-center mb-4 p-2 bg-gray-100 rounded';
    
    // Connection status
    const connectionStatus = document.createElement('div');
    connectionStatus.className = 'flex items-center';
    
    // Online/offline status
    const onlineStatus = document.createElement('div');
    onlineStatus.className = `realtime-indicator ${this.offlineMode ? 'disconnected' : 'connected'} mr-2`;
    onlineStatus.innerHTML = `
      <span class="realtime-pulse"></span>
      <span>${this.offlineMode ? 'Offline' : 'Online'}</span>
    `;
    
    // Real-time connection status
    const realtimeStatus = document.createElement('div');
    realtimeStatus.className = `realtime-indicator ${this.realtimeStatus === 'connected' ? 'connected' : this.realtimeStatus === 'connecting' ? 'connecting' : 'disconnected'} ml-2`;
    realtimeStatus.innerHTML = `
      <span class="realtime-pulse"></span>
      <span>Real-time: ${this.realtimeStatus}</span>
    `;
    
    connectionStatus.appendChild(onlineStatus);
    connectionStatus.appendChild(realtimeStatus);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'flex items-center';
    
    // Refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'btn text-sm mr-2';
    refreshButton.textContent = 'Refresh';
    refreshButton.onclick = () => this.refreshDashboard();
    
    // Toggle offline mode button
    const offlineModeButton = document.createElement('button');
    offlineModeButton.className = 'btn text-sm';
    offlineModeButton.textContent = this.offlineMode ? 'Go Online' : 'Test Offline';
    offlineModeButton.onclick = () => this.toggleOfflineMode();
    
    actions.appendChild(refreshButton);
    actions.appendChild(offlineModeButton);
    
    statusBar.appendChild(connectionStatus);
    statusBar.appendChild(actions);
    
    this.container.appendChild(statusBar);
  }
  
  // Render model selection
  renderModelSelection() {
    const modelSelection = document.createElement('div');
    modelSelection.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4';
    
    this.models.forEach(model => {
      const modelCard = document.createElement('div');
      modelCard.className = `card cursor-pointer transition-all duration-300 ${this.selectedModelId === model.id ? 'border-2 border-indigo-500' : ''}`;
      modelCard.onclick = () => this.selectModel(model.id);
      
      // Model header
      const modelHeader = document.createElement('div');
      modelHeader.className = 'flex justify-between items-start';
      
      const modelTitle = document.createElement('div');
      modelTitle.innerHTML = `
        <h3 class="font-semibold">${model.name}</h3>
        <p class="text-sm text-gray-500">Version ${model.version}</p>
      `;
      
      const modelType = document.createElement('span');
      modelType.className = 'badge';
      modelType.textContent = model.type === 'classification' ? 'Classification' : 'Regression';
      
      modelHeader.appendChild(modelTitle);
      modelHeader.appendChild(modelType);
      
      // Model metrics
      const modelMetrics = document.createElement('div');
      modelMetrics.className = 'mt-3';
      
      if (model.type === 'classification') {
        modelMetrics.innerHTML = `
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="metric-card">
              <div class="text-xs text-gray-500">Accuracy</div>
              <div class="metric-value">${(model.metrics.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-gray-500">F1 Score</div>
              <div class="metric-value">${(model.metrics.f1 * 100).toFixed(1)}%</div>
            </div>
          </div>
        `;
      } else {
        modelMetrics.innerHTML = `
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="metric-card">
              <div class="text-xs text-gray-500">RMSE</div>
              <div class="metric-value">${model.metrics.rmse.toFixed(2)}</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-gray-500">R²</div>
              <div class="metric-value">${model.metrics.r2.toFixed(2)}</div>
            </div>
          </div>
        `;
      }
      
      modelCard.appendChild(modelHeader);
      modelCard.appendChild(modelMetrics);
      
      modelSelection.appendChild(modelCard);
    });
    
    this.container.appendChild(modelSelection);
  }
  
  // Render model details
  renderModelDetails() {
    const model = this.models.find(m => m.id === this.selectedModelId);
    if (!model) return;
    
    const modelDetails = document.createElement('div');
    modelDetails.className = 'card mb-4';
    
    // Model header
    const modelHeader = document.createElement('div');
    modelHeader.className = 'flex justify-between items-center mb-4';
    
    const modelTitle = document.createElement('h3');
    modelTitle.className = 'text-lg font-semibold';
    modelTitle.textContent = model.name;
    
    const modelActions = document.createElement('div');
    modelActions.className = 'flex items-center';
    
    const testButton = document.createElement('button');
    testButton.className = 'btn mr-2';
    testButton.textContent = 'Test Model';
    testButton.onclick = () => this.testModel(model.id);
    
    const subscribeButton = document.createElement('button');
    subscribeButton.className = 'btn';
    subscribeButton.textContent = 'Subscribe to Updates';
    subscribeButton.onclick = () => this.subscribeToModel(model.id);
    
    modelActions.appendChild(testButton);
    modelActions.appendChild(subscribeButton);
    
    modelHeader.appendChild(modelTitle);
    modelHeader.appendChild(modelActions);
    
    // Model metrics
    const modelMetrics = document.createElement('div');
    modelMetrics.className = 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4';
    
    if (model.type === 'classification') {
      modelMetrics.innerHTML = `
        <div class="metric-card">
          <div class="text-xs text-gray-500">Accuracy</div>
          <div class="metric-value">${(model.metrics.accuracy * 100).toFixed(1)}%</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">Precision</div>
          <div class="metric-value">${(model.metrics.precision * 100).toFixed(1)}%</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">Recall</div>
          <div class="metric-value">${(model.metrics.recall * 100).toFixed(1)}%</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">F1 Score</div>
          <div class="metric-value">${(model.metrics.f1 * 100).toFixed(1)}%</div>
        </div>
      `;
    } else {
      modelMetrics.innerHTML = `
        <div class="metric-card">
          <div class="text-xs text-gray-500">RMSE</div>
          <div class="metric-value">${model.metrics.rmse.toFixed(2)}</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">MAE</div>
          <div class="metric-value">${model.metrics.mae.toFixed(2)}</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">R²</div>
          <div class="metric-value">${model.metrics.r2.toFixed(2)}</div>
        </div>
        <div class="metric-card">
          <div class="text-xs text-gray-500">Last Updated</div>
          <div class="text-sm">${new Date(model.lastUpdated).toLocaleString()}</div>
        </div>
      `;
    }
    
    modelDetails.appendChild(modelHeader);
    modelDetails.appendChild(modelMetrics);
    
    this.container.appendChild(modelDetails);
  }
  
  // Render welcome message
  renderWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.className = 'card mb-4 text-center p-8';
    welcome.innerHTML = `
      <h3 class="text-lg font-semibold mb-2">Welcome to ML Models Dashboard</h3>
      <p class="text-gray-600 mb-4">Select a model above to view details and test functionality</p>
    `;
    
    this.container.appendChild(welcome);
  }
  
  // Render testing controls
  renderTestingControls() {
    const testingControls = document.createElement('div');
    testingControls.className = 'card';
    
    const testingHeader = document.createElement('h3');
    testingHeader.className = 'text-lg font-semibold mb-4';
    testingHeader.textContent = 'Testing Controls';
    
    const testingButtons = document.createElement('div');
    testingButtons.className = 'grid grid-cols-2 md:grid-cols-3 gap-4';
    
    // Test error reporting
    const errorButton = document.createElement('button');
    errorButton.className = 'btn';
    errorButton.textContent = 'Test Error Reporting';
    errorButton.onclick = () => window.testML.testErrorReporting();
    
    // Test gesture controls
    const gestureButton = document.createElement('button');
    gestureButton.className = 'btn';
    gestureButton.textContent = 'Test Gesture Controls';
    gestureButton.onclick = () => window.testML.testGestureControls();
    
    // Test voice commands
    const voiceButton = document.createElement('button');
    voiceButton.className = 'btn';
    voiceButton.textContent = 'Test Voice Commands';
    voiceButton.onclick = () => this.testVoiceCommands();
    
    // Test notifications
    const notificationButton = document.createElement('button');
    notificationButton.className = 'btn';
    notificationButton.textContent = 'Test Notifications';
    notificationButton.onclick = () => this.testNotifications();
    
    // Test offline mode
    const offlineButton = document.createElement('button');
    offlineButton.className = 'btn';
    offlineButton.textContent = 'Test Offline Mode';
    offlineButton.onclick = () => this.toggleOfflineMode();
    
    // Run all tests
    const allTestsButton = document.createElement('button');
    allTestsButton.className = 'btn';
    allTestsButton.textContent = 'Run All Tests';
    allTestsButton.onclick = () => window.testML.runAllTests();
    
    testingButtons.appendChild(errorButton);
    testingButtons.appendChild(gestureButton);
    testingButtons.appendChild(voiceButton);
    testingButtons.appendChild(notificationButton);
    testingButtons.appendChild(offlineButton);
    testingButtons.appendChild(allTestsButton);
    
    testingControls.appendChild(testingHeader);
    testingControls.appendChild(testingButtons);
    
    this.container.appendChild(testingControls);
  }
  
  // Select a model
  selectModel(modelId) {
    this.selectedModelId = modelId;
    this.render();
    
    // Subscribe to model updates
    this.subscribeToModel(modelId);
  }
  
  // Subscribe to model updates
  subscribeToModel(modelId) {
    if (window.mlModelsRealTime) {
      window.mlModelsRealTime.subscribeToModel(modelId, (updateType, data) => {
        console.log(`Received update for model ${modelId}:`, updateType, data);
        this.handleModelUpdate({ updateType, data });
      });
      
      // Show notification
      this.showNotification(`Subscribed to updates for model ${modelId}`);
    }
  }
  
  // Test model
  testModel(modelId) {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return;
    
    // Show notification
    this.showNotification(`Testing model: ${model.name}`);
    
    // Simulate model prediction
    setTimeout(() => {
      const result = model.type === 'classification' 
        ? Math.random() > 0.5 
        : Math.random() * 10;
      
      this.showNotification(`Model prediction: ${result}`);
      
      // Cache prediction
      if (window.mlModelsOfflineDB) {
        window.mlModelsOfflineDB.cachePrediction(
          modelId,
          { timestamp: new Date().toISOString() },
          result
        );
      }
    }, 1000);
  }
  
  // Test voice commands
  testVoiceCommands() {
    if (window.mlModelsVoice) {
      window.mlModelsVoice.showFeedback('Testing voice commands');
      
      // Register a test command
      window.mlModelsVoice.registerCommand('test model', () => {
        this.showNotification('Voice command detected: test model');
        if (this.selectedModelId) {
          this.testModel(this.selectedModelId);
        }
      });
      
      // Try to start listening
      window.mlModelsVoice.startListening();
    } else {
      this.showNotification('Voice commands module not available', true);
    }
  }
  
  // Test notifications
  testNotifications() {
    if (window.mlModelsNotifications) {
      window.mlModelsNotifications.showNotification(
        'Test Notification',
        {
          body: 'This is a test notification from ML Models Dashboard',
          requireInteraction: false
        }
      );
    } else {
      this.showNotification('Notifications module not available', true);
    }
  }
  
  // Toggle offline mode
  toggleOfflineMode() {
    this.offlineMode = !this.offlineMode;
    this.updateConnectionStatus();
    this.render();
    
    this.showNotification(`${this.offlineMode ? 'Offline' : 'Online'} mode activated`);
  }
  
  // Update connection status
  updateConnectionStatus() {
    // Update real-time connection status based on offline mode
    if (this.offlineMode) {
      this.realtimeStatus = 'disconnected';
    }
  }
  
  // Refresh dashboard
  refreshDashboard() {
    this.render();
    this.showNotification('Dashboard refreshed');
  }
  
  // Handle model update
  handleModelUpdate(update) {
    const { updateType, data } = update;
    
    if (data && data.modelId) {
      const modelIndex = this.models.findIndex(m => m.id === data.modelId);
      
      if (modelIndex >= 0) {
        // Update model data
        if (updateType === 'metrics' && data.metrics) {
          this.models[modelIndex].metrics = { ...this.models[modelIndex].metrics, ...data.metrics };
          this.models[modelIndex].lastUpdated = data.timestamp || new Date().toISOString();
        }
        
        // Re-render if the updated model is selected
        if (this.selectedModelId === data.modelId) {
          this.render();
        }
        
        // Show notification
        this.showNotification(`Model ${this.models[modelIndex].name} updated: ${updateType}`);
      }
    }
  }
  
  // Show notification
  showNotification(message, isError = false) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('ml-dashboard-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'ml-dashboard-notification';
      notification.className = 'fixed bottom-4 right-4 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-full opacity-0';
      document.body.appendChild(notification);
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = `fixed bottom-4 right-4 p-4 rounded shadow-lg transition-all duration-300 transform ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`;
    
    // Show notification
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(full)';
      notification.style.opacity = '0';
    }, 3000);
  }
}

// Create dashboard instance when the page is loaded
window.addEventListener('load', function() {
  window.mlModelsDashboard = new MLModelsDashboard();
});
