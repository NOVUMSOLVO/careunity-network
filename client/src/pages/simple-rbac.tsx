import React, { useState } from 'react';
import { 
  ShieldCheck,
  Users,
  Lock,
  Search,
  Edit,
  Trash2,
  PlusCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  Filter,
  Building,
  ChevronDown
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define roles for the system
const roles = [
  { id: 1, name: 'System Administrator', level: 1, color: 'bg-red-100 text-red-800' },
  { id: 2, name: 'Regional Manager', level: 2, color: 'bg-orange-100 text-orange-800' },
  { id: 3, name: 'Service Manager', level: 3, color: 'bg-amber-100 text-amber-800' },
  { id: 4, name: 'Care Coordinator', level: 4, color: 'bg-yellow-100 text-yellow-800' },
  { id: 5, name: 'Senior Carer', level: 5, color: 'bg-lime-100 text-lime-800' },
  { id: 6, name: 'Care Worker', level: 6, color: 'bg-green-100 text-green-800' },
];

// Sample users for the system
const sampleUsers = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    email: 'sarah.johnson@careunity.com',
    roleId: 3,
    status: 'active',
    branch: 'London East',
    lastLogin: '2023-05-18 09:23 AM'
  },
  { 
    id: 2, 
    name: 'Michael Brown', 
    email: 'michael.brown@careunity.com',
    roleId: 6,
    status: 'active',
    branch: 'London East',
    lastLogin: '2023-05-18 08:15 AM'
  },
  { 
    id: 3, 
    name: 'James Wilson', 
    email: 'james.wilson@careunity.com',
    roleId: 1,
    status: 'active',
    branch: 'All Branches',
    lastLogin: '2023-05-17 04:45 PM'
  },
  { 
    id: 4, 
    name: 'Emily Roberts', 
    email: 'emily.roberts@careunity.com',
    roleId: 5,
    status: 'active',
    branch: 'London East',
    lastLogin: '2023-05-17 02:30 PM'
  },
  { 
    id: 5, 
    name: 'David Thompson', 
    email: 'david.thompson@careunity.com',
    roleId: 4,
    status: 'inactive',
    branch: 'London East',
    lastLogin: '2023-05-10 11:05 AM'
  },
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

// Sample permissions for each category
const permissions = [
  // User Management
  { id: 'create_user', name: 'Create User', category: 'user_management', roles: [1, 2, 3] },
  { id: 'edit_user', name: 'Edit User', category: 'user_management', roles: [1, 2, 3, 4] },
  { id: 'view_users', name: 'View Users', category: 'user_management', roles: [1, 2, 3, 4, 5] },
  
  // Service User Management
  { id: 'create_service_user', name: 'Create Service User', category: 'service_user_management', roles: [1, 2, 3] },
  { id: 'edit_service_user', name: 'Edit Service User', category: 'service_user_management', roles: [1, 2, 3, 4] },
  { id: 'view_service_users', name: 'View Service Users', category: 'service_user_management', roles: [1, 2, 3, 4, 5, 6] },
  
  // Allocation & Scheduling
  { id: 'create_schedule', name: 'Create Schedule', category: 'allocation', roles: [1, 2, 3, 4] },
  { id: 'edit_schedule', name: 'Edit Schedule', category: 'allocation', roles: [1, 2, 3, 4] },
  { id: 'view_schedule', name: 'View Schedule', category: 'allocation', roles: [1, 2, 3, 4, 5, 6] },
  
  // Care Planning
  { id: 'create_care_plan', name: 'Create Care Plan', category: 'care_planning', roles: [1, 2, 3, 4] },
  { id: 'approve_care_plan', name: 'Approve Care Plan', category: 'care_planning', roles: [1, 2, 3] },
  
  // Reporting
  { id: 'generate_reports', name: 'Generate Reports', category: 'reporting', roles: [1, 2, 3] },
  { id: 'view_dashboards', name: 'View Dashboards', category: 'reporting', roles: [1, 2, 3, 4] },
  
  // System Configuration
  { id: 'system_settings', name: 'System Settings', category: 'system', roles: [1] },
  { id: 'manage_roles', name: 'Manage Roles', category: 'system', roles: [1] },
];

export default function SimpleRbacManagement() {
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Filter users based on search and filters
  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = !filterRole || user.roleId.toString() === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Get role details by ID
  const getRoleById = (roleId: number) => {
    return roles.find(role => role.id === roleId);
  };
  
  // Get permissions for a specific role
  const getPermissionsForRole = (roleId: number) => {
    return permissions.filter(permission => permission.roles.includes(roleId));
  };
  
  // Format role badge with appropriate color
  const formatRoleBadge = (roleId: number) => {
    const role = getRoleById(roleId);
    if (!role) return null;
    
    return (
      <Badge className={role.color}>
        {role.name}
      </Badge>
    );
  };
  
  // Handle delete user button click
  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`Are you sure you want to delete this user?`)) {
      window.alert(`User with ID ${userId} would be deleted in a real application.`);
    }
  };
  
  // Handle edit user button click
  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId);
    window.alert(`User editing would be implemented in a real application.`);
  };
  
  // Handle edit role permissions
  const handleEditRole = (roleId: number) => {
    setSelectedRoleId(roleId);
    setShowEditRoleDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role-Based Access Control</h1>
          <p className="text-gray-600">Manage user roles, permissions, and access control</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.alert("Audit log would be displayed in a real application.")}
          >
            <Lock size={16} />
            <span>Audit Log</span>
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddUserDialog(true)}
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock size={16} />
            <span>Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={filterRole || "all"} onValueChange={(value) => setFilterRole(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatRoleBadge(user.roleId)}</TableCell>
                      <TableCell>{user.branch}</TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No users found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <Card key={role.id} className="bg-white">
              <CardHeader className={`${role.color} rounded-t-lg`}>
                <CardTitle className="flex justify-between items-center">
                  {role.name}
                  <Badge variant="outline" className="bg-white bg-opacity-90">Level {role.level}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Permissions:</h4>
                    <ul className="space-y-1">
                      {getPermissionsForRole(role.id)
                        .slice(0, 4)
                        .map(permission => (
                          <li key={permission.id} className="text-sm flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                            {permission.name}
                          </li>
                        ))}
                    </ul>
                    {getPermissionsForRole(role.id).length > 4 && (
                      <p className="text-xs text-gray-500 mt-2">
                        + {getPermissionsForRole(role.id).length - 4} more permissions
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEditRole(role.id)}>
                  Edit Permissions
                </Button>
                <Badge variant="outline" className="ml-auto">
                  {sampleUsers.filter(u => u.roleId === role.id).length} Users
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View and manage permissions across different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissionCategories.map(category => (
                  <div key={category.id} className="space-y-3">
                    <h3 className="text-lg font-medium flex items-center">
                      <ChevronDown className="h-5 w-5 mr-2" />
                      {category.name}
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">Permission</TableHead>
                            {roles.map(role => (
                              <TableHead key={role.id} className="text-center">
                                {role.name}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions
                            .filter(p => p.category === category.id)
                            .map(permission => (
                              <TableRow key={permission.id}>
                                <TableCell className="font-medium">{permission.name}</TableCell>
                                {roles.map(role => (
                                  <TableCell key={role.id} className="text-center">
                                    {permission.roles.includes(role.id) ? (
                                      <CheckCircle className="h-4 w-4 mx-auto text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mx-auto text-gray-300" />
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Jane" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Smith" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jane.smith@example.com" />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="6">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="branch">Branch</Label>
              <Select defaultValue="london_east">
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="london_east">London East</SelectItem>
                  <SelectItem value="london_west">London West</SelectItem>
                  <SelectItem value="manchester">Manchester</SelectItem>
                  <SelectItem value="birmingham">Birmingham</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="sendInvite" defaultChecked />
              <label
                htmlFor="sendInvite"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send invitation email
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              window.alert('New user would be added in a real application');
              setShowAddUserDialog(false);
            }}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedRoleId ? getRoleById(selectedRoleId)?.name : ''} Role
            </DialogTitle>
            <DialogDescription>
              Modify role settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {permissionCategories.map(category => (
                <div key={category.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions
                      .filter(p => p.category === category.id)
                      .map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`perm-${permission.id}`}
                            defaultChecked={selectedRoleId ? permission.roles.includes(selectedRoleId) : false}
                          />
                          <label htmlFor={`perm-${permission.id}`} className="text-sm">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              window.alert('Role permissions would be updated in a real application.');
              setShowEditRoleDialog(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}