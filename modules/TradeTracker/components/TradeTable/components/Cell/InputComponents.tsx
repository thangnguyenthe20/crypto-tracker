import React, { useState, useEffect } from "react";
import { CellInputProps } from "../../types";
import { PRICE_FIELDS } from "../../../../constants";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export const SelectInput: React.FC<CellInputProps & { options: { value: string; label: string }[] }> = ({
  value,
  onChange,
  onBlur,
  options,
  className = "",
}) => (
  <Select value={value as string} onValueChange={onChange} onOpenChange={(open) => !open && onBlur()}>
    <SelectTrigger size="sm" className={className}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const NumberInput: React.FC<CellInputProps> = ({ value, onChange, onBlur, onKeyDown, columnId }) => (
  <Input
    className="w-full h-auto p-1 focus-visible:ring-0"
    type="number"
    value={value as string}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    onKeyDown={onKeyDown}
    step={PRICE_FIELDS.includes(columnId) ? "0.000001" : "0.01"}
    autoFocus
  />
);

export const DateTimeInput: React.FC<CellInputProps> = ({ value, onChange, onBlur }) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value as string) : undefined);
  const [hasChanged, setHasChanged] = useState(false);

  // Update the parent component when the date changes
  useEffect(() => {
    if (date) {
      onChange(date.toISOString());
      setHasChanged(true);
    }
  }, [date, onChange]);

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  // Handle popover close - this is when we'll update the database
  const handlePopoverClose = () => {
    if (hasChanged && onBlur) {
      // Ensure we're using the latest date value
      if (date) {
        onChange(date.toISOString());
      }
      // Small delay to ensure state is updated
      setTimeout(() => {
        onBlur();
        setHasChanged(false);
      }, 50);
    }
  };

  return (
    <div className="w-full">
      <DateTimePicker
        date={date}
        setDate={handleDateChange}
        className="!text-sm !text-gray-900 border-0 cursor-pointer hover:border-1"
        placeholder={""}
        compact={true}
        showIcon={false}
        onPopoverClose={handlePopoverClose}
      />
    </div>
  );
};

export const TextInput: React.FC<CellInputProps> = ({ value, onChange, onBlur, onKeyDown }) => (
  <Input
    className="w-full h-auto p-1 focus-visible:ring-0"
    value={value as string}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    onKeyDown={onKeyDown}
    autoFocus
  />
);
