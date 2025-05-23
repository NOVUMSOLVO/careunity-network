import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  commandMode?: boolean;
  onCommand?: (command: string) => void;
}

type RecognitionStatus = 'inactive' | 'recording' | 'processing' | 'done' | 'error';

interface UseVoiceRecognitionReturn {
  text: string;
  isRecording: boolean;
  status: RecognitionStatus;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
  supported: boolean;
  confidence: number;
  speak: (text: string) => void;
  cancelSpeech: () => void;
}

/**
 * Custom hook for voice recognition with enhanced accessibility features
 *
 * @param options Configuration options for voice recognition
 * @returns Voice recognition state and control functions
 */
export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}): UseVoiceRecognitionReturn => {
  const [text, setText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<RecognitionStatus>('inactive');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Check for browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
        const instance = new SpeechRecognition();
        instance.continuous = options.continuous ?? true;
        instance.interimResults = options.interimResults ?? true;
        instance.lang = options.lang ?? 'en-GB';
        instance.maxAlternatives = 3; // Get multiple alternatives for better accuracy
        setRecognition(instance);
      } else {
        setSupported(false);
        setError('Speech recognition is not supported in this browser.');
      }
    }
  }, [options.continuous, options.interimResults, options.lang]);

  // Set up event handlers
  useEffect(() => {
    if (!recognition) return;

    const handleStart = () => {
      setIsRecording(true);
      setStatus('recording');
      setError(null);
    };

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let highestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const currentConfidence = event.results[i][0].confidence;

        // Update highest confidence
        if (currentConfidence > highestConfidence) {
          highestConfidence = currentConfidence;
        }

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update confidence
      setConfidence(highestConfidence);

      // Update text
      if (finalTranscript) {
        setText(prevText => {
          const newText = options.continuous
            ? prevText + finalTranscript + ' '
            : finalTranscript;

          // If in command mode, process the command
          if (options.commandMode && options.onCommand && finalTranscript) {
            setStatus('processing');
            setTimeout(() => {
              options.onCommand?.(newText.trim());
              setStatus('done');
            }, 500);
          }

          return newText;
        });
      }
    };

    const handleError = (event: any) => {
      console.error('Speech recognition error:', event.error);

      let errorMessage = 'Failed to recognize speech. Please try again.';

      // More user-friendly error messages
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found or microphone is disabled.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access.';
          break;
      }

      setError(errorMessage);
      setStatus('error');
      setIsRecording(false);
    };

    const handleEnd = () => {
      if (isRecording && options.continuous && status !== 'processing') {
        // If it was recording and in continuous mode, restart it
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors from trying to start again too quickly
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              setIsRecording(false);
              setStatus('inactive');
            }
          }, 300);
        }
      } else if (status !== 'processing') {
        setIsRecording(false);
        setStatus('done');
      }
    };

    recognition.onstart = handleStart;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [recognition, isRecording, options.continuous, options.commandMode, options.onCommand, status]);

  // Start recording
  const startRecording = useCallback(() => {
    setError(null);
    if (!recognition) return;

    try {
      // Reset text if not in continuous mode
      if (!options.continuous) {
        setText('');
      }

      recognition.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please try again.');
      setStatus('error');
    }
  }, [recognition, options.continuous]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.stop();
      setIsRecording(false);

      // Only set to inactive if not in command mode
      if (!options.commandMode) {
        setStatus('done');
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [recognition, options.commandMode]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setText('');
    setConfidence(0);
  }, []);

  // Text-to-speech function
  const speak = useCallback((textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set language based on options
    utterance.lang = options.lang || 'en-GB';

    // Set voice (try to get a natural sounding voice)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang === utterance.lang && voice.name.includes('Natural')
    ) || voices.find(voice =>
      voice.lang === utterance.lang
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, options.lang]);

  // Cancel speech
  const cancelSpeech = useCallback(() => {
    if ('speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    text,
    isRecording,
    status,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
    supported,
    confidence,
    speak,
    cancelSpeech
  };
};

export default useVoiceRecognition;
