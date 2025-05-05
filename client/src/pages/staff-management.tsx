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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<'staff' | 'training' | 'performance' | 'recruitment'>('staff');
  const [searchText, setSearchText] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  
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
      },
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: true, afternoon: true, evening: false },
        wednesday: { morning: false, afternoon: true, evening: true },
        thursday: { morning: true, afternoon: true, evening: false },
        friday: { morning: true, afternoon: false, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      },
      specialisms: ['Dementia', 'End of Life', 'Learning Disabilities'],
      notes: 'Excellent communication skills. Preferred by several service users with dementia.'
    },
    {
      id: 2,
      name: 'Michael Brown',
      role: 'Caregiver',
      email: 'michael.brown@careunity.com',
      phone: '07700 900456',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-11-20',
      joinDate: '2022-01-15',
      qualifications: ['NVQ Level 2 Health & Social Care', 'First Aid'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2024-03-10' },
        { name: 'Moving and Handling', status: 'expired', expiryDate: '2023-02-28' },
        { name: 'Food Hygiene', status: 'valid', expiryDate: '2023-12-15' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2023-02-15', expiryDate: '2024-02-15', score: 85 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2023-03-20', expiryDate: '2024-03-20', score: 90 },
        { id: 3, course: 'Fire Safety', completed: false, completionDate: null, expiryDate: null, score: null },
      ],
      scheduledTraining: [
        { course: 'Moving and Handling Refresher', date: '2023-05-25', mandatory: true },
        { course: 'Fire Safety', date: '2023-06-05', mandatory: true }
      ],
      performance: {
        punctualityRate: 92,
        serviceUserSatisfaction: 4.6,
        completedVisits: 85,
        missedVisits: 1,
        lateVisits: 6,
        incidentReports: 0,
        supervisionsCompleted: 2,
        supervisionsDue: true
      },
      availability: {
        monday: { morning: true, afternoon: true, evening: true },
        tuesday: { morning: true, afternoon: true, evening: true },
        wednesday: { morning: true, afternoon: false, evening: false },
        thursday: { morning: true, afternoon: true, evening: true },
        friday: { morning: true, afternoon: true, evening: false },
        saturday: { morning: false, afternoon: false, evening: true },
        sunday: { morning: false, afternoon: false, evening: true }
      },
      specialisms: ['Physical Disabilities', 'Reablement'],
      notes: 'Great with service users requiring physical support. Working towards NVQ Level 3.'
    },
    {
      id: 3,
      name: 'Emily Roberts',
      role: 'Senior Caregiver',
      email: 'emily.roberts@careunity.com',
      phone: '07700 900789',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2025-01-10',
      joinDate: '2020-11-05',
      qualifications: ['NVQ Level 3 Health & Social Care', 'Dementia Champion', 'First Aid'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2024-07-15' },
        { name: 'Moving and Handling', status: 'valid', expiryDate: '2024-05-20' },
        { name: 'Medication Administration', status: 'valid', expiryDate: '2024-09-10' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2022-12-10', expiryDate: '2023-12-10', score: 95 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2023-01-15', expiryDate: '2024-01-15', score: 92 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2023-02-20', expiryDate: '2024-02-20', score: 88 },
        { id: 4, course: 'Infection Control', completed: true, completionDate: '2023-03-15', expiryDate: '2024-03-15', score: 90 }
      ],
      scheduledTraining: [
        { course: 'End of Life Care', date: '2023-08-10', mandatory: false },
      ],
      performance: {
        punctualityRate: 98,
        serviceUserSatisfaction: 4.9,
        completedVisits: 142,
        missedVisits: 0,
        lateVisits: 3,
        incidentReports: 2,
        supervisionsCompleted: 3,
        supervisionsDue: false
      },
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: true, afternoon: true, evening: false },
        wednesday: { morning: true, afternoon: true, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: true, afternoon: true, evening: false },
        saturday: { morning: true, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      },
      specialisms: ['Dementia', 'End of Life', 'Palliative Care'],
      notes: 'Excellent with dementia care. Leads internal training sessions for other staff members.'
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Caregiver',
      email: 'david.thompson@careunity.com',
      phone: '07700 900234',
      status: 'leave',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-09-05',
      joinDate: '2022-03-20',
      qualifications: ['NVQ Level 2 Health & Social Care'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2024-04-15' },
        { name: 'Moving and Handling', status: 'valid', expiryDate: '2023-10-20' },
        { name: 'Food Hygiene', status: 'valid', expiryDate: '2024-01-10' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2023-03-15', expiryDate: '2024-03-15', score: 82 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2023-04-10', expiryDate: '2024-04-10', score: 85 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2023-04-25', expiryDate: '2024-04-25', score: 80 },
      ],
      scheduledTraining: [
        { course: 'Mental Health Awareness', date: '2023-07-15', mandatory: false },
      ],
      performance: {
        punctualityRate: 90,
        serviceUserSatisfaction: 4.3,
        completedVisits: 65,
        missedVisits: 2,
        lateVisits: 7,
        incidentReports: 1,
        supervisionsCompleted: 2,
        supervisionsDue: true
      },
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: true, afternoon: true, evening: false },
        wednesday: { morning: true, afternoon: true, evening: false },
        thursday: { morning: true, afternoon: true, evening: false },
        friday: { morning: true, afternoon: true, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      },
      specialisms: ['Mental Health', 'Learning Disabilities'],
      notes: 'Currently on annual leave until June 15th, 2023. Has expressed interest in mental health training.'
    },
    {
      id: 5,
      name: 'Susan White',
      role: 'Team Leader',
      email: 'susan.white@careunity.com',
      phone: '07700 900567',
      status: 'active',
      dbsStatus: 'valid',
      dbsExpiryDate: '2024-12-18',
      joinDate: '2019-08-12',
      qualifications: ['NVQ Level 4 Health & Social Care', 'Leadership & Management', 'First Aid Instructor'],
      certifications: [
        { name: 'First Aid', status: 'valid', expiryDate: '2025-01-15' },
        { name: 'Moving and Handling', status: 'valid', expiryDate: '2024-11-20' },
        { name: 'Medication Administration', status: 'valid', expiryDate: '2024-08-10' },
        { name: 'Safeguarding Lead', status: 'valid', expiryDate: '2024-10-15' }
      ],
      training: [
        { id: 1, course: 'Dementia Awareness', completed: true, completionDate: '2022-10-15', expiryDate: '2023-10-15', score: 98 },
        { id: 2, course: 'Safeguarding Adults', completed: true, completionDate: '2022-11-20', expiryDate: '2023-11-20', score: 95 },
        { id: 3, course: 'Fire Safety', completed: true, completionDate: '2022-12-05', expiryDate: '2023-12-05', score: 90 },
        { id: 4, course: 'Infection Control', completed: true, completionDate: '2023-01-10', expiryDate: '2024-01-10', score: 92 },
        { id: 5, course: 'Leadership Skills', completed: true, completionDate: '2023-02-15', expiryDate: '2024-02-15', score: 94 }
      ],
      scheduledTraining: [],
      performance: {
        punctualityRate: 99,
        serviceUserSatisfaction: 4.9,
        completedVisits: 78,
        missedVisits: 0,
        lateVisits: 1,
        incidentReports: 0,
        supervisionsCompleted: 4,
        supervisionsDue: false
      },
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: true, afternoon: true, evening: false },
        wednesday: { morning: true, afternoon: true, evening: false },
        thursday: { morning: true, afternoon: true, evening: false },
        friday: { morning: true, afternoon: true, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      },
      specialisms: ['Dementia', 'End of Life', 'Complex Care', 'Supervisory'],
      notes: 'Team leader for East district. Conducts monthly supervision sessions and is responsible for performance reviews.'
    }
  ];

  // Filter staff based on search
  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Training to renew (expiring in next 30 days)
  const trainingToRenew = staffList.flatMap(staff => {
    return staff.certifications
      .filter(cert => cert.status === 'expiring-soon' || cert.status === 'expired')
      .map(cert => ({
        staffId: staff.id,
        staffName: staff.name,
        certification: cert.name,
        expiryDate: cert.expiryDate,
        status: cert.status
      }));
  });

  // Recruitment data
  const recruitmentData = {
    openPositions: [
      { id: 1, title: 'Care Assistant', department: 'Home Care', location: 'North London', applications: 6, status: 'active', posted: '2023-05-01' },
      { id: 2, title: 'Senior Care Worker', department: 'Home Care', location: 'East London', applications: 3, status: 'active', posted: '2023-05-10' },
      { id: 3, title: 'Care Coordinator', department: 'Office', location: 'Central London', applications: 8, status: 'interviewing', posted: '2023-04-15' },
    ],
    applicationStages: [
      { stage: 'New Applications', count: 12 },
      { stage: 'Screening', count: 5 },
      { stage: 'Interview', count: 8 },
      { stage: 'Assessment', count: 3 },
      { stage: 'Reference Check', count: 2 },
      { stage: 'DBS Check', count: 4 },
      { stage: 'Offer', count: 1 },
    ],
    recentApplications: [
      { id: 1, name: 'Robert Johnson', position: 'Care Assistant', stage: 'Screening', applied: '2023-05-15' },
      { id: 2, name: 'Mary Smith', position: 'Senior Care Worker', stage: 'Interview', applied: '2023-05-10' },
      { id: 3, name: 'James Wilson', position: 'Care Assistant', stage: 'Assessment', applied: '2023-05-08' },
      { id: 4, name: 'Sarah Davis', position: 'Care Coordinator', stage: 'Reference Check', applied: '2023-05-05' },
      { id: 5, name: 'Thomas Brown', position: 'Care Assistant', stage: 'New Application', applied: '2023-05-18' },
    ]
  };

  // Render the certification status badge
  const getCertificationStatusBadge = (status: string) => {
    switch(status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Valid</Badge>;
      case 'expiring-soon':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expired</Badge>;
      default:
        return null;
    }
  };

  // Render staff status badge
  const getStaffStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'leave':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">On Leave</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600">Manage staff records, training, and performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => alert('Export functionality will be implemented soon')}
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddStaffDialog(true)}
          >
            <UserPlus size={16} />
            <span>Add Staff</span>
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="staff" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">Staff Directory</span>
            <span className="inline sm:hidden">Directory</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Award size={16} />
            <span className="hidden sm:inline">Training & Certifications</span>
            <span className="inline sm:hidden">Training</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart2 size={16} />
            <span className="hidden sm:inline">Performance Metrics</span>
            <span className="inline sm:hidden">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="flex items-center gap-2">
            <Briefcase size={16} />
            <span className="hidden sm:inline">Recruitment Pipeline</span>
            <span className="inline sm:hidden">Recruitment</span>
          </TabsTrigger>
        </TabsList>

        {/* Staff Directory Tab */}
        <TabsContent value="staff" className="space-y-4">
          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search staff by name, role or email..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">All Roles</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="senior-caregiver">Senior Caregiver</option>
                  <option value="team-leader">Team Leader</option>
                </select>
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Staff listing table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DBS Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialisms
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr 
                    key={staff.id} 
                    className={`hover:bg-gray-50 ${selectedStaff === staff.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedStaff(staff.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.email}</div>
                      <div className="text-sm text-gray-500">{staff.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStaffStatusBadge(staff.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{staff.dbsStatus}</div>
                      <div className="text-xs text-gray-500">Expires: {staff.dbsExpiryDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {staff.specialisms.slice(0, 2).map((specialism, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100">
                            {specialism}
                          </Badge>
                        ))}
                        {staff.specialisms.length > 2 && (
                          <Badge variant="outline" className="bg-gray-100">
                            +{staff.specialisms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => alert(`Edit staff member ${staff.name}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => setSelectedStaff(staff.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected staff details */}
          {selectedStaff && (
            <div className="bg-white rounded-lg shadow p-6">
              {(() => {
                const staff = staffList.find(s => s.id === selectedStaff);
                if (!staff) return null;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Basic info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Information</h3>
                      
                      <div className="flex items-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-medium text-gray-900">{staff.name}</h4>
                          <p className="text-gray-500">{staff.role}</p>
                          <div className="mt-1">{getStaffStatusBadge(staff.status)}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Contact Information</h5>
                          <p className="text-sm">{staff.email}</p>
                          <p className="text-sm">{staff.phone}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Employment</h5>
                          <p className="text-sm">Joined: {staff.joinDate}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">DBS Check</h5>
                          <p className="text-sm">Status: <span className="capitalize">{staff.dbsStatus}</span></p>
                          <p className="text-sm">Expiry: {staff.dbsExpiryDate}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Notes</h5>
                          <p className="text-sm">{staff.notes}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Middle column - Qualifications and Training */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Qualifications & Training</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => setShowTrainingDialog(true)}
                        >
                          Add Training
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Qualifications</h5>
                          <ul className="space-y-1">
                            {staff.qualifications.map((qualification, index) => (
                              <li key={index} className="text-sm flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                {qualification}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Certifications</h5>
                          <div className="space-y-2">
                            {staff.certifications.map((cert, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm">{cert.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Exp: {cert.expiryDate}</span>
                                  {getCertificationStatusBadge(cert.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Training Completion</h5>
                          <div className="space-y-3">
                            {staff.training.map((training, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    {training.completed ? (
                                      <Check className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                    )}
                                    <span className="text-sm">{training.course}</span>
                                  </div>
                                  {training.completed && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                      {training.score}%
                                    </span>
                                  )}
                                </div>
                                {training.completed && (
                                  <div className="text-xs text-gray-500">
                                    Completed: {training.completionDate} • Expires: {training.expiryDate}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {staff.scheduledTraining.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Scheduled Training</h5>
                            <ul className="space-y-1">
                              {staff.scheduledTraining.map((training, index) => (
                                <li key={index} className="text-sm flex items-center">
                                  <CalendarDays className="h-4 w-4 text-blue-500 mr-1" />
                                  {training.course}
                                  <span className="text-xs text-gray-500 ml-1">({training.date})</span>
                                  {training.mandatory && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                      Mandatory
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right column - Performance and Availability */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance & Availability</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Performance Metrics</h5>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Punctuality</span>
                                <span 
                                  className={`text-sm font-medium ${
                                    staff.performance.punctualityRate >= 95 ? 'text-green-600' : 
                                    staff.performance.punctualityRate >= 90 ? 'text-yellow-600' : 
                                    'text-red-600'
                                  }`}
                                >
                                  {staff.performance.punctualityRate}%
                                </span>
                              </div>
                              <Progress value={staff.performance.punctualityRate} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Service User Satisfaction</span>
                                <span 
                                  className={`text-sm font-medium ${
                                    staff.performance.serviceUserSatisfaction >= 4.5 ? 'text-green-600' : 
                                    staff.performance.serviceUserSatisfaction >= 4.0 ? 'text-yellow-600' : 
                                    'text-red-600'
                                  }`}
                                >
                                  {staff.performance.serviceUserSatisfaction}/5
                                </span>
                              </div>
                              <Progress 
                                value={staff.performance.serviceUserSatisfaction * 20} 
                                className="h-2" 
                              />
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                              <div>
                                <div className="text-sm font-medium">
                                  {staff.performance.completedVisits}
                                </div>
                                <div className="text-xs text-gray-500">Completed Visits</div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium text-red-600">
                                  {staff.performance.missedVisits}
                                </div>
                                <div className="text-xs text-gray-500">Missed Visits</div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium text-yellow-600">
                                  {staff.performance.lateVisits}
                                </div>
                                <div className="text-xs text-gray-500">Late Visits</div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium">
                                  {staff.performance.incidentReports}
                                </div>
                                <div className="text-xs text-gray-500">Incident Reports</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm">Supervisions Completed: {staff.performance.supervisionsCompleted}</div>
                              {staff.performance.supervisionsDue && (
                                <div className="text-sm text-red-600 mt-1">
                                  Supervision due this month
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Weekly Availability</h5>
                          
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                              <div key={index} className="text-xs font-medium">
                                {day}
                              </div>
                            ))}
                            
                            {Object.entries(staff.availability).map(([day, times], index) => (
                              <div key={day} className="flex flex-col gap-1">
                                <div 
                                  className={`rounded-sm h-2 ${
                                    times.morning ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                  title={`${day.charAt(0).toUpperCase() + day.slice(1)} Morning`}
                                ></div>
                                <div 
                                  className={`rounded-sm h-2 ${
                                    times.afternoon ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                  title={`${day.charAt(0).toUpperCase() + day.slice(1)} Afternoon`}
                                ></div>
                                <div 
                                  className={`rounded-sm h-2 ${
                                    times.evening ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                  title={`${day.charAt(0).toUpperCase() + day.slice(1)} Evening`}
                                ></div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 text-center mt-2">
                            <div className="text-xs text-gray-500">Morning</div>
                            <div className="text-xs text-gray-500">Afternoon</div>
                            <div className="text-xs text-gray-500">Evening</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Specialisms</h5>
                          <div className="flex flex-wrap gap-1">
                            {staff.specialisms.map((specialism, index) => (
                              <Badge key={index} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                {specialism}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        {/* Training & Certifications Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Overview</CardTitle>
                <CardDescription>Current training compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mandatory Training Compliance</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>DBS Checks Valid</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Moving & Handling</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Medication Administration</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Safeguarding</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Full Report</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Training</CardTitle>
                <CardDescription>Sessions scheduled in next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Moving & Handling Refresher</div>
                        <div className="text-sm text-gray-500">May 25, 2023 • 09:30 - 16:30</div>
                        <div className="text-sm text-gray-500">Training Room A</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">5 Attendees</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Medication Administration</div>
                        <div className="text-sm text-gray-500">June 5, 2023 • 09:30 - 16:30</div>
                        <div className="text-sm text-gray-500">Online</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">3 Attendees</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Mental Capacity Act</div>
                        <div className="text-sm text-gray-500">June 15, 2023 • 13:00 - 16:00</div>
                        <div className="text-sm text-gray-500">Training Room B</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">8 Attendees</Badge>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Session
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Training to Renew</CardTitle>
                <CardDescription>Certifications expiring in next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {trainingToRenew.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No certifications expiring soon
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trainingToRenew.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.certification}</div>
                            <div className="text-sm">{item.staffName}</div>
                            <div className="text-sm text-gray-500">Expires: {item.expiryDate}</div>
                          </div>
                          {getCertificationStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Send Reminders</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Training Matrix</CardTitle>
                  <CardDescription>Training status for all staff members</CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Export Matrix
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Aid
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moving & Handling
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Safeguarding
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fire Safety
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dementia
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Infection Control
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffList.map((staff) => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          </div>
                        </td>
                        
                        {['First Aid', 'Moving and Handling', 'Medication Administration', 'Safeguarding Adults', 'Fire Safety', 'Dementia Awareness', 'Infection Control'].map((course, index) => {
                          const courseData = staff.training.find(t => t.course === course);
                          let status: string;
                          
                          if (!courseData) {
                            status = 'not-required';
                          } else if (!courseData.completed) {
                            status = 'pending';
                          } else {
                            // Check if the training is expired or will expire in 30 days
                            const expiryDate = new Date(courseData.expiryDate!);
                            const now = new Date();
                            const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            
                            if (daysToExpiry < 0) {
                              status = 'expired';
                            } else if (daysToExpiry <= 30) {
                              status = 'expiring-soon';
                            } else {
                              status = 'valid';
                            }
                          }
                          
                          return (
                            <td key={index} className="px-4 py-4 whitespace-nowrap text-center">
                              {status === 'valid' && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                              {status === 'expiring-soon' && <Clock className="h-5 w-5 text-yellow-500 mx-auto" />}
                              {status === 'expired' && <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                              {status === 'pending' && <Clock className="h-5 w-5 text-blue-500 mx-auto" />}
                              {status === 'not-required' && <span className="text-gray-300">-</span>}
                              
                              {courseData?.completionDate && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(courseData.completionDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">On-Time Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">95.2%</div>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">+2.4% vs last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Client Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.7/5</div>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">+0.2 vs last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Missed Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.8%</div>
                <div className="text-xs text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.53 3.22a.75.75 0 01.47.53L12.25 10h-2.5L8.5 3.75a.75.75 0 01.47-.53A49.98 49.98 0 0110 3a49.98 49.98 0 011.47.22z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.78 10.72a.75.75 0 01.75.75l-.74 10.43a.75.75 0 01-.76.7 49.93 49.93 0 01-7.52-.7.75.75 0 01-.61-.84l1.73-9.3a.75.75 0 01.75-.64h6.4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">+0.3% vs last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Staff Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">+3% vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance Ranking</CardTitle>
                <CardDescription>Based on client satisfaction and punctuality</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satisfaction
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punctuality
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...staffList]
                      .filter(staff => staff.status === 'active')
                      .sort((a, b) => b.performance.serviceUserSatisfaction - a.performance.serviceUserSatisfaction)
                      .map((staff, index) => (
                        <tr key={staff.id}>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium text-xs">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                <div className="text-xs text-gray-500">{staff.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">{staff.performance.serviceUserSatisfaction}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">{staff.performance.punctualityRate}%</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">{staff.performance.completedVisits}</div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Issues</CardTitle>
                <CardDescription>Staff requiring attention or improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Late Arrivals (&gt;5%)</h4>
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
                        <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm">
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
                <Button className="w-full" onClick={() => alert('All candidates will be displayed in the next release')}>View All Candidates</Button>
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
                  onClick={() => alert('New position form will be displayed in the next release')}
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
                  onClick={() => alert('All applications will be displayed in the next release')}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-3xl font-bold">35</div>
                  <div className="text-sm text-gray-500">Total Applications</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">+15% vs period</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold">18</div>
                  <div className="text-sm text-gray-500">Interview Conducted</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">+8% vs period</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-sm text-gray-500">Offers Extended</div>
                  <div className="text-xs text-yellow-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4 9.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 13.8l.813-2.846A.75.75 0 019 10.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 0010.466 13.8l.813-2.846A.75.75 0 0112 10.5c.001-.179.049-.354.143-.5L14.143 6l-2-2L8.5 7.143z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">Same as period</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold">4</div>
                  <div className="text-sm text-gray-500">New Hires</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">+2 vs period</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Recruitment Funnel</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Applications Received</span>
                        <span className="text-sm font-medium">35</span>
                      </div>
                      <div className="w-full bg-indigo-500 h-8 rounded-t-sm"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Initial Screening</span>
                        <span className="text-sm font-medium">24</span>
                      </div>
                      <div className="w-3/4 bg-indigo-500 h-8"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Interviews</span>
                        <span className="text-sm font-medium">18</span>
                      </div>
                      <div className="w-2/3 bg-indigo-500 h-8"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assessment</span>
                        <span className="text-sm font-medium">9</span>
                      </div>
                      <div className="w-1/3 bg-indigo-500 h-8"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Offers</span>
                        <span className="text-sm font-medium">5</span>
                      </div>
                      <div className="w-1/5 bg-indigo-500 h-8"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Hires</span>
                        <span className="text-sm font-medium">4</span>
                      </div>
                      <div className="w-1/6 bg-indigo-500 h-8 rounded-b-sm"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Recruitment Sources</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Indeed</span>
                          <span className="text-sm font-medium">42%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Company Website</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">LinkedIn</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Referrals</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Other</span>
                          <span className="text-sm font-medium">5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new staff member. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" placeholder="Enter email address" type="email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">Role *</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select role</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="senior-caregiver">Senior Caregiver</option>
                  <option value="team-leader">Team Leader</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dbsNumber">DBS Number</Label>
                <Input id="dbsNumber" placeholder="Enter DBS number" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dbsExpiryDate">DBS Expiry Date</Label>
                <Input id="dbsExpiryDate" type="date" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label>Qualifications</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-nvq2" />
                  <label htmlFor="qual-nvq2" className="text-sm">NVQ Level 2</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-nvq3" />
                  <label htmlFor="qual-nvq3" className="text-sm">NVQ Level 3</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-firstaid" />
                  <label htmlFor="qual-firstaid" className="text-sm">First Aid</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-manual" />
                  <label htmlFor="qual-manual" className="text-sm">Moving & Handling</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-med" />
                  <label htmlFor="qual-med" className="text-sm">Medication</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qual-dementia" />
                  <label htmlFor="qual-dementia" className="text-sm">Dementia Care</label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea 
                id="notes" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter any additional information"
              ></textarea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStaffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              alert('In a real application, this would create a new staff record');
              setShowAddStaffDialog(false);
            }}>
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Training Record</DialogTitle>
            <DialogDescription>
              Add a new training record for the selected staff member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="trainingType">Training Type *</Label>
              <select 
                id="trainingType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select training type</option>
                <option value="first-aid">First Aid</option>
                <option value="moving-handling">Moving and Handling</option>
                <option value="medication">Medication Administration</option>
                <option value="safeguarding">Safeguarding Adults</option>
                <option value="fire-safety">Fire Safety</option>
                <option value="infection-control">Infection Control</option>
                <option value="food-hygiene">Food Hygiene</option>
                <option value="dementia">Dementia Awareness</option>
                <option value="mca-dols">Mental Capacity Act</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="completionDate">Completion Date *</Label>
                <Input id="completionDate" type="date" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input id="expiryDate" type="date" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="trainingProvider">Training Provider</Label>
              <Input id="trainingProvider" placeholder="Enter training provider" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input id="certificateNumber" placeholder="Enter certificate number" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="score">Score/Grade</Label>
                <Input id="score" placeholder="Enter score or grade" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea 
                id="notes" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter any additional information"
              ></textarea>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="uploadCertificate" />
              <label htmlFor="uploadCertificate" className="text-sm font-medium leading-none">
                Remind me to upload certificate
              </label>
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
    </div>
  );
}