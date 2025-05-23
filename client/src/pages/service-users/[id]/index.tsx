/**
 * Service User Detail page
 */

import React, { useState } from 'react';
import { useNavigate, useParams, RouterLink } from '@/components/router/router-provider';
import { useServiceUserWithCarePlans, useDeleteServiceUser } from '@/hooks/use-service-users';
import { CarePlanList } from '@/components/care-plans/care-plan-list';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Phone, 
  Mail, 
  Home, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';
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

export default function ServiceUserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const serviceUserId = parseInt(id);
  
  const { 
    data: serviceUser, 
    isLoading, 
    error 
  } = useServiceUserWithCarePlans(serviceUserId);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteServiceUser = useDeleteServiceUser();

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Handle delete service user
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete service user
  const confirmDelete = async () => {
    try {
      await deleteServiceUser.mutateAsync(serviceUserId);
      setIsDeleteDialogOpen(false);
      navigate('/service-users');
    } catch (error) {
      console.error('Failed to delete service user:', error);
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
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/service-users')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service Users
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/service-users/${serviceUserId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Service User Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{serviceUser.fullName}</CardTitle>
                <CardDescription>ID: {serviceUser.uniqueId}</CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(serviceUser.status) as any}>
                {serviceUser.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span>Born: {serviceUser.dateOfBirth}</span>
            </div>
            
            {serviceUser.phoneNumber && (
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <span>{serviceUser.phoneNumber}</span>
              </div>
            )}
            
            {serviceUser.email && (
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <span>{serviceUser.email}</span>
              </div>
            )}
            
            <div className="flex items-start">
              <Home className="mr-2 h-4 w-4 text-gray-500 mt-1" />
              <span>{serviceUser.address}</span>
            </div>
            
            {serviceUser.emergencyContact && (
              <div className="flex items-start">
                <AlertTriangle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                <div>
                  <div className="font-medium">Emergency Contact:</div>
                  <div>{serviceUser.emergencyContact}</div>
                  {serviceUser.emergencyPhone && (
                    <div>{serviceUser.emergencyPhone}</div>
                  )}
                </div>
              </div>
            )}
            
            {serviceUser.notes && (
              <div className="mt-4 pt-4 border-t">
                <div className="font-medium mb-2">Notes:</div>
                <p className="text-sm text-gray-600">{serviceUser.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Care Plans and other info */}
        <div className="md:col-span-2">
          <Tabs defaultValue="care-plans">
            <TabsList className="mb-4">
              <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="care-plans">
              <CarePlanList serviceUserId={serviceUserId} />
            </TabsContent>
            
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Appointments</CardTitle>
                      <CardDescription>
                        Scheduled appointments for this service user
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <RouterLink to={`/service-users/${serviceUserId}/appointments/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Appointment
                      </RouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Appointments feature coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Notes</CardTitle>
                      <CardDescription>
                        Notes and observations for this service user
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <RouterLink to={`/service-users/${serviceUserId}/notes/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Note
                      </RouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Notes feature coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service user{' '}
              <strong>{serviceUser.fullName}</strong> and all associated data.
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
