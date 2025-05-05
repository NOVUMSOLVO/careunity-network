import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Award, 
  Check, 
  Clock, 
  FileText, 
  BarChart2, 
  CalendarDays,
  Search,
  Filter,
  Plus,
  Download,
  XCircle,
  PlusCircle,
  UserPlus,
  Trash2
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduleSupervisionModal } from "@/components/modals/schedule-supervision-modal";
import { MissedVisitReviewModal } from "@/components/modals/missed-visit-review-modal";
import { ViewCandidatesModal } from "@/components/modals/view-candidates-modal";
import { ViewApplicationsModal } from "@/components/modals/view-applications-modal";
import { NewPositionModal } from "@/components/modals/new-position-modal";

// Sample recruitment data
const recruitmentData = {
  applicationStages: [
    { stage: 'Application Review', count: 12 },
    { stage: 'Initial Screening', count: 8 },
    { stage: 'First Interview', count: 5 },
    { stage: 'Second Interview', count: 3 },
    { stage: 'Reference Check', count: 2 },
    { stage: 'Job Offer', count: 1 }
  ],
  openPositions: [
    { id: 1, title: 'Senior Caregiver', department: 'Care Services', location: 'North London', status: 'active', posted: '15 Apr 2023', applications: 8 },
    { id: 2, title: 'Care Coordinator', department: 'Operations', location: 'Central London', status: 'interviewing', posted: '10 Apr 2023', applications: 12 },
    { id: 3, title: 'Night Shift Caregiver', department: 'Care Services', location: 'South London', status: 'active', posted: '20 Apr 2023', applications: 5 }
  ],
  recentApplications: [
    { id: 1, name: 'Sarah Johnson', position: 'Senior Caregiver', stage: 'Initial Screening', applied: '3 days ago' },
    { id: 2, name: 'Robert Lewis', position: 'Care Coordinator', stage: 'First Interview', applied: '5 days ago' },
    { id: 3, name: 'Emily Parker', position: 'Night Shift Caregiver', stage: 'Application Review', applied: '1 day ago' }
  ]
};

export default function StaffManagement() {
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  
  // State for the modal components
  const [supervisionModalData, setSupervisionModalData] = useState({
    isOpen: false,
    staffName: "",
    staffId: ""
  });
  
  const [reviewModalData, setReviewModalData] = useState({
    isOpen: false,
    staffName: "",
    staffId: "",
    missedVisits: 0,
    month: ""
  });
  
  const [newPositionModalOpen, setNewPositionModalOpen] = useState(false);
  const [viewCandidatesModalOpen, setViewCandidatesModalOpen] = useState(false);
  const [viewApplicationsModalOpen, setViewApplicationsModalOpen] = useState(false);
  
  // Functions to close the modals
  const closeSupervisionModal = () => {
    setSupervisionModalData({
      isOpen: false,
      staffName: "",
      staffId: ""
    });
  };
  
  const closeReviewModal = () => {
    setReviewModalData({
      isOpen: false,
      staffName: "",
      staffId: "",
      missedVisits: 0,
      month: ""
    });
  };
  
  // Sample staff data
  const staffList = [
    {
      id: 1,
      name: 'Jane Wilson',
      role: 'Senior Caregiver',
      email: 'jane.wilson@careunity.com',
      phone: '07700 900123',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-10-15',
      joinDate: '2021-06-10',
      qualifications: ['NVQ Level 3 Health & Social Care', 'First Aid', 'Medication Administration'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2024-05-20' },
        { name: 'Moving and Handling', status: 'valid', expiryDate: '2024-08-15' },
        { name: 'Medication Administration', status: 'expiring-soon', expiryDate: '2023-06-05' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2023-01-15', expiryDate: '2024-01-15', score: 92 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2023-02-20', expiryDate: '2024-02-20', score: 88 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2023-03-10', expiryDate: '2024-03-10', score: 90 },
        { id: 4, course: 'Infection Control', completed: false, completionDate: null, expiryDate: null, score: null }
      ],
      scheduledTraining: [
        { course: 'Mental Capacity Act', date: '2023-06-15', mandatory: true },
        { course: 'Infection Control Update', date: '2023-07-10', mandatory: true }
      ],
      performance: {
        punctualityRate: 97,
        serviceUserSatisfaction: 4.8,
        completedVisits: 128,
        missedVisits: 2,
        lateVisits: 4,
        incidentReports: 1,
        supervisionsCompleted: 3,
        supervisionsDue: false
      }
    },
    {
      id: 2,
      name: 'Michael Brown',
      role: 'Caregiver',
      email: 'michael.brown@careunity.com',
      phone: '07700 900456',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-09-20',
      joinDate: '2022-02-15',
      qualifications: ['NVQ Level 2 Health & Social Care', 'First Aid'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2023-12-10' },
        { name: 'Moving and Handling', status: 'expired', expiryDate: '2023-04-05' },
        { name: 'Medication Administration', status: 'not-completed', expiryDate: null }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2022-03-20', expiryDate: '2023-03-20', score: 85 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2022-04-15', expiryDate: '2023-04-15', score: 90 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2022-05-05', expiryDate: '2023-05-05', score: 82 },
      ],
      scheduledTraining: [
        { course: 'Medication Administration', date: '2023-06-20', mandatory: true },
        { course: 'Moving and Handling', date: '2023-06-05', mandatory: true }
      ],
      performance: {
        punctualityRate: 93,
        serviceUserSatisfaction: 4.5,
        completedVisits: 87,
        missedVisits: 1,
        lateVisits: 6,
        incidentReports: 0,
        supervisionsCompleted: 2,
        supervisionsDue: true
      }
    },
    {
      id: 3,
      name: 'David Thompson',
      role: 'Caregiver',
      email: 'david.thompson@careunity.com',
      phone: '07700 900789',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-08-10',
      joinDate: '2022-01-10',
      qualifications: ['NVQ Level 2 Health & Social Care', 'First Aid'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2024-02-15' },
        { name: 'Moving and Handling', status: 'valid', expiryDate: '2023-11-20' },
        { name: 'Medication Administration', status: 'valid', expiryDate: '2023-10-05' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2022-02-10', expiryDate: '2023-02-10', score: 88 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2022-03-05', expiryDate: '2023-03-05', score: 92 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2022-04-20', expiryDate: '2023-04-20', score: 85 },
      ],
      scheduledTraining: [
        { course: 'Infection Control Update', date: '2023-07-15', mandatory: true }
      ],
      performance: {
        punctualityRate: 89,
        serviceUserSatisfaction: 4.2,
        completedVisits: 102,
        missedVisits: 2,
        lateVisits: 11,
        incidentReports: 1,
        supervisionsCompleted: 2,
        supervisionsDue: true
      }
    }
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage staff, training, and recruitment</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={() => setShowAddStaffDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
          <Button 
            className="flex-1 sm:flex-none"
            onClick={() => {
              const csvData = staffList.map(staff => 
                `${staff.name},${staff.role},${staff.email},${staff.phone},${staff.joinDate}`
              ).join('\n');
              const blob = new Blob([`Name,Role,Email,Phone,Join Date\n${csvData}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'staff-export.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative grow md:grow-0 md:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search staff..." 
              className="pl-9" 
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="hidden md:flex items-center text-sm ml-auto">
            <span className="text-gray-500 mr-3">Sort by:</span>
            <select 
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="role"
            >
              <option value="name">Name</option>
              <option value="role">Role</option>
              <option value="date">Join Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="staff" className="mt-6">
        <TabsList className="mb-4 grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="staff">
            <Users className="h-4 w-4 mr-2" />
            Staff List
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="recruitment">
            <Briefcase className="h-4 w-4 mr-2" />
            Recruitment
          </TabsTrigger>
        </TabsList>
        
        {/* Staff List Tab */}
        <TabsContent value="staff">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Join Date</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-gray-500 text-xs">{staff.email}</div>
                    </TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell className="hidden md:table-cell">{staff.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{staff.joinDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge className={`${staff.dbsStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          DBS
                        </Badge>
                        <Badge className={`${staff.certifications.some(c => c.status === 'expired') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          Training
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedStaff(staff.id)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowTrainingDialog(true)}>
                            Add Training
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {selectedStaff && (
            <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Staff Profile</DialogTitle>
                  <DialogDescription>
                    View detailed information about this staff member
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-medium mb-4">
                        {staffList.find(s => s.id === selectedStaff)?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="text-lg font-medium">{staffList.find(s => s.id === selectedStaff)?.name}</h3>
                      <p className="text-gray-500">{staffList.find(s => s.id === selectedStaff)?.role}</p>
                      
                      <div className="w-full mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Email:</span>
                          <span className="font-medium">{staffList.find(s => s.id === selectedStaff)?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Phone:</span>
                          <span className="font-medium">{staffList.find(s => s.id === selectedStaff)?.phone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Join Date:</span>
                          <span className="font-medium">{staffList.find(s => s.id === selectedStaff)?.joinDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>DBS Status:</span>
                          <Badge className={`${staffList.find(s => s.id === selectedStaff)?.dbsStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {staffList.find(s => s.id === selectedStaff)?.dbsStatus === 'valid' ? 'Valid' : 'Expired'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>DBS Expiry:</span>
                          <span className="font-medium">{staffList.find(s => s.id === selectedStaff)?.dbsExpiryDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">Qualifications & Certifications</h3>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Qualifications</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {staffList.find(s => s.id === selectedStaff)?.qualifications.map((qual, idx) => (
                            <li key={idx}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Certifications</h4>
                        <div className="space-y-2">
                          {staffList.find(s => s.id === selectedStaff)?.certifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span>{cert.name}</span>
                              <Badge className={`
                                ${cert.status === 'valid' ? 'bg-green-100 text-green-800' : 
                                  cert.status === 'expiring-soon' ? 'bg-yellow-100 text-yellow-800' :
                                  cert.status === 'expired' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {cert.status === 'valid' ? 'Valid until' : 
                                 cert.status === 'expiring-soon' ? 'Expiring' : 
                                 cert.status === 'expired' ? 'Expired' : 
                                 'Not Completed'}
                                {cert.expiryDate && ` ${cert.expiryDate}`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">Training Records</h3>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Completion</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {staffList.find(s => s.id === selectedStaff)?.training.map((training) => (
                            <TableRow key={training.id}>
                              <TableCell>{training.course}</TableCell>
                              <TableCell>
                                <Badge className={training.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {training.completed ? 'Completed' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>{training.completionDate || '-'}</TableCell>
                              <TableCell>{training.expiryDate || '-'}</TableCell>
                              <TableCell>{training.score || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Scheduled Training</h4>
                        {staffList.find(s => s.id === selectedStaff)?.scheduledTraining.length === 0 ? (
                          <p className="text-sm text-gray-500">No scheduled training</p>
                        ) : (
                          <div className="space-y-2">
                            {staffList.find(s => s.id === selectedStaff)?.scheduledTraining.map((training, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span>{training.course}</span>
                                <div>
                                  <span className="text-gray-500 mr-2">{training.date}</span>
                                  {training.mandatory && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      Mandatory
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedStaff(null)}>
                    Close
                  </Button>
                  <Button>
                    Edit Profile
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new staff member
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Full Name
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input id="phone" type="tel" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <select 
                    id="role"
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="caregiver">Caregiver</option>
                    <option value="senior">Senior Caregiver</option>
                    <option value="coordinator">Care Coordinator</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dbs" className="text-right">
                    DBS Number
                  </Label>
                  <Input id="dbs" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dbs-date" className="text-right">
                    DBS Issue Date
                  </Label>
                  <Input id="dbs-date" type="date" className="col-span-3" />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddStaffDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert('In a real application, this would add a new staff member');
                  setShowAddStaffDialog(false);
                }}>
                  Add Staff Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Training Record</DialogTitle>
                <DialogDescription>
                  Add a new training record for this staff member
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="staff" className="text-right">
                    Staff Member
                  </Label>
                  <select 
                    id="staff"
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course" className="text-right">
                    Course
                  </Label>
                  <select 
                    id="course"
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="dementia">Dementia Awareness</option>
                    <option value="safeguarding">Safeguarding Adults</option>
                    <option value="fire">Fire Safety</option>
                    <option value="infection">Infection Control</option>
                    <option value="moving">Moving and Handling</option>
                    <option value="medication">Medication Administration</option>
                    <option value="mca">Mental Capacity Act</option>
                    <option value="first-aid">First Aid</option>
                    <option value="food">Food Hygiene</option>
                    <option value="health">Health and Safety</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="completion-date" className="text-right">
                    Completion Date
                  </Label>
                  <Input id="completion-date" type="date" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry-date" className="text-right">
                    Expiry Date
                  </Label>
                  <Input id="expiry-date" type="date" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="score" className="text-right">
                    Score (%)
                  </Label>
                  <Input id="score" type="number" min="0" max="100" className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea id="notes" className="col-span-3" />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert('In a real application, this would add a new training record');
                  setShowTrainingDialog(false);
                }}>
                  Add Training Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Issues</CardTitle>
                <CardDescription>Staff requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">Late Arrivals</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-medium text-xs">
                            MB
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">Michael Brown</div>
                            <div className="text-xs text-gray-500">7% late arrivals</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSupervisionModalData({ 
                            isOpen: true, 
                            staffName: "Michael Brown", 
                            staffId: "mb1" 
                          })}
                        >
                          Supervise
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-medium text-xs">
                            DT
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">David Thompson</div>
                            <div className="text-xs text-gray-500">11% late arrivals</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSupervisionModalData({ 
                            isOpen: true, 
                            staffName: "David Thompson", 
                            staffId: "dt1" 
                          })}
                        >
                          Supervise
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Missed Visits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium text-xs">
                            JW
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">Jane Wilson</div>
                            <div className="text-xs text-gray-500">2 missed visits in May</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setReviewModalData({ 
                            isOpen: true, 
                            staffName: "Jane Wilson", 
                            staffId: "jw1",
                            missedVisits: 2,
                            month: "May" 
                          })}
                        >
                          Review
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium text-xs">
                            DT
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">David Thompson</div>
                            <div className="text-xs text-gray-500">2 missed visits in May</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setReviewModalData({ 
                            isOpen: true, 
                            staffName: "David Thompson", 
                            staffId: "dt1",
                            missedVisits: 2,
                            month: "May" 
                          })}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Supervisions Due</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-xs">
                            MB
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">Michael Brown</div>
                            <div className="text-xs text-gray-500">Last supervision: 28 Mar 2023</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSupervisionModalData({ 
                            isOpen: true, 
                            staffName: "Michael Brown", 
                            staffId: "mb1" 
                          })}
                        >
                          Schedule
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-xs">
                            DT
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">David Thompson</div>
                            <div className="text-xs text-gray-500">Last supervision: 15 Mar 2023</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSupervisionModalData({ 
                            isOpen: true, 
                            staffName: "David Thompson", 
                            staffId: "dt1" 
                          })}
                        >
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>Performance trends over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="punctuality"
                  >
                    <option value="punctuality">Punctuality</option>
                    <option value="satisfaction">Satisfaction</option>
                    <option value="missed">Missed Visits</option>
                    <option value="late">Late Visits</option>
                  </select>
                  
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="6month"
                  >
                    <option value="3month">Last 3 Months</option>
                    <option value="6month">Last 6 Months</option>
                    <option value="12month">Last 12 Months</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-400 italic text-center">
                  <div>Interactive chart would be displayed here</div>
                  <div className="text-sm">Showing punctuality rate trend over the last 6 months</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruitment Pipeline Tab */}
        <TabsContent value="recruitment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline</CardTitle>
                <CardDescription>Current applicants by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentData.applicationStages.map((stage, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{stage.stage}</span>
                        <span className="text-sm font-medium">{stage.count}</span>
                      </div>
                      <Progress value={stage.count * 5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setViewCandidatesModalOpen(true)}>View All Candidates</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>Active job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentData.openPositions.map((position) => (
                    <div key={position.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{position.title}</div>
                          <div className="text-sm text-gray-500">{position.department} • {position.location}</div>
                        </div>
                        <Badge className={`
                          ${position.status === 'active' ? 'bg-green-100 text-green-800' : 
                            position.status === 'interviewing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {position.status === 'active' ? 'Active' : 
                           position.status === 'interviewing' ? 'Interviewing' : 
                           'Closed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Posted: {position.posted}</span>
                        <span className="font-medium">{position.applications} applications</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setNewPositionModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Position
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentData.recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium">
                          {application.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{application.name}</div>
                          <div className="text-xs text-gray-500">{application.position}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {application.stage}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{application.applied}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setViewApplicationsModalOpen(true)}
                >
                  View All Applications
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recruitment Analytics</CardTitle>
                  <CardDescription>Key metrics and insights</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="3month"
                  >
                    <option value="1month">Last Month</option>
                    <option value="3month">Last 3 Months</option>
                    <option value="6month">Last 6 Months</option>
                    <option value="12month">Last 12 Months</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-500">New Applications</div>
                  <div className="text-2xl font-bold mt-1">38</div>
                  <div className="text-xs text-green-600 mt-1">+12% from last period</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-500">Avg. Time to Hire</div>
                  <div className="text-2xl font-bold mt-1">18 days</div>
                  <div className="text-xs text-red-600 mt-1">+3 days from last period</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-500">Interview to Offer</div>
                  <div className="text-2xl font-bold mt-1">42%</div>
                  <div className="text-xs text-green-600 mt-1">+5% from last period</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-500">Offer Acceptance</div>
                  <div className="text-2xl font-bold mt-1">85%</div>
                  <div className="text-xs text-gray-500 mt-1">No change from last period</div>
                </div>
              </div>
              
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400 italic text-center">
                  <div>Interactive chart would be displayed here</div>
                  <div className="text-sm">Showing application volume trend over time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Render the modals */}
      <ScheduleSupervisionModal
        isOpen={supervisionModalData.isOpen}
        onClose={closeSupervisionModal}
        staffName={supervisionModalData.staffName}
        staffId={supervisionModalData.staffId}
      />
      
      <MissedVisitReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={closeReviewModal}
        staffName={reviewModalData.staffName}
        staffId={reviewModalData.staffId}
        missedVisits={reviewModalData.missedVisits}
        month={reviewModalData.month}
      />
      
      <NewPositionModal
        isOpen={newPositionModalOpen}
        onClose={() => setNewPositionModalOpen(false)}
      />
      
      <ViewCandidatesModal
        isOpen={viewCandidatesModalOpen}
        onClose={() => setViewCandidatesModalOpen(false)}
      />
      
      <ViewApplicationsModal
        isOpen={viewApplicationsModalOpen}
        onClose={() => setViewApplicationsModalOpen(false)}
      />
    </div>
  );
}