import { CellContext } from "@tanstack/react-table";
import { CellInputProps, EditingCell, TradeRecord } from "../../types";
import { useCallback, useEffect, useState, memo } from "react";
import { NON_EDITABLE_COLUMNS, NUMBER_FIELDS, SIDE_OPTIONS, TIMEFRAME_OPTIONS } from "../../../../constants";
import DisplayCell from "./DisplayCell";
import { DateTimeInput, NumberInput, SelectInput, TextInput } from "./InputComponents";
import { calculatePnL, calculateRealizedRR, calculateRR } from "../../utils";
import clsx from "clsx";
import { useTrades } from "@/modules/TradeTracker/hooks";
import { parseFormValue } from "@/modules/TradeTracker/utils";

/**
 * Optimized EditableCell component with memoization
 * Handles cell editing and updates for the trade table
 */
const EditableCell = ({ getValue, row, column }: CellContext<TradeRecord, unknown>) => {
  const { trades, updateTrade } = useTrades();
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const rowId = row.original.id;
  const columnId = column.id;

  const isEditing = editingCell?.id === rowId && editingCell?.column === columnId;
  const isEditable = !NON_EDITABLE_COLUMNS.includes(columnId);

  // Update local state when cell value changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle cell click to enter edit mode
  const onCellClick = useCallback(() => {
    if (!isEditable) return;
    setEditingCell({ id: rowId, column: columnId });
  }, [columnId, rowId, isEditable]);

  // Handle cell blur to save changes
  const onCellBlur = useCallback(() => {
    // Skip if not editing (except for select fields that are always in edit mode)
    if (columnId !== "side" && columnId !== "timeframe" && !editingCell) return;

    // Skip if value hasn't changed
    if (value === initialValue) {
      setEditingCell(null);
      return;
    }

    // Find the trade to update
    const trade = trades.find((t) => t.id === rowId);
    if (!trade) return;

    // Parse the value based on field type
    const parsedValue = parseFormValue(columnId, value as string);
    const updatedTrade = { ...trade, [columnId]: parsedValue };

    // Recalculate derived values if needed
    if (["entryPrice", "stopLoss", "takeProfit"].includes(columnId)) {
      // Get updated values with type safety
      const entryPrice = columnId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
      const stopLoss = columnId === "stopLoss" ? Number(parsedValue) : trade.stopLoss;
      const takeProfit = columnId === "takeProfit" ? Number(parsedValue) : trade.takeProfit;

      // Update risk-reward ratio
      updatedTrade.rr = calculateRR(entryPrice, stopLoss, takeProfit);

      // If exit price exists, recalculate realized RR
      if (updatedTrade.exitPrice) {
        updatedTrade.realizedRR = calculateRealizedRR(entryPrice, stopLoss, updatedTrade.exitPrice);
      }
    }

    // Recalculate PnL if relevant fields changed
    if (["entryPrice", "exitPrice", "quantity", "side", "fee"].includes(columnId)) {
      if (updatedTrade.entryPrice && updatedTrade.exitPrice && updatedTrade.quantity) {
        const side = columnId === "side" ? (parsedValue as "buy" | "sell") : trade.side;
        const entryPrice = columnId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
        const exitPrice = columnId === "exitPrice" ? Number(parsedValue) : trade.exitPrice;
        const quantity = columnId === "quantity" ? Number(parsedValue) : trade.quantity;
        const fee = columnId === "fee" ? Number(parsedValue) : trade.fee || 0;

        updatedTrade.pnl = calculatePnL(side, entryPrice, exitPrice, quantity, fee);
      }
    }

    // Update the trade in the store
    updateTrade(updatedTrade);
    setEditingCell(null);
  }, [columnId, editingCell, initialValue, rowId, trades, updateTrade, value]);

  // Handle keyboard events
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onCellBlur();
      } else if (e.key === "Escape") {
        setValue(initialValue); // Reset to initial value
        setEditingCell(null);
      }
    },
    [onCellBlur, initialValue]
  );

  // Common props for all input components
  const inputProps: CellInputProps = {
    value,
    onChange: setValue,
    onBlur: onCellBlur,
    onKeyDown: onKeyDown,
    columnId,
  };

  // Render different input types based on column
  // Side column (always in edit mode)
  if (columnId === "side") {
    return (
      <SelectInput
        {...inputProps}
        options={SIDE_OPTIONS}
        className={clsx(
          "font-bold border-transparent uppercase text-xs cursor-pointer px-2 !h-[30px] w-[48px] side-select focus-visible:ring-0",
          value === "buy"
            ? "bg-green-100 text-green-800 hover:border-green-300"
            : "bg-red-100 text-red-800 hover:border-red-300"
        )}
      />
    );
  }

  // Timeframe column (always in edit mode)
  if (columnId === "timeframe") {
    return (
      <SelectInput
        {...inputProps}
        options={TIMEFRAME_OPTIONS}
        className={clsx("uppercase text-xs cursor-pointer px-2 !h-[30px] w-[48px] side-select focus-visible:ring-0")}
      />
    );
  }

  // Display mode (not editing)
  if (!isEditing) {
    return <DisplayCell value={initialValue} columnId={columnId} isEditable={isEditable} onEdit={onCellClick} />;
  }

  // Number fields
  if (NUMBER_FIELDS.includes(columnId)) {
    return <NumberInput {...inputProps} />;
  }

  // Date fields
  if (columnId === "entryTime" || columnId === "exitTime") {
    return <DateTimeInput {...inputProps} />;
  }

  // Default to text input
  return <TextInput {...inputProps} />;
};

// Memoize the component to prevent unnecessary re-renders
export default memo(EditableCell);
