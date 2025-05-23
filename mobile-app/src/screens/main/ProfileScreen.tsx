import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Avatar, Button, TextInput, Switch, useTheme, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../contexts/auth-context';
import { useOffline } from '../../contexts/offline-context';
import { authApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isOnline, hasPendingChanges } = useOffline();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableUser, setEditableUser] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setEditableUser({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (!isOnline) {
      Alert.alert(
        t('common.error'),
        t('profile.offlineUpdateError'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Call update profile API
      const { error } = await authApi.updateProfile(editableUser);
      
      if (error) {
        throw new Error(error.message || t('profile.updateError'));
      }
      
      Alert.alert(
        t('common.success'),
        t('profile.updateSuccess'),
        [{ text: t('common.ok') }]
      );
      
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('profile.updateError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePasswordChange = () => {
    navigation.navigate('ChangePassword');
  };
  
  const handleLogout = async () => {
    if (hasPendingChanges) {
      Alert.alert(
        t('profile.pendingChanges'),
        t('profile.logoutConfirmWithChanges'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.logout'), style: 'destructive', onPress: logout }
        ]
      );
    } else {
      Alert.alert(
        t('profile.logoutTitle'),
        t('profile.logoutConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.logout'), style: 'destructive', onPress: logout }
        ]
      );
    }
  };
  
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-alert" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{t('profile.notLoggedIn')}</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          {t('common.login')}
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
        </View>
      )}
      
      <View style={styles.headerContainer}>
        <Avatar.Image 
          size={100} 
          source={user.profileImage ? { uri: user.profileImage } : require('../../assets/avatar-placeholder.png')} 
        />
        <Text style={styles.nameText}>{user.fullName}</Text>
        <View style={styles.roleContainer}>
          <Text style={[styles.roleText, { color: theme.colors.primary }]}>
            {user.role === 'admin' ? t('profile.adminRole') : 
             user.role === 'care_manager' ? t('profile.managerRole') : 
             t('profile.caregiverRole')}
          </Text>
        </View>
      </View>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('profile.personalInfo')} 
          left={(props) => <Icon name="account-details" {...props} color={theme.colors.primary} />}
          right={(props) => (
            !isEditing ? (
              <Button onPress={handleEdit}>{t('common.edit')}</Button>
            ) : null
          )}
        />
        <Card.Content>
          {isEditing ? (
            <View>
              <TextInput
                label={t('profile.fullName')}
                value={editableUser.fullName}
                onChangeText={(text) => setEditableUser({...editableUser, fullName: text})}
                style={styles.input}
              />
              <TextInput
                label={t('profile.email')}
                value={editableUser.email}
                onChangeText={(text) => setEditableUser({...editableUser, email: text})}
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                label={t('profile.phoneNumber')}
                value={editableUser.phoneNumber}
                onChangeText={(text) => setEditableUser({...editableUser, phoneNumber: text})}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <View style={styles.editButtonsContainer}>
                <Button 
                  mode="outlined" 
                  onPress={handleCancel} 
                  style={styles.cancelButton}
                  disabled={isSaving}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSave} 
                  style={styles.saveButton}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {t('common.save')}
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.username')}</Text>
                <Text style={styles.infoValue}>{user.username}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.phoneNumber')}</Text>
                <Text style={styles.infoValue}>{user.phoneNumber || t('common.notProvided')}</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('profile.securitySettings')} 
          left={(props) => <Icon name="shield-lock" {...props} color={theme.colors.primary} />}
        />
        <Card.Content>
          <Button 
            mode="outlined" 
            icon="key" 
            onPress={handlePasswordChange}
            style={styles.securityButton}
          >
            {t('profile.changePassword')}
          </Button>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>{t('profile.biometricAuth')}</Text>
              <Text style={styles.switchDescription}>{t('profile.biometricDescription')}</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              color={theme.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('profile.notifications')} 
          left={(props) => <Icon name="bell" {...props} color={theme.colors.primary} />}
        />
        <Card.Content>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>{t('profile.pushNotifications')}</Text>
              <Text style={styles.switchDescription}>{t('profile.pushDescription')}</Text>
            </View>
            <Switch
              value={receiveNotifications}
              onValueChange={setReceiveNotifications}
              color={theme.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.actionButtonsContainer}>
        <Button 
          mode="outlined" 
          icon="logout" 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          {t('common.logout')}
        </Button>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>CareUnity Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  roleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionCard: {
    margin: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 100,
  },
  securityButton: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  actionButtonsContainer: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
    minWidth: 150,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
  offlineBar: {
    padding: 8,
    alignItems: 'center',
  },
});

export default ProfileScreen;
