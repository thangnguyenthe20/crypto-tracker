import { z } from "zod";

export const tradeFormSchema = z
  .object({
    symbol: z.string().min(1, { message: "Symbol is required" }),
    side: z.enum(["buy", "sell"], {
      required_error: "Side is required",
    }),
    timeframe: z.string().optional(),
    riskAmount: z.coerce
      .number({ invalid_type_error: "Risk amount must be a valid number" })
      .min(0, { message: "Risk amount must be positive" })
      .optional(),
    entryPrice: z.coerce
      .number({ invalid_type_error: "Entry price must be a valid number" })
      .min(0, { message: "Entry price is required" }),
    stopLoss: z.coerce
      .number({ invalid_type_error: "Stop loss must be a valid number" })
      .min(0, { message: "Stop loss is required" }),
    takeProfit: z.coerce
      .number({ invalid_type_error: "Take profit must be a valid number" })
      .min(0, { message: "Take profit is required" }),
    strategy: z.string().optional(),
    note: z.string().optional(),
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    // Calculated fields
    rr: z.number().optional(),
    positionSize: z.number().optional(),
    quantity: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.side === "buy") {
        return data.stopLoss < data.entryPrice;
      }
      return true;
    },
    {
      message: "For buy orders, stop loss must be below entry price",
      path: ["stopLoss"],
    }
  )
  .refine(
    (data) => {
      if (data.side === "buy") {
        return data.takeProfit > data.entryPrice;
      }
      return true;
    },
    {
      message: "For buy orders, take profit must be above entry price",
      path: ["takeProfit"],
    }
  )
  .refine(
    (data) => {
      if (data.side === "sell") {
        return data.stopLoss > data.entryPrice;
      }
      return true;
    },
    {
      message: "For sell orders, stop loss must be above entry price",
      path: ["stopLoss"],
    }
  )
  .refine(
    (data) => {
      if (data.side === "sell") {
        return data.takeProfit < data.entryPrice;
      }
      return true;
    },
    {
      message: "For sell orders, take profit must be below entry price",
      path: ["takeProfit"],
    }
  );

export type TradeFormValues = z.infer<typeof tradeFormSchema>;
