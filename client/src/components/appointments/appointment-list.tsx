import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Edit, 
  Trash2, 
  MoreVertical, 
  AlertTriangle,
  Loader2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAppointments, useCreateAppointment, useDeleteAppointment } from '@/hooks/use-appointments';
import { AppointmentForm } from './appointment-form';
import { RouterLink } from '@/components/router/router-provider';

// Define appointment type
interface Appointment {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceUserId: number;
  caregiverId?: number;
  location?: string;
}

interface AppointmentListProps {
  serviceUserId?: number;
}

export function AppointmentList({ serviceUserId }: AppointmentListProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch appointments
  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useAppointments(serviceUserId);
  
  // Create appointment mutation
  const createMutation = useCreateAppointment();
  
  // Delete appointment mutation
  const deleteMutation = useDeleteAppointment();
  
  // Handle create
  const handleCreate = (data: any) => {
    // Add service user ID if provided
    const appointmentData = serviceUserId 
      ? { ...data, serviceUserId } 
      : data;
      
    createMutation.mutate(appointmentData, {
      onSuccess: () => {
        setShowCreateDialog(false);
        toast({
          title: 'Appointment created',
          description: 'The appointment has been created successfully.',
        });
      }
    });
  };
  
  // Handle delete
  const handleDelete = () => {
    if (appointmentToDelete) {
      deleteMutation.mutate(appointmentToDelete.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setAppointmentToDelete(null);
          toast({
            title: 'Appointment deleted',
            description: 'The appointment has been deleted successfully.',
          });
        }
      });
    }
  };
  
  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    return `${date} at ${time}`;
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'in-progress':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading appointments...</span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
        <div>
          <h3 className="font-medium text-red-800">Error loading appointments</h3>
          <p className="text-red-700 text-sm mt-1">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              {serviceUserId 
                ? 'Manage appointments for this service user' 
                : 'Manage all appointments'}
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointments?.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {serviceUserId 
                ? 'This service user doesn\'t have any appointments yet.' 
                : 'No appointments have been scheduled yet.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments?.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <RouterLink 
                        to={`/appointments/${appointment.id}`}
                        className="hover:underline"
                      >
                        {appointment.title}
                      </RouterLink>
                    </TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status) as any}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/appointments/${appointment.id}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Details
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/appointments/${appointment.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <>
                              <DropdownMenuItem asChild>
                                <RouterLink to={`/appointments/${appointment.id}/complete`}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Mark as Completed
                                </RouterLink>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <RouterLink to={`/appointments/${appointment.id}/cancel`}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Cancel Appointment
                                </RouterLink>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setAppointmentToDelete(appointment);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm 
            serviceUserId={serviceUserId} 
            onSubmit={handleCreate} 
            isLoading={createMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the appointment "{appointmentToDelete?.title}". This action cannot be undone.
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
    </Card>
  );
}
