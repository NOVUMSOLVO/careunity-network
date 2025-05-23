import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { NativeModules, Platform } from 'react-native';

// Import translations
import enTranslations from '../i18n/en.json';
import esTranslations from '../i18n/es.json';
import frTranslations from '../i18n/fr.json';

// Define available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
};

export type LanguageCode = keyof typeof LANGUAGES;

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  isRTL: boolean;
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isRTL, setIsRTL] = useState(false);

  // Get device language on first load
  useEffect(() => {
    const getDeviceLanguage = async () => {
      try {
        // Try to get stored language preference first
        const storedLanguage = await AsyncStorage.getItem('app_language');
        
        if (storedLanguage && Object.keys(LANGUAGES).includes(storedLanguage)) {
          await setLanguage(storedLanguage as LanguageCode);
          return;
        }
        
        // If no stored preference, use device language
        let deviceLanguage: string;
        
        if (Platform.OS === 'ios') {
          deviceLanguage = NativeModules.SettingsManager.settings.AppleLocale ||
                          NativeModules.SettingsManager.settings.AppleLanguages[0];
        } else {
          deviceLanguage = NativeModules.I18nManager.localeIdentifier;
        }
        
        // Extract language code (e.g., 'en_US' -> 'en')
        const languageCode = deviceLanguage.split('_')[0];
        
        // Check if we support this language
        if (Object.keys(LANGUAGES).includes(languageCode)) {
          await setLanguage(languageCode as LanguageCode);
        } else {
          // Default to English if language not supported
          await setLanguage('en');
        }
      } catch (error) {
        console.error('Error getting device language:', error);
        await setLanguage('en');
      }
    };
    
    getDeviceLanguage();
  }, []);

  // Set language and update i18n
  const setLanguage = async (code: LanguageCode) => {
    try {
      // Update i18n
      await i18n.changeLanguage(code);
      
      // Update state
      setLanguageState(code);
      setIsRTL(LANGUAGES[code].isRTL);
      
      // Save to storage
      await AsyncStorage.setItem('app_language', code);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const value = {
    language,
    setLanguage,
    isRTL,
    availableLanguages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
