import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useSync } from '@/contexts/sync-context';
import { DashboardMetrics } from './components/dashboard-metrics';
import { CareSchedule } from './components/care-schedule';
import { ServiceUserSummary } from './components/service-user-summary';
import { TaskSummary } from './components/task-summary';
import { AllocationSummary } from './components/allocation-summary';
import { QualityMetrics } from './components/quality-metrics';
import { RecentActivity } from './components/recent-activity';
import { CalendarView } from './components/calendar-view';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardSkeleton } from './components/dashboard-skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PlusIcon, CalendarIcon, UsersIcon, ClipboardListIcon } from 'lucide-react';

/**
 * Dashboard page component
 * 
 * This is the main dashboard for the CareUnity application.
 * It displays different views based on the user's role and provides
 * quick access to key information and actions.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { isOnline, syncStatus } = useSync();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data, error } = await apiClient.get('/api/v2/dashboard');
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading dashboard',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Determine which dashboard view to show based on user role
  const getDashboardView = () => {
    if (!user) return 'default';
    
    switch (user.role) {
      case 'admin':
        return 'admin';
      case 'manager':
        return 'manager';
      case 'coordinator':
        return 'coordinator';
      case 'caregiver':
        return 'caregiver';
      default:
        return 'default';
    }
  };
  
  const dashboardView = getDashboardView();
  
  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        user={user} 
        isOnline={isOnline} 
        syncStatus={syncStatus}
        dashboardView={dashboardView}
      />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="service-users">Service Users</TabsTrigger>
          {isDesktop && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
          {isDesktop && <TabsTrigger value="quality">Quality</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardMetrics data={dashboardData?.metrics} view={dashboardView} />
            
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button className="justify-start">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Service User
                </Button>
                <Button className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Visit
                </Button>
                <Button className="justify-start">
                  <ClipboardListIcon className="mr-2 h-4 w-4" />
                  Create Care Plan
                </Button>
                <Button className="justify-start">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Allocate Staff
                </Button>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity data={dashboardData?.recentActivity} />
              </CardContent>
            </Card>
            
            {(dashboardView === 'admin' || dashboardView === 'manager') && (
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualityMetrics data={dashboardData?.qualityMetrics} />
                </CardContent>
              </Card>
            )}
            
            {(dashboardView === 'coordinator' || dashboardView === 'caregiver') && (
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <CareSchedule data={dashboardData?.todaySchedule} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarView data={dashboardData?.schedule} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="service-users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceUserSummary data={dashboardData?.serviceUsers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskSummary data={dashboardData?.tasks} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityMetrics data={dashboardData?.qualityMetrics} fullView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
