/**
 * Voice Recognition Hook
 * 
 * This hook provides a React interface for the Web Speech API.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Voice recognition options
interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
}

// Voice recognition hook return type
interface UseVoiceRecognitionReturn {
  text: string;
  isRecording: boolean;
  isSupported: boolean;
  status: 'idle' | 'recording' | 'processing' | 'error';
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

/**
 * Hook for voice recognition
 */
export function useVoiceRecognition(options: VoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const [text, setText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  // Default options
  const defaultOptions: VoiceRecognitionOptions = {
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    maxAlternatives: 1,
  };
  
  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Recognition instance ref
  const recognitionRef = useRef<any>(null);
  
  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);
  
  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Set options
      recognition.continuous = mergedOptions.continuous || false;
      recognition.interimResults = mergedOptions.interimResults || false;
      recognition.lang = mergedOptions.lang || 'en-US';
      recognition.maxAlternatives = mergedOptions.maxAlternatives || 1;
      
      // Set up event handlers
      recognition.onstart = () => {
        setIsRecording(true);
        setStatus('recording');
        setError(null);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setStatus('idle');
      };
      
      recognition.onerror = (event: any) => {
        setError(`Error: ${event.error}`);
        setStatus('error');
        setIsRecording(false);
      };
      
      recognition.onresult = (event: any) => {
        setStatus('processing');
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setText(finalTranscript || interimTranscript);
        
        if (finalTranscript && !mergedOptions.continuous) {
          recognition.stop();
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [isSupported, mergedOptions.continuous, mergedOptions.interimResults, mergedOptions.lang, mergedOptions.maxAlternatives]);
  
  // Start recording
  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    if (isRecording) {
      return;
    }
    
    try {
      recognitionRef.current?.start();
    } catch (error) {
      setError(`Error starting recognition: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [isRecording, isSupported]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }
    
    try {
      recognitionRef.current?.stop();
    } catch (error) {
      setError(`Error stopping recognition: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [isRecording]);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setText('');
  }, []);
  
  return {
    text,
    isRecording,
    isSupported,
    status,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
