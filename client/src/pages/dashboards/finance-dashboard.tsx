import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  PoundSterling, Calendar, Clock, FileText, 
  Download, Printer, Mail, Users, BarChart2,
  AlertCircle, CheckCircle, RefreshCw, Filter,
  ArrowUpRight, ArrowDownRight, CreditCard, Wallet
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { OfflineIndicator, OfflineWrapper } from '@/components/ui/offline-indicator';
import { PayrollTracking } from '@/components/admin/payroll-tracking';

/**
 * Finance/Payroll Dashboard
 * 
 * This dashboard provides finance staff with payroll management,
 * financial reporting, and budget tracking tools.
 */
const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('payroll');

  // Mock data for the dashboard
  const financeData = {
    currentPeriod: {
      name: 'June 2023',
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      status: 'in-progress',
      totalHours: 4250.5,
      totalStaff: 48,
      totalAmount: 68420.75,
      processingDeadline: '2023-07-05',
      completionPercentage: 65
    },
    financialSummary: {
      revenue: 125000,
      expenses: 98500,
      profit: 26500,
      profitMargin: 21.2,
      revenueGrowth: 5.3,
      expenseGrowth: 3.1
    },
    pendingApprovals: [
      { id: 1, staff: 'John Smith', type: 'Overtime', hours: 4.5, date: '2023-06-15', status: 'pending' },
      { id: 2, staff: 'Mary Johnson', type: 'Holiday Pay', hours: 16, date: '2023-06-18', status: 'pending' },
      { id: 3, staff: 'Robert Davis', type: 'Sick Leave', hours: 8, date: '2023-06-20', status: 'pending' }
    ],
    recentPayrolls: [
      { id: 1, period: 'May 2023', staff: 47, hours: 4120, amount: 66350.25, status: 'completed', processingDate: '2023-06-05' },
      { id: 2, period: 'April 2023', staff: 46, hours: 4080, amount: 65200.50, status: 'completed', processingDate: '2023-05-05' },
      { id: 3, period: 'March 2023', staff: 45, hours: 3950, amount: 63100.75, status: 'completed', processingDate: '2023-04-05' }
    ],
    taxSummary: {
      incomeTax: 12500.50,
      nationalInsurance: 8750.25,
      pensionContributions: 5420.30,
      studentLoanRepayments: 1250.75
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance & Payroll</h1>
          <p className="text-muted-foreground">
            Manage payroll, financial reporting, and budget tracking
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Generate Reports</span>
          </Button>
        </div>
      </div>

      <OfflineIndicator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats 
          title="Current Payroll"
          value={`£${financeData.currentPeriod.totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={financeData.currentPeriod.name}
          icon={<PoundSterling className="h-4 w-4" />}
          trend={{ value: "+3.1%", label: "from last month" }}
        />
        <DashboardStats 
          title="Staff Members"
          value={financeData.currentPeriod.totalStaff.toString()}
          description="Active employees"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "+2", label: "from last month" }}
        />
        <DashboardStats 
          title="Total Hours"
          value={financeData.currentPeriod.totalHours.toLocaleString('en-GB')}
          description={`${financeData.currentPeriod.name}`}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: "+3.2%", label: "from last month" }}
        />
        <DashboardStats 
          title="Processing Deadline"
          value={new Date(financeData.currentPeriod.processingDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          description="Payroll deadline"
          icon={<Calendar className="h-4 w-4" />}
          trend={{ value: "10 days", label: "remaining" }}
        />
      </div>

      <Tabs defaultValue="payroll" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <PoundSterling className="h-4 w-4" />
            <span>Payroll Management</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Financial Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Tax & Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="holiday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Holiday Management</span>
          </TabsTrigger>
        </TabsList>

        {/* Payroll Management Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Current Payroll Period: {financeData.currentPeriod.name}</CardTitle>
                  <CardDescription>
                    {financeData.currentPeriod.startDate} to {financeData.currentPeriod.endDate}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    financeData.currentPeriod.status === 'completed' ? 'outline' : 
                    financeData.currentPeriod.status === 'in-progress' ? 'default' : 'secondary'
                  }>
                    {financeData.currentPeriod.status === 'in-progress' ? 'In Progress' : 
                     financeData.currentPeriod.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Processing Progress</span>
                  <span className="text-sm text-muted-foreground">{financeData.currentPeriod.completionPercentage}%</span>
                </div>
                <Progress value={financeData.currentPeriod.completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Payroll processing deadline: {new Date(financeData.currentPeriod.processingDeadline).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeData.pendingApprovals.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.staff}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="text-right">{item.hours}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">Review</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button variant="outline" size="sm" className="w-full">View All Pending Items</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Payroll Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Detailed Time Records
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Payslips
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Payslips
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Payroll Periods</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Staff</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financeData.recentPayrolls.map(payroll => (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">{payroll.period}</TableCell>
                          <TableCell className="text-right">{payroll.staff}</TableCell>
                          <TableCell className="text-right">{payroll.hours.toLocaleString('en-GB')}</TableCell>
                          <TableCell className="text-right">£{payroll.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <Badge variant={payroll.status === 'completed' ? 'outline' : 'default'}>
                              {payroll.status === 'completed' ? 'Completed' : 'In Progress'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Review financial performance and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Financial overview content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax & Deductions</CardTitle>
              <CardDescription>Manage tax calculations and deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Tax management content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holiday">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Management</CardTitle>
              <CardDescription>Track and approve holiday requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Holiday management content would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
