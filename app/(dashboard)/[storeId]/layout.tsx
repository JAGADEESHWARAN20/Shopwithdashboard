import { auth } from "@clerk/nextjs/server"; // ✅ use auth (NOT getAuth)
import { redirect } from "next/navigation";
import Navbar from "../../../components/navbar";
import prismadb from "../../../lib/prismadb";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { storeId: string };
}) {
  const { userId } = await auth(); // ✅ IMPORTANT: await here

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  if (!store) {
    redirect(`/`);
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  });

  return (
    <>
      <Navbar store={store} stores={stores} />
      {children}
    </>
  );
}