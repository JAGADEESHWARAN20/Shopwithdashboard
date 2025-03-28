import prismadb from "@/lib/prismadb";

export const getStoreName = async (storeId: string) => {
     try {
          const store = await prismadb.store.findUnique({
               where: { id: storeId },
               select: { id: true, name: true },
          });

          if (!store) {
               return null;
          }

          return { storeId: store.id, storeName: store.name };
     } catch (error) {
          console.error("[GET_STORE_NAME]", error);
          return null;
     }
};