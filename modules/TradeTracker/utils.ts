// ===== Calculation Utilities =====

import { TradeRecord } from "./components/TradeTable/types";

/**
 * Calculate the risk-reward ratio based on entry, stop loss, and take profit prices
 */
export const calculateRR = (entryPrice: number, stopLoss: number, takeProfit: number): number => {
  // Check for undefined, null, NaN or zero values
  if (!entryPrice || !stopLoss || !takeProfit || isNaN(entryPrice) || isNaN(stopLoss) || isNaN(takeProfit)) {
    return 0;
  }

  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);

  // Avoid division by zero
  return risk === 0 ? 0 : parseFloat((reward / risk).toFixed(2));
};

/**
 * Calculate the realized risk-reward ratio based on entry, exit, and stop loss prices
 */
export const calculateRealizedRR = (entryPrice: number, exitPrice: number, stopLoss: number): number => {
  if (!entryPrice || !exitPrice || !stopLoss) return 0;

  const risk = Math.abs(entryPrice - stopLoss);
  const realizedReward = Math.abs(exitPrice - entryPrice);

  return risk === 0 ? 0 : parseFloat((realizedReward / risk).toFixed(2));
};

/**
 * Calculate the profit/loss amount
 */
export const calculatePnL = (
  side: "buy" | "sell",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fee: number = 0
): number => {
  if (!entryPrice || !exitPrice || !quantity) return 0;

  const rawPnL = side === "buy" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;

  return parseFloat((rawPnL - fee).toFixed(2));
};

/**
 * Calculate position size based on risk amount and stop loss
 */
export const calculatePositionSize = (
  riskAmount: number,
  entryPrice: number,
  stopLoss: number,
  leverage: number = 1
): number => {
  // Check for undefined, null, NaN or zero values
  if (
    !riskAmount ||
    !entryPrice ||
    !stopLoss ||
    !leverage ||
    isNaN(riskAmount) ||
    isNaN(entryPrice) ||
    isNaN(stopLoss) ||
    isNaN(leverage)
  ) {
    return 0;
  }

  const riskPercentage = Math.abs((entryPrice - stopLoss) / entryPrice);

  // Avoid division by zero
  if (riskPercentage === 0) return 0;

  const positionSize = (riskAmount / riskPercentage) * leverage;

  return parseFloat(positionSize.toFixed(4));
};

/**
 * Calculate quantity based on position size and entry price
 */
export const calculateQuantity = (positionSize: number, entryPrice: number): number => {
  // Check for undefined, null, NaN or zero values
  if (!positionSize || !entryPrice || isNaN(positionSize) || isNaN(entryPrice)) {
    return 0;
  }

  // Avoid division by zero
  if (entryPrice === 0) return 0;

  return parseFloat((positionSize / entryPrice).toFixed(6));
};

// ===== Formatting Utilities =====

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Parses a form field value to the appropriate type
 */
export const parseFormValue = (name: string, value: string): string | number => {
  if (name.match(/Price|Loss|Profit|Amount|rr|quantity|leverage|pnl|realizedRR|fee/)) {
    return value === "" ? "" : parseFloat(value);
  }
  return value;
};

// ===== Trade Data Utilities =====

/**
 * Get summary statistics for a collection of trades
 */
export const getTradeStats = (trades: TradeRecord[]) => {
  if (!trades.length) {
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
};

/**
 * Generates a unique ID for a trade
 * Uses a more robust ID generation with timestamp for better uniqueness
 */
export const generateTradeId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 5);
  return `tx-${timestamp}-${randomStr}`;
};

/**
 * Creates a new trade record from form data
 */
export const createTradeRecord = (formData: Partial<TradeRecord>): TradeRecord => {
  const id = generateTradeId();

  // Calculate risk-reward ratio if not provided
  const rr =
    formData.rr !== undefined
      ? formData.rr
      : calculateRR(formData.entryPrice || 0, formData.stopLoss || 0, formData.takeProfit || 0);

  // Calculate position size and quantity if not provided
  let positionSize = formData.positionSize;
  let quantity = formData.quantity;

  if (!positionSize && formData.riskAmount && formData.entryPrice && formData.stopLoss) {
    positionSize = calculatePositionSize(
      formData.riskAmount,
      formData.entryPrice,
      formData.stopLoss,
      formData.leverage || 1
    );
  }

  if (!quantity && positionSize && formData.entryPrice) {
    quantity = calculateQuantity(positionSize, formData.entryPrice);
  }

  const newTrade: TradeRecord = {
    id,
    symbol: formData.symbol || "",
    timeframe: formData.timeframe || "M30",
    side: formData.side || "buy",
    riskAmount: formData.riskAmount || 0,
    leverage: formData.leverage || 1,
    entryPrice: formData.entryPrice || 0,
    stopLoss: formData.stopLoss || 0,
    takeProfit: formData.takeProfit || 0,
    rr,
    quantity: quantity || 0,
    positionSize: positionSize || 0,
    strategy: formData.strategy || "",
    exitPrice: formData.exitPrice || 0,
    pnl: formData.pnl || 0,
    realizedRR: formData.realizedRR || 0,
    fee: formData.fee || 0,
    note: formData.note || "",
    entryTime: formData.entryTime || new Date().toISOString(),
    exitTime: formData.exitTime || "",
  };

  return newTrade;
};
