/**
 * Feedback Dialog Component
 * 
 * A modal dialog for collecting user feedback
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackCategory } from '@shared/types/feedback';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button, ButtonProps } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
  buttonProps?: ButtonProps;
  buttonLabel?: string;
  showIcon?: boolean;
  defaultCategory?: FeedbackCategory;
  defaultRelatedFeature?: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackDialog({
  trigger,
  buttonProps,
  buttonLabel,
  showIcon = true,
  defaultCategory = 'general',
  defaultRelatedFeature,
  onFeedbackSubmitted,
}: FeedbackDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted();
    }
  };

  const defaultTrigger = (
    <Button {...buttonProps}>
      {showIcon && <MessageSquarePlus className="mr-2 h-4 w-4" />}
      {buttonLabel || t('feedback.provideFeedback')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('feedback.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('feedback.dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
          defaultValues={{
            category: defaultCategory,
            relatedFeature: defaultRelatedFeature,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
