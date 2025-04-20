import React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableHeaderProps } from "../types";

import { TableHead, TableHeader as TableHeaderLib, TableRow } from "@/components/ui/table";

export const TableHeader: React.FC<TableHeaderProps> = ({ table }) => {
  return (
    <TableHeaderLib>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeaderLib>
  );
};
