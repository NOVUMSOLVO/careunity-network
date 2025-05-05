import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpDown, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ViewApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample applications data
const applicationsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Senior Caregiver",
    department: "Care Services",
    location: "North London",
    stage: "Initial Screening",
    applied: "3 days ago",
    date: "2023-05-01",
  },
  {
    id: 2,
    name: "Robert Lewis",
    position: "Care Coordinator",
    department: "Operations",
    location: "Central London",
    stage: "First Interview",
    applied: "5 days ago",
    date: "2023-04-28",
  },
  {
    id: 3,
    name: "Emily Parker",
    position: "Night Shift Caregiver",
    department: "Care Services",
    location: "South London",
    stage: "Application Review",
    applied: "1 day ago",
    date: "2023-05-03",
  },
  {
    id: 4,
    name: "James Wilson",
    position: "Senior Caregiver",
    department: "Care Services",
    location: "East London",
    stage: "Second Interview",
    applied: "10 days ago",
    date: "2023-04-24",
  },
  {
    id: 5,
    name: "Maria Rodriguez",
    position: "Care Coordinator",
    department: "Operations",
    location: "West London",
    stage: "Reference Check",
    applied: "12 days ago",
    date: "2023-04-22",
  },
  {
    id: 6,
    name: "David Chen",
    position: "Caregiver",
    department: "Care Services",
    location: "North London",
    stage: "Job Offer",
    applied: "15 days ago",
    date: "2023-04-19",
  },
  {
    id: 7,
    name: "Sophia Brown",
    position: "Night Shift Caregiver",
    department: "Care Services",
    location: "South London",
    stage: "Rejected",
    applied: "20 days ago",
    date: "2023-04-14",
  },
  {
    id: 8,
    name: "Liam Harris",
    position: "Senior Caregiver",
    department: "Care Services",
    location: "East London",
    stage: "On Hold",
    applied: "11 days ago",
    date: "2023-04-23",
  },
  {
    id: 9,
    name: "Olivia Martinez",
    position: "Care Coordinator",
    department: "Operations",
    location: "Central London",
    stage: "Initial Screening",
    applied: "7 days ago",
    date: "2023-04-27",
  },
  {
    id: 10,
    name: "Noah Thompson",
    position: "Caregiver",
    department: "Care Services",
    location: "West London",
    stage: "Application Review",
    applied: "2 days ago",
    date: "2023-05-02",
  },
  {
    id: 11,
    name: "Ava Davis",
    position: "Senior Caregiver",
    department: "Care Services",
    location: "North London",
    stage: "First Interview",
    applied: "9 days ago",
    date: "2023-04-25",
  },
  {
    id: 12,
    name: "Isabella Wilson",
    position: "Night Shift Caregiver",
    department: "Care Services",
    location: "South London",
    stage: "Application Review", 
    applied: "4 days ago",
    date: "2023-04-30",
  },
];

export function ViewApplicationsModal({
  isOpen,
  onClose,
}: ViewApplicationsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  
  // Get unique positions and locations for filters using object keys to avoid Set iteration issues
  const positionsSet: {[key: string]: boolean} = {};
  const locationsSet: {[key: string]: boolean} = {};
  
  applicationsData.forEach(app => {
    positionsSet[app.position] = true;
    locationsSet[app.location] = true;
  });
  
  const uniquePositions = Object.keys(positionsSet);
  const uniqueLocations = Object.keys(locationsSet);
  
  // Filter applications based on search query and filters
  const filteredApplications = applicationsData
    .filter(application => {
      const matchesSearch = 
        application.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPosition = filterPosition === "all" || application.position === filterPosition;
      const matchesLocation = filterLocation === "all" || application.location === filterLocation;
      
      return matchesSearch && matchesPosition && matchesLocation;
    })
    .sort((a, b) => {
      if (sortField === "date") {
        return sortOrder === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === "position") {
        return sortOrder === "asc"
          ? a.position.localeCompare(b.position)
          : b.position.localeCompare(a.position);
      } else if (sortField === "stage") {
        return sortOrder === "asc"
          ? a.stage.localeCompare(b.stage)
          : b.stage.localeCompare(a.stage);
      }
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Applications</DialogTitle>
          <DialogDescription>
            View and manage all job applications
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search applications..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="position-filter" className="text-sm font-medium mb-1.5 block">Position</Label>
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger id="position-filter">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map((position) => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location-filter" className="text-sm font-medium mb-1.5 block">Location</Label>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                  <div className="flex items-center">
                    Name
                    {sortField === "name" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("position")}>
                  <div className="flex items-center">
                    Position
                    {sortField === "position" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                  <div className="flex items-center">
                    Applied
                    {sortField === "date" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("stage")}>
                  <div className="flex items-center">
                    Stage
                    {sortField === "stage" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No applications found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">{application.name}</div>
                    </TableCell>
                    <TableCell>
                      <div>{application.position}</div>
                      <div className="text-gray-500 text-xs">{application.department}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{application.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        <span>{application.applied}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`
                        ${application.stage === 'Initial Screening' ? 'bg-blue-100 text-blue-800' : 
                          application.stage === 'Application Review' ? 'bg-gray-100 text-gray-800' :
                          application.stage === 'First Interview' ? 'bg-purple-100 text-purple-800' :
                          application.stage === 'Second Interview' ? 'bg-indigo-100 text-indigo-800' :
                          application.stage === 'Reference Check' ? 'bg-amber-100 text-amber-800' :
                          application.stage === 'Job Offer' ? 'bg-green-100 text-green-800' :
                          application.stage === 'Rejected' ? 'bg-red-100 text-red-800' :
                          application.stage === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {application.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // In a real app, this would navigate to application details
                          alert(`View ${application.name}'s application for ${application.position}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Label({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}