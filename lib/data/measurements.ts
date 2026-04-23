import { cache } from "react";
import { unstable_cache } from "next/cache";
import prismadb from "@/lib/prismadb";

const REVALIDATE_SECONDS = 60;

export const getMeasurements = cache(async (storeId: string) => {
  return unstable_cache(
    async () =>
      prismadb.measurement.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      }),
    ["data-measurements", storeId],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["measurements", `measurements:${storeId}`],
    }
  )();
});
