import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Clock3,
  Bell,
  Pill,
  Home,
  Phone,
  Mail,
  Info,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Clipboard,
  CheckSquare,
  Heart,
  Send,
  Paperclip
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FamilyPortal = () => {
  const [tabValue, setTabValue] = useState("dashboard");
  const [messageText, setMessageText] = useState("");
  
  // Sample data
  const serviceUser = {
    id: 1,
    name: "Elizabeth Taylor",
    photo: null,
    address: "123 Maple Street, North London",
    phone: "(020) 7123 4567",
    emergencyContact: "Robert Taylor (Son)",
    emergencyPhone: "(020) 7234 5678",
    careLevel: "Medium",
    careManager: "Sarah Johnson"
  };
  
  const upcomingVisits = [
    { id: 1, date: "Today", time: "16:00 - 17:00", caregiver: "Jane Wilson", purpose: "Evening Care & Medication", status: "confirmed" },
    { id: 2, date: "Today", time: "20:00 - 21:00", caregiver: "Michael Brown", purpose: "Night Care", status: "confirmed" },
    { id: 3, date: "Tomorrow", time: "08:00 - 09:00", caregiver: "Jane Wilson", purpose: "Morning Care & Medication", status: "confirmed" },
    { id: 4, date: "Tomorrow", time: "12:30 - 13:30", caregiver: "Sarah Johnson", purpose: "Lunch & Medication", status: "confirmed" },
    { id: 5, date: "Tomorrow", time: "16:00 - 17:00", caregiver: "Michael Brown", purpose: "Evening Care & Medication", status: "pending" }
  ];
  
  const recentVisits = [
    { id: 1, date: "Today", time: "08:00 - 09:00", caregiver: "Jane Wilson", purpose: "Morning Care & Medication", onTime: true, completed: true, notes: "All tasks completed. Medication taken without issues." },
    { id: 2, date: "Today", time: "12:30 - 13:30", caregiver: "Sarah Johnson", purpose: "Lunch & Medication", onTime: true, completed: true, notes: "Appetite was good today. All tasks completed as planned." },
    { id: 3, date: "Yesterday", time: "16:00 - 17:00", caregiver: "Michael Brown", purpose: "Evening Care & Medication", onTime: false, completed: true, notes: "Arrived 15 minutes late due to traffic. All care tasks completed." },
    { id: 4, date: "Yesterday", time: "20:00 - 21:00", caregiver: "Jane Wilson", purpose: "Night Care", onTime: true, completed: true, notes: "Settled well for the night. No concerns." },
    { id: 5, date: "2 days ago", time: "08:00 - 09:00", caregiver: "Sarah Johnson", purpose: "Morning Care & Medication", onTime: true, completed: true, notes: "Slept well through the night. All morning routines completed." }
  ];
  
  const medications = [
    { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "Morning", lastTaken: "Today, 08:15", nextDue: "Tomorrow, 08:00", supply: "3 days remaining", status: "warning" },
    { id: 2, name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "Morning and Evening", lastTaken: "Today, 08:15", nextDue: "Today, 18:00", supply: "10 days remaining", status: "ok" },
    { id: 3, name: "Simvastatin", dosage: "20mg", frequency: "Once daily", time: "Evening", lastTaken: "Yesterday, 18:10", nextDue: "Today, 18:00", supply: "15 days remaining", status: "ok" },
    { id: 4, name: "Aspirin", dosage: "81mg", frequency: "Once daily", time: "Morning", lastTaken: "Today, 08:15", nextDue: "Tomorrow, 08:00", supply: "20 days remaining", status: "ok" }
  ];
  
  const careTeam = [
    { id: 1, name: "Sarah Johnson", role: "Care Manager", photo: null, contact: "(020) 7123 9876" },
    { id: 2, name: "Jane Wilson", role: "Senior Caregiver", photo: null, contact: "(020) 7123 8765" },
    { id: 3, name: "Michael Brown", role: "Caregiver", photo: null, contact: "(020) 7123 7654" },
    { id: 4, name: "Dr. Emily Richards", role: "General Practitioner", photo: null, contact: "(020) 7123 6543" }
  ];
  
  const messages = [
    { id: 1, sender: "Sarah Johnson", role: "Care Manager", time: "Yesterday, 15:30", message: "Hello Mr. Taylor, I wanted to let you know that we've updated Elizabeth's care plan based on our discussion last week. All caregivers have been briefed on the changes.", isUser: false },
    { id: 2, sender: "Robert Taylor", role: "Family Member", time: "Yesterday, 16:45", message: "Thank you for the update. I noticed that Elizabeth seems more comfortable with the new morning routine. Could we also adjust the evening medication time to be a bit earlier?", isUser: true },
    { id: 3, sender: "Sarah Johnson", role: "Care Manager", time: "Yesterday, 17:20", message: "That's great to hear about the morning routine. Regarding the evening medication, I can certainly arrange for it to be administered earlier. What time would work better?", isUser: false },
    { id: 4, sender: "Robert Taylor", role: "Family Member", time: "Yesterday, 18:05", message: "Around 6:30pm would be ideal, as she tends to get tired earlier now.", isUser: true },
    { id: 5, sender: "Sarah Johnson", role: "Care Manager", time: "Today, 09:15", message: "I've updated the care plan to move evening medication to 6:30pm. This will start from today's evening visit. Let me know if you notice any improvement.", isUser: false }
  ];
  
  const documents = [
    { id: 1, name: "Care Plan - May 2023", date: "01/05/2023", type: "Care Plan", status: "current" },
    { id: 2, name: "Medication Schedule", date: "01/05/2023", type: "Medical", status: "current" },
    { id: 3, name: "Risk Assessment", date: "15/04/2023", type: "Assessment", status: "current" },
    { id: 4, name: "Care Plan - April 2023", date: "01/04/2023", type: "Care Plan", status: "archived" },
    { id: 5, name: "Initial Assessment", date: "15/03/2023", type: "Assessment", status: "archived" }
  ];
  
  const faqs = [
    { 
      id: 1, 
      question: "How can I request changes to the care schedule?", 
      answer: "You can request schedule changes by contacting your Care Manager directly through the messaging system or by calling our office. For non-urgent changes, please provide at least 24 hours notice." 
    },
    { 
      id: 2, 
      question: "What should I do if a caregiver doesn't arrive?", 
      answer: "If a caregiver hasn't arrived within 15 minutes of the scheduled time, please contact our office immediately at the emergency number provided. We will locate the caregiver or arrange a replacement as quickly as possible." 
    },
    { 
      id: 3, 
      question: "How do I order more medication supplies?", 
      answer: "Medication supplies can be ordered through the Medications tab. Click on the 'Request Refill' button next to any medication that needs to be refilled. Alternatively, you can message your Care Manager with your request." 
    },
    { 
      id: 4, 
      question: "Can I provide feedback about a specific visit?", 
      answer: "Yes, you can provide feedback for any visit by going to the Visits tab, finding the specific visit, and clicking on 'Provide Feedback'. Your feedback helps us maintain and improve our quality of care." 
    },
    { 
      id: 5, 
      question: "How do I update emergency contact information?", 
      answer: "Emergency contact information can be updated in the Profile tab. Click on 'Edit Emergency Contacts' and follow the instructions to update the information." 
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;
    
    alert(`Message sent: ${messageText}`);
    setMessageText("");
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold tracking-tight">Family Portal</h1>
          <p className="text-gray-500 mt-1">
            Stay connected with your loved one's care
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2">
          <Button variant="outline" className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          <Button className="flex-1">
            <Bell className="mr-2 h-4 w-4" />
            Notification Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                {serviceUser.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{serviceUser.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Badge className="bg-blue-100 text-blue-800">Service User</Badge>
                  <Badge className="bg-purple-100 text-purple-800">{serviceUser.careLevel} Care</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{serviceUser.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{serviceUser.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Emergency: {serviceUser.emergencyContact}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Care Manager: {serviceUser.careManager}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium">Next Visit</h3>
              <div className="mt-3 mb-4 text-center">
                <div className="text-lg font-bold">{upcomingVisits[0].time}</div>
                <div className="text-sm text-gray-500">{upcomingVisits[0].date}</div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                  {upcomingVisits[0].caregiver.split(" ").map((n) => n[0]).join("")}
                </div>
              </div>
              <div className="text-sm font-medium mb-1">{upcomingVisits[0].caregiver}</div>
              <div className="text-xs text-gray-500 mb-4">{upcomingVisits[0].purpose}</div>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View All Visits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 md:w-auto">
          <TabsTrigger value="dashboard">
            <Home className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Dashboard</span>
            <span className="inline md:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="visits">
            <Calendar className="h-4 w-4 mr-2" />
            Visits
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Medications</span>
            <span className="inline md:hidden">Meds</span>
          </TabsTrigger>
          <TabsTrigger value="care-team">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Care Team</span>
            <span className="inline md:hidden">Team</span>
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Documents</span>
            <span className="inline md:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Visits</CardTitle>
                <CardDescription>Scheduled care visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingVisits.slice(0, 3).map((visit) => (
                    <div key={visit.id} className="flex items-start justify-between border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-blue-100">
                          <Calendar className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium">{visit.date}, {visit.time}</p>
                          <p className="text-sm">{visit.caregiver}</p>
                          <p className="text-sm text-gray-500">{visit.purpose}</p>
                        </div>
                      </div>
                      <Badge className={visit.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                        {visit.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setTabValue("visits")}>
                  View All Visits
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Care Notes</CardTitle>
                <CardDescription>Updates from recent visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentVisits.slice(0, 3).map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{visit.date}, {visit.time}</div>
                        <Badge className={visit.onTime ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                          {visit.onTime ? "On Time" : "Delayed"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {visit.caregiver} - {visit.purpose}
                      </div>
                      <p className="text-sm border-t pt-2">{visit.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setTabValue("visits")}>
                  View All Notes
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medication Summary</CardTitle>
                <CardDescription>Current medication status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div key={med.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock3 className="h-3 w-3 mr-1" />
                          <span>Next: {med.nextDue}</span>
                        </div>
                      </div>
                      {med.status === "warning" ? (
                        <Badge className="bg-red-100 text-red-800">
                          {med.supply}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          OK
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setTabValue("medications")}>
                  Manage Medications
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Recent communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(messages.length - 3).reverse().map((message) => (
                    <div key={message.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{message.sender}</div>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{message.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setTabValue("messages")}>
                  View All Messages
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Team</CardTitle>
                <CardDescription>Your dedicated care professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careTeam.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setTabValue("care-team")}>
                  View Full Care Team
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Care Visit History</CardTitle>
                    <CardDescription>Recent and upcoming care visits</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Visits</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upcoming visits section */}
                  <div>
                    <h3 className="font-medium mb-3">Upcoming Visits</h3>
                    <div className="space-y-3">
                      {upcomingVisits.map((visit) => (
                        <div key={visit.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="font-medium">{visit.date}, {visit.time}</span>
                            </div>
                            <Badge className={visit.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                              {visit.status === "confirmed" ? "Confirmed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm">{visit.caregiver}</span>
                            </div>
                            <div className="flex items-center">
                              <Info className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm">{visit.purpose}</span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">Request Change</Button>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Completed visits section */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Recent Visits</h3>
                    <div className="space-y-3">
                      {recentVisits.slice(0, 3).map((visit) => (
                        <div key={visit.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <CheckCircle2 className={`h-5 w-5 mr-2 ${visit.onTime ? "text-green-600" : "text-amber-600"}`} />
                              <span className="font-medium">{visit.date}, {visit.time}</span>
                            </div>
                            <Badge className={visit.onTime ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                              {visit.onTime ? "On Time" : "Delayed"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm">{visit.caregiver}</span>
                            </div>
                            <div className="flex items-center">
                              <Info className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm">{visit.purpose}</span>
                            </div>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <p className="text-sm">{visit.notes}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button variant="outline" size="sm">Provide Feedback</Button>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Load More Visits</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visit Statistics</CardTitle>
                  <CardDescription>Visit quality metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">On-Time Rate</span>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Task Completion</span>
                        <span className="text-sm font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Consistency (Same Caregivers)</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Family Satisfaction</span>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Care Tasks</CardTitle>
                  <CardDescription>Regular care activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <span>Morning Hygiene Assistance</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Daily</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <span>Medication Administration</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">3x Daily</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <span>Meal Preparation</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">3x Daily</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <span>Mobility Assistance</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">As Needed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <span>Light Housekeeping</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Weekly</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Care Plan</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medication Schedule</CardTitle>
                    <CardDescription>Current medication regimen</CardDescription>
                  </div>
                  <Button size="sm">
                    <Pill className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div key={med.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium">{med.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{med.dosage} - {med.frequency}</p>
                        </div>
                        <Badge className={med.status === "warning" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                          {med.status === "warning" ? med.supply : "Sufficient Supply"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                        <div>
                          <div className="text-xs text-gray-500">Administration Time</div>
                          <div className="text-sm">{med.time}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Last Taken</div>
                          <div className="text-sm">{med.lastTaken}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Next Due</div>
                          <div className="text-sm">{med.nextDue}</div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        {med.status === "warning" && (
                          <Button variant="outline" size="sm">
                            Request Refill
                          </Button>
                        )}
                        <Button size="sm">View History</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medication Summary</CardTitle>
                  <CardDescription>Overview of medication adherence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Adherence Rate</span>
                        <span className="text-sm font-medium">97%</span>
                      </div>
                      <Progress value={97} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">On-Time Administration</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Documentation Accuracy</span>
                        <span className="text-sm font-medium">99%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Medication Types</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Cardiovascular</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Diabetes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Cholesterol</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Pain Management</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medication Resources</CardTitle>
                  <CardDescription>Helpful information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Medication Information Sheets
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Side Effects Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Drug Interaction Information
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Request Prescription Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Care Team Tab */}
        <TabsContent value="care-team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Care Team</CardTitle>
                <CardDescription>Professionals involved in care delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {careTeam.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xl font-medium">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{member.name}</h3>
                          <p className="text-gray-500">{member.role}</p>
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">{member.contact}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Care Manager</CardTitle>
                  <CardDescription>Your primary point of contact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-medium mb-4">
                      {careTeam[0].name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <h3 className="font-medium text-lg text-center">{careTeam[0].name}</h3>
                    <p className="text-gray-500 mb-4 text-center">{careTeam[0].role}</p>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                      <Button>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Interactions</CardTitle>
                  <CardDescription>Care team communication log</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Message from Sarah Johnson</span>
                      </div>
                      <div className="text-xs text-gray-500">Today, 09:15</div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3 py-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Call with Dr. Emily Richards</span>
                      </div>
                      <div className="text-xs text-gray-500">Yesterday, 14:30</div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3 py-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Care Plan Review Meeting</span>
                      </div>
                      <div className="text-xs text-gray-500">May 1, 2023</div>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Message from Michael Brown</span>
                      </div>
                      <div className="text-xs text-gray-500">April 28, 2023</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>Communications with the care team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-lg p-4 max-w-[80%] ${
                        message.isUser 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-8 w-8 rounded-full ${
                          message.isUser 
                            ? 'bg-blue-200 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        } flex items-center justify-center text-xs font-medium`}>
                          {message.sender.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{message.sender}</div>
                          <div className="text-xs opacity-70">{message.role}</div>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{message.message}</p>
                      <div className="text-xs opacity-50 mt-2 text-right">{message.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-3">
                <Textarea 
                  placeholder="Type your message here..." 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none"
                  rows={3}
                />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Care Documents</CardTitle>
                    <CardDescription>Important documentation and records</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        <SelectItem value="care">Care Plans</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="assessment">Assessments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current documents */}
                  <div>
                    <h3 className="font-medium mb-3">Current Documents</h3>
                    <div className="space-y-3">
                      {documents.filter(doc => doc.status === "current").map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${
                              doc.type === "Care Plan" ? "bg-blue-100" :
                              doc.type === "Medical" ? "bg-green-100" :
                              "bg-purple-100"
                            }`}>
                              <FileText className={`h-5 w-5 ${
                                doc.type === "Care Plan" ? "text-blue-700" :
                                doc.type === "Medical" ? "text-green-700" :
                                "text-purple-700"
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{doc.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                            <Button size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Archived documents */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Archived Documents</h3>
                    <div className="space-y-3">
                      {documents.filter(doc => doc.status === "archived").map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-gray-200">
                              <FileText className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{doc.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions and answers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer">
                          <div className="font-medium">{faq.question}</div>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                        <div className="p-3 text-sm border-t">
                          {faq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>Resources and assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Care Team
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      User Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Emergency Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyPortal;