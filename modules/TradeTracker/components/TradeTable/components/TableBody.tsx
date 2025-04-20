import React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableBodyProps } from "../types";
import { TableRow, TableBody as TableBodyLib, TableCell } from "@/components/ui/table";

export const TableBody: React.FC<TableBodyProps> = ({ table }) => {
  return (
    <TableBodyLib>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBodyLib>
  );
};
