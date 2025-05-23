/**
 * Security Settings Page
 *
 * This page redirects to the new Security Center page.
 * It's kept for backward compatibility.
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { SecurityAuditLog } from '@/components/security/SecurityAuditLog';
import { DataPrivacySettings } from '@/components/security/DataPrivacySettings';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Shield, Lock, Key, Eye, Bell, FileText } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function SecuritySettings() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Redirect to the new security page after a short delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      setLocation('/security');
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [setLocation]);

  return (
    <div className="container py-6">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-amber-500 mr-2" />
          <p className="text-amber-700">
            This page has been moved to the new Security Center. You will be redirected automatically.
          </p>
        </div>
      </div>

      <PageHeader
        title={t('security.settingsTitle')}
        description={t('security.settingsDescription')}
        icon={<Shield className="h-6 w-6" />}
      />

      <Tabs defaultValue="account-security" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account-security">
            <Lock className="mr-2 h-4 w-4" />
            {t('security.accountSecurity')}
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="mr-2 h-4 w-4" />
            {t('security.privacy')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            {t('security.securityNotifications')}
          </TabsTrigger>
          <TabsTrigger value="audit-log">
            <FileText className="mr-2 h-4 w-4" />
            {t('security.auditLog')}
          </TabsTrigger>
        </TabsList>

        {/* Account Security Tab */}
        <TabsContent value="account-security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.passwordSettings')}</CardTitle>
              <CardDescription>
                {t('security.passwordSettingsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('security.currentPassword')}</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('security.newPassword')}</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('security.confirmPassword')}</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t('security.changePassword')}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('security.twoFactorAuth')}</CardTitle>
              <CardDescription>
                {t('security.twoFactorAuthDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.enableTwoFactor')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.enableTwoFactorDescription')}
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.recoveryOptions')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.recoveryOptionsDescription')}
                  </p>
                </div>
                <Button variant="outline">{t('security.manageRecovery')}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('security.sessionManagement')}</CardTitle>
              <CardDescription>
                {t('security.sessionManagementDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Windows 10 - Chrome</h4>
                    <p className="text-sm text-muted-foreground">Current session • Last active: Just now</p>
                  </div>
                  <Button variant="ghost" disabled>{t('security.currentDevice')}</Button>
                </div>
                <Separator />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">macOS - Safari</h4>
                    <p className="text-sm text-muted-foreground">Last active: 2 days ago</p>
                  </div>
                  <Button variant="outline">{t('security.logoutDevice')}</Button>
                </div>
                <Separator />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">iPhone - Mobile App</h4>
                    <p className="text-sm text-muted-foreground">Last active: 5 hours ago</p>
                  </div>
                  <Button variant="outline">{t('security.logoutDevice')}</Button>
                </div>
              </div>

              <Button variant="destructive">{t('security.logoutAllDevices')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-6">
          <DataPrivacySettings />
        </TabsContent>

        {/* Security Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.notificationPreferences')}</CardTitle>
              <CardDescription>
                {t('security.notificationPreferencesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.loginNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.loginNotificationsDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.passwordChangeNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.passwordChangeNotificationsDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.securityAlerts')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.securityAlertsDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('security.dataBreachAlerts')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.dataBreachAlertsDescription')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t('common.save')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log" className="mt-6">
          <SecurityAuditLog showFilters={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
