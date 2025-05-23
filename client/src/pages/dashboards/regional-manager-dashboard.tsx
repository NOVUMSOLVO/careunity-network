import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Settings, Calendar, Clock, 
  PoundSterling, FileText, BarChart2, 
  RefreshCw, Download, Upload, UserPlus,
  Building, Home, Briefcase, Activity,
  Map, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { SyncStatus } from '@/components/sync/sync-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RegionalPerformance } from '@/components/regional/regional-performance';
import { BranchComparison } from '@/components/regional/branch-comparison';
import { RegionalMap } from '@/components/regional/regional-map';
import { StaffUtilization } from '@/components/regional/staff-utilization';
import { QualityMetrics } from '@/components/regional/quality-metrics';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Regional Manager Dashboard
 * 
 * This dashboard provides regional managers with comprehensive tools
 * for managing multiple branches, monitoring performance, and analyzing
 * regional metrics.
 */
const RegionalManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data for the dashboard
  const regionalStats = {
    totalBranches: 5,
    activeBranches: 5,
    totalStaff: 248,
    activeStaff: 235,
    staffOnHoliday: 8,
    staffSick: 5,
    totalServiceUsers: 756,
    activeServiceUsers: 742,
    totalVisitsToday: 1215,
    completedVisitsToday: 978,
    pendingVisitsToday: 237,
    totalHoursToday: 1824.5,
    totalMileageToday: 4842,
    revenueThisMonth: 625000,
    expensesThisMonth: 498500,
    profitThisMonth: 126500,
    profitMargin: 20.2,
    staffUtilization: 85.5,
    clientSatisfaction: 91,
    qualityScore: 93,
    branches: [
      { id: 1, name: 'North London', manager: 'James Wilson', staff: 52, serviceUsers: 165, utilization: 87, qualityScore: 94 },
      { id: 2, name: 'South London', manager: 'Sarah Johnson', staff: 48, serviceUsers: 142, utilization: 84, qualityScore: 92 },
      { id: 3, name: 'East London', manager: 'David Brown', staff: 45, serviceUsers: 138, utilization: 86, qualityScore: 91 },
      { id: 4, name: 'West London', manager: 'Emma Davis', staff: 51, serviceUsers: 156, utilization: 88, qualityScore: 95 },
      { id: 5, name: 'Central London', manager: 'Michael Smith', staff: 52, serviceUsers: 155, utilization: 82, qualityScore: 93 }
    ],
    alerts: [
      { id: 1, type: 'staffing', branch: 'South London', message: 'Staff utilization below target (84%)', severity: 'medium' },
      { id: 2, type: 'quality', branch: 'East London', message: 'Quality score dropped by 2 points', severity: 'medium' },
      { id: 3, type: 'financial', branch: 'Central London', message: 'Expenses 5% above forecast', severity: 'high' }
    ]
  };

  // Fetch regional data
  const { data: regionalData, isLoading, error } = useQuery({
    queryKey: ['regional-dashboard'],
    queryFn: async () => {
      try {
        const { data, error } = await apiClient.get('/api/v2/reports/regional');
        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        // If API fails, use mock data
        console.warn('Using mock data for regional dashboard');
        return regionalStats;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use mock data if loading or error
  const dashboardData = regionalData || regionalStats;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regional Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all branches in your region
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SyncStatus />
          <OfflineIndicator />
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/regional-manager.jpg" alt="Regional Manager" />
            <AvatarFallback>RM</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStats 
              title="Total Branches"
              value={dashboardData.totalBranches.toString()}
              description="In your region"
              icon={<Building className="h-4 w-4" />}
            />
            <DashboardStats 
              title="Total Staff"
              value={dashboardData.totalStaff.toString()}
              description={`${dashboardData.activeStaff} active`}
              icon={<Users className="h-4 w-4" />}
              trend={{ value: "+3%", label: "from last month" }}
            />
            <DashboardStats 
              title="Service Users"
              value={dashboardData.totalServiceUsers.toString()}
              description={`${dashboardData.activeServiceUsers} active`}
              icon={<Home className="h-4 w-4" />}
              trend={{ value: "+5%", label: "from last month" }}
            />
            <DashboardStats 
              title="Quality Score"
              value={`${dashboardData.qualityScore}%`}
              description="Regional average"
              icon={<CheckCircle className="h-4 w-4" />}
              trend={{ value: "+1%", label: "from last month" }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Performance metrics across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <RegionalPerformance data={dashboardData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === 'high' ? 'text-red-500' : 
                        alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium">{alert.branch}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View All Alerts</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Regional Map</CardTitle>
                <CardDescription>Branch locations and coverage</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RegionalMap branches={dashboardData.branches} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch Comparison</CardTitle>
                <CardDescription>Performance metrics by branch</CardDescription>
              </CardHeader>
              <CardContent>
                <BranchComparison branches={dashboardData.branches} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branch Management</CardTitle>
              <CardDescription>Overview and management of all branches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.branches.map(branch => (
                  <Card key={branch.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{branch.name}</h3>
                        <p className="text-sm text-muted-foreground">Manager: {branch.manager}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {branch.staff} Staff
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {branch.serviceUsers} Service Users
                        </Badge>
                        <Badge variant="outline" className={`flex items-center gap-1 ${
                          branch.utilization >= 85 ? 'bg-green-50 text-green-700' : 
                          branch.utilization >= 80 ? 'bg-amber-50 text-amber-700' : 
                          'bg-red-50 text-red-700'
                        }`}>
                          <Activity className="h-3 w-3" />
                          {branch.utilization}% Utilization
                        </Badge>
                        <Badge variant="outline" className={`flex items-center gap-1 ${
                          branch.qualityScore >= 90 ? 'bg-green-50 text-green-700' : 
                          branch.qualityScore >= 85 ? 'bg-amber-50 text-amber-700' : 
                          'bg-red-50 text-red-700'
                        }`}>
                          <CheckCircle className="h-3 w-3" />
                          {branch.qualityScore} Quality
                        </Badge>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Add New Branch</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis across the region</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance metrics content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Regional staff overview and allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Staff management content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Regional financial performance and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Financial overview content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionalManagerDashboard;
