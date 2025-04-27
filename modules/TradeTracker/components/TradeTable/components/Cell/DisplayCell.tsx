import { memo, useMemo, useState } from "react";
import { DisplayCellProps } from "../../types";
import { formatCurrency, formatDate } from "@/modules/TradeTracker/utils";
import DetailModal from "./DetailModal";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { TradeRecord } from "../../types";

/**
 * Optimized DisplayCell component for rendering cell values
 * Uses memoization to prevent unnecessary re-renders
 */
const DisplayCell = ({ value, columnId, isEditable, onEdit, row }: DisplayCellProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Format cell value based on column type
  const formattedValue = useMemo((): React.ReactNode => {
    if (value === null || value === undefined) return "-";

    switch (columnId) {
      case "symbol":
        return value;
      case "side":
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              value === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value.toUpperCase()}
          </span>
        );
      case "riskAmount":
        return `$${value}`;
      case "entryPrice":
      case "stopLoss":
      case "takeProfit":
      case "exitPrice":
      case "quantity":
        // Format numbers with appropriate decimal places
        return value === 0
          ? 0.0
          : value < 0.01
          ? value.toFixed(6)
          : value < 1
          ? value.toFixed(4)
          : value < 1000
          ? value.toFixed(2)
          : value.toFixed(0);
      case "pnl":
        return (
          <span
            className={`text-sm font-medium ${
              value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-500"
            }`}
          >
            {formatCurrency(value)}
          </span>
        );
      case "rr":
      case "realizedRR":
        return value.toFixed(2);
      case "entryTime":
      case "exitTime":
        return formatDate(value, true);
      case "strategy":
      case "note":
        if (!value) return "-";

        // For strategy and note fields, show a preview with view more option
        const maxLength = 30;
        const displayText =
          typeof value === "string" && value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

        return (
          <div
            className="flex items-center w-full gap-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailModal(true);
            }}
          >
            <span className="truncate max-w-[150px]">{displayText}</span>
            {typeof value === "string" && value.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 ml-1 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
              >
                <EyeIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      default:
        return value;
    }
  }, [value, columnId, setShowDetailModal]);

  // Determine if this cell should trigger edit on hover
  const shouldEditOnHover = columnId === "side";

  return (
    <>
      <div
        className={`text-sm text-gray-900 p-1 rounded group transition-colors duration-150 ${
          isEditable ? "cursor-pointer hover:bg-gray-100 hover:border-dashed hover:border-gray-400" : ""
        }`}
        onClick={isEditable ? onEdit : undefined}
        onMouseOver={shouldEditOnHover && isEditable ? onEdit : undefined}
        title={isEditable ? "Click to edit" : ""}
      >
        <span className="flex items-center">
          {formattedValue}
          {isEditable && columnId !== "strategy" && columnId !== "note" && (
            <span className="ml-1 text-xs text-gray-400 transition-opacity duration-150 opacity-0 group-hover:opacity-100">
              ✎
            </span>
          )}
        </span>
      </div>

      {/* Detail modal for strategy and note fields */}
      {(columnId === "strategy" || columnId === "note") && row && (
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          trade={row as TradeRecord}
          fieldType={columnId as "strategy" | "note"}
        />
      )}
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DisplayCell);
