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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface NewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPositionModal({
  isOpen,
  onClose,
}: NewPositionModalProps) {
  const [title, setTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("care");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [isFullTime, setIsFullTime] = useState<boolean>(true);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !location || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // In a real implementation, this would be an API call
    // to create a new position in the database
    setTimeout(() => {
      toast({
        title: "Position Created",
        description: `New position "${title}" has been created successfully`,
      });
      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 1000);
  };

  const resetForm = () => {
    setTitle("");
    setDepartment("care");
    setLocation("");
    setDescription("");
    setRequirements("");
    setSalary("");
    setIsFullTime(true);
    setIsUrgent(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Position</DialogTitle>
          <DialogDescription>
            Add a new job position to the recruitment system
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3" 
              placeholder="e.g. Senior Caregiver"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department" className="col-span-3">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="care">Care Services</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="admin">Administration</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="training">Training & Development</SelectItem>
                <SelectItem value="quality">Quality Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3" 
              placeholder="e.g. North London"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2.5">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the job role and responsibilities"
              className="col-span-3"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="requirements" className="text-right pt-2.5">
              Requirements
            </Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List qualifications and experience required"
              className="col-span-3"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salary" className="text-right">
              Salary Range
            </Label>
            <Input 
              id="salary" 
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="col-span-3" 
              placeholder="e.g. £25,000 - £30,000 per annum"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Full-Time
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch 
                id="full-time" 
                checked={isFullTime}
                onCheckedChange={setIsFullTime} 
              />
              <Label htmlFor="full-time" className="cursor-pointer">
                {isFullTime ? "Full-Time Position" : "Part-Time Position"}
              </Label>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Urgent Hire
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch 
                id="urgent" 
                checked={isUrgent}
                onCheckedChange={setIsUrgent} 
              />
              <Label htmlFor="urgent" className="cursor-pointer">
                {isUrgent ? "Urgent Hiring Priority" : "Standard Hiring Priority"}
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}