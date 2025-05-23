import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Clock,
  Download,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface HolidayRequest {
  id: number;
  staffId: number;
  staffName: string;
  staffAvatar?: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  type: 'annual' | 'sick' | 'compassionate' | 'other';
  notes?: string;
  requestDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

interface StaffMember {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  department: string;
  totalAllowance: number;
  usedAllowance: number;
  remainingAllowance: number;
}

/**
 * Holiday Management Component
 * 
 * This component provides functionality for managing staff holiday requests,
 * tracking allowances, and planning staff coverage.
 */
const HolidayManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock holiday requests data
  const holidayRequests: HolidayRequest[] = [
    {
      id: 1,
      staffId: 101,
      staffName: 'Sarah Johnson',
      staffAvatar: '/avatars/sarah.jpg',
      startDate: new Date(2023, 5, 15),
      endDate: new Date(2023, 5, 22),
      status: 'pending',
      type: 'annual',
      notes: 'Family vacation',
      requestDate: new Date(2023, 4, 20)
    },
    {
      id: 2,
      staffId: 102,
      staffName: 'Michael Brown',
      staffAvatar: '/avatars/michael.jpg',
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2023, 6, 5),
      status: 'approved',
      type: 'annual',
      notes: 'Summer break',
      requestDate: new Date(2023, 5, 10),
      approvedBy: 'Jane Wilson',
      approvedDate: new Date(2023, 5, 12)
    },
    {
      id: 3,
      staffId: 103,
      staffName: 'David Thompson',
      staffAvatar: '/avatars/david.jpg',
      startDate: new Date(2023, 5, 10),
      endDate: new Date(2023, 5, 12),
      status: 'rejected',
      type: 'sick',
      notes: 'Medical appointment',
      requestDate: new Date(2023, 5, 5),
      approvedBy: 'Jane Wilson',
      approvedDate: new Date(2023, 5, 6)
    },
    {
      id: 4,
      staffId: 104,
      staffName: 'Emily Davis',
      staffAvatar: '/avatars/emily.jpg',
      startDate: new Date(2023, 7, 10),
      endDate: new Date(2023, 7, 24),
      status: 'pending',
      type: 'annual',
      notes: 'Annual leave',
      requestDate: new Date(2023, 6, 15)
    }
  ];
  
  // Mock staff data
  const staffMembers: StaffMember[] = [
    {
      id: 101,
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      role: 'Care Worker',
      department: 'Home Care',
      totalAllowance: 28,
      usedAllowance: 12,
      remainingAllowance: 16
    },
    {
      id: 102,
      name: 'Michael Brown',
      avatar: '/avatars/michael.jpg',
      role: 'Senior Care Worker',
      department: 'Home Care',
      totalAllowance: 30,
      usedAllowance: 15,
      remainingAllowance: 15
    },
    {
      id: 103,
      name: 'David Thompson',
      avatar: '/avatars/david.jpg',
      role: 'Care Worker',
      department: 'Residential',
      totalAllowance: 28,
      usedAllowance: 20,
      remainingAllowance: 8
    },
    {
      id: 104,
      name: 'Emily Davis',
      avatar: '/avatars/emily.jpg',
      role: 'Care Coordinator',
      department: 'Office',
      totalAllowance: 32,
      usedAllowance: 10,
      remainingAllowance: 22
    }
  ];
  
  // Filter holiday requests based on search query
  const filteredRequests = holidayRequests.filter(request => {
    if (!searchQuery) return true;
    
    return (
      request.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Get status badge
  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  // Calculate holiday duration
  const getHolidayDuration = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate) + 1;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Holiday Management</CardTitle>
            <CardDescription>
              Manage staff holiday requests, track allowances, and plan coverage
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Holiday Requests</span>
            </TabsTrigger>
            <TabsTrigger value="allowances" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Staff Allowances</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Holiday Calendar</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Holiday Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search-requests" className="sr-only">Search Requests</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search-requests"
                    placeholder="Search by staff name, type, or status..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No holiday requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.staffAvatar} alt={request.staffName} />
                              <AvatarFallback>{request.staffName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.staffName}</div>
                              <div className="text-xs text-gray-500">
                                Requested: {format(request.requestDate, 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(request.startDate, 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {format(request.endDate, 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getHolidayDuration(request.startDate, request.endDate)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Staff Allowances Tab */}
          <TabsContent value="allowances" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Allowance</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={staff.avatar} alt={staff.name} />
                            <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{staff.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.totalAllowance} days</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress value={(staff.usedAllowance / staff.totalAllowance) * 100} className="h-2" />
                          </div>
                          <span>{staff.usedAllowance} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          staff.remainingAllowance > 10 
                            ? 'bg-green-100 text-green-800' 
                            : staff.remainingAllowance > 5 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800'
                        }>
                          {staff.remainingAllowance} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Leave
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Holiday Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Staff Holiday Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:w-1/2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-500">
                        Staff on holiday on this date:
                      </div>
                      
                      {holidayRequests.filter(request => 
                        selectedDate && 
                        selectedDate >= request.startDate && 
                        selectedDate <= request.endDate &&
                        request.status === 'approved'
                      ).length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No staff on holiday on this date
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {holidayRequests.filter(request => 
                            selectedDate && 
                            selectedDate >= request.startDate && 
                            selectedDate <= request.endDate &&
                            request.status === 'approved'
                          ).map(request => (
                            <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={request.staffAvatar} alt={request.staffName} />
                                  <AvatarFallback>{request.staffName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.staffName}</div>
                                  <div className="text-xs text-gray-500">
                                    {format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d, yyyy')}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {request.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Manage Staff
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HolidayManagement;
