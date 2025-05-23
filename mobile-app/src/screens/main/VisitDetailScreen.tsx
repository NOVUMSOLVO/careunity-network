import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, ActivityIndicator, Chip, List, Divider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useOffline } from '../../contexts/offline-context';
import { visitApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type VisitDetailScreenRouteProp = RouteProp<RootStackParamList, 'VisitDetail'>;
type VisitDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VisitDetail'>;

interface VisitDetail {
  id: number;
  serviceUserId: number;
  serviceUserName: string;
  caregiverName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  visitType: string;
  location: string;
  description: string;
  tasks: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    completed: boolean;
  }>;
  notes: Array<{
    id: number;
    content: string;
    timestamp: string;
    createdBy: string;
  }>;
}

const VisitDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<VisitDetailScreenRouteProp>();
  const navigation = useNavigation<VisitDetailScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { id } = route.params;
  
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    fetchVisitDetails();
  }, [id]);
  
  const fetchVisitDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await visitApi.getById(id);
      
      if (error) {
        throw new Error(error.message || t('visitDetail.loadError'));
      }
      
      setVisit(data);
    } catch (error) {
      console.error('Error fetching visit details:', error);
      setErrorMessage(error instanceof Error ? error.message : t('visitDetail.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchVisitDetails();
  };
  
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, do MMMM yyyy');
  };
  
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const handleTaskComplete = async (taskId: number, currentStatus: boolean) => {
    if (!isOnline) {
      // Handle offline mode
      return;
    }
    
    try {
      // Call API to update task status
      // This is just a placeholder for the actual implementation
      console.log(`Toggling task ${taskId} to ${!currentStatus}`);
      
      // Update local state
      if (visit) {
        const updatedTasks = visit.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        );
        
        setVisit({ ...visit, tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.primaryContainer;
      case 'scheduled':
        return theme.colors.secondaryContainer;
      case 'cancelled':
        return theme.colors.errorContainer;
      default:
        return theme.colors.surfaceVariant;
    }
  };
  
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.onPrimaryContainer;
      case 'scheduled':
        return theme.colors.onSecondaryContainer;
      case 'cancelled':
        return theme.colors.onErrorContainer;
      default:
        return theme.colors.onSurfaceVariant;
    }
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
  
  if (!visit) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="calendar-question" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{t('visitDetail.notFound')}</Text>
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
      
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.visitDate}>{formatDateDisplay(visit.date)}</Text>
              <Text style={styles.visitTime}>
                {visit.startTime} - {visit.endTime}
              </Text>
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(visit.status) }]}
              textStyle={{ color: getStatusTextColor(visit.status) }}
            >
              {visit.status}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.visitTypeText}>{visit.visitType}</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="account" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>{t('visitDetail.serviceUser')}:</Text>
              <Text style={styles.infoValue}>{visit.serviceUserName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="account-tie" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>{t('visitDetail.caregiver')}:</Text>
              <Text style={styles.infoValue}>{visit.caregiverName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>{t('visitDetail.location')}:</Text>
              <Text style={styles.infoValue}>{visit.location}</Text>
            </View>
          </View>
          
          {visit.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>{t('visitDetail.description')}</Text>
              <Text style={styles.descriptionText}>{visit.description}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('visitDetail.tasks')} 
          left={(props) => <Icon name="checkbox-marked-circle-outline" {...props} color={theme.colors.primary} />}
        />
        <Card.Content>
          {visit.tasks && visit.tasks.length > 0 ? (
            <List.Section>
              {visit.tasks.map((task) => (
                <List.Accordion
                  key={task.id}
                  title={task.title}
                  description={task.category}
                  expanded={expandedTasks[task.id] || false}
                  onPress={() => toggleTaskExpanded(task.id)}
                  left={props => (
                    <List.Icon 
                      {...props} 
                      icon={task.completed ? "checkbox-marked" : "checkbox-blank-outline"} 
                      color={task.completed ? theme.colors.primary : theme.colors.outline}
                    />
                  )}
                >
                  <View style={styles.taskContent}>
                    {task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}
                    <Button 
                      mode={task.completed ? "outlined" : "contained"} 
                      onPress={() => handleTaskComplete(task.id, task.completed)}
                      style={styles.taskButton}
                      icon={task.completed ? "check" : "checkbox-blank-outline"}
                    >
                      {task.completed ? t('visitDetail.markIncomplete') : t('visitDetail.markComplete')}
                    </Button>
                  </View>
                </List.Accordion>
              ))}
            </List.Section>
          ) : (
            <Text style={styles.emptyText}>{t('visitDetail.noTasks')}</Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title 
          title={t('visitDetail.notes')} 
          left={(props) => <Icon name="note-text" {...props} color={theme.colors.primary} />}
          right={(props) => (
            <Button onPress={() => navigation.navigate('AddVisitNote', { visitId: visit.id })}>
              {t('visitDetail.addNote')}
            </Button>
          )}
        />
        <Card.Content>
          {visit.notes && visit.notes.length > 0 ? (
            <View>
              {visit.notes.map((note) => (
                <View key={note.id} style={styles.noteContainer}>
                  <Text style={styles.noteTimestamp}>{note.timestamp} - {note.createdBy}</Text>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Divider style={styles.noteDivider} />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('visitDetail.noNotes')}</Text>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.actionButtonsContainer}>
        {visit.status === 'scheduled' && (
          <>
            <Button 
              mode="outlined" 
              icon="close" 
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              onPress={() => console.log('Cancel visit')}
            >
              {t('visitDetail.cancelVisit')}
            </Button>
            <Button 
              mode="contained" 
              icon="check" 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => console.log('Complete visit')}
            >
              {t('visitDetail.completeVisit')}
            </Button>
          </>
        )}
        
        {visit.status === 'completed' && (
          <Button 
            mode="contained" 
            icon="file-document" 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => console.log('View report')}
          >
            {t('visitDetail.viewReport')}
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  visitDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitTime: {
    fontSize: 16,
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  visitTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
  },
  sectionCard: {
    margin: 8,
    elevation: 2,
  },
  taskContent: {
    padding: 16,
    paddingTop: 0,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  taskButton: {
    alignSelf: 'flex-start',
  },
  noteContainer: {
    marginBottom: 12,
  },
  noteTimestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  noteContent: {
    fontSize: 14,
    marginVertical: 4,
  },
  noteDivider: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    paddingVertical: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
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

export default VisitDetailScreen;
