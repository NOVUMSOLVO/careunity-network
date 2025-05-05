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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ViewCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample candidate data
const candidatesData = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Senior Caregiver",
    stage: "Initial Screening",
    applied: "3 days ago",
    email: "sarah.j@example.com",
    phone: "07700 900123",
    experience: "5 years in care",
    qualifications: ["NVQ Level 3 Health & Social Care", "First Aid"],
    status: "active"
  },
  {
    id: 2,
    name: "Robert Lewis",
    position: "Care Coordinator",
    stage: "First Interview",
    applied: "5 days ago",
    email: "robert.l@example.com",
    phone: "07700 900456",
    experience: "7 years in healthcare",
    qualifications: ["Registered Nurse", "Management Certification"],
    status: "active"
  },
  {
    id: 3,
    name: "Emily Parker",
    position: "Night Shift Caregiver",
    stage: "Application Review",
    applied: "1 day ago",
    email: "emily.p@example.com",
    phone: "07700 900789",
    experience: "2 years in care",
    qualifications: ["NVQ Level 2 Health & Social Care"],
    status: "active"
  },
  {
    id: 4,
    name: "James Wilson",
    position: "Senior Caregiver",
    stage: "Second Interview",
    applied: "10 days ago",
    email: "james.w@example.com",
    phone: "07700 900321",
    experience: "6 years in senior care",
    qualifications: ["NVQ Level 3 Health & Social Care", "Moving and Handling Trainer"],
    status: "active"
  },
  {
    id: 5,
    name: "Maria Rodriguez",
    position: "Care Coordinator",
    stage: "Reference Check",
    applied: "12 days ago",
    email: "maria.r@example.com",
    phone: "07700 900654",
    experience: "4 years in care, 2 years in coordination",
    qualifications: ["NVQ Level 3 Health & Social Care", "Leadership Certification"],
    status: "active"
  },
  {
    id: 6,
    name: "David Chen",
    position: "Caregiver",
    stage: "Job Offer",
    applied: "15 days ago",
    email: "david.c@example.com",
    phone: "07700 900987",
    experience: "3 years in home care",
    qualifications: ["NVQ Level 2 Health & Social Care", "First Aid"],
    status: "active"
  },
  {
    id: 7,
    name: "Sophia Brown",
    position: "Night Shift Caregiver",
    stage: "Rejected",
    applied: "20 days ago",
    email: "sophia.b@example.com",
    phone: "07700 900147",
    experience: "1 year in care",
    qualifications: ["Currently studying NVQ Level 2"],
    status: "rejected"
  },
  {
    id: 8,
    name: "Liam Harris",
    position: "Senior Caregiver",
    stage: "On Hold",
    applied: "11 days ago",
    email: "liam.h@example.com",
    phone: "07700 900258",
    experience: "4 years in care",
    qualifications: ["NVQ Level 3 Health & Social Care"],
    status: "on-hold"
  },
];

export function ViewCandidatesModal({
  isOpen,
  onClose,
}: ViewCandidatesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  
  // Filter candidates based on search query and selected stage
  const filteredCandidates = candidatesData.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = 
      selectedStage === "all" || 
      candidate.stage.toLowerCase().replace(" ", "-") === selectedStage ||
      (selectedStage === "active" && candidate.status === "active") ||
      (selectedStage === "inactive" && (candidate.status === "rejected" || candidate.status === "on-hold"));
    
    return matchesSearch && matchesStage;
  });

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Candidates</DialogTitle>
          <DialogDescription>
            View and manage all candidates in the recruitment pipeline
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between py-4">
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={selectedStage}
            onValueChange={setSelectedStage}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="application-review">Reviewing</TabsTrigger>
              <TabsTrigger value="initial-screening">Screening</TabsTrigger>
              <TabsTrigger value="first-interview">Interview</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="hidden md:table-cell">Applied</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No candidates found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-gray-500 text-xs">{candidate.email}</div>
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell className="hidden md:table-cell">{candidate.applied}</TableCell>
                    <TableCell>
                      <Badge className={`
                        ${candidate.stage === 'Initial Screening' ? 'bg-blue-100 text-blue-800' : 
                          candidate.stage === 'Application Review' ? 'bg-gray-100 text-gray-800' :
                          candidate.stage === 'First Interview' ? 'bg-purple-100 text-purple-800' :
                          candidate.stage === 'Second Interview' ? 'bg-indigo-100 text-indigo-800' :
                          candidate.stage === 'Reference Check' ? 'bg-amber-100 text-amber-800' :
                          candidate.stage === 'Job Offer' ? 'bg-green-100 text-green-800' :
                          candidate.stage === 'Rejected' ? 'bg-red-100 text-red-800' :
                          candidate.stage === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {candidate.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // In a real app, this would navigate to candidate details
                          alert(`View ${candidate.name}'s full profile`);
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