"use client";

import TradeTable from "@/modules/TradeTracker/components/TradeTable";
import React, { useEffect } from "react";
import { useTradeStore } from "@/modules/TradeTracker/store";

const Page = () => {
  const { trades, fetchTrades } = useTradeStore();

  useEffect(() => {
    if (trades.length === 0) {
      fetchTrades();
    }
  }, [fetchTrades, trades.length]);

  return (
    <div className="container p-4 mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Crypto Trade Tracker</h1>
        </div>
        <TradeTable />
      </div>
    </div>
  );
};

export default Page;
