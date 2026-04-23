import { cache } from "react";
import { unstable_cache } from "next/cache";
import prismadb from "@/lib/prismadb";

const STORE_REVALIDATE_SECONDS = 120;

export const getStoreById = cache(async (storeId: string) => {
  return unstable_cache(
    async () => {
      return prismadb.store.findUnique({ where: { id: storeId } });
    },
    ["store-by-id", storeId],
    {
      revalidate: STORE_REVALIDATE_SECONDS,
      tags: ["stores", `store:${storeId}`],
    }
  )();
});

export const getStores = cache(async () => {
  return unstable_cache(
    async () => prismadb.store.findMany({ orderBy: { createdAt: "desc" } }),
    ["stores-list"],
    {
      revalidate: STORE_REVALIDATE_SECONDS,
      tags: ["stores"],
    }
  )();
});
