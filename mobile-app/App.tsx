import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/auth-context';
import { OfflineProvider } from './src/contexts/offline-context';
import { NotificationProvider } from './src/contexts/notification-context';
import { AccessibilityProvider } from './src/contexts/accessibility-context';
import { LanguageProvider } from './src/contexts/language-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <LanguageProvider>
            <AccessibilityProvider>
              <AuthProvider>
                <OfflineProvider>
                  <NotificationProvider>
                    <AppNavigator />
                    <StatusBar style="auto" />
                  </NotificationProvider>
                </OfflineProvider>
              </AuthProvider>
            </AccessibilityProvider>
          </LanguageProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
