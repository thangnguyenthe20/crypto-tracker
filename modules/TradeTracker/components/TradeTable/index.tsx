"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getPaginationRowModel,
  Column,
} from "@tanstack/react-table";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { PaginationControls } from "./components/PaginationControls";
import { TradeRecord } from "./types";
import { PAGE_SIZE_OPTIONS } from "../../constants";
import EditableCell from "./components/Cell/EditableCell";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useTrades } from "../../hooks";
import { TradeForm } from "../TradeForm";
import { DeleteButton } from "./components/DeleteButton";
import { TableLoadingMask } from "./components/TableLoadingMask";

// Column definition type with size property
type ColumnDefinition = {
  accessorKey: keyof TradeRecord;
  header: string;
  size: number;
};

const TradeTable: React.FC = () => {
  const { trades, isLoading, refreshTrades } = useTrades();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define column configurations
  const columnDefinitions = useMemo<ColumnDefinition[]>(
    () => [
      { accessorKey: "symbol", header: "Symbol", size: 80 },
      { accessorKey: "timeframe", header: "TF", size: 60 },
      { accessorKey: "side", header: "Side", size: 60 },
      { accessorKey: "riskAmount", header: "Risk", size: 60 },
      { accessorKey: "entryPrice", header: "Entry", size: 80 },
      { accessorKey: "stopLoss", header: "SL", size: 80 },
      { accessorKey: "takeProfit", header: "TP", size: 80 },
      { accessorKey: "rr", header: "RR", size: 80 },
      { accessorKey: "quantity", header: "Qty", size: 80 },
      { accessorKey: "exitPrice", header: "Exit", size: 80 },
      { accessorKey: "pnl", header: "PnL", size: 80 },
      { accessorKey: "realizedRR", header: "Realized RR", size: 80 },
      { accessorKey: "strategy", header: "Strategy", size: 240 },
      { accessorKey: "note", header: "Notes", size: 240 },
      { accessorKey: "entryTime", header: "Entry Date", size: 150 },
      { accessorKey: "exitTime", header: "Exit Date", size: 150 },
    ],
    []
  );

  // Create a reusable header component
  const HeaderComponent = useCallback(
    ({ column, header, size }: { column: Column<TradeRecord, unknown>; header: string; size: number }) => {
      const isSorted = column.getIsSorted();
      const isSortedAsc = isSorted === "asc";
      const isSortedDesc = isSorted === "desc";

      return (
        <div style={{ width: size }}>
          <Button
            variant="ghost"
            className="!p-0 w-full flex text-left justify-start"
            onClick={() => {
              if (isSortedDesc) {
                column.clearSorting();
              } else {
                column.toggleSorting(isSortedAsc);
              }
            }}
          >
            {header}
            {isSorted && (
              <span className="ml-1">
                {isSortedAsc ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
              </span>
            )}
          </Button>
        </div>
      );
    },
    []
  );

  // Generate columns with the EditableCell component
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<TradeRecord>();

    // Create columns from column definitions
    const dataColumns = columnDefinitions.map((col) =>
      columnHelper.accessor(col.accessorKey, {
        header: ({ column }) => <HeaderComponent column={column} header={col.header} size={col.size} />,
        cell: (props) => {
          const isTextColumn = col.accessorKey === "strategy" || col.accessorKey === "note";
          return (
            <div style={{ width: col.size }} className={`${isTextColumn ? "whitespace-normal" : "overflow-hidden"}`}>
              <EditableCell {...props} />
            </div>
          );
        },
      })
    );

    // Add action column with delete button
    const actionColumn = columnHelper.display({
      id: "actions",
      header: () => <div style={{ width: 50 }}>Actions</div>,
      cell: (props) => (
        <div className="flex justify-center" data-cell-type="action">
          <DeleteButton trade={props.row.original} />
        </div>
      ),
    });

    // Return all columns with action column at the end
    return [...dataColumns, actionColumn];
  }, [columnDefinitions, HeaderComponent]);

  // Create table instance
  const table = useReactTable({
    data: trades,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isEmpty = !isLoading && trades.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Trade History</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refreshTrades()} disabled={isLoading}>
            Refresh
          </Button>
          <TradeForm />
        </div>
      </div>
      {isEmpty ? (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="py-8 text-center text-gray-500">No trades recorded yet.</div>
        </div>
      ) : (
        <>
          <div className="relative border rounded-md">
            <TableLoadingMask isLoading={isLoading} />
            <Table>
              <TableHeader table={table} />
              <TableBody table={table} />
            </Table>
          </div>
          <PaginationControls table={table} pageSizeOptions={PAGE_SIZE_OPTIONS} />
        </>
      )}
    </div>
  );
};

export default React.memo(TradeTable);
