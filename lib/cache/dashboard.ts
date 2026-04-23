import { cache } from "react";
import { getSalesCount } from "@/actions/get-sales-count";
import { getStockCount } from "@/actions/get-stock-count";
import { getTotalRevenue } from "@/actions/get-total-revenue";

export type DashboardSummary = {
  revenue: number;
  sales: number;
  stocks: number;
};

export const getDashboardSummary = cache(async (storeId: string, startDate?: Date | null, endDate?: Date | null): Promise<DashboardSummary> => {
  const [revenue, sales, stocks] = await Promise.all([
    getTotalRevenue(storeId, startDate, endDate),
    getSalesCount(storeId, startDate, endDate),
    getStockCount(storeId),
  ]);

  return { revenue, sales, stocks };
});
