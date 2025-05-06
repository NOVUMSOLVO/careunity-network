import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  Upload, 
  FileText, 
  FileCog,
  Search,
  ArrowUpDown,
  FileCheck,
  Printer,
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  MoreHorizontal,
  Edit3,
  PoundSterling,
  TimerReset,
  UserCog
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export interface PayrollTrackingProps {
  className?: string;
}

// Sample data for payroll periods
const payrollPeriods = [
  { id: 1, name: 'May 2024', startDate: '2024-05-01', endDate: '2024-05-31', status: 'current', carersProcessed: 45, hoursLogged: 5842, payrollValue: 69842.50 },
  { id: 2, name: 'April 2024', startDate: '2024-04-01', endDate: '2024-04-30', status: 'processed', carersProcessed: 43, hoursLogged: 5721, payrollValue: 68652.25 },
  { id: 3, name: 'March 2024', startDate: '2024-03-01', endDate: '2024-03-31', status: 'processed', carersProcessed: 44, hoursLogged: 5860, payrollValue: 70320.00 },
  { id: 4, name: 'February 2024', startDate: '2024-02-01', endDate: '2024-02-29', status: 'processed', carersProcessed: 44, hoursLogged: 5530, payrollValue: 66360.00 },
  { id: 5, name: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-31', status: 'processed', carersProcessed: 42, hoursLogged: 5752, payrollValue: 69024.00 },
];

// Sample data for carer hours
const carerHours = [
  { id: 1, name: 'John Smith', role: 'Care Worker', hoursLogged: 128.5, visitsCompleted: 86, mileageClaimed: 312, payRate: 12.50, status: 'approved' },
  { id: 2, name: 'Sarah Jones', role: 'Senior Carer', hoursLogged: 156.0, visitsCompleted: 104, mileageClaimed: 245, payRate: 14.75, status: 'approved' },
  { id: 3, name: 'Emma Wilson', role: 'Care Worker', hoursLogged: 102.5, visitsCompleted: 68, mileageClaimed: 198, payRate: 12.50, status: 'pending' },
  { id: 4, name: 'Michael Brown', role: 'Care Worker', hoursLogged: 134.0, visitsCompleted: 89, mileageClaimed: 276, payRate: 12.50, status: 'approved' },
  { id: 5, name: 'David Clark', role: 'Senior Carer', hoursLogged: 145.5, visitsCompleted: 97, mileageClaimed: 304, payRate: 14.75, status: 'review' },
  { id: 6, name: 'Patricia Taylor', role: 'Care Worker', hoursLogged: 112.0, visitsCompleted: 75, mileageClaimed: 226, payRate: 12.50, status: 'approved' },
  { id: 7, name: 'Thomas Wilson', role: 'Care Worker', hoursLogged: 118.5, visitsCompleted: 79, mileageClaimed: 217, payRate: 12.50, status: 'approved' },
  { id: 8, name: 'Jennifer Lewis', role: 'Care Worker', hoursLogged: 108.0, visitsCompleted: 72, mileageClaimed: 193, payRate: 12.50, status: 'pending' },
];

// Sample data for time tracking discrepancies
const discrepancies = [
  { id: 1, carerName: 'Emma Wilson', visitDate: '2024-05-04', scheduledTime: '09:00 - 10:00', actualTime: '09:15 - 10:20', difference: 35, status: 'pending' },
  { id: 2, carerName: 'David Clark', visitDate: '2024-05-03', scheduledTime: '14:30 - 15:30', actualTime: '14:35 - 15:55', difference: 30, status: 'approved' },
  { id: 3, carerName: 'Jennifer Lewis', visitDate: '2024-05-05', scheduledTime: '11:00 - 12:00', actualTime: '11:10 - 12:15', difference: 25, status: 'review' },
  { id: 4, carerName: 'David Clark', visitDate: '2024-05-03', scheduledTime: '17:00 - 17:45', actualTime: '17:05 - 18:05', difference: 35, status: 'review' },
];

// Sample data for monthly hours trend
const monthlyHoursTrend = [
  { name: 'Jan', hours: 5752, target: 5800 },
  { name: 'Feb', hours: 5530, target: 5800 },
  { name: 'Mar', hours: 5860, target: 5800 },
  { name: 'Apr', hours: 5721, target: 5800 },
  { name: 'May', hours: 2842, target: 5800 },
];

export function PayrollTracking({ className }: PayrollTrackingProps) {
  const [activeTab, setActiveTab] = useState<string>('hours');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // Current period by default
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Get the current period
  const currentPeriod = payrollPeriods.find(period => period.id === selectedPeriod);
  
  // Filter carer hours based on search and filter
  const filteredCarerHours = carerHours.filter(carer => {
    const matchesSearch = searchQuery === '' || 
      carer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || carer.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  // Toggle selection of carer records
  const toggleCarerSelection = (carerId: number) => {
    setSelectedRecords((prev) => 
      prev.includes(carerId)
        ? prev.filter(id => id !== carerId)
        : [...prev, carerId]
    );
  };
  
  // Select all displayed carer records
  const selectAllDisplayed = () => {
    if (selectedRecords.length === filteredCarerHours.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredCarerHours.map(carer => carer.id));
    }
  };
  
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'review':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Review</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Current</Badge>;
      case 'processed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Processed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Calculate totals for the filtered carer hours
  const calculateTotals = () => {
    return filteredCarerHours.reduce((acc, carer) => {
      return {
        hours: acc.hours + carer.hoursLogged,
        visits: acc.visits + carer.visitsCompleted,
        mileage: acc.mileage + carer.mileageClaimed,
        amount: acc.amount + (carer.hoursLogged * carer.payRate)
      };
    }, { hours: 0, visits: 0, mileage: 0, amount: 0 });
  };
  
  const totals = calculateTotals();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Payroll & Hours Management</CardTitle>
            <CardDescription>
              Track and approve carer hours, process payroll, and manage time discrepancies
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod.toString()} onValueChange={(val) => setSelectedPeriod(parseInt(val))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {payrollPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.name} {period.status === 'current' && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period summary */}
        {currentPeriod && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800">Pay Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-900">{currentPeriod.name}</div>
                <div className="text-sm text-blue-700 mt-1">
                  {currentPeriod.startDate} to {currentPeriod.endDate}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800">Hours Logged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-900">{currentPeriod.hoursLogged.toLocaleString()}</div>
                <div className="text-sm text-green-700 mt-1">
                  By {currentPeriod.carersProcessed} carers
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-indigo-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-indigo-800">Payroll Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-indigo-900">£{currentPeriod.payrollValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm text-indigo-700 mt-1">
                  Average: £{(currentPeriod.payrollValue / currentPeriod.carersProcessed).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-amber-900 capitalize">{currentPeriod.status}</div>
                <div className="text-sm text-amber-700 mt-1">
                  {currentPeriod.status === 'current' ? 'In progress' : 'Completed'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Hours & Visits</span>
            </TabsTrigger>
            <TabsTrigger value="discrepancies" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Time Discrepancies</span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <PoundSterling className="h-4 w-4" />
              <span>Payroll Processing</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Reports & Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Hours & Visits Tab */}
          <TabsContent value="hours" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search carers..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="review">Needs Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="default">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={selectedRecords.length === 0}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={selectedRecords.length === 0}>
                      <TimerReset className="h-4 w-4 mr-2" />
                      Reset Status
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={selectedRecords.length === 0}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Reassign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedRecords.length > 0 && selectedRecords.length === filteredCarerHours.length}
                        onCheckedChange={selectAllDisplayed}
                      />
                    </TableHead>
                    <TableHead>Carer Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Mileage</TableHead>
                    <TableHead className="text-right">Amount (£)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarerHours.map((carer) => (
                    <TableRow key={carer.id} className={selectedRecords.includes(carer.id) ? 'bg-slate-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedRecords.includes(carer.id)}
                          onCheckedChange={() => toggleCarerSelection(carer.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{carer.name}</TableCell>
                      <TableCell>{carer.role}</TableCell>
                      <TableCell className="text-right font-medium">{carer.hoursLogged}</TableCell>
                      <TableCell className="text-right">{carer.visitsCompleted}</TableCell>
                      <TableCell className="text-right">{carer.mileageClaimed}</TableCell>
                      <TableCell className="text-right font-medium">
                        £{(carer.hoursLogged * carer.payRate).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(carer.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Hours
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Flag for Review
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">Totals:</TableCell>
                    <TableCell className="text-right font-medium">{totals.hours.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-medium">{totals.visits}</TableCell>
                    <TableCell className="text-right font-medium">{totals.mileage}</TableCell>
                    <TableCell className="text-right font-medium">£{totals.amount.toFixed(2)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredCarerHours.length} of {carerHours.length} carers
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
          
          {/* Time Discrepancies Tab */}
          <TabsContent value="discrepancies" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                Time Discrepancies Requiring Attention
              </div>
              <Button variant="outline" size="sm">
                Export List
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carer</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Actual Time</TableHead>
                    <TableHead>Difference (mins)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discrepancies.map((discrepancy) => (
                    <TableRow key={discrepancy.id}>
                      <TableCell className="font-medium">{discrepancy.carerName}</TableCell>
                      <TableCell>{discrepancy.visitDate}</TableCell>
                      <TableCell>{discrepancy.scheduledTime}</TableCell>
                      <TableCell className={discrepancy.difference > 30 ? 'text-red-600 font-medium' : ''}>{discrepancy.actualTime}</TableCell>
                      <TableCell className={discrepancy.difference > 30 ? 'text-red-600 font-medium' : ''}>+{discrepancy.difference}</TableCell>
                      <TableCell>{getStatusBadge(discrepancy.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve Overtime
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Adjust Hours
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Flag for Management
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Visit Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Time Discrepancies</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This section shows visits where the actual time logged differs significantly 
                      from the scheduled time. Review each case and decide whether to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Approve the additional time for payment</li>
                      <li>Adjust the recorded hours</li>
                      <li>Flag the case for further investigation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Payroll Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payroll Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full">
                      <PoundSterling className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{currentPeriod?.name} Payroll</div>
                      <div className="text-sm text-gray-500 capitalize">{currentPeriod?.status}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Processing Progress</div>
                    <Progress 
                      value={currentPeriod?.status === 'current' ? 60 : 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Hours Verification</span>
                      <span>Processing</span>
                      <span>Approval</span>
                      <span>Payment</span>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Regular Hours:</span>
                      <span>{currentPeriod?.hoursLogged} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Overtime Hours:</span>
                      <span>268 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mileage Claims:</span>
                      <span>5,842 miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Additional Expenses:</span>
                      <span>£487.50</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t mt-2">
                      <span>Total Payroll Value:</span>
                      <span>£{currentPeriod?.payrollValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" disabled={currentPeriod?.status !== 'current'}>
                    {currentPeriod?.status === 'current' ? 'Process Payroll' : 'Already Processed'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Required Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 text-amber-800 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Time Discrepancies</div>
                        <div className="text-xs text-gray-500">5 items need review</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded">
                        <UserCog className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Pending Approvals</div>
                        <div className="text-xs text-gray-500">3 carers awaiting approval</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Approve</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 text-indigo-800 p-2 rounded">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Final Verification</div>
                        <div className="text-xs text-gray-500">Supervisor sign-off needed</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Verify</Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="text-xs text-gray-500 w-full text-center">
                    All actions must be completed before payroll processing
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Payroll Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileCog className="h-4 w-4 mr-2" />
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
                  <div className="flex justify-between mt-2">
                    <Select defaultValue="sage">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sage">Sage Payroll</SelectItem>
                        <SelectItem value="quickbooks">QuickBooks</SelectItem>
                        <SelectItem value="xero">Xero</SelectItem>
                        <SelectItem value="csv">CSV Export</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Export</Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="text-xs text-gray-500 w-full">
                    Last export: {currentPeriod?.status === 'processed' ? currentPeriod.endDate : 'Not yet exported'}
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Carers</TableHead>
                      <TableHead className="text-right">Amount (£)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>{period.startDate} to {period.endDate}</TableCell>
                        <TableCell className="text-right">{period.hoursLogged.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{period.carersProcessed}</TableCell>
                        <TableCell className="text-right font-medium">
                          £{period.payrollValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </TableCell>
                        <TableCell>{getStatusBadge(period.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Report
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Data
                              </DropdownMenuItem>
                              {period.status === 'current' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <FileCog className="h-4 w-4 mr-2" />
                                    Process Payroll
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reports & Analytics Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Hours Trend</CardTitle>
                  <CardDescription>Total hours logged per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyHoursTrend}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#8884d8" name="Hours Logged" />
                        <Bar dataKey="target" fill="#82ca9d" name="Target Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payroll Distribution</CardTitle>
                  <CardDescription>Breakdown of payroll costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Regular Hours', value: 58250 },
                            { name: 'Overtime', value: 7850 },
                            { name: 'Weekend Premium', value: 3245 },
                            { name: 'Mileage', value: 2912.50 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            '#0088FE',
                            '#00C49F',
                            '#FFBB28',
                            '#FF8042',
                          ].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `£${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff Hours Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Visits Per Hour</div>
                      <div className="text-sm text-gray-500">Target: 1.2</div>
                    </div>
                    <Progress value={98} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">1.18</span>
                      <span className="text-green-600 text-xs">98% of target</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">On-Time Percentage</div>
                      <div className="text-sm text-gray-500">Target: 95%</div>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">87.2%</span>
                      <span className="text-amber-600 text-xs">92% of target</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Visit Completion</div>
                      <div className="text-sm text-gray-500">Target: 99%</div>
                    </div>
                    <Progress value={99} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">98.9%</span>
                      <span className="text-green-600 text-xs">99% of target</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Staff Utilization</div>
                      <div className="text-sm text-gray-500">Target: 85%</div>
                    </div>
                    <Progress value={88} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">75.2%</span>
                      <span className="text-amber-600 text-xs">88% of target</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-2">
                  <h3 className="text-sm font-medium">Available Reports</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Staff Hours Summary
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Time Allocation by Service
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Overtime Analysis
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Visit Efficiency Report
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Missed Visits Report
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Staff Punctuality Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HelpCircle className="h-4 w-4" />
          <span>Need help with payroll? View our <a href="#" className="text-primary underline">Payroll Guide</a></span>
        </div>
        <Button variant="default">Run Payroll Reports</Button>
      </CardFooter>
    </Card>
  );
}