/**
 * Data Privacy Settings Component
 * 
 * Allows users to manage their data privacy preferences
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Download, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Form schema
const privacyFormSchema = z.object({
  shareUsageData: z.boolean().default(true),
  allowProfiling: z.boolean().default(true),
  allowThirdPartySharing: z.boolean().default(false),
  allowLocationTracking: z.boolean().default(true),
  allowCookies: z.boolean().default(true),
  allowMarketingEmails: z.boolean().default(false),
  allowPersonalization: z.boolean().default(true),
});

type PrivacyFormValues = z.infer<typeof privacyFormSchema>;

interface DataPrivacySettingsProps {
  onSaved?: () => void;
}

export function DataPrivacySettings({ onSaved }: DataPrivacySettingsProps) {
  const { t } = useTranslation();
  const api = useApi();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      shareUsageData: true,
      allowProfiling: true,
      allowThirdPartySharing: false,
      allowLocationTracking: true,
      allowCookies: true,
      allowMarketingEmails: false,
      allowPersonalization: true,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: PrivacyFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call
      // await api.user.updatePrivacySettings(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('security.privacySettingsSaved'),
        description: t('security.privacySettingsSavedDescription'),
      });
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: t('security.privacySettingsError'),
        description: t('security.privacySettingsErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle data export
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // In a real application, this would be an API call
      // const data = await api.user.exportPersonalData();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock data file for download
      const mockData = {
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
        preferences: form.getValues(),
        activities: [
          { type: 'login', timestamp: new Date().toISOString() },
          { type: 'profile_update', timestamp: new Date(Date.now() - 86400000).toISOString() },
        ],
      };
      
      const dataStr = JSON.stringify(mockData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'personal_data_export.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: t('security.dataExportSuccess'),
        description: t('security.dataExportSuccessDescription'),
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('security.dataExportError'),
        description: t('security.dataExportErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      // In a real application, this would be an API call
      // await api.user.deleteAccount();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t('security.accountDeletedSuccess'),
        description: t('security.accountDeletedSuccessDescription'),
      });
      
      // Redirect to logout or home page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('security.accountDeletedError'),
        description: t('security.accountDeletedErrorDescription'),
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('security.privacySettings')}</CardTitle>
          <CardDescription>
            {t('security.privacySettingsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="shareUsageData"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.shareUsageData')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.shareUsageDataDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowProfiling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowProfiling')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowProfilingDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowThirdPartySharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowThirdPartySharing')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowThirdPartySharingDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowLocationTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowLocationTracking')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowLocationTrackingDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowCookies"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowCookies')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowCookiesDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowMarketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowMarketingEmails')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowMarketingEmailsDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowPersonalization"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('security.allowPersonalization')}
                        </FormLabel>
                        <FormDescription>
                          {t('security.allowPersonalizationDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.save')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('security.dataManagement')}</CardTitle>
          <CardDescription>
            {t('security.dataManagementDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">
                {t('security.exportData')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('security.exportDataDescription')}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {t('security.exportData')}
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between rounded-lg border p-4 border-destructive/20">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium text-destructive">
                {t('security.deleteAccount')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('security.deleteAccountDescription')}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('security.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('security.deleteAccountConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('security.deleteAccountConfirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('security.confirmDelete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
