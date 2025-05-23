/**
 * Feedback Response Dialog Component
 * 
 * A modal dialog for responding to feedback
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { FeedbackResponse } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Form schema
const responseFormSchema = z.object({
  content: z.string().min(1, 'Response cannot be empty').max(1000, 'Response cannot exceed 1000 characters'),
});

type ResponseFormValues = z.infer<typeof responseFormSchema>;

interface FeedbackResponseDialogProps {
  feedbackId: number;
  trigger?: React.ReactNode;
  onResponseSubmitted?: () => void;
}

export function FeedbackResponseDialog({
  feedbackId,
  trigger,
  onResponseSubmitted,
}: FeedbackResponseDialogProps) {
  const { t } = useTranslation();
  const api = useApi();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      content: '',
    },
  });
  
  // Load responses when dialog opens
  useEffect(() => {
    if (open) {
      loadResponses();
    }
  }, [open, feedbackId]);
  
  // Load responses
  const loadResponses = async () => {
    setLoading(true);
    try {
      const data = await api.feedback.getFeedbackResponses(feedbackId);
      setResponses(data);
    } catch (error) {
      console.error('Error loading responses:', error);
      toast({
        title: t('feedback.loadResponsesError'),
        description: t('feedback.loadResponsesErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: ResponseFormValues) => {
    setSubmitting(true);
    try {
      await api.feedback.addFeedbackResponse(feedbackId, {
        content: values.content,
      });
      
      // Reset form
      form.reset();
      
      // Reload responses
      await loadResponses();
      
      toast({
        title: t('feedback.responseSubmitSuccess'),
        description: t('feedback.responseSubmitSuccessDescription'),
      });
      
      if (onResponseSubmitted) {
        onResponseSubmitted();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: t('feedback.responseSubmitError'),
        description: t('feedback.responseSubmitErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <MessageSquare className="mr-2 h-4 w-4" />
      {t('feedback.viewResponses')}
    </Button>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('feedback.responsesTitle')}</DialogTitle>
          <DialogDescription>
            {t('feedback.responsesDescription')}
          </DialogDescription>
        </DialogHeader>
        
        {/* Responses list */}
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('feedback.noResponses')}
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => {
                const createdAt = new Date(response.createdAt);
                const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
                
                return (
                  <div key={response.id} className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials('User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">User #{response.userId}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        {response.isOfficial && (
                          <Badge variant="default" className="text-xs">
                            {t('feedback.officialResponse')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-line">{response.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <Separator className="my-4" />
        
        {/* Response form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.yourResponse')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('feedback.responsePlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('feedback.submitResponse')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
