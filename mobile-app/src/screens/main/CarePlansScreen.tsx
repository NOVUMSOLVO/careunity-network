import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, Searchbar, ActivityIndicator, Chip, FAB, useTheme, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useOffline } from '../../contexts/offline-context';
import { carePlanApi, serviceUserApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type CarePlansScreenRouteProp = RouteProp<RootStackParamList, 'CarePlans'>;
type CarePlansScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CarePlans'>;

interface CarePlan {
  id: number;
  serviceUserId: number;
  serviceUserName: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  categories: string[];
}

interface ServiceUser {
  id: number;
  fullName: string;
  imageUrl?: string;
}

const CarePlansScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<CarePlansScreenRouteProp>();
  const navigation = useNavigation<CarePlansScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { serviceUserId } = route.params || {};
  
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [filteredCarePlans, setFilteredCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  
  useEffect(() => {
    if (serviceUserId) {
      fetchServiceUser();
    }
    fetchCarePlans();
  }, [serviceUserId]);
  
  const fetchServiceUser = async () => {
    try {
      if (!serviceUserId) return;
      
      const { data, error } = await serviceUserApi.getById(serviceUserId);
      
      if (error) {
        throw new Error(error.message || t('serviceUsers.loadError'));
      }
      
      setServiceUser(data);
    } catch (error) {
      console.error('Error fetching service user:', error);
    }
  };
  
  const fetchCarePlans = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await carePlanApi.getAll(serviceUserId);
      
      if (error) {
        throw new Error(error.message || t('carePlans.loadError'));
      }
      
      setCarePlans(data);
      setFilteredCarePlans(data);
    } catch (error) {
      console.error('Error fetching care plans:', error);
      setErrorMessage(error instanceof Error ? error.message : t('carePlans.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (carePlans.length > 0) {
      let result = [...carePlans];
      
      // Apply text search
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        result = result.filter(carePlan => 
          carePlan.title.toLowerCase().includes(lowerCaseQuery) ||
          carePlan.description.toLowerCase().includes(lowerCaseQuery) ||
          carePlan.serviceUserName?.toLowerCase().includes(lowerCaseQuery) ||
          carePlan.categories.some(category => category.toLowerCase().includes(lowerCaseQuery))
        );
      }
      
      // Apply status filter
      if (filterStatus) {
        result = result.filter(carePlan => carePlan.status === filterStatus);
      }
      
      setFilteredCarePlans(result);
    }
  }, [searchQuery, filterStatus, carePlans]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const toggleFilter = (status: string) => {
    if (filterStatus === status) {
      setFilterStatus(null);
    } else {
      setFilterStatus(status);
    }
  };
  
  const handleRefresh = () => {
    fetchCarePlans();
  };
  
  const navigateToCarePlanDetail = (id: number) => {
    navigation.navigate('CarePlanDetail', { id });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primaryContainer;
      case 'completed':
        return theme.colors.secondaryContainer;
      case 'archived':
        return theme.colors.surfaceVariant;
      default:
        return theme.colors.surfaceVariant;
    }
  };
  
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.onPrimaryContainer;
      case 'completed':
        return theme.colors.onSecondaryContainer;
      case 'archived':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };
  
  const renderCarePlanItem = ({ item }: { item: CarePlan }) => (
    <Card 
      style={styles.card}
      onPress={() => navigateToCarePlanDetail(item.id)}
    >
      <Card.Content>
        <View style={styles.carePlanHeader}>
          <View>
            <Text style={styles.carePlanTitle}>{item.title}</Text>
            {!serviceUserId && (
              <Text style={styles.carePlanServiceUser}>{item.serviceUserName}</Text>
            )}
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusTextColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.carePlanDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>{t('carePlans.lastUpdated')}:</Text>
          <Text style={styles.dateValue}>{formatDate(item.updatedAt)}</Text>
        </View>
        
        {item.categories && item.categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.categories.map((category, index) => (
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
  );
  
  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
        </View>
      )}
      
      {serviceUser && (
        <Card style={styles.serviceUserCard}>
          <Card.Content style={styles.serviceUserContent}>
            <Icon name="account-circle" size={40} color={theme.colors.primary} />
            <View style={styles.serviceUserInfo}>
              <Text style={styles.serviceUserName}>{serviceUser.fullName}</Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('ServiceUserDetail', { id: serviceUser.id })}
              >
                {t('carePlans.viewProfile')}
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('carePlans.searchPlaceholder')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>{t('carePlans.filter')}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <Chip
            selected={filterStatus === 'active'}
            onPress={() => toggleFilter('active')}
            style={styles.filterChip}
          >
            {t('carePlans.active')}
          </Chip>
          <Chip
            selected={filterStatus === 'completed'}
            onPress={() => toggleFilter('completed')}
            style={styles.filterChip}
          >
            {t('carePlans.completed')}
          </Chip>
          <Chip
            selected={filterStatus === 'archived'}
            onPress={() => toggleFilter('archived')}
            style={styles.filterChip}
          >
            {t('carePlans.archived')}
          </Chip>
        </ScrollView>
      </View>
      
      {errorMessage && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.onErrorContainer }}>{errorMessage}</Text>
          <Button onPress={handleRefresh} mode="contained" style={styles.retryButton}>
            {t('common.retry')}
          </Button>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCarePlans}
          renderItem={renderCarePlanItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={64} color={theme.colors.outline} />
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus
                  ? t('carePlans.noSearchResults')
                  : t('carePlans.noCarePlans')}
              </Text>
              {!searchQuery && !filterStatus && (
                <Button mode="contained" onPress={handleRefresh} style={styles.refreshButton}>
                  {t('common.refresh')}
                </Button>
              )}
            </View>
          }
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        icon="plus"
        onPress={() => navigation.navigate('AddCarePlan', { serviceUserId })}
        label={t('carePlans.addCarePlan')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  serviceUserCard: {
    margin: 16,
    marginBottom: 8,
  },
  serviceUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceUserInfo: {
    marginLeft: 16,
    flex: 1,
  },
  serviceUserName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchbar: {
    elevation: 0,
  },
  filtersContainer: {
    padding: 8,
    paddingTop: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    marginLeft: 8,
    marginBottom: 4,
    opacity: 0.7,
  },
  filtersScroll: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carePlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  carePlanServiceUser: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
  carePlanDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  refreshButton: {
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  offlineBar: {
    padding: 8,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CarePlansScreen;
