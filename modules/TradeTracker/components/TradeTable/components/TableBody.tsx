import React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableBodyProps } from "../types";
import { TableRow, TableBody as TableBodyLib, TableCell } from "@/components/ui/table";
import { useTradeStore } from "@/modules/TradeTracker/store";

export const TableBody: React.FC<TableBodyProps> = ({ table }) => {
  const { openEditForm } = useTradeStore();

  const handleRowClick = (row: any, event: React.MouseEvent) => {
    // Don't trigger edit if clicking on the actions cell
    const target = event.target as HTMLElement;
    const isActionCell = target.closest('[data-cell-type="action"]');

    if (!isActionCell) {
      openEditForm(row.original);
    }
  };

  return (
    <TableBodyLib>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} className="cursor-pointer hover:bg-muted/70" onClick={(e) => handleRowClick(row, e)}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBodyLib>
  );
};
