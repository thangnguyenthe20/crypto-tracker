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

// Special columns that are always in edit mode
const ALWAYS_EDIT_COLUMNS = ["side", "timeframe", "entryTime", "exitTime"];

/**
 * Optimized EditableCell component with memoization
 * Handles cell editing and updates for the trade table
 */
const EditableCell = ({ getValue, row, column }: CellContext<TradeRecord, unknown>) => {
  const { trades, updateTrade } = useTrades();
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const rowId = row.original._id;
  const columnId = column.id as keyof TradeRecord;

  const isEditing = editingCell?.id === rowId && editingCell?.column === columnId;
  const isEditable = !NON_EDITABLE_COLUMNS.includes(columnId);
  const isAlwaysEditing = ALWAYS_EDIT_COLUMNS.includes(columnId);

  // Update local state when cell value changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle cell click to enter edit mode
  const onCellClick = useCallback(() => {
    if (!isEditable || !rowId) return;
    setEditingCell({ id: rowId, column: columnId });
  }, [columnId, rowId, isEditable]);

  // Update trade with recalculated values
  const updateTradeWithCalculations = useCallback((trade: TradeRecord, fieldId: string, parsedValue: any) => {
    const updatedTrade = { ...trade, [fieldId]: parsedValue };

    // Recalculate risk-reward ratio if price-related fields change
    if (["entryPrice", "stopLoss", "takeProfit"].includes(fieldId)) {
      const entryPrice = fieldId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
      const stopLoss = fieldId === "stopLoss" ? Number(parsedValue) : trade.stopLoss;
      const takeProfit = fieldId === "takeProfit" ? Number(parsedValue) : trade.takeProfit;

      updatedTrade.rr = calculateRR(entryPrice, stopLoss, takeProfit);

      if (updatedTrade.exitPrice) {
        updatedTrade.realizedRR = calculateRealizedRR(entryPrice, stopLoss, updatedTrade.exitPrice);
      }
    }

    // Recalculate PnL if relevant fields changed
    if (["entryPrice", "exitPrice", "quantity", "side", "fee"].includes(fieldId)) {
      if (updatedTrade.entryPrice && updatedTrade.exitPrice && updatedTrade.quantity) {
        const side = fieldId === "side" ? (parsedValue as "buy" | "sell") : trade.side;
        const entryPrice = fieldId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
        const exitPrice = fieldId === "exitPrice" ? Number(parsedValue) : trade.exitPrice;
        const quantity = fieldId === "quantity" ? Number(parsedValue) : trade.quantity;
        const fee = fieldId === "fee" ? Number(parsedValue) : trade.fee || 0;

        updatedTrade.pnl = calculatePnL(side, entryPrice, exitPrice, quantity, fee);
      }
    }

    return updatedTrade;
  }, []);

  // Handle cell blur to save changes
  const onCellBlur = useCallback(() => {
    // Skip if not editing (except for special columns that are always in edit mode)
    if (!isAlwaysEditing && !editingCell) return;

    // Skip if value hasn't changed
    if (value === initialValue) {
      setEditingCell(null);
      return;
    }

    // Skip if rowId is undefined
    if (!rowId) return;

    // Find the trade to update
    const trade = trades.find((t) => t._id === rowId);
    if (!trade) return;

    // Parse the value based on field type
    const parsedValue = parseFormValue(columnId, value as string);

    // Update trade with recalculated values
    const updatedTrade = updateTradeWithCalculations(trade, columnId, parsedValue);

    // Update the trade in the store
    updateTrade(updatedTrade);
    setEditingCell(null);
  }, [
    columnId,
    editingCell,
    initialValue,
    isAlwaysEditing,
    rowId,
    trades,
    updateTrade,
    updateTradeWithCalculations,
    value,
  ]);

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

  // Render input based on column type
  const renderInput = () => {
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

    // Date fields
    if (columnId === "entryTime" || columnId === "exitTime") {
      return <DateTimeInput {...inputProps} />;
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

    // Number fields
    if (NUMBER_FIELDS.includes(columnId)) {
      return <NumberInput {...inputProps} />;
    }

    // Default to text input
    return <TextInput {...inputProps} />;
  };

  // If not editing and not a special column, show display cell
  if (!isEditing && !isAlwaysEditing) {
    return (
      <DisplayCell
        value={initialValue}
        columnId={columnId}
        isEditable={isEditable}
        onEdit={onCellClick}
        row={row.original}
      />
    );
  }

  // Otherwise render the appropriate input
  return renderInput();
};

// Memoize the component to prevent unnecessary re-renders
export default memo(EditableCell);
