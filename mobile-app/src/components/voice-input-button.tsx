import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useVoiceInput } from '../hooks/use-voice-input';
import { useAccessibility } from '../contexts/accessibility-context';

interface VoiceInputButtonProps {
  onTextChange?: (text: string) => void;
  onCommand?: (command: string) => void;
  commandMode?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  iconOnly?: boolean;
  placeholder?: string;
  accessibilityLabel?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTextChange,
  onCommand,
  commandMode = false,
  size = 'medium',
  style,
  iconOnly = false,
  placeholder,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isReducedMotion } = useAccessibility();
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const {
    text,
    isListening,
    isProcessing,
    error,
    supported,
    startListening,
    stopListening,
    resetText,
  } = useVoiceInput({
    continuous: !commandMode,
    commandMode,
    onCommand,
  });

  // Pass recognized text to parent component
  useEffect(() => {
    if (onTextChange && text) {
      onTextChange(text);
    }
  }, [text, onTextChange]);

  // Pulse animation for the button when listening
  useEffect(() => {
    if (isListening && !isReducedMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, isReducedMotion, pulseAnim]);

  // Handle button press
  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Get button size based on prop
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 70;
      case 'medium':
      default:
        return 56;
    }
  };

  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      case 'medium':
      default:
        return 24;
    }
  };

  // If voice recognition is not supported, don't render the button
  if (!supported) {
    return null;
  }

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();
  const buttonLabel = isListening 
    ? t('voiceInput.listening')
    : placeholder || t('voiceInput.tap');

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.button,
            {
              backgroundColor: isListening ? theme.colors.error : theme.colors.primary,
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
          ]}
          disabled={isProcessing}
          accessibilityLabel={accessibilityLabel || buttonLabel}
          accessibilityRole="button"
          accessibilityState={{ busy: isListening || isProcessing }}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size={iconSize} />
          ) : (
            <Icon
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={iconSize}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {!iconOnly && (
        <Text
          style={[
            styles.label,
            {
              color: error ? theme.colors.error : theme.colors.onSurface,
            },
          ]}
        >
          {error || buttonLabel}
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
  buttonContainer: {
    marginBottom: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});
