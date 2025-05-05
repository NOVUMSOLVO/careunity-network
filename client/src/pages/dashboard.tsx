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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  PieChart,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  BellRing,
  BarChart2,
  Layers,
  UserCheck,
  Map,
  ExternalLink,
  RotateCw,
  Filter,
  Sliders,
  Activity,
  CheckCircle,
  XCircle,
  Clock3,
  Bell,
  Pill,
  FileText,
  MessageSquare,
  Home,
  BarChart
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<string>("today");

  // Sample data
  const allocatedVisits = 78;
  const unallocatedVisits = 5;
  const staffAvailable = 24;
  const staffUnavailable = 3;
  const totalServiceUsers = 42;
  const activeIncidents = 2;
  const medicationAlerts = 3;
  
  const allocationProgress = Math.floor((allocatedVisits / (allocatedVisits + unallocatedVisits)) * 100);
  
  const alerts = [
    { id: 1, type: "unallocated", message: "5 visits require allocation for today", priority: "high" },
    { id: 2, type: "staff", message: "3 staff members called in unavailable", priority: "high" },
    { id: 3, type: "medication", message: "3 medication alerts need review", priority: "medium" },
    { id: 4, type: "qualification", message: "2 staff members have expiring certifications", priority: "medium" },
    { id: 5, type: "incident", message: "2 incident reports require follow-up", priority: "high" },
  ];
  
  const staffCards = [
    { id: 1, name: "Jane Wilson", role: "Senior Caregiver", status: "active", visits: 8, allocation: 92, location: "North London" },
    { id: 2, name: "Michael Brown", role: "Caregiver", status: "active", visits: 6, allocation: 85, location: "East London" },
    { id: 3, name: "Sarah Johnson", role: "Senior Caregiver", status: "active", visits: 7, allocation: 88, location: "West London" },
    { id: 4, name: "David Thompson", role: "Caregiver", status: "unavailable", visits: 0, allocation: 0, location: "South London" },
  ];
  
  const urgentVisits = [
    { id: 1, time: "09:00 - 10:00", user: "Elizabeth Taylor", location: "North London", type: "Morning Care", status: "unallocated", priority: "high" },
    { id: 2, time: "12:30 - 13:30", user: "Robert Johnson", location: "East London", type: "Medication", status: "unallocated", priority: "high" },
    { id: 3, time: "16:00 - 17:00", user: "Mary Williams", location: "West London", type: "Evening Care", status: "unallocated", priority: "medium" },
    { id: 4, time: "18:30 - 19:30", user: "John Smith", location: "Central London", type: "Medication", status: "unallocated", priority: "medium" },
    { id: 5, time: "20:00 - 21:00", user: "Patricia Brown", location: "South London", type: "Night Care", status: "unallocated", priority: "high" },
  ];
  
  const aiRecommendations = [
    { id: 1, message: "Assign Jane Wilson to Elizabeth Taylor's morning care visit", confidence: 92, reasoning: "Closest location + prior experience with service user" },
    { id: 2, message: "Move David Thompson to available for afternoon shifts", confidence: 85, reasoning: "Pattern of higher availability during afternoons based on historical data" },
    { id: 3, message: "Increase staff allocation in North London next Thursday", confidence: 88, reasoning: "Predicted 30% increase in service user needs based on historical patterns" },
    { id: 4, message: "Assign Michael Brown to John Smith's medication visit", confidence: 90, reasoning: "Required medication certifications + optimal location" },
  ];
  
  const recentServiceUsers = [
    { id: 1, name: "Elizabeth Taylor", location: "North London", carePackage: "Daily care + medication", priority: "high", lastVisit: "Today, 08:00" },
    { id: 2, name: "Robert Johnson", location: "East London", carePackage: "Medication only", priority: "medium", lastVisit: "Yesterday, 19:30" },
    { id: 3, name: "Mary Williams", location: "West London", carePackage: "Morning and evening care", priority: "medium", lastVisit: "Today, 08:30" },
    { id: 4, name: "John Smith", location: "Central London", carePackage: "Full care package", priority: "high", lastVisit: "Yesterday, 20:00" }
  ];

  const medicationAlertsList = [
    { id: 1, serviceUser: "Elizabeth Taylor", medication: "Lisinopril", issue: "Low supply - 3 days remaining", priority: "high" },
    { id: 2, serviceUser: "Robert Johnson", medication: "Metformin", issue: "Missed dose yesterday evening", priority: "high" },
    { id: 3, serviceUser: "John Smith", medication: "Warfarin", issue: "Dosage change required - doctor notification", priority: "medium" }
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of care delivery operations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="nextWeek">Next Week</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              // In a real application, this would refresh data from the API
              // For now, we'll just show a notification
              alert("Dashboard data refreshed successfully");
            }}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Visit Allocation</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{allocatedVisits}/{allocatedVisits + unallocatedVisits}</p>
                <p className="text-sm text-gray-500">visits allocated</p>
              </div>
              <Progress className="h-2 mt-2" value={allocationProgress} />
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Staff Availability</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{staffAvailable}/{staffAvailable + staffUnavailable}</p>
                <p className="text-sm text-gray-500">staff available</p>
              </div>
              <div className="flex items-center mt-2 gap-1.5">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{staffAvailable} Active</Badge>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{staffUnavailable} Unavailable</Badge>
              </div>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Service Users</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{totalServiceUsers}</p>
                <p className="text-sm text-gray-500">active care packages</p>
              </div>
              <div className="flex items-center mt-2 gap-1.5">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  {allocatedVisits} Visits Today
                </Badge>
              </div>
            </div>
            <User className="h-8 w-8 text-purple-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Alerts</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-gray-500">requiring attention</p>
              </div>
              <div className="flex items-center mt-2 gap-1.5">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {activeIncidents} Incidents
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {medicationAlerts} Medication
                </Badge>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="allocation">
            <Calendar className="h-4 w-4 mr-2" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <BarChart2 className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="medication">
            <Pill className="h-4 w-4 mr-2" />
            Medication
          </TabsTrigger>
        </TabsList>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unallocated Visits Panel */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Unallocated Visits</CardTitle>
                    <CardDescription>Visits requiring staff allocation</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // In a real app, this would open a filter dialog
                        alert("Filter dialog would open here");
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        // In a real app, this would trigger an AI-based allocation
                        alert("AI auto-allocation has been initiated. 3 out of 5 visits have been automatically assigned to available staff.");
                      }}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Auto-Allocate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${
                          visit.priority === "high" ? "bg-red-100" : "bg-amber-100"
                        }`}>
                          <Clock className={`h-5 w-5 ${
                            visit.priority === "high" ? "text-red-700" : "text-amber-700"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{visit.user}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-0.5">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{visit.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{visit.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // In a real app, this would open a detailed view modal
                            alert(`Viewing details for ${visit.user}'s ${visit.type} visit at ${visit.time}`);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // In a real app, this would open an allocation dialog
                            alert(`Opening staff allocation interface for ${visit.user}'s ${visit.type} visit`);
                          }}
                        >
                          Allocate Staff
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would navigate to a full list view
                    alert("Navigating to comprehensive unallocated visits management view");
                  }}
                >
                  View All Unallocated Visits
                </Button>
              </CardFooter>
            </Card>

            {/* Available Staff Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Staff</CardTitle>
                    <CardDescription>Staff available for allocation</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Sliders className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staffCards
                    .filter((staff) => staff.status === "active")
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                            {staff.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.role}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              <span>{staff.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-sm font-medium">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600" />
                            <span>{staff.visits} visits today</span>
                          </div>
                          <div className="mt-1">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              {staff.allocation}% Allocated
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would navigate to the staff directory
                    alert("Navigating to the full staff directory");
                  }}
                >
                  View All Staff
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Allocation Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Allocation Map</CardTitle>
                  <CardDescription>Geographic view of visits and staff</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // In a real app, this would toggle different map layers
                      alert("Map layers panel would open here");
                    }}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Layers
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // In a real app, this would toggle between service user and staff views
                      alert("Switching to staff-focused map view");
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Staff View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-md border flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map showing service users and staff locations</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => {
                      // In a real app, this would open the full map view in a new window/tab
                      alert("Opening full-screen interactive map view");
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alerts & Notifications</CardTitle>
                  <CardDescription>Critical items requiring attention</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // In a real app, this would mark all alerts as read
                      alert("All alerts have been marked as read");
                    }}
                  >
                    Mark All Read
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`border rounded-lg p-4 ${
                      alert.priority === "high" ? "border-red-200 bg-red-50" :
                      alert.priority === "medium" ? "border-amber-200 bg-amber-50" :
                      "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${
                        alert.priority === "high" ? "bg-red-100" :
                        alert.priority === "medium" ? "bg-amber-100" : 
                        "bg-gray-100"
                      }`}>
                        {alert.type === "unallocated" && (
                          <Calendar className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" :
                            alert.priority === "medium" ? "text-amber-700" : 
                            "text-gray-700"
                          }`} />
                        )}
                        {alert.type === "staff" && (
                          <Users className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" :
                            alert.priority === "medium" ? "text-amber-700" : 
                            "text-gray-700"
                          }`} />
                        )}
                        {alert.type === "medication" && (
                          <Pill className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" :
                            alert.priority === "medium" ? "text-amber-700" : 
                            "text-gray-700"
                          }`} />
                        )}
                        {alert.type === "qualification" && (
                          <FileText className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" :
                            alert.priority === "medium" ? "text-amber-700" : 
                            "text-gray-700"
                          }`} />
                        )}
                        {alert.type === "incident" && (
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" :
                            alert.priority === "medium" ? "text-amber-700" : 
                            "text-gray-700"
                          }`} />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{alert.message}</p>
                          <Badge className={`
                            ${alert.priority === "high" ? "bg-red-100 text-red-800" :
                             alert.priority === "medium" ? "bg-amber-100 text-amber-800" :
                             "bg-gray-100 text-gray-800"}
                          `}>
                            {alert.priority === "high" ? "High Priority" :
                             alert.priority === "medium" ? "Medium Priority" :
                             "Low Priority"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {alert.type === "unallocated" && "Visit Allocation Alert"}
                            {alert.type === "staff" && "Staff Availability Alert"}
                            {alert.type === "medication" && "Medication Alert"}
                            {alert.type === "qualification" && "Qualification Alert"}
                            {alert.type === "incident" && "Incident Report Alert"}
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => {
                              // In a real app, this would open a dialog to address the alert
                              window.alert(`Taking action on alert: ${alert.message}`);
                            }}
                          >
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex items-center justify-between">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => {
                    // In a real app, this would open notification preferences
                    window.alert("Opening notification settings panel");
                  }}
                >
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </Button>
                <Button 
                  className="gap-1"
                  onClick={() => {
                    // In a real app, this would navigate to the alerts management page
                    window.alert("Navigating to comprehensive alerts management page");
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  View All Alerts
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Users</CardTitle>
                <CardDescription>Service users with recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentServiceUsers.map((user) => (
                    <div key={user.id} className="flex items-start justify-between border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-0.5">
                            <Home className="h-3.5 w-3.5 mr-1" />
                            <span>{user.location}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {user.carePackage}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`
                          ${user.priority === "high" ? "bg-purple-100 text-purple-800" :
                           "bg-blue-100 text-blue-800"}
                        `}>
                          {user.priority === "high" ? "High Priority" : "Medium Priority"}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Last visit: {user.lastVisit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would navigate to the service users page
                    window.alert("Navigating to service users directory");
                  }}
                >
                  View All Service Users
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>Recent incidents requiring review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[255px] flex flex-col items-center justify-center text-center p-4 rounded-lg border border-dashed">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                  <h3 className="font-medium text-lg">Incident Management</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    Track, manage, and resolve incidents with our comprehensive
                    incident reporting system.
                  </p>
                  <Button>View Incident Reports</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                  <CardDescription>Smart suggestions for optimal care delivery</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Refresh Insights
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiRecommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Activity className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{rec.message}</p>
                          <Badge className="bg-blue-100 text-blue-800">
                            {rec.confidence}% Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.reasoning}
                        </p>
                        <div className="flex justify-end mt-2 gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <XCircle className="h-4 w-4" />
                            Ignore
                          </Button>
                          <Button size="sm" className="gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex items-center justify-between">
                <Button variant="outline">AI Settings</Button>
                <Button>View All Recommendations</Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Staffing</CardTitle>
                <CardDescription>AI forecast of staffing requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">North London</h3>
                      <Badge className="bg-red-100 text-red-800">
                        +4 Staff Needed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85% Demand</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Predicted 30% increase in service demands next week based on historical patterns and new service users.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">South London</h3>
                      <Badge className="bg-green-100 text-green-800">
                        Adequate Staffing
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65% Demand</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Current staffing levels sufficient for projected demand over the next 14 days.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">East London</h3>
                      <Badge className="bg-amber-100 text-amber-800">
                        +2 Staff Recommended
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-sm font-medium">78% Demand</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Moderate increase in service user needs predicted based on seasonal patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Full Staffing Forecast</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Route Optimization</CardTitle>
                <CardDescription>AI-optimized travel routes for caregivers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[310px] flex flex-col items-center justify-center text-center p-4 rounded-lg border border-dashed">
                  <Map className="h-8 w-8 text-blue-400 mb-2" />
                  <h3 className="font-medium text-lg">Smart Route Planning</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    Optimize travel routes for your care staff to minimize travel time and maximize care delivery.
                  </p>
                  <Button>Plan Optimal Routes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Medication Tab */}
        <TabsContent value="medication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medication Alerts</CardTitle>
                    <CardDescription>Medication issues requiring attention</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicationAlertsList.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start justify-between border rounded-lg p-4 ${
                        alert.priority === "high" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          alert.priority === "high" ? "bg-red-100" : "bg-amber-100"
                        }`}>
                          <Pill className={`h-5 w-5 ${
                            alert.priority === "high" ? "text-red-700" : "text-amber-700"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{alert.serviceUser}</p>
                          <p className="text-sm font-medium mt-1">{alert.medication}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {alert.issue}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Badge className={`
                          ${alert.priority === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}
                        `}>
                          {alert.priority === "high" ? "Urgent" : "Attention Needed"}
                        </Badge>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm">Resolve</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Medication Alerts</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Medication Schedule</CardTitle>
                <CardDescription>Today's medication timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Morning Medications</h3>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>08:00 - 10:00</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">12 medications for 8 service users</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">Details</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Midday Medications</h3>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>12:00 - 14:00</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">15 medications for 10 service users</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">Details</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Evening Medications</h3>
                      <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>18:00 - 20:00</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">18 medications for 12 service users</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">Details</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Night Medications</h3>
                      <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>20:00 - 22:00</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">9 medications for 7 service users</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Medication Management</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Medication Compliance Dashboard</CardTitle>
                  <CardDescription>Tracking medication administration compliance</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="week">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Compliance Rate</p>
                      <p className="text-2xl font-bold mt-1">94.8%</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+2.1% vs Last Week</Badge>
                  </div>
                  <div className="mt-2">
                    <Progress value={94.8} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Missed Medications</p>
                      <p className="text-2xl font-bold mt-1">7</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">-3 vs Last Week</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">0.8% of total medications</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Late Administrations</p>
                      <p className="text-2xl font-bold mt-1">12</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">-5 vs Last Week</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">1.4% of total medications</p>
                </div>
              </div>
              
              <div className="h-64 flex items-center justify-center rounded-lg border">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive chart showing medication compliance over time</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Detailed Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;