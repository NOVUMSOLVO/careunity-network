import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  serviceUserId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  visitType: string;
  serviceUser: {
    fullName: string;
  };
}

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  className?: string;
}

export function AppointmentList({
  appointments,
  isLoading = false,
  className
}: AppointmentListProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <div className="px-4 py-5 sm:px-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4 sm:px-6 animate-pulse border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="w-3/4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Format current date for display
  const today = new Date();
  const formattedDate = format(today, 'EEEE, d MMMM yyyy');
  
  // Get visit type badge color
  const getVisitTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'personal care':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medication':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'social support':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {formattedDate}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            You have {appointments.length} visits scheduled today
          </p>
        </div>
        <Link href="/calendar">
          <Button variant="outline" className="text-sm px-4 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800">
            View Full Calendar
          </Button>
        </Link>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul>
          {appointments.map((appointment) => (
            <li 
              key={appointment.id} 
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition border-t border-gray-200 dark:border-gray-700"
            >
              <Link href={`/appointments/${appointment.id}`}>
                <div className="flex items-center">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-primary-600 dark:text-primary-400 truncate">
                          {appointment.serviceUser.fullName}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                              getVisitTypeBadgeColor(appointment.visitType)
                            )}
                          >
                            {appointment.visitType}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <p>
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <p>
                            {appointment.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
