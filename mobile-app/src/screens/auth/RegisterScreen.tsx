import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, Button, HelperText, Checkbox, useTheme } from 'react-native-paper';

import { authApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
  termsAccepted: boolean;
}

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'caregiver', // Default role
    termsAccepted: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('register.fullNameRequired');
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = t('register.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('register.emailInvalid');
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = t('register.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.passwordTooShort');
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = t('register.passwordNeedsUppercase');
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = t('register.passwordNeedsNumber');
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = t('register.passwordNeedsSpecial');
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('register.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordsDontMatch');
    }
    
    // Validate phone (optional but must be valid if provided)
    if (formData.phoneNumber && !/^\+?[0-9\s-()]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t('register.phoneInvalid');
    }
    
    // Validate terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = t('register.termsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear the error for this field if there was one
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Call registration API
      const { data, error } = await authApi.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
      });
      
      if (error) {
        throw new Error(error.message || t('register.genericError'));
      }
      
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email: formData.email });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        // Handle specific API errors
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('email')) {
          setErrors({ email: error.message });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: t('register.genericError') });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    
    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 1;
    if (formData.password.length >= 12) strength += 1;
    
    // Character variety
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[!@#$%^&*]/.test(formData.password)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const strength = getPasswordStrength();
    let color = theme.colors.error;
    let text = t('register.passwordWeak');
    
    if (strength >= 4) {
      color = theme.colors.primary;
      text = t('register.passwordStrong');
    } else if (strength >= 3) {
      color = theme.colors.secondary;
      text = t('register.passwordGood');
    } else if (strength >= 2) {
      color = theme.colors.warning;
      text = t('register.passwordFair');
    }
    
    return (
      <View style={styles.strengthContainer}>
        <Text style={{ color, ...styles.strengthText }}>{text}</Text>
        <View style={styles.strengthBars}>
          {[1, 2, 3, 4, 5].map(level => (
            <View 
              key={level} 
              style={[
                styles.strengthBar, 
                { 
                  backgroundColor: level <= strength ? color : theme.colors.surfaceVariant,
                  width: `${100/5}%`,
                  marginRight: level < 5 ? 2 : 0
                }
              ]} 
            />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo}
            defaultSource={require('../../assets/icon.png')}
          />
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            label={t('register.fullName')}
            value={formData.fullName}
            onChangeText={(value) => handleChange('fullName', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.fullName}
          />
          {errors.fullName && (
            <HelperText type="error" visible={true}>
              {errors.fullName}
            </HelperText>
          )}
          
          <TextInput
            label={t('register.email')}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          {errors.email && (
            <HelperText type="error" visible={true}>
              {errors.email}
            </HelperText>
          )}
          
          <TextInput
            label={t('register.phoneNumber')}
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange('phoneNumber', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            error={!!errors.phoneNumber}
          />
          {errors.phoneNumber && (
            <HelperText type="error" visible={true}>
              {errors.phoneNumber}
            </HelperText>
          )}
          
          <TextInput
            label={t('register.password')}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry={!passwordVisible}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={passwordVisible ? 'eye-off' : 'eye'}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
            error={!!errors.password}
          />
          {renderPasswordStrength()}
          {errors.password && (
            <HelperText type="error" visible={true}>
              {errors.password}
            </HelperText>
          )}
          
          <TextInput
            label={t('register.confirmPassword')}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry={!confirmPasswordVisible}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              />
            }
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <HelperText type="error" visible={true}>
              {errors.confirmPassword}
            </HelperText>
          )}
          
          <View style={styles.termsContainer}>
            <Checkbox.Android
              status={formData.termsAccepted ? 'checked' : 'unchecked'}
              onPress={() => handleChange('termsAccepted', !formData.termsAccepted)}
            />
            <Text 
              style={styles.termsText}
              onPress={() => handleChange('termsAccepted', !formData.termsAccepted)}
            >
              {t('register.termsAgreement')}
              <Text 
                style={[styles.termsLink, { color: theme.colors.primary }]}
                onPress={() => console.log('Open terms and conditions')}
              >
                {t('register.termsLink')}
              </Text>
            </Text>
          </View>
          {errors.termsAccepted && (
            <HelperText type="error" visible={true}>
              {errors.termsAccepted}
            </HelperText>
          )}
          
          {errors.general && (
            <HelperText type="error" visible={true}>
              {errors.general}
            </HelperText>
          )}
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.registerButton}
          >
            {t('register.registerButton')}
          </Button>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {t('register.alreadyHaveAccount')}
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              {t('register.loginButton')}
            </Button>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  strengthContainer: {
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    marginBottom: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  termsLink: {
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
  },
  loginButton: {
    marginLeft: 8,
  },
});

export default RegisterScreen;
