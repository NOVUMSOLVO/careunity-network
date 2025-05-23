import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Avatar, Button, Divider, Chip, ActivityIndicator, List, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useOffline } from '../../contexts/offline-context';
import { serviceUserApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type ServiceUserDetailScreenRouteProp = RouteProp<RootStackParamList, 'ServiceUserDetail'>;
type ServiceUserDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceUserDetail'>;

interface ServiceUserDetail {
  id: number;
  uniqueId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  emergencyContact: string;
  profileImage?: string;
  preferences: string;
  needs: string;
  lifeStory: string;
  carePlans: Array<{
    id: number;
    title: string;
    status: string;
    startDate: string;
    reviewDate: string;
  }>;
  upcomingVisits: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    visitType: string;
  }>;
  recentNotes: Array<{
    id: number;
    content: string;
    timestamp: string;
    createdBy: string;
    category: string;
  }>;
}

const ServiceUserDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<ServiceUserDetailScreenRouteProp>();
  const navigation = useNavigation<ServiceUserDetailScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { id } = route.params;
  
  const [serviceUser, setServiceUser] = useState<ServiceUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    preferences: false,
    needs: false,
    lifeStory: false
  });
  
  useEffect(() => {
    fetchServiceUserDetails();
  }, [id]);
  
  const fetchServiceUserDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await serviceUserApi.getById(id);
      
      if (error) {
        throw new Error(error.message || t('serviceUserDetail.loadError'));
      }
      
      setServiceUser(data);
    } catch (error) {
      console.error('Error fetching service user details:', error);
      setErrorMessage(error instanceof Error ? error.message : t('serviceUserDetail.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const navigateToCarePlan = (carePlanId: number) => {
    navigation.navigate('CarePlanDetail', { id: carePlanId });
  };
  
  const navigateToVisit = (visitId: number) => {
    navigation.navigate('VisitDetail', { id: visitId });
  };
  
  const handleRefresh = () => {
    fetchServiceUserDetails();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }
  
  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMessage}</Text>
        <Button mode="contained" onPress={handleRefresh} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }
  
  if (!serviceUser) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-question" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{t('serviceUserDetail.notFound')}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          {t('common.goBack')}
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
        <View style={styles.profileImageContainer}>
          <Avatar.Image 
            size={100} 
            source={serviceUser.profileImage ? { uri: serviceUser.profileImage } : require('../../assets/avatar-placeholder.png')} 
          />
        </View>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.nameText}>{serviceUser.fullName}</Text>
          <Text style={styles.idText}>{serviceUser.uniqueId}</Text>
          <Text style={styles.infoText}>
            <Icon name="calendar" size={16} color={theme.colors.primary} /> {formatDate(serviceUser.dateOfBirth)}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="phone" size={16} color={theme.colors.primary} /> {serviceUser.phoneNumber || t('common.notProvided')}
          </Text>
        </View>
      </View>
      
      <Card style={styles.sectionCard}>
        <Card.Title title={t('serviceUserDetail.address')} left={(props) => <Icon name="home" {...props} color={theme.colors.primary} />} />
        <Card.Content>
          <Text style={styles.addressText}>{serviceUser.address}</Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title={t('serviceUserDetail.emergency')} left={(props) => <Icon name="alert" {...props} color={theme.colors.primary} />} />
        <Card.Content>
          <Text style={styles.emergencyText}>{serviceUser.emergencyContact || t('common.notProvided')}</Text>
        </Card.Content>
      </Card>
      
      <TouchableOpacity onPress={() => toggleSection('preferences')}>
        <Card style={styles.sectionCard}>
          <Card.Title 
            title={t('serviceUserDetail.preferences')} 
            left={(props) => <Icon name="heart" {...props} color={theme.colors.primary} />}
            right={(props) => (
              <Icon 
                name={expandedSections.preferences ? "chevron-up" : "chevron-down"} 
                {...props} 
                color={theme.colors.outline}
              />
            )}
          />
          {expandedSections.preferences && (
            <Card.Content>
              <Text>{serviceUser.preferences || t('serviceUserDetail.noPreferences')}</Text>
            </Card.Content>
          )}
        </Card>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => toggleSection('needs')}>
        <Card style={styles.sectionCard}>
          <Card.Title 
            title={t('serviceUserDetail.needs')} 
            left={(props) => <Icon name="hand-heart" {...props} color={theme.colors.primary} />}
            right={(props) => (
              <Icon 
                name={expandedSections.needs ? "chevron-up" : "chevron-down"} 
                {...props} 
                color={theme.colors.outline}
              />
            )}
          />
          {expandedSections.needs && (
            <Card.Content>
              <Text>{serviceUser.needs || t('serviceUserDetail.noNeeds')}</Text>
            </Card.Content>
          )}
        </Card>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => toggleSection('lifeStory')}>
        <Card style={styles.sectionCard}>
          <Card.Title 
            title={t('serviceUserDetail.lifeStory')} 
            left={(props) => <Icon name="book-open-variant" {...props} color={theme.colors.primary} />}
            right={(props) => (
              <Icon 
                name={expandedSections.lifeStory ? "chevron-up" : "chevron-down"} 
                {...props} 
                color={theme.colors.outline}
              />
            )}
          />
          {expandedSections.lifeStory && (
            <Card.Content>
              <Text>{serviceUser.lifeStory || t('serviceUserDetail.noLifeStory')}</Text>
            </Card.Content>
          )}
        </Card>
      </TouchableOpacity>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('serviceUserDetail.carePlans')} 
          left={(props) => <Icon name="clipboard-list" {...props} color={theme.colors.primary} />}
          right={(props) => (
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('CarePlans', { serviceUserId: serviceUser.id })}
            >
              {t('common.viewAll')}
            </Button>
          )}
        />
        <Card.Content>
          {serviceUser.carePlans && serviceUser.carePlans.length > 0 ? (
            <View>
              {serviceUser.carePlans.map((plan) => (
                <TouchableOpacity 
                  key={plan.id}
                  style={styles.itemContainer}
                  onPress={() => navigateToCarePlan(plan.id)}
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{plan.title}</Text>
                    <Text style={styles.itemSubtitle}>
                      {t('serviceUserDetail.reviewDate')}: {formatDate(plan.reviewDate)}
                    </Text>
                  </View>
                  <Chip 
                    mode="flat"
                    style={[
                      styles.statusChip,
                      { 
                        backgroundColor: plan.status === 'active' 
                          ? theme.colors.primaryContainer 
                          : theme.colors.surfaceVariant 
                      }
                    ]}
                  >
                    {plan.status}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('serviceUserDetail.noCarePlans')}</Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('serviceUserDetail.upcomingVisits')} 
          left={(props) => <Icon name="calendar-check" {...props} color={theme.colors.primary} />}
          right={(props) => (
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Visits', { serviceUserId: serviceUser.id })}
            >
              {t('common.viewAll')}
            </Button>
          )}
        />
        <Card.Content>
          {serviceUser.upcomingVisits && serviceUser.upcomingVisits.length > 0 ? (
            <View>
              {serviceUser.upcomingVisits.map((visit) => (
                <TouchableOpacity 
                  key={visit.id}
                  style={styles.itemContainer}
                  onPress={() => navigateToVisit(visit.id)}
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{visit.visitType}</Text>
                    <Text style={styles.itemSubtitle}>
                      {formatDate(visit.date)} • {visit.startTime} - {visit.endTime}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={theme.colors.outline} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('serviceUserDetail.noVisits')}</Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('serviceUserDetail.recentNotes')} 
          left={(props) => <Icon name="note-text" {...props} color={theme.colors.primary} />}
          right={(props) => (
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Notes', { serviceUserId: serviceUser.id })}
            >
              {t('common.viewAll')}
            </Button>
          )}
        />
        <Card.Content>
          {serviceUser.recentNotes && serviceUser.recentNotes.length > 0 ? (
            <View>
              {serviceUser.recentNotes.map((note) => (
                <View key={note.id} style={styles.noteContainer}>
                  <Text style={styles.noteTimestamp}>{note.timestamp} - {note.createdBy}</Text>
                  <Text style={styles.noteCategory}>{note.category}</Text>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Divider style={styles.noteDivider} />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('serviceUserDetail.noNotes')}</Text>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.actionButtonsContainer}>
        <Button 
          mode="contained" 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          icon="note-plus"
          onPress={() => navigation.navigate('AddNote', { serviceUserId: serviceUser.id })}
        >
          {t('serviceUserDetail.addNote')}
        </Button>
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  basicInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  idText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCard: {
    margin: 8,
    elevation: 2,
  },
  addressText: {
    fontSize: 16,
  },
  emergencyText: {
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusChip: {
    height: 28,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    paddingVertical: 8,
  },
  noteContainer: {
    marginBottom: 12,
  },
  noteTimestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  noteCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  noteDivider: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  retryButton: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 8,
  },
  offlineBar: {
    padding: 8,
    alignItems: 'center',
  },
});

export default ServiceUserDetailScreen;
