/**
 * Edit Service User page
 */

import React from 'react';
import { useNavigate, useParams } from '@/components/router/router-provider';
import { ServiceUserForm } from '@/components/service-users/service-user-form';
import { useServiceUser, useUpdateServiceUser } from '@/hooks/use-service-users';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditServiceUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const serviceUserId = parseInt(id);
  
  const { data: serviceUser, isLoading, error } = useServiceUser(serviceUserId);
  const updateServiceUser = useUpdateServiceUser(serviceUserId);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    // Convert Date object to string in YYYY-MM-DD format
    const formattedData = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    };

    try {
      await updateServiceUser.mutateAsync(formattedData);
      navigate(`/service-users/${serviceUserId}`);
    } catch (error) {
      console.error('Failed to update service user:', error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading service user...</div>;
  }

  if (error || !serviceUser) {
    return (
      <div className="container mx-auto py-6 text-red-500">
        Error loading service user: {error?.message || 'Service user not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/service-users/${serviceUserId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service User
        </Button>
      </div>

      <ServiceUserForm 
        serviceUser={serviceUser} 
        onSubmit={handleSubmit} 
        isSubmitting={updateServiceUser.isPending} 
      />
    </div>
  );
}
