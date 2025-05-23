import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, MapPin, Users, 
  FileText, AlertCircle, CheckCircle, 
  RefreshCw, ArrowRight, Clipboard,
  AlertTriangle, Activity, Heart
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { SyncStatus } from '@/components/sync/sync-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CareCoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('today');

  // Mock data
  const dashboardData = {
    totalVisitsToday: 86,
    completedVisitsToday: 62,
    inProgressVisitsToday: 8,
    pendingVisitsToday: 16,
    lateVisitsToday: 3,
    missedVisitsToday: 0,
    totalStaff: 24,
    staffOnShift: 18,
    staffOnBreak: 2,
    staffLate: 1,
    unassignedVisits: 4,
    visitCoverage: 95.3,
    totalServiceUsers: 48,
    activeServiceUsers: 45
  };

  // Mock visits data
  const visitsData = [
    { 
      id: 1, 
      serviceUser: 'Elizabeth Taylor', 
      staff: 'Sarah Johnson',
      time: '09:00 - 09:45', 
      status: 'completed', 
      location: '45 Oak Street',
      tasks: ['Medication', 'Personal Care', 'Breakfast']
    },
    { 
      id: 2, 
      serviceUser: 'James Brown', 
      staff: 'Michael Brown',
      time: '09:30 - 10:15', 
      status: 'completed', 
      location: '12 Maple Avenue',
      tasks: ['Medication', 'Personal Care']
    },
    { 
      id: 3, 
      serviceUser: 'Patricia Davis', 
      staff: 'Emily Davis',
      time: '10:00 - 10:45', 
      status: 'in-progress', 
      location: '8 Pine Road',
      tasks: ['Medication', 'Housekeeping', 'Shopping']
    },
    { 
      id: 4, 
      serviceUser: 'Robert Wilson', 
      staff: 'David Thompson',
      time: '10:30 - 11:15', 
      status: 'pending', 
      location: '22 Cedar Lane',
      tasks: ['Medication', 'Personal Care', 'Lunch']
    },
    { 
      id: 5, 
      serviceUser: 'Mary Johnson', 
      staff: null,
      time: '11:00 - 11:45', 
      status: 'unassigned', 
      location: '15 Birch Street',
      tasks: ['Medication', 'Mobility Support']
    }
  ];

  // Mock staff data
  const staffData = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      role: 'Senior Care Worker',
      status: 'active', 
      location: '45 Oak Street',
      nextVisit: '12:30 PM',
      completedVisits: 3,
      remainingVisits: 5,
      avatar: '/avatars/sarah.jpg'
    },
    { 
      id: 2, 
      name: 'Michael Brown', 
      role: 'Care Worker',
      status: 'active', 
      location: '12 Maple Avenue',
      nextVisit: '11:30 AM',
      completedVisits: 2,
      remainingVisits: 6,
      avatar: '/avatars/michael.jpg'
    },
    { 
      id: 3, 
      name: 'Emily Davis', 
      role: 'Care Worker',
      status: 'active', 
      location: '8 Pine Road',
      nextVisit: '11:15 AM',
      completedVisits: 1,
      remainingVisits: 7,
      avatar: '/avatars/emily.jpg'
    },
    { 
      id: 4, 
      name: 'David Thompson', 
      role: 'Care Worker',
      status: 'break', 
      location: 'On break',
      nextVisit: '11:30 AM',
      completedVisits: 2,
      remainingVisits: 5,
      avatar: '/avatars/david.jpg'
    },
    { 
      id: 5, 
      name: 'Robert Wilson', 
      role: 'Care Worker',
      status: 'late', 
      location: 'En route to 22 Cedar Lane',
      nextVisit: '10:30 AM (Late)',
      completedVisits: 1,
      remainingVisits: 6,
      avatar: '/avatars/robert.jpg'
    }
  ];

  // Get status badge
  const getVisitStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'late':
        return <Badge className="bg-amber-100 text-amber-800">Late</Badge>;
      case 'missed':
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      case 'unassigned':
        return <Badge className="bg-purple-100 text-purple-800">Unassigned</Badge>;
      default:
        return null;
    }
  };

  // Get staff status badge
  const getStaffStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'break':
        return <Badge className="bg-blue-100 text-blue-800">On Break</Badge>;
      case 'late':
        return <Badge className="bg-amber-100 text-amber-800">Late</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Coordinator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage daily care operations and staff coordination
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />
      <SyncStatus variant="compact" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats 
          title="Today's Visits"
          value={dashboardData.totalVisitsToday.toString()}
          description={`${dashboardData.completedVisitsToday} completed, ${dashboardData.pendingVisitsToday} pending`}
          icon={<Clock className="h-4 w-4" />}
        />
        <DashboardStats 
          title="Staff on Shift"
          value={dashboardData.staffOnShift.toString()}
          description={`${dashboardData.totalStaff} total staff members`}
          icon={<Users className="h-4 w-4" />}
        />
        <DashboardStats 
          title="Visit Coverage"
          value={`${dashboardData.visitCoverage}%`}
          description={`${dashboardData.unassignedVisits} unassigned visits`}
          icon={<CheckCircle className="h-4 w-4" />}
          valueColor={dashboardData.visitCoverage > 95 ? "text-green-600" : "text-amber-600"}
        />
        <DashboardStats 
          title="Late Visits"
          value={dashboardData.lateVisitsToday.toString()}
          description={`${dashboardData.missedVisitsToday} missed visits`}
          icon={<AlertCircle className="h-4 w-4" />}
          valueColor={dashboardData.lateVisitsToday > 0 ? "text-amber-600" : "text-green-600"}
        />
      </div>

      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Today's Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Staff Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Issues & Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule Tab */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Today's Care Schedule</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Live View
                  </Button>
                  <Button size="sm">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Allocate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Service User</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitsData.map(visit => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.time}</TableCell>
                      <TableCell>{visit.serviceUser}</TableCell>
                      <TableCell>
                        {visit.staff ? (
                          visit.staff
                        ) : (
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{visit.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {visit.tasks.map((task, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {task}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getVisitStatusBadge(visit.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Completed: {dashboardData.completedVisitsToday}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-muted-foreground">In Progress: {dashboardData.inProgressVisitsToday}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-muted-foreground">Late: {dashboardData.lateVisitsToday}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-muted-foreground">Unassigned: {dashboardData.unassignedVisits}</span>
                </div>
              </div>
              <Button>View Full Schedule</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Staff Tracking Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Tracking</CardTitle>
              <CardDescription>Real-time staff locations and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Next Visit</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
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
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-xs text-muted-foreground">{staff.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStaffStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{staff.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff.nextVisit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-sm">{staff.completedVisits}/{staff.completedVisits + staff.remainingVisits}</div>
                          <Progress 
                            value={(staff.completedVisits / (staff.completedVisits + staff.remainingVisits)) * 100} 
                            className="h-2 w-16" 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues & Alerts Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Issues & Alerts</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.lateVisitsToday > 0 && (
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Late Visits</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          There are {dashboardData.lateVisitsToday} visits running late today.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Late Visits
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {dashboardData.unassignedVisits > 0 && (
                  <div className="p-4 border border-purple-200 bg-purple-50 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-purple-800">Unassigned Visits</h3>
                        <p className="text-sm text-purple-700 mt-1">
                          There are {dashboardData.unassignedVisits} visits that need to be assigned to staff.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Assign Visits
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {dashboardData.staffLate > 0 && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-800">Staff Running Late</h3>
                        <p className="text-sm text-red-700 mt-1">
                          {dashboardData.staffLate} staff members are running late for their scheduled visits.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Staff
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareCoordinatorDashboard;
