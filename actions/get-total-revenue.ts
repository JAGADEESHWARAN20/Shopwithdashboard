"use server"; // Add this at the top

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

     const totalRevenue = paidOrders.reduce((total, order) => {
          return total + order.orderItems.reduce((sum, item) => sum + item.product.price, 0);
     }, 0);

     return totalRevenue;
};