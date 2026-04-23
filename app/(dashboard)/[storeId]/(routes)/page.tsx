// app/(dashboard)/[storeId]/page.tsx

import DashboardPage from "./DashboardClient";
import { getDashboardSummary } from "@/lib/cache/dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const summary = await getDashboardSummary(storeId);

  return <DashboardPage storeId={storeId} initialSummary={summary} />;
}
