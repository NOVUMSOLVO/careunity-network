import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertCircle,
  Star,
  ThumbsUp,
  Flag,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReviewListProps {
  resourceId: number;
}

// Star rating display component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

// Star rating input component
function StarRatingInput({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

// Create a schema for review form validation
const reviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(5, "Please provide a comment").max(500, "Comment is too long"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ResourceReviewList({ resourceId }: ReviewListProps) {
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Fetch reviews for the resource
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['/api/resource-reviews', resourceId],
    queryFn: async () => {
      // In a real application, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - in a real app, this would come from the API
      return [
        {
          id: 1,
          resourceId: resourceId,
          userId: 1,
          userName: 'John Smith',
          userRole: 'Care Manager',
          rating: 5,
          comment: 'Excellent resource for our service users. Very responsive and professional staff who go the extra mile to accommodate special needs. Highly recommended for anyone looking for quality care services.',
          date: '2024-03-15',
          helpfulCount: 4,
        },
        {
          id: 2,
          resourceId: resourceId,
          userId: 2,
          userName: 'Sarah Jones',
          userRole: 'Care Coordinator',
          rating: 4,
          comment: 'Good service overall. They were very helpful with assisting one of our complex care service users. Communication could be improved slightly but the actual service delivery was excellent.',
          date: '2024-02-28',
          helpfulCount: 2,
        },
        {
          id: 3,
          resourceId: resourceId,
          userId: 3,
          userName: 'Emma Wilson',
          userRole: 'Caregiver',
          rating: 5,
          comment: 'The staff here are amazing! One of our service users with severe anxiety was made to feel very comfortable. Will definitely refer more people here.',
          date: '2024-01-20',
          helpfulCount: 3,
        },
      ];
    }
  });
  
  // Form for adding a new review
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });
  
  // Create mutation for submitting reviews
  const reviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      // Format data for the API
      const reviewData = {
        resourceId: resourceId,
        userId: 1, // In a real app, this would be the current user's ID
        rating: values.rating,
        comment: values.comment,
        date: format(new Date(), 'yyyy-MM-dd'),
      };
      
      // In a real application, this would be sent to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return reviewData;
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been successfully submitted.",
      });
      
      // Reset form and hide it
      form.reset();
      setShowReviewForm(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/resource-reviews', resourceId] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting review",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(values: ReviewFormValues) {
    reviewMutation.mutate(values);
  }
  
  // Increment helpful count
  const markAsHelpful = (reviewId: number) => {
    // In a real app, this would be an API call
    toast({
      title: "Marked as helpful",
      description: "Thank you for your feedback",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reviews & Feedback</h3>
        <Button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant={showReviewForm ? "outline" : "default"}
        >
          {showReviewForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <StarRatingInput 
                          rating={field.value} 
                          onChange={(rating) => field.onChange(rating)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your experience with this resource..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your review will help other care professionals make informed decisions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Review
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error loading reviews. Please try again later.
            </AlertDescription>
          </Alert>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-sm text-gray-500">{review.userRole}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {review.date}
                </div>
              </div>
              
              <div className="space-y-2">
                <StarRating rating={review.rating} />
                <p className="text-gray-600">{review.comment}</p>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1.5 text-gray-500 hover:text-gray-900"
                  onClick={() => markAsHelpful(review.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-900">
                  <Flag className="h-4 w-4" />
                  <span>Report</span>
                </Button>
              </div>
              
              <Separator className="mt-4" />
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-gray-500 mt-1 mb-4 max-w-md mx-auto">
              Be the first to review this resource and help other care professionals make informed decisions.
            </p>
            <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
          </div>
        )}
      </div>
    </div>
  );
}