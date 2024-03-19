import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        // Ensure user is authenticated
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { name } = body;

        // Validate request body
        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        // Create a new store
        const store = await prismadb.store.create({
            data: {
                name,
                userId
            }
        });

        // Return the created store
        return new NextResponse(JSON.stringify(store), { status: 201 });
    } catch (error) {
        console.error('[STORES_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
