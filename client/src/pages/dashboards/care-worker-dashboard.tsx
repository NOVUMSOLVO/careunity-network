import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, Clock, MapPin, User, FileText, 
  AlertCircle, CheckCircle, MessageSquare, Heart,
  ChevronRight, Pill, Activity, RefreshCw
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';

/**
 * Care Worker Dashboard
 * 
 * This dashboard provides care workers with their daily schedule,
 * service user information, and care tasks.
 */
const CareWorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('today');

  // Mock data for the dashboard
  const dashboardData = {
    careWorker: {
      name: 'Sarah Johnson',
      role: 'Care Worker',
      avatar: '/avatars/sarah.jpg'
    },
    todayStats: {
      visitsCompleted: 3,
      visitsRemaining: 5,
      totalHours: 8.5,
      travelDistance: 12.4
    },
    upcomingVisits: [
      {
        id: 1,
        serviceUser: 'Elizabeth Taylor',
        time: '10:30 AM - 11:15 AM',
        location: '45 Oak Street',
        status: 'upcoming',
        tasks: ['Medication', 'Personal Care', 'Meal Preparation'],
        notes: 'Prefers to have breakfast before medication'
      },
      {
        id: 2,
        serviceUser: 'Robert Johnson',
        time: '11:45 AM - 12:30 PM',
        location: '22 Maple Avenue',
        status: 'upcoming',
        tasks: ['Mobility Support', 'Medication', 'Companionship'],
        notes: 'Needs assistance with walking exercises'
      },
      {
        id: 3,
        serviceUser: 'Mary Williams',
        time: '1:15 PM - 2:00 PM',
        location: '8 Pine Road',
        status: 'upcoming',
        tasks: ['Meal Preparation', 'Housekeeping', 'Personal Care'],
        notes: 'Dietary restrictions: no dairy'
      }
    ],
    completedVisits: [
      {
        id: 4,
        serviceUser: 'James Brown',
        time: '8:00 AM - 8:45 AM',
        location: '15 Cedar Lane',
        status: 'completed',
        tasks: ['Medication', 'Personal Care'],
        notes: 'Completed all tasks as planned'
      },
      {
        id: 5,
        serviceUser: 'Patricia Davis',
        time: '9:00 AM - 9:45 AM',
        location: '33 Birch Street',
        status: 'completed',
        tasks: ['Meal Preparation', 'Medication'],
        notes: 'Left breakfast in refrigerator for lunch'
      },
      {
        id: 6,
        serviceUser: 'Thomas Wilson',
        time: '10:00 AM - 10:15 AM',
        location: '7 Elm Court',
        status: 'completed',
        tasks: ['Medication Check'],
        notes: 'Quick medication check completed'
      }
    ],
    alerts: [
      {
        id: 1,
        type: 'medication',
        message: 'Elizabeth Taylor has a new medication schedule',
        time: '1 hour ago'
      },
      {
        id: 2,
        type: 'schedule',
        message: 'Your visit with John Smith tomorrow has been rescheduled',
        time: '3 hours ago'
      }
    ]
  };

  // Function to render visit card
  const renderVisitCard = (visit) => (
    <Card key={visit.id} className={visit.status === 'completed' ? 'bg-gray-50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{visit.serviceUser}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {visit.time}
            </CardDescription>
          </div>
          <Badge variant={visit.status === 'completed' ? 'outline' : 'default'}>
            {visit.status === 'completed' ? (
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </span>
            ) : (
              <span>Upcoming</span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-start mb-2">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <span className="text-sm">{visit.location}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {visit.tasks.map((task, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {task}
            </Badge>
          ))}
        </div>
        {visit.notes && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Notes:</span> {visit.notes}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          {visit.status === 'completed' ? 'View Details' : 'Start Visit'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={dashboardData.careWorker.avatar} alt={dashboardData.careWorker.name} />
            <AvatarFallback>{dashboardData.careWorker.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {dashboardData.careWorker.name}</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
            {dashboardData.alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">{dashboardData.alerts.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      <OfflineIndicator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats 
          title="Visits Completed"
          value={dashboardData.todayStats.visitsCompleted.toString()}
          description="Today"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <DashboardStats 
          title="Visits Remaining"
          value={dashboardData.todayStats.visitsRemaining.toString()}
          description="Today"
          icon={<Clock className="h-4 w-4" />}
        />
        <DashboardStats 
          title="Total Hours"
          value={dashboardData.todayStats.totalHours.toString()}
          description="Scheduled today"
          icon={<Calendar className="h-4 w-4" />}
        />
        <DashboardStats 
          title="Travel Distance"
          value={`${dashboardData.todayStats.travelDistance} km`}
          description="Today's route"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Today's Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="service-users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>My Service Users</span>
          </TabsTrigger>
          <TabsTrigger value="care-plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Care Plans</span>
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule Tab */}
        <TabsContent value="today" className="space-y-4">
          {dashboardData.alerts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dashboardData.alerts.map(alert => (
                    <li key={alert.id} className="flex items-start gap-2 text-sm">
                      {alert.type === 'medication' ? (
                        <Pill className="h-4 w-4 text-blue-500 mt-0.5" />
                      ) : (
                        <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />
                      )}
                      <div>
                        <p>{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-3">Upcoming Visits</h3>
              <div className="space-y-3">
                {dashboardData.upcomingVisits.map(renderVisitCard)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Completed Visits</h3>
              <div className="space-y-3">
                {dashboardData.completedVisits.map(renderVisitCard)}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="service-users">
          <Card>
            <CardHeader>
              <CardTitle>My Service Users</CardTitle>
              <CardDescription>View details about the service users in your care</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Service user information would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care-plans">
          <Card>
            <CardHeader>
              <CardTitle>Care Plans</CardTitle>
              <CardDescription>Access and update care plans for your service users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Care plan content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareWorkerDashboard;
