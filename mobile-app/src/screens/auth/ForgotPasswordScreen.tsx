import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage(t('forgotPassword.emailRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Call reset password API
      const { error } = await authApi.resetPassword(email);
      
      if (error) {
        throw new Error(error.message || t('forgotPassword.genericError'));
      }
      
      setSuccessMessage(t('forgotPassword.successMessage'));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('forgotPassword.genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {t('forgotPassword.title')}
          </Text>
          
          <Text style={styles.description}>
            {t('forgotPassword.description')}
          </Text>
          
          {errorMessage && (
            <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
              {errorMessage}
            </Text>
          )}
          
          {successMessage && (
            <Text style={[styles.successMessage, { color: theme.colors.primary }]}>
              {successMessage}
            </Text>
          )}
          
          <TextInput
            label={t('common.emailAddress')}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            disabled={isLoading || !!successMessage}
          />
          
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading || !!successMessage}
          >
            {t('forgotPassword.resetButton')}
          </Button>
          
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
            disabled={isLoading}
          >
            {t('common.backToLogin')}
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
  },
  formContainer: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: 4,
  },
  backButton: {
    marginTop: 16,
  },
  errorMessage: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
