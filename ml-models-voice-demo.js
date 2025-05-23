/**
 * ML Models Voice Command Demonstration
 * 
 * This module provides a demonstration of voice commands for ML models.
 */

class MLModelsVoiceDemo {
  constructor() {
    this.isListening = false;
    this.commandHistory = [];
    this.availableCommands = [
      { command: 'show models', description: 'Display all available models' },
      { command: 'select model one', description: 'Select the first model' },
      { command: 'select model two', description: 'Select the second model' },
      { command: 'select model three', description: 'Select the third model' },
      { command: 'test model', description: 'Test the currently selected model' },
      { command: 'show metrics', description: 'Show metrics for the selected model' },
      { command: 'refresh data', description: 'Refresh the dashboard data' },
      { command: 'go offline', description: 'Switch to offline mode' },
      { command: 'go online', description: 'Switch to online mode' }
    ];
    
    // Initialize
    this.init();
  }
  
  // Initialize
  init() {
    // Create UI
    this.createUI();
    
    // Register voice commands
    this.registerVoiceCommands();
    
    // Listen for voice command events
    document.addEventListener('voiceCommand', (event) => {
      this.handleVoiceCommand(event.detail);
    });
  }
  
  // Create UI
  createUI() {
    // Create container if it doesn't exist
    if (!document.getElementById('ml-voice-demo')) {
      const container = document.createElement('div');
      container.id = 'ml-voice-demo';
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
    const container = document.getElementById('ml-voice-demo');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold';
    title.textContent = 'Voice Command Demo';
    
    const listenButton = document.createElement('button');
    listenButton.className = `btn ${this.isListening ? 'bg-red-500' : ''}`;
    listenButton.textContent = this.isListening ? 'Stop Listening' : 'Start Listening';
    listenButton.onclick = () => this.toggleListening();
    
    header.appendChild(title);
    header.appendChild(listenButton);
    
    // Voice status
    const voiceStatus = document.createElement('div');
    voiceStatus.className = 'mb-4 p-3 bg-gray-100 rounded';
    
    if (!window.mlModelsVoice) {
      voiceStatus.innerHTML = `
        <div class="text-red-500">Voice commands not available in this browser</div>
      `;
    } else {
      voiceStatus.innerHTML = `
        <div class="flex items-center">
          <div class="${this.isListening ? 'text-green-500' : 'text-gray-500'}">
            ${this.isListening ? 'Listening for commands...' : 'Click "Start Listening" to activate voice commands'}
          </div>
          ${this.isListening ? '<div class="ml-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>' : ''}
        </div>
      `;
    }
    
    // Available commands
    const commandsSection = document.createElement('div');
    commandsSection.className = 'mb-4';
    
    const commandsTitle = document.createElement('h4');
    commandsTitle.className = 'font-semibold mb-2';
    commandsTitle.textContent = 'Available Commands';
    
    const commandsList = document.createElement('div');
    commandsList.className = 'grid grid-cols-1 md:grid-cols-2 gap-2';
    
    this.availableCommands.forEach(cmd => {
      const commandItem = document.createElement('div');
      commandItem.className = 'p-2 bg-gray-100 rounded';
      commandItem.innerHTML = `
        <div class="font-medium">"${cmd.command}"</div>
        <div class="text-sm text-gray-600">${cmd.description}</div>
      `;
      commandsList.appendChild(commandItem);
    });
    
    commandsSection.appendChild(commandsTitle);
    commandsSection.appendChild(commandsList);
    
    // Command history
    const historySection = document.createElement('div');
    historySection.className = 'mt-4';
    
    const historyTitle = document.createElement('h4');
    historyTitle.className = 'font-semibold mb-2';
    historyTitle.textContent = 'Command History';
    
    const historyList = document.createElement('div');
    historyList.className = 'bg-gray-100 p-3 rounded max-h-40 overflow-y-auto';
    
    if (this.commandHistory.length === 0) {
      historyList.innerHTML = '<p class="text-gray-500">No commands yet</p>';
    } else {
      this.commandHistory.forEach(cmd => {
        const historyItem = document.createElement('div');
        historyItem.className = 'mb-2 p-2 bg-white rounded';
        historyItem.innerHTML = `
          <div class="font-medium">"${cmd.command}"</div>
          <div class="text-sm text-gray-600">${cmd.action}</div>
          <div class="text-xs text-gray-500">${new Date(cmd.timestamp).toLocaleString()}</div>
        `;
        historyList.appendChild(historyItem);
      });
    }
    
    historySection.appendChild(historyTitle);
    historySection.appendChild(historyList);
    
    // Add all sections to container
    container.appendChild(header);
    container.appendChild(voiceStatus);
    container.appendChild(commandsSection);
    container.appendChild(historySection);
  }
  
  // Toggle listening state
  toggleListening() {
    if (!window.mlModelsVoice) {
      this.showNotification('Voice commands not available in this browser', true);
      return;
    }
    
    this.isListening = !this.isListening;
    
    if (this.isListening) {
      window.mlModelsVoice.startListening();
    } else {
      window.mlModelsVoice.stopListening();
    }
    
    // Update UI
    this.renderUI();
    
    // Show notification
    this.showNotification(this.isListening ? 'Listening for commands...' : 'Stopped listening');
  }
  
  // Register voice commands
  registerVoiceCommands() {
    if (!window.mlModelsVoice) return;
    
    // Register commands
    window.mlModelsVoice.registerCommand('show models', () => {
      this.executeCommand('show models', 'Displaying all models');
    });
    
    window.mlModelsVoice.registerCommand('select model (one|1)', () => {
      this.executeCommand('select model one', 'Selecting model one');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.selectModel('recommendation-1');
      }
    });
    
    window.mlModelsVoice.registerCommand('select model (two|2)', () => {
      this.executeCommand('select model two', 'Selecting model two');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.selectModel('timeseries-1');
      }
    });
    
    window.mlModelsVoice.registerCommand('select model (three|3)', () => {
      this.executeCommand('select model three', 'Selecting model three');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.selectModel('satisfaction-1');
      }
    });
    
    window.mlModelsVoice.registerCommand('test model', () => {
      this.executeCommand('test model', 'Testing selected model');
      if (window.mlModelsDashboard && window.mlModelsDashboard.selectedModelId) {
        window.mlModelsDashboard.testModel(window.mlModelsDashboard.selectedModelId);
      }
    });
    
    window.mlModelsVoice.registerCommand('show metrics', () => {
      this.executeCommand('show metrics', 'Showing model metrics');
    });
    
    window.mlModelsVoice.registerCommand('refresh data', () => {
      this.executeCommand('refresh data', 'Refreshing dashboard data');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.refreshDashboard();
      }
    });
    
    window.mlModelsVoice.registerCommand('go offline', () => {
      this.executeCommand('go offline', 'Switching to offline mode');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.toggleOfflineMode();
      }
    });
    
    window.mlModelsVoice.registerCommand('go online', () => {
      this.executeCommand('go online', 'Switching to online mode');
      if (window.mlModelsDashboard) {
        window.mlModelsDashboard.toggleOfflineMode();
      }
    });
  }
  
  // Handle voice command
  handleVoiceCommand(detail) {
    const { action, command } = detail;
    
    // Add to command history
    this.addCommandToHistory(command, action);
  }
  
  // Execute a command
  executeCommand(command, action) {
    // Add to command history
    this.addCommandToHistory(command, action);
    
    // Show notification
    this.showNotification(`Command: "${command}"`);
  }
  
  // Add command to history
  addCommandToHistory(command, action) {
    this.commandHistory.unshift({
      command,
      action,
      timestamp: new Date().toISOString()
    });
    
    // Limit to 10 commands
    if (this.commandHistory.length > 10) {
      this.commandHistory = this.commandHistory.slice(0, 10);
    }
    
    // Update UI
    this.renderUI();
  }
  
  // Show notification
  showNotification(message, isError = false) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('ml-voice-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'ml-voice-notification';
      notification.className = 'fixed bottom-4 left-4 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-full opacity-0';
      document.body.appendChild(notification);
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = `fixed bottom-4 left-4 p-4 rounded shadow-lg transition-all duration-300 transform ${isError ? 'bg-red-500' : 'bg-indigo-500'} text-white`;
    
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

// Create instance when the page is loaded
window.addEventListener('load', function() {
  window.mlModelsVoiceDemo = new MLModelsVoiceDemo();
});
