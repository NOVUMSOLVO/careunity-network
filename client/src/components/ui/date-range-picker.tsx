/**
 * Date Range Picker Component
 * 
 * A component for selecting a date range
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (date: DateRange) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = 'end',
}: DateRangePickerProps) {
  const { t } = useTranslation();
  
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  
  // Update internal state when value changes
  React.useEffect(() => {
    setDate(value);
  }, [value]);
  
  // Handle date change
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate || {});
    }
  };
  
  // Format date range for display
  const formatDateRange = () => {
    if (!date?.from) {
      return t('common.selectDateRange');
    }
    
    if (date.to) {
      return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
    }
    
    return format(date.from, 'LLL dd, y');
  };
  
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
