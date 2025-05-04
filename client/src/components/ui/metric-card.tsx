import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent';
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  className
}: MetricCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-100 dark:bg-primary-900',
      text: 'text-primary-600 dark:text-primary-300'
    },
    secondary: {
      bg: 'bg-secondary-100 dark:bg-secondary-900',
      text: 'text-secondary-600 dark:text-secondary-300'
    },
    accent: {
      bg: 'bg-accent-100 dark:bg-accent-900',
      text: 'text-accent-600 dark:text-accent-300'
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg",
      className
    )}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn(
            "flex-shrink-0 rounded-md p-3",
            colorClasses[color].bg
          )}>
            <Icon className={cn("text-xl", colorClasses[color].text)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
                {subtitle && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </div>
                )}
                {trend && (
                  <div className={cn(
                    "text-sm",
                    trend.positive 
                      ? "text-green-500 dark:text-green-400" 
                      : "text-red-500 dark:text-red-400"
                  )}>
                    <span className="inline-flex items-center">
                      {trend.positive 
                        ? <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        : <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                      }
                      {trend.value}
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
