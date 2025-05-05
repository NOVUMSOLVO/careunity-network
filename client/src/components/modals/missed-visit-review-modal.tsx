import React from "react";
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
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MissedVisitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  staffId: string;
  missedVisits: number;
  month: string;
}

export function MissedVisitReviewModal({
  isOpen,
  onClose,
  staffName,
  staffId,
  missedVisits,
  month,
}: MissedVisitReviewModalProps) {
  const [reason, setReason] = useState<string>(""); 
  const [action, setAction] = useState<string>("discussion");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!notes) {
      toast({
        title: "Error",
        description: "Please provide notes about the discussion",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // In a real implementation, this would be an API call
    // to save the review in the database
    setTimeout(() => {
      toast({
        title: "Review Completed",
        description: `Missed visits review for ${staffName} has been completed`,
      });
      setIsSubmitting(false);
      onClose();
      
      // Reset the form
      setReason("");
      setAction("discussion");
      setNotes("");
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Review Missed Visits</DialogTitle>
          <DialogDescription>
            Review {missedVisits} missed visits by {staffName} in {month}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Missed Visit Details</h3>
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p className="font-medium">Staff Member: {staffName}</p>
              <p>Missed Visits: {missedVisits} in {month}</p>
              <p>Last Review: {format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "PPP")}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="reason" className="text-right text-sm pt-2.5">
              Primary Reason
            </Label>
            <div className="col-span-3">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the primary reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Traffic/Travel Issues</SelectItem>
                  <SelectItem value="personal">Personal Emergency</SelectItem>
                  <SelectItem value="scheduling">Scheduling Error</SelectItem>
                  <SelectItem value="communication">Communication Breakdown</SelectItem>
                  <SelectItem value="unavoidable">Unavoidable Circumstances</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="action" className="text-right text-sm pt-2.5">
              Action Taken
            </Label>
            <div className="col-span-3">
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action taken" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Informal Discussion</SelectItem>
                  <SelectItem value="verbal">Verbal Warning</SelectItem>
                  <SelectItem value="written">Written Warning</SelectItem>
                  <SelectItem value="performance">Performance Improvement Plan</SelectItem>
                  <SelectItem value="training">Additional Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right text-sm pt-2.5">
              Review Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes from the review discussion"
              className="col-span-3"
              rows={4}
            />
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
            {isSubmitting ? "Saving..." : "Complete Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}