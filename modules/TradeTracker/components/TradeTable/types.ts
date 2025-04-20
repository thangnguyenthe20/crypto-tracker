import { Table } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { SortingState } from "@tanstack/react-table";

export interface TradeRecord {
  id: string;
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
  strategy: string;
  exitPrice: number;
  pnl: number;
  realizedRR: number;
  fee: number;
  note: string;
  entryTime: string;
  exitTime: string;
}

export interface EditingCell {
  id: string;
  column: string;
}

export interface CellInputProps {
  value: any;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  columnId: string;
  className?: string;
}

export interface TradeTableHookProps {
  trades: TradeRecord[];
  updateTrade: (trade: TradeRecord) => void;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: Dispatch<
    SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  >;
  handleEdit: (trade: TradeRecord) => void;
  handleDelete: (tradeId: string) => void;
}

export interface TableHeaderProps {
  table: Table<TradeRecord>;
}

export interface TableBodyProps {
  table: Table<TradeRecord>;
}

export interface PaginationControlsProps {
  table: Table<TradeRecord>;
  pageSizeOptions: number[];
}

export interface EditModalProps {
  editingTrade: TradeRecord | null;
  closeEditForm: () => void;
}

export interface ActionButtonsProps {
  row: {
    original: TradeRecord;
  };
}

export interface DisplayCellProps {
  value: any;
  columnId: string;
  isEditable: boolean;
  onEdit: () => void;
}
