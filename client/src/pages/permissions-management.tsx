import React, { useState, useEffect } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Edit,
  Info,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

// Type definitions
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  default: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: string[];
  usersCount: number;
  color: string;
  isSystemRole: boolean;
}

// Sample permission categories
const permissionCategories = [
  'Service User Management',
  'Care Plan Management',
  'Staff Management',
  'Scheduling',
  'Reports',
  'System Administration',
  'Finance',
  'Communication',
  'Compliance',
];

// Sample permissions data
const permissionsData: Permission[] = [
  // Service User Management
  { id: 'service_user_view', name: 'View Service Users', description: 'Can view service user profiles', category: 'Service User Management', default: true },
  { id: 'service_user_create', name: 'Create Service Users', description: 'Can create new service user profiles', category: 'Service User Management', default: false },
  { id: 'service_user_edit', name: 'Edit Service Users', description: 'Can edit service user profiles', category: 'Service User Management', default: false },
  { id: 'service_user_archive', name: 'Archive Service Users', description: 'Can archive service user profiles', category: 'Service User Management', default: false },
  { id: 'service_user_delete', name: 'Delete Service Users', description: 'Can permanently delete service user profiles', category: 'Service User Management', default: false },
  
  // Care Plan Management
  { id: 'care_plan_view', name: 'View Care Plans', description: 'Can view care plans', category: 'Care Plan Management', default: true },
  { id: 'care_plan_create', name: 'Create Care Plans', description: 'Can create new care plans', category: 'Care Plan Management', default: false },
  { id: 'care_plan_edit', name: 'Edit Care Plans', description: 'Can edit existing care plans', category: 'Care Plan Management', default: false },
  { id: 'care_plan_archive', name: 'Archive Care Plans', description: 'Can archive care plans', category: 'Care Plan Management', default: false },
  { id: 'care_plan_delete', name: 'Delete Care Plans', description: 'Can permanently delete care plans', category: 'Care Plan Management', default: false },
  
  // Staff Management
  { id: 'staff_view', name: 'View Staff', description: 'Can view staff profiles', category: 'Staff Management', default: true },
  { id: 'staff_create', name: 'Create Staff', description: 'Can create new staff profiles', category: 'Staff Management', default: false },
  { id: 'staff_edit', name: 'Edit Staff', description: 'Can edit staff profiles', category: 'Staff Management', default: false },
  { id: 'staff_archive', name: 'Archive Staff', description: 'Can archive staff profiles', category: 'Staff Management', default: false },
  { id: 'staff_delete', name: 'Delete Staff', description: 'Can permanently delete staff profiles', category: 'Staff Management', default: false },
  
  // Scheduling
  { id: 'schedule_view', name: 'View Schedule', description: 'Can view schedules and appointments', category: 'Scheduling', default: true },
  { id: 'schedule_create', name: 'Create Appointments', description: 'Can create new appointments', category: 'Scheduling', default: false },
  { id: 'schedule_edit', name: 'Edit Appointments', description: 'Can edit existing appointments', category: 'Scheduling', default: false },
  { id: 'schedule_delete', name: 'Delete Appointments', description: 'Can delete appointments', category: 'Scheduling', default: false },
  
  // Reports
  { id: 'reports_view', name: 'View Reports', description: 'Can view system reports', category: 'Reports', default: true },
  { id: 'reports_create', name: 'Create Reports', description: 'Can create custom reports', category: 'Reports', default: false },
  { id: 'reports_export', name: 'Export Reports', description: 'Can export reports data', category: 'Reports', default: false },
  
  // System Administration
  { id: 'system_settings', name: 'System Settings', description: 'Can change system settings', category: 'System Administration', default: false },
  { id: 'user_management', name: 'User Management', description: 'Can manage user accounts', category: 'System Administration', default: false },
  { id: 'role_management', name: 'Role Management', description: 'Can manage roles and permissions', category: 'System Administration', default: false },
  { id: 'audit_logs', name: 'View Audit Logs', description: 'Can view system audit logs', category: 'System Administration', default: false },
  
  // Finance
  { id: 'finance_view', name: 'View Financial Data', description: 'Can view financial information', category: 'Finance', default: false },
  { id: 'finance_edit', name: 'Edit Financial Data', description: 'Can edit financial information', category: 'Finance', default: false },
  { id: 'invoicing', name: 'Manage Invoices', description: 'Can create and manage invoices', category: 'Finance', default: false },
  
  // Communication
  { id: 'messaging', name: 'Messaging', description: 'Can send and receive internal messages', category: 'Communication', default: true },
  { id: 'email_send', name: 'Send Emails', description: 'Can send emails to users and clients', category: 'Communication', default: false },
  { id: 'notification_management', name: 'Notification Management', description: 'Can manage system notifications', category: 'Communication', default: false },
  
  // Compliance
  { id: 'compliance_view', name: 'View Compliance Data', description: 'Can view compliance information', category: 'Compliance', default: true },
  { id: 'compliance_edit', name: 'Edit Compliance Data', description: 'Can edit compliance information', category: 'Compliance', default: false },
  { id: 'incident_reporting', name: 'Incident Reporting', description: 'Can report and manage incidents', category: 'Compliance', default: false },
  { id: 'policy_management', name: 'Policy Management', description: 'Can manage system policies', category: 'Compliance', default: false },
];

// Sample roles data
const rolesData: Role[] = [
  {
    id: 'system_admin',
    name: 'System Administrator',
    description: 'Full system access and control',
    level: 1,
    permissions: permissionsData.map(p => p.id),
    usersCount: 2,
    color: 'bg-red-100 text-red-800 border-red-200',
    isSystemRole: true
  },
  {
    id: 'care_manager',
    name: 'Care Manager',
    description: 'Oversees care delivery and staff',
    level: 2,
    permissions: permissionsData.filter(p => 
      !['system_settings', 'user_management', 'role_management', 'audit_logs', 'service_user_delete', 'staff_delete', 'care_plan_delete'].includes(p.id)
    ).map(p => p.id),
    usersCount: 5,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    isSystemRole: true
  },
  {
    id: 'care_coordinator',
    name: 'Care Coordinator',
    description: 'Coordinates care delivery and scheduling',
    level: 3,
    permissions: [
      'service_user_view', 'service_user_create', 'service_user_edit',
      'care_plan_view', 'care_plan_create', 'care_plan_edit',
      'staff_view',
      'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_delete',
      'reports_view', 'reports_export',
      'messaging', 'email_send',
      'compliance_view', 'incident_reporting'
    ],
    usersCount: 8,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    isSystemRole: true
  },
  {
    id: 'caregiver',
    name: 'Caregiver',
    description: 'Provides direct care to service users',
    level: 4,
    permissions: [
      'service_user_view',
      'care_plan_view',
      'schedule_view',
      'messaging',
      'compliance_view', 'incident_reporting'
    ],
    usersCount: 25,
    color: 'bg-green-100 text-green-800 border-green-200',
    isSystemRole: true
  },
  {
    id: 'finance_admin',
    name: 'Finance Administrator',
    description: 'Manages financial aspects',
    level: 3,
    permissions: [
      'service_user_view',
      'reports_view', 'reports_export',
      'finance_view', 'finance_edit', 'invoicing',
      'messaging'
    ],
    usersCount: 3,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    isSystemRole: false
  },
  {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    description: 'Oversees regulatory compliance',
    level: 3,
    permissions: [
      'service_user_view',
      'care_plan_view',
      'staff_view',
      'reports_view', 'reports_export',
      'audit_logs',
      'messaging',
      'compliance_view', 'compliance_edit', 'incident_reporting', 'policy_management'
    ],
    usersCount: 2,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    isSystemRole: false
  },
];

export default function PermissionsManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(rolesData);
  const [permissions, setPermissions] = useState<Permission[]>(permissionsData);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
  const [showNewPermissionDialog, setShowNewPermissionDialog] = useState(false);
  const [showEditPermissionDialog, setShowEditPermissionDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 3,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  });
  const [editedRole, setEditedRole] = useState({
    id: '',
    name: '',
    description: '',
    level: 3,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  });
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    category: permissionCategories[0],
    default: false
  });
  const [editedPermission, setEditedPermission] = useState({
    id: '',
    name: '',
    description: '',
    category: permissionCategories[0],
    default: false
  });
  const [filterRole, setFilterRole] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // For drag and drop - track which permissions are assigned and unassigned for the selected role
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [unassignedPermissions, setUnassignedPermissions] = useState<Permission[]>([]);

  // Load permissions for the selected role
  useEffect(() => {
    if (selectedRole) {
      const assigned = permissions.filter(p => selectedRole.permissions.includes(p.id));
      const unassigned = permissions.filter(p => !selectedRole.permissions.includes(p.id));
      
      setAssignedPermissions(assigned);
      setUnassignedPermissions(unassigned);
    } else {
      setAssignedPermissions([]);
      setUnassignedPermissions([]);
    }
  }, [selectedRole, permissions]);
  
  // Filter permissions based on search and category filter
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Filter roles based on filter and search
  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || 
      (filterRole === 'system' && role.isSystemRole) || 
      (filterRole === 'custom' && !role.isSystemRole);
    
    return matchesSearch && matchesFilter;
  });

  // Handle drag end for permissions
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'assigned') {
        const reordered = [...assignedPermissions];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        setAssignedPermissions(reordered);
      } else if (source.droppableId === 'unassigned') {
        const reordered = [...unassignedPermissions];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        setUnassignedPermissions(reordered);
      }
    } 
    // Moving from one list to another
    else {
      if (source.droppableId === 'assigned' && destination.droppableId === 'unassigned') {
        // Moving from assigned to unassigned (removing permission)
        const sourceList = [...assignedPermissions];
        const destList = [...unassignedPermissions];
        const [removed] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, removed);
        
        setAssignedPermissions(sourceList);
        setUnassignedPermissions(destList);
        
        // Update the role's permissions
        if (selectedRole) {
          const updatedRoles = roles.map(role => {
            if (role.id === selectedRole.id) {
              return {
                ...role,
                permissions: sourceList.map(p => p.id)
              };
            }
            return role;
          });
          
          setRoles(updatedRoles);
          setSelectedRole({
            ...selectedRole,
            permissions: sourceList.map(p => p.id)
          });
          
          toast({
            title: "Permission removed",
            description: `Removed "${removed.name}" from ${selectedRole.name}`,
          });
        }
      } else if (source.droppableId === 'unassigned' && destination.droppableId === 'assigned') {
        // Moving from unassigned to assigned (adding permission)
        const sourceList = [...unassignedPermissions];
        const destList = [...assignedPermissions];
        const [removed] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, removed);
        
        setAssignedPermissions(destList);
        setUnassignedPermissions(sourceList);
        
        // Update the role's permissions
        if (selectedRole) {
          const updatedRoles = roles.map(role => {
            if (role.id === selectedRole.id) {
              return {
                ...role,
                permissions: destList.map(p => p.id)
              };
            }
            return role;
          });
          
          setRoles(updatedRoles);
          setSelectedRole({
            ...selectedRole,
            permissions: destList.map(p => p.id)
          });
          
          toast({
            title: "Permission added",
            description: `Added "${removed.name}" to ${selectedRole.name}`,
          });
        }
      }
    }
  };
  
  // Create a new role
  const handleCreateRole = () => {
    if (!newRole.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name is required"
      });
      return;
    }
    
    // Generate an ID from the name
    const id = newRole.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check if role with this ID already exists
    if (roles.some(r => r.id === id)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A role with this name already exists"
      });
      return;
    }
    
    const defaultPermissions = permissions
      .filter(p => p.default)
      .map(p => p.id);
    
    const newRoleObj: Role = {
      id,
      name: newRole.name,
      description: newRole.description,
      level: newRole.level,
      permissions: defaultPermissions,
      usersCount: 0,
      color: newRole.color,
      isSystemRole: false
    };
    
    setRoles([...roles, newRoleObj]);
    setShowNewRoleDialog(false);
    setNewRole({
      name: '',
      description: '',
      level: 3,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    });
    
    toast({
      title: "Role created",
      description: `${newRole.name} has been created successfully`
    });
  };
  
  // Update an existing role
  const handleUpdateRole = () => {
    if (!editedRole.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name is required"
      });
      return;
    }
    
    const updatedRoles = roles.map(role => {
      if (role.id === editedRole.id) {
        return {
          ...role,
          name: editedRole.name,
          description: editedRole.description,
          level: editedRole.level,
          color: editedRole.color
        };
      }
      return role;
    });
    
    setRoles(updatedRoles);
    
    // Update selectedRole if it was the one edited
    if (selectedRole && selectedRole.id === editedRole.id) {
      setSelectedRole({
        ...selectedRole,
        name: editedRole.name,
        description: editedRole.description,
        level: editedRole.level,
        color: editedRole.color
      });
    }
    
    setShowEditRoleDialog(false);
    
    toast({
      title: "Role updated",
      description: `${editedRole.name} has been updated successfully`
    });
  };
  
  // Delete a role
  const handleDeleteRole = () => {
    if (!selectedRole) return;
    
    if (selectedRole.usersCount > 0) {
      toast({
        variant: "destructive",
        title: "Cannot delete role",
        description: `${selectedRole.name} has ${selectedRole.usersCount} users assigned to it`
      });
      setShowDeleteRoleDialog(false);
      return;
    }
    
    if (selectedRole.isSystemRole) {
      toast({
        variant: "destructive",
        title: "Cannot delete system role",
        description: `${selectedRole.name} is a system role and cannot be deleted`
      });
      setShowDeleteRoleDialog(false);
      return;
    }
    
    const updatedRoles = roles.filter(role => role.id !== selectedRole.id);
    setRoles(updatedRoles);
    setSelectedRole(null);
    setShowDeleteRoleDialog(false);
    
    toast({
      title: "Role deleted",
      description: `${selectedRole.name} has been deleted successfully`
    });
  };
  
  // Create a new permission
  const handleCreatePermission = () => {
    if (!newPermission.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Permission name is required"
      });
      return;
    }
    
    // Generate an ID from the name
    const id = newPermission.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check if permission with this ID already exists
    if (permissions.some(p => p.id === id)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A permission with this name already exists"
      });
      return;
    }
    
    const newPermissionObj: Permission = {
      id,
      name: newPermission.name,
      description: newPermission.description,
      category: newPermission.category,
      default: newPermission.default
    };
    
    setPermissions([...permissions, newPermissionObj]);
    setShowNewPermissionDialog(false);
    setNewPermission({
      name: '',
      description: '',
      category: permissionCategories[0],
      default: false
    });
    
    toast({
      title: "Permission created",
      description: `${newPermission.name} has been created successfully`
    });
  };
  
  // Update an existing permission
  const handleUpdatePermission = () => {
    if (!editedPermission.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Permission name is required"
      });
      return;
    }
    
    const updatedPermissions = permissions.map(permission => {
      if (permission.id === editedPermission.id) {
        return {
          ...permission,
          name: editedPermission.name,
          description: editedPermission.description,
          category: editedPermission.category,
          default: editedPermission.default
        };
      }
      return permission;
    });
    
    setPermissions(updatedPermissions);
    setShowEditPermissionDialog(false);
    
    toast({
      title: "Permission updated",
      description: `${editedPermission.name} has been updated successfully`
    });
  };
  
  // Update the permissions of a role
  const bulkAddPermissions = (categoryToAdd: string) => {
    if (!selectedRole) return;
    
    // Find all permissions in the specified category that are not already assigned
    const permissionsToAdd = permissions.filter(
      p => p.category === categoryToAdd && !selectedRole.permissions.includes(p.id)
    );
    
    if (permissionsToAdd.length === 0) {
      toast({
        title: "No permissions to add",
        description: `All permissions in ${categoryToAdd} are already assigned`
      });
      return;
    }
    
    // Add the permissions to the role
    const updatedPermissions = [
      ...selectedRole.permissions,
      ...permissionsToAdd.map(p => p.id)
    ];
    
    // Update the roles
    const updatedRoles = roles.map(role => {
      if (role.id === selectedRole.id) {
        return {
          ...role,
          permissions: updatedPermissions
        };
      }
      return role;
    });
    
    setRoles(updatedRoles);
    
    // Update the selected role
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
    
    // Update assigned and unassigned permissions
    setAssignedPermissions([
      ...assignedPermissions,
      ...permissionsToAdd
    ]);
    setUnassignedPermissions(
      unassignedPermissions.filter(p => p.category !== categoryToAdd || selectedRole.permissions.includes(p.id))
    );
    
    toast({
      title: "Permissions added",
      description: `Added ${permissionsToAdd.length} permissions from ${categoryToAdd} to ${selectedRole.name}`
    });
  };
  
  // Get color class for role level
  const getRoleLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-purple-100 text-purple-800';
      case 3: return 'bg-blue-100 text-blue-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get human-readable role level
  const getRoleLevelName = (level: number) => {
    switch (level) {
      case 1: return 'System Administrator';
      case 2: return 'Manager';
      case 3: return 'Coordinator';
      case 4: return 'Staff';
      case 5: return 'Basic User';
      default: return 'Custom';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Role & Permission Management</h1>
          <p className="text-muted-foreground">Manage roles and permissions within the system</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Role</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Add a new role with custom permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    placeholder="e.g., Shift Manager"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input
                    id="role-description"
                    placeholder="Brief description of the role's purpose"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-level">Access Level</Label>
                  <Select 
                    value={newRole.level.toString()} 
                    onValueChange={(value) => setNewRole({ ...newRole, level: parseInt(value) })}
                  >
                    <SelectTrigger id="role-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 - Manager</SelectItem>
                      <SelectItem value="3">3 - Coordinator</SelectItem>
                      <SelectItem value="4">4 - Staff</SelectItem>
                      <SelectItem value="5">5 - Basic User</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level 1 (System Administrator) can only be assigned by developers
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-color">Color</Label>
                  <Select 
                    value={newRole.color} 
                    onValueChange={(value) => setNewRole({ ...newRole, color: value })}
                  >
                    <SelectTrigger id="role-color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-purple-100 text-purple-800 border-purple-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200 mr-2"></div>
                          <span>Purple</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-blue-100 text-blue-800 border-blue-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200 mr-2"></div>
                          <span>Blue</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-green-100 text-green-800 border-green-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-green-100 border border-green-200 mr-2"></div>
                          <span>Green</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200 mr-2"></div>
                          <span>Yellow</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-orange-100 text-orange-800 border-orange-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200 mr-2"></div>
                          <span>Orange</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-red-100 text-red-800 border-red-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-red-100 border border-red-200 mr-2"></div>
                          <span>Red</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-pink-100 text-pink-800 border-pink-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-pink-100 border border-pink-200 mr-2"></div>
                          <span>Pink</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-gray-100 text-gray-800 border-gray-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 mr-2"></div>
                          <span>Gray</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewRoleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showNewPermissionDialog} onOpenChange={setShowNewPermissionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Permission</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
                <DialogDescription>
                  Add a new permission that can be assigned to roles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="permission-name">Permission Name</Label>
                  <Input
                    id="permission-name"
                    placeholder="e.g., View Staff Schedule"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permission-description">Description</Label>
                  <Input
                    id="permission-description"
                    placeholder="What this permission allows"
                    value={newPermission.description}
                    onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permission-category">Category</Label>
                  <Select 
                    value={newPermission.category} 
                    onValueChange={(value) => setNewPermission({ ...newPermission, category: value })}
                  >
                    <SelectTrigger id="permission-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {permissionCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="permission-default" 
                    checked={newPermission.default}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, default: !!checked })}
                  />
                  <Label htmlFor="permission-default">
                    Default permission (automatically assigned to new roles)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewPermissionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePermission}>
                  Create Permission
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Roles</CardTitle>
              <Select
                value={filterRole}
                onValueChange={setFilterRole}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="system">System Roles</SelectItem>
                  <SelectItem value="custom">Custom Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {roles.length} roles defined in the system
            </CardDescription>
            <div className="mt-2">
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRoles.map(role => (
                <div 
                  key={role.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedRole?.id === role.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center rounded bg-gray-100 px-1 py-0.5 text-xs">
                                  <ShieldCheck className="h-3 w-3 mr-1 text-gray-500" />
                                  System
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>System roles are predefined and have limited editing options</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                    </div>
                    <Badge className={role.color}>
                      {getRoleLevelName(role.level)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      <span className="inline-flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {role.usersCount} user{role.usersCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      <span className="inline-flex items-center">
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredRoles.length === 0 && (
                <div className="p-6 text-center border border-dashed rounded-md">
                  <div className="flex justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Create a new role to get started'}
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowNewRoleDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>New Role</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Role Details and Permission Management */}
        <Card className="lg:col-span-2">
          {selectedRole ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedRole.name}
                      <Badge className={selectedRole.color}>
                        Level {selectedRole.level}
                      </Badge>
                      {selectedRole.isSystemRole && (
                        <Badge variant="outline" className="ml-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>System Role</span>
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedRole.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditedRole({
                                id: selectedRole.id,
                                name: selectedRole.name,
                                description: selectedRole.description,
                                level: selectedRole.level,
                                color: selectedRole.color
                              });
                              setShowEditRoleDialog(true);
                            }}
                            disabled={selectedRole.isSystemRole && selectedRole.id === 'system_admin'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Role</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteRoleDialog(true)}
                            disabled={selectedRole.isSystemRole || selectedRole.usersCount > 0}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedRole.isSystemRole 
                            ? "System roles cannot be deleted" 
                            : selectedRole.usersCount > 0
                              ? "Cannot delete roles with assigned users"
                              : "Delete Role"
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Users: </span>
                    <strong>{selectedRole.usersCount}</strong>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Permissions: </span>
                    <strong>{selectedRole.permissions.length}</strong>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-medium mb-2">Permission Management</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Drag and drop permissions between the lists to manage this role's access
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    {/* Assigned Permissions */}
                    <div className="border rounded-md">
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h4 className="text-sm font-medium flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2 text-primary-500" />
                          Assigned Permissions ({assignedPermissions.length})
                        </h4>
                        <div className="flex">
                          <Select
                            value="actions"
                            onValueChange={() => {}}
                          >
                            <SelectTrigger className="h-8 text-xs border-none bg-transparent p-0 hover:bg-transparent hover:opacity-70">
                              <MoreHorizontal className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="copy">Copy permissions</SelectItem>
                              <SelectItem value="clear">Clear all permissions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Droppable droppableId="assigned">
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="max-h-[350px] overflow-y-auto p-1"
                          >
                            {assignedPermissions.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500 border border-dashed rounded-md m-2">
                                No permissions assigned yet.
                                <br />
                                Drag permissions from the unassigned list.
                              </div>
                            ) : (
                              <div className="space-y-2 p-2">
                                {assignedPermissions.map((permission, index) => (
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
                                        className={`p-2 border rounded-md ${
                                          snapshot.isDragging 
                                            ? 'bg-primary-50 border-primary-200' 
                                            : 'bg-white hover:bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="text-sm font-medium">{permission.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {permission.description}
                                            </div>
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {permission.category}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                    
                    {/* Unassigned Permissions */}
                    <div className="border rounded-md">
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h4 className="text-sm font-medium flex items-center">
                          <ShieldAlert className="h-4 w-4 mr-2 text-gray-500" />
                          Available Permissions ({unassignedPermissions.length})
                        </h4>
                        <Input
                          placeholder="Filter..."
                          className="h-8 w-[120px] text-xs"
                          onChange={(e) => setFilterCategory(e.target.value)}
                        />
                      </div>
                      
                      <div className="p-3 border-b">
                        <Select
                          value={filterCategory}
                          onValueChange={setFilterCategory}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {permissionCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {permissionCategories.map(category => {
                            const count = unassignedPermissions.filter(p => p.category === category).length;
                            if (count === 0) return null;
                            
                            return (
                              <Badge 
                                key={category}
                                variant="outline" 
                                className="cursor-pointer text-xs"
                                onClick={() => bulkAddPermissions(category)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span>Add all {category} ({count})</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      
                      <Droppable droppableId="unassigned">
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="max-h-[270px] overflow-y-auto p-1"
                          >
                            {unassignedPermissions.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500 border border-dashed rounded-md m-2">
                                No more permissions available.
                                <br />
                                All permissions have been assigned.
                              </div>
                            ) : (
                              <div className="space-y-2 p-2">
                                {unassignedPermissions
                                  .filter(p => filterCategory === 'all' || p.category === filterCategory)
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
                                          className={`p-2 border rounded-md ${
                                            snapshot.isDragging 
                                              ? 'bg-primary-50 border-primary-200' 
                                              : 'bg-white hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="text-sm font-medium">{permission.name}</div>
                                              <div className="text-xs text-gray-500 mt-0.5">
                                                {permission.description}
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {permission.category}
                                            </Badge>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </DragDropContext>
                </div>
                
                <div className="mt-6 flex items-center">
                  <InfoAlert>
                    Drag permissions between lists to assign or remove them from this role. Changes are saved automatically.
                  </InfoAlert>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[500px] text-center p-4">
              <Shield className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Role Selected</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm">
                Select a role from the list on the left to view and manage its permissions.
                You can add, remove, and organize permissions for each role.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setShowNewRoleDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span>Create New Role</span>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* All Permissions List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>All Permissions</CardTitle>
            <div className="flex gap-2">
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {permissionCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => setShowNewPermissionDialog(true)}>
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            System permissions that can be assigned to roles
          </CardDescription>
          <div className="mt-2">
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell>{permission.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {permission.default ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setEditedPermission({
                              id: permission.id,
                              name: permission.name,
                              description: permission.description,
                              category: permission.category,
                              default: permission.default
                            });
                            setShowEditPermissionDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Copy permission ID to clipboard
                            navigator.clipboard.writeText(permission.id);
                            toast({
                              title: "Permission ID copied",
                              description: `"${permission.id}" copied to clipboard`
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No permissions found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Role Dialog */}
      <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify the role's details and properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={editedRole.name}
                onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
                disabled={selectedRole?.isSystemRole}
              />
              {selectedRole?.isSystemRole && (
                <p className="text-xs text-muted-foreground">
                  System role names cannot be changed
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Input
                id="edit-role-description"
                value={editedRole.description}
                onChange={(e) => setEditedRole({ ...editedRole, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-level">Access Level</Label>
              <Select 
                value={editedRole.level.toString()} 
                onValueChange={(value) => setEditedRole({ ...editedRole, level: parseInt(value) })}
                disabled={selectedRole?.isSystemRole}
              >
                <SelectTrigger id="edit-role-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRole?.id === 'system_admin' ? (
                    <SelectItem value="1">1 - System Administrator</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="2">2 - Manager</SelectItem>
                      <SelectItem value="3">3 - Coordinator</SelectItem>
                      <SelectItem value="4">4 - Staff</SelectItem>
                      <SelectItem value="5">5 - Basic User</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {selectedRole?.isSystemRole && (
                <p className="text-xs text-muted-foreground">
                  System role levels cannot be changed
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-color">Color</Label>
              <Select 
                value={editedRole.color} 
                onValueChange={(value) => setEditedRole({ ...editedRole, color: value })}
              >
                <SelectTrigger id="edit-role-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-purple-100 text-purple-800 border-purple-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200 mr-2"></div>
                      <span>Purple</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-blue-100 text-blue-800 border-blue-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200 mr-2"></div>
                      <span>Blue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-green-100 text-green-800 border-green-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-green-100 border border-green-200 mr-2"></div>
                      <span>Green</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200 mr-2"></div>
                      <span>Yellow</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-orange-100 text-orange-800 border-orange-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200 mr-2"></div>
                      <span>Orange</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-red-100 text-red-800 border-red-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-red-100 border border-red-200 mr-2"></div>
                      <span>Red</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-pink-100 text-pink-800 border-pink-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-pink-100 border border-pink-200 mr-2"></div>
                      <span>Pink</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-gray-100 text-gray-800 border-gray-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 mr-2"></div>
                      <span>Gray</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Role Confirmation Dialog */}
      <Dialog open={showDeleteRoleDialog} onOpenChange={setShowDeleteRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRole && (
              <div className="p-3 border rounded-md">
                <div className="font-medium">{selectedRole.name}</div>
                <div className="text-sm text-gray-500 mt-1">{selectedRole.description}</div>
                <div className="flex items-center mt-2">
                  <Badge className={selectedRole.color}>
                    {getRoleLevelName(selectedRole.level)}
                  </Badge>
                  <span className="text-sm text-gray-500 ml-2">
                    {selectedRole.permissions.length} permissions
                  </span>
                </div>
              </div>
            )}
            
            {selectedRole && selectedRole.usersCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4 text-amber-800 text-sm">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <strong>Cannot delete this role</strong>
                    <p className="mt-1">
                      This role has {selectedRole && selectedRole.usersCount} users assigned to it.
                      Reassign these users to another role before deleting.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedRole?.isSystemRole && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4 text-amber-800 text-sm">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <strong>Cannot delete system role</strong>
                    <p className="mt-1">
                      System roles are required for the application to function correctly
                      and cannot be deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteRoleDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={selectedRole?.isSystemRole || (selectedRole?.usersCount || 0) > 0}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Permission Dialog */}
      <Dialog open={showEditPermissionDialog} onOpenChange={setShowEditPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Modify the permission's details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-permission-name">Permission Name</Label>
              <Input
                id="edit-permission-name"
                value={editedPermission.name}
                onChange={(e) => setEditedPermission({ ...editedPermission, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-description">Description</Label>
              <Input
                id="edit-permission-description"
                value={editedPermission.description}
                onChange={(e) => setEditedPermission({ ...editedPermission, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-category">Category</Label>
              <Select 
                value={editedPermission.category} 
                onValueChange={(value) => setEditedPermission({ ...editedPermission, category: value })}
              >
                <SelectTrigger id="edit-permission-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {permissionCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-permission-default" 
                checked={editedPermission.default}
                onCheckedChange={(checked) => setEditedPermission({ ...editedPermission, default: !!checked })}
              />
              <Label htmlFor="edit-permission-default">
                Default permission (automatically assigned to new roles)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPermissionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Alert component for information
function InfoAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 w-full text-blue-800 text-sm">
      <div className="flex">
        <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}