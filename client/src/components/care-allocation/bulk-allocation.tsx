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
  Check, 
  RefreshCw, 
  UserCheck, 
  Briefcase, 
  Users, 
  FileCog,
  FileCheck,
  Download,
  Upload,
  AlertCircle,
  Info,
  Repeat,
  Trash2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from '@/components/ui/calendar';
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

export interface BulkAllocationProps {
  className?: string;
}

// Sample data for bulk allocation capabilities
const allocationTemplates = [
  { id: 1, name: 'Standard Weekly Schedule', description: 'Regular weekly visits for service users with consistent needs', duration: '1 year', visitCount: 4680, lastUpdated: '2023-05-12' },
  { id: 2, name: 'Monthly Care Review Pattern', description: 'Monthly care review visits with supporting daily care visits', duration: '6 months', visitCount: 1872, lastUpdated: '2023-09-03' },
  { id: 3, name: 'Post-Hospital Support', description: 'Intensive initial support tapering to regular visits', duration: '3 months', visitCount: 540, lastUpdated: '2023-11-21' },
  { id: 4, name: 'Weekend Coverage Rota', description: 'Weekend-only visits with rotating staff allocation', duration: '1 year', visitCount: 1040, lastUpdated: '2024-01-07' },
];

// Sample service users for allocation
const serviceUsers = [
  { id: 1, name: 'Elizabeth Johnson', category: 'Personal Care', frequency: 'Daily', nextReview: '2024-06-12', status: 'active' },
  { id: 2, name: 'Robert Wilson', category: 'Medication Support', frequency: 'Daily', nextReview: '2024-05-22', status: 'active' },
  { id: 3, name: 'Mary Thompson', category: 'Meal Preparation', frequency: 'Weekdays', nextReview: '2024-07-05', status: 'active' },
  { id: 4, name: 'James Lewis', category: 'Mobility Support', frequency: '3x Weekly', nextReview: '2024-08-18', status: 'active' },
  { id: 5, name: 'Sarah Adams', category: 'Social Support', frequency: 'Weekly', nextReview: '2024-05-30', status: 'active' },
  { id: 6, name: 'Michael Brown', category: 'Personal Care', frequency: 'Daily', nextReview: '2024-06-25', status: 'active' },
  { id: 7, name: 'David Clark', category: 'Medication Support', frequency: 'Daily', nextReview: '2024-07-12', status: 'active' },
  { id: 8, name: 'Patricia Taylor', category: 'Meal Preparation', frequency: 'Daily', nextReview: '2024-05-28', status: 'active' },
];

// Sample carers for allocation
const carers = [
  { id: 1, name: 'John Smith', role: 'Care Worker', skills: ['Medication', 'Personal Care'], availability: 'Full-time', preferredArea: 'North' },
  { id: 2, name: 'Sarah Jones', role: 'Senior Carer', skills: ['Medication', 'Personal Care', 'Dementia Care'], availability: 'Full-time', preferredArea: 'Central' },
  { id: 3, name: 'Emma Wilson', role: 'Care Worker', skills: ['Personal Care', 'Meal Preparation'], availability: 'Part-time', preferredArea: 'South' },
  { id: 4, name: 'Michael Brown', role: 'Care Worker', skills: ['Mobility Support', 'Social Care'], availability: 'Full-time', preferredArea: 'East' },
  { id: 5, name: 'David Clark', role: 'Senior Carer', skills: ['Medication', 'Personal Care', 'Dementia Care'], availability: 'Full-time', preferredArea: 'West' },
];

export function BulkAllocation({ className }: BulkAllocationProps) {
  const [activeTab, setActiveTab] = useState<string>('setup');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date | undefined }>({
    from: new Date(),
    to: undefined,
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedCarers, setSelectedCarers] = useState<number[]>([]);
  const [allocationMethod, setAllocationMethod] = useState<string>('auto');
  const [allocationProgress, setAllocationProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Bulk allocation processing
  const startProcessing = () => {
    setIsProcessing(true);
    setAllocationProgress(0);
    setActiveTab('processing');
    
    // Simulate processing
    const interval = setInterval(() => {
      setAllocationProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowResults(true);
          setActiveTab('results');
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };
  
  // Toggle selection of service users
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Toggle selection of carers
  const toggleCarerSelection = (carerId: number) => {
    setSelectedCarers((prev) => 
      prev.includes(carerId)
        ? prev.filter(id => id !== carerId)
        : [...prev, carerId]
    );
  };
  
  // Select all service users
  const selectAllUsers = () => {
    if (selectedUsers.length === serviceUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(serviceUsers.map(user => user.id));
    }
  };
  
  // Select all carers
  const selectAllCarers = () => {
    if (selectedCarers.length === carers.length) {
      setSelectedCarers([]);
    } else {
      setSelectedCarers(carers.map(carer => carer.id));
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bulk Allocation System</CardTitle>
        <CardDescription>
          Plan and allocate care visits up to 12 months in advance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="setup" disabled={isProcessing}>Setup</TabsTrigger>
            <TabsTrigger value="processing" disabled={!isProcessing && !showResults}>Processing</TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
          </TabsList>
          
          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {/* Step 1: Choose Template */}
            <div>
              <h3 className="text-md font-medium flex items-center mb-3">
                <FileCog className="mr-2 h-5 w-5 text-indigo-600" />
                Step 1: Choose Allocation Template
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Select</TableHead>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Visit Count</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationTemplates.map((template) => (
                      <TableRow key={template.id} className={selectedTemplate === template.id ? 'bg-indigo-50' : ''}>
                        <TableCell>
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={selectedTemplate === template.id}
                              onCheckedChange={() => setSelectedTemplate(template.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.description}</TableCell>
                        <TableCell>{template.duration}</TableCell>
                        <TableCell>{template.visitCount.toLocaleString()}</TableCell>
                        <TableCell>{template.lastUpdated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Create New Template</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Allocation Template</DialogTitle>
                      <DialogDescription>
                        Define a new pattern for bulk allocation of care visits
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm">Name</label>
                        <Input id="name" className="col-span-3" placeholder="Template name" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right text-sm">Description</label>
                        <Input id="description" className="col-span-3" placeholder="Template description" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="duration" className="text-right text-sm">Duration</label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3months">3 Months</SelectItem>
                            <SelectItem value="6months">6 Months</SelectItem>
                            <SelectItem value="9months">9 Months</SelectItem>
                            <SelectItem value="1year">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Step 2: Set Date Range */}
            <div>
              <h3 className="text-md font-medium flex items-center mb-3">
                <CalendarIcon className="mr-2 h-5 w-5 text-indigo-600" />
                Step 2: Set Allocation Period
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Start Date</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="justify-start text-left font-normal w-[240px]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "PPP")
                        ) : (
                          <span>Select start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, from: date as Date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">End Date</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="justify-start text-left font-normal w-[240px]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "PPP")
                        ) : (
                          <span>Select end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, to: date as Date })
                        }
                        initialFocus
                        disabled={(date) => date < (dateRange.from || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quick Select</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const today = new Date();
                      const threeMonths = new Date();
                      threeMonths.setMonth(today.getMonth() + 3);
                      setDateRange({ from: today, to: threeMonths });
                    }}>3 Months</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const today = new Date();
                      const sixMonths = new Date();
                      sixMonths.setMonth(today.getMonth() + 6);
                      setDateRange({ from: today, to: sixMonths });
                    }}>6 Months</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const today = new Date();
                      const oneYear = new Date();
                      oneYear.setFullYear(today.getFullYear() + 1);
                      setDateRange({ from: today, to: oneYear });
                    }}>1 Year</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3: Select Service Users */}
            <div>
              <h3 className="text-md font-medium flex items-center mb-3">
                <Users className="mr-2 h-5 w-5 text-indigo-600" />
                Step 3: Select Service Users for Bulk Allocation
              </h3>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-slate-500">
                  {selectedUsers.length} of {serviceUsers.length} service users selected
                </div>
                <Button variant="outline" size="sm" onClick={selectAllUsers}>
                  {selectedUsers.length === serviceUsers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedUsers.length === serviceUsers.length}
                          onCheckedChange={selectAllUsers}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Care Category</TableHead>
                      <TableHead>Visit Frequency</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceUsers.map((user) => (
                      <TableRow key={user.id} className={selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.category}</TableCell>
                        <TableCell>{user.frequency}</TableCell>
                        <TableCell>{user.nextReview}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Step 4: Select Carers */}
            <div>
              <h3 className="text-md font-medium flex items-center mb-3">
                <UserCheck className="mr-2 h-5 w-5 text-indigo-600" />
                Step 4: Select Available Carers
              </h3>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-slate-500">
                  {selectedCarers.length} of {carers.length} carers selected
                </div>
                <Button variant="outline" size="sm" onClick={selectAllCarers}>
                  {selectedCarers.length === carers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedCarers.length === carers.length}
                          onCheckedChange={selectAllCarers}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Preferred Area</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carers.map((carer) => (
                      <TableRow key={carer.id} className={selectedCarers.includes(carer.id) ? 'bg-indigo-50' : ''}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedCarers.includes(carer.id)}
                            onCheckedChange={() => toggleCarerSelection(carer.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{carer.name}</TableCell>
                        <TableCell>{carer.role}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {carer.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-slate-100 text-slate-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{carer.availability}</TableCell>
                        <TableCell>{carer.preferredArea}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Step 5: Configure Allocation Settings */}
            <div>
              <h3 className="text-md font-medium flex items-center mb-3">
                <Clock className="mr-2 h-5 w-5 text-indigo-600" />
                Step 5: Configure Allocation Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allocation Method</label>
                    <Select value={allocationMethod} onValueChange={setAllocationMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select allocation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Smart Balance)</SelectItem>
                        <SelectItem value="geographic">Geographic</SelectItem>
                        <SelectItem value="skills">Skills-Based</SelectItem>
                        <SelectItem value="preference">Preference-Based</SelectItem>
                        <SelectItem value="availability">Availability-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Continuity Preference</label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue placeholder="Select continuity preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (Same carers where possible)</SelectItem>
                        <SelectItem value="medium">Medium (Balance continuity with availability)</SelectItem>
                        <SelectItem value="low">Low (Prioritize other factors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Travel Optimization</label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel optimization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled (Minimize travel times)</SelectItem>
                        <SelectItem value="balanced">Balanced (Consider other factors)</SelectItem>
                        <SelectItem value="disabled">Disabled (Prioritize other factors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Handle Conflicts</label>
                    <Select defaultValue="alert">
                      <SelectTrigger>
                        <SelectValue placeholder="Select conflict handling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert (Pause and notify)</SelectItem>
                        <SelectItem value="auto">Auto-Resolve (Best guess)</SelectItem>
                        <SelectItem value="skip">Skip (Continue and flag)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Handling Staff Leave</label>
                    <Select defaultValue="reallocate">
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave handling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reallocate">Auto-Reallocate</SelectItem>
                        <SelectItem value="skip">Skip Allocation</SelectItem>
                        <SelectItem value="flag">Flag for Manual Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality Control</label>
                    <Select defaultValue="recommended">
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality control level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict (High quality, more exceptions)</SelectItem>
                        <SelectItem value="recommended">Recommended (Balanced)</SelectItem>
                        <SelectItem value="relaxed">Relaxed (Fewer exceptions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline">Save Draft</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        onClick={startProcessing} 
                        disabled={!selectedTemplate || !dateRange.to || selectedUsers.length === 0 || selectedCarers.length === 0}
                      >
                        Start Bulk Allocation
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!selectedTemplate ? "Please select a template" : 
                      !dateRange.to ? "Please select a date range" :
                      selectedUsers.length === 0 ? "Please select at least one service user" :
                      selectedCarers.length === 0 ? "Please select at least one carer" :
                      "Start the bulk allocation process"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TabsContent>
          
          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              {isProcessing ? (
                <>
                  <div className="bg-indigo-100 p-8 rounded-full">
                    <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-semibold text-center">Processing Bulk Allocation</h2>
                  <div className="text-gray-500 text-center max-w-md">
                    Creating and assigning {selectedUsers.length > 0 && selectedUsers.length} service users with {selectedCarers.length > 0 && selectedCarers.length} carers using {allocationMethod} allocation method.
                  </div>
                  
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{allocationProgress}%</span>
                    </div>
                    <Progress value={allocationProgress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-md">
                    <Info className="h-5 w-5" />
                    <span className="text-sm">This process may take several minutes for large allocations</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-100 p-8 rounded-full">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-center">Bulk Allocation Complete</h2>
                  <div className="text-gray-500 text-center max-w-md">
                    Successfully allocated 432 visits across {selectedUsers.length} service users and {selectedCarers.length} carers.
                  </div>
                  
                  <Button onClick={() => setActiveTab('results')}>
                    View Allocation Results
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-800">Allocated Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">432</div>
                  <div className="text-sm text-green-700 mt-1">100% of planned visits allocated</div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-800">Potential Conflicts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-900">12</div>
                  <div className="text-sm text-amber-700 mt-1">2.8% of visits need review</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-800">Allocation Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-900">{allocationMethod === 'auto' ? 'Auto (Smart Balance)' : allocationMethod}</div>
                  <div className="text-sm text-blue-700 mt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      <span>{dateRange.from && dateRange.to ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}` : 'Date range'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabs for different result views */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="conflicts">Conflicts (12)</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    Showing allocations for <span className="font-medium">May 6, 2024 - May 5, 2025</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Repeat className="h-4 w-4" />
                      Re-Run
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service User</TableHead>
                        <TableHead>Care Type</TableHead>
                        <TableHead>Allocated Visits</TableHead>
                        <TableHead>Primary Carers</TableHead>
                        <TableHead>Continuity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Elizabeth Johnson</TableCell>
                        <TableCell>Personal Care</TableCell>
                        <TableCell>365 <span className="text-gray-500 text-xs">(1/day)</span></TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">SJ</div>
                            <div className="h-7 w-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">JW</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3" /> 85%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Robert Wilson</TableCell>
                        <TableCell>Medication Support</TableCell>
                        <TableCell>365 <span className="text-gray-500 text-xs">(1/day)</span></TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">EW</div>
                            <div className="h-7 w-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">SJ</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                            <AlertCircle className="h-3 w-3" /> 68%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mary Thompson</TableCell>
                        <TableCell>Meal Preparation</TableCell>
                        <TableCell>261 <span className="text-gray-500 text-xs">(5/week)</span></TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">JW</div>
                            <div className="h-7 w-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white text-xs">MB</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3" /> 92%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">James Lewis</TableCell>
                        <TableCell>Mobility Support</TableCell>
                        <TableCell>156 <span className="text-gray-500 text-xs">(3/week)</span></TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white text-xs">MB</div>
                            <div className="h-7 w-7 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">EW</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3" /> 88%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
              </TabsContent>
              
              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Month
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Week
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Day
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Today</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">  
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="font-medium">May 2024</div>
                  </div>
                </div>
                
                <div className="border rounded-md h-[500px] flex items-center justify-center p-6 bg-slate-50">
                  <div className="text-center space-y-4">
                    <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto" />
                    <h3 className="text-lg font-medium">Calendar View</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      A visual calendar would display here showing all allocations with color coding for different carers and visit types.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Conflicts Tab */}
              <TabsContent value="conflicts" className="space-y-4">
                <div className="p-4 border rounded-md bg-amber-50 flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    The bulk allocation process identified 12 potential conflicts that need your attention.
                    These conflicts occurred where the system couldn't automatically determine the best allocation.
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Service User</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Suggestion</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-800">
                            Double Booking
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">Robert Wilson</TableCell>
                        <TableCell>May 15, 2024 10:00</TableCell>
                        <TableCell>Sarah Jones is already allocated to another visit</TableCell>
                        <TableCell>Assign John Smith instead</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2">Accept</Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">
                            Skill Gap
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">Elizabeth Johnson</TableCell>
                        <TableCell>June 3, 2024 15:30</TableCell>
                        <TableCell>No available carers with dementia care qualification</TableCell>
                        <TableCell>Reschedule or find qualified carer</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2">Resolve</Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            Leave Conflict
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">James Lewis</TableCell>
                        <TableCell>July 22, 2024 9:00</TableCell>
                        <TableCell>All preferred carers on annual leave</TableCell>
                        <TableCell>Assign alternative carer Emma Wilson</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2">Accept</Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Resolved
                  </Button>
                  <Button className="gap-2">
                    <Check className="h-4 w-4" />
                    Accept All Suggestions
                  </Button>
                </div>
              </TabsContent>
              
              {/* Statistics Tab */}
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Carer Workload Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Carer Workload Distribution</CardTitle>
                      <CardDescription>Allocation balance across care team</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'John Smith', visits: 108 },
                              { name: 'Sarah Jones', visits: 125 },
                              { name: 'Emma Wilson', visits: 93 },
                              { name: 'Michael Brown', visits: 102 },
                              { name: 'David Clark', visits: 118 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="visits" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Allocation Method Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Allocation Methods Used</CardTitle>
                      <CardDescription>Distribution of allocation methods</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Geographic', value: 120 },
                                { name: 'Skills', value: 150 },
                                { name: 'Preference', value: 82 },
                                { name: 'Availability', value: 80 },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Allocation Quality Metrics</CardTitle>
                    <CardDescription>Key performance indicators for this allocation batch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Continuity of Care</div>
                        <Progress value={85} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>85%</span>
                          <span>Target: 80%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Travel Efficiency</div>
                        <Progress value={78} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>78%</span>
                          <span>Target: 75%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Staff Satisfaction Prediction</div>
                        <Progress value={82} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>82%</span>
                          <span>Target: 85%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        {activeTab === 'setup' ? (
          <Button variant="outline">Import Settings</Button>
        ) : (
          <Button variant="outline" onClick={() => {
            setActiveTab('setup');
            setIsProcessing(false);
            setShowResults(false);
            setAllocationProgress(0);
          }}>
            New Allocation
          </Button>
        )}
        
        {activeTab === 'results' && (
          <Button className="gap-2">
            <FileCheck className="h-4 w-4" />
            Finalize & Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Additional icons not imported from Lucide
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}