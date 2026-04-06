"use client";

import { useRouteLoader } from "@/hooks/use-route-loader";
import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoadingOverlay() {
  const isLoading = useRouteLoader((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/65 backdrop-blur-sm">
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
