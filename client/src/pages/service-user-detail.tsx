import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useServiceUser, 
  useServiceUserWithCarePlans, 
  useUpdateServiceUser, 
  useDeleteServiceUser 
} from '@/hooks/use-service-users';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { ServiceUserForm } from '@/components/service-users/service-user-form';
import { CarePlanList } from '@/components/care-plans/care-plan-list';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { useToast } from '@/hooks/use-toast';

export default function ServiceUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Convert id to number
  const userId = id ? parseInt(id, 10) : 0;
  
  // Fetch service user data
  const { 
    data: serviceUser, 
    isLoading, 
    error 
  } = useServiceUser(userId);
  
  // Fetch service user with care plans for the care plans tab
  const { 
    data: serviceUserWithCarePlans,
    isLoading: isLoadingWithCarePlans
  } = useServiceUserWithCarePlans(userId);
  
  // Update mutation
  const updateMutation = useUpdateServiceUser(userId);
  
  // Delete mutation
  const deleteMutation = useDeleteServiceUser();
  
  // Handle update
  const handleUpdate = (data: any) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setShowEditDialog(false);
        toast({
          title: 'Service user updated',
          description: 'The service user has been updated successfully.',
        });
      }
    });
  };
  
  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate(userId, {
      onSuccess: () => {
        navigate('/service-users');
        toast({
          title: 'Service user deleted',
          description: 'The service user has been deleted successfully.',
        });
      }
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-600">Loading service user...</span>
      </div>
    );
  }
  
  // Error state
  if (error || !serviceUser) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
        <div>
          <h3 className="font-medium text-red-800">Error loading service user</h3>
          <p className="text-red-700 text-sm mt-1">
            {error instanceof Error ? error.message : 'Service user not found'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => navigate('/service-users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Users
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4" 
            onClick={() => navigate('/service-users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{serviceUser.fullName}</h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-600 mr-2">ID: {serviceUser.uniqueId}</p>
              <Badge 
                variant={
                  serviceUser.status === 'active' ? 'success' : 
                  serviceUser.status === 'inactive' ? 'secondary' : 
                  'warning'
                }
              >
                {serviceUser.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.fullName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.dateOfBirth}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                    {serviceUser.address}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.emergencyContact}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Emergency Phone</p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {serviceUser.emergencyPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Care Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Care Needs</CardTitle>
                <CardDescription>Required care and support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Care Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceUser.careNeeds && serviceUser.careNeeds.length > 0 ? (
                      serviceUser.careNeeds.map((need, index) => (
                        <Badge key={index} variant="outline" className="bg-indigo-50">
                          {need}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No care needs specified</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Preferred Times</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceUser.preferredTimes && serviceUser.preferredTimes.length > 0 ? (
                      serviceUser.preferredTimes.map((time, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {time}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No preferred times specified</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm">
                    {serviceUser.notes || 'No additional notes'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Care Plans Tab */}
        <TabsContent value="care-plans" className="space-y-4 pt-4">
          {isLoadingWithCarePlans ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading care plans...</span>
            </div>
          ) : (
            <CarePlanList 
              serviceUserId={userId} 
              carePlans={serviceUserWithCarePlans?.carePlans || []} 
            />
          )}
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4 pt-4">
          <AppointmentList serviceUserId={userId} />
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service User</DialogTitle>
            <DialogDescription>
              Update service user information. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <ServiceUserForm 
            user={serviceUser} 
            onSubmit={handleUpdate} 
            isLoading={updateMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {serviceUser.fullName}'s profile and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
