import React, { useState } from 'react';
import { useLanguage } from '../contexts/language-context';
import { useAccessibility, FontSize, ColorScheme } from '../contexts/accessibility-context';
import VoiceInput from '../components/VoiceInput';

const Settings: React.FC = () => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const {
    fontSize,
    setFontSize,
    colorScheme,
    setColorScheme,
    isHighContrast,
    setHighContrast,
    isReducedMotion,
    setReducedMotion,
    enableVoiceCommands,
    setEnableVoiceCommands,
    fontScale,
  } = useAccessibility();
  
  const [activeTab, setActiveTab] = useState('accessibility');

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Tab navigation
    if (lowerCommand.includes('accessibility')) {
      setActiveTab('accessibility');
    } else if (lowerCommand.includes('language')) {
      setActiveTab('language');
    } else if (lowerCommand.includes('account')) {
      setActiveTab('account');
    } else if (lowerCommand.includes('notification')) {
      setActiveTab('notifications');
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
    
    // Toggle commands
    else if (lowerCommand.includes('enable') || lowerCommand.includes('disable')) {
      if (lowerCommand.includes('reduced motion')) {
        setReducedMotion(lowerCommand.includes('enable'));
      } else if (lowerCommand.includes('high contrast')) {
        setHighContrast(lowerCommand.includes('enable'));
      } else if (lowerCommand.includes('voice')) {
        setEnableVoiceCommands(lowerCommand.includes('enable'));
      }
    }
    
    // Language commands
    else if (lowerCommand.includes('english')) {
      setLanguage('en');
    } else if (lowerCommand.includes('spanish') || lowerCommand.includes('español')) {
      setLanguage('es');
    } else if (lowerCommand.includes('french') || lowerCommand.includes('français')) {
      setLanguage('fr');
    }
  };

  // Calculate font size based on accessibility settings
  const getFontSize = (baseSize: number) => {
    return `${baseSize * fontScale}px`;
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'accessibility':
        return (
          <div className="settings-section">
            <h2 style={{ fontSize: getFontSize(20) }}>{t('accessibility')}</h2>
            
            {/* Font Size */}
            <div className="settings-group">
              <h3 style={{ fontSize: getFontSize(16) }}>{t('fontSize')}</h3>
              <div className="font-size-options">
                <button
                  className={fontSize === 'small' ? 'active' : ''}
                  onClick={() => setFontSize('small')}
                  style={{ fontSize: getFontSize(12) }}
                >
                  {t('small')}
                </button>
                <button
                  className={fontSize === 'medium' ? 'active' : ''}
                  onClick={() => setFontSize('medium')}
                  style={{ fontSize: getFontSize(14) }}
                >
                  {t('medium')}
                </button>
                <button
                  className={fontSize === 'large' ? 'active' : ''}
                  onClick={() => setFontSize('large')}
                  style={{ fontSize: getFontSize(16) }}
                >
                  {t('large')}
                </button>
                <button
                  className={fontSize === 'extra-large' ? 'active' : ''}
                  onClick={() => setFontSize('extra-large')}
                  style={{ fontSize: getFontSize(18) }}
                >
                  {t('extraLarge')}
                </button>
              </div>
            </div>
            
            {/* Color Scheme */}
            <div className="settings-group">
              <h3 style={{ fontSize: getFontSize(16) }}>{t('colorScheme')}</h3>
              <div className="color-scheme-options">
                <button
                  className={colorScheme === 'light' ? 'active' : ''}
                  onClick={() => setColorScheme('light')}
                >
                  {t('light')}
                </button>
                <button
                  className={colorScheme === 'dark' ? 'active' : ''}
                  onClick={() => setColorScheme('dark')}
                >
                  {t('dark')}
                </button>
                <button
                  className={colorScheme === 'system' ? 'active' : ''}
                  onClick={() => setColorScheme('system')}
                >
                  {t('system')}
                </button>
                <button
                  className={colorScheme === 'high-contrast' ? 'active' : ''}
                  onClick={() => setColorScheme('high-contrast')}
                >
                  {t('highContrast')}
                </button>
              </div>
            </div>
            
            {/* Toggle Options */}
            <div className="settings-group">
              <div className="toggle-option">
                <label htmlFor="reduced-motion">
                  <span style={{ fontSize: getFontSize(16) }}>{t('reducedMotion')}</span>
                </label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="reduced-motion"
                    checked={isReducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              
              <div className="toggle-option">
                <label htmlFor="high-contrast">
                  <span style={{ fontSize: getFontSize(16) }}>{t('highContrast')}</span>
                </label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="high-contrast"
                    checked={isHighContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              
              <div className="toggle-option">
                <label htmlFor="voice-commands">
                  <span style={{ fontSize: getFontSize(16) }}>{t('voiceCommands')}</span>
                </label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="voice-commands"
                    checked={enableVoiceCommands}
                    onChange={(e) => setEnableVoiceCommands(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'language':
        return (
          <div className="settings-section">
            <h2 style={{ fontSize: getFontSize(20) }}>{t('language')}</h2>
            
            <div className="language-options">
              {Object.entries(availableLanguages).map(([code, langInfo]) => (
                <button
                  key={code}
                  className={language === code ? 'active' : ''}
                  onClick={() => setLanguage(code as LanguageCode)}
                >
                  <span className="language-name" style={{ fontSize: getFontSize(16) }}>
                    {langInfo.nativeName}
                  </span>
                  <span className="language-native" style={{ fontSize: getFontSize(14) }}>
                    ({langInfo.name})
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="settings-section">
            <h2 style={{ fontSize: getFontSize(20) }}>Coming Soon</h2>
            <p style={{ fontSize: getFontSize(16) }}>
              This settings section is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 style={{ fontSize: getFontSize(24) }}>{t('settings')}</h1>
        
        {/* Voice command button */}
        {enableVoiceCommands && (
          <div className="voice-command-button">
            <VoiceInput onCommand={handleVoiceCommand} />
          </div>
        )}
      </div>
      
      <div className="settings-container">
        {/* Settings tabs */}
        <div className="settings-tabs">
          <button
            className={activeTab === 'accessibility' ? 'active' : ''}
            onClick={() => setActiveTab('accessibility')}
            style={{ fontSize: getFontSize(14) }}
          >
            {t('accessibility')}
          </button>
          <button
            className={activeTab === 'language' ? 'active' : ''}
            onClick={() => setActiveTab('language')}
            style={{ fontSize: getFontSize(14) }}
          >
            {t('language')}
          </button>
          <button
            className={activeTab === 'account' ? 'active' : ''}
            onClick={() => setActiveTab('account')}
            style={{ fontSize: getFontSize(14) }}
          >
            Account
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
            style={{ fontSize: getFontSize(14) }}
          >
            Notifications
          </button>
        </div>
        
        {/* Settings content */}
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
