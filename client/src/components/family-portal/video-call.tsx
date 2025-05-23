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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OfflineWrapper } from "@/components/ui/offline-indicator";
import {
  Video,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Plus
} from "lucide-react";
import { format } from "date-fns";

interface VideoCallProps {
  serviceUserName: string;
  serviceUserAvatar?: string;
}

/**
 * Video Call Component for Family Portal
 * 
 * This component allows family members to schedule and join video calls
 * with their loved ones and care staff.
 */
const VideoCall: React.FC<VideoCallProps> = ({ 
  serviceUserName,
  serviceUserAvatar
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  // Mock upcoming calls data
  const upcomingCalls = [
    {
      id: 1,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      time: "14:30",
      duration: "30 min",
      participants: ["Jane Wilson (Caregiver)", "Dr. Sarah Johnson"],
      status: "scheduled",
      purpose: "Weekly Check-in"
    },
    {
      id: 2,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: "11:00",
      duration: "45 min",
      participants: ["Michael Brown (Care Manager)"],
      status: "scheduled",
      purpose: "Care Plan Review"
    }
  ];
  
  // Mock past calls data
  const pastCalls = [
    {
      id: 3,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      time: "15:00",
      duration: "25 min",
      participants: ["Jane Wilson (Caregiver)"],
      status: "completed",
      purpose: "General Check-in"
    },
    {
      id: 4,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      time: "10:30",
      duration: "40 min",
      participants: ["Dr. Robert Davis", "Jane Wilson (Caregiver)"],
      status: "completed",
      purpose: "Medical Consultation"
    }
  ];
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'missed':
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Video Calls</CardTitle>
            <CardDescription>
              Schedule and join video calls with {serviceUserName} and care staff
            </CardDescription>
          </div>
          <OfflineWrapper requiresOnline={true} fallback={
            <Button disabled>
              <Video className="h-4 w-4 mr-2" />
              Start Instant Call
            </Button>
          }>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Start Instant Call
            </Button>
          </OfflineWrapper>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming Calls Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Upcoming Calls</h3>
          {upcomingCalls.length === 0 ? (
            <div className="text-center py-6 border rounded-md">
              <Info className="h-10 w-10 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-500">No upcoming calls scheduled</p>
              <Button variant="outline" className="mt-3" onClick={() => setShowScheduleForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule a Call
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingCalls.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{call.purpose}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(call.date, "EEEE, MMMM d, yyyy")} at {call.time} ({call.duration})
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>With: {call.participants.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-10 md:ml-0">
                        {getStatusBadge(call.status)}
                        <OfflineWrapper requiresOnline={true} fallback={
                          <Button disabled size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                          </Button>
                        }>
                          <Button size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                          </Button>
                        </OfflineWrapper>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Schedule a Call Form */}
        {showScheduleForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule a New Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="call-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="call-time">Time</Label>
                  <Select defaultValue="14:30">
                    <SelectTrigger id="call-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="call-duration">Duration</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="call-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="call-participants">Participants</Label>
                <Select defaultValue="caregiver">
                  <SelectTrigger id="call-participants">
                    <SelectValue placeholder="Select participants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caregiver">Primary Caregiver (Jane Wilson)</SelectItem>
                    <SelectItem value="doctor">Doctor (Dr. Sarah Johnson)</SelectItem>
                    <SelectItem value="manager">Care Manager (Michael Brown)</SelectItem>
                    <SelectItem value="all">All Care Team Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="call-purpose">Purpose</Label>
                <Textarea id="call-purpose" placeholder="Describe the purpose of this call" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
              <Button>
                Schedule Call
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Past Calls Section */}
        {!showScheduleForm && (
          <div>
            <h3 className="text-lg font-medium mb-3">Past Calls</h3>
            <div className="space-y-3">
              {pastCalls.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 text-gray-800 p-2 rounded-full">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{call.purpose}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(call.date, "EEEE, MMMM d, yyyy")} at {call.time} ({call.duration})
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>With: {call.participants.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-10 md:ml-0">
                        {getStatusBadge(call.status)}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        {!showScheduleForm && (
          <>
            <Button variant="outline" onClick={() => setShowScheduleForm(true)}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule a Call
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call History
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default VideoCall;
