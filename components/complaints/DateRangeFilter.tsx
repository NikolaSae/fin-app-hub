// /components/complaints/DateRangeFilter.tsx
"use client";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (from?: Date, to?: Date) => void;
}

// Use named export instead of default export
export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
}: DateRangeFilterProps) {
  const dateRange: DateRange | undefined = startDate || endDate 
    ? { 
        from: startDate || undefined, 
        to: endDate || undefined 
      }
    : undefined;
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={startDate || new Date()}
            selected={dateRange}
            onSelect={(range) => {
              onChange(range?.from, range?.to);
            }}
            numberOfMonths={2}
          />
          <div className="flex justify-end p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined, undefined)}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Add a default export as well for backward compatibility
export default DateRangeFilter;