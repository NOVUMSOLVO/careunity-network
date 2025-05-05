import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Lock,
  Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define hierarchical roles with their levels
const rolesHierarchy = [
  { id: 1, name: 'System Administrator', level: 1 },
  { id: 2, name: 'Regional/Area Manager', level: 2 },
  { id: 3, name: 'Service/Branch Manager', level: 3 },
  { id: 4, name: 'Care Coordinator/Supervisor', level: 4 },
  { id: 5, name: 'Senior Care Worker', level: 5 },
  { id: 6, name: 'Care Worker', level: 6 },
  { id: 7, name: 'Office Administrator', level: 7 },
  { id: 8, name: 'Finance/Payroll Staff', level: 8 },
  { id: 9, name: 'Service User/Family Portal', level: 9 },
];

export default function RbacManagementSimple() {
  const [activeTab, setActiveTab] = useState('users');

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
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
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
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600 mb-4">This section allows you to manage user accounts, assign roles, and control access permissions.</p>
                <p className="text-sm text-gray-500">The full functionality is being implemented.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Manage role definitions and hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Role Hierarchy</h3>
                <div className="space-y-2">
                  {rolesHierarchy.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                          {role.level}
                        </div>
                        <span className="ml-3 font-medium">{role.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Configure permissions for each role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Permission Matrix</h3>
                <p className="text-gray-600 mb-4">This section allows you to configure detailed permissions for each role in the system.</p>
                <p className="text-sm text-gray-500">The full functionality is being implemented.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure access control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Control Settings</h3>
                <p className="text-gray-600 mb-4">Configure global settings for the access control system.</p>
                <p className="text-sm text-gray-500">The full functionality is being implemented.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}