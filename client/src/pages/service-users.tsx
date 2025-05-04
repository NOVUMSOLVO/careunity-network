import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { ServiceUserCard } from '@/components/ui/service-user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { calculateAge } from '@/lib/utils';

export default function ServiceUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch service users
  const { data: serviceUsers, isLoading } = useQuery({
    queryKey: ['/api/service-users']
  });

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return `${age} years`;
  };

  // Map categories for display
  const getCategoryBadges = (serviceUser: any) => {
    const categories = [];
    
    // Convert needs JSON string to object if needed
    const needs = typeof serviceUser.needs === 'string' 
      ? JSON.parse(serviceUser.needs) 
      : serviceUser.needs;
    
    if (needs) {
      if (needs.personalCare) {
        categories.push({ label: 'Personal Care', color: 'green' });
      }
      if (needs.medication) {
        categories.push({ label: 'Medication', color: 'blue' });
      }
      if (needs.nutrition) {
        categories.push({ label: 'Nutrition', color: 'yellow' });
      }
      if (needs.mobility) {
        categories.push({ label: 'Mobility', color: 'purple' });
      }
    }
    
    // If no categories found, add a default one
    if (categories.length === 0) {
      categories.push({ label: 'General Support', color: 'gray' });
    }
    
    return categories;
  };

  // Filter service users based on search query
  const filteredServiceUsers = searchQuery && serviceUsers
    ? serviceUsers.filter((user: any) => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : serviceUsers;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Service Users"
          actions={
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Service User
            </Button>
          }
        />

        <div className="py-4">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  name="search"
                  id="service-user-search"
                  className="pl-10 block w-full rounded-none rounded-l-md"
                  placeholder="Search service users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border rounded-r-md"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Service User Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 animate-pulse">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="ml-4">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="mt-1 flex space-x-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServiceUsers?.map((serviceUser: any) => (
                <ServiceUserCard
                  key={serviceUser.id}
                  id={serviceUser.id}
                  name={serviceUser.fullName}
                  uniqueId={serviceUser.uniqueId}
                  age={calculateAge(serviceUser.dateOfBirth)}
                  address={serviceUser.address}
                  phoneNumber={serviceUser.phoneNumber}
                  profileImage={serviceUser.profileImage}
                  categories={getCategoryBadges(serviceUser)}
                />
              ))}
              
              {/* Add New Service User Card */}
              <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                <Button className="inline-flex items-center">
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add New Service User
                </Button>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Create a new service user profile
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
