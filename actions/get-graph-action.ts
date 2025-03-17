"use server";

import { DateRange } from "react-day-picker";
import prismadb from "@/lib/prismadb";
import { startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";

export interface GraphDataPoint {
     date: string;
     value: number;
}

export const fetchGraphData = async (
     storeId: string,
     dateRangeOrSingleDate: DateRange | Date | undefined,
     drillDownMonth?: number // Optional: Month for drill-down
): Promise<GraphDataPoint[]> => {
     try {
          if (!dateRangeOrSingleDate) return [];

          let startDate: Date | undefined;
          let endDate: Date | undefined;

          if (dateRangeOrSingleDate instanceof Date) {
               startDate = dateRangeOrSingleDate;
               endDate = dateRangeOrSingleDate;
          } else if (dateRangeOrSingleDate.from) {
               startDate = dateRangeOrSingleDate.from;
               endDate = dateRangeOrSingleDate.to || dateRangeOrSingleDate.from;
          }

          if (!startDate || !endDate) return [];

          const startOfDayDate = startOfDay(startDate);
          const endOfDayDate = endOfDay(endDate);

          const paidOrders = await prismadb.order.findMany({
               where: {
                    storeId,
                    isPaid: true,
                    createdAt: {
                         gte: startOfDayDate,
                         lte: endOfDayDate,
                    },
               },
               include: {
                    orderItems: {
                         include: {
                              product: true,
                         },
                    },
               },
          });

          // Initialize all dates in range with zero sales
          const dailyData: { [date: string]: number } = {};
          eachDayOfInterval({ start: startOfDayDate, end: endOfDayDate }).forEach((date) => {
               dailyData[format(date, "yyyy-MM-dd")] = 0;
          });

          paidOrders.forEach((order) => {
               const orderDate = new Date(order.createdAt);
               if (drillDownMonth !== undefined && orderDate.getMonth() !== drillDownMonth) {
                    return; // Skip orders outside the specified month
               }

               const dateKey = format(order.createdAt, "yyyy-MM-dd");
               const orderTotal = order.orderItems.reduce((sum, item) => sum + item.product.price, 0);
               dailyData[dateKey] += orderTotal;
          });

          return Object.entries(dailyData).map(([date, value]) => ({ date, value }));
     } catch (error) {
          console.error("Error fetching graph data:", error);
          return [];
     }
};
