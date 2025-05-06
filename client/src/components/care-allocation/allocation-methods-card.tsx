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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Briefcase, Heart, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface AllocationMethodProps {
  onMethodChange?: (method: string) => void;
  className?: string;
}

export function AllocationMethodsCard({ onMethodChange, className }: AllocationMethodProps) {
  const [activeMethod, setActiveMethod] = useState<string>('geographic');

  const handleMethodChange = (method: string) => {
    setActiveMethod(method);
    if (onMethodChange) {
      onMethodChange(method);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Care Allocation Methods</CardTitle>
        <CardDescription>
          Configure how service users are matched with appropriate caregivers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="geographic" 
          value={activeMethod}
          onValueChange={handleMethodChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="geographic" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden md:inline">Geographic</span>
              <span className="md:hidden">Geo</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden md:inline">Skills</span>
              <span className="md:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="preference" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Preference</span>
              <span className="md:hidden">Pref</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Availability</span>
              <span className="md:hidden">Avail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geographic" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">Geographic/Location-Based Matching</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              </div>
              <Progress value={85} className="h-2 mb-2" />
              <p className="text-sm text-gray-500">
                Matches carers to service users based on proximity, reducing travel time and increasing time spent on care. 
                Essential for home care providers with distributed clients.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Maximum Travel Distance</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">5 miles</span>
                  <Button variant="outline" size="sm">Adjust</Button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Travel Time Optimization</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Enabled</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">Skills/Qualification Matching</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
              </div>
              <Progress value={90} className="h-2 mb-2" />
              <p className="text-sm text-gray-500">
                Pairs carers with service users based on required qualifications. Ensures appropriate care (medication management, dementia care, etc.).
                Compliance with CQC regulations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Critical Skills Priority</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">High</span>
                  <Button variant="outline" size="sm">Adjust</Button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Required vs. Preferred</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Balanced</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preference" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">Preference-Based Matching</span>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Active</Badge>
              </div>
              <Progress value={70} className="h-2 mb-2" />
              <p className="text-sm text-gray-500">
                Considers both carer and service user preferences. Maintains continuity of care (same carers where possible).
                Accounts for gender preferences, language needs, etc.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Continuity Priority</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Medium</span>
                  <Button variant="outline" size="sm">Adjust</Button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Preference Weighting</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Service User: 70% / Carer: 30%</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">Availability-Based Scheduling</span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">Active</Badge>
              </div>
              <Progress value={95} className="h-2 mb-2" />
              <p className="text-sm text-gray-500">
                Real-time view of carer availability. Handles shift patterns, planned leave, and sick calls.
                Prevents double-booking and understaffing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Buffer Between Visits</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">15 minutes</span>
                  <Button variant="outline" size="sm">Adjust</Button>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-1">Automated Rescheduling</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">On for sick calls</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Configuration</Button>
      </CardFooter>
    </Card>
  );
}