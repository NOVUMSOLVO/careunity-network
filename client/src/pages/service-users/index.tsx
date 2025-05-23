/**
 * Service Users page
 */

import React, { useState } from 'react';
import { useNavigate } from '@/components/router/router-provider';
import { ServiceUserList } from '@/components/service-users/service-user-list';
import { ServiceUser } from '@shared/types/service-user';
import { useDeleteServiceUser } from '@/hooks/use-service-users';
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

export default function ServiceUsersPage() {
  const navigate = useNavigate();
  const [serviceUserToDelete, setServiceUserToDelete] = useState<ServiceUser | null>(null);
  const deleteServiceUser = useDeleteServiceUser();

  // Handle edit service user
  const handleEdit = (serviceUser: ServiceUser) => {
    navigate(`/service-users/${serviceUser.id}/edit`);
  };

  // Handle view service user
  const handleView = (serviceUser: ServiceUser) => {
    navigate(`/service-users/${serviceUser.id}`);
  };

  // Handle delete service user
  const handleDelete = (serviceUser: ServiceUser) => {
    setServiceUserToDelete(serviceUser);
  };

  // Confirm delete service user
  const confirmDelete = () => {
    if (serviceUserToDelete) {
      deleteServiceUser.mutate(serviceUserToDelete.id);
      setServiceUserToDelete(null);
    }
  };

  // Cancel delete service user
  const cancelDelete = () => {
    setServiceUserToDelete(null);
  };

  return (
    <div className="container mx-auto py-6">
      <ServiceUserList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!serviceUserToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service user{' '}
              <strong>{serviceUserToDelete?.fullName}</strong> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteServiceUser.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
