import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAuth } from "@clerk/nextjs/server";

// Utility function to set CORS headers
function setCorsHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
}

// Handle OPTIONS requests
export async function OPTIONS() {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

// PATCH request to update store details
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const body = await req.json();
        const { name, storeUrl } = body;
        if (!name && !storeUrl) return new NextResponse("Name or storeUrl is required", { status: 400 });

        const store = await prismadb.store.findFirst({ where: { id: params.storeId, userId } });
        if (!store) return new NextResponse("Unauthorized", { status: 403 });

        const updatedStore = await prismadb.store.update({
            where: { id: params.storeId },
            data: { ...(name && { name }), ...(storeUrl && { storeUrl }) },
        });

        return setCorsHeaders(NextResponse.json(updatedStore));
    } catch (error) {
        console.error("[STORE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// GET request to fetch store details
export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        if (!params.storeId) return new NextResponse("Store ID is required", { status: 400 });

        const store = await prismadb.store.findFirst({ where: { id: params.storeId } });
        if (!store) return new NextResponse("Store not found", { status: 404 });

        return setCorsHeaders(NextResponse.json(store));
    } catch (error) {
        console.error("[STORE_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
