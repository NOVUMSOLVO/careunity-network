import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { AppointmentList } from '@/components/dashboard/appointment-list';
import { RecentServiceUsers } from '@/components/dashboard/recent-service-users';
import { TaskList } from '@/components/dashboard/task-list';
import { VoiceRecorder } from '@/components/ui/voice-recorder';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user
  });

  // Fetch service users for voice recorder
  const { data: serviceUsers, isLoading: isLoadingServiceUsers } = useQuery({
    queryKey: ['/api/service-users'],
    enabled: !!user
  });

  const handleSaveNote = async (note: { content: string; serviceUserId: number }) => {
    try {
      await apiRequest('POST', '/api/notes', {
        serviceUserId: note.serviceUserId,
        content: note.content,
        category: 'general',
        isVoiceRecorded: true
      });
      
      toast({
        title: 'Note saved',
        description: 'Your voice note has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error saving note',
        description: 'There was a problem saving your note. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // For demo purposes, transform service users data for voice recorder
  const serviceUserOptions = serviceUsers?.map(user => ({
    id: user.id,
    name: user.fullName
  })) || [];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title={`Welcome back, ${user?.fullName || 'User'}`}
          description="Here's what's happening in your care schedule today"
        />

        <div className="py-4">
          {/* Dashboard Stats */}
          <DashboardStats
            careHours={data?.careHours || '0'}
            serviceUsersCount={data?.serviceUsersCount || 0}
            carePlanCompliance={data?.carePlanCompliance || '0%'}
            isLoading={isLoading}
          />

          {/* Today's Schedule */}
          <div className="mb-6 mt-6">
            <AppointmentList
              appointments={data?.todayAppointments || []}
              isLoading={isLoading}
            />
          </div>

          {/* Recent Service Users & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentServiceUsers
              serviceUsers={data?.recentServiceUsers || []}
              isLoading={isLoading}
            />
            
            <TaskList
              tasks={data?.pendingTasks || []}
              isLoading={isLoading}
            />
          </div>

          {/* Voice Notes */}
          <div className="mt-6">
            <VoiceRecorder
              serviceUsers={serviceUserOptions}
              onSave={handleSaveNote}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
