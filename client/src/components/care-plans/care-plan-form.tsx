/**
 * Care Plan Form component
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  createCarePlanSchema, 
  CarePlan, 
  carePlanStatusEnum 
} from '@shared/types/care-plan';
import { useServiceUsers } from '@/hooks/use-service-users';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Form schema based on the care plan schema
const formSchema = createCarePlanSchema.extend({
  // Convert date strings to Date objects for the date pickers
  startDate: z.date({
    required_error: "Start date is required",
  }),
  reviewDate: z.date().optional(),
});

// Infer the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

interface CarePlanFormProps {
  carePlan?: CarePlan;
  serviceUserId?: number;
  onSubmit: (data: FormValues) => void;
  isSubmitting?: boolean;
}

export function CarePlanForm({ 
  carePlan, 
  serviceUserId,
  onSubmit, 
  isSubmitting = false 
}: CarePlanFormProps) {
  // Fetch service users for the dropdown
  const { data: serviceUsers, isLoading: isLoadingServiceUsers } = useServiceUsers();

  // Initialize the form with default values or existing care plan data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: carePlan
      ? {
          ...carePlan,
          // Convert date strings to Date objects
          startDate: new Date(carePlan.startDate),
          reviewDate: carePlan.reviewDate ? new Date(carePlan.reviewDate) : undefined,
        }
      : {
          serviceUserId: serviceUserId || 0,
          title: '',
          summary: '',
          startDate: new Date(),
          status: 'active' as const,
        },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Convert Date objects back to strings in YYYY-MM-DD format
    const formattedValues = {
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : undefined,
    };
    
    onSubmit(formattedValues as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{carePlan ? 'Edit Care Plan' : 'Create Care Plan'}</CardTitle>
        <CardDescription>
          {carePlan 
            ? 'Update the details for this care plan' 
            : 'Enter the details to create a new care plan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Service User ID */}
              {!serviceUserId && (
                <FormField
                  control={form.control}
                  name="serviceUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service User</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                        disabled={isLoadingServiceUsers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceUsers?.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The service user this care plan is for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className={!serviceUserId ? '' : 'md:col-span-2'}>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter care plan title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review Date */}
              <FormField
                control={form.control}
                name="reviewDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Review Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < (form.getValues().startDate || new Date())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When this care plan should be reviewed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
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
                        {carePlanStatusEnum.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a summary of the care plan" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : carePlan ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
