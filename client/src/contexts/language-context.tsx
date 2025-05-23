import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
};

export type LanguageCode = keyof typeof LANGUAGES;

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

/**
 * Provider component for language settings
 * Manages language selection and internationalization
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useLocalStorage<LanguageCode>('app_language', 'en');
  const [isRTL, setIsRTL] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize i18next
  useEffect(() => {
    const initI18n = async () => {
      // Import translations dynamically
      const enTranslations = await import('@/i18n/en.json');
      const esTranslations = await import('@/i18n/es.json');
      const frTranslations = await import('@/i18n/fr.json');
      
      await i18n
        .use(initReactI18next)
        .init({
          resources: {
            en: { translation: enTranslations.default },
            es: { translation: esTranslations.default },
            fr: { translation: frTranslations.default },
          },
          lng: language,
          fallbackLng: 'en',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });
      
      setIsInitialized(true);
    };
    
    initI18n();
  }, []);

  // Update RTL status when language changes
  useEffect(() => {
    if (isInitialized) {
      const isRTL = LANGUAGES[language]?.isRTL || false;
      setIsRTL(isRTL);
      
      // Update document direction
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Update i18n language
      i18n.changeLanguage(language);
    }
  }, [language, isInitialized]);

  // Set language and update i18n
  const setLanguage = async (code: LanguageCode) => {
    try {
      // Update i18n
      await i18n.changeLanguage(code);
      
      // Update state
      setLanguageState(code);
      setIsRTL(LANGUAGES[code].isRTL);
      
      // Update document attributes
      document.documentElement.lang = code;
      document.documentElement.dir = LANGUAGES[code].isRTL ? 'rtl' : 'ltr';
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

  // Don't render children until i18n is initialized
  if (!isInitialized) {
    return <div>Loading translations...</div>;
  }

  return (
    <LanguageContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use the language context
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}
