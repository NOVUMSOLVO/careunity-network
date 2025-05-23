import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useLanguage, LanguageCode } from '@/contexts/language-context';
import { VoiceInput } from '@/components/ui/voice-input';
import { useAccessibility } from '@/contexts/accessibility-context';

/**
 * Language Settings component
 * 
 * Allows users to select their preferred language
 */
export function LanguageSettings() {
  const { t } = useTranslation();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { enableVoiceCommands } = useAccessibility();

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Language selection commands
    if (lowerCommand.includes('english') || lowerCommand.includes('inglés') || lowerCommand.includes('anglais')) {
      setLanguage('en');
    } else if (lowerCommand.includes('spanish') || lowerCommand.includes('español') || lowerCommand.includes('espagnol')) {
      setLanguage('es');
    } else if (lowerCommand.includes('french') || lowerCommand.includes('francés') || lowerCommand.includes('français')) {
      setLanguage('fr');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('settings.language')}</CardTitle>
            <CardDescription>
              Select your preferred language
            </CardDescription>
          </div>
          
          {/* Voice command button for language settings */}
          {enableVoiceCommands && (
            <VoiceInput
              commandMode
              onCommand={handleVoiceCommand}
              size="sm"
              variant="outline"
              iconOnly
              ariaLabel={t('voiceInput.tap')}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={language}
          onValueChange={(value) => setLanguage(value as LanguageCode)}
          className="space-y-3"
        >
          {Object.entries(availableLanguages).map(([code, langInfo]) => (
            <div
              key={code}
              className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent"
            >
              <RadioGroupItem
                value={code}
                id={`lang-${code}`}
                className="sr-only"
              />
              <Label
                htmlFor={`lang-${code}`}
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-medium">{langInfo.nativeName}</div>
                  <div className="text-sm text-muted-foreground">({langInfo.name})</div>
                </div>
                {language === code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <p className="mt-4 text-sm text-muted-foreground">
          More languages will be added in future updates.
        </p>
      </CardContent>
    </Card>
  );
}
