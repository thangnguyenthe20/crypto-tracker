"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "./input";

export interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  compact?: boolean;
  showIcon?: boolean;
  onPopoverClose?: () => void;
  modal?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date and time",
  compact = false,
  showIcon = true,
  onPopoverClose,
  modal = false,
}: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(date ? format(date, "HH:mm") : "");

  // Update time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime(format(date, "HH:mm"));
    }
  }, [date]);

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      setSelectedTime("");
      return;
    }

    // Create a new date to avoid mutating the original
    const newDate = new Date(selectedDate);

    // Set time based on existing time or current time
    if (selectedTime) {
      // Preserve the time if it exists
      const [hours, minutes] = selectedTime.split(":");
      if (hours && minutes) {
        newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
    } else {
      // Default to current time if no time was previously set
      const now = new Date();
      newDate.setHours(now.getHours(), now.getMinutes());
      setSelectedTime(format(newDate, "HH:mm"));
    }

    console.log("Selected date:", newDate);
    setDate(newDate);
  };

  // Handle time input changes
  const handleTimeInputChange = (value: string, type: "hours" | "minutes") => {
    if (!date) return;

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const newDate = new Date(date);

    if (type === "hours" && numValue >= 0 && numValue < 24) {
      newDate.setHours(numValue);
    } else if (type === "minutes" && numValue >= 0 && numValue < 60) {
      newDate.setMinutes(numValue);
    } else {
      return; // Invalid value
    }

    setDate(newDate);
    setSelectedTime(format(newDate, "HH:mm"));
  };

  // Common styles for time inputs
  const timeInputClass =
    "h-8 text-center w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <Popover
      modal={modal}
      onOpenChange={(open) => {
        if (!open && onPopoverClose) {
          onPopoverClose();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            compact && "h-8 text-xs px-2",
            className,
            "border-gray-300 hover:border-primary hover:bg-gray-50 transition-colors"
          )}
        >
          {showIcon && <CalendarIcon className={cn("mr-2 text-gray-500", compact ? "h-3 w-3" : "h-4 w-4")} />}
          {date ? (
            <span>{format(date, "dd/MM/yyyy HH:mm")}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-gray-200 rounded-md shadow-lg" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className="rounded-none"
          disabled={(date) => false} // Make sure no dates are disabled
        />
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-md">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Input
                type="number"
                min={0}
                max={23}
                placeholder="HH"
                value={date ? format(date, "HH") : ""}
                onChange={(e) => handleTimeInputChange(e.target.value, "hours")}
                className={timeInputClass}
              />
              <span className="text-xl">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                placeholder="MM"
                value={date ? format(date, "mm") : ""}
                onChange={(e) => handleTimeInputChange(e.target.value, "minutes")}
                className={timeInputClass}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
