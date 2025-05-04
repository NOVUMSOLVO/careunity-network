import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ServiceUserDetail } from '@/components/service-user/service-user-detail';
import { GoalList } from '@/components/care-plan/goal-list';
import { TaskItem } from '@/components/ui/task-item';
import { CheckCircle2 } from 'lucide-react';

export default function CarePlans() {
  const [selectedServiceUserId, setSelectedServiceUserId] = useState<string>("");

  // Fetch service users
  const { data: serviceUsers, isLoading: isLoadingServiceUsers } = useQuery({
    queryKey: ['/api/service-users']
  });

  // Fetch care plan if a service user is selected
  const { data: carePlanData, isLoading: isLoadingCarePlan } = useQuery({
    queryKey: ['/api/care-plans', selectedServiceUserId],
    enabled: !!selectedServiceUserId
  });

  // Fetch service user details if one is selected
  const { data: serviceUserDetail, isLoading: isLoadingServiceUserDetail } = useQuery({
    queryKey: ['/api/service-users', selectedServiceUserId],
    enabled: !!selectedServiceUserId
  });

  // Handle task completion
  const handleTaskCompletion = (taskId: number, completed: boolean) => {
    // In a real app, this would make an API call to update the task status
    console.log(`Task ${taskId} completion status: ${completed}`);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Care Plans"
          description="View and manage person-centered care plans"
        />

        <div className="py-4">
          {/* Service User Selector */}
          <div className="mb-6">
            <Label htmlFor="service-user-selector">Select Service User</Label>
            <div className="flex space-x-4 mt-1">
              <Select 
                onValueChange={(value) => setSelectedServiceUserId(value)}
                value={selectedServiceUserId || undefined}
              >
                <SelectTrigger id="service-user-selector" className="w-full max-w-md">
                  <SelectValue placeholder="Select a service user" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingServiceUsers ? (
                    <SelectItem value="loading" disabled>Loading service users...</SelectItem>
                  ) : (
                    serviceUsers?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                Create New Care Plan
              </Button>
            </div>
          </div>

          {selectedServiceUserId ? (
            <>
              {/* Service User Profile */}
              <div className="mb-6">
                {isLoadingServiceUserDetail ? (
                  <ServiceUserDetail
                    id={0}
                    fullName=""
                    uniqueId=""
                    dateOfBirth=""
                    address=""
                    isLoading={true}
                  />
                ) : serviceUserDetail && (
                  <ServiceUserDetail
                    id={serviceUserDetail.id}
                    fullName={serviceUserDetail.fullName}
                    uniqueId={serviceUserDetail.uniqueId}
                    dateOfBirth={serviceUserDetail.dateOfBirth}
                    address={serviceUserDetail.address}
                    phoneNumber={serviceUserDetail.phoneNumber}
                    emergencyContact={serviceUserDetail.emergencyContact}
                    profileImage={serviceUserDetail.profileImage}
                    preferences={
                      typeof serviceUserDetail.preferences === 'string'
                        ? JSON.parse(serviceUserDetail.preferences)
                        : serviceUserDetail.preferences
                    }
                    lifeStory={serviceUserDetail.lifeStory}
                  />
                )}
              </div>

              {/* Goals and Tasks */}
              {isLoadingCarePlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GoalList goals={[]} isLoading={true} />
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                          <div className="space-y-3">
                            {[1, 2].map((j) => (
                              <div key={j} className="flex items-start">
                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
                                <div className="ml-3 w-full">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                carePlanData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GoalList goals={carePlanData.goals || []} />
                    
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                        Care & Support Plan
                      </h3>
                      <div className="space-y-6">
                        {/* Morning Visit */}
                        <Card className="bg-gray-50 dark:bg-gray-700">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">Morning Visit (9:00 AM - 10:30 AM)</h4>
                            <div className="mt-3 space-y-3">
                              {carePlanData.tasks?.filter((task: any) => task.timeOfDay === 'morning').map((task: any) => (
                                <div key={task.id} className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input 
                                      id={`task-${task.id}`} 
                                      name={`task-${task.id}`} 
                                      type="checkbox" 
                                      checked={task.completed}
                                      onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor={`task-${task.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                                      {task.title}
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">{task.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Evening Visit */}
                        <Card className="bg-gray-50 dark:bg-gray-700">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">Evening Visit (8:00 PM - 9:00 PM)</h4>
                            <div className="mt-3 space-y-3">
                              {carePlanData.tasks?.filter((task: any) => task.timeOfDay === 'evening').map((task: any) => (
                                <div key={task.id} className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input 
                                      id={`task-${task.id}`} 
                                      name={`task-${task.id}`} 
                                      type="checkbox" 
                                      checked={task.completed}
                                      onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor={`task-${task.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                                      {task.title}
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">{task.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Select a Service User</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please select a service user from the dropdown above to view their care plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
