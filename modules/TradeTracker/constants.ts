/**
 * Constants used throughout the TradeTracker module
 */

/**
 * Form field options
 */
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

/**
 * Table configuration
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

// Columns that cannot be edited by the user
export const NON_EDITABLE_COLUMNS = ["_id", "rr", "realizedRR", "pnl", "actions"];

// Columns that are always in edit mode
export const ALWAYS_EDIT_COLUMNS = ["side", "timeframe", "entryTime", "exitTime"];

// Columns that contain numeric values
export const NUMBER_FIELDS = ["entryPrice", "stopLoss", "takeProfit", "exitPrice", "quantity", "riskAmount", "fee"];

// Columns that contain price values
export const PRICE_FIELDS = ["entryPrice", "stopLoss", "takeProfit", "exitPrice", "quantity"];

// Columns that contain date values
export const DATE_FIELDS = ["entryTime", "exitTime"];

// Columns that contain text values
export const TEXT_FIELDS = ["strategy", "note"];

// Columns that contain ratio values
export const RATIO_FIELDS = ["rr", "realizedRR"];

// Fields that trigger recalculation of risk-reward ratio
export const RR_RECALC_FIELDS = ["entryPrice", "stopLoss", "takeProfit"];

// Fields that trigger recalculation of PnL
export const PNL_RECALC_FIELDS = ["entryPrice", "exitPrice", "quantity", "side", "fee"];

/**
 * Default values
 */
export const DEFAULT_FORM_VALUES = {
  side: "buy",
  timeframe: "M30",
};

/**
 * Get a complete set of default form values
 * @param overrides - Optional values to override defaults
 * @returns Complete form values with defaults applied
 */
export const getDefaultFormValues = (overrides: Record<string, any> = {}) => ({
  // Default values
  symbol: "",
  side: DEFAULT_FORM_VALUES.side,
  timeframe: DEFAULT_FORM_VALUES.timeframe,
  entryTime: new Date().toISOString(),
  exitTime: "",

  // Numeric fields
  riskAmount: undefined,
  entryPrice: undefined,
  stopLoss: undefined,
  takeProfit: undefined,
  exitPrice: undefined,
  leverage: undefined,
  fee: undefined,

  // Calculated fields
  rr: 0,
  positionSize: 0,
  quantity: 0,
  pnl: undefined,
  realizedRR: undefined,

  // Text fields
  strategy: "",
  note: "",

  // Apply any overrides
  ...overrides,
});

/**
 * API endpoints
 * Using Next.js API routes as proxy to avoid CORS issues
 */
export const API_ENDPOINTS = {
  TRADES: "/api/trades",
};
