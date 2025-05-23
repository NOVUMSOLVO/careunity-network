/**
 * Tests for Voice Commands Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceCommands } from '../voice-commands';

// Mock SpeechRecognition
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult = null;
  onerror = null;
  onend = null;
  
  start = mockStart;
  stop = mockStop;
  addEventListener = mockAddEventListener;
  removeEventListener = mockRemoveEventListener;
}

// Mock SpeechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();

class MockSpeechSynthesisUtterance {
  text = '';
  volume = 1;
  rate = 1;
  
  constructor(text) {
    this.text = text;
  }
}

describe('VoiceCommands', () => {
  let originalSpeechRecognition;
  let originalWebkitSpeechRecognition;
  let originalSpeechSynthesis;
  let originalSpeechSynthesisUtterance;
  
  beforeAll(() => {
    // Save original implementations
    originalSpeechRecognition = window.SpeechRecognition;
    originalWebkitSpeechRecognition = window.webkitSpeechRecognition;
    originalSpeechSynthesis = window.speechSynthesis;
    originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    
    // Mock implementations
    window.SpeechRecognition = MockSpeechRecognition;
    window.webkitSpeechRecognition = MockSpeechRecognition;
    window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel
    };
    window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  });
  
  afterAll(() => {
    // Restore original implementations
    window.SpeechRecognition = originalSpeechRecognition;
    window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
    window.speechSynthesis = originalSpeechSynthesis;
    window.SpeechSynthesisUtterance = originalSpeechSynthesisUtterance;
  });
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('renders the voice commands component', () => {
    render(<VoiceCommands />);
    
    // Check if the component renders correctly
    expect(screen.getByText('Voice Commands')).toBeInTheDocument();
    expect(screen.getByText('Not Listening')).toBeInTheDocument();
    
    // Check if available commands are displayed
    expect(screen.getByText('"show models"')).toBeInTheDocument();
    expect(screen.getByText('"test model"')).toBeInTheDocument();
  });
  
  it('toggles listening state when button is clicked', () => {
    render(<VoiceCommands />);
    
    // Find the button
    const button = screen.getByRole('button', { name: /mic/i });
    expect(button).toBeInTheDocument();
    
    // Click the button to start listening
    fireEvent.click(button);
    
    // Check if start was called
    expect(mockStart).toHaveBeenCalled();
    
    // Check if listening state is updated
    expect(screen.getByText('Listening')).toBeInTheDocument();
    
    // Click the button again to stop listening
    fireEvent.click(button);
    
    // Check if stop was called
    expect(mockStop).toHaveBeenCalled();
    
    // Check if listening state is updated
    expect(screen.getByText('Not Listening')).toBeInTheDocument();
  });
  
  it('calls onCommand when a command is recognized', () => {
    const onCommand = jest.fn();
    render(<VoiceCommands onCommand={onCommand} />);
    
    // Find the button and click it to start listening
    const button = screen.getByRole('button', { name: /mic/i });
    fireEvent.click(button);
    
    // Simulate speech recognition result
    const mockResult = {
      results: [
        [
          {
            transcript: 'show models',
            confidence: 0.9
          }
        ]
      ]
    };
    
    // Get the onresult handler
    const instance = mockStart.mock.instances[0];
    const onresult = instance.onresult;
    
    // Call the onresult handler with mock result
    onresult(mockResult);
    
    // Check if onCommand was called with the correct command
    expect(onCommand).toHaveBeenCalledWith('show models');
    
    // Check if the command is displayed in the history
    expect(screen.getByText('show models')).toBeInTheDocument();
  });
  
  it('handles speech recognition errors', () => {
    render(<VoiceCommands />);
    
    // Find the button and click it to start listening
    const button = screen.getByRole('button', { name: /mic/i });
    fireEvent.click(button);
    
    // Simulate speech recognition error
    const mockError = {
      error: 'not-allowed'
    };
    
    // Get the onerror handler
    const instance = mockStart.mock.instances[0];
    const onerror = instance.onerror;
    
    // Call the onerror handler with mock error
    onerror(mockError);
    
    // Check if listening state is updated
    expect(screen.getByText('Not Listening')).toBeInTheDocument();
  });
  
  it('tests speech synthesis when button is clicked', () => {
    render(<VoiceCommands />);
    
    // Find the test speech output button
    const button = screen.getByRole('button', { name: /test speech output/i });
    expect(button).toBeInTheDocument();
    
    // Click the button
    fireEvent.click(button);
    
    // Check if speak was called with the correct utterance
    expect(mockSpeak).toHaveBeenCalled();
    expect(mockSpeak.mock.calls[0][0].text).toContain('Voice commands are ready to use');
  });
  
  it('displays unsupported message when speech recognition is not available', () => {
    // Temporarily remove SpeechRecognition
    const tempSpeechRecognition = window.SpeechRecognition;
    const tempWebkitSpeechRecognition = window.webkitSpeechRecognition;
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = undefined;
    
    render(<VoiceCommands />);
    
    // Check if unsupported message is displayed
    expect(screen.getByText('Speech recognition is not supported in this browser.')).toBeInTheDocument();
    
    // Restore SpeechRecognition
    window.SpeechRecognition = tempSpeechRecognition;
    window.webkitSpeechRecognition = tempWebkitSpeechRecognition;
  });
  
  it('accepts custom available commands', () => {
    const customCommands = [
      { command: 'custom command one', description: 'Custom description one' },
      { command: 'custom command two', description: 'Custom description two' }
    ];
    
    render(<VoiceCommands availableCommands={customCommands} />);
    
    // Check if custom commands are displayed
    expect(screen.getByText('"custom command one"')).toBeInTheDocument();
    expect(screen.getByText('Custom description one')).toBeInTheDocument();
    expect(screen.getByText('"custom command two"')).toBeInTheDocument();
    expect(screen.getByText('Custom description two')).toBeInTheDocument();
  });
});
