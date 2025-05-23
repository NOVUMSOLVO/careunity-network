import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
};

export type LanguageCode = keyof typeof LANGUAGES;

// Simple translation function (in a real app, you would use i18next or similar)
export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    settings: 'Settings',
    profile: 'Profile',
    serviceUsers: 'Service Users',
    visits: 'Visits',
    reports: 'Reports',
    welcome: 'Welcome to CareUnity',
    accessibility: 'Accessibility',
    language: 'Language',
    fontSize: 'Font Size',
    colorScheme: 'Color Scheme',
    reducedMotion: 'Reduced Motion',
    highContrast: 'High Contrast',
    voiceCommands: 'Voice Commands',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra Large',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    enable: 'Enable',
    disable: 'Disable',
    save: 'Save',
    cancel: 'Cancel',
  },
  es: {
    dashboard: 'Panel',
    settings: 'Configuración',
    profile: 'Perfil',
    serviceUsers: 'Usuarios de Servicio',
    visits: 'Visitas',
    reports: 'Informes',
    welcome: 'Bienvenido a CareUnity',
    accessibility: 'Accesibilidad',
    language: 'Idioma',
    fontSize: 'Tamaño de Fuente',
    colorScheme: 'Esquema de Color',
    reducedMotion: 'Movimiento Reducido',
    highContrast: 'Alto Contraste',
    voiceCommands: 'Comandos de Voz',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    extraLarge: 'Extra Grande',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    enable: 'Activar',
    disable: 'Desactivar',
    save: 'Guardar',
    cancel: 'Cancelar',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    settings: 'Paramètres',
    profile: 'Profil',
    serviceUsers: 'Bénéficiaires',
    visits: 'Visites',
    reports: 'Rapports',
    welcome: 'Bienvenue à CareUnity',
    accessibility: 'Accessibilité',
    language: 'Langue',
    fontSize: 'Taille de Police',
    colorScheme: 'Thème de Couleur',
    reducedMotion: 'Mouvement Réduit',
    highContrast: 'Contraste Élevé',
    voiceCommands: 'Commandes Vocales',
    small: 'Petite',
    medium: 'Moyenne',
    large: 'Grande',
    extraLarge: 'Très Grande',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    enable: 'Activer',
    disable: 'Désactiver',
    save: 'Enregistrer',
    cancel: 'Annuler',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  isRTL: boolean;
  availableLanguages: typeof LANGUAGES;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Provider component for language settings
 * Manages language selection and translations
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem('app_language');
    return (savedLanguage && Object.keys(LANGUAGES).includes(savedLanguage)) 
      ? (savedLanguage as LanguageCode) 
      : 'en';
  });
  
  const [isRTL, setIsRTL] = useState(false);

  // Update RTL status when language changes
  useEffect(() => {
    const isRTL = LANGUAGES[language]?.isRTL || false;
    setIsRTL(isRTL);
    
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Set language
  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem('app_language', code);
    setIsRTL(LANGUAGES[code].isRTL);
    
    // Update document attributes
    document.documentElement.lang = code;
    document.documentElement.dir = LANGUAGES[code].isRTL ? 'rtl' : 'ltr';
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    isRTL,
    availableLanguages: LANGUAGES,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
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
