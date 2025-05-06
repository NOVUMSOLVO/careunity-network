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
import { 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Layers,
  Search,
  Home,
  Navigation,
  Route
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface InteractiveMapProps {
  className?: string;
}

export function InteractiveMap({ className }: InteractiveMapProps) {
  const [showCarers, setShowCarers] = useState(true);
  const [showServiceUsers, setShowServiceUsers] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapViewType, setMapViewType] = useState('standard');
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>Interactive Resource Map</CardTitle>
            <CardDescription>
              Visual representation of service users and available staff
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={mapViewType} onValueChange={setMapViewType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Map type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard View</SelectItem>
                <SelectItem value="satellite">Satellite View</SelectItem>
                <SelectItem value="traffic">Traffic View</SelectItem>
                <SelectItem value="terrain">Terrain View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search locations or staff" 
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="h-10">
              <Route className="h-4 w-4 mr-2" />
              Routes
            </Button>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="relative border rounded-md overflow-hidden bg-gray-100 aspect-video min-h-[300px]">
          {/* Sample Map UI - In a real implementation, this would be a proper map component */}
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary-300" />
              <p>Interactive map would render here</p>
              <p className="text-sm mt-2">Using location data from carers and service users</p>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 bg-white p-2 rounded-md shadow-md">
            <Toggle 
              size="sm" 
              aria-label="Toggle carers" 
              pressed={showCarers}
              onPressedChange={setShowCarers}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="text-xs">Carers</span>
            </Toggle>
            <Toggle 
              size="sm" 
              aria-label="Toggle service users" 
              pressed={showServiceUsers}
              onPressedChange={setShowServiceUsers}
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="text-xs">Service Users</span>
            </Toggle>
            <Toggle 
              size="sm" 
              aria-label="Toggle routes" 
              pressed={showRoutes}
              onPressedChange={setShowRoutes}
            >
              <Navigation className="h-4 w-4 mr-2" />
              <span className="text-xs">Routes</span>
            </Toggle>
          </div>

          {/* Sample Map Pins */}
          <div className="absolute top-1/4 left-1/3">
            <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-md">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute top-2/3 left-1/2">
            <div className="bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-md">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute top-1/3 left-2/3">
            <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-md">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 h-3 w-3 rounded-full"></div>
            <span className="text-xs text-gray-600">Available Carers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 h-3 w-3 rounded-full"></div>
            <span className="text-xs text-gray-600">Busy Carers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-500 h-3 w-3 rounded-full"></div>
            <span className="text-xs text-gray-600">Service Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-500 h-3 w-3 rounded-full"></div>
            <span className="text-xs text-gray-600">Current Visit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 border-t-2 border-dashed border-blue-500"></div>
            <span className="text-xs text-gray-600">Planned Route</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border rounded-md p-3">
            <div className="text-xs text-gray-500 mb-1">Active Carers</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">24</span>
            </div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-xs text-gray-500 mb-1">Service Users</div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-red-500" />
              <span className="font-semibold">42</span>
            </div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-xs text-gray-500 mb-1">Active Visits</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="font-semibold">17</span>
            </div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-xs text-gray-500 mb-1">Avg. Travel</div>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">3.2 mi</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm">
          Export Map Data
        </Button>
        <Button size="sm">
          Route Optimization
        </Button>
      </CardFooter>
    </Card>
  );
}