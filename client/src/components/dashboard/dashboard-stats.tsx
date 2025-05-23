import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatsProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    label: string;
    direction?: 'up' | 'down';
  };
  trendDirection?: 'up' | 'down';
  valueColor?: string;
  className?: string;
}

/**
 * Dashboard Stats Component
 *
 * This component displays a statistic card for dashboards with optional
 * trend indicators and customizable styling.
 */
export function DashboardStats({
  title,
  value,
  description,
  icon,
  trend,
  trendDirection,
  valueColor,
  className
}: DashboardStatsProps) {
  // Determine trend direction if not explicitly provided
  const direction = trendDirection || (trend?.direction || (trend?.value.startsWith('-') ? 'down' : 'up'));

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
          </div>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-full">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {direction === 'up' ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-rose-500" />
              )}
              <span className={cn(
                "text-xs font-medium",
                direction === 'up' ? "text-emerald-500" : "text-rose-500"
              )}>
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
