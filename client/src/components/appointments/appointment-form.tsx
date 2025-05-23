import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useServiceUsers } from '@/hooks/use-service-users';
import { useStaff } from '@/hooks/use-staff';

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

// Define form schema
const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  status: z.string().min(1, 'Status is required'),
  serviceUserId: z.number({
    required_error: 'Service user is required',
    invalid_type_error: 'Service user must be a number',
  }),
  caregiverId: z.number().optional(),
  location: z.string().optional(),
}).refine(data => {
  // Ensure end time is after start time
  if (data.date && data.startTime && data.endTime) {
    const start = new Date(`${data.date}T${data.startTime}`);
    const end = new Date(`${data.date}T${data.endTime}`);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Define form props
interface AppointmentFormProps {
  appointment?: Appointment;
  serviceUserId?: number;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function AppointmentForm({ 
  appointment, 
  serviceUserId, 
  onSubmit, 
  isLoading 
}: AppointmentFormProps) {
  // Fetch service users for dropdown
  const { data: serviceUsers, isLoading: isLoadingServiceUsers } = useServiceUsers();
  
  // Fetch staff for dropdown
  const { data: staff, isLoading: isLoadingStaff } = useStaff();
  
  // Initialize form with default values or existing appointment data
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      title: appointment.title,
      description: appointment.description || '',
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      serviceUserId: appointment.serviceUserId,
      caregiverId: appointment.caregiverId,
      location: appointment.location || '',
    } : {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      startTime: '09:00',
      endTime: '10:00',
      status: 'scheduled',
      serviceUserId: serviceUserId || 0,
      caregiverId: undefined,
      location: '',
    },
  });
  
  // Handle form submission
  const handleSubmit = (data: z.infer<typeof appointmentSchema>) => {
    // If editing, include the ID
    if (appointment) {
      onSubmit({
        id: appointment.id,
        ...data,
      });
    } else {
      onSubmit(data);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Appointment title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Appointment details" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!serviceUserId && (
          <FormField
            control={form.control}
            name="serviceUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service User</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingServiceUsers ? (
                      <SelectItem value="loading" disabled>
                        Loading service users...
                      </SelectItem>
                    ) : serviceUsers?.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No service users available
                      </SelectItem>
                    ) : (
                      serviceUsers?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="caregiverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caregiver</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                defaultValue={field.value ? field.value.toString() : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select caregiver" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None assigned</SelectItem>
                  {isLoadingStaff ? (
                    <SelectItem value="loading" disabled>
                      Loading staff...
                    </SelectItem>
                  ) : staff?.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No staff available
                    </SelectItem>
                  ) : (
                    staff?.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Assign a caregiver to this appointment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Appointment location" {...field} />
              </FormControl>
              <FormDescription>
                Where the appointment will take place
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {appointment ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              appointment ? 'Update Appointment' : 'Create Appointment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
