import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CarePlanProgressProps {
  title: string;
  description?: string;
  startDate?: string;
  progress: number;
  status: 'on track' | 'in progress' | 'completed' | 'at risk';
  className?: string;
}

export function CarePlanProgress({
  title,
  description,
  startDate,
  progress,
  status,
  className
}: CarePlanProgressProps) {
  const statusClasses = {
    'on track': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'in progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'at risk': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const progressClasses = {
    'on track': 'bg-green-600',
    'in progress': 'bg-yellow-500',
    'completed': 'bg-blue-600',
    'at risk': 'bg-red-600',
  };

  return (
    <div className={cn(
      'border border-gray-200 dark:border-gray-700 rounded-lg p-4',
      className
    )}>
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <span className={cn(
          'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
          statusClasses[status]
        )}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</h5>
        <div className="mt-2 w-full">
          <Progress 
            value={progress} 
            className="h-2.5 bg-gray-200 dark:bg-gray-700"
            indicatorClassName={progressClasses[status]}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {startDate && <span>Started: {startDate}</span>}
          <span>{progress}% Complete</span>
        </div>
      </div>
    </div>
  );
}
