import { create } from "zustand";
import { TradeRecord } from "../components/TradeTable/types";
import { API_ENDPOINTS, DEFAULT_FORM_VALUES, getDefaultFormValues } from "../constants";
import { createTradeRecord } from "../utils";

// Define the trade store state interface
interface TradeState {
  // Data
  trades: TradeRecord[];
  isLoading: boolean;
  error: string | null;

  // Form state
  formData: Partial<TradeRecord>;
  isSubmitting: boolean;
  formError: string | null;
  showForm: boolean;
  isEditMode: boolean;
  editingTradeId: string | null;
  validationErrors: Record<string, string>;

  // Actions - Trade data
  fetchTrades: () => Promise<void>;
  addTrade: (trade: TradeRecord) => Promise<void>;
  bulkAddTrades: (trades: TradeRecord[]) => Promise<void>;
  updateTrade: (trade: TradeRecord) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  bulkDeleteTrades: (ids: string[]) => Promise<void>;

  // Actions - Form
  setFormData: (data: Partial<TradeRecord>) => void;
  updateFormField: (field: string, value: any) => void;
  resetForm: () => void;
  toggleForm: () => void;
  openEditForm: (trade: TradeRecord) => void;
  submitForm: () => Promise<void>;
  setValidationErrors: (errors: Record<string, string>) => void;

  // Computed values
  getTradeStats: () => {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    averageRR: number;
    averageRealizedRR: number;
    profitFactor: number;
  };
}

export const useTradeStore = create<TradeState>((set, get) => ({
  // Initial state
  trades: [],
  isLoading: true,
  error: null,

  formData: getDefaultFormValues(),
  isSubmitting: false,
  formError: null,
  showForm: false,
  isEditMode: false,
  editingTradeId: null,
  validationErrors: {},

  // Trade data actions
  fetchTrades: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use real API
      const response = await fetch(API_ENDPOINTS.TRADES);

      if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Map backend data to frontend format
      const mappedTrades = data.map((trade: any) => ({
        _id: trade._id,
        symbol: trade.symbol,
        timeframe: trade.timeframe,
        side: trade.side as "buy" | "sell",
        riskAmount: trade.riskAmount,
        leverage: trade.leverage,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        rr: trade.rr,
        quantity: trade.quantity,
        positionSize: trade.positionSize,
        strategy: trade.strategy || "",
        exitPrice: trade.exitPrice || 0,
        pnl: trade.pnl || 0,
        realizedRR: trade.realizedRR || 0,
        fee: trade.fee || 0,
        note: trade.note || "",
        entryTime: trade.entryTime,
        exitTime: trade.exitTime || "",
      }));

      set({ trades: mappedTrades });
    } catch (error) {
      console.error("Error fetching trades:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch trades" });
    } finally {
      set({ isLoading: false });
    }
  },

  addTrade: async (trade) => {
    set({ isLoading: true, error: null });

    try {
      // Prepare data for backend
      const tradeData = {
        symbol: trade.symbol,
        timeframe: trade.timeframe,
        side: trade.side as "buy" | "sell",
        riskAmount: trade.riskAmount,
        leverage: trade.leverage,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        rr: trade.rr,
        quantity: trade.quantity,
        positionSize: trade.positionSize,
        strategy: trade.strategy,
        exitPrice: trade.exitPrice,
        pnl: trade.pnl,
        realizedRR: trade.realizedRR,
        fee: trade.fee,
        note: trade.note,
        entryTime: trade.entryTime,
        exitTime: trade.exitTime,
      };

      // Optimistic update
      set((state) => ({ trades: [...state.trades, trade] }));

      // Real API call
      const response = await fetch(API_ENDPOINTS.TRADES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add trade: ${response.status} ${response.statusText}`);
      }

      // Get the created trade with MongoDB _id
      const createdTrade = await response.json();

      // Replace the temporary trade with the one from the server
      set((state) => ({
        trades: state.trades.map((t) =>
          // Since we don't have a temporary ID anymore, we need to match based on other properties
          t.symbol === trade.symbol && t.entryPrice === trade.entryPrice && t.entryTime === trade.entryTime && !t._id
            ? { ...createdTrade }
            : t
        ),
      }));
    } catch (error) {
      console.error("Error adding trade:", error);
      set({ error: error instanceof Error ? error.message : "Failed to add trade" });
    } finally {
      set({ isLoading: false });
    }
  },

  bulkAddTrades: async (trades) => {
    if (trades.length === 0) return;

    set({ isLoading: true, error: null });

    try {
      // Prepare data for backend
      const tradesData = trades.map((trade) => ({
        symbol: trade.symbol,
        timeframe: trade.timeframe,
        side: trade.side as "buy" | "sell",
        riskAmount: trade.riskAmount,
        leverage: trade.leverage,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        rr: trade.rr,
        quantity: trade.quantity,
        positionSize: trade.positionSize,
        strategy: trade.strategy,
        exitPrice: trade.exitPrice,
        pnl: trade.pnl,
        realizedRR: trade.realizedRR,
        fee: trade.fee,
        note: trade.note,
        entryTime: trade.entryTime,
        exitTime: trade.exitTime,
      }));

      // Optimistic update
      set((state) => ({
        trades: [...state.trades, ...trades],
      }));

      // Real API call - if your API supports bulk operations
      const response = await fetch(`${API_ENDPOINTS.TRADES}/bulk-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades: tradesData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk add trades: ${response.status} ${response.statusText}`);
      }

      // Simply replace the trades with the ones from the server
      const savedTrades = await response.json();
      if (Array.isArray(savedTrades)) {
        // Get the current trades that are not part of this bulk operation
        const existingTrades = get().trades.filter(
          (t) =>
            // Keep trades that have _id and are not in the new batch
            t._id &&
            !trades.some(
              (newTrade) =>
                newTrade.symbol === t.symbol &&
                newTrade.entryPrice === t.entryPrice &&
                newTrade.entryTime === t.entryTime
            )
        );

        // Add the new trades from the server
        set({
          trades: [...existingTrades, ...savedTrades],
        });
      }
    } catch (error) {
      console.error("Error bulk adding trades:", error);
      set({ error: error instanceof Error ? error.message : "Failed to bulk add trades" });
      // We keep the optimistic update even on error
    } finally {
      set({ isLoading: false });
    }
  },

  updateTrade: async (trade) => {
    set({ isLoading: true, error: null });

    // Prepare data for backend
    const tradeData = {
      symbol: trade.symbol,
      timeframe: trade.timeframe,
      side: trade.side as "buy" | "sell",
      riskAmount: trade.riskAmount,
      leverage: trade.leverage,
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      rr: trade.rr,
      quantity: trade.quantity,
      positionSize: trade.positionSize,
      strategy: trade.strategy,
      exitPrice: trade.exitPrice,
      pnl: trade.pnl,
      realizedRR: trade.realizedRR,
      fee: trade.fee,
      note: trade.note,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
    };

    // Optimistic update
    set((state) => ({
      trades: state.trades.map((t) => (t._id === trade._id ? trade : t)),
    }));

    try {
      const response = await fetch(`${API_ENDPOINTS.TRADES}/${trade._id}`, {
        method: "PATCH", // NestJS uses PATCH for updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update trade: ${response.status} ${response.statusText}`);
      }

      // Get the updated trade
      const updatedTrade = await response.json();

      // Update with server data
      set((state) => ({
        trades: state.trades.map((t) =>
          t._id === trade._id
            ? {
                ...t,
                ...updatedTrade,
                _id: updatedTrade._id, // Ensure ID mapping
              }
            : t
        ),
      }));
    } catch (error) {
      console.error("Error updating trade:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update trade" });
      // We could revert the optimistic update here if needed
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTrade: async (id) => {
    set({ isLoading: true, error: null });

    try {
      // Optimistic update
      set((state) => ({
        trades: state.trades.filter((t) => t._id !== id),
      }));

      // Real API call
      const response = await fetch(`${API_ENDPOINTS.TRADES}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete trade: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete trade" });
      // Revert the optimistic update
      get().fetchTrades();
    } finally {
      set({ isLoading: false });
    }
  },

  bulkDeleteTrades: async (ids) => {
    if (ids.length === 0) return;

    set({ isLoading: true, error: null });

    try {
      // Optimistic update
      set((state) => ({
        trades: state.trades.filter((t) => !ids.includes(t._id)),
      }));

      // Real API call
      const response = await fetch(`${API_ENDPOINTS.TRADES}/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk delete trades: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error bulk deleting trades:", error);
      set({ error: error instanceof Error ? error.message : "Failed to bulk delete trades" });
      // Revert the optimistic update
      get().fetchTrades();
    } finally {
      set({ isLoading: false });
    }
  },

  // Form actions
  setFormData: (data) => {
    // Ensure side is properly typed if present
    if (data.side && typeof data.side === "string") {
      const typedData = {
        ...data,
        side: data.side === "buy" || data.side === "sell" ? (data.side as "buy" | "sell") : "buy",
      };
      set({ formData: typedData });
    } else {
      set({ formData: data });
    }
  },

  updateFormField: (field, value) => {
    set((state) => {
      // Create a new validation errors object without the current field's error
      const newValidationErrors = { ...state.validationErrors };
      if (newValidationErrors[field]) {
        delete newValidationErrors[field];
      }

      // Special handling for the side field to ensure it's properly typed
      if (field === "side" && (value === "buy" || value === "sell")) {
        return {
          formData: { ...state.formData, [field]: value as "buy" | "sell" },
          formError: null, // Clear error when user makes changes
          validationErrors: newValidationErrors,
        };
      }

      return {
        formData: { ...state.formData, [field]: value },
        formError: null, // Clear error when user makes changes
        validationErrors: newValidationErrors,
      };
    });
  },

  resetForm: () => {
    set({
      formData: getDefaultFormValues(),
      formError: null,
      validationErrors: {},
      isEditMode: false,
      editingTradeId: null,
    });
  },

  toggleForm: () => {
    set((state) => ({ showForm: !state.showForm }));
  },

  openEditForm: (trade) => {
    // Make sure all numeric values are properly converted to numbers
    const formattedTrade = {
      ...trade,
      side: trade.side as "buy" | "sell",
      entryPrice: Number(trade.entryPrice),
      stopLoss: Number(trade.stopLoss),
      takeProfit: Number(trade.takeProfit),
      riskAmount: Number(trade.riskAmount),
      quantity: Number(trade.quantity),
      rr: Number(trade.rr),
      positionSize: Number(trade.positionSize),
      exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
      pnl: trade.pnl ? Number(trade.pnl) : undefined,
      realizedRR: trade.realizedRR ? Number(trade.realizedRR) : undefined,
    };

    console.log("Opening edit form with trade data:", formattedTrade);

    set({
      formData: formattedTrade,
      showForm: true,
      isEditMode: true,
      editingTradeId: trade._id || null,
      formError: null,
      validationErrors: {},
    });
  },

  setValidationErrors: (errors) => {
    set({ validationErrors: errors });
  },

  submitForm: async () => {
    set({ isSubmitting: true, formError: null });

    try {
      const { formData, isEditMode, editingTradeId } = get();

      // Validate required fields
      if (!formData.symbol || !formData.entryPrice || !formData.stopLoss || !formData.takeProfit) {
        throw new Error("Please fill in all required fields");
      }

      // Convert form data to proper types
      const tradeData = {
        ...formData,
        side: formData.side as "buy" | "sell",
        entryPrice: Number(formData.entryPrice),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        riskAmount: formData.riskAmount ? Number(formData.riskAmount) : undefined,
        leverage: formData.leverage ? Number(formData.leverage) : undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        rr: formData.rr ? Number(formData.rr) : undefined,
        positionSize: formData.positionSize ? Number(formData.positionSize) : undefined,
      };

      if (isEditMode && editingTradeId) {
        // Update existing trade
        const updatedTrade = {
          ...tradeData,
          _id: editingTradeId,
        } as TradeRecord;

        await get().updateTrade(updatedTrade);
      } else {
        // Add new trade
        const newTrade = createTradeRecord(tradeData);
        await get().addTrade(newTrade);
      }

      // Reset form on success and close the form
      set({
        formData: getDefaultFormValues(),
        formError: null,
        validationErrors: {},
        showForm: false, // Close the form after successful submission
        isEditMode: false,
        editingTradeId: null,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      set({ formError: error instanceof Error ? error.message : "Failed to submit trade" });
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Computed values
  getTradeStats: () => {
    const { trades } = get();

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageRR: 0,
        averageRealizedRR: 0,
        profitFactor: 0,
      };
    }

    const winningTrades = trades.filter((trade) => trade.pnl > 0);
    const losingTrades = trades.filter((trade) => trade.pnl < 0);

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));

    const averageRR = trades.reduce((sum, trade) => sum + trade.rr, 0) / trades.length;
    const averageRealizedRR = trades.reduce((sum, trade) => sum + trade.realizedRR, 0) / trades.length;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat(((winningTrades.length / trades.length) * 100).toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      averageRR: parseFloat(averageRR.toFixed(2)),
      averageRealizedRR: parseFloat(averageRealizedRR.toFixed(2)),
      profitFactor: totalLoss === 0 ? Infinity : parseFloat((totalProfit / totalLoss).toFixed(2)),
    };
  },
}));
