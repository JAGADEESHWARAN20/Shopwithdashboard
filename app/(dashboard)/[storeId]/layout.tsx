
// DashboardLayout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from '@/components/navbar'
import prismadb from "@/lib/prismadb";
import { ReactNode } from "react"


export default async function DashboardLayout({
    children,
    params,

}: {
    children: ReactNode;
    params: { storeId: string };
}) {

    const { userId } = auth();

    if (!userId) {
        redirect('/sign-in')
    }


    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId
        }
    });

    if (!store) {
        redirect(`/`);
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
