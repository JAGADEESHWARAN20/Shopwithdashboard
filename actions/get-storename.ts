import prismadb from "@/lib/prismadb";
import { StoreDTO } from "@/types";

export const getStoreName = async (storeId: string): Promise<StoreDTO | null> => {
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
      storeUrl: store.storeUrl || "",
      alternateUrls: store.alternateUrls || [],
      isActive: store.isActive,
      userId: store.userId,
    };
  } catch (error) {
    console.error("[GET_STORE_NAME]", error);
    return null;
  }
};
