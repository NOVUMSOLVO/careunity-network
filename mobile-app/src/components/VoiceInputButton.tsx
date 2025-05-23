/**
 * Voice Input Button Component
 * 
 * A reusable button component for voice input with visual feedback.
 * Features:
 * - Visual feedback for listening state
 * - Haptic feedback
 * - Accessibility support
 * - Command recognition
 * - Customizable appearance
 */

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVoiceInput, VoiceCommand } from '../hooks/use-voice-input';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/accessibility-context';
import { useTheme } from 'react-native-paper';

interface VoiceInputButtonProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  commands?: VoiceCommand[];
  commandMode?: boolean;
  continuous?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  iconColor?: string;
  activeColor?: string;
  showTranscript?: boolean;
  transcriptStyle?: TextStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  provideFeedback?: boolean;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onCommand,
  commands = [],
  commandMode = false,
  continuous = false,
  size = 'medium',
  style,
  iconColor,
  activeColor,
  showTranscript = false,
  transcriptStyle,
  disabled = false,
  accessibilityLabel,
  provideFeedback = true,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { fontScale, reduceMotion } = useAccessibility();
  
  // Animation value for the pulse effect
  const pulseAnim = new Animated.Value(1);
  
  // Voice input hook
  const {
    text,
    isListening,
    isProcessing,
    error,
    supported,
    startListening,
    stopListening,
    cancelListening,
    recognizedCommand,
  } = useVoiceInput({
    commandMode,
    continuous,
    commands,
    onCommand,
    provideFeedback,
    hapticFeedback: provideFeedback,
    audioFeedback: provideFeedback,
  });
  
  // Determine button size based on prop
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 40 * fontScale;
      case 'large':
        return 70 * fontScale;
      case 'medium':
      default:
        return 56 * fontScale;
    }
  };
  
  // Determine icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20 * fontScale;
      case 'large':
        return 36 * fontScale;
      case 'medium':
      default:
        return 28 * fontScale;
    }
  };
  
  // Colors
  const buttonColor = iconColor || theme.colors.primary;
  const activeButtonColor = activeColor || theme.colors.secondary;
  
  // Start pulse animation when listening
  useEffect(() => {
    if (isListening && !reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, reduceMotion]);
  
  // Call onTranscript when text changes
  useEffect(() => {
    if (text && onTranscript) {
      onTranscript(text);
    }
  }, [text, onTranscript]);
  
  // Handle button press
  const handlePress = async () => {
    if (disabled) return;
    
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };
  
  // Handle long press to cancel
  const handleLongPress = async () => {
    if (disabled || !isListening) return;
    
    await cancelListening();
  };
  
  // Button size
  const buttonSize = getButtonSize();
  const iconSize = getIconSize();
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            transform: [{ scale: pulseAnim }],
            opacity: isListening ? 0.3 : 0,
            width: buttonSize * 1.5,
            height: buttonSize * 1.5,
            borderRadius: buttonSize * 0.75,
            backgroundColor: activeButtonColor,
          },
        ]}
      />
      
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: isListening ? activeButtonColor : buttonColor,
          },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled || !supported}
        accessibilityLabel={accessibilityLabel || t('voiceInput.button')}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || !supported,
          checked: isListening,
        }}
        accessibilityHint={isListening ? t('voiceInput.stopHint') : t('voiceInput.startHint')}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size={iconSize * 0.8} />
        ) : (
          <MaterialIcons
            name={isListening ? 'mic' : 'mic-none'}
            size={iconSize}
            color="#fff"
          />
        )}
      </TouchableOpacity>
      
      {showTranscript && text && (
        <Text
          style={[
            styles.transcript,
            { fontSize: 16 * fontScale },
            transcriptStyle,
            recognizedCommand && styles.recognizedCommand,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      )}
      
      {error && (
        <Text style={[styles.error, { fontSize: 14 * fontScale }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  transcript: {
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 300,
  },
  recognizedCommand: {
    fontWeight: 'bold',
  },
  error: {
    marginTop: 5,
    color: 'red',
    textAlign: 'center',
  },
});

export default VoiceInputButton;
