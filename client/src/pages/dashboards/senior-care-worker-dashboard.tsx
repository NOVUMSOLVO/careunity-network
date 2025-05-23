import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, Clock, 
  CheckCircle, FileText, AlertTriangle, 
  MapPin, Phone, MessageSquare, 
  User, Home, Activity, HelpCircle
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { SyncStatus } from '@/components/sync/sync-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamSchedule } from '@/components/care-worker/team-schedule';
import { ServiceUserList } from '@/components/care-worker/service-user-list';
import { CareTaskList } from '@/components/care-worker/care-task-list';
import { TeamPerformance } from '@/components/care-worker/team-performance';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { VoiceInputButton } from '@/components/voice/voice-input-button';

/**
 * Senior Care Worker Dashboard
 * 
 * This dashboard provides senior care workers with tools for managing their team,
 * monitoring care delivery, and ensuring quality standards are met.
 */
const SeniorCareWorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('today');
  const { toast } = useToast();

  // Mock data for the dashboard
  const dashboardData = {
    seniorCareWorker: {
      name: 'Emily Johnson',
      role: 'Senior Care Worker',
      avatar: '/avatars/emily.jpg',
      team: 'Team A'
    },
    todayStats: {
      teamSize: 8,
      activeTeamMembers: 7,
      teamVisitsCompleted: 18,
      teamVisitsRemaining: 24,
      totalHours: 42.5,
      travelDistance: 68.2,
      serviceUsers: 15,
      qualityScore: 92
    },
    teamMembers: [
      { id: 1, name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg', status: 'active', visitsCompleted: 3, visitsRemaining: 2 },
      { id: 2, name: 'David Brown', avatar: '/avatars/david.jpg', status: 'active', visitsCompleted: 2, visitsRemaining: 4 },
      { id: 3, name: 'Lisa Chen', avatar: '/avatars/lisa.jpg', status: 'active', visitsCompleted: 4, visitsRemaining: 1 },
      { id: 4, name: 'Michael Smith', avatar: '/avatars/michael.jpg', status: 'active', visitsCompleted: 2, visitsRemaining: 3 },
      { id: 5, name: 'Emma Davis', avatar: '/avatars/emma.jpg', status: 'active', visitsCompleted: 3, visitsRemaining: 2 },
      { id: 6, name: 'James Wilson', avatar: '/avatars/james.jpg', status: 'active', visitsCompleted: 2, visitsRemaining: 4 },
      { id: 7, name: 'Olivia Taylor', avatar: '/avatars/olivia.jpg', status: 'active', visitsCompleted: 2, visitsRemaining: 3 },
      { id: 8, name: 'Robert Johnson', avatar: '/avatars/robert.jpg', status: 'off', visitsCompleted: 0, visitsRemaining: 5 }
    ],
    visits: [
      { id: 1, serviceUser: 'John Smith', time: '09:00 - 10:00', status: 'completed', caregiver: 'Sarah Wilson', address: '123 Main St' },
      { id: 2, serviceUser: 'Mary Johnson', time: '09:30 - 10:30', status: 'completed', caregiver: 'David Brown', address: '456 Oak Ave' },
      { id: 3, serviceUser: 'Robert Davis', time: '10:00 - 11:00', status: 'completed', caregiver: 'Lisa Chen', address: '789 Pine Rd' },
      { id: 4, serviceUser: 'Elizabeth Wilson', time: '10:30 - 11:30', status: 'completed', caregiver: 'Michael Smith', address: '321 Elm St' },
      { id: 5, serviceUser: 'James Brown', time: '11:00 - 12:00', status: 'completed', caregiver: 'Emma Davis', address: '654 Maple Dr' },
      { id: 6, serviceUser: 'Patricia Miller', time: '11:30 - 12:30', status: 'in-progress', caregiver: 'James Wilson', address: '987 Cedar Ln' },
      { id: 7, serviceUser: 'Jennifer Taylor', time: '12:00 - 13:00', status: 'in-progress', caregiver: 'Olivia Taylor', address: '135 Birch Ave' },
      { id: 8, serviceUser: 'Michael Johnson', time: '13:00 - 14:00', status: 'upcoming', caregiver: 'Sarah Wilson', address: '246 Walnut St' },
      { id: 9, serviceUser: 'Linda Davis', time: '13:30 - 14:30', status: 'upcoming', caregiver: 'David Brown', address: '357 Cherry Rd' },
      { id: 10, serviceUser: 'William Wilson', time: '14:00 - 15:00', status: 'upcoming', caregiver: 'Lisa Chen', address: '468 Spruce Dr' }
    ],
    alerts: [
      { id: 1, type: 'late', message: 'Michael Smith is running 15 minutes late for next visit', severity: 'medium' },
      { id: 2, type: 'staff', message: 'Robert Johnson called in sick today', severity: 'high' },
      { id: 3, type: 'care', message: 'Medication reminder for John Smith at 12:00', severity: 'medium' }
    ],
    serviceUsers: [
      { id: 1, name: 'John Smith', address: '123 Main St', careNeeds: 'Personal Care, Medication', nextVisit: 'Today, 13:00' },
      { id: 2, name: 'Mary Johnson', address: '456 Oak Ave', careNeeds: 'Mobility Support, Meal Preparation', nextVisit: 'Tomorrow, 09:30' },
      { id: 3, name: 'Robert Davis', address: '789 Pine Rd', careNeeds: 'Personal Care, Companionship', nextVisit: 'Tomorrow, 11:00' },
      { id: 4, name: 'Elizabeth Wilson', address: '321 Elm St', careNeeds: 'Medication, Housekeeping', nextVisit: 'Today, 16:30' },
      { id: 5, name: 'James Brown', address: '654 Maple Dr', careNeeds: 'Personal Care, Mobility Support', nextVisit: 'Tomorrow, 10:00' }
    ]
  };

  // Fetch senior care worker data
  const { data: seniorCareData, isLoading, error } = useQuery({
    queryKey: ['senior-care-dashboard'],
    queryFn: async () => {
      try {
        const { data, error } = await apiClient.get('/api/v2/dashboard/senior-care');
        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        // If API fails, use mock data
        console.warn('Using mock data for senior care worker dashboard');
        return dashboardData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use mock data if loading or error
  const data = seniorCareData || dashboardData;

  // Handle voice command
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('team') || lowerCommand.includes('staff')) {
      setActiveTab('team');
    } else if (lowerCommand.includes('service') || lowerCommand.includes('users')) {
      setActiveTab('service-users');
    } else if (lowerCommand.includes('schedule') || lowerCommand.includes('visits')) {
      setActiveTab('today');
    } else if (lowerCommand.includes('alert') || lowerCommand.includes('issues')) {
      setActiveTab('alerts');
    } else {
      toast({
        title: 'Voice Command',
        description: `Command not recognized: "${command}"`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Senior Care Worker Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team and monitor care delivery
          </p>
        </div>
        <div className="flex items-center gap-4">
          <VoiceInputButton onCommand={handleVoiceCommand} />
          <SyncStatus />
          <OfflineIndicator />
          <Avatar className="h-9 w-9">
            <AvatarImage src={data.seniorCareWorker.avatar} alt={data.seniorCareWorker.name} />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <OfflineWrapper>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats 
            title="Team Size"
            value={data.todayStats.teamSize.toString()}
            description={`${data.todayStats.activeTeamMembers} active today`}
            icon={<Users className="h-4 w-4" />}
          />
          <DashboardStats 
            title="Visits Completed"
            value={data.todayStats.teamVisitsCompleted.toString()}
            description={`${data.todayStats.teamVisitsRemaining} remaining`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <DashboardStats 
            title="Service Users"
            value={data.todayStats.serviceUsers.toString()}
            description="Under your team's care"
            icon={<Home className="h-4 w-4" />}
          />
          <DashboardStats 
            title="Quality Score"
            value={`${data.todayStats.qualityScore}%`}
            description="Team average"
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      </OfflineWrapper>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="team">My Team</TabsTrigger>
          <TabsTrigger value="service-users">Service Users</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Today's Schedule Tab */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Schedule</CardTitle>
              <CardDescription>Today's visits for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamSchedule visits={data.visits} teamMembers={data.teamMembers} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mr-2">Print Schedule</Button>
              <Button>Reassign Visits</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Status and workload of your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Badge variant={member.status === 'active' ? 'default' : 'outline'} className="text-xs">
                            {member.status === 'active' ? 'On Duty' : 'Off Duty'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{member.visitsCompleted} completed</div>
                        <div className="text-sm text-muted-foreground">{member.visitsRemaining} remaining</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mr-2">Team Performance</Button>
              <Button>Manage Team</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Service Users Tab */}
        <TabsContent value="service-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Users</CardTitle>
              <CardDescription>People under your team's care</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceUserList serviceUsers={data.serviceUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Issues requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${
                      alert.severity === 'high' ? 'text-red-500' : 
                      alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="mr-2">
                          {alert.type}
                        </Badge>
                        {alert.severity === 'high' ? 'Urgent action required' : 'Action required'}
                      </div>
                    </div>
                    <Button size="sm" className="ml-auto">Resolve</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeniorCareWorkerDashboard;
