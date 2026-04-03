import { NextResponse } from "next/server";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getSalesCount } from "@/actions/get-sales-count";
import { getStockCount } from "@/actions/get-stock-count";

export async function POST(req: Request) {
  const body = await req.json();

  const revenue = await getTotalRevenue(
    body.storeId,
    body.startDate,
    body.endDate
  );

  const sales = await getSalesCount(
    body.storeId,
    body.startDate,
    body.endDate
  );

  const stocks = await getStockCount(body.storeId);

  return NextResponse.json({
    revenue,
    sales,
    stocks,
  });
}