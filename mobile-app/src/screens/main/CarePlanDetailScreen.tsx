import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, ActivityIndicator, Chip, List, Divider, useTheme, Menu, IconButton, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useOffline } from '../../contexts/offline-context';
import { carePlanApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type CarePlanDetailScreenRouteProp = RouteProp<RootStackParamList, 'CarePlanDetail'>;
type CarePlanDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CarePlanDetail'>;

interface CarePlanGoal {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'cancelled';
}

interface CarePlanTask {
  id: number;
  title: string;
  description: string;
  frequency: string;
  status: 'active' | 'completed';
}

interface CarePlanAssessment {
  id: number;
  title: string;
  date: string;
  completedBy: string;
  summary: string;
}

interface CarePlanDetail {
  id: number;
  serviceUserId: number;
  serviceUserName: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  categories: string[];
  goals: CarePlanGoal[];
  tasks: CarePlanTask[];
  assessments: CarePlanAssessment[];
  reviewDate: string;
  notes?: string;
}

const CarePlanDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<CarePlanDetailScreenRouteProp>();
  const navigation = useNavigation<CarePlanDetailScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { id } = route.params;
  
  const [carePlan, setCarePlan] = useState<CarePlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    goals: true,
    tasks: true,
    assessments: false,
  });
  
  useEffect(() => {
    fetchCarePlanDetails();
  }, [id]);
  
  const fetchCarePlanDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await carePlanApi.getById(id);
      
      if (error) {
        throw new Error(error.message || t('carePlanDetail.loadError'));
      }
      
      setCarePlan(data);
    } catch (error) {
      console.error('Error fetching care plan details:', error);
      setErrorMessage(error instanceof Error ? error.message : t('carePlanDetail.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchCarePlanDetails();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const handleEditCarePlan = () => {
    closeMenu();
    navigation.navigate('EditCarePlan', { id: carePlan?.id });
  };
  
  const handleStatusChange = (newStatus: 'active' | 'completed' | 'archived') => {
    closeMenu();
    setStatusDialogVisible(false);
    
    if (!carePlan || !isOnline) return;
    
    // Call API to update status
    console.log(`Changing care plan status to ${newStatus}`);
    
    // Update local state
    setCarePlan({
      ...carePlan,
      status: newStatus
    });
  };
  
  const handleDeleteCarePlan = async () => {
    if (!carePlan || !isOnline) return;
    
    try {
      const { error } = await carePlanApi.delete(carePlan.id);
      
      if (error) {
        throw new Error(error.message || t('carePlanDetail.deleteError'));
      }
      
      // Navigate back after successful deletion
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting care plan:', error);
      setErrorMessage(error instanceof Error ? error.message : t('carePlanDetail.deleteError'));
    } finally {
      setDeleteDialogVisible(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primaryContainer;
      case 'completed':
        return theme.colors.secondaryContainer;
      case 'archived':
        return theme.colors.surfaceVariant;
      case 'not_started':
        return theme.colors.errorContainer;
      case 'in_progress':
        return theme.colors.secondaryContainer;
      case 'achieved':
        return theme.colors.primaryContainer;
      case 'cancelled':
        return theme.colors.errorContainer;
      default:
        return theme.colors.surfaceVariant;
    }
  };
  
  const getGoalStatusText = (status: string) => {
    switch (status) {
      case 'not_started':
        return t('carePlanDetail.notStarted');
      case 'in_progress':
        return t('carePlanDetail.inProgress');
      case 'achieved':
        return t('carePlanDetail.achieved');
      case 'cancelled':
        return t('carePlanDetail.cancelled');
      default:
        return status;
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
  
  if (!carePlan) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="file-document-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{t('carePlanDetail.notFound')}</Text>
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{carePlan.title}</Text>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(carePlan.status) }]}
              >
                {carePlan.status}
              </Chip>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={openMenu}
                />
              }
            >
              <Menu.Item onPress={handleEditCarePlan} title={t('carePlanDetail.edit')} />
              <Menu.Item 
                onPress={() => {
                  closeMenu();
                  setStatusDialogVisible(true);
                }} 
                title={t('carePlanDetail.changeStatus')} 
              />
              <Divider />
              <Menu.Item 
                onPress={() => {
                  closeMenu();
                  setDeleteDialogVisible(true);
                }} 
                title={t('carePlanDetail.delete')} 
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>
          
          <TouchableOpacity 
            style={styles.serviceUserRow}
            onPress={() => navigation.navigate('ServiceUserDetail', { id: carePlan.serviceUserId })}
          >
            <Icon name="account" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={styles.serviceUserName}>{carePlan.serviceUserName}</Text>
            <Icon name="chevron-right" size={20} color={theme.colors.outline} />
          </TouchableOpacity>
          
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{t('carePlanDetail.created')}:</Text>
              <Text style={styles.dateValue}>{formatDate(carePlan.createdAt)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{t('carePlanDetail.updated')}:</Text>
              <Text style={styles.dateValue}>{formatDate(carePlan.updatedAt)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{t('carePlanDetail.nextReview')}:</Text>
              <Text style={styles.dateValue}>{formatDate(carePlan.reviewDate)}</Text>
            </View>
          </View>
          
          {carePlan.categories && carePlan.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {carePlan.categories.map((category, index) => (
                  <Chip 
                    key={index} 
                    style={styles.categoryChip}
                    mode="outlined"
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <List.Accordion
          title={t('carePlanDetail.details')}
          expanded={expandedSections.details}
          onPress={() => toggleSection('details')}
          left={props => <List.Icon {...props} icon="file-document-outline" />}
        >
          <View style={styles.detailsContent}>
            <Text style={styles.sectionTitle}>{t('carePlanDetail.description')}</Text>
            <Text style={styles.descriptionText}>{carePlan.description}</Text>
            
            {carePlan.notes && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('carePlanDetail.notes')}</Text>
                <Text style={styles.descriptionText}>{carePlan.notes}</Text>
              </>
            )}
          </View>
        </List.Accordion>
      </Card>
      
      <Card style={styles.sectionCard}>
        <List.Accordion
          title={t('carePlanDetail.goals')}
          expanded={expandedSections.goals}
          onPress={() => toggleSection('goals')}
          left={props => <List.Icon {...props} icon="flag-outline" />}
          right={props => (
            <Button 
              mode="text" 
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('AddCarePlanGoal', { carePlanId: carePlan.id });
              }}
              style={{ marginRight: 8 }}
            >
              {t('carePlanDetail.addGoal')}
            </Button>
          )}
        >
          {carePlan.goals && carePlan.goals.length > 0 ? (
            <View style={styles.goalsContainer}>
              {carePlan.goals.map((goal) => (
                <Card key={goal.id} style={styles.goalCard}>
                  <Card.Content>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Chip 
                        style={{ backgroundColor: getStatusColor(goal.status) }}
                        size="small"
                      >
                        {getGoalStatusText(goal.status)}
                      </Chip>
                    </View>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                    <View style={styles.goalDate}>
                      <Text style={styles.goalDateLabel}>{t('carePlanDetail.targetDate')}:</Text>
                      <Text style={styles.goalDateValue}>{formatDate(goal.targetDate)}</Text>
                    </View>
                    <View style={styles.goalActions}>
                      <Button mode="text" icon="pencil" compact>
                        {t('common.edit')}
                      </Button>
                      <Button mode="text" icon="delete" compact textColor={theme.colors.error}>
                        {t('common.delete')}
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('carePlanDetail.noGoals')}</Text>
          )}
        </List.Accordion>
      </Card>
      
      <Card style={styles.sectionCard}>
        <List.Accordion
          title={t('carePlanDetail.tasks')}
          expanded={expandedSections.tasks}
          onPress={() => toggleSection('tasks')}
          left={props => <List.Icon {...props} icon="checkbox-marked-outline" />}
          right={props => (
            <Button 
              mode="text" 
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('AddCarePlanTask', { carePlanId: carePlan.id });
              }}
              style={{ marginRight: 8 }}
            >
              {t('carePlanDetail.addTask')}
            </Button>
          )}
        >
          {carePlan.tasks && carePlan.tasks.length > 0 ? (
            <View style={styles.tasksContainer}>
              {carePlan.tasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.taskHeader}>
                    <Icon 
                      name={task.status === 'completed' ? "checkbox-marked" : "checkbox-blank-outline"} 
                      size={24} 
                      color={task.status === 'completed' ? theme.colors.primary : theme.colors.outline}
                      style={styles.taskCheckbox}
                    />
                    <View style={styles.taskTitleContainer}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskFrequency}>{task.frequency}</Text>
                    </View>
                  </View>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                  <View style={styles.taskActions}>
                    <Button mode="text" icon="pencil" compact>
                      {t('common.edit')}
                    </Button>
                    <Button 
                      mode="text" 
                      icon={task.status === 'completed' ? "refresh" : "check"} 
                      compact
                    >
                      {task.status === 'completed' ? t('carePlanDetail.markIncomplete') : t('carePlanDetail.markComplete')}
                    </Button>
                  </View>
                  <Divider style={styles.taskDivider} />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('carePlanDetail.noTasks')}</Text>
          )}
        </List.Accordion>
      </Card>
      
      <Card style={styles.sectionCard}>
        <List.Accordion
          title={t('carePlanDetail.assessments')}
          expanded={expandedSections.assessments}
          onPress={() => toggleSection('assessments')}
          left={props => <List.Icon {...props} icon="clipboard-text-outline" />}
          right={props => (
            <Button 
              mode="text" 
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('AddCarePlanAssessment', { carePlanId: carePlan.id });
              }}
              style={{ marginRight: 8 }}
            >
              {t('carePlanDetail.addAssessment')}
            </Button>
          )}
        >
          {carePlan.assessments && carePlan.assessments.length > 0 ? (
            <View style={styles.assessmentsContainer}>
              {carePlan.assessments.map((assessment) => (
                <Card key={assessment.id} style={styles.assessmentCard}>
                  <Card.Content>
                    <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                    <View style={styles.assessmentMeta}>
                      <Text style={styles.assessmentDate}>{formatDate(assessment.date)}</Text>
                      <Text style={styles.assessmentBy}>{t('carePlanDetail.by')} {assessment.completedBy}</Text>
                    </View>
                    <Text style={styles.assessmentSummary}>{assessment.summary}</Text>
                    <Button mode="outlined" style={styles.viewFullButton}>
                      {t('carePlanDetail.viewFull')}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('carePlanDetail.noAssessments')}</Text>
          )}
        </List.Accordion>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          icon="file-pdf-box" 
          style={styles.actionButton}
          onPress={() => console.log('Export care plan')}
        >
          {t('carePlanDetail.export')}
        </Button>
        <Button 
          mode="contained" 
          icon="share-variant" 
          style={styles.actionButton}
          onPress={() => console.log('Share care plan')}
        >
          {t('carePlanDetail.share')}
        </Button>
      </View>
      
      {/* Status Change Dialog */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>{t('carePlanDetail.changeStatus')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('carePlanDetail.selectNewStatus')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={() => handleStatusChange('active')}>{t('carePlanDetail.active')}</Button>
            <Button onPress={() => handleStatusChange('completed')}>{t('carePlanDetail.completed')}</Button>
            <Button onPress={() => handleStatusChange('archived')}>{t('carePlanDetail.archived')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>{t('carePlanDetail.confirmDelete')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('carePlanDetail.deleteWarning')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleDeleteCarePlan} textColor={theme.colors.error}>{t('common.delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  serviceUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  serviceUserName: {
    fontSize: 16,
    flex: 1,
  },
  datesContainer: {
    marginVertical: 8,
  },
  dateItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
  },
  categoriesContainer: {
    marginTop: 12,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  sectionCard: {
    margin: 8,
    elevation: 2,
  },
  detailsContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  goalsContainer: {
    padding: 8,
  },
  goalCard: {
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  goalDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalDateLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 4,
  },
  goalDateValue: {
    fontSize: 14,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  tasksContainer: {
    padding: 16,
    paddingTop: 8,
  },
  taskItem: {
    marginBottom: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    marginRight: 8,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskFrequency: {
    fontSize: 12,
    opacity: 0.7,
  },
  taskDescription: {
    fontSize: 14,
    marginLeft: 32,
    marginTop: 4,
    marginBottom: 8,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  taskDivider: {
    marginVertical: 12,
  },
  assessmentsContainer: {
    padding: 8,
  },
  assessmentCard: {
    marginBottom: 8,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  assessmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assessmentDate: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 8,
  },
  assessmentBy: {
    fontSize: 12,
    opacity: 0.7,
  },
  assessmentSummary: {
    fontSize: 14,
    marginBottom: 8,
  },
  viewFullButton: {
    alignSelf: 'flex-end',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    padding: 16,
  },
  buttonContainer: {
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

export default CarePlanDetailScreen;
