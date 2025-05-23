/**
 * Security Page
 *
 * This page provides access to security settings, guides, and information.
 * It includes components for managing security settings, viewing security
 * notifications, and learning about security best practices.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Settings,
  FileText,
  Bell,
  AlertTriangle,
  Lock,
  HelpCircle,
  BookOpen,
  GraduationCap
} from 'lucide-react';

import { SecuritySettings } from '@/components/security/SecuritySettings';
import { SecurityGuide } from '@/components/security/SecurityGuide';
import { SecurityNotificationCenter } from '@/components/security/SecurityNotification';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecurityTraining } from '@/components/security/SecurityTraining';
import { PageHeader } from '@/components/ui/page-header';

export function SecurityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Security Center"
        description="Manage your security settings and learn about security best practices"
        icon={<Shield className="h-6 w-6" />}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Security Guide</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Security Training</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Security Dashboard</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab('guide')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Security Help
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/security'}>
                <Lock className="mr-2 h-4 w-4" />
                Advanced Security
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="settings">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="guide">
          <SecurityGuide showSecurityScore={true} />
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Security Notifications</h2>
              <p className="text-muted-foreground">
                View and manage security-related notifications for your account
              </p>
            </div>

            <SecurityNotificationCenter />
          </div>
        </TabsContent>

        <TabsContent value="training">
          <SecurityTraining />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="dashboard">
            <SecurityDashboard refreshInterval={60000} />
          </TabsContent>
        )}
      </Tabs>

      <Separator className="my-6" />

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Security Commitment</h3>
            <p className="text-sm text-muted-foreground mt-1">
              CareUnity is committed to protecting your data and privacy. We employ industry-standard security measures to safeguard your information and continuously monitor for potential threats. If you have any security concerns or notice suspicious activity, please contact our security team immediately.
            </p>
            <div className="mt-3">
              <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('guide')}>
                Learn more about our security practices
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
