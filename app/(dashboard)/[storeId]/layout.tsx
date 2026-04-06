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



  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      
    },
  });

  if (!store) {
    redirect(`/`);
  }

 const stores = await prismadb.store.findMany();

  return (
    <>
      <Navbar store={store} stores={stores} />
      {children}
    </>
  );
}
