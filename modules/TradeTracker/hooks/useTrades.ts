import { useTradeStore } from "../store";

/**
 * Custom hook for working with trade data
 * Provides access to trade operations and fetches trades if needed
 */
export const useTrades = () => {
  const {
    trades,
    isLoading,
    error,
    fetchTrades,
    addTrade,
    bulkAddTrades,
    updateTrade,
    deleteTrade,
    bulkDeleteTrades,
    getTradeStats,
  } = useTradeStore();

  // Get current trade statistics
  const stats = getTradeStats();

  return {
    trades,
    isLoading,
    error,
    stats,
    addTrade,
    bulkAddTrades,
    updateTrade,
    deleteTrade,
    bulkDeleteTrades,
    refreshTrades: fetchTrades,
  };
};
