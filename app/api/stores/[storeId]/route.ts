// import { auth } from "@clerk/nextjs/server";
// import type { NextApiRequest, NextApiResponse } from "next";
// import prismadb from "@/lib/prismadb";

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     if (req.method !== "POST") {
//         return res.status(405).json({ error: "Method Not Allowed" });
//     }

//     try {
//         const { userId } = auth();

//         const { name } = req.body;

//         if (!userId) {
//             return res.status(401).json({ error: "Not authenticated" });
//         }
//         if (!name) {
//             return res.status(400).json({ error: "Name is required" });
//         }

//         // Create a new store
//         const store = await prismadb.store.create({
//             data: {
//                 name,
//                 userId,
//             },
//         });

//         return res.status(201).json(store);
//     } catch (error) {
//         console.error("[STORES_POST]", error);
//         return res.status(500).json({ error: "Internal error" });
//     }
// }

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { name } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }
        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }
        const store = await prismadb.store.updateMany({
            where: {
                id: params.storeId,
                userId
            },
            data: {
                name
            }
        })
        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 })

    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();


        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }
        const store = await prismadb.store.deleteMany({
            where: {
                id: params.storeId,
                userId
            },
        })
        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 })

    }
}