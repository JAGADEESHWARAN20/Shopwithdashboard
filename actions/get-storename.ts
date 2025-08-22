// actions/get-storename.ts
import prismadb from "@/lib/prismadb";
import { Store } from "@/types";

export const getStoreName = async (storeId: string): Promise<Store | any> => {
     try {
          const store = await prismadb.store.findUnique({
               where: {
                    id: storeId,
               },
          });

          if (!store) {
               return null;
          }

          return {
               id: store.id,
               name: store.name,
               storeUrl: store.storeUrl || "", // Provide default if needed
               alternateUrls: store.alternateUrls || [], // Provide default if needed
               isActive: store.isActive,
               userId: store.userId, //include the userId, as it is in the Store type.
          };
     } catch (error) {
          console.error("[GET_STORE_NAME]", error);
          return null;
     }
};