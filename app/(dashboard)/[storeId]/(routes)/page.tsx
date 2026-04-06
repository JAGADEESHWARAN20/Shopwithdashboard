// app/(dashboard)/[storeId]/page.tsx

import DashboardPage from "./DashboardClient";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return <DashboardPage storeId={storeId} />;
}