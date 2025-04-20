import { create } from "zustand";
import { mockTradeRecords } from "@/modules/TradeTracker/mockData";
import { TradeRecord } from "../components/TradeTable/types";
import { API_ENDPOINTS, DEFAULT_FORM_VALUES } from "../constants";
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
  isLoading: false,
  error: null,

  formData: { ...DEFAULT_FORM_VALUES },
  isSubmitting: false,
  formError: null,
  showForm: false,
  validationErrors: {},

  // Trade data actions
  fetchTrades: async () => {
    set({ trades: mockTradeRecords });
  },

  addTrade: async (trade) => {
    set((state) => ({ trades: [...state.trades, trade] }));
  },

  bulkAddTrades: async (trades) => {
    if (trades.length === 0) return;

    set({ isLoading: true, error: null });

    try {
      // Optimistic update
      set((state) => ({
        trades: [...state.trades, ...trades],
      }));

      // Skip API call in development with mock data
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

      // Real API call - if your API supports bulk operations
      const response = await fetch(`${API_ENDPOINTS.TRADES}/bulk-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk add trades: ${response.status} ${response.statusText}`);
      }

      // Update with server response if needed
      const savedTrades = await response.json();
      if (Array.isArray(savedTrades)) {
        // Create a map of id -> savedTrade for efficient lookup
        const savedTradesMap = savedTrades.reduce((map, trade) => {
          map[trade.id] = trade;
          return map;
        }, {});

        // Update trades with server data
        set((state) => ({
          trades: state.trades.map((t) => (savedTradesMap[t.id] ? savedTradesMap[t.id] : t)),
        }));
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
    // Optimistic update
    set((state) => ({
      trades: state.trades.map((t) => (t.id === trade.id ? trade : t)),
    }));

    // Skip API call in development with mock data
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.TRADES}/${trade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trade),
      });

      if (!response.ok) {
        throw new Error(`Failed to update trade: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating trade:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update trade" });
      // We could revert the optimistic update here if needed
    }
  },

  deleteTrade: async (id) => {
    set({ isLoading: true, error: null });

    try {
      // Optimistic update
      set((state) => ({
        trades: state.trades.filter((t) => t.id !== id),
      }));

      // Skip API call in development with mock data
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

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
        trades: state.trades.filter((t) => !ids.includes(t.id)),
      }));

      // Skip API call in development with mock data
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

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
    set({ formData: data });
  },

  updateFormField: (field, value) => {
    set((state) => {
      // Create a new validation errors object without the current field's error
      const newValidationErrors = { ...state.validationErrors };
      if (newValidationErrors[field]) {
        delete newValidationErrors[field];
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
      formData: { ...DEFAULT_FORM_VALUES },
      formError: null,
      validationErrors: {},
    });
  },

  toggleForm: () => {
    set((state) => ({ showForm: !state.showForm }));
  },

  setValidationErrors: (errors) => {
    set({ validationErrors: errors });
  },

  submitForm: async () => {
    set({ isSubmitting: true, formError: null });

    try {
      const { formData } = get();

      // Validate required fields
      if (!formData.symbol || !formData.entryPrice || !formData.stopLoss || !formData.takeProfit) {
        throw new Error("Please fill in all required fields");
      }

      // Create trade record with proper type conversion
      const newTrade = createTradeRecord({
        ...formData,
        entryPrice: Number(formData.entryPrice),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        riskAmount: formData.riskAmount ? Number(formData.riskAmount) : undefined,
        leverage: formData.leverage ? Number(formData.leverage) : undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        rr: formData.rr ? Number(formData.rr) : undefined,
        positionSize: formData.positionSize ? Number(formData.positionSize) : undefined,
      });

      // Add trade
      await get().addTrade(newTrade);

      // Reset form on success and close the form
      set({
        formData: { ...DEFAULT_FORM_VALUES },
        formError: null,
        validationErrors: {},
        showForm: false, // Close the form after successful submission
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
