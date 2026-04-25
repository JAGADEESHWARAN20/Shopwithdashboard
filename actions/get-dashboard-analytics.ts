"use server";

import prismadb from "@/lib/prismadb";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";

export interface DashboardTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  bookings: number;
}

export interface BookingRegionPoint {
  region: string;
  bookings: number;
  customers: number;
  revenue: number;
}

export interface DashboardAnalytics {
  revenue: number;
  orders: number;
  bookings: number;
  trends: DashboardTrendPoint[];
  bookingRegions: BookingRegionPoint[];
}

type DateInput = string | Date | null | undefined;
type BookingOrderRecord = {
  id: string;
  region: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  bookingValue: number;
  advanceAmount: number;
  createdAt: Date;
};

const toDate = (value: DateInput) => {
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const roundCurrency = (value: number) => Number(value.toFixed(2));

export const getDashboardAnalytics = async (
  storeId: string,
  startDateInput?: DateInput,
  endDateInput?: DateInput,
): Promise<DashboardAnalytics> => {
  const endDate = toDate(endDateInput) ?? new Date();
  const startDate = toDate(startDateInput) ?? subDays(endDate, 6);

  const rangeStart = startOfDay(startDate);
  const rangeEnd = endOfDay(endDate);

  const bookingOrderDelegate = (
    prismadb as typeof prismadb & {
      bookingOrder: {
        findMany: (args: object) => Promise<BookingOrderRecord[]>;
      };
    }
  ).bookingOrder;

  const [orders, bookingOrders] = await Promise.all([
    prismadb.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      select: {
        createdAt: true,
        isPaid: true,
        orderItems: {
          select: {
            product: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    }),
    bookingOrderDelegate.findMany({
      where: {
        storeId,
        createdAt: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      select: {
        id: true,
        region: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        bookingValue: true,
        advanceAmount: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const trendMap = new Map<string, DashboardTrendPoint>();

  eachDayOfInterval({ start: rangeStart, end: rangeEnd }).forEach((date) => {
    const key = format(date, "yyyy-MM-dd");

    trendMap.set(key, {
      date: key,
      revenue: 0,
      orders: 0,
      bookings: 0,
    });
  });

  let revenue = 0;

  orders.forEach((order: {
    createdAt: Date;
    isPaid: boolean;
    orderItems: { product: { price: number } }[];
  }) => {
    const key = format(order.createdAt, "yyyy-MM-dd");
    const point = trendMap.get(key);

    if (point) {
      point.orders += 1;
    }

    if (!order.isPaid) {
      return;
    }

    const orderRevenue = order.orderItems.reduce(
      (total: number, item: { product: { price: number } }) => total + Number(item.product.price),
      0,
    );
    revenue += orderRevenue;

    if (point) {
      point.revenue += orderRevenue;
    }
  });

  const bookingRegionMap = new Map<
    string,
    { region: string; bookings: number; revenue: number; customers: Set<string> }
  >();

  bookingOrders.forEach((booking: BookingOrderRecord) => {
    const key = format(booking.createdAt, "yyyy-MM-dd");
    const point = trendMap.get(key);

    if (point) {
      point.bookings += 1;
      point.revenue += Number(booking.advanceAmount);
    }

    revenue += Number(booking.advanceAmount);

    const normalizedRegion = booking.region.trim() || "Unspecified";
    const customerKey =
      booking.customerPhone?.trim() ||
      booking.customerEmail?.trim() ||
      booking.customerName.trim() ||
      booking.id;

    const regionEntry = bookingRegionMap.get(normalizedRegion) ?? {
      region: normalizedRegion,
      bookings: 0,
      revenue: 0,
      customers: new Set<string>(),
    };

    regionEntry.bookings += 1;
    regionEntry.revenue += Number(booking.bookingValue || booking.advanceAmount);
    regionEntry.customers.add(customerKey);

    bookingRegionMap.set(normalizedRegion, regionEntry);
  });

  const trends = Array.from(trendMap.values()).map((point) => ({
    ...point,
    revenue: roundCurrency(point.revenue),
  }));

  const bookingRegions = Array.from(bookingRegionMap.values())
    .map((entry) => ({
      region: entry.region,
      bookings: entry.bookings,
      customers: entry.customers.size,
      revenue: roundCurrency(entry.revenue),
    }))
    .sort((left, right) => {
      if (right.bookings !== left.bookings) {
        return right.bookings - left.bookings;
      }

      return right.customers - left.customers;
    })
    .slice(0, 6);

  return {
    revenue: roundCurrency(revenue),
    orders: orders.length,
    bookings: bookingOrders.length,
    trends,
    bookingRegions,
  };
};
