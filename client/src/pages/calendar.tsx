import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Fetch appointments for the selected date
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/caregiver', { date: selectedDate }]
  });

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Set current date to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Format appointment time
  const formatTime = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  // Get appointment color based on visit type
  const getAppointmentColor = (visitType: string) => {
    switch (visitType.toLowerCase()) {
      case 'personal care':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'medication':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'social support':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Calendar"
          description="View and manage your schedule"
          actions={
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          }
        />

        <div className="py-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar navigation and grid */}
            <div className="lg:w-7/12">
              <Card>
                <CardHeader className="px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 text-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                    {calendarDays.map((day, dayIdx) => {
                      const formattedDay = format(day, 'yyyy-MM-dd');
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const isSelected = isSameDay(day, parseISO(selectedDate));
                      const isTodayDate = isToday(day);
                      
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "min-h-[100px] p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                            !isCurrentMonth && "bg-gray-50 dark:bg-gray-800 text-gray-400",
                            isSelected && "bg-primary-50 dark:bg-primary-900/50",
                            isTodayDate && "bg-yellow-50 dark:bg-yellow-900/20"
                          )}
                          onClick={() => setSelectedDate(formattedDay)}
                        >
                          <div className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                            isTodayDate && "bg-primary-500 text-white"
                          )}>
                            {format(day, 'd')}
                          </div>
                          {/* Appointment indicators - simplified for space */}
                          <div className="mt-1">
                            {/* In a real app, we'd fetch and display appointment counts or indicators here */}
                            {isCurrentMonth && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {/* Example indicators */}
                                {dayIdx % 3 === 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mb-1 mx-auto"></div>}
                                {dayIdx % 4 === 0 && <div className="h-1.5 w-1.5 rounded-full bg-green-500 mb-1 mx-auto"></div>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Daily schedule view */}
            <div className="lg:w-5/12">
              <Card>
                <CardHeader className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <Badge variant="outline" className={cn(
                      "px-2 py-1",
                      isToday(parseISO(selectedDate)) ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200" : ""
                    )}>
                      {isToday(parseISO(selectedDate)) ? "Today" : format(parseISO(selectedDate), 'dd/MM/yyyy')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="flex justify-between mt-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment: any) => (
                        <div 
                          key={appointment.id} 
                          className={cn(
                            "p-3 border rounded-md",
                            getAppointmentColor(appointment.visitType)
                          )}
                        >
                          <div className="font-medium">{appointment.title}</div>
                          <div className="text-sm">{appointment.serviceUser?.fullName}</div>
                          <div className="flex justify-between mt-3 text-sm">
                            <div>{formatTime(appointment.startTime, appointment.endTime)}</div>
                            <div>{appointment.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <CalendarIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No appointments</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        There are no appointments scheduled for this day.
                      </p>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
