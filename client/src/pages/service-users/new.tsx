/**
 * Create Service User page
 */

import React from 'react';
import { useNavigate } from '@/components/router/router-provider';
import { ServiceUserForm } from '@/components/service-users/service-user-form';
import { useCreateServiceUser } from '@/hooks/use-service-users';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateServiceUserPage() {
  const navigate = useNavigate();
  const createServiceUser = useCreateServiceUser();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    // Convert Date object to string in YYYY-MM-DD format
    const formattedData = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    };

    try {
      await createServiceUser.mutateAsync(formattedData);
      navigate('/service-users');
    } catch (error) {
      console.error('Failed to create service user:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/service-users')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service Users
        </Button>
      </div>

      <ServiceUserForm 
        onSubmit={handleSubmit} 
        isSubmitting={createServiceUser.isPending} 
      />
    </div>
  );
}
