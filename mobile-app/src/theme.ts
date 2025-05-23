import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // Indigo 600
    primaryContainer: '#EEF2FF', // Indigo 50
    secondary: '#8B5CF6', // Violet 500
    secondaryContainer: '#F5F3FF', // Violet 50
    tertiary: '#EC4899', // Pink 500
    tertiaryContainer: '#FCE7F3', // Pink 50
    error: '#EF4444', // Red 500
    errorContainer: '#FEE2E2', // Red 50
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FAFB', // Gray 50
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onBackground: '#1F2937', // Gray 800
    onSurface: '#1F2937', // Gray 800
    onSurfaceVariant: '#4B5563', // Gray 600
    outline: '#E5E7EB', // Gray 200
  },
};
