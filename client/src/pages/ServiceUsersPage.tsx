import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { MobileServiceUserList } from '../components/service-users/MobileServiceUserList';
import { ServiceUserList } from '../components/service-users/ServiceUserList';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader } from '../components/ui/loader';
import { useDevice } from '../hooks/use-mobile';
import { useNavigate } from 'wouter';
import { Search, Filter, Plus } from 'lucide-react';

/**
 * Service Users Page
 * 
 * This page displays a list of service users with different views:
 * - List view (default)
 * - Card view (better for mobile)
 * - Map view (shows service users on a map)
 * 
 * It includes search and filtering capabilities and is optimized for both
 * desktop and mobile devices.
 */
export function ServiceUsersPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('list');
  
  // Hooks
  const { isMobile, deviceType } = useDevice();
  const navigate = useNavigate();
  
  // Fetch initial service users
  const { data: serviceUsers, isLoading, error } = useQuery({
    queryKey: ['serviceUsers', { limit: 20, page: 1, search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await apiClient.get(`/api/v2/service-users?${params.toString()}`);
      return response.data.data;
    },
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger refetch with new search query
  };
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    // Trigger refetch with new filter
  };
  
  // Handle add new service user
  const handleAddNew = () => {
    navigate('/service-users/new');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load service users</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the problem persists.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Users</h1>
          <p className="text-muted-foreground">
            Manage service users and their care plans
          </p>
        </div>
        
        <Button onClick={handleAddNew} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search service users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Button type="submit" variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </form>
      </div>
      
      {/* View tabs */}
      <Tabs defaultValue={isMobile ? 'card' : 'list'} className="mb-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="card">Card View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <ServiceUserList
            serviceUsers={serviceUsers || []}
            onUserSelect={(user) => navigate(`/service-users/${user.id}`)}
          />
        </TabsContent>
        
        <TabsContent value="card" className="mt-4">
          {/* Use our mobile-optimized component */}
          <MobileServiceUserList
            initialUsers={serviceUsers || []}
            showSearch={false}
            showFilters={false}
          />
        </TabsContent>
        
        <TabsContent value="map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>
                View service users on a map based on their location
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Map view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
