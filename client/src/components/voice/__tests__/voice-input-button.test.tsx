import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceInputButton } from '../voice-input-button';
import { ToastProvider } from '@/components/ui/toast';

// Mock the SpeechRecognition API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  
  start = vi.fn(() => {
    // Simulate successful start
  });
  
  stop = vi.fn(() => {
    if (this.onend) this.onend();
  });
  
  abort = vi.fn();
  
  // Helper to simulate a speech recognition result
  simulateResult(transcript: string) {
    if (this.onresult) {
      this.onresult({
        resultIndex: 0,
        results: [[{ transcript }]]
      });
    }
  }
  
  // Helper to simulate an error
  simulateError(errorType: string) {
    if (this.onerror) {
      this.onerror({ error: errorType });
    }
  }
  
  // Helper to simulate recognition end
  simulateEnd() {
    if (this.onend) {
      this.onend();
    }
  }
}

// Mock the global SpeechRecognition object
const mockSpeechRecognition = new MockSpeechRecognition();

// Setup global mocks
vi.stubGlobal('SpeechRecognition', undefined);
vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition);

describe('VoiceInputButton', () => {
  const mockOnCommand = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // Helper function to render the component with toast provider
  const renderWithToast = (ui: React.ReactElement) => {
    return render(
      <ToastProvider>
        {ui}
      </ToastProvider>
    );
  };
  
  it('renders correctly', () => {
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /voice command/i });
    expect(button).toBeInTheDocument();
  });
  
  it('opens dialog when clicked', async () => {
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Check if dialog is opened
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/voice command/i)).toBeInTheDocument();
    });
  });
  
  it('starts listening when dialog is opened', async () => {
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button to open dialog
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Check if recognition started
    await waitFor(() => {
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });
  });
  
  it('processes command when speech is recognized', async () => {
    // Create a new instance for this test
    const mockRecognition = new MockSpeechRecognition();
    vi.spyOn(window, 'webkitSpeechRecognition').mockImplementation(() => mockRecognition);
    
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button to open dialog
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Simulate speech recognition result
    await waitFor(() => {
      // Get the recognition instance and simulate a result
      mockRecognition.simulateResult('show dashboard');
    });
    
    // Wait for command processing
    await waitFor(() => {
      expect(mockOnCommand).toHaveBeenCalledWith('show dashboard');
    }, { timeout: 3000 });
  });
  
  it('handles recognition errors', async () => {
    // Create a new instance for this test
    const mockRecognition = new MockSpeechRecognition();
    vi.spyOn(window, 'webkitSpeechRecognition').mockImplementation(() => mockRecognition);
    
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button to open dialog
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Simulate speech recognition error
    await waitFor(() => {
      mockRecognition.simulateError('not-allowed');
    });
    
    // Check if error handling occurred
    await waitFor(() => {
      expect(mockOnCommand).not.toHaveBeenCalled();
    });
  });
  
  it('stops listening when dialog is closed', async () => {
    // Create a new instance for this test
    const mockRecognition = new MockSpeechRecognition();
    vi.spyOn(window, 'webkitSpeechRecognition').mockImplementation(() => mockRecognition);
    
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button to open dialog
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close the dialog
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    
    // Check if recognition stopped
    await waitFor(() => {
      expect(mockRecognition.stop).toHaveBeenCalled();
    });
  });
  
  it('renders with custom size and variant', () => {
    renderWithToast(
      <VoiceInputButton 
        onCommand={mockOnCommand} 
        size="sm" 
        variant="secondary" 
      />
    );
    
    const button = screen.getByRole('button', { name: /voice command/i });
    expect(button).toHaveClass('secondary');
  });
  
  it('shows available commands in the dialog', async () => {
    renderWithToast(<VoiceInputButton onCommand={mockOnCommand} />);
    
    // Click the button to open dialog
    const button = screen.getByRole('button', { name: /voice command/i });
    fireEvent.click(button);
    
    // Check if available commands are shown
    await waitFor(() => {
      expect(screen.getByText(/available commands/i)).toBeInTheDocument();
      expect(screen.getByText(/show dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/show schedule/i)).toBeInTheDocument();
    });
  });
});
