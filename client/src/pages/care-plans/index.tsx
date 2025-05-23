/**
 * Care Plans page
 */

import React, { useState } from 'react';
import { useNavigate } from '@/components/router/router-provider';
import { CarePlanList } from '@/components/care-plans/care-plan-list';
import { CarePlan } from '@shared/types/care-plan';
import { useDeleteCarePlan } from '@/hooks/use-care-plans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CarePlansPage() {
  const navigate = useNavigate();
  const [carePlanToDelete, setCarePlanToDelete] = useState<CarePlan | null>(null);
  const deleteCarePlan = useDeleteCarePlan();

  // Handle edit care plan
  const handleEdit = (carePlan: CarePlan) => {
    navigate(`/care-plans/${carePlan.id}/edit`);
  };

  // Handle view care plan
  const handleView = (carePlan: CarePlan) => {
    navigate(`/care-plans/${carePlan.id}`);
  };

  // Handle delete care plan
  const handleDelete = (carePlan: CarePlan) => {
    setCarePlanToDelete(carePlan);
  };

  // Confirm delete care plan
  const confirmDelete = () => {
    if (carePlanToDelete) {
      deleteCarePlan.mutate(carePlanToDelete.id);
      setCarePlanToDelete(null);
    }
  };

  // Cancel delete care plan
  const cancelDelete = () => {
    setCarePlanToDelete(null);
  };

  return (
    <div className="container mx-auto py-6">
      <CarePlanList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!carePlanToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the care plan{' '}
              <strong>{carePlanToDelete?.title}</strong> and all associated goals and tasks.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCarePlan.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
