import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, Button, HelperText, Divider, useTheme, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useOffline } from '../../contexts/offline-context';
import { RootStackParamList } from '../../navigation/types';

type AddNoteScreenRouteProp = RouteProp<RootStackParamList, 'AddNote'>;
type AddNoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddNote'>;

// We'll need to add this to the API service
const notesApi = {
  create: async (data: { serviceUserId: number; content: string; category: string }) => {
    // Mock create function
    console.log('Creating note:', data);
    return { data: { id: Math.floor(Math.random() * 1000) }, error: null };
  }
};

const AddNoteScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<AddNoteScreenRouteProp>();
  const navigation = useNavigation<AddNoteScreenNavigationProp>();
  const theme = useTheme();
  const { isOnline } = useOffline();
  
  const { serviceUserId } = route.params;
  
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const categories = [
    { value: 'observation', label: t('notes.categoryObservation'), icon: 'eye-outline' },
    { value: 'medication', label: t('notes.categoryMedication'), icon: 'pill' },
    { value: 'assessment', label: t('notes.categoryAssessment'), icon: 'clipboard-text-outline' },
    { value: 'appointment', label: t('notes.categoryAppointment'), icon: 'calendar-clock' },
    { value: 'incident', label: t('notes.categoryIncident'), icon: 'alert-outline' },
    { value: 'other', label: t('notes.categoryOther'), icon: 'note-text-outline' },
  ];
  
  const validateForm = () => {
    if (!content.trim()) {
      setErrorMessage(t('notes.errorEmptyContent'));
      return false;
    }
    
    if (!category) {
      setErrorMessage(t('notes.errorNoCategory'));
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !isOnline) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      const { error } = await notesApi.create({
        serviceUserId,
        content: content.trim(),
        category,
      });
      
      if (error) {
        throw new Error(error.message || t('notes.createError'));
      }
      
      // Navigate back to notes screen after successful creation
      navigation.goBack();
    } catch (error) {
      console.error('Error creating note:', error);
      setErrorMessage(error instanceof Error ? error.message : t('notes.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getCategoryIcon = (categoryValue: string) => {
    const found = categories.find(cat => cat.value === categoryValue);
    return found ? found.icon : 'note-text-outline';
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        {!isOnline && (
          <View style={[styles.offlineBar, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={{ color: theme.colors.onErrorContainer }}>{t('common.offlineMode')}</Text>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>{t('notes.noteContent')}</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
            placeholder={t('notes.contentPlaceholder')}
            style={styles.textInput}
          />
          {errorMessage && content.trim() === '' && (
            <HelperText type="error" visible={true}>
              {t('notes.errorEmptyContent')}
            </HelperText>
          )}
          
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('notes.category')}</Text>
          <RadioButton.Group onValueChange={value => setCategory(value)} value={category}>
            {categories.map((cat) => (
              <View key={cat.value} style={styles.categoryOption}>
                <RadioButton value={cat.value} />
                <Icon name={cat.icon} size={24} style={styles.categoryIcon} />
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </View>
            ))}
          </RadioButton.Group>
          
          {errorMessage && !category && (
            <HelperText type="error" visible={true}>
              {t('notes.errorNoCategory')}
            </HelperText>
          )}
          
          {errorMessage && errorMessage !== t('notes.errorEmptyContent') && errorMessage !== t('notes.errorNoCategory') && (
            <HelperText type="error" visible={true}>
              {errorMessage}
            </HelperText>
          )}
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.goBack()} 
              style={styles.button}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting || !isOnline}
              icon={() => <Icon name={getCategoryIcon(category)} size={20} color="#fff" />}
            >
              {t('notes.saveNote')}
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  offlineBar: {
    padding: 8,
    alignItems: 'center',
  },
});

export default AddNoteScreen;
