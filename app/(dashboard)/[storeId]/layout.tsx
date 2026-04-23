import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../../../components/navbar";
import { ReactNode } from "react";
import { getStoreById, getStores } from "@/lib/data/stores";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [store, stores] = await Promise.all([
    getStoreById(storeId),
    getStores(),
  ]);

  if (!store) {
    redirect(`/`);
  }

  return (
    <>
      <Navbar store={store} stores={stores} />
      {children}
    </>
  );
}
