/**
 * Create Care Plan page
 */

import React from 'react';
import { useNavigate, useSearchParams } from '@/components/router/router-provider';
import { CarePlanForm } from '@/components/care-plans/care-plan-form';
import { useCreateCarePlan } from '@/hooks/use-care-plans';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateCarePlanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceUserId = searchParams.get('serviceUserId') 
    ? parseInt(searchParams.get('serviceUserId') as string) 
    : undefined;
  
  const createCarePlan = useCreateCarePlan();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      const result = await createCarePlan.mutateAsync(data);
      
      // Navigate to the care plan detail page
      navigate(`/care-plans/${result?.id}`);
    } catch (error) {
      console.error('Failed to create care plan:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(serviceUserId 
            ? `/service-users/${serviceUserId}` 
            : '/care-plans'
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {serviceUserId ? 'Back to Service User' : 'Back to Care Plans'}
        </Button>
      </div>

      <CarePlanForm 
        serviceUserId={serviceUserId}
        onSubmit={handleSubmit} 
        isSubmitting={createCarePlan.isPending} 
      />
    </div>
  );
}
