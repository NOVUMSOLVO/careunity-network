import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, AccessibilityInfo, Platform, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorScheme = 'light' | 'dark' | 'system' | 'high-contrast';
export type TextAlignment = 'left' | 'center' | 'right';

interface AccessibilityContextType {
  // Font settings
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontScale: number;

  // Color settings
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  actualColorScheme: 'light' | 'dark';

  // Motion settings
  isReducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;

  // Screen reader
  isScreenReaderEnabled: boolean;

  // Haptic feedback
  isHapticFeedbackEnabled: boolean;
  setHapticFeedbackEnabled: (enabled: boolean) => void;
  triggerHapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;

  // Text settings
  textAlignment: TextAlignment;
  setTextAlignment: (alignment: TextAlignment) => void;
  boldText: boolean;
  setBoldText: (enabled: boolean) => void;

  // Button settings
  buttonSize: 'small' | 'medium' | 'large';
  setButtonSize: (size: 'small' | 'medium' | 'large') => void;

  // Screen dimensions
  screenWidth: number;
  screenHeight: number;

  // Helper functions
  getAccessibleFontSize: (baseSize: number) => number;
  announceScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme() as 'light' | 'dark';
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Font settings
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [fontScale, setFontScale] = useState(1);

  // Color settings
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system');
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Motion settings
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Screen reader
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  // Haptic feedback
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(true);

  // Text settings
  const [textAlignment, setTextAlignmentState] = useState<TextAlignment>('left');
  const [boldText, setBoldTextState] = useState(false);

  // Button settings
  const [buttonSize, setButtonSizeState] = useState<'small' | 'medium' | 'large'>('medium');

  // Calculate the actual color scheme based on system and user preference
  const actualColorScheme = colorScheme === 'system'
    ? systemColorScheme || 'light'
    : colorScheme === 'high-contrast'
      ? 'light' // High contrast is based on light theme
      : colorScheme as 'light' | 'dark';

  // Listen for screen reader changes
  useEffect(() => {
    const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setIsScreenReaderEnabled(isEnabled);
      }
    );

    // Check initial screen reader status
    AccessibilityInfo.isScreenReaderEnabled().then((isEnabled) => {
      setIsScreenReaderEnabled(isEnabled);
    });

    return () => {
      screenReaderChangedSubscription.remove();
    };
  }, []);

  // Load accessibility settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load font settings
        const storedFontSize = await AsyncStorage.getItem('accessibility_font_size');
        if (storedFontSize) {
          setFontSizeState(storedFontSize as FontSize);
        }

        const storedFontScale = await AsyncStorage.getItem('accessibility_font_scale');
        if (storedFontScale) {
          setFontScale(parseFloat(storedFontScale));
        }

        // Load color settings
        const storedColorScheme = await AsyncStorage.getItem('accessibility_color_scheme');
        if (storedColorScheme) {
          setColorSchemeState(storedColorScheme as ColorScheme);
        }

        const storedHighContrast = await AsyncStorage.getItem('accessibility_high_contrast');
        if (storedHighContrast) {
          setIsHighContrast(storedHighContrast === 'true');
        }

        // Load motion settings
        const storedReducedMotion = await AsyncStorage.getItem('accessibility_reduced_motion');
        if (storedReducedMotion) {
          setIsReducedMotion(storedReducedMotion === 'true');
        }

        // Load haptic feedback settings
        const storedHapticFeedback = await AsyncStorage.getItem('accessibility_haptic_feedback');
        if (storedHapticFeedback) {
          setIsHapticFeedbackEnabled(storedHapticFeedback === 'true');
        }

        // Load text settings
        const storedTextAlignment = await AsyncStorage.getItem('accessibility_text_alignment');
        if (storedTextAlignment) {
          setTextAlignmentState(storedTextAlignment as TextAlignment);
        }

        const storedBoldText = await AsyncStorage.getItem('accessibility_bold_text');
        if (storedBoldText) {
          setBoldTextState(storedBoldText === 'true');
        }

        // Load button settings
        const storedButtonSize = await AsyncStorage.getItem('accessibility_button_size');
        if (storedButtonSize) {
          setButtonSizeState(storedButtonSize as 'small' | 'medium' | 'large');
        }
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Set font size and save to storage
  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    try {
      await AsyncStorage.setItem('accessibility_font_size', size);

      // Update font scale based on font size
      let newScale = 1;
      switch (size) {
        case 'small':
          newScale = 0.85;
          break;
        case 'medium':
          newScale = 1;
          break;
        case 'large':
          newScale = 1.15;
          break;
        case 'extra-large':
          newScale = 1.3;
          break;
      }

      setFontScale(newScale);
      await AsyncStorage.setItem('accessibility_font_scale', newScale.toString());
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  // Set color scheme and save to storage
  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    try {
      await AsyncStorage.setItem('accessibility_color_scheme', scheme);
    } catch (error) {
      console.error('Error saving color scheme:', error);
    }
  };

  // Set high contrast mode and save to storage
  const setHighContrast = async (enabled: boolean) => {
    setIsHighContrast(enabled);
    try {
      await AsyncStorage.setItem('accessibility_high_contrast', enabled.toString());
    } catch (error) {
      console.error('Error saving high contrast setting:', error);
    }
  };

  // Set reduced motion and save to storage
  const setReducedMotion = async (enabled: boolean) => {
    setIsReducedMotion(enabled);
    try {
      await AsyncStorage.setItem('accessibility_reduced_motion', enabled.toString());
    } catch (error) {
      console.error('Error saving reduced motion setting:', error);
    }
  };

  // Set text alignment and save to storage
  const setTextAlignment = async (alignment: TextAlignment) => {
    setTextAlignmentState(alignment);
    try {
      await AsyncStorage.setItem('accessibility_text_alignment', alignment);
    } catch (error) {
      console.error('Error saving text alignment:', error);
    }
  };

  // Set bold text and save to storage
  const setBoldText = async (enabled: boolean) => {
    setBoldTextState(enabled);
    try {
      await AsyncStorage.setItem('accessibility_bold_text', enabled.toString());
    } catch (error) {
      console.error('Error saving bold text setting:', error);
    }
  };

  // Set button size and save to storage
  const setButtonSize = async (size: 'small' | 'medium' | 'large') => {
    setButtonSizeState(size);
    try {
      await AsyncStorage.setItem('accessibility_button_size', size);
    } catch (error) {
      console.error('Error saving button size:', error);
    }
  };

  // Set haptic feedback and save to storage
  const setHapticFeedbackEnabled = async (enabled: boolean) => {
    setIsHapticFeedbackEnabled(enabled);
    try {
      await AsyncStorage.setItem('accessibility_haptic_feedback', enabled.toString());
    } catch (error) {
      console.error('Error saving haptic feedback setting:', error);
    }
  };

  // Trigger haptic feedback
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!isHapticFeedbackEnabled || Platform.OS === 'web') {
      return;
    }

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };

  // Get accessible font size
  const getAccessibleFontSize = (baseSize: number): number => {
    return baseSize * fontScale;
  };

  // Announce message to screen reader
  const announceScreenReader = (message: string): void => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const value = {
    // Font settings
    fontSize,
    setFontSize,
    fontScale,

    // Color settings
    colorScheme,
    setColorScheme,
    isHighContrast,
    setHighContrast,
    actualColorScheme,

    // Motion settings
    isReducedMotion,
    setReducedMotion,

    // Screen reader
    isScreenReaderEnabled,

    // Haptic feedback
    isHapticFeedbackEnabled,
    setHapticFeedbackEnabled,
    triggerHapticFeedback,

    // Text settings
    textAlignment,
    setTextAlignment,
    boldText,
    setBoldText,

    // Button settings
    buttonSize,
    setButtonSize,

    // Screen dimensions
    screenWidth,
    screenHeight,

    // Helper functions
    getAccessibleFontSize,
    announceScreenReader,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
