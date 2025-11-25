import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Separator } from './separator';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  minDate,
  maxDate,
  disabled,
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(undefined);
    }
  }, [date]);

  const handleDateSelect = (selected: Date | undefined) => {
    setSelectedDate(selected);
    onDateChange(selected);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onDateChange(undefined);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    onDateChange(today);
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
              'w-full justify-start text-left font-normal h-10',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP')
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
                if (minDate) {
                  const checkDate = new Date(date);
                  checkDate.setHours(0, 0, 0, 0);
                  const checkMinDate = new Date(minDate);
                  checkMinDate.setHours(0, 0, 0, 0);
                  if (checkDate < checkMinDate) return true;
                }
                if (maxDate) {
                  const checkDate = new Date(date);
                  checkDate.setHours(0, 0, 0, 0);
                  const checkMaxDate = new Date(maxDate);
                  checkMaxDate.setHours(0, 0, 0, 0);
                  if (checkDate > checkMaxDate) return true;
                }
                return false;
              }}
              initialFocus
            />
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

