import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Lock, 
  Building, 
  MapPin, 
  Eye, 
  Edit, 
  Search,
  PlusCircle,
  Trash2,
  KeyRound,
  CheckSquare,
  UserCog,
  AlertOctagon,
  Settings,
  ChevronDown,
  ChevronRight,
  Filter,
  Building2,
  ArrowUpRight
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define hierarchical roles with their levels
const rolesHierarchy = [
  { id: 1, name: 'System Administrator', level: 1, color: 'bg-red-100 text-red-800' },
  { id: 2, name: 'Regional/Area Manager', level: 2, color: 'bg-orange-100 text-orange-800' },
  { id: 3, name: 'Service/Branch Manager', level: 3, color: 'bg-amber-100 text-amber-800' },
  { id: 4, name: 'Care Coordinator/Supervisor', level: 4, color: 'bg-yellow-100 text-yellow-800' },
  { id: 5, name: 'Senior Care Worker', level: 5, color: 'bg-lime-100 text-lime-800' },
  { id: 6, name: 'Care Worker', level: 6, color: 'bg-green-100 text-green-800' },
  { id: 7, name: 'Office Administrator', level: 7, color: 'bg-cyan-100 text-cyan-800' },
  { id: 8, name: 'Finance/Payroll Staff', level: 8, color: 'bg-blue-100 text-blue-800' },
  { id: 9, name: 'Service User/Family Portal', level: 9, color: 'bg-indigo-100 text-indigo-800' },
];

// Define permission categories
const permissionCategories = [
  { id: 'user_management', name: 'User Management', icon: <Users size={16} /> },
  { id: 'service_user_management', name: 'Service User Management', icon: <UserCog size={16} /> },
  { id: 'allocation', name: 'Allocation & Scheduling', icon: <Building size={16} /> },
  { id: 'care_planning', name: 'Care Planning', icon: <CheckSquare size={16} /> },
  { id: 'reports', name: 'Reports & Analytics', icon: <Building2 size={16} /> },
  { id: 'finance', name: 'Finance & Payroll', icon: <Building2 size={16} /> },
  { id: 'system_config', name: 'System Configuration', icon: <Settings size={16} /> },
  { id: 'security', name: 'Security & Access Control', icon: <Lock size={16} /> },
];

// Sample permissions for each category
const permissionsList = [
  // User Management
  { id: 'create_user', name: 'Create User', category: 'user_management', minRoleLevel: 1 },
  { id: 'edit_user', name: 'Edit User', category: 'user_management', minRoleLevel: 3 },
  { id: 'delete_user', name: 'Delete User', category: 'user_management', minRoleLevel: 1 },
  { id: 'view_users', name: 'View Users', category: 'user_management', minRoleLevel: 3 },
  { id: 'assign_roles', name: 'Assign Roles', category: 'user_management', minRoleLevel: 1 },
  { id: 'manage_staff_records', name: 'Manage Staff Records', category: 'user_management', minRoleLevel: 3 },
  
  // Service User Management
  { id: 'create_service_user', name: 'Create Service User', category: 'service_user_management', minRoleLevel: 3 },
  { id: 'edit_service_user', name: 'Edit Service User', category: 'service_user_management', minRoleLevel: 4 },
  { id: 'view_service_users', name: 'View Service Users', category: 'service_user_management', minRoleLevel: 6 },
  { id: 'delete_service_user', name: 'Delete Service User', category: 'service_user_management', minRoleLevel: 3 },
  
  // Allocation & Scheduling
  { id: 'create_schedule', name: 'Create Schedule', category: 'allocation', minRoleLevel: 4 },
  { id: 'edit_schedule', name: 'Edit Schedule', category: 'allocation', minRoleLevel: 4 },
  { id: 'view_schedule', name: 'View Schedule', category: 'allocation', minRoleLevel: 6 },
  { id: 'allocate_staff', name: 'Allocate Staff', category: 'allocation', minRoleLevel: 4 },
  { id: 'bulk_allocation', name: 'Bulk Allocation', category: 'allocation', minRoleLevel: 4 },
  
  // Care Planning
  { id: 'create_care_plan', name: 'Create Care Plan', category: 'care_planning', minRoleLevel: 4 },
  { id: 'edit_care_plan', name: 'Edit Care Plan', category: 'care_planning', minRoleLevel: 4 },
  { id: 'approve_care_plan', name: 'Approve Care Plan', category: 'care_planning', minRoleLevel: 3 },
  { id: 'view_care_plan', name: 'View Care Plan', category: 'care_planning', minRoleLevel: 6 },
  
  // Reports & Analytics
  { id: 'generate_reports', name: 'Generate Reports', category: 'reports', minRoleLevel: 3 },
  { id: 'view_dashboards', name: 'View Dashboards', category: 'reports', minRoleLevel: 4 },
  { id: 'export_data', name: 'Export Data', category: 'reports', minRoleLevel: 3 },
  { id: 'view_analytics', name: 'View Analytics', category: 'reports', minRoleLevel: 2 },
  
  // Finance & Payroll
  { id: 'manage_invoices', name: 'Manage Invoices', category: 'finance', minRoleLevel: 8 },
  { id: 'process_payroll', name: 'Process Payroll', category: 'finance', minRoleLevel: 8 },
  { id: 'view_financial_reports', name: 'View Financial Reports', category: 'finance', minRoleLevel: 3 },
  { id: 'approve_expenses', name: 'Approve Expenses', category: 'finance', minRoleLevel: 3 },
  
  // System Configuration
  { id: 'system_settings', name: 'System Settings', category: 'system_config', minRoleLevel: 1 },
  { id: 'customize_forms', name: 'Customize Forms', category: 'system_config', minRoleLevel: 1 },
  { id: 'manage_templates', name: 'Manage Templates', category: 'system_config', minRoleLevel: 1 },
  { id: 'configure_integrations', name: 'Configure Integrations', category: 'system_config', minRoleLevel: 1 },
  
  // Security & Access Control
  { id: 'manage_roles', name: 'Manage Roles', category: 'security', minRoleLevel: 1 },
  { id: 'audit_logs', name: 'View Audit Logs', category: 'security', minRoleLevel: 1 },
  { id: 'password_reset', name: 'Reset Passwords', category: 'security', minRoleLevel: 1 },
  { id: 'manage_2fa', name: 'Manage 2FA', category: 'security', minRoleLevel: 1 },
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
    region: 'London',
    lastLogin: '2023-05-18 09:23 AM'
  },
  { 
    id: 2, 
    name: 'Michael Brown', 
    email: 'michael.brown@careunity.com',
    roleId: 6,
    status: 'active',
    branch: 'London East',
    region: 'London',
    lastLogin: '2023-05-18 08:15 AM'
  },
  { 
    id: 3, 
    name: 'James Wilson', 
    email: 'james.wilson@careunity.com',
    roleId: 1,
    status: 'active',
    branch: 'All Branches',
    region: 'All Regions',
    lastLogin: '2023-05-17 04:45 PM'
  },
  { 
    id: 4, 
    name: 'Emily Roberts', 
    email: 'emily.roberts@careunity.com',
    roleId: 5,
    status: 'active',
    branch: 'London East',
    region: 'London',
    lastLogin: '2023-05-17 02:30 PM'
  },
  { 
    id: 5, 
    name: 'David Thompson', 
    email: 'david.thompson@careunity.com',
    roleId: 8,
    status: 'inactive',
    branch: 'London East',
    region: 'London',
    lastLogin: '2023-05-10 11:05 AM'
  },
  { 
    id: 6, 
    name: 'Jennifer Parker', 
    email: 'jennifer.parker@careunity.com',
    roleId: 2,
    status: 'active',
    branch: 'All London Branches',
    region: 'London',
    lastLogin: '2023-05-18 10:45 AM'
  },
  { 
    id: 7, 
    name: 'Robert Davis', 
    email: 'robert.davis@careunity.com',
    roleId: 4,
    status: 'active',
    branch: 'London North',
    region: 'London',
    lastLogin: '2023-05-18 09:10 AM'
  },
];

// Geographic hierarchy
const regions = [
  { id: 1, name: 'London' },
  { id: 2, name: 'Manchester' },
  { id: 3, name: 'Birmingham' },
];

const branches = [
  { id: 1, name: 'London East', regionId: 1 },
  { id: 2, name: 'London North', regionId: 1 },
  { id: 3, name: 'London West', regionId: 1 },
  { id: 4, name: 'London South', regionId: 1 },
  { id: 5, name: 'Manchester Central', regionId: 2 },
  { id: 6, name: 'Manchester North', regionId: 2 },
  { id: 7, name: 'Birmingham City', regionId: 3 },
];

export default function RbacManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'geo'>('users');
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // Filter users based on search and filters
  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = !filterRole || user.roleId.toString() === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Get role name by ID
  const getRoleById = (roleId: number) => {
    return rolesHierarchy.find(role => role.id === roleId)?.name || 'Unknown Role';
  };
  
  // Get role color for badges
  const getRoleColor = (roleId: number) => {
    return rolesHierarchy.find(role => role.id === roleId)?.color || 'bg-gray-100 text-gray-800';
  };
  
  // Format role for display with a colored badge
  const formatRoleBadge = (roleId: number) => {
    const role = rolesHierarchy.find(r => r.id === roleId);
    if (!role) return null;
    
    return (
      <Badge className={role.color}>
        {role.name}
      </Badge>
    );
  };
  
  // Get permissions for a role level
  const getPermissionsForRoleLevel = (level: number) => {
    return permissionsList.filter(permission => permission.minRoleLevel >= level);
  };
  
  // Check if a specific role has a permission
  const doesRoleHavePermission = (roleLevel: number, permissionMinLevel: number) => {
    return roleLevel <= permissionMinLevel;
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

      <Tabs defaultValue="users" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="geo" className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Geographic Access</span>
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
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    {rolesHierarchy.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatRoleBadge(user.roleId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.branch}</div>
                      <div className="text-xs text-gray-500">{user.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                        Reset Pass
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedUserId && (
            <div className="bg-white rounded-lg shadow p-6">
              {(() => {
                const user = sampleUsers.find(u => u.id === selectedUserId);
                if (!user) return null;
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Basic info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                      
                      <div className="flex items-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-medium text-gray-900">{user.name}</h4>
                          <p className="text-gray-500">{user.email}</p>
                          <div className="mt-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Role</h5>
                          <div className="mt-1">
                            {formatRoleBadge(user.roleId)}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Geographic Access</h5>
                          <p className="text-sm">Region: {user.region}</p>
                          <p className="text-sm">Branch: {user.branch}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Last Login</h5>
                          <p className="text-sm">{user.lastLogin}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Middle column - Roles and permissions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Roles & Permissions</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Assigned Role</h5>
                          <div className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <ShieldCheck className="h-5 w-5 text-indigo-500 mr-2" />
                                <span className="font-medium">{getRoleById(user.roleId)}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                Change
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Access Level: {rolesHierarchy.find(r => r.id === user.roleId)?.level || '-'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Key Permissions</h5>
                          <div className="space-y-2">
                            {permissionCategories.slice(0, 3).map(category => (
                              <Collapsible key={category.id} className="border rounded-lg overflow-hidden">
                                <CollapsibleTrigger className="flex justify-between items-center w-full p-3 text-left bg-gray-50">
                                  <div className="flex items-center">
                                    {category.icon}
                                    <span className="ml-2 font-medium">{category.name}</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-3 space-y-2">
                                  {permissionsList
                                    .filter(p => p.category === category.id)
                                    .slice(0, 3) // Only show first 3 for preview
                                    .map(permission => (
                                      <div key={permission.id} className="flex items-center justify-between">
                                        <span className="text-sm">{permission.name}</span>
                                        {doesRoleHavePermission(
                                          rolesHierarchy.find(r => r.id === user.roleId)?.level || 99,
                                          permission.minRoleLevel
                                        ) ? (
                                          <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-gray-500">No Access</Badge>
                                        )}
                                      </div>
                                    ))}
                                  <Button variant="link" size="sm" className="text-indigo-600 p-0 h-auto">
                                    View all permissions
                                  </Button>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="mt-4 w-full">
                            View Full Permission Matrix
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - Security & Account */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Account</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center mb-3">
                            <KeyRound className="h-4 w-4 mr-1" />
                            Account Security
                          </h5>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">Two-Factor Authentication</div>
                              <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm">Password Last Changed</div>
                              <div className="text-sm">45 days ago</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm">Account Lockout Status</div>
                              <Badge className="bg-green-100 text-green-800">Normal</Badge>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              Reset Password
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Enable 2FA
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center mb-3">
                            <AlertOctagon className="h-4 w-4 mr-1" />
                            Account Actions
                          </h5>
                          
                          <div className="space-y-3">
                            <Button variant="outline" size="sm" className="w-full">
                              Temporary Access Elevation
                            </Button>
                            
                            <Button variant="outline" size="sm" className="w-full">
                              Impersonate User
                            </Button>
                            
                            {user.status === 'active' ? (
                              <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                Deactivate Account
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="w-full text-green-600 border-green-200 hover:bg-green-50">
                                Activate Account
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Role Hierarchy</CardTitle>
                <CardDescription>
                  User roles organized by access level (lower number = higher access)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rolesHierarchy.map((role) => (
                    <div 
                      key={role.id} 
                      className={`p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                        selectedRole === role.id ? 'border-indigo-300 bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${role.color}`}>
                          {role.level}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-gray-500">Access Level: {role.level}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="text-indigo-600 hover:text-indigo-800">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role.id);
                            setShowEditRoleDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Role Comparison</Button>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Custom Role
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>
                  Users assigned to each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rolesHierarchy.map((role) => {
                    const usersWithRole = sampleUsers.filter(user => user.roleId === role.id);
                    return (
                      <div key={role.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className={role.color}>
                              {role.name}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{usersWithRole.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(usersWithRole.length / sampleUsers.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View User Assignments</Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Role Details */}
          {selectedRole && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {rolesHierarchy.find(r => r.id === selectedRole)?.name} Role Details
                    </CardTitle>
                    <CardDescription>
                      Access level: {rolesHierarchy.find(r => r.id === selectedRole)?.level}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowEditRoleDialog(true)}
                  >
                    Edit Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Role Description</h4>
                    <p className="text-sm text-gray-700">
                      {selectedRole === 1 && "Full system access with no restrictions. Can manage users, configure the system, and access all data across all branches and regions."}
                      {selectedRole === 2 && "Multi-branch access within their assigned region. Can view and manage data across multiple branches, but cannot modify system settings."}
                      {selectedRole === 3 && "Full access to all staff and service users within a single branch. Can manage branch operations but cannot access other branches' data."}
                      {selectedRole === 4 && "Can manage care allocation and scheduling for their assigned teams. Has care plan approval capabilities within their assigned caseload."}
                      {selectedRole === 5 && "Limited allocation rights for their team only. Can contribute to care plans but cannot provide final approval."}
                      {selectedRole === 6 && "View-only access to their own schedule and care plans for assigned service users. Can log visits and document care provided."}
                      {selectedRole === 7 && "Can manage documents and basic staff records. Has schedule viewing capabilities but cannot modify care plans or allocations."}
                      {selectedRole === 8 && "Access to financial and payroll features. Can process invoices and payroll but cannot access care plans or medical information."}
                      {selectedRole === 9 && "Limited access to view their own care plan, scheduled visits, and assigned care workers. Cannot access other service users' information."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Permission Categories</h4>
                      
                      <div className="space-y-3">
                        {permissionCategories.map(category => {
                          const permissions = permissionsList.filter(p => p.category === category.id);
                          const roleLevel = rolesHierarchy.find(r => r.id === selectedRole)?.level || 99;
                          const allowedCount = permissions.filter(p => doesRoleHavePermission(roleLevel, p.minRoleLevel)).length;
                          
                          return (
                            <div key={category.id} className="flex justify-between items-center">
                              <div className="flex items-center">
                                {category.icon}
                                <span className="ml-2 text-sm">{category.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{allowedCount}/{permissions.length}</span>
                                <Badge className={allowedCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {allowedCount > 0 ? 
                                    allowedCount === permissions.length ? "Full Access" : "Partial Access" 
                                    : "No Access"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Geographic Access</h4>
                      
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Region Access</span>
                            <Badge className={
                              selectedRole <= 1 ? "bg-green-100 text-green-800" :
                              selectedRole === 2 ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {selectedRole <= 1 ? "All Regions" :
                               selectedRole === 2 ? "Single Region" :
                               "Branch Based"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedRole <= 1 ? "Can access data across all regions" :
                             selectedRole === 2 ? "Limited to their assigned region" :
                             "Access determined by branch assignment"}
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Branch Access</span>
                            <Badge className={
                              selectedRole <= 1 ? "bg-green-100 text-green-800" :
                              selectedRole === 2 ? "bg-blue-100 text-blue-800" :
                              selectedRole === 3 ? "bg-amber-100 text-amber-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {selectedRole <= 1 ? "All Branches" :
                               selectedRole === 2 ? "Regional Branches" :
                               selectedRole === 3 ? "Single Branch" :
                               "Team Based"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedRole <= 1 ? "Can access data across all branches" :
                             selectedRole === 2 ? "Limited to branches within their region" :
                             selectedRole === 3 ? "Limited to a single branch" :
                             "Access limited to their assigned teams"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Users With This Role</h4>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sampleUsers
                            .filter(user => user.roleId === selectedRole)
                            .map((user) => (
                            <tr key={user.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.branch}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {sampleUsers.filter(user => user.roleId === selectedRole).length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">
                                No users currently assigned to this role
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Permission Matrix</CardTitle>
                    <CardDescription>
                      Detailed permissions by role
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {permissionCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-1" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissionCategories.map(category => (
                    <Collapsible 
                      key={category.id}
                      open={expandedCategories.includes(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                      className="border rounded-lg overflow-hidden"
                    >
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center">
                          {category.icon}
                          <span className="ml-2 font-medium">{category.name}</span>
                        </div>
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-1">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Permission
                                </th>
                                {rolesHierarchy.map(role => (
                                  <th key={role.id} scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col items-center">
                                      <Badge className={role.color}>
                                        L{role.level}
                                      </Badge>
                                      <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                                        {role.name}
                                      </span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {permissionsList
                                .filter(permission => permission.category === category.id)
                                .map(permission => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {permission.name}
                                  </td>
                                  {rolesHierarchy.map(role => (
                                    <td key={role.id} className="px-2 py-4 whitespace-nowrap text-center">
                                      {doesRoleHavePermission(role.level, permission.minRoleLevel) ? (
                                        <CheckSquare className="h-5 w-5 text-green-500 mx-auto" />
                                      ) : (
                                        <div className="h-5 w-5 border border-gray-300 rounded mx-auto" />
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Role Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rolesHierarchy.map(role => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Badge className={role.color}>
                          Level {role.level}
                        </Badge>
                        <span className="text-sm">{role.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Permission Templates</CardTitle>
                  <CardDescription>Quickly apply permission sets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Basic Care Worker</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Coordinator Template</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Manager Template</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Read-Only Access</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Create Template
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Geographic Access Tab */}
        <TabsContent value="geo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Geographic Access Control</CardTitle>
                <CardDescription>
                  Manage access to regions and branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regions.map(region => (
                    <Collapsible key={region.id} className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                          <span className="font-medium">{region.name} Region</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3">
                        <div className="space-y-3">
                          {branches
                            .filter(branch => branch.regionId === region.id)
                            .map(branch => (
                              <div key={branch.id} className="pl-6 border-l-2 border-indigo-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 text-indigo-400 mr-2" />
                                    <span className="text-sm font-medium">{branch.name}</span>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Manage Access
                                  </Button>
                                </div>
                                <div className="mt-2 pl-6">
                                  <div className="text-xs text-gray-500 mb-1">Users with access:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {sampleUsers
                                      .filter(user => 
                                        user.branch === branch.name || 
                                        user.branch === 'All Branches' || 
                                        user.branch === `All ${region.name} Branches`
                                      )
                                      .map(user => (
                                        <Badge key={user.id} className={getRoleColor(user.roleId)}>
                                          {user.name.split(' ').map(n => n[0]).join('')}
                                        </Badge>
                                      ))
                                    }
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Access Audit</Button>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Building className="h-4 w-4 mr-1" />
                    Add Branch
                  </Button>
                  <Button>
                    <MapPin className="h-4 w-4 mr-1" />
                    Add Region
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Access Rules</CardTitle>
                  <CardDescription>Default role-based access rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-red-100 text-red-800">
                          System Administrator
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Access to all regions and branches</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-orange-100 text-orange-800">
                          Regional Manager
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Access to all branches within assigned region</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-amber-100 text-amber-800">
                          Branch Manager
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Access limited to assigned branch only</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Care Coordinator
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Access limited to assigned teams within branch</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-lime-100 text-lime-800">
                          Senior Care Worker
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Access limited to assigned service users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Access Override</CardTitle>
                  <CardDescription>Temporary access exceptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Michael Brown</div>
                        <div className="text-xs text-gray-500">Temporary access to London North</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Active
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires: May 25, 2023 (3 days left)
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Grant Temporary Access
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[600px]">
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
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter email address" type="email" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesHierarchy.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="region">Region</Label>
                <Select>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id.toString()}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="branch">Branch</Label>
                <Select>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sendInvite">Welcome Email</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="sendInvite" defaultChecked />
                <label htmlFor="sendInvite" className="text-sm text-gray-500">
                  Send welcome email with login instructions
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              alert('In a real application, this would create a new user account');
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
              Edit {selectedRole ? rolesHierarchy.find(r => r.id === selectedRole)?.name : ''} Role
            </DialogTitle>
            <DialogDescription>
              Modify role settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="roleName">Role Name</Label>
              <Input 
                id="roleName" 
                defaultValue={rolesHierarchy.find(r => r.id === selectedRole)?.name} 
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="roleDescription">Description</Label>
              <textarea 
                id="roleDescription" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe this role's purpose and responsibilities"
                defaultValue={selectedRole === 1 ? "Full system access with no restrictions. Can manage users, configure the system, and access all data across all branches and regions." : ""}
              ></textarea>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label>Permission Categories</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-4">
                {permissionCategories.map(category => (
                  <Collapsible key={category.id} className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 hover:bg-gray-100">
                      <div className="flex items-center">
                        {category.icon}
                        <span className="ml-2 font-medium">{category.name}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 space-y-2">
                      {permissionsList
                        .filter(p => p.category === category.id)
                        .map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`perm-${permission.id}`} 
                              defaultChecked={doesRoleHavePermission(
                                rolesHierarchy.find(r => r.id === selectedRole)?.level || 99,
                                permission.minRoleLevel
                              )}
                              disabled={selectedRole === 1} // System Admin always has all permissions
                            />
                            <label 
                              htmlFor={`perm-${permission.id}`} 
                              className="text-sm"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))
                      }
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label>Geographic Access</Label>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="access-all-regions" 
                    defaultChecked={selectedRole !== null && selectedRole <= 1}
                    disabled={selectedRole === 1 || selectedRole === null} // System Admin always has access to all
                  />
                  <label htmlFor="access-all-regions" className="text-sm font-medium">
                    Access to all regions
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="access-all-branches" 
                    defaultChecked={selectedRole !== null && selectedRole <= 2}
                    disabled={selectedRole === 1 || selectedRole === null} // System Admin always has access to all
                  />
                  <label htmlFor="access-all-branches" className="text-sm font-medium">
                    Access to all branches within region
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="limit-to-branch" 
                    defaultChecked={selectedRole !== null && selectedRole >= 3 && selectedRole <= 8}
                    disabled={selectedRole === 1 || selectedRole === null} // System Admin always has access to all
                  />
                  <label htmlFor="limit-to-branch" className="text-sm font-medium">
                    Limit to assigned branch only
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                alert('In a real application, this would save role changes');
                setShowEditRoleDialog(false);
              }}
              disabled={selectedRole === 1 || selectedRole === null} // Can't modify System Admin role or if no role selected
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}