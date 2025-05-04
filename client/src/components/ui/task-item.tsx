import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Clipboard, ClipboardCheck, PillBottle, Utensils } from 'lucide-react';

interface TaskItemProps {
  id: number;
  title: string;
  description: string;
  category: 'personal care' | 'medication' | 'nutrition' | 'appointment' | 'general';
  completed?: boolean;
  onComplete?: (id: number, completed: boolean) => void;
  onClick?: (id: number) => void;
  className?: string;
}

const categoryIcons = {
  'personal care': Clipboard,
  'medication': PillBottle,
  'nutrition': Utensils,
  'appointment': ClipboardCheck,
  'general': Clipboard
};

const categoryColors = {
  'personal care': 'orange',
  'medication': 'red',
  'nutrition': 'blue',
  'appointment': 'purple',
  'general': 'gray'
};

export function TaskItem({
  id,
  title,
  description,
  category,
  completed = false,
  onComplete,
  onClick,
  className
}: TaskItemProps) {
  const Icon = categoryIcons[category];
  const colorClass = categoryColors[category];
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) {
      onComplete(id, !completed);
    }
  };

  return (
    <Card 
      className={cn(
        "transition-colors hover:bg-gray-50 dark:hover:bg-gray-700", 
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
              `bg-${colorClass}-100 dark:bg-${colorClass}-900`
            )}>
              <Icon className={cn(
                "h-5 w-5",
                `text-${colorClass}-600 dark:text-${colorClass}-300`
              )} />
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center">
                {onComplete && (
                  <div className="mr-2">
                    <Checkbox 
                      id={`task-${id}`} 
                      checked={completed}
                      onCheckedChange={() => {
                        if (onComplete) onComplete(id, !completed);
                      }}
                      className="h-4 w-4"
                    />
                  </div>
                )}
                <Label 
                  htmlFor={`task-${id}`}
                  className={cn(
                    "text-sm font-medium",
                    completed ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-white"
                  )}
                >
                  {title}
                </Label>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </div>
            </div>
          </div>
          
          {onComplete && !onClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              className="ml-2 whitespace-nowrap"
            >
              {completed ? 'Completed' : 'Complete'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
