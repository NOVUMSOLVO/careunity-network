import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users, Settings, Shield, Database,
  Server, Activity, AlertTriangle, FileText,
  BarChart2, RefreshCw, Lock, UserPlus
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { PerformanceDashboard } from '@/components/performance/performance-dashboard';

/**
 * System Administrator Dashboard
 *
 * This dashboard provides system administrators with comprehensive
 * system management tools, user administration, and technical monitoring.
 */
const SystemAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the dashboard
  const systemStats = {
    totalUsers: 156,
    activeUsers: 132,
    pendingApprovals: 8,
    systemUptime: 99.98,
    databaseSize: '2.4 GB',
    lastBackup: '2023-06-15 03:00 AM',
    securityAlerts: 2,
    pendingUpdates: 3,
    apiRequests: {
      today: 12450,
      yesterday: 11320,
      growth: 10
    },
    storageUsage: 68,
    cpuUsage: 42,
    memoryUsage: 56,
    recentAuditEvents: [
      { id: 1, user: 'jane.smith', action: 'User Created', timestamp: '2023-06-15 14:32', ip: '192.168.1.45' },
      { id: 2, user: 'admin', action: 'Role Modified', timestamp: '2023-06-15 13:15', ip: '192.168.1.1' },
      { id: 3, user: 'john.doe', action: 'Login Failed', timestamp: '2023-06-15 12:30', ip: '192.168.1.22' },
      { id: 4, user: 'system', action: 'Backup Completed', timestamp: '2023-06-15 03:00', ip: '192.168.1.1' },
      { id: 5, user: 'admin', action: 'System Settings Updated', timestamp: '2023-06-14 17:45', ip: '192.168.1.1' }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">
            Manage system settings, users, and monitor performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>System Health</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStats
              title="Total Users"
              value={systemStats.totalUsers.toString()}
              description="Across all roles"
              icon={<Users className="h-4 w-4" />}
              trend={{ value: "+12%", label: "from last month" }}
            />
            <DashboardStats
              title="System Uptime"
              value={`${systemStats.systemUptime}%`}
              description="Last 30 days"
              icon={<Activity className="h-4 w-4" />}
              trend={{ value: "0.02%", label: "from last month", direction: "down" }}
            />
            <DashboardStats
              title="API Requests"
              value={systemStats.apiRequests.today.toLocaleString()}
              description="Today"
              icon={<RefreshCw className="h-4 w-4" />}
              trend={{ value: `${systemStats.apiRequests.growth}%`, label: "from yesterday" }}
            />
            <DashboardStats
              title="Security Alerts"
              value={systemStats.securityAlerts.toString()}
              description="Require attention"
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={{ value: "-1", label: "from yesterday" }}
              trendDirection={systemStats.securityAlerts > 0 ? "up" : "down"}
              valueColor={systemStats.securityAlerts > 0 ? "text-red-600" : "text-green-600"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-muted-foreground">{systemStats.storageUsage}%</span>
                  </div>
                  <Progress value={systemStats.storageUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">CPU</span>
                    <span className="text-sm text-muted-foreground">{systemStats.cpuUsage}%</span>
                  </div>
                  <Progress value={systemStats.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-sm text-muted-foreground">{systemStats.memoryUsage}%</span>
                  </div>
                  <Progress value={systemStats.memoryUsage} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Detailed Metrics</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>Storage and backup information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Database Size</span>
                  </div>
                  <span>{systemStats.databaseSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Backup</span>
                  </div>
                  <span>{systemStats.lastBackup}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Run Backup</Button>
                <Button variant="outline">Optimize DB</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">User Approvals</span>
                  </div>
                  <Badge>{systemStats.pendingApprovals}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">System Updates</span>
                  </div>
                  <Badge>{systemStats.pendingUpdates}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Security Alerts</span>
                  </div>
                  <Badge variant={systemStats.securityAlerts > 0 ? "destructive" : "outline"}>
                    {systemStats.securityAlerts}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Review All Pending Items</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and health</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Import and use the Performance Dashboard component */}
              <div className="mt-4">
                <PerformanceDashboard />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Center</CardTitle>
              <CardDescription>Manage security settings and view alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Security management content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdminDashboard;
