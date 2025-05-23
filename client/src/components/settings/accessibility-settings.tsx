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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAccessibility, FontSize, ColorScheme } from '@/contexts/accessibility-context';
import { VoiceInput } from '@/components/ui/voice-input';

/**
 * Accessibility Settings component
 * 
 * Allows users to customize accessibility preferences including:
 * - Font size
 * - Color scheme
 * - Reduced motion
 * - High contrast
 * - Voice commands
 */
export function AccessibilitySettings() {
  const { t } = useTranslation();
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
  } = useAccessibility();

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Font size commands
    if (lowerCommand.includes('small') && lowerCommand.includes('font')) {
      setFontSize('small');
    } else if (lowerCommand.includes('medium') && lowerCommand.includes('font')) {
      setFontSize('medium');
    } else if (lowerCommand.includes('large') && lowerCommand.includes('font')) {
      setFontSize('large');
    } else if (lowerCommand.includes('extra large') && lowerCommand.includes('font')) {
      setFontSize('extra-large');
    }
    
    // Color scheme commands
    else if (lowerCommand.includes('light') && lowerCommand.includes('theme')) {
      setColorScheme('light');
    } else if (lowerCommand.includes('dark') && lowerCommand.includes('theme')) {
      setColorScheme('dark');
    } else if (lowerCommand.includes('system') && lowerCommand.includes('theme')) {
      setColorScheme('system');
    } else if (lowerCommand.includes('high contrast')) {
      setHighContrast(true);
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('accessibility.title')}</CardTitle>
        <CardDescription>
          Customize accessibility settings to improve your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size" className="text-base">
              {t('accessibility.fontSize')}
            </Label>
            
            {/* Voice command button for accessibility settings */}
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
          
          <RadioGroup
            id="font-size"
            value={fontSize}
            onValueChange={(value) => setFontSize(value as FontSize)}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div>
              <RadioGroupItem
                value="small"
                id="font-small"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-small"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-sm">{t('accessibility.small')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="medium"
                id="font-medium"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-medium"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-base">{t('accessibility.medium')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="large"
                id="font-large"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-large"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-lg">{t('accessibility.large')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="extra-large"
                id="font-extra-large"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-extra-large"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xl">{t('accessibility.extraLarge')}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Separator />
        
        {/* Color Scheme */}
        <div className="space-y-3">
          <Label htmlFor="color-scheme" className="text-base">
            {t('accessibility.colorScheme')}
          </Label>
          
          <RadioGroup
            id="color-scheme"
            value={colorScheme}
            onValueChange={(value) => setColorScheme(value as ColorScheme)}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="theme-light"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-black">{t('accessibility.light')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="dark"
                id="theme-dark"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-900 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-white">{t('accessibility.dark')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="system"
                id="theme-system"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-white to-gray-900 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-gray-700">{t('accessibility.system')}</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="high-contrast"
                id="theme-high-contrast"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-high-contrast"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-black font-bold">{t('accessibility.highContrast')}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Separator />
        
        {/* Toggle Options */}
        <div className="space-y-4">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-base">
                {t('accessibility.reducedMotion')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('accessibility.reducedMotionDescription')}
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={isReducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>
          
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base">
                {t('accessibility.highContrast')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={isHighContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
          
          {/* Voice Commands */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-commands" className="text-base">
                {t('accessibility.voiceInput')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('accessibility.voiceInputDescription')}
              </p>
            </div>
            <Switch
              id="voice-commands"
              checked={enableVoiceCommands}
              onCheckedChange={setEnableVoiceCommands}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
