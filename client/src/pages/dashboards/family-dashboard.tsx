import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, Clock, MessageSquare, FileText, 
  User, ChevronRight, Heart, Activity,
  PlusCircle, Phone, Video, MoreHorizontal,
  CheckCircle, UserCheck, BookOpen, List,
  Clipboard, Bell, AlertTriangle, ThumbsUp,
  Camera, Coffee, ThumbsDown, Minus, HelpCircle,
  Info, RefreshCw, MapPin, Pill
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { SyncStatus } from '@/components/sync/sync-status';
import DocumentSharing from '@/components/family-portal/document-sharing';
import VideoCall from '@/components/family-portal/video-call';

const FamilyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const serviceUser = {
    id: 1,
    name: 'Elizabeth Taylor',
    age: 78,
    avatar: '/avatars/elizabeth.jpg',
    address: '45 Oak Street, Anytown',
    primaryConditions: ['Dementia', 'Arthritis', 'Hypertension'],
    primaryCaregiver: 'Sarah Johnson',
    caregiverAvatar: '/avatars/sarah.jpg',
    careManager: 'Michael Brown',
    careManagerAvatar: '/avatars/michael.jpg',
    emergencyContact: 'James Taylor (Son)',
    emergencyPhone: '(555) 123-4567'
  };

  // Mock visits data
  const visitsData = {
    today: [
      {
        id: 1,
        time: '09:00 - 09:45',
        caregiver: 'Sarah Johnson',
        caregiverAvatar: '/avatars/sarah.jpg',
        status: 'completed',
        tasks: ['Medication', 'Personal Care', 'Breakfast'],
        notes: 'Elizabeth was in good spirits this morning. Took all medication as prescribed.'
      },
      {
        id: 2,
        time: '12:30 - 13:15',
        caregiver: 'David Thompson',
        caregiverAvatar: '/avatars/david.jpg',
        status: 'upcoming',
        tasks: ['Medication', 'Lunch', 'Mobility Exercise'],
        notes: null
      },
      {
        id: 3,
        time: '17:00 - 17:45',
        caregiver: 'Sarah Johnson',
        caregiverAvatar: '/avatars/sarah.jpg',
        status: 'upcoming',
        tasks: ['Medication', 'Dinner', 'Evening Routine'],
        notes: null
      }
    ],
    upcoming: [
      {
        id: 4,
        date: 'Tomorrow',
        visits: 3,
        caregivers: ['Sarah Johnson', 'David Thompson']
      },
      {
        id: 5,
        date: 'Wednesday',
        visits: 3,
        caregivers: ['Sarah Johnson', 'Emily Davis']
      },
      {
        id: 6,
        date: 'Thursday',
        visits: 3,
        caregivers: ['Sarah Johnson', 'David Thompson']
      }
    ]
  };

  // Mock medication data
  const medicationData = [
    {
      id: 1,
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      time: 'Morning',
      purpose: 'Blood pressure',
      lastTaken: '09:15 AM (Today)',
      nextDue: 'Tomorrow, 09:00 AM'
    },
    {
      id: 2,
      name: 'Donepezil',
      dosage: '10mg',
      frequency: 'Once daily',
      time: 'Evening',
      purpose: 'Dementia',
      lastTaken: 'Yesterday, 17:30 PM',
      nextDue: 'Today, 17:00 PM'
    },
    {
      id: 3,
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'As needed',
      time: 'When required',
      purpose: 'Pain relief',
      lastTaken: 'Yesterday, 14:00 PM',
      nextDue: 'As needed'
    }
  ];

  // Mock wellbeing data
  const wellbeingData = {
    mood: [
      { date: '2023-06-01', value: 4 },
      { date: '2023-06-02', value: 3 },
      { date: '2023-06-03', value: 4 },
      { date: '2023-06-04', value: 5 },
      { date: '2023-06-05', value: 4 },
      { date: '2023-06-06', value: 3 },
      { date: '2023-06-07', value: 4 }
    ],
    sleep: [
      { date: '2023-06-01', value: 7.5 },
      { date: '2023-06-02', value: 6.5 },
      { date: '2023-06-03', value: 7 },
      { date: '2023-06-04', value: 8 },
      { date: '2023-06-05', value: 7 },
      { date: '2023-06-06', value: 6 },
      { date: '2023-06-07', value: 7.5 }
    ],
    nutrition: [
      { date: '2023-06-01', value: 'Good' },
      { date: '2023-06-02', value: 'Fair' },
      { date: '2023-06-03', value: 'Good' },
      { date: '2023-06-04', value: 'Excellent' },
      { date: '2023-06-05', value: 'Good' },
      { date: '2023-06-06', value: 'Fair' },
      { date: '2023-06-07', value: 'Good' }
    ],
    activity: [
      { date: '2023-06-01', value: 'Light walk' },
      { date: '2023-06-02', value: 'Chair exercises' },
      { date: '2023-06-03', value: 'Light walk' },
      { date: '2023-06-04', value: 'Garden visit' },
      { date: '2023-06-05', value: 'Chair exercises' },
      { date: '2023-06-06', value: 'Rest day' },
      { date: '2023-06-07', value: 'Light walk' }
    ]
  };

  // Get mood emoji
  const getMoodEmoji = (value) => {
    switch (value) {
      case 1: return '😢';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '😐';
    }
  };

  // Get visit status badge
  const getVisitStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>;
      case 'missed':
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={serviceUser.avatar} alt={serviceUser.name} />
            <AvatarFallback>{serviceUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{serviceUser.name}</h1>
            <p className="text-muted-foreground">
              Family Portal
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Message</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>Emergency Contact</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />
      <SyncStatus variant="compact" />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="care" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Care Visits</span>
          </TabsTrigger>
          <TabsTrigger value="medication" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span>Medication</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Video Calls</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={serviceUser.avatar} alt={serviceUser.name} />
                    <AvatarFallback>{serviceUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{serviceUser.name}</h3>
                    <p className="text-sm text-muted-foreground">Age: {serviceUser.age}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{serviceUser.address}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Primary Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {serviceUser.primaryConditions.map((condition, index) => (
                          <Badge key={index} variant="secondary">{condition}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Care Team</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={serviceUser.caregiverAvatar} alt={serviceUser.primaryCaregiver} />
                        <AvatarFallback>{serviceUser.primaryCaregiver.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{serviceUser.primaryCaregiver}</div>
                        <div className="text-xs text-muted-foreground">Primary Caregiver</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={serviceUser.careManagerAvatar} alt={serviceUser.careManager} />
                        <AvatarFallback>{serviceUser.careManager.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{serviceUser.careManager}</div>
                        <div className="text-xs text-muted-foreground">Care Manager</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Care Visits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visitsData.today.map(visit => (
                  <div key={visit.id} className="flex items-start gap-3 p-3 border rounded-md">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{visit.time}</div>
                        {getVisitStatusBadge(visit.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={visit.caregiverAvatar} alt={visit.caregiver} />
                          <AvatarFallback>{visit.caregiver.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{visit.caregiver}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {visit.tasks.map((task, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {task}
                          </Badge>
                        ))}
                      </div>
                      {visit.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {visit.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Wellbeing Summary</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Mood</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {getMoodEmoji(wellbeingData.mood[wellbeingData.mood.length - 1].value)}
                    </div>
                    <div className="text-sm">
                      {wellbeingData.mood[wellbeingData.mood.length - 1].value}/5
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {wellbeingData.mood.map((day, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col items-center"
                        title={`${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}: ${day.value}/5`}
                      >
                        <div className="text-xs">{getMoodEmoji(day.value)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Sleep</h3>
                  <div className="text-2xl font-bold">
                    {wellbeingData.sleep[wellbeingData.sleep.length - 1].value} hrs
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    {wellbeingData.sleep.map((day, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col items-center"
                        title={`${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}: ${day.value} hours`}
                      >
                        <div 
                          className="w-4 bg-primary/60 rounded-sm" 
                          style={{ height: `${(day.value / 10) * 100}%` }}
                        ></div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Nutrition</h3>
                  <div className="text-2xl font-bold">
                    {wellbeingData.nutrition[wellbeingData.nutrition.length - 1].value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Consistent appetite and hydration
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
                  <div className="text-2xl font-bold">
                    {wellbeingData.activity[wellbeingData.activity.length - 1].value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Regular light exercise
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Visits Tab */}
        <TabsContent value="care">
          <Card>
            <CardHeader>
              <CardTitle>Care Schedule</CardTitle>
              <CardDescription>View upcoming and past care visits</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Care visits content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medication Tab */}
        <TabsContent value="medication">
          <Card>
            <CardHeader>
              <CardTitle>Medication Schedule</CardTitle>
              <CardDescription>Track medication administration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicationData.map(med => (
                  <div key={med.id} className="p-4 border rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{med.name} {med.dosage}</h3>
                        <p className="text-sm text-muted-foreground">{med.frequency} ({med.time})</p>
                      </div>
                      <Badge variant="outline">{med.purpose}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Last Taken</p>
                        <p className="text-sm">{med.lastTaken}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Next Due</p>
                        <p className="text-sm">{med.nextDue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <DocumentSharing />
        </TabsContent>

        {/* Video Calls Tab */}
        <TabsContent value="video">
          <VideoCall serviceUserName={serviceUser.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyDashboard;
