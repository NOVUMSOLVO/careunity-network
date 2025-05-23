import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, Searchbar, ActivityIndicator, Divider, FAB, useTheme, IconButton, Menu, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useOffline } from '../../contexts/offline-context';
import { RootStackParamList } from '../../navigation/types';

type NotesScreenRouteProp = RouteProp<RootStackParamList, 'Notes'>;
type NotesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notes'>;

// We'll need to add this to the API service
const notesApi = {
  getAll: async (serviceUserId: number) => {
    // This would be an actual API call in a real implementation
    // For now, return mock data
    return {
      data: [
        {
          id: 1,
          content: 'Client mentioned having trouble sleeping. Consider discussing sleep hygiene at next visit.',
          createdAt: '2025-05-15T09:30:00',
          createdBy: 'Jane Smith',
          category: 'observation',
        },
        {
          id: 2,
          content: 'Family reports improvement in mood after medication adjustment. Continue monitoring for side effects.',
          createdAt: '2025-05-10T14:22:00',
          createdBy: 'John Doe',
          category: 'medication',
        },
        {
          id: 3,
          content: 'Completed assessment of home environment. Kitchen requires additional safety modifications.',
          createdAt: '2025-05-05T11:15:00',
          createdBy: 'Emma Wilson',
          category: 'assessment',
        },
      ],
      error: null,
    };
  },
  delete: async (id: number) => {
    // Mock delete function
    return { data: { success: true }, error: null };
  }
};

interface Note {
  id: number;
  content: string;
  createdAt: string;
  createdBy: string;
  category: string;
}

const NotesScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<NotesScreenRouteProp>();
  const navigation = useNavigation<NotesScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { serviceUserId } = route.params;
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  
  useEffect(() => {
    fetchNotes();
  }, [serviceUserId]);
  
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await notesApi.getAll(serviceUserId);
      
      if (error) {
        throw new Error(error.message || t('notes.loadError'));
      }
      
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setErrorMessage(error instanceof Error ? error.message : t('notes.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (notes.length > 0) {
      let result = [...notes];
      
      // Apply text search
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        result = result.filter(note => 
          note.content.toLowerCase().includes(lowerCaseQuery) ||
          note.createdBy.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      // Apply category filter
      if (selectedCategory) {
        result = result.filter(note => note.category === selectedCategory);
      }
      
      setFilteredNotes(result);
    }
  }, [searchQuery, selectedCategory, notes]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };
  
  const handleRefresh = () => {
    fetchNotes();
  };
  
  const openMenu = (id: number) => {
    setMenuVisible(id);
  };
  
  const closeMenu = () => {
    setMenuVisible(null);
  };
  
  const confirmDelete = (id: number) => {
    setNoteToDelete(id);
    setDeleteDialogVisible(true);
    closeMenu();
  };
  
  const handleDelete = async () => {
    if (!noteToDelete || !isOnline) return;
    
    try {
      const { error } = await notesApi.delete(noteToDelete);
      
      if (error) {
        throw new Error(error.message || t('notes.deleteError'));
      }
      
      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteToDelete));
      setFilteredNotes(prev => prev.filter(note => note.id !== noteToDelete));
    } catch (error) {
      console.error('Error deleting note:', error);
      setErrorMessage(error instanceof Error ? error.message : t('notes.deleteError'));
    } finally {
      setDeleteDialogVisible(false);
      setNoteToDelete(null);
    }
  };
  
  const navigateToAddNote = () => {
    navigation.navigate('AddNote', { serviceUserId });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'observation':
        return 'eye-outline';
      case 'medication':
        return 'pill';
      case 'assessment':
        return 'clipboard-text-outline';
      case 'appointment':
        return 'calendar-clock';
      case 'incident':
        return 'alert-outline';
      default:
        return 'note-text-outline';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'observation':
        return theme.colors.primary;
      case 'medication':
        return theme.colors.secondary;
      case 'assessment':
        return theme.colors.tertiary;
      case 'appointment':
        return theme.colors.primaryContainer;
      case 'incident':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };
  
  const renderNoteItem = ({ item }: { item: Note }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.noteHeader}>
          <View style={styles.categoryIconContainer}>
            <Icon 
              name={getCategoryIcon(item.category)} 
              size={24} 
              color={getCategoryColor(item.category)} 
            />
          </View>
          <View style={styles.noteContentContainer}>
            <Text style={styles.noteContent}>{item.content}</Text>
            <View style={styles.noteMetaContainer}>
              <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.noteAuthor}>by {item.createdBy}</Text>
            </View>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => openMenu(item.id)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                closeMenu();
                console.log('Edit note', item.id);
              }} 
              title={t('notes.edit')} 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => confirmDelete(item.id)} 
              title={t('notes.delete')} 
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );
  
  // Get unique categories from notes
  const categories = [...new Set(notes.map(note => note.category))];
  
  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('notes.searchPlaceholder')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>{t('notes.filterByCategory')}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {categories.map((category) => (
            <Button
              key={category}
              mode={selectedCategory === category ? "contained" : "outlined"}
              onPress={() => toggleCategory(category)}
              style={styles.filterButton}
              icon={getCategoryIcon(category)}
            >
              {category}
            </Button>
          ))}
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
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="note-text-outline" size={64} color={theme.colors.outline} />
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory
                  ? t('notes.noSearchResults')
                  : t('notes.noNotes')}
              </Text>
              {!searchQuery && !selectedCategory && (
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
        onPress={navigateToAddNote}
        label={t('notes.addNote')}
      />
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>{t('notes.confirmDelete')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('notes.deleteWarning')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>{t('common.delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingBottom: 8,
  },
  filterButton: {
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
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  noteContentContainer: {
    flex: 1,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  noteMetaContainer: {
    flexDirection: 'row',
    marginTop: 8,
    opacity: 0.7,
  },
  noteDate: {
    fontSize: 12,
    marginRight: 8,
  },
  noteAuthor: {
    fontSize: 12,
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

export default NotesScreen;
