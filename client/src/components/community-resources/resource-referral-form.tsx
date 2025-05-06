import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CommunityResource, ServiceUser, User } from '@shared/schema';

export interface ResourceReferralFormProps {
  resource: CommunityResource;
  onSuccess?: () => void;
}

// Create a schema for form validation
const formSchema = z.object({
  serviceUserId: z.string({
    required_error: "Please select a service user",
  }),
  notes: z.string().optional(),
  followUpDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ResourceReferralForm({ resource, onSuccess }: ResourceReferralFormProps) {
  const { toast } = useToast();
  
  // Fetch service users for the dropdown
  const { data: serviceUsers, isLoading: isLoadingServiceUsers } = useQuery({
    queryKey: ['/api/service-users'],
    queryFn: async () => {
      // In a real application, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample data - in a real app, this would come from the API
      return [
        { id: 1, fullName: 'Elizabeth Johnson', uniqueId: 'SU001' },
        { id: 2, fullName: 'Robert Wilson', uniqueId: 'SU002' },
        { id: 3, fullName: 'Mary Thompson', uniqueId: 'SU003' },
        { id: 4, fullName: 'James Lewis', uniqueId: 'SU004' },
        { id: 5, fullName: 'Sarah Adams', uniqueId: 'SU005' },
      ] as ServiceUser[];
    }
  });
  
  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });
  
  // Create mutation for submitting referrals
  const referralMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Format data for the API
      const referralData = {
        resourceId: resource.id,
        serviceUserId: parseInt(values.serviceUserId),
        referrerId: 1, // In a real app, this would be the current user's ID
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: values.notes || null,
        followUpDate: values.followUpDate ? format(values.followUpDate, 'yyyy-MM-dd') : null,
        status: 'pending',
      };
      
      // In a real application, this would be sent to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return referralData;
    },
    onSuccess: () => {
      toast({
        title: "Referral submitted",
        description: `Referral to ${resource.name} has been successfully submitted.`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error submitting referral",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(values: FormValues) {
    referralMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-1">Resource Information</h3>
          <p className="text-gray-500 text-sm mb-4">
            You are making a referral to: <strong>{resource.name}</strong>
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="serviceUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service User</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingServiceUsers ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
                      <span>Loading service users...</span>
                    </div>
                  ) : serviceUsers && serviceUsers.length > 0 ? (
                    serviceUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName} ({user.uniqueId})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No service users available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the service user you are referring to this resource.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any relevant information for this referral..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include any additional information that might be helpful for the resource provider.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="followUpDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Follow-up Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>No follow-up scheduled</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a date to follow up on this referral (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-3 border-t flex justify-end">
          <Button 
            type="submit" 
            disabled={referralMutation.isPending}
            className="w-full md:w-auto"
          >
            {referralMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Referral
          </Button>
        </div>
      </form>
    </Form>
  );
}