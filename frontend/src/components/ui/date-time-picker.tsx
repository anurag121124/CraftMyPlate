import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { Separator } from './separator';

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
  error?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date and time',
  minDate,
  disabled,
  error,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, 'HH:mm') : ''
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTimeValue(format(date, 'HH:mm'));
    } else {
      setSelectedDate(undefined);
      setTimeValue('');
    }
  }, [date]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (selected) {
      const newDate = new Date(selected);
      if (timeValue) {
        const [hours, minutes] = timeValue.split(':');
        newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      } else {
        newDate.setHours(0, 0, 0, 0);
      }
      setSelectedDate(newDate);
      onDateChange(newDate);
    } else {
      setSelectedDate(undefined);
      onDateChange(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate && time) {
      const [hours, minutes] = time.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      setSelectedDate(newDate);
      onDateChange(newDate);
    } else if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue('');
    onDateChange(undefined);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const newDate = new Date(today);
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':');
      newDate.setHours(parseInt(hours) || today.getHours(), parseInt(minutes) || today.getMinutes(), 0, 0);
    } else {
      newDate.setHours(today.getHours(), today.getMinutes(), 0, 0);
    }
    setSelectedDate(newDate);
    setTimeValue(format(newDate, 'HH:mm'));
    onDateChange(newDate);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={cn(
              'w-full justify-start text-left font-normal h-11',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP HH:mm')
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="top" data-slot="popover-content">
          <div className="p-3 space-y-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (!minDate) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                return checkDate < minDate;
              }}
              initialFocus
            />
            <Separator />
            <div className="flex items-center gap-2 px-1">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
            <Separator />
            <div className="flex justify-between gap-2 px-1 pb-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
              >
                Today
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

