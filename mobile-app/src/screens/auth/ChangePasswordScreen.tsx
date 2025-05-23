import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../contexts/auth-context';
import { useOffline } from '../../contexts/offline-context';
import { RootStackParamList } from '../../navigation/types';

type ChangePasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  const { changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = t('changePassword.currentPasswordRequired');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('changePassword.newPasswordRequired');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('changePassword.passwordTooShort');
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = t('changePassword.passwordNeedsUppercase');
    } else if (!/(?=.*[0-9])/.test(newPassword)) {
      newErrors.newPassword = t('changePassword.passwordNeedsNumber');
    } else if (!/(?=.*[!@#$%^&*])/.test(newPassword)) {
      newErrors.newPassword = t('changePassword.passwordNeedsSpecial');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('changePassword.confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('changePassword.passwordsDontMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !isOnline) return;
    
    try {
      setIsSubmitting(true);
      setSuccess(false);
      
      await changePassword(currentPassword, newPassword);
      
      // Clear form and show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      
      // Navigate back after a delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('current password')) {
          setErrors({ currentPassword: t('changePassword.incorrectPassword') });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: t('changePassword.genericError') });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    
    let strength = 0;
    
    // Length check
    if (newPassword.length >= 8) strength += 1;
    if (newPassword.length >= 12) strength += 1;
    
    // Character variety
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[!@#$%^&*]/.test(newPassword)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  const renderPasswordStrength = () => {
    if (!newPassword) return null;
    
    const strength = getPasswordStrength();
    let color = theme.colors.error;
    let text = t('changePassword.passwordWeak');
    
    if (strength >= 4) {
      color = theme.colors.primary;
      text = t('changePassword.passwordStrong');
    } else if (strength >= 3) {
      color = theme.colors.secondary;
      text = t('changePassword.passwordGood');
    } else if (strength >= 2) {
      color = theme.colors.warning;
      text = t('changePassword.passwordFair');
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {!isOnline && (
          <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
          </View>
        )}
        
        {success && (
          <View style={[styles.successContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={{ color: theme.colors.onPrimaryContainer }}>{t('changePassword.success')}</Text>
          </View>
        )}
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('changePassword.title')}</Text>
          <Text style={styles.subtitle}>{t('changePassword.subtitle')}</Text>
          
          <TextInput
            label={t('changePassword.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!currentPasswordVisible}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={currentPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() => setCurrentPasswordVisible(!currentPasswordVisible)}
              />
            }
            error={!!errors.currentPassword}
          />
          {errors.currentPassword && (
            <HelperText type="error" visible={true}>
              {errors.currentPassword}
            </HelperText>
          )}
          
          <TextInput
            label={t('changePassword.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!newPasswordVisible}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={newPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() => setNewPasswordVisible(!newPasswordVisible)}
              />
            }
            error={!!errors.newPassword}
          />
          {renderPasswordStrength()}
          {errors.newPassword && (
            <HelperText type="error" visible={true}>
              {errors.newPassword}
            </HelperText>
          )}
          
          <TextInput
            label={t('changePassword.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
          
          {errors.general && (
            <HelperText type="error" visible={true}>
              {errors.general}
            </HelperText>
          )}
          
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>{t('changePassword.requirements')}</Text>
            <View style={styles.requirementItem}>
              <Icon
                name={newPassword.length >= 8 ? 'check-circle' : 'circle-outline'}
                size={16}
                color={newPassword.length >= 8 ? theme.colors.primary : theme.colors.outline}
                style={styles.requirementIcon}
              />
              <Text style={styles.requirementText}>{t('changePassword.requirementLength')}</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                size={16}
                color={/[A-Z]/.test(newPassword) ? theme.colors.primary : theme.colors.outline}
                style={styles.requirementIcon}
              />
              <Text style={styles.requirementText}>{t('changePassword.requirementUppercase')}</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                size={16}
                color={/[0-9]/.test(newPassword) ? theme.colors.primary : theme.colors.outline}
                style={styles.requirementIcon}
              />
              <Text style={styles.requirementText}>{t('changePassword.requirementNumber')}</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name={/[!@#$%^&*]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                size={16}
                color={/[!@#$%^&*]/.test(newPassword) ? theme.colors.primary : theme.colors.outline}
                style={styles.requirementIcon}
              />
              <Text style={styles.requirementText}>{t('changePassword.requirementSpecial')}</Text>
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !isOnline}
              style={styles.submitButton}
            >
              {t('changePassword.changePassword')}
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
  },
  offlineBar: {
    padding: 8,
    alignItems: 'center',
  },
  successContainer: {
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
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
  passwordRequirements: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
  },
});

export default ChangePasswordScreen;
