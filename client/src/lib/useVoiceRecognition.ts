import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

type RecognitionStatus = 'inactive' | 'recording' | 'paused' | 'error';

interface UseVoiceRecognitionReturn {
  text: string;
  isRecording: boolean;
  status: RecognitionStatus;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
  supported: boolean;
}

const useVoiceRecognition = (options: VoiceRecognitionOptions = {}): UseVoiceRecognitionReturn => {
  const [text, setText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<RecognitionStatus>('inactive');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState<boolean>(false);

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

    const handleResult = (event: SpeechRecognitionEvent) => {
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

      setText(prevText => {
        return prevText + finalTranscript + ' ';
      });
    };

    const handleError = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setStatus('error');
      setIsRecording(false);
    };

    const handleEnd = () => {
      if (isRecording) {
        // If it was recording, restart it (continuous mode)
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors from trying to start again too quickly
        }
      } else {
        setStatus('inactive');
      }
    };

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [recognition, isRecording]);

  const startRecording = useCallback(() => {
    setError(null);
    if (!recognition) return;

    try {
      recognition.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      setStatus('error');
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setIsRecording(false);
    setStatus('inactive');
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setText('');
  }, []);

  return {
    text,
    isRecording,
    status,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
    supported
  };
};

export default useVoiceRecognition;
