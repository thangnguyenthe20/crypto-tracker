"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/modules/TradeTracker/utils";
import { TradeRecord } from "../../types";
import { useTrades } from "@/modules/TradeTracker/hooks";
import { Pencil, Save, X } from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: TradeRecord | null;
  fieldType: "strategy" | "note" | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, trade, fieldType }) => {
  const { updateTrade } = useTrades();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Reset state when modal opens or trade/fieldType changes
  useEffect(() => {
    if (trade && fieldType) {
      setEditedContent(trade[fieldType] || "");
      setIsEditing(false);
    }
  }, [trade, fieldType, isOpen]);

  if (!trade || !fieldType) return null;

  const content = trade[fieldType];
  const title = fieldType === "strategy" ? "Strategy Details" : "Trade Notes";

  const handleSave = () => {
    if (!trade._id) return;

    const updatedTrade = {
      ...trade,
      [fieldType]: editedContent,
    };

    updateTrade(updatedTrade);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(trade[fieldType] || "");
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant={trade.side === "buy" ? "success" : "destructive"} className="ml-2">
              {trade.side.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {trade.symbol} • {trade.timeframe} • {formatDate(trade.entryTime)}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {!isEditing ? (
            <>
              <div className="p-4 mt-2 border rounded-md bg-muted/30 min-h-[120px]" onClick={() => setIsEditing(true)}>
                {content ? (
                  <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                  <div className="italic text-muted-foreground">No {fieldType} information available</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute w-8 h-8 top-2 right-2 opacity-70 hover:opacity-100 bg-background/80"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="p-1 mt-2 border rounded-md bg-background">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder={`Enter ${fieldType} details here...`}
                className="min-h-[150px] resize-y border-0 focus-visible:ring-0 p-3"
              />
              <div className="flex justify-end gap-2 p-2 bg-muted/10">
                <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 gap-1">
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={handleSave} className="h-8 gap-1">
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Additional trade information */}
        <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">Entry Price</div>
            <div className="font-medium">{trade.entryPrice}</div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">Stop Loss</div>
            <div className="font-medium">{trade.stopLoss}</div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">Take Profit</div>
            <div className="font-medium">{trade.takeProfit}</div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">Risk/Reward</div>
            <div className="font-medium">{trade.rr?.toFixed(2) || "-"}</div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">Risk Amount</div>
            <div className="font-medium">${trade.riskAmount || "-"}</div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="text-xs text-muted-foreground">PnL</div>
            <div
              className={`font-medium ${
                (trade.pnl || 0) > 0 ? "text-green-600" : (trade.pnl || 0) < 0 ? "text-red-600" : ""
              }`}
            >
              {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailModal;
