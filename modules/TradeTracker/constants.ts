/**
 * Constants used throughout the application
 */

// Form field options
export const TIMEFRAME_OPTIONS = [
  { value: "M1", label: "M1" },
  { value: "M5", label: "M5" },
  { value: "M15", label: "M15" },
  { value: "M30", label: "M30" },
  { value: "H1", label: "H1" },
  { value: "H4", label: "H4" },
  { value: "D1", label: "D1" },
];

export const SIDE_OPTIONS = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

// Table configuration
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export const NON_EDITABLE_COLUMNS = ["_id", "rr", "realizedRR", "pnl", "actions"];

export const NUMBER_FIELDS = [
  "entryPrice",
  "stopLoss",
  "takeProfit",
  "exitPrice",
  "quantity",
  "leverage",
  "riskAmount",
  "fee",
];

export const PRICE_FIELDS = ["entryPrice", "stopLoss", "takeProfit", "exitPrice", "quantity"];

// Default values
export const DEFAULT_FORM_VALUES = {
  side: "buy",
  timeframe: "M30",
};

// API endpoints
// Using Next.js API routes as proxy to avoid CORS issues
export const API_ENDPOINTS = {
  TRADES: "/api/trades",
};
