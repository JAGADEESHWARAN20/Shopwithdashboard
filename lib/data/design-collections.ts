import { cache } from "react";
import { unstable_cache } from "next/cache";
import prismadb from "@/lib/prismadb";

const REVALIDATE_SECONDS = 60;

export const getDesignCollections = cache(async (storeId: string) => {
  return unstable_cache(
    async () =>
      prismadb.designCollection.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      }),
    ["data-design-collections", storeId],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["design-collections", `design-collections:${storeId}`],
    }
  )();
});
