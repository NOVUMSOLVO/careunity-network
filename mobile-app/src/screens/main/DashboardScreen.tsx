import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme, Card, Title, Paragraph, Button, Divider, Badge } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/auth-context';
import { useOffline } from '../../contexts/offline-context';
import { useNotifications } from '../../contexts/notification-context';
import { useAccessibility } from '../../contexts/accessibility-context';
import { VoiceInputButton } from '../../components/voice-input-button';
import { RootStackParamList } from '../../navigation/types';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user } = useAuth();
  const { isOnline, hasPendingChanges, pendingChangesCount, syncPendingChanges } = useOffline();
  const { unreadCount, addNotification } = useNotifications();
  const { fontSize, fontScale } = useAccessibility();
  
  const [isLoading, setIsLoading] = useState(false);
  const [todayVisits, setTodayVisits] = useState([
    { id: 1, serviceUser: 'John Smith', time: '09:00 - 09:30', status: 'completed' },
    { id: 2, serviceUser: 'Mary Johnson', time: '11:00 - 12:00', status: 'upcoming' },
    { id: 3, serviceUser: 'Robert Davis', time: '15:30 - 16:30', status: 'upcoming' },
  ]);
  
  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('visit') || lowerCommand.includes('visits')) {
      navigation.navigate('Visits');
    } else if (lowerCommand.includes('service') || lowerCommand.includes('users')) {
      navigation.navigate('ServiceUsers');
    } else if (lowerCommand.includes('profile')) {
      navigation.navigate('Profile');
    } else if (lowerCommand.includes('sync') || lowerCommand.includes('synchronize')) {
      handleSync();
    } else if (lowerCommand.includes('notification') || lowerCommand.includes('test notification')) {
      createTestNotification();
    } else {
      Alert.alert(t('voiceInput.error'), t('voiceInput.helpText'));
    }
  };
  
  // Sync pending changes
  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(t('common.error'), t('offline.status'));
      return;
    }
    
    if (!hasPendingChanges) {
      Alert.alert(t('common.success'), t('offline.syncSuccess'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      await syncPendingChanges();
      Alert.alert(t('common.success'), t('offline.syncSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('offline.syncError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a test notification
  const createTestNotification = () => {
    addNotification({
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification created from the dashboard.',
    });
    
    Alert.alert(t('common.success'), 'Test notification created');
  };
  
  // Calculate font size based on accessibility settings
  const getFontSize = (baseSize: number) => {
    return baseSize * fontScale;
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Welcome section */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { fontSize: getFontSize(24), color: theme.colors.primary }]}>
          {t('dashboard.welcome', { name: user?.name || 'Caregiver' })}
        </Text>
        
        {/* Voice command button */}
        <VoiceInputButton
          commandMode
          onCommand={handleVoiceCommand}
          size="small"
          style={styles.voiceButton}
        />
      </View>
      
      {/* Offline banner */}
      {!isOnline && (
        <Card style={[styles.offlineCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content style={styles.offlineContent}>
            <Icon name="wifi-off" size={20} color={theme.colors.error} />
            <Text style={{ color: theme.colors.error, marginLeft: 8, fontSize: getFontSize(14) }}>
              {t('common.offline')}
            </Text>
          </Card.Content>
        </Card>
      )}
      
      {/* Sync banner */}
      {isOnline && hasPendingChanges && (
        <Card style={[styles.syncCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={styles.syncContent}>
            <View style={styles.syncTextContainer}>
              <Icon name="sync" size={20} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, marginLeft: 8, fontSize: getFontSize(14) }}>
                {t('common.syncMessage', { count: pendingChangesCount })}
              </Text>
            </View>
            <Button 
              mode="contained" 
              onPress={handleSync} 
              loading={isLoading}
              compact
            >
              {t('offline.syncNow')}
            </Button>
          </Card.Content>
        </Card>
      )}
      
      {/* Today's visits */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={{ fontSize: getFontSize(18) }}>{t('dashboard.todayVisits')}</Title>
            <Badge style={{ backgroundColor: theme.colors.primary }}>{todayVisits.length}</Badge>
          </View>
          
          {todayVisits.map((visit) => (
            <View key={visit.id}>
              <TouchableOpacity
                style={styles.visitItem}
                onPress={() => navigation.navigate('VisitDetail', { id: visit.id })}
                accessibilityRole="button"
                accessibilityLabel={`${visit.serviceUser}, ${visit.time}, ${t(`visits.${visit.status}`)}`}
              >
                <View style={styles.visitInfo}>
                  <Text style={{ fontWeight: 'bold', fontSize: getFontSize(16) }}>{visit.serviceUser}</Text>
                  <Text style={{ fontSize: getFontSize(14) }}>{visit.time}</Text>
                </View>
                <View style={styles.visitStatus}>
                  <Badge 
                    style={{ 
                      backgroundColor: 
                        visit.status === 'completed' ? theme.colors.tertiary :
                        visit.status === 'upcoming' ? theme.colors.primary : 
                        theme.colors.error
                    }}
                  >
                    {t(`visits.${visit.status}`)}
                  </Badge>
                </View>
              </TouchableOpacity>
              <Divider />
            </View>
          ))}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Visits')}>
            {t('dashboard.viewSchedule')}
          </Button>
        </Card.Actions>
      </Card>
      
      {/* Quick actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ fontSize: getFontSize(18) }}>{t('dashboard.quickActions')}</Title>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Visits')}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.startVisit')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}>
                <Icon name="calendar-check" size={24} color="#fff" />
              </View>
              <Text style={{ textAlign: 'center', fontSize: getFontSize(14) }}>
                {t('dashboard.startVisit')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ServiceUsers')}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.recordNote')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary }]}>
                <Icon name="note-text" size={24} color="#fff" />
              </View>
              <Text style={{ textAlign: 'center', fontSize: getFontSize(14) }}>
                {t('dashboard.recordNote')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSync}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.syncData')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.tertiary }]}>
                <Icon name="sync" size={24} color="#fff" />
              </View>
              <Text style={{ textAlign: 'center', fontSize: getFontSize(14) }}>
                {t('dashboard.syncData')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={createTestNotification}
              accessibilityRole="button"
              accessibilityLabel={t('notifications.title')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.error }]}>
                <Icon name="bell" size={24} color="#fff" />
                {unreadCount > 0 && (
                  <Badge 
                    style={styles.notificationBadge}
                    size={16}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </View>
              <Text style={{ textAlign: 'center', fontSize: getFontSize(14) }}>
                {t('notifications.title')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    flex: 1,
  },
  voiceButton: {
    marginLeft: 8,
  },
  offlineCard: {
    marginBottom: 16,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncCard: {
    marginBottom: 16,
  },
  syncContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  visitInfo: {
    flex: 1,
  },
  visitStatus: {
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});

export default DashboardScreen;
