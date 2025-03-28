
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { ReactNode } from 'react';
import prismadb from "@/lib/prismadb";
import React from "react";

export default async function SetupLayout({
    children
}: {
    children: ReactNode;
}) {
    const { userId } = auth();

    if (!userId) {
        redirect('/sign-up');
    }


    const store = await prismadb.store.findFirst({
        where: {
            userId
        }
    });

    if (store) {
        redirect(`/${store.id}`);
    }
    return (
        <>
            {children}
        </>
    )


}
