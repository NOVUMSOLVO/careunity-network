/**
 * Feedback Form Component
 * 
 * A reusable form for collecting user feedback
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { FeedbackCategory, FeedbackPriority, FeedbackSource } from '@shared/types/feedback';
import { feedbackCategoryValues, feedbackPriorityValues, feedbackSourceValues } from '@shared/types/feedback';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Form schema
const feedbackFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(feedbackCategoryValues as [string, ...string[]]),
  priority: z.enum(feedbackPriorityValues as [string, ...string[]]).optional(),
  source: z.enum(feedbackSourceValues as [string, ...string[]]).optional(),
  relatedFeature: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: Partial<FeedbackFormValues>;
  isUpdate?: boolean;
  feedbackId?: number;
}

export function FeedbackForm({
  onSuccess,
  onCancel,
  defaultValues,
  isUpdate = false,
  feedbackId,
}: FeedbackFormProps) {
  const { t } = useTranslation();
  const api = useApi();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general' as FeedbackCategory,
      priority: 'medium' as FeedbackPriority,
      source: 'in_app' as FeedbackSource,
      relatedFeature: '',
      isPublic: true,
      ...defaultValues,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      if (isUpdate && feedbackId) {
        // Update existing feedback
        await api.feedback.updateFeedback(feedbackId, values);
        toast({
          title: t('feedback.updateSuccess'),
          description: t('feedback.updateSuccessDescription'),
        });
      } else {
        // Create new feedback
        await api.feedback.createFeedback(values);
        toast({
          title: t('feedback.submitSuccess'),
          description: t('feedback.submitSuccessDescription'),
        });
      }
      
      // Reset form and call success callback
      if (!isUpdate) {
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('feedback.submitError'),
        description: t('feedback.submitErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isUpdate ? t('feedback.updateTitle') : t('feedback.submitTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('feedback.titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.categoryLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('feedback.categoryPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackCategoryValues.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`feedback.categories.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('feedback.descriptionPlaceholder')}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority field */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.priorityLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('feedback.priorityPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackPriorityValues.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`feedback.priorities.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('feedback.priorityDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Related feature field */}
            <FormField
              control={form.control}
              name="relatedFeature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.relatedFeatureLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('feedback.relatedFeaturePlaceholder')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('feedback.relatedFeatureDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Public visibility checkbox */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('feedback.isPublicLabel')}</FormLabel>
                    <FormDescription>
                      {t('feedback.isPublicDescription')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUpdate ? t('common.update') : t('common.submit')}
        </Button>
      </CardFooter>
    </Card>
  );
}
