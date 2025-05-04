import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TaskItem } from '@/components/ui/task-item';

interface Task {
  id: number;
  type: string;
  title: string;
  description: string;
  serviceUserId: number;
  serviceUserName: string;
}

interface TaskListProps {
  tasks: Task[];
  onCompleteTask?: (id: number, completed: boolean) => void;
  isLoading?: boolean;
}

export function TaskList({
  tasks,
  onCompleteTask,
  isLoading = false
}: TaskListProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="px-4 py-5 sm:px-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4 animate-pulse border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="ml-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Map task type to category
  const getCategoryFromType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'appointment':
        return 'appointment';
      case 'medication':
        return 'medication';
      case 'nutrition':
        return 'nutrition';
      default:
        return 'general';
    }
  };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Pending Tasks
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Documentation that needs your attention
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <li key={task.id} className="px-4 py-4">
              <TaskItem
                id={task.id}
                title={task.title}
                description={task.description}
                category={getCategoryFromType(task.type)}
                onComplete={onCompleteTask}
              />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
