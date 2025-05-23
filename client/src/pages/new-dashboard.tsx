import React, { useState, useEffect } from 'react';
import {
  CircleAlert,
  Clock,
  ClipboardCheck,
  Users,
  Calendar,
  ListChecks,
  MapPin,
  BarChart4,
  AlertTriangle,
  CheckCircle,
  UserCog,
  Layers,
  ExternalLink,
  ChevronRight,
  PoundSterling,
  Shield,
  Pill,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Heart,
  MessageSquare,
  User,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { AllocationMethodsCard } from '@/components/care-allocation/allocation-methods-card';
import { SmartAllocationAssistant } from '@/components/care-allocation/smart-allocation-assistant';
import { InteractiveMap } from '@/components/care-allocation/interactive-map';
import { AllocationAnalytics } from '@/components/care-allocation/allocation-analytics';
import { BulkAllocation } from '@/components/care-allocation/bulk-allocation';
import { PayrollTracking } from '@/components/admin/payroll-tracking';
import { PatientOverview } from '@/components/care-coordinator/patient-overview';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// Type definitions
interface UrgentAllocation {
  id: number;
  serviceUserName: string;
  careType: string;
  dateTime: string;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  reason: string;
}

interface StaffAlert {
  id: number;
  staffName: string;
  type: 'absence' | 'lateness' | 'unconfirmed';
  timeReported: string;
  affectedVisits: number;
  status: 'pending' | 'resolved';
}

interface ServiceUserAlert {
  id: number;
  serviceUserName: string;
  type: 'missed-medication' | 'fall' | 'emergency-contact' | 'hospital-admission';
  timeReported: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'resolved';
}

interface CareMetric {
  id: string;
  name: string;
  value: number | string;
  target: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// The Care Coordinator Dashboard component
export default function CareCoordinatorDashboard() {
  const [dateFilter, setDateFilter] = useState('today');
  const [urgentAlertsFilter, setUrgentAlertsFilter] = useState('all');

  // Fetch dashboard stats - in a real app, this would come from the API
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/coordinator-stats', dateFilter],
    // In a real app, this would use the queryFn from the queryClient
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        careHours: '248.5',
        serviceUsersCount: 45,
        carePlanCompliance: '94%',
        staffAvailability: '89%',
        openAllocations: 7,
        cqcMetrics: {
          safe: 92,
          effective: 87,
          caring: 95,
          responsive: 91,
          wellLed: 88
        }
      };
    }
  });

  // Fetch urgent allocations data
  const { data: urgentAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['/api/coordinator/urgent-allocations'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sample data - in a real app, this would come from the API
      return [
        {
          id: 1,
          serviceUserName: 'Elizabeth Johnson',
          careType: 'Personal Care',
          dateTime: 'Today, 14:30',
          priority: 'high' as const,
          attempts: 3,
          reason: 'Staff absence'
        },
        {
          id: 2,
          serviceUserName: 'Robert Wilson',
          careType: 'Medication Support',
          dateTime: 'Today, 17:00',
          priority: 'high' as const,
          attempts: 2,
          reason: 'No available staff with medication training'
        },
        {
          id: 3,
          serviceUserName: 'Mary Thompson',
          careType: 'Meal Preparation',
          dateTime: 'Tomorrow, 12:00',
          priority: 'medium' as const,
          attempts: 1,
          reason: 'Schedule conflict'
        },
        {
          id: 4,
          serviceUserName: 'James Lewis',
          careType: 'Mobility Support',
          dateTime: 'Tomorrow, 09:15',
          priority: 'medium' as const,
          attempts: 1,
          reason: 'Special skills required'
        },
        {
          id: 5,
          serviceUserName: 'Sarah Adams',
          careType: 'Social Visit',
          dateTime: 'Tomorrow, 15:45',
          priority: 'low' as const,
          attempts: 1,
          reason: 'Rural location'
        }
      ];
    }
  });

  // Fetch staff alerts
  const { data: staffAlerts, isLoading: staffAlertsLoading } = useQuery({
    queryKey: ['/api/coordinator/staff-alerts'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 900));

      return [
        {
          id: 1,
          staffName: 'Michael Brown',
          type: 'absence' as const,
          timeReported: '07:15 AM',
          affectedVisits: 4,
          status: 'pending' as const
        },
        {
          id: 2,
          staffName: 'Sarah Jones',
          type: 'lateness' as const,
          timeReported: '08:30 AM',
          affectedVisits: 1,
          status: 'pending' as const
        },
        {
          id: 3,
          staffName: 'David Clark',
          type: 'unconfirmed' as const,
          timeReported: 'N/A',
          affectedVisits: 3,
          status: 'pending' as const
        }
      ];
    }
  });

  // Fetch service user alerts
  const { data: serviceUserAlerts, isLoading: serviceUserAlertsLoading } = useQuery({
    queryKey: ['/api/coordinator/service-user-alerts'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 850));

      return [
        {
          id: 1,
          serviceUserName: 'Elizabeth Johnson',
          type: 'missed-medication' as const,
          timeReported: '09:45 AM',
          priority: 'high' as const,
          status: 'in-progress' as const
        },
        {
          id: 2,
          serviceUserName: 'Robert Wilson',
          type: 'fall' as const,
          timeReported: '08:20 AM',
          priority: 'critical' as const,
          status: 'in-progress' as const
        }
      ];
    }
  });

  // Fetch key metrics
  const { data: careMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/coordinator/care-metrics'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 750));

      return [
        {
          id: 'missed_visits',
          name: 'Missed Visits',
          value: '2.1%',
          target: 3,
          change: -0.5,
          trend: 'down' as const
        },
        {
          id: 'late_visits',
          name: 'Late Visits',
          value: '8.3%',
          target: 10,
          change: 1.2,
          trend: 'up' as const
        },
        {
          id: 'medication_compliance',
          name: 'Medication Compliance',
          value: '97.5%',
          target: 95,
          change: 0.8,
          trend: 'up' as const
        },
        {
          id: 'care_plan_reviews',
          name: 'Care Plan Reviews',
          value: '92%',
          target: 90,
          change: -0.3,
          trend: 'stable' as const
        }
      ];
    }
  });

  // Filter urgent allocations based on selected filter
  const filteredUrgentAllocations = urgentAllocations?.filter(allocation => {
    if (urgentAlertsFilter === 'all') return true;
    return allocation.priority === urgentAlertsFilter;
  });

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Coordinator Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of care delivery operations and urgent alerts
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
              window.location.reload();
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="mb-6">
        <DashboardStats
          careHours={dashboardStats?.careHours || '0'}
          serviceUsersCount={dashboardStats?.serviceUsersCount || 0}
          carePlanCompliance={dashboardStats?.carePlanCompliance || '0%'}
          isLoading={statsLoading}
        />
      </div>

      {/* Tabs for different dashboard sections */}
      <Tabs defaultValue="urgent-allocations" className="space-y-4 mb-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-5 h-auto">
          <TabsTrigger value="urgent-allocations" className="flex items-center gap-2 py-3">
            <AlertTriangle size={16} />
            <span>Urgent Allocations</span>
            {!allocationsLoading && urgentAllocations && (
              <Badge className="ml-auto bg-red-600">{urgentAllocations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="staff-alerts" className="flex items-center gap-2 py-3">
            <UserCog size={16} />
            <span>Staff Alerts</span>
            {!staffAlertsLoading && staffAlerts && (
              <Badge className="ml-auto bg-amber-600">{staffAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="service-user-alerts" className="flex items-center gap-2 py-3">
            <CircleAlert size={16} />
            <span>Service User Alerts</span>
            {!serviceUserAlertsLoading && serviceUserAlerts && (
              <Badge className="ml-auto bg-red-600">{serviceUserAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="patient-overview" className="flex items-center gap-2 py-3">
            <Users size={16} />
            <span>Patient Overview</span>
          </TabsTrigger>
          <TabsTrigger value="cqc-compliance" className="flex items-center gap-2 py-3">
            <ClipboardCheck size={16} />
            <span>CQC Compliance</span>
          </TabsTrigger>
        </TabsList>

        {/* Urgent Allocations Tab Content */}
        <TabsContent value="urgent-allocations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Unallocated Visits Requiring Attention</CardTitle>
                  <CardDescription>
                    Care visits that need to be assigned to staff
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={urgentAlertsFilter} onValueChange={setUrgentAlertsFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href="/care-allocation">
                    <Button>
                      Go to Allocation
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allocationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  ))}
                </div>
              ) : filteredUrgentAllocations && filteredUrgentAllocations.length > 0 ? (
                <div className="space-y-3">
                  {filteredUrgentAllocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{allocation.serviceUserName}</span>
                          {allocation.priority === 'high' && <Badge className="bg-red-100 text-red-800 border-red-200">High Priority</Badge>}
                          {allocation.priority === 'medium' && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>}
                          {allocation.priority === 'low' && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 md:mt-0">
                          <span className="inline-flex items-center gap-1 mr-3">
                            <ListChecks size={14} />
                            {allocation.careType}
                          </span>
                          <span className="inline-flex items-center gap-1 mr-3">
                            <Clock size={14} />
                            {allocation.dateTime}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle size={14} />
                            {allocation.reason}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0 ml-0 md:ml-4">
                        <span className="text-sm text-gray-500">{allocation.attempts} allocation attempts</span>
                        <Button size="sm">Allocate Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No urgent allocations</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    All care visits are currently allocated to appropriate staff members.
                  </p>
                </div>
              )}
            </CardContent>
            {!allocationsLoading && filteredUrgentAllocations && filteredUrgentAllocations.length > 0 && (
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline">View All Allocations</Button>
                <Button onClick={() => alert('Auto-allocate feature would run here')}>
                  Auto-Allocate All
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Staff Alerts Tab Content */}
        <TabsContent value="staff-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability Alerts</CardTitle>
              <CardDescription>
                Staffing issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffAlertsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  ))}
                </div>
              ) : staffAlerts && staffAlerts.length > 0 ? (
                <div className="space-y-3">
                  {staffAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{alert.staffName}</span>
                          {alert.type === 'absence' && <Badge className="bg-red-100 text-red-800 border-red-200">Absence</Badge>}
                          {alert.type === 'lateness' && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Lateness</Badge>}
                          {alert.type === 'unconfirmed' && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Unconfirmed</Badge>}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 md:mt-0">
                          {alert.type !== 'unconfirmed' && (
                            <span className="inline-flex items-center gap-1 mr-3">
                              <Clock size={14} />
                              Reported at {alert.timeReported}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle size={14} />
                            {alert.affectedVisits} affected visit{alert.affectedVisits !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0 ml-0 md:ml-4">
                        <Button variant="outline" size="sm">Contact Staff</Button>
                        <Button size="sm">Reallocate Visits</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All staff accounted for</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    There are currently no staff availability issues to address.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service User Alerts Tab Content */}
        <TabsContent value="service-user-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service User Alerts</CardTitle>
              <CardDescription>
                Incidents and events requiring follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceUserAlertsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  ))}
                </div>
              ) : serviceUserAlerts && serviceUserAlerts.length > 0 ? (
                <div className="space-y-3">
                  {serviceUserAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{alert.serviceUserName}</span>
                          {alert.priority === 'critical' && <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>}
                          {alert.priority === 'high' && <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>}
                          {alert.priority === 'medium' && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>}
                          {alert.priority === 'low' && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 md:mt-0">
                          <span className="inline-flex items-center gap-1 mr-3">
                            <AlertTriangle size={14} />
                            {alert.type === 'missed-medication' && 'Missed Medication'}
                            {alert.type === 'fall' && 'Fall Incident'}
                            {alert.type === 'emergency-contact' && 'Emergency Contact Activated'}
                            {alert.type === 'hospital-admission' && 'Hospital Admission'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} />
                            Reported at {alert.timeReported}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0 ml-0 md:ml-4">
                        <Badge className={
                          alert.status === 'pending'
                            ? 'bg-gray-100 text-gray-800 border-gray-200'
                            : alert.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                        }>
                          {alert.status === 'pending' && 'Pending'}
                          {alert.status === 'in-progress' && 'In Progress'}
                          {alert.status === 'resolved' && 'Resolved'}
                        </Badge>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No service user alerts</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    There are currently no incidents or events requiring immediate attention.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CQC Compliance Tab Content */}
        {/* Patient Overview Tab Content */}
        <TabsContent value="patient-overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Patient Overview</CardTitle>
              <CardDescription>
                Detailed view of patient data, history, and care plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientOverview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cqc-compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CQC Compliance Dashboard</CardTitle>
              <CardDescription>
                Monitoring of key compliance metrics across the five domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardStats?.cqcMetrics ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span className="font-semibold">Safe</span>
                      </div>
                      <span className="text-sm font-medium">{dashboardStats.cqcMetrics.safe}%</span>
                    </div>
                    <Progress value={dashboardStats.cqcMetrics.safe} className="h-2" />
                    <p className="text-sm text-gray-500">
                      Staff training, medication management, and incident reporting
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Effective</span>
                      </div>
                      <span className="text-sm font-medium">{dashboardStats.cqcMetrics.effective}%</span>
                    </div>
                    <Progress value={dashboardStats.cqcMetrics.effective} className="h-2" />
                    <p className="text-sm text-gray-500">
                      Staff skills, care outcomes, and inter-agency working
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                        <span className="font-semibold">Caring</span>
                      </div>
                      <span className="text-sm font-medium">{dashboardStats.cqcMetrics.caring}%</span>
                    </div>
                    <Progress value={dashboardStats.cqcMetrics.caring} className="h-2" />
                    <p className="text-sm text-gray-500">
                      Dignity, respect, and person-centered approach
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Responsive</span>
                      </div>
                      <span className="text-sm font-medium">{dashboardStats.cqcMetrics.responsive}%</span>
                    </div>
                    <Progress value={dashboardStats.cqcMetrics.responsive} className="h-2" />
                    <p className="text-sm text-gray-500">
                      Personalized care, complaints handling, and adapting to changing needs
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-violet-600" />
                        <span className="font-semibold">Well-Led</span>
                      </div>
                      <span className="text-sm font-medium">{dashboardStats.cqcMetrics.wellLed}%</span>
                    </div>
                    <Progress value={dashboardStats.cqcMetrics.wellLed} className="h-2" />
                    <p className="text-sm text-gray-500">
                      Governance, leadership, and continuous improvement
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Compliance data unavailable</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    Unable to load CQC compliance metrics at this time.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/cqc-compliance" className="w-full">
                <Button className="w-full">
                  View Detailed Compliance Report
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Advanced Allocation Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SmartAllocationAssistant />
        <AllocationMethodsCard />
      </div>

      {/* Interactive Map Section */}
      <div className="mb-8">
        <InteractiveMap />
      </div>

      {/* Allocation Analytics */}
      <div className="mb-8">
        <AllocationAnalytics />
      </div>

      {/* Advanced Allocation Features */}
      <Tabs defaultValue="bulk-allocation" className="mb-8">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="bulk-allocation" className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Bulk Allocation Planning</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <PoundSterling size={16} />
            <span>Payroll & Hours Management</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bulk-allocation" className="mt-4">
          <BulkAllocation />
        </TabsContent>
        <TabsContent value="payroll" className="mt-4">
          <PayrollTracking />
        </TabsContent>
      </Tabs>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>
              Tracking care quality and operational metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-2">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : careMetrics ? (
              <div className="space-y-5">
                {careMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex items-center justify-center rounded-lg p-2
                        ${metric.trend === 'up' && metric.id === 'medication_compliance' ? 'bg-green-100 text-green-600' : ''}
                        ${metric.trend === 'up' && metric.id !== 'medication_compliance' ? 'bg-red-100 text-red-600' : ''}
                        ${metric.trend === 'down' && metric.id === 'missed_visits' ? 'bg-green-100 text-green-600' : ''}
                        ${metric.trend === 'down' && metric.id !== 'missed_visits' ? 'bg-red-100 text-red-600' : ''}
                        ${metric.trend === 'stable' ? 'bg-blue-100 text-blue-600' : ''}
                      `}>
                        {metric.id === 'missed_visits' && <AlertTriangle className="h-5 w-5" />}
                        {metric.id === 'late_visits' && <Clock className="h-5 w-5" />}
                        {metric.id === 'medication_compliance' && <Pill className="h-5 w-5" />}
                        {metric.id === 'care_plan_reviews' && <ClipboardList className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">Target: {metric.target}%</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-semibold text-lg">
                        {metric.value}
                      </div>
                      <div className={`
                        text-xs flex items-center
                        ${metric.trend === 'up' && metric.id === 'medication_compliance' ? 'text-green-600' : ''}
                        ${metric.trend === 'up' && metric.id !== 'medication_compliance' ? 'text-red-600' : ''}
                        ${metric.trend === 'down' && metric.id === 'missed_visits' ? 'text-green-600' : ''}
                        ${metric.trend === 'down' && metric.id !== 'missed_visits' ? 'text-red-600' : ''}
                        ${metric.trend === 'stable' ? 'text-blue-600' : ''}
                      `}>
                        {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {metric.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {metric.trend === 'stable' && <ArrowRight className="h-3 w-3 mr-1" />}
                        {metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-500">Unable to load metrics data</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/reports" className="w-full">
              <Button variant="outline" className="w-full">
                <BarChart4 className="mr-2 h-4 w-4" />
                View All Reports
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and quick access to key features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/care-allocation" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-2" />
                    Manage Care Allocations
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/staff-management" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Management
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/calendar" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Scheduling Calendar
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/service-users" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Service User Management
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/incident-reporting" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Incident Reporting
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/route-optimizer" className="w-full">
                <Button variant="outline" size="lg" className="w-full justify-between font-normal">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Route Optimization
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}