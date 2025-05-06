import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  Heart, 
  Settings, 
  Phone, 
  MapPin, 
  Star,
  List,
  ListChecks,
  FileBarChart,
  PieChart,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';
import { ServiceUser, Appointment, Note, RiskAssessment, CarePlan, Task } from '@shared/schema';

// Dashboard Patient interfaces
interface PatientOverviewProps {
  selectedPatientId?: number | null;
}

interface PatientSummary {
  id: number;
  uniqueId: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  address: string;
  phoneNumber?: string;
  emergencyContact?: string;
  profileImage?: string;
  riskLevel: 'low' | 'medium' | 'high';
  activeCarePlans: number;
  upcomingAppointments: number;
  lastVisit?: string;
  nextVisit?: string;
  pendingTasks: number;
  completedTasksPercentage: number;
}

interface HealthMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  date: string;
  trend: 'improved' | 'steady' | 'worsened' | 'new';
  change?: number;
  notes?: string;
}

// Components

// Patient Search Component
const PatientSearch = ({ onSelect }: { onSelect: (id: number) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch patients for search
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/service-users/search', searchTerm],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample data - in a real app, this would come from the API
      return [
        {
          id: 1,
          uniqueId: 'SU10001',
          fullName: 'Elizabeth Johnson',
          dateOfBirth: '1948-05-12',
          riskLevel: 'medium' as const,
        },
        {
          id: 2,
          uniqueId: 'SU10002',
          fullName: 'Robert Wilson',
          dateOfBirth: '1953-09-28',
          riskLevel: 'high' as const,
        },
        {
          id: 3,
          uniqueId: 'SU10003',
          fullName: 'Mary Thompson',
          dateOfBirth: '1940-11-03',
          riskLevel: 'low' as const,
        },
        {
          id: 4,
          uniqueId: 'SU10004',
          fullName: 'James Lewis',
          dateOfBirth: '1962-02-17',
          riskLevel: 'medium' as const,
        },
        {
          id: 5,
          uniqueId: 'SU10005',
          fullName: 'Sarah Adams',
          dateOfBirth: '1955-07-22',
          riskLevel: 'low' as const,
        }
      ];
    }
  });
  
  const filteredPatients = searchTerm.length > 0 
    ? patients?.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;
  
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="active">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Users</SelectItem>
            <SelectItem value="active">Active Service Users</SelectItem>
            <SelectItem value="high-risk">High Risk</SelectItem>
            <SelectItem value="recent">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))
        ) : filteredPatients && filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <Card 
              key={patient.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(patient.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {patient.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{patient.fullName}</span>
                    {patient.riskLevel === 'high' && (
                      <Badge variant="destructive" className="text-xs">High Risk</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="truncate">{patient.uniqueId}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-6 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-gray-500">No service users found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Patient Header Section
const PatientHeader = ({ patient }: { patient: PatientSummary }) => {
  const calculateAge = (dob: string): number => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };
  
  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Risk</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Avatar className="h-16 w-16 border-2 border-gray-200">
          <AvatarImage src={patient.profileImage} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {patient.fullName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{patient.fullName}</h2>
            {getRiskBadge(patient.riskLevel)}
            <Badge variant="outline" className="ml-1">{patient.uniqueId}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <span className="text-sm flex items-center gap-1.5 text-gray-500">
              <Calendar className="h-3.5 w-3.5" /> {patient.dateOfBirth} ({patient.age} yrs)
            </span>
            {patient.phoneNumber && (
              <span className="text-sm flex items-center gap-1.5 text-gray-500">
                <Phone className="h-3.5 w-3.5" /> {patient.phoneNumber}
              </span>
            )}
            <span className="text-sm flex items-center gap-1.5 text-gray-500">
              <MapPin className="h-3.5 w-3.5" /> {patient.address}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <Button variant="outline" className="flex gap-1 items-center text-sm h-9">
            <FileText className="h-4 w-4" /> Care Plan
          </Button>
          <Button variant="outline" className="flex gap-1 items-center text-sm h-9">
            <Calendar className="h-4 w-4" /> Schedule
          </Button>
          <Button className="flex gap-1 items-center text-sm h-9">
            <Activity className="h-4 w-4" /> View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

// Patient Stats Overview
const PatientStats = ({ patient }: { patient: PatientSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Care Plans</p>
              <h3 className="text-3xl font-bold mt-1">{patient.activeCarePlans}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Last updated 3 days ago</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Appointments</p>
              <h3 className="text-3xl font-bold mt-1">{patient.upcomingAppointments}</h3>
            </div>
            <div className="rounded-full bg-blue-50 p-2">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Next: {patient.nextVisit || 'None scheduled'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <h3 className="text-3xl font-bold mt-1">{patient.pendingTasks}</h3>
            </div>
            <div className="rounded-full bg-amber-50 p-2">
              <ListChecks className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Completion Rate</span>
              <span className="font-medium">{patient.completedTasksPercentage}%</span>
            </div>
            <Progress value={patient.completedTasksPercentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Visit</p>
              <h3 className="text-xl font-bold mt-1 truncate">{patient.lastVisit || 'None'}</h3>
            </div>
            <div className="rounded-full bg-green-50 p-2">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" /> Completed
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Patient Care Plan Section
const PatientCarePlans = ({ patientId }: { patientId: number }) => {
  const { data: carePlans, isLoading } = useQuery({
    queryKey: ['/api/care-plans', patientId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return [
        {
          id: 1,
          title: "Personal Care Plan",
          summary: "Daily personal care and hygiene support",
          startDate: "2023-01-15",
          reviewDate: "2023-07-15",
          status: "active",
          progress: 68,
          tasksTotal: 18,
          tasksCompleted: 12
        },
        {
          id: 2,
          title: "Medication Management Plan",
          summary: "Assistance with daily medication administration",
          startDate: "2023-02-10",
          reviewDate: "2023-08-10",
          status: "active",
          progress: 92,
          tasksTotal: 12,
          tasksCompleted: 11
        },
        {
          id: 3,
          title: "Nutrition Support Plan",
          summary: "Support with meal preparation and nutrition management",
          startDate: "2023-03-05",
          reviewDate: "2023-09-05",
          status: "active",
          progress: 75,
          tasksTotal: 8,
          tasksCompleted: 6
        }
      ];
    }
  });
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Care Plans</CardTitle>
            <CardDescription>Active care plans and progress</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <FileBarChart className="h-4 w-4 mr-1" /> 
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : carePlans && carePlans.length > 0 ? (
          <div className="space-y-4">
            {carePlans.map(plan => (
              <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h3 className="font-medium">{plan.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.summary}</p>
                  </div>
                  <Badge variant={plan.status === 'active' ? 'default' : 'outline'}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span className="inline-flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Review: {plan.reviewDate}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{plan.tasksCompleted}/{plan.tasksTotal}</span>
                    <span className="text-gray-500 ml-1">tasks completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500">No care plans found</h3>
            <p className="text-sm text-gray-400 mt-1">Create a care plan to get started</p>
            <Button size="sm" className="mt-3">Create Care Plan</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Patient Upcoming Appointments
const PatientAppointments = ({ patientId }: { patientId: number }) => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments', patientId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 1,
          title: "Morning Care Visit",
          date: "2023-05-12",
          startTime: "08:30",
          endTime: "09:30",
          visitType: "personal care",
          caregiverName: "Sarah Jones",
          status: "scheduled"
        },
        {
          id: 2,
          title: "Medication Administration",
          date: "2023-05-12",
          startTime: "12:00",
          endTime: "12:30",
          visitType: "medication",
          caregiverName: "Michael Brown",
          status: "scheduled"
        },
        {
          id: 3,
          title: "Evening Care Visit",
          date: "2023-05-12",
          startTime: "18:00",
          endTime: "19:00",
          visitType: "personal care",
          caregiverName: "Emma Wilson",
          status: "scheduled"
        },
        {
          id: 4,
          title: "Morning Care Visit",
          date: "2023-05-13",
          startTime: "08:30",
          endTime: "09:30",
          visitType: "personal care",
          caregiverName: "Sarah Jones",
          status: "scheduled"
        }
      ];
    }
  });
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Next 7 days of scheduled visits</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" /> 
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map(appointment => (
              <div 
                key={appointment.id} 
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-primary/5 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-sm font-medium">
                    {new Date(appointment.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(appointment.date).toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="text-xs font-medium mt-1">
                    {appointment.startTime}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{appointment.title}</h4>
                  <div className="flex flex-wrap text-sm text-gray-500 gap-x-3 gap-y-1 mt-0.5">
                    <span className="capitalize">{appointment.visitType}</span>
                    <span>•</span>
                    <span>{appointment.caregiverName}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Badge variant="outline" className="capitalize">
                    {appointment.status}
                  </Badge>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500">No upcoming appointments</h3>
            <p className="text-sm text-gray-400 mt-1">Schedule a new appointment</p>
            <Button size="sm" className="mt-3">Schedule Appointment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Patient Health Metrics
const PatientHealthMetrics = ({ patientId }: { patientId: number }) => {
  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ['/api/health-metrics', patientId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [
        {
          id: "weight",
          name: "Weight",
          value: 68.5,
          unit: "kg",
          date: "2023-05-05",
          trend: "improved" as const,
          change: -0.5
        },
        {
          id: "blood_pressure",
          name: "Blood Pressure",
          value: "130/85",
          date: "2023-05-05",
          trend: "steady" as const
        },
        {
          id: "blood_glucose",
          name: "Blood Glucose",
          value: 6.2,
          unit: "mmol/L",
          date: "2023-05-05",
          trend: "worsened" as const,
          change: 0.8
        },
        {
          id: "pain_level",
          name: "Pain Level",
          value: 3,
          unit: "/10",
          date: "2023-05-06",
          trend: "improved" as const,
          change: -1
        },
        {
          id: "mobility_score",
          name: "Mobility Score",
          value: 7,
          unit: "/10",
          date: "2023-05-04",
          trend: "steady" as const
        },
        {
          id: "mood_score",
          name: "Mood Score",
          value: 8,
          unit: "/10",
          date: "2023-05-06",
          trend: "improved" as const,
          change: 2
        }
      ];
    }
  });
  
  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'improved':
        return <span className="text-green-500">↑</span>;
      case 'worsened':
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };
  
  const getTrendClass = (trend: string) => {
    switch(trend) {
      case 'improved':
        return "text-green-600 bg-green-50";
      case 'worsened':
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Recent measurements and trends</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <PieChart className="h-4 w-4 mr-1" /> 
            View Full Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : healthMetrics && healthMetrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {healthMetrics.map(metric => (
              <div key={metric.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-700">{metric.name}</h4>
                  <Badge variant="outline" className={`text-xs ${getTrendClass(metric.trend)}`}>
                    {getTrendIcon(metric.trend)} 
                    {metric.change && metric.change > 0 ? `+${metric.change}` : metric.change}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-semibold">
                    {metric.value}
                    {metric.unit && <span className="text-base text-gray-500 ml-1">{metric.unit}</span>}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Last recorded: {metric.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500">No health metrics recorded</h3>
            <p className="text-sm text-gray-400 mt-1">Record health metrics to track trends</p>
            <Button size="sm" className="mt-3">Record Metrics</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Patient Risk Assessments
const PatientRiskAssessments = ({ patientId }: { patientId: number }) => {
  const { data: riskAssessments, isLoading } = useQuery({
    queryKey: ['/api/risk-assessments', patientId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 650));
      
      return [
        {
          id: 1,
          category: "falls",
          riskLevel: "high",
          description: "History of falls, mobility challenges",
          mitigations: "Fall sensors, mobility aids, clear pathways",
          reviewDate: "2023-08-15"
        },
        {
          id: 2,
          category: "medication",
          riskLevel: "medium",
          description: "Multiple medications with possible side effects",
          mitigations: "Medication management system, regular reviews",
          reviewDate: "2023-07-10"
        },
        {
          id: 3,
          category: "nutrition",
          riskLevel: "low",
          description: "Possible dehydration risk",
          mitigations: "Fluid intake monitoring, nutritional supplements",
          reviewDate: "2023-09-20"
        }
      ];
    }
  });
  
  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Risk</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Risk Assessments</CardTitle>
            <CardDescription>Risk factors and mitigation strategies</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" /> 
            View All Risks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : riskAssessments && riskAssessments.length > 0 ? (
          <div className="space-y-3">
            {riskAssessments.map(risk => (
              <div key={risk.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <h3 className="font-medium capitalize">{risk.category} Risk</h3>
                  {getRiskBadge(risk.riskLevel)}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">{risk.description}</p>
                
                <div className="mt-3 border-t pt-2">
                  <h4 className="text-xs font-medium text-gray-500">MITIGATIONS</h4>
                  <p className="text-sm mt-1">{risk.mitigations}</p>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>Review date: {risk.reviewDate}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2">Update</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500">No risk assessments found</h3>
            <p className="text-sm text-gray-400 mt-1">Complete risk assessments to identify needs</p>
            <Button size="sm" className="mt-3">Add Assessment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Patient Recent Notes
const PatientNotes = ({ patientId }: { patientId: number }) => {
  const { data: notes, isLoading } = useQuery({
    queryKey: ['/api/notes', patientId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 550));
      
      return [
        {
          id: 1,
          content: "Patient mentioned increased pain in left knee. Might need physiotherapy referral.",
          timestamp: "2023-05-10 09:45",
          category: "general",
          createdBy: "Sarah Jones"
        },
        {
          id: 2,
          content: "All medications administered as scheduled. No adverse reactions observed.",
          timestamp: "2023-05-09 18:30",
          category: "medication",
          createdBy: "Michael Brown"
        },
        {
          id: 3,
          content: "Patient in good spirits today. Enjoyed reminiscence activities and social interaction.",
          timestamp: "2023-05-09 14:15",
          category: "wellbeing",
          createdBy: "Emma Wilson"
        }
      ];
    }
  });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Latest observations and updates</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <List className="h-4 w-4 mr-1" /> 
              View All
            </Button>
            <Button size="sm">
              Add Note
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="capitalize">
                    {note.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{note.timestamp}</span>
                </div>
                
                <p className="mt-2 text-sm">{note.content}</p>
                
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span>By: {note.createdBy}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500">No notes recorded</h3>
            <p className="text-sm text-gray-400 mt-1">Add a note to track observations</p>
            <Button size="sm" className="mt-3">Add Note</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Patient Overview Component
export function PatientOverview({ selectedPatientId = null }: PatientOverviewProps) {
  const [activePatientId, setActivePatientId] = useState<number | null>(selectedPatientId);
  
  // Fetch patient summary data
  const { data: patientSummary, isLoading: patientLoading } = useQuery({
    queryKey: ['/api/service-users/summary', activePatientId],
    enabled: activePatientId !== null,
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activePatientId === 1) {
        return {
          id: 1,
          uniqueId: 'SU10001',
          fullName: 'Elizabeth Johnson',
          dateOfBirth: '1948-05-12',
          age: 75,
          address: '42 Oak Street, Cambridge, CB1 2AB',
          phoneNumber: '07700 900123',
          emergencyContact: 'James Johnson (Son): 07700 900456',
          riskLevel: 'medium' as const,
          activeCarePlans: 3,
          upcomingAppointments: 5,
          lastVisit: 'Yesterday, 18:30',
          nextVisit: 'Today, 08:30',
          pendingTasks: 7,
          completedTasksPercentage: 68
        };
      }
      
      if (activePatientId === 2) {
        return {
          id: 2,
          uniqueId: 'SU10002',
          fullName: 'Robert Wilson',
          dateOfBirth: '1953-09-28',
          age: 70,
          address: '15 Maple Avenue, Cambridge, CB2 8PQ',
          phoneNumber: '07700 900789',
          emergencyContact: 'Susan Wilson (Daughter): 07700 900321',
          riskLevel: 'high' as const,
          activeCarePlans: 4,
          upcomingAppointments: 8,
          lastVisit: 'Today, 09:15',
          nextVisit: 'Today, 17:00',
          pendingTasks: 9,
          completedTasksPercentage: 75
        };
      }
      
      // Default patient data for any other ID
      return {
        id: activePatientId,
        uniqueId: `SU1000${activePatientId}`,
        fullName: 'Sample Patient',
        dateOfBirth: '1950-01-01',
        age: 73,
        address: '1 Example Street, Cambridge, CB1 1AA',
        phoneNumber: '07700 900000',
        emergencyContact: 'Emergency Contact: 07700 900001',
        riskLevel: 'low' as const,
        activeCarePlans: 2,
        upcomingAppointments: 3,
        lastVisit: 'Yesterday, 12:00',
        nextVisit: 'Tomorrow, 10:00',
        pendingTasks: 4,
        completedTasksPercentage: 80
      };
    }
  });
  
  const handlePatientSelect = (id: number) => {
    setActivePatientId(id);
  };
  
  return (
    <div>
      {/* Show patient search if no patient is selected */}
      {!activePatientId && (
        <PatientSearch onSelect={handlePatientSelect} />
      )}
      
      {/* Show patient details once selected */}
      {activePatientId && patientSummary && (
        <>
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setActivePatientId(null)}
              className="flex items-center gap-1 px-2"
            >
              ← Back to Search
            </Button>
          </div>
          
          <PatientHeader patient={patientSummary} />
          <PatientStats patient={patientSummary} />
          
          <Tabs defaultValue="care-plans" className="mb-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="care-plans" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Care Plans
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Appointments
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Health Metrics
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Risk Assessments
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="care-plans">
              <PatientCarePlans patientId={activePatientId} />
            </TabsContent>
            
            <TabsContent value="appointments">
              <PatientAppointments patientId={activePatientId} />
            </TabsContent>
            
            <TabsContent value="health">
              <PatientHealthMetrics patientId={activePatientId} />
            </TabsContent>
            
            <TabsContent value="risks">
              <PatientRiskAssessments patientId={activePatientId} />
            </TabsContent>
            
            <TabsContent value="notes">
              <PatientNotes patientId={activePatientId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}