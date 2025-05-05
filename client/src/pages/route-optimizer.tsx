import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Car,
  Navigation,
  Map,
  RotateCw,
  Filter,
  Sliders,
  Save,
  Download,
  Users,
  UserCheck,
  MoreHorizontal,
  Clock3,
  CheckCircle,
  XCircle,
  Play,
  ArrowLeft,
  ArrowRight,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const RouteOptimizer = () => {
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [caregiver, setCaregiver] = useState<string>("all");
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [activeCaregiver, setActiveCaregiver] = useState<string | null>(null);
  
  // Sample data
  const caregivers = [
    { id: 1, name: "Jane Wilson", visits: 8, optimized: true },
    { id: 2, name: "Michael Brown", visits: 6, optimized: false },
    { id: 3, name: "Sarah Johnson", visits: 7, optimized: false },
    { id: 4, name: "David Thompson", visits: 5, optimized: true },
  ];
  
  const visits = [
    { id: 1, serviceUser: "Elizabeth Taylor", time: "08:00 - 09:00", address: "123 Maple Street, North London", distance: "0.0", duration: "0", status: "first" },
    { id: 2, serviceUser: "Robert Johnson", time: "09:30 - 10:30", address: "45 Oak Avenue, North London", distance: "1.2", duration: "8", status: "optimized" },
    { id: 3, serviceUser: "Mary Williams", time: "11:00 - 12:00", address: "78 Pine Road, North London", distance: "0.8", duration: "6", status: "optimized" },
    { id: 4, serviceUser: "John Smith", time: "13:30 - 14:30", address: "15 Cedar Lane, East London", distance: "4.5", duration: "20", status: "optimized" },
    { id: 5, serviceUser: "Patricia Brown", time: "15:15 - 16:15", address: "29 Birch Street, East London", distance: "1.1", duration: "7", status: "optimized" },
    { id: 6, serviceUser: "James Davis", time: "17:00 - 18:00", address: "8 Elm Court, East London", distance: "0.9", duration: "5", status: "optimized" },
    { id: 7, serviceUser: "Jennifer Miller", time: "19:00 - 20:00", address: "52 Willow Way, North London", distance: "5.2", duration: "25", status: "optimized" },
    { id: 8, serviceUser: "Charles Wilson", time: "20:30 - 21:30", address: "67 Ash Drive, North London", distance: "1.3", duration: "9", status: "optimized" },
  ];
  
  const routes = [
    { id: 1, caregiver: "Jane Wilson", visits: 8, totalDistance: "14.2", totalDuration: "80", status: "optimized", savingsDistance: "32%", savingsTime: "28%" },
    { id: 2, caregiver: "Michael Brown", visits: 6, totalDistance: "10.5", totalDuration: "65", status: "not-optimized", savingsDistance: "-", savingsTime: "-" },
    { id: 3, caregiver: "Sarah Johnson", visits: 7, totalDistance: "12.8", totalDuration: "75", status: "not-optimized", savingsDistance: "-", savingsTime: "-" },
    { id: 4, caregiver: "David Thompson", visits: 5, totalDistance: "8.6", totalDuration: "55", status: "optimized", savingsDistance: "24%", savingsTime: "20%" },
  ];
  
  const metrics = {
    totalRoutes: routes.length,
    optimizedRoutes: routes.filter(r => r.status === "optimized").length,
    totalDistance: "46.1",
    savedDistance: "10.2",
    totalDuration: "275",
    savedDuration: "48"
  };

  const runOptimization = () => {
    setOptimizationInProgress(true);
    setOptimizationProgress(0);
    
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOptimizationInProgress(false);
          setOptimizationComplete(true);
          toast({
            title: "Optimization Complete",
            description: "Routes have been optimized successfully",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const applyOptimizedRoutes = () => {
    toast({
      title: "Routes Applied",
      description: "Optimized routes have been applied to staff schedules",
    });
    setOptimizationComplete(false);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Optimizer</h1>
          <p className="text-gray-500 mt-1">
            Optimize travel routes for maximum efficiency
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="nextWeek">Next Week</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Routes</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{metrics.optimizedRoutes}/{metrics.totalRoutes}</p>
                <p className="text-sm text-gray-500">optimized</p>
              </div>
              <Progress className="h-2 mt-2" value={(metrics.optimizedRoutes / metrics.totalRoutes) * 100} />
            </div>
            <Map className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Distance Saved</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{metrics.savedDistance}km</p>
                <p className="text-sm text-green-600">({Math.round((parseInt(metrics.savedDistance) / parseInt(metrics.totalDistance)) * 100)}%)</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total: {metrics.totalDistance}km</p>
            </div>
            <Navigation className="h-8 w-8 text-green-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Time Saved</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{metrics.savedDuration}min</p>
                <p className="text-sm text-green-600">({Math.round((parseInt(metrics.savedDuration) / parseInt(metrics.totalDuration)) * 100)}%)</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total: {metrics.totalDuration}min</p>
            </div>
            <Clock3 className="h-8 w-8 text-purple-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Caregivers</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{caregivers.length}</p>
                <p className="text-sm text-gray-500">with routes</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total visits: {visits.length}</p>
            </div>
            <Users className="h-8 w-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staff Routes</CardTitle>
                <CardDescription>Daily travel routes for care staff</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={caregiver} onValueChange={setCaregiver}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select caregiver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Caregivers</SelectItem>
                    {caregivers.map(cg => (
                      <SelectItem key={cg.id} value={cg.name}>{cg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caregiver</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes
                    .filter(route => caregiver === "all" || route.caregiver === caregiver)
                    .map(route => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.caregiver}</TableCell>
                      <TableCell>{route.visits}</TableCell>
                      <TableCell>{route.totalDistance} km</TableCell>
                      <TableCell>{route.totalDuration} min</TableCell>
                      <TableCell>
                        {route.status === "optimized" ? (
                          <div>
                            <div className="text-green-600 text-xs">↓ {route.savingsDistance} distance</div>
                            <div className="text-green-600 text-xs">↓ {route.savingsTime} time</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          route.status === "optimized" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }>
                          {route.status === "optimized" ? "Optimized" : "Not Optimized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setActiveCaregiver(route.caregiver)}
                        >
                          View Route
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Routes
              </Button>
              {!optimizationInProgress && !optimizationComplete ? (
                <Button onClick={runOptimization}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Run Route Optimization
                </Button>
              ) : optimizationInProgress ? (
                <Button disabled>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing... {optimizationProgress}%
                </Button>
              ) : (
                <Button onClick={applyOptimizedRoutes}>
                  <Save className="h-4 w-4 mr-2" />
                  Apply Optimized Routes
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {activeCaregiver ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Route Details</CardTitle>
                    <CardDescription>{activeCaregiver}'s optimized route</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveCaregiver(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visits
                    .sort((a, b) => {
                      if (a.status === "first") return -1;
                      if (b.status === "first") return 1;
                      return 0;
                    })
                    .map((visit, index) => (
                    <div key={visit.id} className="flex items-start gap-3 relative">
                      {index < visits.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                      )}
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                        visit.status === "first" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 border rounded-md p-3">
                        <div className="font-medium">{visit.serviceUser}</div>
                        <div className="text-sm text-gray-500">{visit.time}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{visit.address}</span>
                        </div>
                        {index > 0 && (
                          <div className="flex gap-4 mt-2 text-xs">
                            <div className="flex items-center text-blue-600">
                              <Navigation className="h-3 w-3 mr-1" />
                              <span>{visit.distance} km</span>
                            </div>
                            <div className="flex items-center text-purple-600">
                              <Clock3 className="h-3 w-3 mr-1" />
                              <span>{visit.duration} min</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Distance</div>
                      <div className="font-medium">14.2 km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Travel Time</div>
                      <div className="font-medium">80 min</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Distance Saved</div>
                      <div className="font-medium text-green-600">6.7 km (32%)</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time Saved</div>
                      <div className="font-medium text-green-600">31 min (28%)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View on Calendar
                  </Button>
                  <Button size="sm">
                    <Map className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Controls</CardTitle>
                <CardDescription>Configure route optimization parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Optimization Type</label>
                    <Select defaultValue="balanced">
                      <SelectTrigger>
                        <SelectValue placeholder="Select optimization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Minimize Distance</SelectItem>
                        <SelectItem value="time">Minimize Time</SelectItem>
                        <SelectItem value="balanced">Balanced (Distance & Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Continuity Preference</label>
                    <Select defaultValue="moderate">
                      <SelectTrigger>
                        <SelectValue placeholder="Select continuity preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict (Keep Existing Assignments)</SelectItem>
                        <SelectItem value="moderate">Moderate (Allow Some Changes)</SelectItem>
                        <SelectItem value="flexible">Flexible (Prioritize Efficiency)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Traffic Consideration</label>
                    <Select defaultValue="real-time">
                      <SelectTrigger>
                        <SelectValue placeholder="Select traffic consideration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="historical">Historical Data</SelectItem>
                        <SelectItem value="real-time">Real-Time Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="respect-timeslots" defaultChecked />
                    <label
                      htmlFor="respect-timeslots"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Respect existing time slots
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="maintain-preferences" defaultChecked />
                    <label
                      htmlFor="maintain-preferences"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Maintain carer-client preferences
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="skill-required" defaultChecked />
                    <label
                      htmlFor="skill-required"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Match required skills/qualifications 
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={runOptimization}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Run Route Optimization
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Optimization Benefits</CardTitle>
              <CardDescription>Impact of route optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">Fuel Cost Savings</div>
                    <div className="text-sm font-medium text-green-600">£42.80/day</div>
                  </div>
                  <div className="text-xs text-gray-500">Based on reduced mileage</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">CO2 Reduction</div>
                    <div className="text-sm font-medium text-green-600">2.6kg/day</div>
                  </div>
                  <div className="text-xs text-gray-500">Environmental impact</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">Additional Care Time</div>
                    <div className="text-sm font-medium text-blue-600">48 min/day</div>
                  </div>
                  <div className="text-xs text-gray-500">Time redirected to client care</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">Staff Satisfaction</div>
                    <div className="text-sm font-medium text-blue-600">+12%</div>
                  </div>
                  <div className="text-xs text-gray-500">Based on feedback surveys</div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Projected Monthly Savings</div>
                  <div className="flex justify-between items-center border rounded-md p-3 bg-green-50">
                    <div className="font-medium">£856.00</div>
                    <Button variant="outline" size="sm">View Breakdown</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;