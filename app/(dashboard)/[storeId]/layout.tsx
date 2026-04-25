import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../../../components/navbar";
import prismadb from "../../../lib/prismadb";
import { ReactNode } from "react";

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
    redirect(`/`);
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      storeUrl: true,
    },
  });

  if (!store) {
    redirect(`/`);
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
   select: {
     id: true,
     name: true,
     isActive: true,
   },
 });

  return (
    <>
      <Navbar store={store} stores={stores} />
      {children}
    </>
  );
}
