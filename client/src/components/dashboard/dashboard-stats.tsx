import React from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { Clock, Users, ClipboardCheck } from 'lucide-react';

interface DashboardStatsProps {
  careHours: string;
  serviceUsersCount: number;
  carePlanCompliance: string;
  isLoading?: boolean;
}

export function DashboardStats({
  careHours,
  serviceUsersCount,
  carePlanCompliance,
  isLoading = false
}: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse flex items-center">
                <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-md p-3 h-12 w-12"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Care Hours Delivered"
        value={careHours}
        icon={Clock}
        color="secondary"
        subtitle="This week"
      />
      
      <MetricCard
        title="Service Users Supported"
        value={serviceUsersCount}
        icon={Users}
        color="primary"
        subtitle="This week"
      />
      
      <MetricCard
        title="Care Plan Compliance"
        value={carePlanCompliance}
        icon={ClipboardCheck}
        color="accent"
        trend={{
          value: "2% from last week",
          positive: true
        }}
      />
    </div>
  );
}
