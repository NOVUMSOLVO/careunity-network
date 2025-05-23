/**
 * Care Plan Detail page
 */

import React, { useState } from 'react';
import { useNavigate, useParams, RouterLink } from '@/components/router/router-provider';
import { useCarePlanWithGoalsAndTasks, useDeleteCarePlan } from '@/hooks/use-care-plans';
import { useServiceUser } from '@/hooks/use-service-users';
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
  Calendar, 
  User, 
  CheckCircle2, 
  Target,
  ClipboardList
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function CarePlanDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const carePlanId = parseInt(id);
  
  const { 
    data: carePlan, 
    isLoading: isLoadingCarePlan, 
    error: carePlanError 
  } = useCarePlanWithGoalsAndTasks(carePlanId);
  
  const { 
    data: serviceUser, 
    isLoading: isLoadingServiceUser, 
    error: serviceUserError 
  } = useServiceUser(carePlan?.serviceUserId || 0);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteCarePlan = useDeleteCarePlan();

  const navigate = useNavigate();

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Handle delete care plan
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete care plan
  const confirmDelete = async () => {
    try {
      await deleteCarePlan.mutateAsync(carePlanId);
      setIsDeleteDialogOpen(false);
      navigate('/care-plans');
    } catch (error) {
      console.error('Failed to delete care plan:', error);
    }
  };

  const isLoading = isLoadingCarePlan || (carePlan && isLoadingServiceUser);

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading care plan...</div>;
  }

  if (carePlanError || !carePlan) {
    return (
      <div className="container mx-auto py-6 text-red-500">
        Error loading care plan: {carePlanError?.message || 'Care plan not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/care-plans')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Plans
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/care-plans/${carePlanId}/edit`)}
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
        {/* Care Plan Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{carePlan.title}</CardTitle>
                <CardDescription>Care Plan</CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(carePlan.status) as any}>
                {carePlan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span>Start Date: {carePlan.startDate}</span>
            </div>
            
            {carePlan.reviewDate && (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>Review Date: {carePlan.reviewDate}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              <span>
                Service User:{' '}
                {serviceUser ? (
                  <RouterLink 
                    to={`/service-users/${serviceUser.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {serviceUser.fullName}
                  </RouterLink>
                ) : (
                  'Loading...'
                )}
              </span>
            </div>
            
            {carePlan.summary && (
              <div className="mt-4 pt-4 border-t">
                <div className="font-medium mb-2">Summary:</div>
                <p className="text-sm text-gray-600">{carePlan.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Goals and Tasks */}
        <div className="md:col-span-2">
          <Tabs defaultValue="goals">
            <TabsList className="mb-4">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Goals</CardTitle>
                      <CardDescription>
                        Goals for this care plan
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <RouterLink to={`/care-plans/${carePlanId}/goals/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                      </RouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {carePlan.goals && carePlan.goals.length > 0 ? (
                    <div className="space-y-4">
                      {carePlan.goals.map((goal) => (
                        <Card key={goal.id}>
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">{goal.title}</CardTitle>
                                <CardDescription>
                                  {goal.startDate} - {goal.targetDate || 'No target date'}
                                </CardDescription>
                              </div>
                              <Badge variant={getStatusBadgeVariant(goal.status) as any}>
                                {goal.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            {goal.description && (
                              <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                            )}
                            <div className="flex items-center">
                              <span className="text-sm mr-2">Progress:</span>
                              <Progress value={goal.progressPercentage} className="flex-1" />
                              <span className="text-sm ml-2">{goal.progressPercentage}%</span>
                            </div>
                          </CardContent>
                          <CardFooter className="py-2 flex justify-between">
                            <div className="text-sm text-gray-500">
                              {goal.tasks?.length || 0} tasks
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <RouterLink to={`/goals/${goal.id}/tasks`}>
                                  <ClipboardList className="mr-1 h-3 w-3" />
                                  Tasks
                                </RouterLink>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <RouterLink to={`/goals/${goal.id}/edit`}>
                                  <Edit className="mr-1 h-3 w-3" />
                                  Edit
                                </RouterLink>
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No goals have been added to this care plan yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tasks</CardTitle>
                      <CardDescription>
                        All tasks across all goals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {carePlan.goals && carePlan.goals.some(goal => goal.tasks && goal.tasks.length > 0) ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Goal</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {carePlan.goals.flatMap(goal => 
                            (goal.tasks || []).map(task => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>{goal.title}</TableCell>
                                <TableCell>{task.dueDate || 'Not set'}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadgeVariant(task.status) as any}>
                                    {task.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <RouterLink to={`/tasks/${task.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                    </RouterLink>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No tasks have been added to any goals yet
                    </div>
                  )}
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
              This will permanently delete the care plan{' '}
              <strong>{carePlan.title}</strong> and all associated goals and tasks.
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
