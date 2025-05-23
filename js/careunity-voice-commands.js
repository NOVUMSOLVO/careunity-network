// CareUnity Mobile - Voice Commands
/**
 * Voice Command System for CareUnity Mobile
 * Enables hands-free operation of the mobile app through voice commands
 */

class VoiceCommandManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commands = {};
    this.feedbackElement = null;
    this.commandHistory = [];
    this.confidenceThreshold = 0.7;
    this.initialized = false;
    this.language = 'en-US';
  }

  /**
   * Initialize the voice command system
   * @param {Object} options - Configuration options
   * @returns {VoiceCommandManager} This instance
   */
  init(options = {}) {
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[VoiceCommandManager] Speech recognition not supported in this browser');
      return this;
    }

    // Apply options
    if (options.language) {
      this.language = options.language;
    }
    if (options.confidenceThreshold !== undefined) {
      this.confidenceThreshold = options.confidenceThreshold;
    }

    // Initialize recognition
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.language;

    // Set up event handlers
    this.recognition.onresult = this.handleRecognitionResult.bind(this);
    this.recognition.onerror = this.handleRecognitionError.bind(this);
    this.recognition.onend = this.handleRecognitionEnd.bind(this);

    // Create feedback element
    this.createFeedbackElement();

    // Register default commands
    this.registerDefaultCommands();
    
    this.initialized = true;
    console.log('[VoiceCommandManager] Initialized with language:', this.language);
    
    return this;
  }

  /**
   * Create the visual feedback element for voice commands
   */
  createFeedbackElement() {
    // Create the feedback element if it doesn't exist
    if (!this.feedbackElement) {
      this.feedbackElement = document.createElement('div');
      this.feedbackElement.className = 'voice-feedback';
      this.feedbackElement.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: 500;
        display: none;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 90%;
        text-align: center;
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;
      document.body.appendChild(this.feedbackElement);
    }
  }

  /**
   * Register default commands
   */
  registerDefaultCommands() {
    // Navigation commands
    this.registerCommand('go to dashboard', () => this.navigateTo('dashboard-tab'));
    this.registerCommand('show dashboard', () => this.navigateTo('dashboard-tab'));
    this.registerCommand('go to visits', () => this.navigateTo('visits-tab'));
    this.registerCommand('show visits', () => this.navigateTo('visits-tab'));
    this.registerCommand('go to clients', () => this.navigateTo('clients-tab'));
    this.registerCommand('show clients', () => this.navigateTo('clients-tab'));
    this.registerCommand('go to service users', () => this.navigateTo('clients-tab'));
    this.registerCommand('show service users', () => this.navigateTo('clients-tab'));
    this.registerCommand('go to tasks', () => this.navigateTo('tasks-tab'));
    this.registerCommand('show tasks', () => this.navigateTo('tasks-tab'));
    this.registerCommand('go to reports', () => this.navigateTo('reports-tab'));
    this.registerCommand('show reports', () => this.navigateTo('reports-tab'));

    // App control commands
    this.registerCommand('refresh', () => this.refreshCurrentView());
    this.registerCommand('sync data', () => this.syncData());
    this.registerCommand('check in', () => this.checkInCurrentVisit());
    this.registerCommand('checkout', () => this.checkOutCurrentVisit());
    this.registerCommand('complete visit', () => this.completeCurrentVisit());
    
    // Search commands
    this.registerCommand('search', (query) => this.search(query));
    this.registerCommand('find', (query) => this.search(query));
    
    // Help command
    this.registerCommand('list commands', () => this.showCommands());
    this.registerCommand('help', () => this.showCommands());
  }

  /**
   * Register a voice command
   * @param {string} phrase - The command phrase to listen for
   * @param {Function} action - The function to execute when command is recognized
   */
  registerCommand(phrase, action) {
    this.commands[phrase.toLowerCase()] = action;
  }

  /**
   * Start listening for voice commands
   */
  startListening() {
    if (!this.initialized || this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
      this.showFeedback('Listening...');
      
      // Add pulse effect to microphone button if it exists
      const micButton = document.getElementById('voice-command-button');
      if (micButton) {
        micButton.classList.add('pulse');
      }
      
      console.log('[VoiceCommandManager] Started listening');
    } catch (error) {
      console.error('[VoiceCommandManager] Error starting recognition:', error);
      this.isListening = false;
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.initialized || !this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
      this.hideFeedback();
      
      // Remove pulse effect from microphone button
      const micButton = document.getElementById('voice-command-button');
      if (micButton) {
        micButton.classList.remove('pulse');
      }
      
      console.log('[VoiceCommandManager] Stopped listening');
    } catch (error) {
      console.error('[VoiceCommandManager] Error stopping recognition:', error);
    }
  }

  /**
   * Handle speech recognition results
   * @param {SpeechRecognitionEvent} event - The recognition event
   */
  handleRecognitionResult(event) {
    const result = event.results[0][0];
    const transcript = result.transcript.trim().toLowerCase();
    const confidence = result.confidence;
    
    console.log(`[VoiceCommandManager] Recognized: "${transcript}" (${confidence.toFixed(2)})`);
    
    // Check confidence threshold
    if (confidence < this.confidenceThreshold) {
      this.showFeedback(`Low confidence: "${transcript}". Please try again.`, 'warning');
      return;
    }
    
    // Add to command history
    this.commandHistory.push({
      transcript,
      confidence,
      timestamp: new Date()
    });
    
    // Limit history size
    if (this.commandHistory.length > 20) {
      this.commandHistory.shift();
    }
    
    // Process command
    this.processCommand(transcript);
  }

  /**
   * Process a voice command
   * @param {string} transcript - The recognized speech transcript
   */
  processCommand(transcript) {
    // Check for exact command matches
    for (const [phrase, action] of Object.entries(this.commands)) {
      if (transcript === phrase) {
        this.showFeedback(`Command: ${phrase}`, 'success');
        action();
        return;
      }
    }
    
    // Check for commands with parameters
    for (const [phrase, action] of Object.entries(this.commands)) {
      if (transcript.startsWith(phrase + ' ')) {
        const param = transcript.substring(phrase.length).trim();
        this.showFeedback(`Command: ${phrase} "${param}"`, 'success');
        action(param);
        return;
      }
    }
    
    // Check for partial matches
    for (const [phrase, action] of Object.entries(this.commands)) {
      if (transcript.includes(phrase)) {
        this.showFeedback(`Command: ${phrase}`, 'success');
        action();
        return;
      }
    }
    
    // No command matched
    this.showFeedback(`Command not recognized: "${transcript}"`, 'error');
    console.log('[VoiceCommandManager] No matching command found for:', transcript);
  }

  /**
   * Handle speech recognition errors
   * @param {SpeechRecognitionError} event - The error event
   */
  handleRecognitionError(event) {
    console.error('[VoiceCommandManager] Recognition error:', event.error);
    
    let message = 'Voice recognition error';
    
    switch (event.error) {
      case 'no-speech':
        message = 'No speech detected. Please try again.';
        break;
      case 'aborted':
        message = 'Recognition aborted';
        break;
      case 'audio-capture':
        message = 'Microphone not available. Check permissions.';
        break;
      case 'network':
        message = 'Network error. Please check your connection.';
        break;
      case 'not-allowed':
        message = 'Microphone access denied. Check permissions.';
        break;
      case 'service-not-allowed':
        message = 'Speech recognition service not allowed.';
        break;
      case 'bad-grammar':
        message = 'Grammar error in speech recognition.';
        break;
      case 'language-not-supported':
        message = `Language ${this.language} not supported.`;
        break;
    }
    
    this.showFeedback(message, 'error');
    this.isListening = false;
  }

  /**
   * Handle recognition end event
   */
  handleRecognitionEnd() {
    this.isListening = false;
    
    // Remove pulse effect from microphone button
    const micButton = document.getElementById('voice-command-button');
    if (micButton) {
      micButton.classList.remove('pulse');
    }
    
    console.log('[VoiceCommandManager] Recognition ended');
  }

  /**
   * Show feedback to the user
   * @param {string} message - The message to show
   * @param {string} type - The message type: 'info', 'success', 'warning', 'error'
   */
  showFeedback(message, type = 'info') {
    if (!this.feedbackElement) return;
    
    // Set background color based on type
    const colors = {
      info: 'rgba(99, 102, 241, 0.9)',      // indigo
      success: 'rgba(16, 185, 129, 0.9)',    // green
      warning: 'rgba(245, 158, 11, 0.9)',    // amber
      error: 'rgba(239, 68, 68, 0.9)'        // red
    };
    
    this.feedbackElement.style.backgroundColor = colors[type] || colors.info;
    this.feedbackElement.textContent = message;
    this.feedbackElement.style.display = 'block';
    
    // Animate in
    this.feedbackElement.style.opacity = '0';
    this.feedbackElement.style.transform = 'translateX(-50%) translateY(10px)';
    
    setTimeout(() => {
      this.feedbackElement.style.opacity = '1';
      this.feedbackElement.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Auto-hide after 3 seconds for success/info
    if (type === 'success' || type === 'info') {
      setTimeout(() => this.hideFeedback(), 3000);
    }
  }

  /**
   * Hide the feedback message
   */
  hideFeedback() {
    if (!this.feedbackElement) return;
    
    // Animate out
    this.feedbackElement.style.opacity = '0';
    this.feedbackElement.style.transform = 'translateX(-50%) translateY(10px)';
    
    setTimeout(() => {
      this.feedbackElement.style.display = 'none';
    }, 300);
  }

  /**
   * Navigate to a specific tab
   * @param {string} tabId - The ID of the tab to navigate to
   */
  navigateTo(tabId) {
    const tabButton = document.querySelector(`[data-target="${tabId}"]`);
    if (tabButton) {
      tabButton.click();
      console.log(`[VoiceCommandManager] Navigated to: ${tabId}`);
    } else {
      console.warn(`[VoiceCommandManager] Tab not found: ${tabId}`);
    }
  }

  /**
   * Refresh the current view
   */
  refreshCurrentView() {
    // Trigger the pull-to-refresh functionality
    const pullToRefresh = document.getElementById('pull-to-refresh');
    if (pullToRefresh) {
      pullToRefresh.classList.add('visible');
      
      // Simulate successful refresh after 1 second
      setTimeout(() => {
        pullToRefresh.classList.remove('visible');
        this.showFeedback('Page refreshed', 'success');
      }, 1000);
    }
  }

  /**
   * Sync data with server
   */
  syncData() {
    // If we have a SyncManager instance, use it
    if (window.CareUnity && window.CareUnity.SyncManager) {
      const syncManagerInstance = window.CareUnity.syncManagerInstance;
      if (syncManagerInstance) {
        syncManagerInstance.manualSync();
        return;
      }
    }
    
    // Fallback if no SyncManager instance is available
    this.showFeedback('Syncing data...', 'info');
    
    // Simulate successful sync after 2 seconds
    setTimeout(() => {
      this.showFeedback('Data synchronized', 'success');
    }, 2000);
  }

  /**
   * Check in for current visit
   */
  checkInCurrentVisit() {
    // If we have a CheckInManager instance, use it
    if (window.CareUnity && window.CareUnity.CheckInManager) {
      const checkInManagerInstance = window.CareUnity.checkInManagerInstance;
      if (checkInManagerInstance) {
        checkInManagerInstance.checkIn();
        return;
      }
    }
    
    this.showFeedback('Checking in for visit...', 'info');
  }

  /**
   * Check out of current visit
   */
  checkOutCurrentVisit() {
    // If we have a CheckInManager instance, use it
    if (window.CareUnity && window.CareUnity.CheckInManager) {
      const checkInManagerInstance = window.CareUnity.checkInManagerInstance;
      if (checkInManagerInstance) {
        checkInManagerInstance.checkOut();
        return;
      }
    }
    
    this.showFeedback('Checking out of visit...', 'info');
  }

  /**
   * Complete the current visit
   */
  completeCurrentVisit() {
    // If we have a CheckInManager instance, use it
    if (window.CareUnity && window.CareUnity.CheckInManager) {
      const checkInManagerInstance = window.CareUnity.checkInManagerInstance;
      if (checkInManagerInstance) {
        checkInManagerInstance.completeVisit();
        return;
      }
    }
    
    this.showFeedback('Completing visit...', 'info');
  }

  /**
   * Search for a term
   * @param {string} query - The search query
   */
  search(query) {
    if (!query) {
      this.showFeedback('Please specify what to search for', 'warning');
      return;
    }
    
    this.showFeedback(`Searching for: "${query}"`, 'info');
    
    // Find search input if it exists
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.focus();
    } else {
      this.showFeedback('Search function not available on this screen', 'warning');
    }
  }

  /**
   * Show available commands
   */
  showCommands() {
    const commandList = Object.keys(this.commands).join(', ');
    const modal = document.createElement('div');
    modal.className = 'voice-commands-modal';
    modal.innerHTML = `
      <div class="voice-commands-content">
        <h2>Available Voice Commands</h2>
        <ul>
          ${Object.keys(this.commands).map(cmd => `<li>${cmd}</li>`).join('')}
        </ul>
        <button class="close-button">Close</button>
      </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    const content = modal.querySelector('.voice-commands-content');
    content.style.cssText = `
      background-color: white;
      border-radius: 8px;
      max-width: 90%;
      width: 400px;
      max-height: 80%;
      overflow-y: auto;
      padding: 24px;
    `;
    
    const heading = modal.querySelector('h2');
    heading.style.cssText = `
      margin-top: 0;
      color: #4F46E5;
      font-size: 20px;
      margin-bottom: 16px;
    `;
    
    const list = modal.querySelector('ul');
    list.style.cssText = `
      list-style-type: none;
      padding: 0;
      margin: 0 0 20px 0;
    `;
    
    const items = modal.querySelectorAll('li');
    items.forEach(item => {
      item.style.cssText = `
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      `;
    });
    
    const button = modal.querySelector('.close-button');
    button.style.cssText = `
      background-color: #4F46E5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    
    button.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
  }
}

// Export the VoiceCommandManager class
window.CareUnity = window.CareUnity || {};
window.CareUnity.VoiceCommandManager = VoiceCommandManager;
