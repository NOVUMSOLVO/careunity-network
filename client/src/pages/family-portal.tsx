import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  User,
  ChevronRight,
  Heart,
  Activity,
  PlusCircle,
  Phone,
  Video,
  MoreHorizontal,
  CheckCircle,
  UserCheck,
  BookOpen,
  List,
  Clipboard,
  Bell,
  AlertTriangle,
  ThumbsUp,
  Camera,
  Coffee,
  ThumbsDown,
  Minus,
  HelpCircle,
  Info,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import DocumentSharing from "@/components/family-portal/document-sharing";
import VideoCall from "@/components/family-portal/video-call";

const FamilyPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const serviceUser = {
    id: 1,
    name: "Elizabeth Taylor",
    room: "Room 25",
    age: 82,
    profileImage: "",
    status: "Stable",
    primaryCarer: "Jane Wilson",
    nextVisit: "Today, 14:30",
    lastVisit: "Today, 08:15",
    preferredActivities: ["Reading", "Music", "Garden walks"],
    nutritionProgress: 85,
    medicationCompliance: 100,
    mobilityProgress: 60,
    moodLog: [
      { date: "2023-05-01", mood: "happy", notes: "Enjoyed family visit" },
      { date: "2023-05-02", mood: "neutral", notes: "Regular day" },
      { date: "2023-05-03", mood: "sad", notes: "Missed lunch activity" },
      { date: "2023-05-04", mood: "happy", notes: "Art therapy session" },
      { date: "2023-05-05", mood: "happy", notes: "Garden time" },
    ]
  };

  const recentActivities = [
    { id: 1, type: "medication", time: "08:30", description: "Morning medication administered", caregiver: "Jane Wilson", status: "completed" },
    { id: 2, type: "meal", time: "09:15", description: "Breakfast - Porridge with fruit", caregiver: "Jane Wilson", status: "completed" },
    { id: 3, type: "social", time: "10:30", description: "Group reading session", caregiver: "Michael Brown", status: "completed" },
    { id: 4, type: "physiotherapy", time: "11:45", description: "Assisted walking exercise", caregiver: "Sarah Johnson", status: "completed" },
    { id: 5, type: "meal", time: "12:30", description: "Lunch - Chicken soup and bread", caregiver: "David Thompson", status: "scheduled" },
    { id: 6, type: "medication", time: "14:00", description: "Afternoon medication", caregiver: "Jane Wilson", status: "scheduled" },
    { id: 7, type: "social", time: "15:30", description: "Family video call", caregiver: "Michael Brown", status: "scheduled" },
  ];

  const upcomingVisits = [
    { id: 1, date: "Today", time: "14:30", caregiver: "Jane Wilson", duration: "45 min", purpose: "Medication & Wellbeing Check" },
    { id: 2, date: "Today", time: "18:00", caregiver: "Michael Brown", duration: "60 min", purpose: "Evening Care & Dinner Assistance" },
    { id: 3, date: "Tomorrow", time: "08:00", caregiver: "Jane Wilson", duration: "45 min", purpose: "Morning Care & Breakfast" },
    { id: 4, date: "Tomorrow", time: "14:00", caregiver: "Sarah Johnson", duration: "30 min", purpose: "Physiotherapy Session" },
  ];

  const carePlanGoals = [
    { id: 1, name: "Increase daily physical activity", category: "Mobility", progress: 65, target: "20 minutes walking daily", notes: "Showing steady improvement" },
    { id: 2, name: "Maintain medication schedule", category: "Health", progress: 100, target: "No missed medications", notes: "Perfect compliance this month" },
    { id: 3, name: "Improve fluid intake", category: "Nutrition", progress: 78, target: "1.5 liters of water daily", notes: "Using reminder system effectively" },
    { id: 4, name: "Participate in social activities", category: "Social", progress: 50, target: "Join 3 group activities weekly", notes: "Enjoys music sessions most" },
  ];

  const careNotes = [
    { id: 1, date: "Today", time: "08:30", author: "Jane Wilson", content: "Elizabeth had a good morning. Breakfast was fully consumed and medications taken without issues. Mood appears positive today." },
    { id: 2, date: "Yesterday", time: "19:45", author: "Michael Brown", content: "Evening routine completed smoothly. Elizabeth enjoyed listening to classical music before sleep. Requested an extra blanket which was provided." },
    { id: 3, date: "Yesterday", time: "14:15", author: "Sarah Johnson", content: "Physiotherapy session completed. Elizabeth managed 15 minutes of supported walking, which is an improvement from last session." },
    { id: 4, date: "2 days ago", time: "12:30", author: "David Thompson", content: "Lunch was partially consumed. Elizabeth mentioned feeling a bit tired and preferred to rest afterward instead of attending the planned social activity." },
  ];

  const notifications = [
    { id: 1, type: "info", date: "Today", time: "10:45", content: "Medication schedule updated by Dr. Roberts", read: false },
    { id: 2, type: "alert", date: "Yesterday", time: "16:30", content: "Elizabeth missed afternoon hydration target", read: true },
    { id: 3, type: "update", date: "Yesterday", time: "09:15", content: "Care plan updated with new physiotherapy goals", read: false },
    { id: 4, type: "message", date: "2 days ago", time: "19:30", content: "New message from caregiver Jane regarding evening routine", read: true },
  ];

  // Helper functions
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'medication': return <FileText className="text-blue-600" />;
      case 'meal': return <Coffee className="text-amber-600" />;
      case 'social': return <UserCheck className="text-purple-600" />;
      case 'physiotherapy': return <Activity className="text-green-600" />;
      default: return <Clock className="text-gray-600" />;
    }
  };

  const getMoodIcon = (mood: string) => {
    switch(mood) {
      case 'happy': return <div className="bg-green-100 text-green-600 p-1 rounded-full"><ThumbsUp className="h-5 w-5" /></div>;
      case 'sad': return <div className="bg-red-100 text-red-600 p-1 rounded-full"><ThumbsDown className="h-5 w-5" /></div>;
      case 'neutral': return <div className="bg-blue-100 text-blue-600 p-1 rounded-full"><Minus className="h-5 w-5" /></div>;
      default: return <div className="bg-gray-100 text-gray-600 p-1 rounded-full"><HelpCircle className="h-5 w-5" /></div>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'info': return <Info className="text-blue-600 h-5 w-5" />;
      case 'alert': return <AlertTriangle className="text-amber-600 h-5 w-5" />;
      case 'update': return <RefreshCw className="text-green-600 h-5 w-5" />;
      case 'message': return <MessageSquare className="text-purple-600 h-5 w-5" />;
      default: return <Bell className="text-gray-600 h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Portal</h1>
          <p className="text-gray-500 mt-1">
            Stay connected with your loved one's care
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
            <Badge className="ml-2 bg-primary text-white" variant="secondary">2</Badge>
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>

      <OfflineIndicator />

      {/* Service User Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start">
              <div className="mr-4">
                <Avatar className="h-20 w-20 border-4 border-primary/10">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {serviceUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-2xl">{serviceUser.name}</CardTitle>
                  <Badge className="ml-3 bg-green-100 text-green-800">{serviceUser.status}</Badge>
                </div>
                <CardDescription className="text-base mt-1">{serviceUser.age} years • {serviceUser.room}</CardDescription>

                <div className="flex gap-4 mt-3">
                  <div className="flex items-center text-sm">
                    <UserCheck className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-gray-500">Primary Carer:</span>
                    <span className="font-medium ml-1">{serviceUser.primaryCarer}</span>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-gray-500">Next Visit:</span>
                    <span className="font-medium ml-1">{serviceUser.nextVisit}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Nutrition</h3>
                    <Progress value={serviceUser.nutritionProgress} className="h-2" />
                    <p className="text-xs text-gray-500">Last meal: Breakfast at 9:15 AM</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Medication</h3>
                    <Progress value={serviceUser.medicationCompliance} className="h-2" />
                    <p className="text-xs text-gray-500">All medications taken as scheduled</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Mobility</h3>
                    <Progress value={serviceUser.mobilityProgress} className="h-2" />
                    <p className="text-xs text-gray-500">15 min walking achieved today</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Today's Activities</h3>
                  <div className="border rounded-lg divide-y">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {activity.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-sm text-gray-500">{activity.time} • {activity.caregiver}</div>
                          </div>
                        </div>
                        <Badge className={
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }>
                          {activity.status === 'completed' ? 'Completed' : 'Scheduled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Mood Log</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {serviceUser.moodLog.map((log, index) => (
                      <div key={index} className="border rounded-lg p-2 text-center">
                        <div className="flex justify-center mb-1">
                          {log.mood === 'happy' && <ThumbsUp className="h-5 w-5 text-green-500" />}
                          {log.mood === 'neutral' && <Minus className="h-5 w-5 text-blue-500" />}
                          {log.mood === 'sad' && <ThumbsDown className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="text-xs">{log.date.split('-')[2]}/{log.date.split('-')[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care-plan" className="space-y-4">
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h3 className="font-medium mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    Care Plan Overview
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Elizabeth's care plan focuses on maintaining mobility, medication compliance, and social engagement.
                    The plan is reviewed monthly by the care team.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="font-medium">April 15, 2025</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Next Review</div>
                      <div className="font-medium">May 15, 2025</div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Plan
                    </Button>
                  </div>
                </div>

                <h3 className="font-medium">Progress Towards Goals</h3>
                <div className="space-y-4">
                  {carePlanGoals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="font-medium">{goal.name}</div>
                          <div className="text-sm text-gray-500">{goal.category}</div>
                        </div>
                        <Badge className={
                          goal.progress >= 80 ? 'bg-green-100 text-green-800' :
                          goal.progress >= 50 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }>
                          {goal.progress}% Complete
                        </Badge>
                      </div>

                      <Progress value={goal.progress} className="h-2 mb-2" />

                      <div className="flex justify-between text-sm">
                        <div className="text-gray-500">Target: {goal.target}</div>
                        <div className="text-gray-500">{goal.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="visits" className="space-y-4">
                <h3 className="font-medium">Upcoming Visits</h3>
                <div className="space-y-3">
                  {upcomingVisits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary" />
                          <div className="font-medium">{visit.date}, {visit.time}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {visit.duration}
                        </Badge>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{visit.caregiver}</span>
                        </div>
                        <div className="text-gray-500">{visit.purpose}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Scheduled Visits
                  </Button>

                  <Button size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Video Call
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Recent Photos</h3>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-gray-100 aspect-square relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-white text-sm">Garden Activity</div>
                        <div className="text-white text-xs opacity-80">May {i}, 2025</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-2">
                  <Button variant="outline" size="sm">
                    Load More Photos
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Contact Care Team
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`border rounded-lg p-3 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-1 bg-blue-100">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          {notification.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {notification.date} at {notification.time}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                View All Notifications
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Care Notes</CardTitle>
              <CardDescription>Recent updates from caregivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careNotes.map((note) => (
                  <div key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{note.date}, {note.time}</div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {note.author}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View All Care Notes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="care-notes">Care Notes</Label>
                    <div className="text-xs text-gray-500">Receive updates when new notes are added</div>
                  </div>
                  <Switch id="care-notes" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="medication">Medication Updates</Label>
                    <div className="text-xs text-gray-500">Changes to medication schedule</div>
                  </div>
                  <Switch id="medication" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activities">Activity Participation</Label>
                    <div className="text-xs text-gray-500">Updates on social activities</div>
                  </div>
                  <Switch id="activities" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="health">Health Alerts</Label>
                    <div className="text-xs text-gray-500">Immediate notification for health concerns</div>
                  </div>
                  <Switch id="health" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="video-calls">Video Calls</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <DocumentSharing />
          </TabsContent>

          <TabsContent value="video-calls">
            <VideoCall serviceUserName={serviceUser.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilyPortal;