import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/auth-context';
import { useAccessibility } from '../../contexts/accessibility-context';
import { RootStackParamList } from '../../navigation/types';
import { VoiceInputButton } from '../../components/voice-input-button';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, error: authError } = useAuth();
  const { fontScale } = useAccessibility();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.loginError'));
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(authError || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  
  // Handle voice input for email
  const handleEmailVoiceInput = (text: string) => {
    // Remove spaces and convert to lowercase
    const formattedEmail = text.replace(/\s+/g, '').toLowerCase();
    setEmail(formattedEmail);
  };
  
  // Calculate font size based on accessibility settings
  const getFontSize = (baseSize: number) => {
    return baseSize * fontScale;
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: theme.colors.primary, fontSize: getFontSize(32) }]}>
            {t('common.appName')}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.primary, fontSize: getFontSize(24) }]}>
            {t('auth.login')}
          </Text>
          
          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error, fontSize: getFontSize(14) }]}>
              {error}
            </Text>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              error={!!error}
              accessibilityLabel={t('auth.email')}
              right={
                <TextInput.Icon 
                  icon="email" 
                  forceTextInputFocus={false}
                />
              }
            />
            
            <View style={styles.voiceInputContainer}>
              <VoiceInputButton
                onTextChange={handleEmailVoiceInput}
                size="small"
                iconOnly
                accessibilityLabel={t('voiceInput.tap')}
              />
            </View>
          </View>
          
          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={[styles.input, styles.passwordInput]}
            mode="outlined"
            error={!!error}
            accessibilityLabel={t('auth.password')}
            right={
              <TextInput.Icon 
                icon={secureTextEntry ? "eye" : "eye-off"} 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                forceTextInputFocus={false}
              />
            }
          />
          
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
            accessibilityRole="button"
            accessibilityLabel={t('auth.forgotPassword')}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary, fontSize: getFontSize(14) }]}>
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            labelStyle={{ fontSize: getFontSize(16) }}
          >
            {t('auth.login')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  appName: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 8,
  },
  voiceInputContainer: {
    position: 'absolute',
    right: 16,
    top: 20,
    zIndex: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    textAlign: 'right',
  },
  loginButton: {
    marginBottom: 16,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
});

export default LoginScreen;
