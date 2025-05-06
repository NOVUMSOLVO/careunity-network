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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  User,
  Calendar,
  MapPin,
  PanelLeft,
  Clock3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Alert type definition
interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  category: 'medication' | 'fall' | 'care' | 'allocation' | 'system';
  serviceUserId?: string;
  serviceUserName?: string;
  location?: string;
  caregiverId?: string;
  caregiverName?: string;
  dueTimestamp?: string;
}

export default function Alerts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  // Sample alerts data
  const alerts: Alert[] = [
    {
      id: 'alert-001',
      title: 'Missed Medication',
      description: 'Morning medication was not administered as scheduled',
      timestamp: '2025-05-05T08:15:00',
      severity: 'high',
      status: 'active',
      category: 'medication',
      serviceUserId: 'su-005',
      serviceUserName: 'James Wilson',
      location: '42 Oak Street, London',
      dueTimestamp: '2025-05-05T07:30:00'
    },
    {
      id: 'alert-002',
      title: 'Fall Detected',
      description: 'Fall detected in bathroom. Immediate assistance required.',
      timestamp: '2025-05-05T07:42:00',
      severity: 'critical',
      status: 'acknowledged',
      category: 'fall',
      serviceUserId: 'su-012',
      serviceUserName: 'Elizabeth Brown',
      location: '17 Maple Avenue, London',
      caregiverId: 'cg-008',
      caregiverName: 'Sarah Johnson'
    },
    {
      id: 'alert-003',
      title: 'Care Plan Update Required',
      description: 'Care plan needs updating following hospital discharge',
      timestamp: '2025-05-04T16:30:00',
      severity: 'medium',
      status: 'active',
      category: 'care',
      serviceUserId: 'su-008',
      serviceUserName: 'Robert Davis',
      dueTimestamp: '2025-05-06T17:00:00'
    },
    {
      id: 'alert-004',
      title: 'Unallocated Visit',
      description: 'Evening visit at 18:00 has no caregiver allocated',
      timestamp: '2025-05-04T14:15:00',
      severity: 'high',
      status: 'active',
      category: 'allocation',
      serviceUserId: 'su-023',
      serviceUserName: 'Margaret Turner',
      location: '89 Pine Road, London',
      dueTimestamp: '2025-05-05T18:00:00'
    },
    {
      id: 'alert-005',
      title: 'System Update Required',
      description: 'Critical security update needs to be applied',
      timestamp: '2025-05-03T09:00:00',
      severity: 'medium',
      status: 'resolved',
      category: 'system',
      dueTimestamp: '2025-05-10T23:59:59'
    },
    {
      id: 'alert-006',
      title: 'Medication Stock Low',
      description: 'Pain medication inventory low - reorder needed',
      timestamp: '2025-05-05T10:22:00',
      severity: 'medium',
      status: 'active',
      category: 'medication',
      serviceUserId: 'su-017',
      serviceUserName: 'Thomas Johnson',
      dueTimestamp: '2025-05-07T12:00:00'
    },
    {
      id: 'alert-007',
      title: 'Missed Visit',
      description: 'Morning care visit was not completed',
      timestamp: '2025-05-05T11:05:00',
      severity: 'high',
      status: 'active',
      category: 'care',
      serviceUserId: 'su-009',
      serviceUserName: 'Emily Clark',
      location: '23 Birch Lane, London',
      caregiverId: 'cg-012',
      caregiverName: 'David Thompson',
      dueTimestamp: '2025-05-05T09:00:00'
    }
  ];
  
  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.serviceUserName && alert.serviceUserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alert.caregiverName && alert.caregiverName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === null || alert.category === filterCategory;
    const matchesSeverity = filterSeverity === null || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === null || alert.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });
  
  // Count alerts by status
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
  
  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'medication':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Medication</Badge>;
      case 'fall':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Fall</Badge>;
      case 'care':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Care</Badge>;
      case 'allocation':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Allocation</Badge>;
      case 'system':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">System</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeString = date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeString}`;
    } else {
      return `${date.toLocaleDateString('en-GB')} at ${timeString}`;
    }
  };
  
  // Handle alert actions
  const handleAcknowledge = (alert: Alert) => {
    toast({
      title: 'Alert Acknowledged',
      description: `You have acknowledged: ${alert.title}`
    });
  };
  
  const handleResolve = (alert: Alert) => {
    toast({
      title: 'Alert Resolved',
      description: `You have resolved: ${alert.title}`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">Manage and respond to system alerts and notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-100">
            {activeAlerts} Active
          </Badge>
          <Badge className="px-3 py-1 text-sm bg-amber-100 text-amber-800 hover:bg-amber-100">
            {acknowledgedAlerts} Acknowledged
          </Badge>
          <Badge className="px-3 py-1 text-sm bg-green-100 text-green-800 hover:bg-green-100">
            {resolvedAlerts} Resolved
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search alerts..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Category</h4>
                  <Select 
                    value={filterCategory || ''} 
                    onValueChange={(value) => setFilterCategory(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="care">Care</SelectItem>
                      <SelectItem value="allocation">Allocation</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Severity</h4>
                  <Select 
                    value={filterSeverity || ''} 
                    onValueChange={(value) => setFilterSeverity(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <Select 
                    value={filterStatus || ''} 
                    onValueChange={(value) => setFilterStatus(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterCategory(null);
                      setFilterSeverity(null);
                      setFilterStatus(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => document.body.click()} // Close popover
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <AlertsTable 
            alerts={filteredAlerts} 
            onSelect={setSelectedAlert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <AlertsTable 
            alerts={filteredAlerts.filter(a => a.status === 'active')} 
            onSelect={setSelectedAlert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </TabsContent>
        
        <TabsContent value="acknowledged" className="space-y-4">
          <AlertsTable 
            alerts={filteredAlerts.filter(a => a.status === 'acknowledged')} 
            onSelect={setSelectedAlert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          <AlertsTable 
            alerts={filteredAlerts.filter(a => a.status === 'resolved')} 
            onSelect={setSelectedAlert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </TabsContent>
      </Tabs>
      
      {selectedAlert && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedAlert.severity)}
                <CardTitle>{selectedAlert.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(selectedAlert.status)}
                {getCategoryBadge(selectedAlert.category)}
              </div>
            </div>
            <CardDescription>
              Alert ID: {selectedAlert.id} • Created: {formatDate(selectedAlert.timestamp)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700">{selectedAlert.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {selectedAlert.serviceUserName && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Service User</div>
                    <div className="text-gray-700">{selectedAlert.serviceUserName}</div>
                  </div>
                </div>
              )}
              
              {selectedAlert.caregiverName && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Caregiver</div>
                    <div className="text-gray-700">{selectedAlert.caregiverName}</div>
                  </div>
                </div>
              )}
              
              {selectedAlert.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Location</div>
                    <div className="text-gray-700">{selectedAlert.location}</div>
                  </div>
                </div>
              )}
              
              {selectedAlert.dueTimestamp && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Due Date</div>
                    <div className="text-gray-700">{formatDate(selectedAlert.dueTimestamp)}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button 
              variant="outline"
              onClick={() => setSelectedAlert(null)}
            >
              Close
            </Button>
            
            <div className="flex gap-2">
              {selectedAlert.status !== 'resolved' && (
                <>
                  {selectedAlert.status === 'active' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleAcknowledge(selectedAlert)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button 
                    variant="default"
                    onClick={() => handleResolve(selectedAlert)}
                  >
                    {selectedAlert.status === 'acknowledged' ? 'Resolve' : 'Acknowledge & Resolve'}
                  </Button>
                </>
              )}
              
              {selectedAlert.status === 'resolved' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: 'Alert Reopened',
                      description: `You have reopened: ${selectedAlert.title}`
                    });
                  }}
                >
                  Reopen Alert
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// Alerts table component
function AlertsTable({ 
  alerts, 
  onSelect,
  onAcknowledge,
  onResolve
}: { 
  alerts: Alert[],
  onSelect: (alert: Alert) => void,
  onAcknowledge: (alert: Alert) => void,
  onResolve: (alert: Alert) => void
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <Bell className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No alerts found</h3>
        <p className="mt-2 text-gray-500">
          No alerts match your current filters
        </p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Severity</TableHead>
          <TableHead>Alert</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>
              <div className="flex items-center">
                {getSeverityIcon(alert.severity)}
                <span className="ml-2 capitalize hidden sm:inline">{alert.severity}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{alert.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{alert.description}</div>
              {alert.serviceUserName && (
                <div className="text-xs text-muted-foreground mt-1 inline-flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {alert.serviceUserName}
                </div>
              )}
            </TableCell>
            <TableCell>{getCategoryBadge(alert.category)}</TableCell>
            <TableCell>{getStatusBadge(alert.status)}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Clock className="h-3 w-3 text-gray-500 mr-1" />
                <span className="text-sm">{formatDate(alert.timestamp)}</span>
              </div>
              {alert.dueTimestamp && (
                <div className="flex items-center mt-1">
                  <Clock3 className="h-3 w-3 text-gray-500 mr-1" />
                  <span className="text-xs text-muted-foreground">Due: {formatDate(alert.dueTimestamp)}</span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onSelect(alert)}
                >
                  <PanelLeft className="h-4 w-4" />
                  <span className="sr-only">View Details</span>
                </Button>
                
                {alert.status === 'active' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(alert);
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Acknowledge</span>
                  </Button>
                )}
                
                {alert.status !== 'resolved' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve(alert);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="sr-only">Resolve</span>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}