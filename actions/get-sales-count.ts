"use server"; // Ensure this runs only on the server

import prismadb from "@/lib/prismadb";

export const getSalesCount = async (storeId: string, startDate?: Date | null, endDate?: Date | null) => {
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

     const salesCount = await prismadb.order.count({
          where: whereClause,
     });

     return salesCount;
};