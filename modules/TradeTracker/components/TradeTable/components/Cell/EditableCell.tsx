import { CellContext } from "@tanstack/react-table";
import { CellInputProps, EditingCell, TradeRecord } from "../../types";
import { useCallback, useEffect, useState, memo, useMemo } from "react";
import {
  NON_EDITABLE_COLUMNS,
  NUMBER_FIELDS,
  SIDE_OPTIONS,
  TIMEFRAME_OPTIONS,
  ALWAYS_EDIT_COLUMNS,
  RR_RECALC_FIELDS,
  PNL_RECALC_FIELDS,
  TEXT_FIELDS,
  DATE_FIELDS,
} from "../../../../constants";
import DisplayCell from "./DisplayCell";
import { DateTimeInput, NumberInput, SelectInput, TextInput } from "./InputComponents";
import { calculatePnL, calculateRealizedRR, calculateRR } from "../../utils";
import clsx from "clsx";
import { useTrades } from "@/modules/TradeTracker/hooks";
import { parseFormValue } from "@/modules/TradeTracker/utils";

/**
 * EditableCell component handles cell editing and updates for the trade table
 * Optimized with memoization and clear separation of concerns
 */
const EditableCell = ({ getValue, row, column }: CellContext<TradeRecord, unknown>) => {
  const { trades, updateTrade } = useTrades();
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const rowId = row.original._id;
  const columnId = column.id as keyof TradeRecord;

  // Memoize these values to prevent unnecessary recalculations
  const cellState = useMemo(
    () => ({
      isEditing: editingCell?.id === rowId && editingCell?.column === columnId,
      isEditable: !NON_EDITABLE_COLUMNS.includes(columnId),
      isAlwaysEditing: ALWAYS_EDIT_COLUMNS.includes(columnId),
      isMultilineField: TEXT_FIELDS.includes(columnId),
      isDateField: DATE_FIELDS.includes(columnId),
      isNumberField: NUMBER_FIELDS.includes(columnId),
    }),
    [editingCell, rowId, columnId]
  );

  // Update local state when cell value changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle cell click to enter edit mode
  const onCellClick = useCallback(() => {
    if (!cellState.isEditable || !rowId) return;
    setEditingCell({ id: rowId, column: columnId });
  }, [columnId, rowId, cellState.isEditable]);

  /**
   * Recalculate derived values based on field changes
   */
  const recalculateDerivedValues = useCallback((trade: TradeRecord, fieldId: string, parsedValue: any) => {
    const updatedTrade = { ...trade, [fieldId]: parsedValue };

    // Recalculate risk-reward ratio if price-related fields change
    if (RR_RECALC_FIELDS.includes(fieldId)) {
      const entryPrice = fieldId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
      const stopLoss = fieldId === "stopLoss" ? Number(parsedValue) : trade.stopLoss;
      const takeProfit = fieldId === "takeProfit" ? Number(parsedValue) : trade.takeProfit;

      updatedTrade.rr = calculateRR(entryPrice, stopLoss, takeProfit);

      if (updatedTrade.exitPrice) {
        updatedTrade.realizedRR = calculateRealizedRR(entryPrice, stopLoss, updatedTrade.exitPrice);
      }
    }

    // Recalculate PnL if relevant fields changed
    if (
      PNL_RECALC_FIELDS.includes(fieldId) &&
      updatedTrade.entryPrice &&
      updatedTrade.exitPrice &&
      updatedTrade.quantity
    ) {
      const side = fieldId === "side" ? (parsedValue as "buy" | "sell") : trade.side;
      const entryPrice = fieldId === "entryPrice" ? Number(parsedValue) : trade.entryPrice;
      const exitPrice = fieldId === "exitPrice" ? Number(parsedValue) : trade.exitPrice;
      const quantity = fieldId === "quantity" ? Number(parsedValue) : trade.quantity;
      const fee = fieldId === "fee" ? Number(parsedValue) : trade.fee || 0;

      updatedTrade.pnl = calculatePnL(side, entryPrice, exitPrice, quantity, fee);
    }

    return updatedTrade;
  }, []);

  /**
   * Save changes when cell loses focus
   */
  const saveChanges = useCallback(() => {
    // Skip if not editing (except for special columns that are always in edit mode)
    if (!cellState.isAlwaysEditing && !editingCell) return;

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
    const updatedTrade = recalculateDerivedValues(trade, columnId, parsedValue);

    // Update the trade in the store
    updateTrade(updatedTrade);
    setEditingCell(null);
  }, [
    columnId,
    editingCell,
    initialValue,
    cellState.isAlwaysEditing,
    rowId,
    trades,
    updateTrade,
    recalculateDerivedValues,
    value,
  ]);

  /**
   * Handle keyboard events for cell editing
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        // For multiline fields, only save on Shift+Enter
        if (cellState.isMultilineField) {
          if (e.shiftKey) {
            saveChanges();
          }
          // Otherwise let the textarea handle the Enter key
        } else {
          // For single-line fields, save on Enter
          saveChanges();
        }
      } else if (e.key === "Escape") {
        setValue(initialValue); // Reset to initial value
        setEditingCell(null);
      }
    },
    [saveChanges, initialValue, cellState.isMultilineField]
  );

  // Common props for all input components
  const inputProps: CellInputProps = useMemo(
    () => ({
      value,
      onChange: setValue,
      onBlur: saveChanges,
      onKeyDown: handleKeyDown,
      columnId,
    }),
    [value, setValue, saveChanges, handleKeyDown, columnId]
  );

  /**
   * Render the appropriate input component based on column type
   */
  const renderInput = useCallback(() => {
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
    if (cellState.isDateField) {
      return <DateTimeInput {...inputProps} />;
    }

    // Timeframe column (always in edit mode)
    if (columnId === "timeframe") {
      return (
        <SelectInput
          {...inputProps}
          options={TIMEFRAME_OPTIONS}
          className="uppercase text-xs cursor-pointer px-2 !h-[30px] w-[48px] side-select focus-visible:ring-0"
        />
      );
    }

    // Number fields
    if (cellState.isNumberField) {
      return <NumberInput {...inputProps} />;
    }

    // Default to text input
    return <TextInput {...inputProps} />;
  }, [columnId, inputProps, value, cellState]);

  // If not editing and not a special column, show display cell
  if (!cellState.isEditing && !cellState.isAlwaysEditing) {
    return (
      <DisplayCell value={initialValue} columnId={columnId} isEditable={cellState.isEditable} onEdit={onCellClick} />
    );
  }

  // Otherwise render the appropriate input
  return renderInput();
};

// Memoize the component to prevent unnecessary re-renders
export default memo(EditableCell);
