"use server"; // This is already present as per your code

import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string, startDate?: Date | null, endDate?: Date | null) => {
  let whereClause: any = {
    storeId,
    isPaid: true,
  };

  if (startDate) {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      // Handle single date case
      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  const paidOrders = await prismadb.order.findMany({
    where: whereClause,
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // Fixed reduce with explicit typing
  const totalRevenue = paidOrders.reduce((
    total: number,
    order: {
      orderItems: {
        product: {
          price: number;
        };
      }[];
    }
  ) => {
    return total + order.orderItems.reduce((sum, item) => sum + item.product.price, 0);
  }, 0);

  return totalRevenue;
};
