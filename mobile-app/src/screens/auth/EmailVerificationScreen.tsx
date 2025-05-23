import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Button, TextInput, HelperText, ActivityIndicator, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { authApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type EmailVerificationScreenRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;
type EmailVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmailVerification'>;

const EmailVerificationScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const theme = useTheme();
  
  const { email } = route.params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Set up countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);
  
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError(t('emailVerification.invalidCode'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call verification API
      const { data, error } = await authApi.verifyEmail(email, verificationCode);
      
      if (error) {
        throw new Error(error.message || t('emailVerification.genericError'));
      }
      
      // Show success state
      setVerificationSuccess(true);
      
      // Navigate to login after a delay
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (err) {
      console.error('Verification error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('emailVerification.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call resend API
      const { error } = await authApi.resendVerificationEmail(email);
      
      if (error) {
        throw new Error(error.message || t('emailVerification.resendError'));
      }
      
      // Start cooldown
      setResendCooldown(60);
    } catch (err) {
      console.error('Resend error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('emailVerification.resendError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo}
            defaultSource={require('../../assets/icon.png')}
          />
          
          {verificationSuccess ? (
            <View style={styles.successContainer}>
              <Icon 
                name="check-circle" 
                size={64} 
                color={theme.colors.primary} 
                style={styles.successIcon} 
              />
              <Text style={styles.title}>{t('emailVerification.successTitle')}</Text>
              <Text style={styles.message}>{t('emailVerification.successMessage')}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{t('emailVerification.title')}</Text>
              <Text style={styles.subtitle}>
                {t('emailVerification.subtitle', { email })}
              </Text>
            </>
          )}
        </View>
        
        {!verificationSuccess && (
          <View style={styles.formContainer}>
            <TextInput
              label={t('emailVerification.codeLabel')}
              value={verificationCode}
              onChangeText={setVerificationCode}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              error={!!error}
              disabled={isSubmitting}
            />
            
            {error && (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            )}
            
            <Button
              mode="contained"
              onPress={handleVerifyCode}
              loading={isSubmitting}
              disabled={isSubmitting || !verificationCode}
              style={styles.verifyButton}
            >
              {t('emailVerification.verifyButton')}
            </Button>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>{t('emailVerification.noCodeReceived')}</Text>
              <Button
                mode="text"
                onPress={handleResendCode}
                disabled={isSubmitting || resendCooldown > 0}
                style={styles.resendButton}
              >
                {resendCooldown > 0
                  ? t('emailVerification.resendIn', { seconds: resendCooldown })
                  : t('emailVerification.resendButton')}
              </Button>
            </View>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            >
              {t('emailVerification.backToLogin')}
            </Button>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  verifyButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    marginLeft: 4,
  },
  backButton: {
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});

export default EmailVerificationScreen;
