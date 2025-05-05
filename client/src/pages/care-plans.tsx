import React, { useState } from 'react';
import { FilePlus, Search, Clipboard, CheckCircle, Clock, AlertCircle, UserPlus, CalendarRange, Activity, PencilLine, FileCheck, ListChecks, PlusCircle } from 'lucide-react';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CarePlans() {
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - would come from API in a real app
  const carePlans = [
    {
      id: 1,
      title: 'Daily Living Support Plan',
      serviceUser: 'John Smith',
      lastUpdated: '2023-04-15',
      status: 'active',
      completionPercentage: 75,
      goals: 6,
      tasks: 12,
      assignedTo: 'Jane Wilson'
    },
    {
      id: 2,
      title: 'Medication Management Plan',
      serviceUser: 'Sarah Johnson',
      lastUpdated: '2023-04-10',
      status: 'active',
      completionPercentage: 50,
      goals: 4,
      tasks: 8,
      assignedTo: 'Michael Brown'
    },
    {
      id: 3,
      title: 'Mobility Support Plan',
      serviceUser: 'Robert Davis',
      lastUpdated: '2023-04-05',
      status: 'review',
      completionPercentage: 90,
      goals: 3,
      tasks: 9,
      assignedTo: 'Emily Roberts'
    },
    {
      id: 4,
      title: 'Memory Support Plan',
      serviceUser: 'Emily Wilson',
      lastUpdated: '2023-03-28',
      status: 'draft',
      completionPercentage: 30,
      goals: 5,
      tasks: 15,
      assignedTo: 'David Thompson'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>;
      case 'review':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Needs Review</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Care Plans</h1>
          <p className="text-gray-600">Manage and track care plans for service users</p>
        </div>
        <button 
          onClick={() => setShowCreatePlanModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <FilePlus size={18} />
          <span>Create Care Plan</span>
        </button>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Search care plans or service users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Care plans list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carePlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{plan.title}</h3>
                  <p className="text-sm text-gray-600">For: {plan.serviceUser}</p>
                </div>
                {getStatusBadge(plan.status)}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{plan.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${plan.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4">
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-xs text-gray-500">Goals</p>
                  <p className="font-semibold text-gray-700">{plan.goals}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tasks</p>
                  <p className="font-semibold text-gray-700">{plan.tasks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-700">{new Date(plan.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span>Assigned to: </span>
                  <span className="font-medium text-gray-700">{plan.assignedTo}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowDetailModal(true);
                  }} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Care Plan Modal */}
      <Dialog open={showCreatePlanModal} onOpenChange={setShowCreatePlanModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Care Plan</DialogTitle>
            <DialogDescription>
              Create a new care plan for a service user. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-title" className="text-right">
                Title
              </Label>
              <Input
                id="plan-title"
                placeholder="Enter care plan title"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service-user" className="text-right">
                Service User
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select service user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-smith">John Smith</SelectItem>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="robert-davis">Robert Davis</SelectItem>
                  <SelectItem value="emily-wilson">Emily Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned-to" className="text-right">
                Assigned To
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select care staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jane-wilson">Jane Wilson</SelectItem>
                  <SelectItem value="michael-brown">Michael Brown</SelectItem>
                  <SelectItem value="emily-roberts">Emily Roberts</SelectItem>
                  <SelectItem value="david-thompson">David Thompson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-status" className="text-right">
                Status
              </Label>
              <Select defaultValue="draft">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter care plan description"
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlanModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowCreatePlanModal(false);
              alert("Care plan created successfully!");
            }}>
              Create Care Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Care Plan Details Modal */}
      {selectedPlan && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlan.title}</DialogTitle>
              <DialogDescription>
                Care plan for {selectedPlan.serviceUser}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals ({selectedPlan.goals})</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({selectedPlan.tasks})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Plan Status</h3>
                      <div className="mt-1 flex items-center">
                        {getStatusBadge(selectedPlan.status)}
                        <span className="ml-2 text-sm">{selectedPlan.status === 'active' ? 'Active' : selectedPlan.status === 'review' ? 'Needs Review' : 'Draft'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Service User</h3>
                      <div className="mt-1 flex items-center">
                        <UserPlus className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{selectedPlan.serviceUser}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                      <div className="mt-1 flex items-center">
                        <UserPlus className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{selectedPlan.assignedTo}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                      <div className="mt-1 flex items-center">
                        <CalendarRange className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(selectedPlan.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Completion Progress</h3>
                      <div className="mt-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{selectedPlan.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${selectedPlan.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        This care plan outlines the daily support needs for {selectedPlan.serviceUser}, including personalized goals and tasks to improve quality of life and independence.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Plan Actions</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.alert(`Opening edit form for ${selectedPlan.title}`);
                          }}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.alert(`Opening review form for ${selectedPlan.title}`);
                          }}
                        >
                          <FileCheck className="mr-2 h-4 w-4" />
                          Review Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.alert(`Opening goal creation form for ${selectedPlan.title}`);
                          }}
                        >
                          <ListChecks className="mr-2 h-4 w-4" />
                          Add Goal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="goals" className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-md font-medium">Care Goals</h3>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Goal
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: selectedPlan.goals }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Goal {i + 1}: {i % 3 === 0 ? 'Improve mobility' : i % 3 === 1 ? 'Medication compliance' : 'Social engagement'}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {i % 3 === 0 
                              ? 'Increase daily walking duration to improve strength and balance' 
                              : i % 3 === 1 
                                ? 'Maintain consistent medication schedule with no missed doses' 
                                : 'Participate in group activities twice weekly to reduce isolation'}
                          </p>
                        </div>
                        <Badge className={i % 3 === 0 ? 'bg-amber-100 text-amber-800' : i % 3 === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {i % 3 === 0 ? 'In Progress' : i % 3 === 1 ? 'Achieved' : 'Planned'}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span>Target date: </span>
                          <span className="font-medium">{new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Update Progress</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-md font-medium">Care Tasks</h3>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Task
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: Math.min(5, selectedPlan.tasks) }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <Checkbox id={`task-${i}`} checked={i % 3 === 0} />
                          <div>
                            <Label htmlFor={`task-${i}`} className="font-medium">
                              {i % 4 === 0 
                                ? 'Morning medication assistance' 
                                : i % 4 === 1 
                                  ? 'Assist with personal hygiene' 
                                  : i % 4 === 2
                                    ? 'Mealtime support'
                                    : 'Evening check-in'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              {i % 4 === 0 
                                ? 'Help with morning medication routine, ensuring all doses are taken correctly' 
                                : i % 4 === 1 
                                  ? 'Assist with washing, dressing, and personal care needs' 
                                  : i % 4 === 2
                                    ? 'Provide support during mealtimes, ensuring adequate nutrition'
                                    : 'Check well-being before bedtime, assist with evening routine'}
                            </p>
                          </div>
                        </div>
                        <Badge className={i % 3 === 0 ? 'bg-green-100 text-green-800' : i % 3 === 1 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}>
                          {i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'Scheduled' : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="mt-3 pl-7 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span>Due: </span>
                          <span className="font-medium">{new Date(Date.now() + (i * 1 * 24 * 60 * 60 * 1000)).toLocaleDateString()}</span>
                          <span className="ml-2">Assigned to: </span>
                          <span className="font-medium">{selectedPlan.assignedTo}</span>
                        </div>
                        <Button variant="outline" size="sm">Update Status</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedPlan.tasks > 5 && (
                  <div className="flex justify-center">
                    <Button variant="link">View All {selectedPlan.tasks} Tasks</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <h3 className="text-md font-medium">Plan History</h3>
                
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                        {i === 0 ? <PencilLine className="h-5 w-5" /> : 
                         i === 1 ? <CheckCircle className="h-5 w-5" /> :
                         i === 2 ? <ListChecks className="h-5 w-5" /> :
                         i === 3 ? <FileCheck className="h-5 w-5" /> :
                         <Activity className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {i === 0 ? 'Plan updated' : 
                             i === 1 ? 'Goal completed' :
                             i === 2 ? 'Task added' :
                             i === 3 ? 'Plan reviewed' :
                             'Progress updated'}
                          </p>
                          <span className="text-sm text-gray-500">
                            {new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {i === 0 ? `Plan details updated by ${selectedPlan.assignedTo}` : 
                           i === 1 ? 'Goal "Improve medication compliance" marked as completed' :
                           i === 2 ? 'New task "Weekly exercise routine" added to plan' :
                           i === 3 ? 'Quarterly plan review completed by care manager' :
                           'Progress on mobility goal updated to 75% complete'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button>
                Download Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}