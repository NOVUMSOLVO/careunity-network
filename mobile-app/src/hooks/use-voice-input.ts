import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechVolumeChangeEvent
} from '../utils/dummy-voice';
import { useLanguage } from '../contexts/language-context';
import { useAccessibility } from '../contexts/accessibility-context';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Command type
export type VoiceCommand = {
  command: string;
  action: () => void;
  aliases?: string[];
  description?: string;
};

interface VoiceInputOptions {
  autoStart?: boolean;
  continuous?: boolean;
  onCommand?: (command: string) => void;
  commandMode?: boolean;
  language?: string;
  partialResults?: boolean;
  onVolumeChange?: (e: SpeechVolumeChangeEvent) => void;
  onStart?: (e: SpeechStartEvent) => void;
  onEnd?: (e: SpeechEndEvent) => void;
  onError?: (e: SpeechErrorEvent) => void;
  onResult?: (transcript: string) => void;
  onPartialResult?: (transcript: string) => void;
  commands?: VoiceCommand[];
  commandThreshold?: number;
  provideFeedback?: boolean;
  hapticFeedback?: boolean;
  audioFeedback?: boolean;
}

interface VoiceInputResult {
  text: string;
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  supported: boolean;
  volume: number;
  recognizedCommand: VoiceCommand | null;
  partialTranscript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
  resetText: () => void;
  speak: (text: string) => void;
  cancelSpeech: () => void;
}

export function useVoiceInput(options: VoiceInputOptions = {}): VoiceInputResult {
  const { language: contextLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isScreenReaderEnabled, fontScale, reduceMotion } = useAccessibility();

  const {
    autoStart = false,
    continuous = false,
    language: optionsLanguage,
    partialResults = true,
    onVolumeChange,
    onStart,
    onEnd,
    onError,
    onResult,
    onPartialResult,
    commandMode = false,
    commands = [],
    commandThreshold = 0.7,
    provideFeedback = true,
    hapticFeedback = true,
    audioFeedback = true,
    onCommand,
  } = options;

  const [text, setText] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recognizedCommand, setRecognizedCommand] = useState<VoiceCommand | null>(null);

  // Refs for values that might change during callbacks
  const continuousRef = useRef(continuous);
  const commandsRef = useRef(commands);
  const commandModeRef = useRef(commandMode);
  const commandThresholdRef = useRef(commandThreshold);

  // Update refs when props change
  useEffect(() => {
    continuousRef.current = continuous;
    commandsRef.current = commands;
    commandModeRef.current = commandMode;
    commandThresholdRef.current = commandThreshold;
  }, [continuous, commands, commandMode, commandThreshold]);

  // Map language codes to Voice API format
  const getVoiceLanguage = useCallback(() => {
    // Use explicitly provided language first, then context language
    const langCode = optionsLanguage || contextLanguage;

    switch (langCode) {
      case 'en':
        return 'en-US';
      case 'es':
        return 'es-ES';
      case 'fr':
        return 'fr-FR';
      case 'de':
        return 'de-DE';
      case 'it':
        return 'it-IT';
      case 'pt':
        return 'pt-PT';
      case 'zh':
        return 'zh-CN';
      case 'ja':
        return 'ja-JP';
      case 'ko':
        return 'ko-KR';
      case 'ru':
        return 'ru-RU';
      case 'ar':
        return 'ar-SA';
      default:
        // If it's already in locale format (e.g., en-GB), use it directly
        if (/^[a-z]{2}-[A-Z]{2}$/.test(langCode)) {
          return langCode;
        }
        return 'en-US';
    }
  }, [optionsLanguage, contextLanguage]);

  // Function to check if text matches a command
  const matchCommand = useCallback((text: string): VoiceCommand | null => {
    if (!commandModeRef.current || !text || commandsRef.current.length === 0) {
      return null;
    }

    const normalizedText = text.toLowerCase().trim();

    // First check for exact matches
    for (const command of commandsRef.current) {
      if (
        normalizedText === command.command.toLowerCase() ||
        (command.aliases && command.aliases.some(alias => normalizedText === alias.toLowerCase()))
      ) {
        return command;
      }
    }

    // Then check for partial matches
    for (const command of commandsRef.current) {
      if (
        normalizedText.includes(command.command.toLowerCase()) ||
        (command.aliases && command.aliases.some(alias => normalizedText.includes(alias.toLowerCase())))
      ) {
        return command;
      }
    }

    return null;
  }, []);

  // Function to provide audio feedback
  const provideAudioFeedback = useCallback((message: string) => {
    if (audioFeedback && !isScreenReaderEnabled) {
      Speech.speak(message, {
        language: getVoiceLanguage(),
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, [audioFeedback, isScreenReaderEnabled, getVoiceLanguage]);

  // Initialize Voice
  useEffect(() => {
    const checkVoiceAvailability = async () => {
      try {
        const isAvailable = await Voice.isAvailable();
        setSupported(isAvailable);

        if (isAvailable) {
          await Voice.initialize();
        }
      } catch (e) {
        console.error('Failed to initialize Voice:', e);
        setSupported(false);
        setError(t('voiceInput.notSupported'));
      }
    };

    checkVoiceAvailability();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [t]);

  // Set up Voice event listeners
  useEffect(() => {
    // Handle speech start
    const handleSpeechStart = (e: SpeechStartEvent) => {
      setIsListening(true);
      setError(null);

      // Provide feedback
      if (provideFeedback && audioFeedback && !isScreenReaderEnabled) {
        provideAudioFeedback(t('voiceInput.listening'));
      }

      // Haptic feedback
      if (provideFeedback && hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Call the onStart callback if provided
      if (onStart) {
        onStart(e);
      }
    };

    // Handle speech end
    const handleSpeechEnd = (e: SpeechEndEvent) => {
      setIsListening(false);

      if (!continuousRef.current) {
        setIsProcessing(true);
      } else {
        // Restart listening after a short delay if in continuous mode
        setTimeout(() => {
          if (continuousRef.current && !isProcessing) {
            startListening();
          }
        }, 1000);
      }

      // Call the onEnd callback if provided
      if (onEnd) {
        onEnd(e);
      }
    };

    // Handle speech results
    const handleSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const recognizedText = e.value[0];
        setText(recognizedText);

        // Check for commands if in command mode
        if (commandModeRef.current) {
          const matched = matchCommand(recognizedText);

          if (matched) {
            setRecognizedCommand(matched);

            // Provide feedback
            if (provideFeedback) {
              if (hapticFeedback && Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              if (audioFeedback && !isScreenReaderEnabled) {
                provideAudioFeedback(t('voiceInput.commandRecognized', { command: matched.command }));
              }
            }

            // Execute the command
            matched.action();

            // Also call the legacy onCommand if provided
            if (onCommand) {
              onCommand(recognizedText);
            }
          } else if (onCommand) {
            // Call the legacy onCommand with the text even if no command was matched
            onCommand(recognizedText);
          }
        } else if (onCommand) {
          // Call the legacy onCommand if not in command mode but onCommand is provided
          onCommand(recognizedText);
        }

        // Call the onResult callback if provided
        if (onResult) {
          onResult(recognizedText);
        }

        setIsProcessing(false);
      }
    };

    // Handle speech error
    const handleSpeechError = (e: SpeechErrorEvent) => {
      setIsListening(false);
      setIsProcessing(false);
      setError(e.error?.message || t('voiceInput.error'));

      // Provide feedback
      if (provideFeedback) {
        if (hapticFeedback && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        if (audioFeedback && !isScreenReaderEnabled) {
          provideAudioFeedback(t('voiceInput.error'));
        }
      }

      // Call the onError callback if provided
      if (onError) {
        onError(e);
      }
    };

    // Handle partial results
    const handlePartialResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setPartialTranscript(text);
        setText(text); // Also update the main text for backward compatibility

        // Call the onPartialResult callback if provided
        if (onPartialResult) {
          onPartialResult(text);
        }
      }
    };

    // Handle volume change
    const handleVolumeChange = (e: SpeechVolumeChangeEvent) => {
      setVolume(e.value);

      // Call the onVolumeChange callback if provided
      if (onVolumeChange) {
        onVolumeChange(e);
      }
    };

    // Set up event handlers
    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechEnd = handleSpeechEnd;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechPartialResults = handlePartialResults;
    Voice.onSpeechVolumeChanged = handleVolumeChange;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [
    t,
    provideFeedback,
    hapticFeedback,
    audioFeedback,
    isScreenReaderEnabled,
    onStart,
    onEnd,
    onError,
    onResult,
    onPartialResult,
    onVolumeChange,
    onCommand,
    matchCommand,
    provideAudioFeedback,
    isProcessing,
    startListening
  ]);

  // Auto-start listening if enabled
  useEffect(() => {
    if (options.autoStart) {
      startListening();
    }

    return () => {
      if (isListening) {
        Voice.stop();
      }
    };
  }, [options.autoStart]);

  // Start listening
  const startListening = async () => {
    try {
      setError(null);
      setText('');
      setPartialTranscript('');
      setRecognizedCommand(null);
      setIsProcessing(false);

      // Provide haptic feedback
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (isListening) {
        await Voice.stop();
      }

      // Determine language to use
      const recognitionLanguage = getVoiceLanguage();

      // Start voice recognition
      await Voice.start(recognitionLanguage, {
        partialResults,
        continuous: continuousRef.current,
      });
    } catch (e: any) {
      console.error('Error starting voice recognition:', e);
      setError(e.message || t('voiceInput.error'));
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);

        // Provide haptic feedback
        if (hapticFeedback && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
      setError(t('voiceInput.stopError'));
      setIsListening(false);
    }
  };

  // Cancel listening
  const cancelListening = async () => {
    try {
      await Voice.cancel();
      setIsListening(false);
      setIsProcessing(false);
      setText('');
      setPartialTranscript('');
      setRecognizedCommand(null);

      // Provide haptic feedback
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      console.error('Error canceling voice recognition:', e);
      setError(t('voiceInput.cancelError'));
      setIsListening(false);
    }
  };

  // Reset text
  const resetText = () => {
    setText('');
  };

  // Text-to-speech function
  const speak = async (textToSpeak: string) => {
    // Don't speak if screen reader is enabled to avoid conflicts
    if (isScreenReaderEnabled) {
      return;
    }

    try {
      if (isSpeaking) {
        await Speech.stop();
      }

      setIsSpeaking(true);

      Speech.speak(textToSpeak, {
        language: getVoiceLanguage(),
        onDone: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
        },
      });
    } catch (e) {
      console.error('Error with text-to-speech:', e);
      setIsSpeaking(false);
    }
  };

  // Cancel speech
  const cancelSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  return {
    text,
    isListening,
    isProcessing,
    error,
    supported,
    volume,
    recognizedCommand,
    partialTranscript,
    startListening,
    stopListening,
    cancelListening,
    resetText,
    speak,
    cancelSpeech,
  };
}
