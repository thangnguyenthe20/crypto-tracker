import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ColumnDefinition, TradeRecord } from "./types";
import EditableCell from "./components/Cell/EditableCell";
import ColumnHeader from "./components/Cell/ColumnHeader";
import { DeleteButton } from "./components/DeleteButton";
import { TEXT_FIELDS } from "../../constants";

/**
 * Generate table columns from column definitions
 */
export const getTableColumns = (columnDefinitions: ColumnDefinition[]) => {
  const columnHelper = createColumnHelper<TradeRecord>();

  // Create columns from column definitions
  const dataColumns = columnDefinitions.map((col) =>
    columnHelper.accessor(col.accessorKey, {
      header: ({ column }) => {
        return React.createElement(ColumnHeader, {
          column: column,
          header: col.header,
          size: col.size,
        });
      },
      cell: (props) => {
        const isTextColumn = TEXT_FIELDS.includes(col.accessorKey);
        return React.createElement(
          "div",
          {
            style: { width: col.size },
            className: isTextColumn ? "whitespace-normal" : "overflow-hidden",
          },
          React.createElement(EditableCell, { ...props })
        );
      },
    })
  );

  // Add action column with delete button
  const actionColumn = columnHelper.display({
    id: "actions",
    header: () => React.createElement("div", { style: { width: 50 } }, "Actions"),
    cell: (props) =>
      React.createElement(
        "div",
        { className: "flex justify-center", "data-cell-type": "action" },
        React.createElement(DeleteButton, { trade: props.row.original })
      ),
  });

  // Return all columns with action column at the end
  return [...dataColumns, actionColumn];
};

/**
 * Calculate risk-reward ratio
 */
export const calculateRR = (entryPrice: number, stopLoss: number, takeProfit: number): number => {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return risk === 0 ? 0 : parseFloat((reward / risk).toFixed(2));
};

/**
 * Calculate realized risk-reward ratio
 */
export const calculateRealizedRR = (entryPrice: number, stopLoss: number, exitPrice: number): number => {
  const risk = Math.abs(entryPrice - stopLoss);
  const realizedReward = Math.abs(exitPrice - entryPrice);
  return risk === 0 ? 0 : parseFloat((realizedReward / risk).toFixed(2));
};

/**
 * Calculate profit/loss
 */
export const calculatePnL = (
  side: "buy" | "sell",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fee: number = 0
): number => {
  const rawPnL = side === "buy" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
  return parseFloat((rawPnL - fee).toFixed(2));
};
