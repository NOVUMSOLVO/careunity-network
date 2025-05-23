import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Avatar, Button, Searchbar, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useOffline } from '../../contexts/offline-context';
import { serviceUserApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type ServiceUsersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceUsers'>;

interface ServiceUser {
  id: number;
  uniqueId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  profileImage?: string;
  hasActiveCareplan: boolean;
  upcomingVisits: number;
}

const ServiceUsersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ServiceUsersScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ServiceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  
  useEffect(() => {
    fetchServiceUsers();
  }, []);
  
  const fetchServiceUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await serviceUserApi.getAll();
      
      if (error) {
        throw new Error(error.message || t('serviceUsers.loadError'));
      }
      
      setServiceUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching service users:', error);
      setErrorMessage(error instanceof Error ? error.message : t('serviceUsers.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (serviceUsers.length > 0) {
      let result = [...serviceUsers];
      
      // Apply text search
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        result = result.filter(user => 
          user.fullName.toLowerCase().includes(lowerCaseQuery) ||
          user.uniqueId.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      // Apply active care plan filter
      if (filterActive) {
        result = result.filter(user => user.hasActiveCareplan);
      }
      
      setFilteredUsers(result);
    }
  }, [searchQuery, filterActive, serviceUsers]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const toggleActiveFilter = () => {
    setFilterActive(!filterActive);
  };
  
  const handleRefresh = () => {
    fetchServiceUsers();
  };
  
  const navigateToServiceUserDetail = (id: number) => {
    navigation.navigate('ServiceUserDetail', { id });
  };
  
  const renderServiceUserItem = ({ item }: { item: ServiceUser }) => (
    <Card 
      style={styles.card}
      onPress={() => navigateToServiceUserDetail(item.id)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Avatar.Image 
            size={60} 
            source={item.profileImage ? { uri: item.profileImage } : require('../../assets/avatar-placeholder.png')} 
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userId}>{item.uniqueId}</Text>
          <View style={styles.chipsContainer}>
            {item.hasActiveCareplan && (
              <Chip 
                icon="clipboard-check" 
                style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
                textStyle={{ color: theme.colors.onPrimaryContainer }}
                compact
              >
                {t('serviceUsers.activeCare')}
              </Chip>
            )}
            {item.upcomingVisits > 0 && (
              <Chip 
                icon="calendar" 
                style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ color: theme.colors.onSecondaryContainer }}
                compact
              >
                {t('serviceUsers.visits', { count: item.upcomingVisits })}
              </Chip>
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.outline} />
      </Card.Content>
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('serviceUsers.searchPlaceholder')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Button
          mode={filterActive ? "contained" : "outlined"}
          onPress={toggleActiveFilter}
          style={styles.filterButton}
          icon="filter-variant"
        >
          {t('serviceUsers.activeOnly')}
        </Button>
      </View>
      
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
        </View>
      )}
      
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
          data={filteredUsers}
          renderItem={renderServiceUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={64} color={theme.colors.outline} />
              <Text style={styles.emptyText}>
                {searchQuery || filterActive
                  ? t('serviceUsers.noSearchResults')
                  : t('serviceUsers.noServiceUsers')}
              </Text>
              {!searchQuery && !filterActive && (
                <Button mode="contained" onPress={handleRefresh} style={styles.refreshButton}>
                  {t('common.refresh')}
                </Button>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginTop: 4,
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
});

export default ServiceUsersScreen;
