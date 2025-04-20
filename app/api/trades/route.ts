import { NextResponse } from "next/server";
import { mockTradeRecords } from "../../../modules/TradeTracker/mockData";
import { TradeRecord } from "../../tracker/types";

export async function GET() {
  return NextResponse.json(mockTradeRecords);
}

export async function POST(request: Request) {
  try {
    const newTrade: TradeRecord = await request.json();

    // In a real application, you would save this to a database
    // For now, we'll just validate the data and return it

    // Validate required fields
    const requiredFields = ["id", "symbol", "timeframe", "side", "entryPrice", "stopLoss", "takeProfit", "entryTime"];

    for (const field of requiredFields) {
      if (!(field in newTrade)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Trade record created successfully", trade: newTrade }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid trade record data" }, { status: 400 });
  }
}
