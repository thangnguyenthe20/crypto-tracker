import { Column, Table } from "@tanstack/react-table";

/**
 * Represents a trade record in the system
 */
export interface TradeRecord {
  _id?: string; // MongoDB ID
  symbol: string;
  timeframe: string;
  side: "buy" | "sell";
  riskAmount: number;
  leverage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  rr: number;
  quantity: number;
  positionSize: number;
  strategy: string;
  exitPrice: number;
  pnl: number;
  realizedRR: number;
  fee: number;
  note: string;
  entryTime: string;
  exitTime: string;
}

/**
 * Column definition type with size property
 */
export interface ColumnDefinition {
  accessorKey: keyof TradeRecord;
  header: string;
  size: number;
}

/**
 * Represents a cell being edited
 */
export interface EditingCell {
  id: string;
  column: string;
}

/**
 * Props for column header component
 */
export interface ColumnHeaderProps {
  column: Column<TradeRecord, unknown>;
  header: string;
  size: number;
}

/**
 * Props for cell input components
 */
export interface CellInputProps {
  value: any;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  columnId: string;
  className?: string;
}

/**
 * Props for table header component
 */
export interface TableHeaderProps {
  table: Table<TradeRecord>;
}

/**
 * Props for table body component
 */
export interface TableBodyProps {
  table: Table<TradeRecord>;
}

/**
 * Props for pagination controls component
 */
export interface PaginationControlsProps {
  table: Table<TradeRecord>;
  pageSizeOptions: number[];
}

/**
 * Props for edit modal component
 */
export interface EditModalProps {
  editingTrade: TradeRecord | null;
  closeEditForm: () => void;
}

/**
 * Props for action buttons component
 */
export interface ActionButtonsProps {
  row: {
    original: TradeRecord;
  };
}

/**
 * Props for display cell component
 */
export interface DisplayCellProps {
  value: any;
  columnId: string;
  isEditable: boolean;
  onEdit: () => void;
}
