import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { ColumnHeaderProps } from "../../types";

/**
 * ColumnHeader component for displaying sortable column headers
 * Handles sorting state and displays appropriate icons
 */
const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, header, size }) => {
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
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ColumnHeader);
