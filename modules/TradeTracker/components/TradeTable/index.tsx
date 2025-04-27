"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { PaginationControls } from "./components/PaginationControls";
import { ColumnDefinition } from "./types";
import { PAGE_SIZE_OPTIONS } from "../../constants";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTrades } from "../../hooks";
import { TradeForm } from "../TradeForm";
import { TableLoadingMask } from "./components/TableLoadingMask";
import { getTableColumns } from "./utils";

/**
 * TradeTable component displays a table of trade records with sorting, pagination,
 * and inline editing capabilities.
 */
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

  // Generate columns with the EditableCell component
  const columns = useMemo(() => {
    return getTableColumns(columnDefinitions);
  }, [columnDefinitions]);

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

  // Render empty state when no trades are available
  const renderEmptyState = useCallback(
    () => (
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <div className="py-8 text-center text-gray-500">No trades recorded yet.</div>
      </div>
    ),
    []
  );

  // Render table with data
  const renderTable = useCallback(
    () => (
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
    ),
    [isLoading, table]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Trade History</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshTrades} disabled={isLoading}>
            Refresh
          </Button>
          <TradeForm />
        </div>
      </div>
      {isEmpty ? renderEmptyState() : renderTable()}
    </div>
  );
};

export default React.memo(TradeTable);
