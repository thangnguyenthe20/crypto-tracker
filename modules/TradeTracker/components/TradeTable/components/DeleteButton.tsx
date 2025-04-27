"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrades } from "../../../hooks";
import { TradeRecord } from "../types";

interface DeleteButtonProps {
  trade: TradeRecord;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ trade }) => {
  const { deleteTrade } = useTrades();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!trade._id) return;

    if (confirm(`Are you sure you want to delete this trade for ${trade.symbol}?`)) {
      deleteTrade(trade._id);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
};
