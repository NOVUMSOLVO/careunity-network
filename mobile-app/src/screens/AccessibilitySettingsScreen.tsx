/**
 * Accessibility Settings Screen
 * 
 * Allows users to customize accessibility settings for the app.
 * Features:
 * - Font size adjustment
 * - Color scheme selection
 * - High contrast mode
 * - Reduced motion
 * - Text alignment
 * - Bold text
 * - Button size
 * - Haptic feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAccessibility, FontSize, ColorScheme, TextAlignment } from '../contexts/accessibility-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const AccessibilitySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
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
    
    // Helper functions
    getAccessibleFontSize,
    announceScreenReader,
  } = useAccessibility();

  // Font size options
  const fontSizeOptions: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extra-large' },
  ];

  // Color scheme options
  const colorSchemeOptions: { label: string; value: ColorScheme }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'High Contrast', value: 'high-contrast' },
  ];

  // Text alignment options
  const textAlignmentOptions: { label: string; value: TextAlignment }[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];

  // Button size options
  const buttonSizeOptions: { label: string; value: 'small' | 'medium' | 'large' }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  // Handle font size change
  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize);
    triggerHapticFeedback('light');
    announceScreenReader(`Font size changed to ${newSize}`);
  };

  // Handle color scheme change
  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    triggerHapticFeedback('light');
    announceScreenReader(`Color scheme changed to ${newScheme}`);
  };

  // Handle text alignment change
  const handleTextAlignmentChange = (newAlignment: TextAlignment) => {
    setTextAlignment(newAlignment);
    triggerHapticFeedback('light');
    announceScreenReader(`Text alignment changed to ${newAlignment}`);
  };

  // Handle button size change
  const handleButtonSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setButtonSize(newSize);
    triggerHapticFeedback('light');
    announceScreenReader(`Button size changed to ${newSize}`);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: actualColorScheme === 'dark' ? '#121212' : '#f5f5f5' }
    ]}>
      <StatusBar style={actualColorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={getAccessibleFontSize(24)}
            color={actualColorScheme === 'dark' ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          {
            color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: getAccessibleFontSize(20),
            fontWeight: boldText ? 'bold' : 'normal',
            textAlign: textAlignment,
          }
        ]}>
          Accessibility Settings
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Font Size Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
              fontSize: getAccessibleFontSize(18),
              fontWeight: boldText ? 'bold' : 'normal',
              textAlign: textAlignment,
            }
          ]}>
            Font Size
          </Text>
          <View style={styles.optionsContainer}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  fontSize === option.value && styles.selectedOption,
                  {
                    backgroundColor: fontSize === option.value
                      ? (actualColorScheme === 'dark' ? '#3f51b5' : '#2196f3')
                      : (actualColorScheme === 'dark' ? '#333333' : '#e0e0e0'),
                    minHeight: buttonSize === 'small' ? 40 : buttonSize === 'large' ? 60 : 50,
                  }
                ]}
                onPress={() => handleFontSizeChange(option.value)}
                accessibilityLabel={`${option.label} font size`}
                accessibilityRole="radio"
                accessibilityState={{ checked: fontSize === option.value }}
              >
                <Text style={[
                  styles.optionText,
                  {
                    color: fontSize === option.value ? '#ffffff' : (actualColorScheme === 'dark' ? '#ffffff' : '#000000'),
                    fontSize: getAccessibleFontSize(option.value === 'small' ? 14 : option.value === 'medium' ? 16 : option.value === 'large' ? 18 : 20),
                    fontWeight: boldText ? 'bold' : 'normal',
                    textAlign: textAlignment,
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Color Scheme Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
              fontSize: getAccessibleFontSize(18),
              fontWeight: boldText ? 'bold' : 'normal',
              textAlign: textAlignment,
            }
          ]}>
            Color Scheme
          </Text>
          <View style={styles.optionsContainer}>
            {colorSchemeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  colorScheme === option.value && styles.selectedOption,
                  {
                    backgroundColor: colorScheme === option.value
                      ? (actualColorScheme === 'dark' ? '#3f51b5' : '#2196f3')
                      : (actualColorScheme === 'dark' ? '#333333' : '#e0e0e0'),
                    minHeight: buttonSize === 'small' ? 40 : buttonSize === 'large' ? 60 : 50,
                  }
                ]}
                onPress={() => handleColorSchemeChange(option.value)}
                accessibilityLabel={`${option.label} color scheme`}
                accessibilityRole="radio"
                accessibilityState={{ checked: colorScheme === option.value }}
              >
                <Text style={[
                  styles.optionText,
                  {
                    color: colorScheme === option.value ? '#ffffff' : (actualColorScheme === 'dark' ? '#ffffff' : '#000000'),
                    fontSize: getAccessibleFontSize(16),
                    fontWeight: boldText ? 'bold' : 'normal',
                    textAlign: textAlignment,
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Text Alignment Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
              fontSize: getAccessibleFontSize(18),
              fontWeight: boldText ? 'bold' : 'normal',
              textAlign: textAlignment,
            }
          ]}>
            Text Alignment
          </Text>
          <View style={styles.optionsContainer}>
            {textAlignmentOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  textAlignment === option.value && styles.selectedOption,
                  {
                    backgroundColor: textAlignment === option.value
                      ? (actualColorScheme === 'dark' ? '#3f51b5' : '#2196f3')
                      : (actualColorScheme === 'dark' ? '#333333' : '#e0e0e0'),
                    minHeight: buttonSize === 'small' ? 40 : buttonSize === 'large' ? 60 : 50,
                  }
                ]}
                onPress={() => handleTextAlignmentChange(option.value)}
                accessibilityLabel={`${option.label} text alignment`}
                accessibilityRole="radio"
                accessibilityState={{ checked: textAlignment === option.value }}
              >
                <Text style={[
                  styles.optionText,
                  {
                    color: textAlignment === option.value ? '#ffffff' : (actualColorScheme === 'dark' ? '#ffffff' : '#000000'),
                    fontSize: getAccessibleFontSize(16),
                    fontWeight: boldText ? 'bold' : 'normal',
                    textAlign: option.value,
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Button Size Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
              fontSize: getAccessibleFontSize(18),
              fontWeight: boldText ? 'bold' : 'normal',
              textAlign: textAlignment,
            }
          ]}>
            Button Size
          </Text>
          <View style={styles.optionsContainer}>
            {buttonSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  buttonSize === option.value && styles.selectedOption,
                  {
                    backgroundColor: buttonSize === option.value
                      ? (actualColorScheme === 'dark' ? '#3f51b5' : '#2196f3')
                      : (actualColorScheme === 'dark' ? '#333333' : '#e0e0e0'),
                    minHeight: option.value === 'small' ? 40 : option.value === 'large' ? 60 : 50,
                  }
                ]}
                onPress={() => handleButtonSizeChange(option.value)}
                accessibilityLabel={`${option.label} button size`}
                accessibilityRole="radio"
                accessibilityState={{ checked: buttonSize === option.value }}
              >
                <Text style={[
                  styles.optionText,
                  {
                    color: buttonSize === option.value ? '#ffffff' : (actualColorScheme === 'dark' ? '#ffffff' : '#000000'),
                    fontSize: getAccessibleFontSize(option.value === 'small' ? 14 : option.value === 'large' ? 18 : 16),
                    fontWeight: boldText ? 'bold' : 'normal',
                    textAlign: textAlignment,
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Toggle Switches Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
              fontSize: getAccessibleFontSize(18),
              fontWeight: boldText ? 'bold' : 'normal',
              textAlign: textAlignment,
            }
          ]}>
            Additional Settings
          </Text>
          
          {/* Bold Text */}
          <View style={styles.switchRow}>
            <Text style={[
              styles.switchLabel,
              {
                color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
                fontSize: getAccessibleFontSize(16),
                fontWeight: boldText ? 'bold' : 'normal',
                textAlign: textAlignment,
              }
            ]}>
              Bold Text
            </Text>
            <Switch
              value={boldText}
              onValueChange={(value) => {
                setBoldText(value);
                triggerHapticFeedback('light');
                announceScreenReader(`Bold text ${value ? 'enabled' : 'disabled'}`);
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={boldText ? '#2196f3' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              accessibilityLabel="Bold text"
              accessibilityRole="switch"
              accessibilityState={{ checked: boldText }}
            />
          </View>
          
          {/* Reduced Motion */}
          <View style={styles.switchRow}>
            <Text style={[
              styles.switchLabel,
              {
                color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
                fontSize: getAccessibleFontSize(16),
                fontWeight: boldText ? 'bold' : 'normal',
                textAlign: textAlignment,
              }
            ]}>
              Reduced Motion
            </Text>
            <Switch
              value={isReducedMotion}
              onValueChange={(value) => {
                setReducedMotion(value);
                triggerHapticFeedback('light');
                announceScreenReader(`Reduced motion ${value ? 'enabled' : 'disabled'}`);
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isReducedMotion ? '#2196f3' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              accessibilityLabel="Reduced motion"
              accessibilityRole="switch"
              accessibilityState={{ checked: isReducedMotion }}
            />
          </View>
          
          {/* Haptic Feedback */}
          {Platform.OS !== 'web' && (
            <View style={styles.switchRow}>
              <Text style={[
                styles.switchLabel,
                {
                  color: actualColorScheme === 'dark' ? '#ffffff' : '#000000',
                  fontSize: getAccessibleFontSize(16),
                  fontWeight: boldText ? 'bold' : 'normal',
                  textAlign: textAlignment,
                }
              ]}>
                Haptic Feedback
              </Text>
              <Switch
                value={isHapticFeedbackEnabled}
                onValueChange={(value) => {
                  setHapticFeedbackEnabled(value);
                  if (value) {
                    triggerHapticFeedback('success');
                  }
                  announceScreenReader(`Haptic feedback ${value ? 'enabled' : 'disabled'}`);
                }}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isHapticFeedbackEnabled ? '#2196f3' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                accessibilityLabel="Haptic feedback"
                accessibilityRole="switch"
                accessibilityState={{ checked: isHapticFeedbackEnabled }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#ffeb3b',
  },
  optionText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
});

export default AccessibilitySettingsScreen;
