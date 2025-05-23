import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, Searchbar, ActivityIndicator, Chip, FAB, useTheme, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useOffline } from '../../contexts/offline-context';
import { visitApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type VisitsScreenRouteProp = RouteProp<RootStackParamList, 'Visits'>;
type VisitsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Visits'>;

interface Visit {
  id: number;
  serviceUserId: number;
  serviceUserName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  visitType: string;
  location: string;
}

const VisitsScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<VisitsScreenRouteProp>();
  const navigation = useNavigation<VisitsScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { serviceUserId } = route.params || {};
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    fetchVisits();
  }, [selectedDate]);
  
  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Prepare parameters for the API call
      const params: any = { date: selectedDate };
      if (serviceUserId) {
        params.serviceUserId = serviceUserId;
      }
      
      const { data, error } = await visitApi.getAll(params);
      
      if (error) {
        throw new Error(error.message || t('visits.loadError'));
      }
      
      setVisits(data);
      setFilteredVisits(data);
    } catch (error) {
      console.error('Error fetching visits:', error);
      setErrorMessage(error instanceof Error ? error.message : t('visits.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (visits.length > 0) {
      let result = [...visits];
      
      // Apply text search
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        result = result.filter(visit => 
          visit.serviceUserName.toLowerCase().includes(lowerCaseQuery) ||
          visit.visitType.toLowerCase().includes(lowerCaseQuery) ||
          visit.location.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      // Apply status filter
      if (filterStatus) {
        result = result.filter(visit => visit.status === filterStatus);
      }
      
      setFilteredVisits(result);
    }
  }, [searchQuery, filterStatus, visits]);
  
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
    fetchVisits();
  };
  
  const navigateToVisitDetail = (id: number) => {
    navigation.navigate('VisitDetail', { id });
  };
  
  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setSelectedDate(currentDate.toISOString().split('T')[0]);
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
  
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, do MMMM yyyy');
  };
  
  const renderVisitItem = ({ item }: { item: Visit }) => (
    <Card 
      style={styles.card}
      onPress={() => navigateToVisitDetail(item.id)}
    >
      <Card.Content>
        <View style={styles.visitHeader}>
          <View>
            <Text style={styles.visitTime}>
              {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.visitType}>{item.visitType}</Text>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusTextColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.userInfo}>
          <Icon name="account" size={20} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.userName}>{item.serviceUserName}</Text>
        </View>
        
        <View style={styles.locationInfo}>
          <Icon name="map-marker" size={20} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
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
      
      <View style={styles.dateSelector}>
        <Button icon="chevron-left" onPress={() => handleDateChange('prev')}>
          {t('visits.previous')}
        </Button>
        <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
        <Button icon="chevron-right" iconPosition="right" onPress={() => handleDateChange('next')}>
          {t('visits.next')}
        </Button>
      </View>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('visits.searchPlaceholder')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>{t('visits.filter')}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <Chip
            selected={filterStatus === 'scheduled'}
            onPress={() => toggleFilter('scheduled')}
            style={styles.filterChip}
          >
            {t('visits.scheduled')}
          </Chip>
          <Chip
            selected={filterStatus === 'completed'}
            onPress={() => toggleFilter('completed')}
            style={styles.filterChip}
          >
            {t('visits.completed')}
          </Chip>
          <Chip
            selected={filterStatus === 'cancelled'}
            onPress={() => toggleFilter('cancelled')}
            style={styles.filterChip}
          >
            {t('visits.cancelled')}
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
          data={filteredVisits}
          renderItem={renderVisitItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-blank" size={64} color={theme.colors.outline} />
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus
                  ? t('visits.noSearchResults')
                  : t('visits.noVisits')}
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
        onPress={() => navigation.navigate('AddVisit')}
        label={t('visits.addVisit')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
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
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  visitTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitType: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
  },
  icon: {
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

export default VisitsScreen;
