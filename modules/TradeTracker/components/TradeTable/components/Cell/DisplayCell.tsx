import { memo, useMemo, useCallback } from "react";
import { DisplayCellProps } from "../../types";
import { formatCurrency, formatDate } from "@/modules/TradeTracker/utils";
import clsx from "clsx";
import { PRICE_FIELDS, DATE_FIELDS, TEXT_FIELDS, RATIO_FIELDS } from "../../../../constants";

/**
 * Formats a numeric value with appropriate decimal places based on its magnitude
 */
const formatNumericValue = (value: number): string => {
  if (value === 0) return "0.0";
  if (value < 0.01) return value.toFixed(6);
  if (value < 1) return value.toFixed(4);
  if (value < 1000) return value.toFixed(2);
  return value.toFixed(0);
};

/**
 * DisplayCell component for rendering cell values with appropriate formatting
 * Uses memoization to prevent unnecessary re-renders
 */
const DisplayCell = ({ value, columnId, isEditable, onEdit }: DisplayCellProps) => {
  // Format cell value based on column type
  const formattedValue = useMemo((): React.ReactNode => {
    if (value === null || value === undefined) return "-";

    // Handle different column types
    if (columnId === "symbol") {
      return value;
    }

    if (columnId === "side") {
      return (
        <span
          className={clsx(
            "px-2 py-1 text-xs font-semibold rounded-full",
            value === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}
        >
          {value.toUpperCase()}
        </span>
      );
    }

    if (columnId === "riskAmount") {
      return `$${value}`;
    }

    if (PRICE_FIELDS.includes(columnId)) {
      return formatNumericValue(value);
    }

    if (columnId === "pnl") {
      return (
        <span
          className={clsx(
            "text-sm font-medium",
            value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-500"
          )}
        >
          {formatCurrency(value)}
        </span>
      );
    }

    if (RATIO_FIELDS.includes(columnId)) {
      return value.toFixed(2);
    }

    if (DATE_FIELDS.includes(columnId)) {
      return formatDate(value, true);
    }

    if (TEXT_FIELDS.includes(columnId)) {
      return (
        <div className="w-full whitespace-normal overflow-hidden break-words line-clamp-3 max-h-[4.5em]">
          {typeof value === "string" ? value : String(value)}
        </div>
      );
    }

    // Default case
    return value;
  }, [value, columnId]);

  // Determine if this cell should trigger edit on hover
  const shouldEditOnHover = columnId === "side";

  // Determine if this is a text column that needs special styling
  const isTextColumn = TEXT_FIELDS.includes(columnId);

  // Handle cell click
  const handleCellClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditable) {
        e.stopPropagation();
        onEdit();
      }
    },
    [isEditable, onEdit]
  );

  // Handle mouse over for hover-edit columns
  const handleMouseOver = useCallback(() => {
    if (shouldEditOnHover && isEditable) {
      onEdit();
    }
  }, [shouldEditOnHover, isEditable, onEdit]);

  return (
    <div
      className={clsx(
        "text-sm text-gray-900 p-1 rounded group transition-colors duration-150",
        isEditable && "cursor-pointer hover:bg-gray-200"
      )}
      onClick={handleCellClick}
      onMouseOver={handleMouseOver}
      title={isEditable ? "Click to edit" : ""}
    >
      <div className={clsx("flex items-center", isTextColumn ? "w-full min-w-[100px]" : "w-[100px]")}>
        {formattedValue}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DisplayCell);
