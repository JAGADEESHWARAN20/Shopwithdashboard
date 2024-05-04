"use client"
// DashboardLayout.tsx

import { useAuth } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import Navbar from '@/components/navbar'
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { storeId: string };
}) {
    
    const { userId } = useAuth();

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
