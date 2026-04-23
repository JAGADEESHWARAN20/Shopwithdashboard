import { cache } from "react";
import { unstable_cache } from "next/cache";
import prismadb from "@/lib/prismadb";

const REVALIDATE_SECONDS = 60;

export const getRecentWorks = cache(async (storeId: string) => {
  return unstable_cache(
    async () =>
      prismadb.recentWork.findMany({
        where: { category: { storeId } },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    ["data-recentworks", storeId],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["recentworks", `recentworks:${storeId}`],
    }
  )();
});
