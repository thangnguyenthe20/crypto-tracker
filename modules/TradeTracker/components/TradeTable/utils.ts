// Calculate risk-reward ratio
export const calculateRR = (entryPrice: number, stopLoss: number, takeProfit: number): number => {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return risk === 0 ? 0 : parseFloat((reward / risk).toFixed(2));
};

// Calculate realized risk-reward ratio
export const calculateRealizedRR = (entryPrice: number, stopLoss: number, exitPrice: number): number => {
  const risk = Math.abs(entryPrice - stopLoss);
  const realizedReward = Math.abs(exitPrice - entryPrice);
  return risk === 0 ? 0 : parseFloat((realizedReward / risk).toFixed(2));
};

// Calculate profit/loss
export const calculatePnL = (
  side: "buy" | "sell",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fee: number = 0
): number => {
  const rawPnL = side === "buy" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
  return parseFloat((rawPnL - fee).toFixed(2));
};
