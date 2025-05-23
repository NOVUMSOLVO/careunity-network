import React from 'react';
import { useLanguage } from '../contexts/language-context';
import { useAccessibility } from '../contexts/accessibility-context';
import VoiceInput from './VoiceInput';

const Header: React.FC = () => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { fontSize, setFontSize, colorScheme, setColorScheme, enableVoiceCommands } = useAccessibility();

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Language commands
    if (lowerCommand.includes('english')) {
      setLanguage('en');
    } else if (lowerCommand.includes('spanish') || lowerCommand.includes('español')) {
      setLanguage('es');
    } else if (lowerCommand.includes('french') || lowerCommand.includes('français')) {
      setLanguage('fr');
    }
    
    // Font size commands
    else if (lowerCommand.includes('font') || lowerCommand.includes('size')) {
      if (lowerCommand.includes('small')) {
        setFontSize('small');
      } else if (lowerCommand.includes('large')) {
        setFontSize('large');
      } else if (lowerCommand.includes('extra large')) {
        setFontSize('extra-large');
      } else {
        setFontSize('medium');
      }
    }
    
    // Theme commands
    else if (lowerCommand.includes('theme') || lowerCommand.includes('mode')) {
      if (lowerCommand.includes('dark')) {
        setColorScheme('dark');
      } else if (lowerCommand.includes('light')) {
        setColorScheme('light');
      } else if (lowerCommand.includes('system')) {
        setColorScheme('system');
      } else if (lowerCommand.includes('high contrast')) {
        setColorScheme('high-contrast');
      }
    }
  };

  return (
    <header className="app-header">
      <div className="logo">
        <h1>CareUnity</h1>
      </div>
      
      <div className="header-controls">
        {/* Language selector */}
        <div className="language-selector">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            aria-label="Select language"
          >
            {Object.entries(availableLanguages).map(([code, langInfo]) => (
              <option key={code} value={code}>
                {langInfo.nativeName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Font size controls */}
        <div className="font-size-controls">
          <button 
            onClick={() => setFontSize('small')}
            className={fontSize === 'small' ? 'active' : ''}
            aria-label="Small font size"
            aria-pressed={fontSize === 'small'}
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('medium')}
            className={fontSize === 'medium' ? 'active' : ''}
            aria-label="Medium font size"
            aria-pressed={fontSize === 'medium'}
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('large')}
            className={fontSize === 'large' ? 'active' : ''}
            aria-label="Large font size"
            aria-pressed={fontSize === 'large'}
          >
            A
          </button>
        </div>
        
        {/* Theme selector */}
        <div className="theme-selector">
          <select 
            value={colorScheme} 
            onChange={(e) => setColorScheme(e.target.value as any)}
            aria-label="Select theme"
          >
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="system">{t('system')}</option>
            <option value="high-contrast">{t('highContrast')}</option>
          </select>
        </div>
        
        {/* Voice input */}
        {enableVoiceCommands && (
          <VoiceInput onCommand={handleVoiceCommand} />
        )}
      </div>
    </header>
  );
};

export default Header;
