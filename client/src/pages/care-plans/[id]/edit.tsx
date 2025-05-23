/**
 * Edit Care Plan page
 */

import React from 'react';
import { useNavigate, useParams } from '@/components/router/router-provider';
import { CarePlanForm } from '@/components/care-plans/care-plan-form';
import { useCarePlan, useUpdateCarePlan } from '@/hooks/use-care-plans';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditCarePlanPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const carePlanId = parseInt(id);
  
  const { data: carePlan, isLoading, error } = useCarePlan(carePlanId);
  const updateCarePlan = useUpdateCarePlan(carePlanId);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      await updateCarePlan.mutateAsync(data);
      navigate(`/care-plans/${carePlanId}`);
    } catch (error) {
      console.error('Failed to update care plan:', error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading care plan...</div>;
  }

  if (error || !carePlan) {
    return (
      <div className="container mx-auto py-6 text-red-500">
        Error loading care plan: {error?.message || 'Care plan not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/care-plans/${carePlanId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Plan
        </Button>
      </div>

      <CarePlanForm 
        carePlan={carePlan} 
        onSubmit={handleSubmit} 
        isSubmitting={updateCarePlan.isPending} 
      />
    </div>
  );
}
