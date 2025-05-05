import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  MoreHorizontal,
  Award,
  Home,
  UserCheck,
  Star,
  Clock4
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data types - these would normally be defined in schema.ts
interface Staff {
  id: number;
  name: string;
  role: string;
  qualifications: string[];
  availability: string;
  image?: string;
  status: 'available' | 'busy' | 'unavailable';
  location: string;
  maxHoursPerWeek: number;
  currentHours: number;
}

interface ServiceUserVisit {
  id: number;
  serviceUserId: number;
  serviceUserName: string;
  address: string;
  time: string;
  duration: string;
  status: 'allocated' | 'unallocated' | 'completed';
  staffId?: number;
  staffName?: string;
  requiresQualifications: string[];
  visitType: string;
  notes?: string;
}

export default function CareAllocationPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedServiceUser, setSelectedServiceUser] = useState<number | null>(null);
  
  // Simulating fetching data with React Query
  const { data: staff = mockStaff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['/api/staff'],
    // In a real app, this would be an actual API call
    queryFn: () => Promise.resolve(mockStaff)
  });
  
  const { data: visits = mockVisits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['/api/visits', format(selectedDate, 'yyyy-MM-dd')],
    // In a real app, this would be an actual API call
    queryFn: () => Promise.resolve(mockVisits)
  });
  
  // Filter staff based on search query
  const filteredStaff = searchQuery
    ? staff.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.qualifications.some(q => q.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : staff;
  
  // Calculate allocation stats
  const totalVisits = visits.length;
  const allocatedVisits = visits.filter(v => v.status === 'allocated').length;
  const unallocatedVisits = visits.filter(v => v.status === 'unallocated').length;
  const allocationPercentage = totalVisits > 0 ? Math.round((allocatedVisits / totalVisits) * 100) : 0;
  
  // Handle staff selection
  const handleStaffSelect = (staffId: number) => {
    setSelectedStaff(staffId === selectedStaff ? null : staffId);
  };
  
  // Handle service user visit selection
  const handleVisitSelect = (visitId: number) => {
    setSelectedServiceUser(visitId === selectedServiceUser ? null : visitId);
  };
  
  // Handle allocation
  const handleAllocate = (staffId: number, visitId: number) => {
    // In a real app, this would be an API call
    console.log(`Allocating staff ${staffId} to visit ${visitId}`);
    alert(`In a real implementation, this would allocate staff #${staffId} to visit #${visitId}`);
  };
  
  // Handle auto-allocation
  const handleAutoAllocate = () => {
    // In a real app, this would be an API call
    console.log('Auto-allocating visits');
    alert('In a real implementation, this would automatically allocate all unallocated visits based on predefined rules');
  };
  
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Care Allocation"
          description="Intelligently allocate care staff to service users"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}>
                {view === 'calendar' ? (
                  <>
                    <Users className="h-4 w-4 mr-2" /> 
                    Staff View
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4 mr-2" /> 
                    Calendar View
                  </>
                )}
              </Button>
              <Button onClick={handleAutoAllocate}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Auto-Allocate
              </Button>
            </div>
          }
        />
        
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                  <h4 className="text-2xl font-bold">{totalVisits}</h4>
                </div>
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allocated</p>
                  <h4 className="text-2xl font-bold">{allocatedVisits}</h4>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unallocated</p>
                  <h4 className="text-2xl font-bold">{unallocatedVisits}</h4>
                </div>
                <AlertTriangle className={`h-8 w-8 ${unallocatedVisits > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allocation Rate</p>
                  <h4 className="text-2xl font-bold">{allocationPercentage}%</h4>
                </div>
                <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{
                    borderColor: allocationPercentage >= 90 
                      ? 'rgb(34, 197, 94)' 
                      : allocationPercentage >= 70 
                        ? 'rgb(234, 179, 8)' 
                        : 'rgb(239, 68, 68)',
                    borderLeftColor: 'transparent',
                    transform: `rotate(${allocationPercentage * 3.6}deg)`,
                    transition: 'transform 1s ease-in-out'
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <span className="text-xs font-bold">{allocationPercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff selection panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Available Staff</CardTitle>
              <div className="mt-2">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search staff..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoadingStaff ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No staff members found
                  </div>
                ) : (
                  filteredStaff.map((s) => (
                    <div 
                      key={s.id} 
                      className={`border rounded-lg p-4 transition-colors cursor-pointer hover:bg-accent/50 ${
                        selectedStaff === s.id ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() => handleStaffSelect(s.id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                              s.status === 'available' ? 'bg-green-400' : 
                              s.status === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">{s.role}</p>
                          <div className="mt-1">
                            <div className="flex items-center text-xs">
                              <Clock4 className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>
                                {s.currentHours}/{s.maxHoursPerWeek} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="flex items-center text-xs">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{s.location}</span>
                          </div>
                        </div>
                      </div>
                      {s.qualifications.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.qualifications.map((q, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {q}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Calendar/visits panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                {view === 'calendar' ? 'Allocation Calendar' : 'Unallocated Visits'}
              </CardTitle>
              <div className="flex items-center mt-2">
                <div className="relative w-full md:w-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded border shadow p-3 bg-card absolute top-0 left-0 z-50"
                    classNames={{
                      button: "hover:bg-primary/5",
                      day_today: "bg-primary/10 text-primary font-bold",
                      day_selected: "bg-primary text-primary-foreground",
                    }}
                  />
                  <div className="w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoadingVisits ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No visits scheduled for this date
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group by time slots */}
                    {['Morning', 'Afternoon', 'Evening'].map((timeSlot) => {
                      const timeSlotVisits = visits.filter(v => {
                        const hour = parseInt(v.time.split(':')[0], 10);
                        if (timeSlot === 'Morning') return hour >= 6 && hour < 12;
                        if (timeSlot === 'Afternoon') return hour >= 12 && hour < 18;
                        return hour >= 18 || hour < 6;
                      });
                      
                      if (timeSlotVisits.length === 0) return null;
                      
                      return (
                        <div key={timeSlot}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{timeSlot}</h4>
                          <div className="space-y-3">
                            {timeSlotVisits.map((visit) => (
                              <div 
                                key={visit.id}
                                className={`border rounded-lg p-4 transition-colors ${
                                  visit.status === 'unallocated' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 
                                  visit.status === 'allocated' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : 
                                  'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
                                } ${selectedServiceUser === visit.id ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => handleVisitSelect(visit.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      <h3 className="text-sm font-medium">{visit.serviceUserName}</h3>
                                      <Badge 
                                        variant="outline" 
                                        className={`ml-2 ${
                                          visit.status === 'unallocated' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 
                                          visit.status === 'allocated' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 
                                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                        }`}
                                      >
                                        {visit.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{visit.time} ({visit.duration})</span>
                                    </div>
                                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      <span>{visit.address}</span>
                                    </div>
                                    {visit.staffName && (
                                      <div className="flex items-center mt-1 text-xs">
                                        <UserCheck className="h-3 w-3 mr-1" />
                                        <span className="font-medium">{visit.staffName}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {visit.visitType}
                                  </Badge>
                                </div>
                                
                                {visit.requiresQualifications.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {visit.requiresQualifications.map((q, i) => (
                                      <Badge key={i} variant="outline" className="text-xs flex items-center">
                                        <Award className="h-3 w-3 mr-1" />
                                        {q}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {selectedStaff && visit.status === 'unallocated' && (
                                  <div className="mt-3 border-t pt-3">
                                    <Button
                                      size="sm"
                                      className="w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAllocate(selectedStaff, visit.id);
                                      }}
                                    >
                                      Allocate Selected Staff
                                    </Button>
                                  </div>
                                )}
                                
                                {visit.notes && (
                                  <div className="mt-2 text-xs italic text-muted-foreground">
                                    {visit.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

// Mock data for demonstration
const mockStaff: Staff[] = [
  {
    id: 1,
    name: 'John Smith',
    role: 'Senior Carer',
    qualifications: ['Medication Certified', 'Moving & Handling', 'Dementia Care'],
    availability: 'Full-time',
    status: 'available',
    location: 'North District',
    maxHoursPerWeek: 40,
    currentHours: 32
  },
  {
    id: 2,
    name: 'Sarah Jones',
    role: 'Care Assistant',
    qualifications: ['First Aid', 'Moving & Handling'],
    availability: 'Part-time',
    status: 'busy',
    location: 'Central District',
    maxHoursPerWeek: 25,
    currentHours: 18
  },
  {
    id: 3,
    name: 'Michael Brown',
    role: 'Registered Nurse',
    qualifications: ['RGN', 'IV Therapy', 'Wound Care', 'Medication Certified'],
    availability: 'Full-time',
    status: 'available',
    location: 'South District',
    maxHoursPerWeek: 40,
    currentHours: 28
  },
  {
    id: 4,
    name: 'Emily Wilson',
    role: 'Care Assistant',
    qualifications: ['Moving & Handling', 'Dementia Care'],
    availability: 'Part-time',
    status: 'unavailable',
    location: 'West District',
    maxHoursPerWeek: 20,
    currentHours: 20
  },
  {
    id: 5,
    name: 'David Roberts',
    role: 'Senior Carer',
    qualifications: ['Medication Certified', 'End of Life Care'],
    availability: 'Full-time',
    status: 'available',
    location: 'East District',
    maxHoursPerWeek: 40,
    currentHours: 35
  }
];

const mockVisits: ServiceUserVisit[] = [
  {
    id: 101,
    serviceUserId: 1,
    serviceUserName: 'Elizabeth Johnson',
    address: '123 High Street, London',
    time: '08:00',
    duration: '45 mins',
    status: 'allocated',
    staffId: 1,
    staffName: 'John Smith',
    requiresQualifications: ['Medication Certified', 'Moving & Handling'],
    visitType: 'Morning Care',
    notes: 'Requires assistance with medication and personal care'
  },
  {
    id: 102,
    serviceUserId: 1,
    serviceUserName: 'Elizabeth Johnson',
    address: '123 High Street, London',
    time: '12:30',
    duration: '30 mins',
    status: 'unallocated',
    requiresQualifications: ['Medication Certified'],
    visitType: 'Lunch Time Care',
    notes: 'Meal preparation and medication'
  },
  {
    id: 103,
    serviceUserId: 1,
    serviceUserName: 'Elizabeth Johnson',
    address: '123 High Street, London',
    time: '17:00',
    duration: '45 mins',
    status: 'allocated',
    staffId: 2,
    staffName: 'Sarah Jones',
    requiresQualifications: ['Moving & Handling'],
    visitType: 'Evening Care'
  },
  {
    id: 104,
    serviceUserId: 2,
    serviceUserName: 'Robert Wilson',
    address: '45 Church Road, Birmingham',
    time: '09:00',
    duration: '60 mins',
    status: 'allocated',
    staffId: 3,
    staffName: 'Michael Brown',
    requiresQualifications: ['Moving & Handling', 'Medication Certified'],
    visitType: 'Morning Care'
  },
  {
    id: 105,
    serviceUserId: 2,
    serviceUserName: 'Robert Wilson',
    address: '45 Church Road, Birmingham',
    time: '18:00',
    duration: '45 mins',
    status: 'unallocated',
    requiresQualifications: ['Moving & Handling', 'Medication Certified'],
    visitType: 'Evening Care',
    notes: 'Requires two carers - allocate second carer'
  }
];