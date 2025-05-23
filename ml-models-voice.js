/**
 * ML Models Voice Commands
 * 
 * This module provides voice recognition and command processing
 * for hands-free operation of the ML Models interface.
 */

class MLModelsVoiceCommands {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commandHandlers = {};
    this.feedbackElement = null;
    this.commandHistory = [];
    this.lastCommand = null;
    this.confidenceThreshold = 0.7;
    
    // Initialize speech recognition if available
    this.initSpeechRecognition();
  }
  
  // Initialize speech recognition
  initSpeechRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }
    
    // Create recognition instance
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;
    
    // Set up event handlers
    this.recognition.onresult = this.handleRecognitionResult.bind(this);
    this.recognition.onerror = this.handleRecognitionError.bind(this);
    this.recognition.onend = this.handleRecognitionEnd.bind(this);
    
    return true;
  }
  
  // Create feedback element
  createFeedbackElement() {
    if (this.feedbackElement) return;
    
    this.feedbackElement = document.createElement('div');
    this.feedbackElement.className = 'voice-feedback';
    this.feedbackElement.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(79, 70, 229, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 500;
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      max-width: 80%;
    `;
    
    document.body.appendChild(this.feedbackElement);
  }
  
  // Show feedback message
  showFeedback(message, isError = false) {
    if (!this.feedbackElement) {
      this.createFeedbackElement();
    }
    
    this.feedbackElement.textContent = message;
    this.feedbackElement.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(79, 70, 229, 0.9)';
    this.feedbackElement.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.feedbackElement.style.display = 'none';
    }, 3000);
  }
  
  // Start listening for voice commands
  startListening() {
    if (!this.recognition) {
      this.showFeedback('Voice recognition not supported in this browser', true);
      return false;
    }
    
    if (this.isListening) return true;
    
    try {
      this.recognition.start();
      this.isListening = true;
      this.showFeedback('Listening for commands...');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.showFeedback('Error starting voice recognition', true);
      return false;
    }
  }
  
  // Stop listening for voice commands
  stopListening() {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  
  // Toggle listening state
  toggleListening() {
    return this.isListening ? this.stopListening() : this.startListening();
  }
  
  // Handle recognition result
  handleRecognitionResult(event) {
    const result = event.results[0][0];
    const transcript = result.transcript.trim().toLowerCase();
    const confidence = result.confidence;
    
    console.log(`Voice command recognized: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
    
    // Add to command history
    this.commandHistory.push({
      transcript,
      confidence,
      timestamp: new Date().toISOString()
    });
    
    // Only process commands with sufficient confidence
    if (confidence >= this.confidenceThreshold) {
      this.processCommand(transcript);
    } else {
      this.showFeedback(`Command not clear: "${transcript}"`, true);
    }
  }
  
  // Handle recognition error
  handleRecognitionError(event) {
    console.error('Speech recognition error:', event.error);
    
    let errorMessage = 'Voice recognition error';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected';
        break;
      case 'aborted':
        errorMessage = 'Recognition aborted';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone detected';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied';
        break;
      case 'network':
        errorMessage = 'Network error';
        break;
      case 'service-not-allowed':
        errorMessage = 'Service not allowed';
        break;
    }
    
    this.showFeedback(errorMessage, true);
    this.isListening = false;
  }
  
  // Handle recognition end
  handleRecognitionEnd() {
    this.isListening = false;
  }
  
  // Process recognized command
  processCommand(command) {
    this.lastCommand = command;
    
    // Check for wake word
    if (command.includes('hey model') || command.includes('hey models')) {
      this.showFeedback('Yes, how can I help?');
      return;
    }
    
    // Check for registered command handlers
    for (const [pattern, handler] of Object.entries(this.commandHandlers)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(command)) {
        const match = command.match(regex);
        handler(match);
        return;
      }
    }
    
    // Default commands
    if (command.includes('show models') || command.includes('view models')) {
      this.showFeedback('Showing models');
      this.executeAction('showModels');
    } else if (command.includes('refresh') || command.includes('reload')) {
      this.showFeedback('Refreshing data');
      this.executeAction('refresh');
    } else if (command.includes('go back') || command.includes('previous')) {
      this.showFeedback('Going back');
      this.executeAction('goBack');
    } else if (command.includes('select model') || command.includes('open model')) {
      const modelNumber = command.match(/(\d+)/);
      if (modelNumber) {
        this.showFeedback(`Selecting model ${modelNumber[0]}`);
        this.executeAction('selectModel', { modelIndex: parseInt(modelNumber[0]) - 1 });
      } else {
        this.showFeedback('Please specify a model number');
      }
    } else {
      this.showFeedback(`Command not recognized: "${command}"`, true);
    }
  }
  
  // Register a command handler
  registerCommand(pattern, handler) {
    this.commandHandlers[pattern] = handler;
  }
  
  // Execute an action based on the command
  executeAction(action, params = {}) {
    // Dispatch a custom event that the app can listen for
    const event = new CustomEvent('voiceCommand', {
      detail: {
        action,
        params,
        command: this.lastCommand
      }
    });
    
    document.dispatchEvent(event);
  }
  
  // Speak feedback using text-to-speech
  speak(text) {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }
}

// Create global instance
window.mlModelsVoice = new MLModelsVoiceCommands();
