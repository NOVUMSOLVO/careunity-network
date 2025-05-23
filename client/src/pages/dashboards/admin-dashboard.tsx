import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Settings, Calendar, Clock, 
  PoundSterling, FileText, BarChart2, 
  RefreshCw, Download, Upload, UserPlus,
  Building, Home, Briefcase, Activity
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { PayrollTracking } from '@/components/admin/payroll-tracking';
import HolidayManagement from '@/components/admin/holiday-management';

/**
 * Admin Dashboard
 * 
 * This dashboard provides administrative staff with comprehensive tools
 * for managing payroll, holidays, staff, and organizational metrics.
 */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the dashboard
  const adminStats = {
    totalStaff: 48,
    activeStaff: 45,
    staffOnHoliday: 3,
    staffSick: 1,
    totalServiceUsers: 156,
    activeServiceUsers: 142,
    totalVisitsToday: 215,
    completedVisitsToday: 178,
    pendingVisitsToday: 37,
    totalHoursToday: 324.5,
    totalMileageToday: 842,
    revenueThisMonth: 125000,
    expensesThisMonth: 98500,
    profitThisMonth: 26500,
    profitMargin: 21.2,
    staffUtilization: 87.5,
    clientSatisfaction: 92,
    qualityScore: 94
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage staff, payroll, holidays, and organizational metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats 
          title="Total Staff"
          value={adminStats.totalStaff.toString()}
          description={`${adminStats.activeStaff} active, ${adminStats.staffOnHoliday} on holiday`}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "+2", label: "from last month" }}
        />
        <DashboardStats 
          title="Service Users"
          value={adminStats.totalServiceUsers.toString()}
          description={`${adminStats.activeServiceUsers} active`}
          icon={<Home className="h-4 w-4" />}
          trend={{ value: "+5", label: "from last month" }}
        />
        <DashboardStats 
          title="Today's Visits"
          value={adminStats.totalVisitsToday.toString()}
          description={`${adminStats.completedVisitsToday} completed, ${adminStats.pendingVisitsToday} pending`}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: "+12", label: "from yesterday" }}
        />
        <DashboardStats 
          title="Staff Utilization"
          value={`${adminStats.staffUtilization}%`}
          description="Target: 85%"
          icon={<Activity className="h-4 w-4" />}
          trend={{ value: "+2.5%", label: "from last month" }}
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <PoundSterling className="h-4 w-4" />
            <span>Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Holiday Management</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current month performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Revenue</span>
                    <span className="text-sm text-muted-foreground">£{adminStats.revenueThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Expenses</span>
                    <span className="text-sm text-muted-foreground">£{adminStats.expensesThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Profit</span>
                    <span className="text-sm font-medium">£{adminStats.profitThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="text-sm font-medium">{adminStats.profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Detailed Financials</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Summary</CardTitle>
                <CardDescription>Current staff status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Active</span>
                  </div>
                  <Badge variant="outline">{adminStats.activeStaff}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">On Holiday</span>
                  </div>
                  <Badge variant="outline">{adminStats.staffOnHoliday}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Sick Leave</span>
                  </div>
                  <Badge variant="outline">{adminStats.staffSick}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm">Inactive</span>
                  </div>
                  <Badge variant="outline">{adminStats.totalStaff - adminStats.activeStaff - adminStats.staffOnHoliday - adminStats.staffSick}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Manage Staff</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Client Satisfaction</span>
                    <span className="text-sm text-muted-foreground">{adminStats.clientSatisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Staff Utilization</span>
                    <span className="text-sm text-muted-foreground">{adminStats.staffUtilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm text-muted-foreground">{adminStats.qualityScore}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Quality Dashboard</Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>Summary of today's operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Visits</div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm">{adminStats.completedVisitsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm">{adminStats.pendingVisitsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-medium">{adminStats.totalVisitsToday}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Hours</div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Scheduled</span>
                    <span className="text-sm">{adminStats.totalHoursToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm">{(adminStats.totalHoursToday * adminStats.completedVisitsToday / adminStats.totalVisitsToday).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average per Visit</span>
                    <span className="text-sm">{(adminStats.totalHoursToday / adminStats.totalVisitsToday).toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Mileage</div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm">{adminStats.totalMileageToday} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average per Visit</span>
                    <span className="text-sm">{(adminStats.totalMileageToday / adminStats.totalVisitsToday).toFixed(1)} miles</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <OfflineWrapper requiresOnline={false}>
            <PayrollTracking />
          </OfflineWrapper>
        </TabsContent>

        {/* Holiday Management Tab */}
        <TabsContent value="holidays">
          <OfflineWrapper requiresOnline={false}>
            <HolidayManagement />
          </OfflineWrapper>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Access and generate reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <PoundSterling className="h-4 w-4 mr-2" />
                      Monthly P&L Statement
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PoundSterling className="h-4 w-4 mr-2" />
                      Revenue Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PoundSterling className="h-4 w-4 mr-2" />
                      Expense Breakdown
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Staff Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Staff Utilization
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Absence Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Performance Metrics
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Operational Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="h-4 w-4 mr-2" />
                      Visit Completion Rates
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="h-4 w-4 mr-2" />
                      Service User Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="h-4 w-4 mr-2" />
                      Quality Metrics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
