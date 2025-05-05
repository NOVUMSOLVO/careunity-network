import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  ShieldCheck, 
  Users, 
  Lock,
  MoveVertical,
  Filter,
  CheckCircle,
  Search,
  Info,
  XCircle,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define roles for the system (same as in RBAC management)
const roles = [
  { id: 1, name: 'System Administrator', level: 1, color: 'bg-red-100 text-red-800' },
  { id: 2, name: 'Regional Manager', level: 2, color: 'bg-orange-100 text-orange-800' },
  { id: 3, name: 'Service Manager', level: 3, color: 'bg-amber-100 text-amber-800' },
  { id: 4, name: 'Care Coordinator', level: 4, color: 'bg-yellow-100 text-yellow-800' },
  { id: 5, name: 'Senior Carer', level: 5, color: 'bg-lime-100 text-lime-800' },
  { id: 6, name: 'Care Worker', level: 6, color: 'bg-green-100 text-green-800' },
];

// Sample permission categories
const permissionCategories = [
  { id: 'user_management', name: 'User Management' },
  { id: 'service_user_management', name: 'Service User Management' },
  { id: 'allocation', name: 'Allocation & Scheduling' },
  { id: 'care_planning', name: 'Care Planning' },
  { id: 'reporting', name: 'Reports & Analytics' },
  { id: 'system', name: 'System Configuration' },
];

// Initial permissions setup
const initialPermissions = [
  // User Management
  { id: 'create_user', name: 'Create User', category: 'user_management', roles: [1, 2, 3] },
  { id: 'edit_user', name: 'Edit User', category: 'user_management', roles: [1, 2, 3, 4] },
  { id: 'view_users', name: 'View Users', category: 'user_management', roles: [1, 2, 3, 4, 5] },
  { id: 'delete_user', name: 'Delete User', category: 'user_management', roles: [1, 2] },
  
  // Service User Management
  { id: 'create_service_user', name: 'Create Service User', category: 'service_user_management', roles: [1, 2, 3] },
  { id: 'edit_service_user', name: 'Edit Service User', category: 'service_user_management', roles: [1, 2, 3, 4] },
  { id: 'view_service_users', name: 'View Service Users', category: 'service_user_management', roles: [1, 2, 3, 4, 5, 6] },
  { id: 'delete_service_user', name: 'Delete Service User', category: 'service_user_management', roles: [1, 2] },
  
  // Allocation & Scheduling
  { id: 'create_schedule', name: 'Create Schedule', category: 'allocation', roles: [1, 2, 3, 4] },
  { id: 'edit_schedule', name: 'Edit Schedule', category: 'allocation', roles: [1, 2, 3, 4] },
  { id: 'view_schedule', name: 'View Schedule', category: 'allocation', roles: [1, 2, 3, 4, 5, 6] },
  { id: 'approve_changes', name: 'Approve Schedule Changes', category: 'allocation', roles: [1, 2, 3] },
  { id: 'cancel_visits', name: 'Cancel Visits', category: 'allocation', roles: [1, 2, 3, 4] },
  
  // Care Planning
  { id: 'create_care_plan', name: 'Create Care Plan', category: 'care_planning', roles: [1, 2, 3, 4] },
  { id: 'edit_care_plan', name: 'Edit Care Plan', category: 'care_planning', roles: [1, 2, 3, 4] },
  { id: 'approve_care_plan', name: 'Approve Care Plan', category: 'care_planning', roles: [1, 2, 3] },
  { id: 'view_care_plan', name: 'View Care Plan', category: 'care_planning', roles: [1, 2, 3, 4, 5, 6] },
  
  // Reporting
  { id: 'generate_reports', name: 'Generate Reports', category: 'reporting', roles: [1, 2, 3] },
  { id: 'view_dashboards', name: 'View Dashboards', category: 'reporting', roles: [1, 2, 3, 4] },
  { id: 'export_data', name: 'Export Data', category: 'reporting', roles: [1, 2, 3] },
  { id: 'view_analytics', name: 'View Advanced Analytics', category: 'reporting', roles: [1, 2] },
  
  // System Configuration
  { id: 'system_settings', name: 'System Settings', category: 'system', roles: [1] },
  { id: 'manage_roles', name: 'Manage Roles', category: 'system', roles: [1] },
  { id: 'audit_logs', name: 'View Audit Logs', category: 'system', roles: [1] },
  { id: 'backup_restore', name: 'Backup & Restore', category: 'system', roles: [1] },
];

// Define permission type
interface Permission {
  id: string;
  name: string;
  category: string;
  roles: number[];
}

// Define role type
interface Role {
  id: number;
  name: string;
  level: number;
  color: string;
}

export default function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changes, setChanges] = useState<{added: string[], removed: string[]}>({added: [], removed: []});
  const [isLoading, setIsLoading] = useState(false);

  // Filter permissions based on selected category and search text
  const filteredPermissions = permissions.filter(permission => {
    const categoryMatch = activeCategory === 'all' || permission.category === activeCategory;
    const searchMatch = permission.name.toLowerCase().includes(searchText.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Get role by ID
  const getRoleById = (roleId: number): Role | undefined => {
    return roles.find(r => r.id === roleId);
  };

  // Handle dragging end
  const onDragEnd = (result: any) => {
    if (!result.destination || !selectedRole) return;

    const { draggableId, destination } = result;
    const permissionId = draggableId;
    const targetPermission = permissions.find(p => p.id === permissionId);
    
    if (!targetPermission) return;

    const isAddOperation = destination.droppableId === 'role-permissions';
    
    // Update permissions
    const newPermissions = permissions.map(permission => {
      if (permission.id === permissionId) {
        // Add or remove the role from this permission
        let updatedRoles = [...permission.roles];
        
        if (isAddOperation && !updatedRoles.includes(selectedRole)) {
          // Add role
          updatedRoles.push(selectedRole);
          // Track change
          setChanges(prev => ({
            ...prev, 
            added: [...prev.added, `${permission.name} for ${getRoleById(selectedRole)?.name}`]
          }));
        } else if (!isAddOperation && updatedRoles.includes(selectedRole)) {
          // Remove role
          updatedRoles = updatedRoles.filter(roleId => roleId !== selectedRole);
          // Track change
          setChanges(prev => ({
            ...prev, 
            removed: [...prev.removed, `${permission.name} from ${getRoleById(selectedRole)?.name}`]
          }));
        }
        
        return { ...permission, roles: updatedRoles };
      }
      return permission;
    });
    
    setPermissions(newPermissions);
  };

  // Save changes
  const saveChanges = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowChangesDialog(true);
    }, 1000);
  };

  // Reset changes
  const resetChanges = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setPermissions(initialPermissions);
      setChanges({added: [], removed: []});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role Permissions Management</h1>
          <p className="text-gray-600">Drag and drop permissions to manage role-based access</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={resetChanges}
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={saveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Role</CardTitle>
              <CardDescription>Choose a role to manage permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant={selectedRole === role.id ? "default" : "outline"}
                  className={`w-full justify-start ${selectedRole === role.id ? '' : role.color}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {role.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Permissions panel */}
        <div className="lg:col-span-3">
          <DragDropContext onDragEnd={onDragEnd}>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>
                      {selectedRole 
                        ? `Permissions for ${getRoleById(selectedRole)?.name}` 
                        : "Select a role to manage permissions"}
                    </CardTitle>
                    <CardDescription>Drag permissions between the lists to assign or remove them</CardDescription>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search permissions..."
                        className="pl-8 w-full md:w-[200px]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                    
                    <Select 
                      value={activeCategory} 
                      onValueChange={setActiveCategory}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {permissionCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedRole ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Available permissions */}
                    <Droppable droppableId="available-permissions">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="border rounded-lg p-4 bg-gray-50 min-h-[400px]"
                        >
                          <div className="mb-3 flex justify-between items-center">
                            <h3 className="font-medium text-gray-700">Available Permissions</h3>
                            <Badge variant="outline" className="bg-gray-100">
                              {filteredPermissions.filter(p => !p.roles.includes(selectedRole)).length}
                            </Badge>
                          </div>
                          
                          <ScrollArea className="h-[360px] pr-4">
                            {filteredPermissions
                              .filter(permission => !permission.roles.includes(selectedRole))
                              .map((permission, index) => (
                                <Draggable 
                                  key={permission.id} 
                                  draggableId={permission.id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-3 mb-2 rounded-md border ${
                                        snapshot.isDragging 
                                          ? 'bg-blue-50 border-blue-200 shadow-md' 
                                          : 'bg-white border-gray-200'
                                      } transition-colors flex items-center justify-between`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                          <Lock className="h-4 w-4 text-gray-600" />
                                        </span>
                                        <div>
                                          <div className="font-medium">{permission.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {permissionCategories.find(c => c.id === permission.category)?.name}
                                          </div>
                                        </div>
                                      </div>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <MoveVertical className="h-4 w-4 text-gray-400" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Drag to assign</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {filteredPermissions.filter(p => !p.roles.includes(selectedRole)).length === 0 && (
                              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                                <Info className="h-10 w-10 mb-2 text-gray-300" />
                                <p>No available permissions matching your criteria</p>
                              </div>
                            )}
                            {provided.placeholder}
                          </ScrollArea>
                        </div>
                      )}
                    </Droppable>
                    
                    {/* Assigned permissions */}
                    <Droppable droppableId="role-permissions">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="border rounded-lg p-4 bg-gradient-to-b from-primary-50 to-white min-h-[400px]"
                        >
                          <div className="mb-3 flex justify-between items-center">
                            <h3 className="font-medium text-primary-700">Assigned Permissions</h3>
                            <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                              {filteredPermissions.filter(p => p.roles.includes(selectedRole)).length}
                            </Badge>
                          </div>
                          
                          <ScrollArea className="h-[360px] pr-4">
                            {filteredPermissions
                              .filter(permission => permission.roles.includes(selectedRole))
                              .map((permission, index) => (
                                <Draggable 
                                  key={permission.id} 
                                  draggableId={permission.id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-3 mb-2 rounded-md border ${
                                        snapshot.isDragging 
                                          ? 'bg-primary-100 border-primary-200 shadow-md' 
                                          : 'bg-white border-primary-100'
                                      } transition-colors flex items-center justify-between`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-100">
                                          <CheckCircle className="h-4 w-4 text-primary-600" />
                                        </span>
                                        <div>
                                          <div className="font-medium">{permission.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {permissionCategories.find(c => c.id === permission.category)?.name}
                                          </div>
                                        </div>
                                      </div>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <MoveVertical className="h-4 w-4 text-gray-400" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Drag to remove</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {filteredPermissions.filter(p => p.roles.includes(selectedRole)).length === 0 && (
                              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                                <AlertCircle className="h-10 w-10 mb-2 text-gray-300" />
                                <p>No permissions assigned to this role that match your criteria</p>
                                <p className="text-xs mt-1">Drag permissions from the left panel to assign them</p>
                              </div>
                            )}
                            {provided.placeholder}
                          </ScrollArea>
                        </div>
                      )}
                    </Droppable>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <ShieldCheck className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Select a Role</h3>
                    <p className="max-w-md text-gray-500 mt-2">
                      Choose a role from the left panel to manage its permissions. You can then
                      drag permissions between panels to assign or remove them.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </DragDropContext>
        </div>
      </div>

      {/* Changes summary dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Changes Saved Successfully</DialogTitle>
            <DialogDescription>
              The following permission changes have been applied
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {changes.added.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Added Permissions
                </h4>
                <ul className="space-y-1 text-sm">
                  {changes.added.map((change, idx) => (
                    <li key={idx} className="text-gray-600">• {change}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {changes.removed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                  Removed Permissions
                </h4>
                <ul className="space-y-1 text-sm">
                  {changes.removed.map((change, idx) => (
                    <li key={idx} className="text-gray-600">• {change}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {changes.added.length === 0 && changes.removed.length === 0 && (
              <p className="text-gray-600">No changes were made to permissions.</p>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => {
                setShowChangesDialog(false);
                setChanges({added: [], removed: []});
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}