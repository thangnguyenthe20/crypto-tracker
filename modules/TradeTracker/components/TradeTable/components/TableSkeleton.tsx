import React from "react";
import { TableRow, TableBody as TableBodyLib, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rowCount = 5, columnCount = 10 }) => {
  return (
    <TableBodyLib>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Skeleton className="w-full h-6" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBodyLib>
  );
};
