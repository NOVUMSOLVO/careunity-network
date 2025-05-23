import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Calendar, Clock, FileText, 
  BarChart2, RefreshCw, AlertCircle, 
  CheckCircle, MapPin, Phone, Mail,
  UserCheck, UserX, Activity, Heart
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { SyncStatus } from '@/components/sync/sync-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ServiceManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const dashboardData = {
    serviceUsers: 48,
    activeServiceUsers: 45,
    staffMembers: 24,
    activeStaffMembers: 22,
    visitsToday: 86,
    completedVisitsToday: 72,
    pendingVisitsToday: 14,
    missedVisitsToday: 0,
    careHoursToday: 124.5,
    careHoursThisWeek: 842.5,
    careQualityScore: 94,
    staffUtilization: 87,
    recentIncidents: 2,
    staffOnHoliday: 2,
    staffSick: 1,
    upcomingReviews: 5
  };

  // Mock staff data
  const staffData = [
    { id: 1, name: 'Sarah Johnson', role: 'Senior Care Worker', status: 'active', visits: 8, hours: 7.5, avatar: '/avatars/sarah.jpg' },
    { id: 2, name: 'Michael Brown', role: 'Care Worker', status: 'active', visits: 7, hours: 6.5, avatar: '/avatars/michael.jpg' },
    { id: 3, name: 'David Thompson', role: 'Care Worker', status: 'holiday', visits: 0, hours: 0, avatar: '/avatars/david.jpg' },
    { id: 4, name: 'Emily Davis', role: 'Care Worker', status: 'active', visits: 6, hours: 5.5, avatar: '/avatars/emily.jpg' },
    { id: 5, name: 'Robert Wilson', role: 'Care Worker', status: 'sick', visits: 0, hours: 0, avatar: '/avatars/robert.jpg' }
  ];

  // Mock service user data
  const serviceUserData = [
    { id: 1, name: 'Elizabeth Taylor', status: 'active', careHours: 14, lastVisit: '2 hours ago', nextVisit: 'Today, 4:30 PM', avatar: '/avatars/elizabeth.jpg' },
    { id: 2, name: 'James Brown', status: 'active', careHours: 21, lastVisit: '1 hour ago', nextVisit: 'Tomorrow, 9:00 AM', avatar: '/avatars/james.jpg' },
    { id: 3, name: 'Patricia Davis', status: 'active', careHours: 7, lastVisit: '3 hours ago', nextVisit: 'Today, 6:00 PM', avatar: '/avatars/patricia.jpg' },
    { id: 4, name: 'John Wilson', status: 'active', careHours: 10.5, lastVisit: '30 minutes ago', nextVisit: 'Tomorrow, 10:30 AM', avatar: '/avatars/john.jpg' },
    { id: 5, name: 'Mary Johnson', status: 'hospital', careHours: 0, lastVisit: '2 days ago', nextVisit: 'On hold', avatar: '/avatars/mary.jpg' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Manage service users, staff, and operations
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />
      <SyncStatus variant="compact" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats 
          title="Service Users"
          value={dashboardData.serviceUsers.toString()}
          description={`${dashboardData.activeServiceUsers} active`}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "+3", label: "from last month" }}
        />
        <DashboardStats 
          title="Staff Members"
          value={dashboardData.staffMembers.toString()}
          description={`${dashboardData.activeStaffMembers} active`}
          icon={<UserCheck className="h-4 w-4" />}
          trend={{ value: "+1", label: "from last month" }}
        />
        <DashboardStats 
          title="Today's Visits"
          value={dashboardData.visitsToday.toString()}
          description={`${dashboardData.completedVisitsToday} completed, ${dashboardData.pendingVisitsToday} pending`}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: "+4", label: "from yesterday" }}
        />
        <DashboardStats 
          title="Care Quality"
          value={`${dashboardData.careQualityScore}%`}
          description="Based on feedback"
          icon={<Heart className="h-4 w-4" />}
          trend={{ value: "+2%", label: "from last month" }}
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Staff</span>
          </TabsTrigger>
          <TabsTrigger value="service-users" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Service Users</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
                <CardDescription>Summary of today's operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Visit Completion</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((dashboardData.completedVisitsToday / dashboardData.visitsToday) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(dashboardData.completedVisitsToday / dashboardData.visitsToday) * 100} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Staff Utilization</span>
                    <span className="text-sm text-muted-foreground">{dashboardData.staffUtilization}%</span>
                  </div>
                  <Progress value={dashboardData.staffUtilization} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Care Hours Today</span>
                    <p className="text-2xl font-bold">{dashboardData.careHoursToday}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Care Hours This Week</span>
                    <p className="text-2xl font-bold">{dashboardData.careHoursThisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alerts & Notifications</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentIncidents > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-800">{dashboardData.recentIncidents} Recent Incidents</p>
                        <p className="text-sm text-red-600">Require immediate review</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                )}
                
                {dashboardData.staffSick > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <UserX className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-amber-800">{dashboardData.staffSick} Staff on Sick Leave</p>
                        <p className="text-sm text-amber-600">May require rescheduling</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                )}
                
                {dashboardData.upcomingReviews > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-blue-800">{dashboardData.upcomingReviews} Care Plan Reviews</p>
                        <p className="text-sm text-blue-600">Due this week</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Schedule</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Overview</CardTitle>
              <CardDescription>Manage your care team</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Today's Visits</TableHead>
                    <TableHead className="text-right">Today's Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffData.map(staff => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={staff.avatar} alt={staff.name} />
                            <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>
                        <Badge variant={
                          staff.status === 'active' ? 'default' : 
                          staff.status === 'holiday' ? 'secondary' : 
                          'destructive'
                        }>
                          {staff.status === 'active' ? 'Active' : 
                           staff.status === 'holiday' ? 'On Holiday' : 
                           'Sick Leave'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{staff.visits}</TableCell>
                      <TableCell className="text-right">{staff.hours}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <UserCheck className="h-4 w-4 mr-2" />
                Manage Staff
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Service Users Tab */}
        <TabsContent value="service-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Users</CardTitle>
              <CardDescription>Manage your service users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Weekly Hours</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Next Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUserData.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'Active' : 'In Hospital'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{user.careHours}</TableCell>
                      <TableCell>{user.lastVisit}</TableCell>
                      <TableCell>{user.nextVisit}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <Heart className="h-4 w-4 mr-2" />
                Manage Service Users
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>View and manage care schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Schedule content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceManagerDashboard;
