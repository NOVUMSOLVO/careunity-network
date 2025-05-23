import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/language-context';

interface VoiceInputProps {
  onCommand?: (command: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onCommand, 
  onTextChange,
  placeholder = 'Voice commands...'
}) => {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set up speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    
    // Set language based on current app language
    switch (language) {
      case 'en':
        recognition.lang = 'en-US';
        break;
      case 'es':
        recognition.lang = 'es-ES';
        break;
      case 'fr':
        recognition.lang = 'fr-FR';
        break;
      default:
        recognition.lang = 'en-US';
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setText(transcript);
      
      if (event.results[0].isFinal) {
        if (onTextChange) {
          onTextChange(transcript);
        }
        
        if (onCommand) {
          onCommand(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Store recognition instance in window to access it later
    window.speechRecognition = recognition;

    return () => {
      if (window.speechRecognition) {
        window.speechRecognition.abort();
      }
    };
  }, [language, onCommand, onTextChange]);

  const toggleListening = () => {
    if (isListening) {
      window.speechRecognition?.abort();
    } else {
      setText('');
      window.speechRecognition?.start();
    }
  };

  return (
    <div className="voice-input">
      <button
        onClick={toggleListening}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        <span className="icon">🎤</span>
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      {isListening && (
        <div className="listening-indicator">
          Listening...
        </div>
      )}
    </div>
  );
};

// Add SpeechRecognition to Window interface
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
    speechRecognition?: any;
  }
}

export default VoiceInput;
