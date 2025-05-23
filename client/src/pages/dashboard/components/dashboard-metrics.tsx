import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClipboardCheckIcon, 
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

/**
 * Individual metric card component
 */
function MetricCard({ title, value, description, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend && (
            <>
              {trend.direction === 'up' && (
                <TrendingUpIcon className="mr-1 h-3 w-3 text-green-500" />
              )}
              {trend.direction === 'down' && (
                <TrendingDownIcon className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={
                trend.direction === 'up' 
                  ? 'text-green-500' 
                  : trend.direction === 'down' 
                    ? 'text-red-500' 
                    : ''
              }>
                {trend.value}%
              </span>
              <span className="ml-1">from last period</span>
            </>
          )}
          {description && !trend && description}
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  data?: {
    serviceUsers: number;
    todayVisits: number;
    completedTasks: number;
    pendingTasks: number;
    incidents: number;
    staffAvailability: number;
    careQualityScore: number;
    [key: string]: any;
  };
  view: string;
}

/**
 * Dashboard metrics component
 * 
 * Displays key metrics based on the user's role
 */
export function DashboardMetrics({ data, view }: DashboardMetricsProps) {
  if (!data) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Define metrics based on user role
  const getMetrics = () => {
    const commonMetrics = [
      {
        title: 'Service Users',
        value: data.serviceUsers,
        icon: <UsersIcon />,
        trend: {
          value: 5,
          direction: 'up' as const
        }
      },
      {
        title: "Today's Visits",
        value: data.todayVisits,
        icon: <CalendarIcon />,
      }
    ];

    switch (view) {
      case 'admin':
      case 'manager':
        return [
          ...commonMetrics,
          {
            title: 'Staff Availability',
            value: `${data.staffAvailability}%`,
            icon: <ActivityIcon />,
            trend: {
              value: 2,
              direction: 'down' as const
            }
          },
          {
            title: 'Care Quality Score',
            value: data.careQualityScore,
            description: 'Out of 10',
            icon: <ClipboardCheckIcon />,
            trend: {
              value: 8,
              direction: 'up' as const
            }
          },
          {
            title: 'Incidents',
            value: data.incidents,
            icon: <AlertTriangleIcon />,
            trend: {
              value: 12,
              direction: 'down' as const
            }
          }
        ];
      case 'coordinator':
        return [
          ...commonMetrics,
          {
            title: 'Completed Tasks',
            value: data.completedTasks,
            icon: <ClipboardCheckIcon />,
          },
          {
            title: 'Pending Tasks',
            value: data.pendingTasks,
            icon: <AlertTriangleIcon />,
          }
        ];
      case 'caregiver':
        return [
          ...commonMetrics,
          {
            title: 'Completed Tasks',
            value: data.completedTasks,
            icon: <ClipboardCheckIcon />,
          },
          {
            title: 'Pending Tasks',
            value: data.pendingTasks,
            icon: <AlertTriangleIcon />,
          }
        ];
      default:
        return commonMetrics;
    }
  };

  const metrics = getMetrics();

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          trend={metric.trend}
        />
      ))}
    </div>
  );
}
