/**
 * Feedback Button Component
 * 
 * A floating button that opens the feedback dialog
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackDialog } from './FeedbackDialog';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/hooks/useAccessibility';

interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultCategory?: string;
  defaultRelatedFeature?: string;
}

export function FeedbackButton({
  position = 'bottom-right',
  defaultCategory,
  defaultRelatedFeature,
}: FeedbackButtonProps) {
  const { t } = useTranslation();
  const { isReducedMotion } = useAccessibility();
  
  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  
  return (
    <div className={`fixed ${positionStyles[position]} z-50`}>
      <FeedbackDialog
        trigger={
          <Button
            size="lg"
            className={`rounded-full shadow-lg ${
              isReducedMotion ? '' : 'hover:scale-105 transition-transform'
            }`}
          >
            <MessageSquarePlus className="mr-2 h-5 w-5" />
            {t('feedback.provideFeedback')}
          </Button>
        }
        defaultCategory={defaultCategory as any}
        defaultRelatedFeature={defaultRelatedFeature}
      />
    </div>
  );
}
