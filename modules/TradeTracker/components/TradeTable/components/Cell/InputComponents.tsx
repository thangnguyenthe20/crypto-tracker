import React from "react";
import { CellInputProps } from "../../types";
import { PRICE_FIELDS } from "../../../../constants";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export const DateTimeInput: React.FC<CellInputProps> = ({ value, onChange, onBlur }) => (
  <input
    type="datetime-local"
    className="w-full p-1 text-sm border border-blue-500 rounded focus:outline-none"
    value={value ? new Date(value as string).toISOString().slice(0, 16) : ""}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    autoFocus
  />
);

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
