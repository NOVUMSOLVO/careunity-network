import React from 'react';
import { CarePlanProgress } from '@/components/ui/care-plan-progress';
import { Badge } from '@/components/ui/badge';

interface Goal {
  id: number;
  title: string;
  description: string;
  startDate: string;
  targetDate?: string;
  status: 'on track' | 'in progress' | 'completed' | 'at risk';
  progressPercentage: number;
}

interface GoalListProps {
  goals: Goal[];
  isLoading?: boolean;
  className?: string;
}

export function GoalList({
  goals,
  isLoading = false,
  className
}: GoalListProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-between items-center mb-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
              <div className="mt-2 flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Goals & Outcomes
        </h3>
        <Badge className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Updated 3 days ago
        </Badge>
      </div>
      <div className="space-y-4">
        {goals.map((goal) => (
          <CarePlanProgress
            key={goal.id}
            title={goal.title}
            description={goal.description}
            startDate={goal.startDate}
            progress={goal.progressPercentage}
            status={goal.status}
          />
        ))}
      </div>
    </div>
  );
}
