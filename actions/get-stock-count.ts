"use server"; // Ensure this runs only on the server

import prismadb from "@/lib/prismadb";

export const getStockCount = async (storeId: string) => {
     let whereClause = {
          storeId,
          isArchived: false,
     };

     const stockCount = await prismadb.product.count({
          where: whereClause,
     });

     return stockCount;
};
