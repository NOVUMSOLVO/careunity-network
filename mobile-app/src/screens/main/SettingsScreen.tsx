import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme, List, Switch, Divider, RadioButton, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../contexts/auth-context';
import { useNotifications } from '../../contexts/notification-context';
import { useAccessibility, FontSize, ColorScheme } from '../../contexts/accessibility-context';
import { useLanguage, LanguageCode, LANGUAGES } from '../../contexts/language-context';
import { VoiceInputButton } from '../../components/voice-input-button';
import { APP_VERSION } from '../../config';

const SettingsScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { isPushEnabled, togglePushNotifications, requestPushPermissions } = useNotifications();
  const { 
    fontSize, 
    setFontSize, 
    colorScheme, 
    setColorScheme, 
    isHighContrast, 
    setHighContrast, 
    isReducedMotion, 
    setReducedMotion,
    fontScale
  } = useAccessibility();
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('logout')) {
      handleLogout();
    } else if (lowerCommand.includes('language')) {
      // Open language section
    } else if (lowerCommand.includes('dark') || lowerCommand.includes('light')) {
      setColorScheme(lowerCommand.includes('dark') ? 'dark' : 'light');
    } else if (lowerCommand.includes('font') || lowerCommand.includes('size')) {
      if (lowerCommand.includes('large')) {
        setFontSize('large');
      } else if (lowerCommand.includes('small')) {
        setFontSize('small');
      } else {
        setFontSize('medium');
      }
    } else {
      Alert.alert(t('voiceInput.error'), t('voiceInput.helpText'));
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Handle push notification toggle
  const handlePushToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestPushPermissions();
      if (hasPermission) {
        await togglePushNotifications(true);
      } else {
        Alert.alert(
          t('common.error'),
          t('voiceInput.permissionDenied'),
          [{ text: t('common.ok') }]
        );
      }
    } else {
      await togglePushNotifications(false);
    }
  };
  
  // Calculate font size based on accessibility settings
  const getFontSize = (baseSize: number) => {
    return baseSize * fontScale;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getFontSize(24), color: theme.colors.primary }]}>
          {t('settings.title')}
        </Text>
        
        {/* Voice command button */}
        <VoiceInputButton
          commandMode
          onCommand={handleVoiceCommand}
          size="small"
          style={styles.voiceButton}
        />
      </View>
      
      {/* Notifications section */}
      <List.Section>
        <List.Subheader style={{ fontSize: getFontSize(16) }}>{t('settings.notifications')}</List.Subheader>
        <List.Item
          title={t('notifications.pushNotifications')}
          description={t('notifications.pushDescription')}
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <Switch value={isPushEnabled} onValueChange={handlePushToggle} />}
          titleStyle={{ fontSize: getFontSize(16) }}
          descriptionStyle={{ fontSize: getFontSize(14) }}
        />
      </List.Section>
      
      <Divider />
      
      {/* Language section */}
      <List.Section>
        <List.Subheader style={{ fontSize: getFontSize(16) }}>{t('settings.language')}</List.Subheader>
        <List.Accordion
          title={t('profile.language')}
          left={props => <List.Icon {...props} icon="translate" />}
          titleStyle={{ fontSize: getFontSize(16) }}
        >
          {Object.keys(availableLanguages).map((langCode) => (
            <List.Item
              key={langCode}
              title={availableLanguages[langCode as LanguageCode].nativeName}
              onPress={() => setLanguage(langCode as LanguageCode)}
              right={props => 
                language === langCode ? (
                  <List.Icon {...props} icon="check" color={theme.colors.primary} />
                ) : null
              }
              titleStyle={{ fontSize: getFontSize(16) }}
            />
          ))}
        </List.Accordion>
      </List.Section>
      
      <Divider />
      
      {/* Accessibility section */}
      <List.Section>
        <List.Subheader style={{ fontSize: getFontSize(16) }}>{t('settings.accessibility')}</List.Subheader>
        
        {/* Font size */}
        <List.Accordion
          title={t('accessibility.fontSize')}
          left={props => <List.Icon {...props} icon="format-size" />}
          titleStyle={{ fontSize: getFontSize(16) }}
        >
          <RadioButton.Group onValueChange={value => setFontSize(value as FontSize)} value={fontSize}>
            <RadioButton.Item
              label={t('accessibility.small')}
              value="small"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.medium')}
              value="medium"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.large')}
              value="large"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.extraLarge')}
              value="extra-large"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
          </RadioButton.Group>
        </List.Accordion>
        
        {/* Color scheme */}
        <List.Accordion
          title={t('accessibility.colorScheme')}
          left={props => <List.Icon {...props} icon="palette" />}
          titleStyle={{ fontSize: getFontSize(16) }}
        >
          <RadioButton.Group onValueChange={value => setColorScheme(value as ColorScheme)} value={colorScheme}>
            <RadioButton.Item
              label={t('accessibility.light')}
              value="light"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.dark')}
              value="dark"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.system')}
              value="system"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
            <RadioButton.Item
              label={t('accessibility.highContrast')}
              value="high-contrast"
              labelStyle={{ fontSize: getFontSize(16) }}
            />
          </RadioButton.Group>
        </List.Accordion>
        
        {/* Reduced motion */}
        <List.Item
          title={t('accessibility.reducedMotion')}
          description={t('accessibility.reducedMotionDescription')}
          left={props => <List.Icon {...props} icon="motion" />}
          right={props => <Switch value={isReducedMotion} onValueChange={setReducedMotion} />}
          titleStyle={{ fontSize: getFontSize(16) }}
          descriptionStyle={{ fontSize: getFontSize(14) }}
        />
        
        {/* High contrast */}
        <List.Item
          title={t('accessibility.highContrast')}
          left={props => <List.Icon {...props} icon="contrast-box" />}
          right={props => <Switch value={isHighContrast} onValueChange={setHighContrast} />}
          titleStyle={{ fontSize: getFontSize(16) }}
        />
      </List.Section>
      
      <Divider />
      
      {/* About section */}
      <List.Section>
        <List.Subheader style={{ fontSize: getFontSize(16) }}>{t('settings.about')}</List.Subheader>
        <List.Item
          title={t('settings.version')}
          description={APP_VERSION}
          left={props => <List.Icon {...props} icon="information" />}
          titleStyle={{ fontSize: getFontSize(16) }}
          descriptionStyle={{ fontSize: getFontSize(14) }}
        />
      </List.Section>
      
      {/* Logout button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          icon="logout"
        >
          {t('auth.logout')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  voiceButton: {
    marginLeft: 8,
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
  },
});

export default SettingsScreen;
