import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Area,
  AreaChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  CogIcon,
  Cpu,
  Edit,
  Filter,
  Info,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock3,
  Timer,
  Undo,
  UserPlus,
  Users,
  X,
  ArrowLeftRight,
  ArrowRight,
  Activity,
  AlertTriangle,
} from 'lucide-react';

// Sample data for care visits
const careVisits = [
  { 
    id: 1, 
    serviceUser: 'John Smith', 
    address: '12 Oak Street, London', 
    time: '09:00 - 09:45', 
    duration: 45, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Medication', 'Personal Care', 'Mobility Assistance'],
    status: 'scheduled',
    preference: 'morning',
    priority: 'high',
    complexity: 'medium',
    travelTime: 15,
    optimized: true
  },
  { 
    id: 2, 
    serviceUser: 'Mary Johnson', 
    address: '45 Maple Avenue, London', 
    time: '10:15 - 11:00', 
    duration: 45, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Meal Preparation', 'Medication', 'Housekeeping'],
    status: 'scheduled',
    preference: 'morning',
    priority: 'medium',
    complexity: 'low',
    travelTime: 20,
    optimized: true
  },
  { 
    id: 3, 
    serviceUser: 'Robert Davis', 
    address: '8 Pine Road, London', 
    time: '11:30 - 12:15', 
    duration: 45, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Personal Care', 'Feeding', 'Medication'],
    status: 'scheduled',
    preference: 'midday',
    priority: 'high',
    complexity: 'high',
    travelTime: 15,
    optimized: true
  },
  { 
    id: 4, 
    serviceUser: 'Patricia Miller', 
    address: '23 Elm Street, London', 
    time: '13:30 - 14:15', 
    duration: 45, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Personal Care', 'Mobility Assistance'],
    status: 'scheduled',
    preference: 'afternoon',
    priority: 'medium',
    complexity: 'medium',
    travelTime: 25,
    optimized: true
  },
  { 
    id: 5, 
    serviceUser: 'James Wilson', 
    address: '57 Cedar Lane, London', 
    time: '15:00 - 16:00', 
    duration: 60, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Medication', 'Companionship', 'Light Exercise'],
    status: 'scheduled',
    preference: 'afternoon',
    priority: 'low',
    complexity: 'low',
    travelTime: 15,
    optimized: true
  },
  { 
    id: 6, 
    serviceUser: 'Linda Harris', 
    address: '92 Birch Road, London', 
    time: '16:30 - 17:15', 
    duration: 45, 
    caregivers: ['Emma Wilson'], 
    requirements: ['Medication', 'Personal Care', 'Light Housekeeping'],
    status: 'scheduled',
    preference: 'evening',
    priority: 'medium',
    complexity: 'medium',
    travelTime: 15,
    optimized: true
  },
  { 
    id: 7, 
    serviceUser: 'William Thompson', 
    address: '15 Aspen Court, London', 
    time: '?', 
    duration: 60, 
    caregivers: ['Unassigned'], 
    requirements: ['Dementia Care', 'Personal Care', 'Medication'],
    status: 'unscheduled',
    preference: 'morning',
    priority: 'high',
    complexity: 'high',
    travelTime: null,
    optimized: false
  },
  { 
    id: 8, 
    serviceUser: 'Elizabeth Jackson', 
    address: '38 Redwood Drive, London', 
    time: '?', 
    duration: 45, 
    caregivers: ['Unassigned'], 
    requirements: ['Medication', 'Personal Care'],
    status: 'unscheduled',
    preference: 'afternoon',
    priority: 'medium',
    complexity: 'medium',
    travelTime: null,
    optimized: false
  },
  { 
    id: 9, 
    serviceUser: 'Michael Brown', 
    address: '64 Willow Street, London', 
    time: '?', 
    duration: 30, 
    caregivers: ['Unassigned'], 
    requirements: ['Medication Check', 'Blood Pressure Monitoring'],
    status: 'unscheduled',
    preference: 'any',
    priority: 'low',
    complexity: 'low',
    travelTime: null,
    optimized: false
  }
];

// Sample data for caregivers
const caregivers = [
  {
    id: 1,
    name: 'Emma Wilson',
    availability: '08:00 - 18:00',
    skills: ['Medication Administration', 'Personal Care', 'Dementia Care', 'Mobility Assistance'],
    capacity: 7,
    assigned: 6,
    status: 'active',
    workingHours: 8,
    preferences: 'Central London'
  },
  {
    id: 2,
    name: 'Michael Brown',
    availability: '09:00 - 17:00',
    skills: ['Personal Care', 'Meal Preparation', 'Light Housekeeping', 'Companionship'],
    capacity: 6,
    assigned: 0,
    status: 'active',
    workingHours: 8,
    preferences: 'North London'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    availability: '07:00 - 15:00',
    skills: ['Medication Administration', 'Personal Care', 'Dementia Care', 'First Aid'],
    capacity: 7,
    assigned: 0,
    status: 'active',
    workingHours: 8,
    preferences: 'East London'
  },
  {
    id: 4,
    name: 'David Thompson',
    availability: '12:00 - 20:00',
    skills: ['Personal Care', 'Mobility Assistance', 'Feeding', 'Medication Administration'],
    capacity: 6,
    assigned: 0,
    status: 'active',
    workingHours: 8,
    preferences: 'West London'
  },
  {
    id: 5,
    name: 'Jessica Martinez',
    availability: '08:00 - 16:00',
    skills: ['Personal Care', 'Dementia Care', 'Companionship', 'Meal Preparation'],
    capacity: 7,
    assigned: 0,
    status: 'active',
    workingHours: 8,
    preferences: 'South London'
  }
];

// Scheduling metrics data
const schedulingMetrics = [
  { name: 'Monday', travelTime: 135, efficiency: 75, coverage: 92 },
  { name: 'Tuesday', travelTime: 120, efficiency: 80, coverage: 95 },
  { name: 'Wednesday', travelTime: 145, efficiency: 72, coverage: 90 },
  { name: 'Thursday', travelTime: 115, efficiency: 82, coverage: 96 },
  { name: 'Friday', travelTime: 125, efficiency: 78, coverage: 94 },
  { name: 'Saturday', travelTime: 140, efficiency: 74, coverage: 85 },
  { name: 'Sunday', travelTime: 150, efficiency: 70, coverage: 80 },
];

// Optimization metrics
const optimizationMetrics = [
  { name: 'Travel Time', before: 210, after: 125, unit: 'minutes' },
  { name: 'Visit Efficiency', before: 65, after: 84, unit: 'percent' },
  { name: 'Care Continuity', before: 70, after: 92, unit: 'percent' },
  { name: 'Staff Satisfaction', before: 68, after: 85, unit: 'percent' },
  { name: 'Client Preference Match', before: 75, after: 90, unit: 'percent' },
];

// Care continuity data
const continuityData = [
  { name: 'John Smith', primary: 85, secondary: 15 },
  { name: 'Mary Johnson', primary: 92, secondary: 8 },
  { name: 'Robert Davis', primary: 78, secondary: 22 },
  { name: 'Patricia Miller', primary: 90, secondary: 10 },
  { name: 'James Wilson', primary: 95, secondary: 5 },
  { name: 'Linda Harris', primary: 82, secondary: 18 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AIScheduling() {
  const [selectedDate, setSelectedDate] = useState<string>('2025-05-05');
  const [caregiver, setCaregiver] = useState<string>('all');
  const [optimizationStatus, setOptimizationStatus] = useState<string>('idle'); // 'idle', 'running', 'complete'
  const [showOptimizationResults, setShowOptimizationResults] = useState<boolean>(false);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [scheduledVisits, setScheduledVisits] = useState(careVisits.filter(visit => visit.status === 'scheduled'));
  const [unscheduledVisits, setUnscheduledVisits] = useState(careVisits.filter(visit => visit.status === 'unscheduled'));
  const [showAIConfigDialog, setShowAIConfigDialog] = useState<boolean>(false);
  const [aiConfigOptions, setAiConfigOptions] = useState({
    prioritizeClientPreference: true,
    prioritizeContinuity: true,
    minimizeTravelTime: true,
    equalWorkloadDistribution: true,
    skillMatching: true,
    timeWindowConstraints: true,
  });
  
  // Function to run AI optimization
  const runAIOptimization = () => {
    setOptimizationStatus('running');
    setOptimizationProgress(0);
    
    // Simulate optimization progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOptimizationStatus('complete');
          setShowOptimizationResults(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  
  // Function to accept AI recommendations
  const acceptRecommendations = () => {
    // In a real app, this would save the optimized schedule to the database
    setShowOptimizationResults(false);
    
    // Simulate updating the schedule
    const newScheduled = [...scheduledVisits];
    const remainingUnscheduled = unscheduledVisits.filter(visit => 
      visit.id !== 7 && visit.id !== 8
    );
    
    // Add the newly scheduled visits
    newScheduled.push({
      ...unscheduledVisits.find(v => v.id === 7)!,
      time: '08:00 - 09:00',
      caregivers: ['Sarah Johnson'],
      status: 'scheduled',
      travelTime: 15,
      optimized: true
    });
    
    newScheduled.push({
      ...unscheduledVisits.find(v => v.id === 8)!,
      time: '09:30 - 10:15',
      caregivers: ['Sarah Johnson'],
      status: 'scheduled',
      travelTime: 20,
      optimized: true
    });
    
    setScheduledVisits(newScheduled);
    setUnscheduledVisits(remainingUnscheduled);
  };
  
  // Function to decline AI recommendations
  const declineRecommendations = () => {
    setShowOptimizationResults(false);
    setOptimizationStatus('idle');
  };
  
  // Filter visits based on caregiver selection
  const filteredScheduledVisits = caregiver === 'all' 
    ? scheduledVisits 
    : scheduledVisits.filter(visit => visit.caregivers.includes(caregiver));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI-Powered Scheduling</h1>
          <p className="text-muted-foreground">Optimize care schedules with advanced AI algorithms</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative w-full sm:w-auto">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              className="pl-8"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <Select
            value={caregiver}
            onValueChange={setCaregiver}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Caregiver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Caregivers</SelectItem>
              {caregivers.map(cg => (
                <SelectItem key={cg.id} value={cg.name}>{cg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="continuity">Care Continuity</TabsTrigger>
        </TabsList>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold">Current Schedule</h2>
            <div className="flex space-x-2 mt-2 md:mt-0">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowAIConfigDialog(true)}>
                <Settings className="h-4 w-4" />
                <span>AI Settings</span>
              </Button>
              <Button 
                className="flex items-center gap-2" 
                onClick={runAIOptimization}
                disabled={optimizationStatus === 'running' || unscheduledVisits.length === 0}
              >
                {optimizationStatus === 'running' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Optimize Schedule</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {optimizationStatus === 'running' && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>AI Optimization in Progress</span>
                    <span>{optimizationProgress}%</span>
                  </div>
                  <Progress value={optimizationProgress} />
                  <div className="text-xs text-muted-foreground mt-1">
                    The AI is analyzing care requirements, caregiver skills, travel routes, and optimizing the schedule...
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scheduled Visits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Scheduled Visits ({filteredScheduledVisits.length})</CardTitle>
              <CardDescription>
                Care visits that have been assigned to caregivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Service User</TableHead>
                      <TableHead>Caregiver</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Travel</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScheduledVisits.length > 0 ? (
                      filteredScheduledVisits.map(visit => (
                        <TableRow key={visit.id} className={visit.optimized ? 'bg-primary-50' : ''}>
                          <TableCell className="font-medium">{visit.time}</TableCell>
                          <TableCell>
                            <div>
                              <div>{visit.serviceUser}</div>
                              <div className="text-xs text-gray-500">{visit.address}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.caregivers.map(cg => (
                              <Badge key={cg} variant="outline" className="mr-1">{cg}</Badge>
                            ))}
                          </TableCell>
                          <TableCell>{visit.duration} min</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {visit.requirements.map((req, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                visit.optimized 
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }
                            >
                              {visit.optimized ? 'Optimized' : 'Standard'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visit.travelTime && (
                              <span className="text-sm text-gray-500">{visit.travelTime} min</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No scheduled visits found for the selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Unscheduled Visits */}
          {unscheduledVisits.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Unscheduled Visits ({unscheduledVisits.length})</CardTitle>
                <CardDescription>
                  Care visits that need to be scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service User</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Preference</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unscheduledVisits.map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{visit.serviceUser}</div>
                            <div className="text-xs text-gray-500">{visit.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>{visit.duration} min</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {visit.requirements.map((req, i) => (
                              <span key={i} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                {req}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {visit.preference}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              visit.priority === 'high' 
                                ? "bg-rose-100 text-rose-800 hover:bg-rose-200" 
                                : visit.priority === 'medium'
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            }
                          >
                            {visit.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Schedule Manually
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* OPTIMIZATION TAB */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Optimization Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Optimization Metrics</CardTitle>
                <CardDescription>
                  Performance improvements with AI-powered scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={optimizationMetrics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          const unit = optimizationMetrics.find(m => 
                            name === 'before' ? m.before === value : m.after === value
                          )?.unit;
                          return [`${value} ${unit}`, name === 'before' ? 'Before Optimization' : 'After Optimization'];
                        }}
                      />
                      <Legend />
                      <Bar name="Before Optimization" dataKey="before" fill="#8884d8" />
                      <Bar name="After Optimization" dataKey="after" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Controls</CardTitle>
                <CardDescription>
                  Configure and run AI scheduling optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="optimization-level">Optimization Level</Label>
                    <span className="text-sm text-primary">Advanced</span>
                  </div>
                  <Progress value={90} id="optimization-level" />
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-medium">Optimization Priorities</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pref" checked={aiConfigOptions.prioritizeClientPreference} 
                        onCheckedChange={(checked) => 
                          setAiConfigOptions({...aiConfigOptions, prioritizeClientPreference: !!checked})
                        } 
                      />
                      <label htmlFor="pref" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Client preferences
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="continuity" checked={aiConfigOptions.prioritizeContinuity} 
                        onCheckedChange={(checked) => 
                          setAiConfigOptions({...aiConfigOptions, prioritizeContinuity: !!checked})
                        } 
                      />
                      <label htmlFor="continuity" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Care continuity
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="travel" checked={aiConfigOptions.minimizeTravelTime} 
                        onCheckedChange={(checked) => 
                          setAiConfigOptions({...aiConfigOptions, minimizeTravelTime: !!checked})
                        } 
                      />
                      <label htmlFor="travel" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Minimize travel time
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="workload" checked={aiConfigOptions.equalWorkloadDistribution} 
                        onCheckedChange={(checked) => 
                          setAiConfigOptions({...aiConfigOptions, equalWorkloadDistribution: !!checked})
                        } 
                      />
                      <label htmlFor="workload" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Equal workload distribution
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    className="w-full flex items-center gap-2" 
                    onClick={runAIOptimization}
                    disabled={optimizationStatus === 'running'}
                  >
                    {optimizationStatus === 'running' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Optimizing Schedule...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Run AI Optimization</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">How It Works</h4>
                  <p className="text-xs text-muted-foreground">
                    Our AI scheduling system analyzes thousands of combinations to find the optimal schedule. 
                    It considers service user preferences, caregiver skills, travel routes, and care continuity 
                    to create the most efficient schedule.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary-100">
                    <Clock className="h-4 w-4 text-primary-700" />
                  </div>
                  <CardTitle className="text-base">Smart Time Allocation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI analyzes client needs and historical visit durations to allocate the optimal time for 
                  each visit, ensuring all care needs are met without rushing or excessive gaps.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary-100">
                    <MapPin className="h-4 w-4 text-primary-700" />
                  </div>
                  <CardTitle className="text-base">Route Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms calculate the most efficient routes between visits, 
                  reducing travel time by up to 40% and increasing the time caregivers can spend with clients.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary-100">
                    <UserPlus className="h-4 w-4 text-primary-700" />
                  </div>
                  <CardTitle className="text-base">Skill-Based Matching</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The system matches caregivers to clients based on required skills, client preferences, 
                  and relationship history, ensuring the highest quality of care for each client.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule Efficiency</CardTitle>
              <CardDescription>
                Compare scheduling performance across the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={schedulingMetrics}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="travelTime" 
                      name="Travel Time (min)" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="efficiency" 
                      name="Efficiency (%)" 
                      stroke="#82ca9d" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="coverage" 
                      name="Coverage (%)" 
                      stroke="#ffc658" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Travel Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18 min</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    40% reduction
                  </span>{" "}
                  with optimization
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Care Time Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    of time spent on care
                  </span>{" "}
                  vs. travel
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Schedule Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    visits on time
                  </span>{" "}
                  with AI scheduling
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Caregiver Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    optimal workload balance
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
              <CardDescription>
                Visual representation of caregiver workload and capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={caregivers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar name="Assigned Visits" dataKey="assigned" fill="#8884d8" />
                    <Bar name="Capacity" dataKey="capacity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Smart analysis of your current scheduling patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Clock3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Peak Time Redistribution</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        AI analysis shows a high concentration of visits between 10:00-11:30 AM. Redistributing 3 non-critical visits 
                        to the 2:00-4:00 PM window could improve overall schedule balance and reduce morning rush.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Geographic Clustering</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        We've identified an opportunity to group visits in the West London area more efficiently. 
                        Reassigning caregiver David Thompson to this cluster could reduce travel time by approximately 45 minutes per day.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Skill Optimization</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Sarah Johnson's specialized dementia care skills are underutilized in the current schedule. 
                        Reassigning her to service users with dementia care needs could improve care quality while 
                        better utilizing available staff expertise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CARE CONTINUITY TAB */}
        <TabsContent value="continuity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Care Continuity Analysis</CardTitle>
                <CardDescription>
                  Percentage of care provided by primary vs. secondary caregivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={continuityData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="primary" name="Primary Caregiver" stackId="a" fill="#8884d8" />
                      <Bar dataKey="secondary" name="Secondary Caregivers" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Continuity Score</CardTitle>
                <CardDescription>
                  Overall care continuity performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Consistent', value: 87 },
                            { name: 'Inconsistent', value: 13 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell key="cell-0" fill="#4CAF50" />
                          <Cell key="cell-1" fill="#F5F5F5" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold">87%</span>
                      <span className="text-xs text-muted-foreground">Continuity Score</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-emerald-500"></div>
                      <span>Target: 85%</span>
                    </div>
                    <span className="text-emerald-500">+2%</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Care continuity measures how consistently the same caregivers visit the same service users.</p>
                    <p className="mt-1">Your score is above the target threshold of 85%, which is excellent for building relationships and maintaining quality of care.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Relationship Strength */}
          <Card>
            <CardHeader>
              <CardTitle>Caregiver-Client Relationship Map</CardTitle>
              <CardDescription>
                Visual representation of relationship strength and frequency of care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service User</TableHead>
                        {caregivers.map(cg => (
                          <TableHead key={cg.id}>{cg.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['John Smith', 'Mary Johnson', 'Robert Davis', 'Patricia Miller', 'James Wilson', 'Linda Harris'].map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{user}</TableCell>
                          {caregivers.map((cg, j) => {
                            // Generate synthetic relationship data
                            let strength = 0;
                            if (i === 0 && j === 0) strength = 95; // Emma & John
                            else if (i === 1 && j === 0) strength = 90; // Emma & Mary
                            else if (i === 2 && j === 0) strength = 85; // Emma & Robert
                            else if (i === 3 && j === 0) strength = 92; // Emma & Patricia
                            else if (i === 4 && j === 0) strength = 88; // Emma & James
                            else if (i === 5 && j === 0) strength = 78; // Emma & Linda
                            else if (i === 0 && j === 2) strength = 45; // Sarah & John
                            else if (i === 2 && j === 2) strength = 65; // Sarah & Robert
                            else if (i === 4 && j === 3) strength = 55; // David & James
                            else if (i === 5 && j === 4) strength = 48; // Jessica & Linda
                            
                            let bgColor = 'bg-gray-100';
                            if (strength > 90) bgColor = 'bg-green-200';
                            else if (strength > 75) bgColor = 'bg-green-100';
                            else if (strength > 50) bgColor = 'bg-blue-100';
                            else if (strength > 0) bgColor = 'bg-gray-200';
                            
                            return (
                              <TableCell key={j}>
                                {strength > 0 ? (
                                  <div className="flex items-center justify-center">
                                    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-sm font-medium`}>
                                      {strength}%
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-10"></div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-200 mr-1"></div>
                  <span className="text-xs">Strong (90%+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-100 mr-1"></div>
                  <span className="text-xs">Good (75-90%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-100 mr-1"></div>
                  <span className="text-xs">Developing (50-75%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-200 mr-1"></div>
                  <span className="text-xs">Limited (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Configuration Dialog */}
      <Dialog open={showAIConfigDialog} onOpenChange={setShowAIConfigDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>AI Scheduling Configuration</DialogTitle>
            <DialogDescription>
              Customize the AI optimization parameters to match your care delivery priorities
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Optimization Priorities</h4>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pref-dialog" checked={aiConfigOptions.prioritizeClientPreference} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, prioritizeClientPreference: !!checked})
                    } 
                  />
                  <label htmlFor="pref-dialog" className="text-sm leading-none">
                    Client Preferences
                  </label>
                </div>
                <Select defaultValue="high">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="continuity-dialog" checked={aiConfigOptions.prioritizeContinuity} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, prioritizeContinuity: !!checked})
                    } 
                  />
                  <label htmlFor="continuity-dialog" className="text-sm leading-none">
                    Care Continuity
                  </label>
                </div>
                <Select defaultValue="high">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="travel-dialog" checked={aiConfigOptions.minimizeTravelTime} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, minimizeTravelTime: !!checked})
                    } 
                  />
                  <label htmlFor="travel-dialog" className="text-sm leading-none">
                    Minimize Travel Time
                  </label>
                </div>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="workload-dialog" checked={aiConfigOptions.equalWorkloadDistribution} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, equalWorkloadDistribution: !!checked})
                    } 
                  />
                  <label htmlFor="workload-dialog" className="text-sm leading-none">
                    Equal Workload Distribution
                  </label>
                </div>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="skills-dialog" checked={aiConfigOptions.skillMatching} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, skillMatching: !!checked})
                    } 
                  />
                  <label htmlFor="skills-dialog" className="text-sm leading-none">
                    Skill Matching
                  </label>
                </div>
                <Select defaultValue="high">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="time-window-dialog" checked={aiConfigOptions.timeWindowConstraints} 
                    onCheckedChange={(checked) => 
                      setAiConfigOptions({...aiConfigOptions, timeWindowConstraints: !!checked})
                    } 
                  />
                  <label htmlFor="time-window-dialog" className="text-sm leading-none">
                    Time Window Constraints
                  </label>
                </div>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Advanced Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="max-travel">Max Travel Time</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="max-travel">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="preferred-client-match">Client-Caregiver Match</Label>
                  <Select defaultValue="preferred">
                    <SelectTrigger id="preferred-client-match">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict</SelectItem>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAIConfigDialog(false)}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimization Results Dialog */}
      <Dialog open={showOptimizationResults} onOpenChange={setShowOptimizationResults}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Optimization Results</DialogTitle>
            <DialogDescription>
              The AI has generated an optimized schedule with the following changes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium flex items-center text-primary-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Optimization Summary
              </h3>
              <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-700">45 min</div>
                  <p className="text-xs text-muted-foreground">Travel Time Saved</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-700">+2</div>
                  <p className="text-xs text-muted-foreground">Additional Visits Scheduled</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-700">90%</div>
                  <p className="text-xs text-muted-foreground">Client Preferences Met</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Schedule Changes</h4>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">William Thompson</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Scheduled: 08:00 - 09:00 with Sarah Johnson
                      </div>
                      <div className="flex items-center text-xs text-emerald-600 mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Matches client's morning preference
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">High Priority</Badge>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Elizabeth Jackson</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Scheduled: 09:30 - 10:15 with Sarah Johnson
                      </div>
                      <div className="flex items-center text-xs text-emerald-600 mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Optimized travel route (15 min from previous visit)
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Medium Priority</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Travel Optimization</h4>
              <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                <p>The AI has optimized travel routes, reducing total daily travel time by 45 minutes.</p>
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">40% reduction</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Remaining Unscheduled Visit</h4>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="text-sm">
                  <span className="font-medium">Michael Brown</span>
                  <span className="text-muted-foreground"> - No suitable time slot found within constraints</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button 
              variant="outline" 
              className="mb-2 sm:mb-0 flex items-center" 
              onClick={declineRecommendations}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <div className="flex flex-col sm:flex-row sm:space-x-2">
              <Button 
                variant="outline" 
                className="mb-2 sm:mb-0" 
                onClick={() => setShowOptimizationResults(false)}
              >
                Review Later
              </Button>
              <Button 
                onClick={acceptRecommendations}
                className="flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept All Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}