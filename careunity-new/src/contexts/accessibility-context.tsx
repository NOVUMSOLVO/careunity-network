import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorScheme = 'light' | 'dark' | 'system' | 'high-contrast';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  isReducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  isScreenReaderEnabled: boolean;
  fontScale: number;
  actualColorScheme: 'light' | 'dark';
  enableVoiceCommands: boolean;
  setEnableVoiceCommands: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider component for accessibility settings
 * Manages font size, color scheme, motion preferences, and other accessibility features
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Use localStorage to persist settings
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem('accessibility_font_size');
    return savedSize ? (savedSize as FontSize) : 'medium';
  });
  
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const savedScheme = localStorage.getItem('accessibility_color_scheme');
    return savedScheme ? (savedScheme as ColorScheme) : 'system';
  });
  
  const [isHighContrast, setIsHighContrastState] = useState<boolean>(() => {
    const savedHighContrast = localStorage.getItem('accessibility_high_contrast');
    return savedHighContrast === 'true';
  });
  
  const [isReducedMotion, setIsReducedMotionState] = useState<boolean>(() => {
    const savedReducedMotion = localStorage.getItem('accessibility_reduced_motion');
    return savedReducedMotion === 'true';
  });
  
  const [enableVoiceCommands, setEnableVoiceCommandsState] = useState<boolean>(() => {
    const savedVoiceCommands = localStorage.getItem('accessibility_voice_commands');
    return savedVoiceCommands === 'true';
  });
  
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>('light');

  // Detect system color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemColorScheme(e.matches ? 'dark' : 'light');
    };
    
    // Set initial value
    setSystemColorScheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Detect screen reader
  useEffect(() => {
    const checkScreenReader = () => {
      // Different ways to detect screen readers
      const hasScreenReaderHint = 
        document.documentElement.getAttribute('aria-live') === 'assertive' ||
        document.documentElement.getAttribute('role') === 'application';
      
      // Check for common screen reader classes
      const hasScreenReaderClass = 
        document.documentElement.classList.contains('sr-only') ||
        document.documentElement.classList.contains('screen-reader');
      
      setIsScreenReaderEnabled(hasScreenReaderHint || hasScreenReaderClass);
    };
    
    checkScreenReader();
    
    // Check periodically (screen readers might be turned on after page load)
    const interval = setInterval(checkScreenReader, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Update font scale based on font size
  useEffect(() => {
    let newScale = 1;
    
    switch (fontSize) {
      case 'small':
        newScale = 0.85;
        break;
      case 'medium':
        newScale = 1;
        break;
      case 'large':
        newScale = 1.15;
        break;
      case 'extra-large':
        newScale = 1.3;
        break;
    }
    
    setFontScale(newScale);
    
    // Apply font scale to root element
    document.documentElement.style.setProperty('--font-scale', newScale.toString());
  }, [fontSize]);

  // Apply color scheme to document
  useEffect(() => {
    const actualScheme = colorScheme === 'system' 
      ? systemColorScheme 
      : colorScheme === 'high-contrast' 
        ? 'light' // High contrast is based on light theme
        : colorScheme;
    
    // Remove existing theme classes
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');
    
    // Add new theme class
    if (colorScheme === 'high-contrast') {
      document.documentElement.classList.add('high-contrast-theme');
    } else {
      document.documentElement.classList.add(`${actualScheme}-theme`);
    }
    
    // Update color-scheme property for browser UI
    document.documentElement.style.colorScheme = actualScheme;
  }, [colorScheme, systemColorScheme]);

  // Apply reduced motion preference
  useEffect(() => {
    if (isReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [isReducedMotion]);

  // Set font size
  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('accessibility_font_size', size);
  };

  // Set color scheme
  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem('accessibility_color_scheme', scheme);
  };

  // Set high contrast mode
  const setHighContrast = (enabled: boolean) => {
    setIsHighContrastState(enabled);
    localStorage.setItem('accessibility_high_contrast', enabled.toString());
    
    if (enabled) {
      setColorScheme('high-contrast');
    } else if (colorScheme === 'high-contrast') {
      setColorScheme('system');
    }
  };

  // Set reduced motion
  const setReducedMotion = (enabled: boolean) => {
    setIsReducedMotionState(enabled);
    localStorage.setItem('accessibility_reduced_motion', enabled.toString());
  };

  // Set voice commands
  const setEnableVoiceCommands = (enabled: boolean) => {
    setEnableVoiceCommandsState(enabled);
    localStorage.setItem('accessibility_voice_commands', enabled.toString());
  };

  // Calculate the actual color scheme based on system and user preference
  const actualColorScheme = colorScheme === 'system' 
    ? systemColorScheme
    : colorScheme === 'high-contrast' 
      ? 'light' // High contrast is based on light theme
      : colorScheme as 'light' | 'dark';

  const value = {
    fontSize,
    setFontSize,
    colorScheme,
    setColorScheme,
    isHighContrast,
    setHighContrast,
    isReducedMotion,
    setReducedMotion,
    isScreenReaderEnabled,
    fontScale,
    actualColorScheme,
    enableVoiceCommands,
    setEnableVoiceCommands,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

/**
 * Hook to use the accessibility context
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}
