import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, List, Divider, Switch, RadioButton, Button, Slider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../navigation/types';

type AccessibilitySettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AccessibilitySettings'>;

const AccessibilitySettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AccessibilitySettingsScreenNavigationProp>();
  const theme = useTheme();
  
  // In a real app, these would come from a context or state management
  const [fontSize, setFontSize] = useState('medium');
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);
  const [boldTextEnabled, setBoldTextEnabled] = useState(false);
  const [colorCorrectionMode, setColorCorrectionMode] = useState('none');
  
  const handleHighContrastToggle = () => {
    setHighContrastEnabled(!highContrastEnabled);
    // In a real app, this would update the appropriate context/settings
  };
  
  const handleReducedMotionToggle = () => {
    setReducedMotionEnabled(!reducedMotionEnabled);
    // In a real app, this would update the appropriate context/settings
  };
  
  const handleScreenReaderToggle = () => {
    setScreenReaderEnabled(!screenReaderEnabled);
    // In a real app, this would configure screen reader settings
  };
  
  const handleBoldTextToggle = () => {
    setBoldTextEnabled(!boldTextEnabled);
    // In a real app, this would update the text style settings
  };
  
  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>{t('accessibility.textSettings')}</List.Subheader>
        
        <List.Item
          title={t('accessibility.fontSize')}
          description={t(`accessibility.fontSizeOption${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`)}
        />
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={value => setFontSize(value)} value={fontSize}>
            <View style={styles.radioOption}>
              <RadioButton value="small" />
              <Text style={styles.radioLabel}>{t('accessibility.fontSizeSmall')}</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="medium" />
              <Text style={styles.radioLabel}>{t('accessibility.fontSizeMedium')}</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="large" />
              <Text style={styles.radioLabel}>{t('accessibility.fontSizeLarge')}</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <Divider />
        
        <List.Item
          title={t('accessibility.fontScale')}
          description={`${(fontScale * 100).toFixed(0)}%`}
        />
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>80%</Text>
          <Slider
            value={fontScale}
            onValueChange={setFontScale}
            minimumValue={0.8}
            maximumValue={1.5}
            step={0.1}
            style={styles.slider}
          />
          <Text style={styles.sliderLabel}>150%</Text>
        </View>
        
        <Divider />
        
        <List.Item
          title={t('accessibility.boldText')}
          description={t('accessibility.boldTextDesc')}
          right={props => <Switch value={boldTextEnabled} onValueChange={handleBoldTextToggle} />}
        />
      </List.Section>
      
      <List.Section>
        <List.Subheader>{t('accessibility.displaySettings')}</List.Subheader>
        
        <List.Item
          title={t('accessibility.highContrast')}
          description={t('accessibility.highContrastDesc')}
          right={props => <Switch value={highContrastEnabled} onValueChange={handleHighContrastToggle} />}
        />
        
        <Divider />
        
        <List.Item
          title={t('accessibility.colorCorrection')}
          description={t(`accessibility.colorMode${colorCorrectionMode.charAt(0).toUpperCase() + colorCorrectionMode.slice(1)}`)}
        />
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={value => setColorCorrectionMode(value)} value={colorCorrectionMode}>
            <View style={styles.radioOption}>
              <RadioButton value="none" />
              <Text style={styles.radioLabel}>{t('accessibility.colorModeNone')}</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="protanopia" />
              <Text style={styles.radioLabel}>{t('accessibility.colorModeProtanopia')}</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="deuteranopia" />
              <Text style={styles.radioLabel}>{t('accessibility.colorModeDeuteranopia')}</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="tritanopia" />
              <Text style={styles.radioLabel}>{t('accessibility.colorModeTritanopia')}</Text>
            </View>
          </RadioButton.Group>
        </View>
      </List.Section>
      
      <List.Section>
        <List.Subheader>{t('accessibility.motionSettings')}</List.Subheader>
        
        <List.Item
          title={t('accessibility.reducedMotion')}
          description={t('accessibility.reducedMotionDesc')}
          right={props => <Switch value={reducedMotionEnabled} onValueChange={handleReducedMotionToggle} />}
        />
      </List.Section>
      
      <List.Section>
        <List.Subheader>{t('accessibility.screenReader')}</List.Subheader>
        
        <List.Item
          title={t('accessibility.screenReaderSupport')}
          description={t('accessibility.screenReaderDesc')}
          right={props => <Switch value={screenReaderEnabled} onValueChange={handleScreenReaderToggle} />}
        />
        
        <List.Item
          title={t('accessibility.screenReaderTutorial')}
          description={t('accessibility.screenReaderTutorialDesc')}
          onPress={() => console.log('Open screen reader tutorial')}
        />
      </List.Section>
      
      <View style={styles.bottomContainer}>
        <Button 
          mode="contained" 
          icon="refresh" 
          onPress={() => {
            // Reset all settings to defaults
            setFontSize('medium');
            setFontScale(1.0);
            setBoldTextEnabled(false);
            setHighContrastEnabled(false);
            setColorCorrectionMode('none');
            setReducedMotionEnabled(false);
            setScreenReaderEnabled(false);
          }}
          style={styles.resetButton}
        >
          {t('accessibility.resetToDefaults')}
        </Button>
        
        <Text style={styles.noteText}>{t('accessibility.relaunchNote')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  radioGroup: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    width: 40,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default AccessibilitySettingsScreen;
