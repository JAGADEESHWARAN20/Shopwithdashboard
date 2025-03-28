import prismadb from "@/lib/prismadb";
import { Billboard } from "@/types";

export const getFeaturedBillboard = async (storeId: string): Promise<Billboard | null> => {
     try {
          const billboard = await prismadb.billboard.findFirst({
               where: {
                    storeId,
                    isFeatured: true,
               },
          });

          if (!billboard) {
               return null;
          }

          return {
               id: billboard.id,
               label: billboard.label,
               imageUrl: billboard.imageUrl,
               isFeatured: billboard.isFeatured ?? false, // Provide default value
          };
     } catch (error) {
          console.error("[GET_FEATURED_BILLBOARD]", error);
          return null;
     }
};