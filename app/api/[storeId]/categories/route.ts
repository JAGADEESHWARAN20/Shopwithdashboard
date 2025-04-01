import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// Define allowed origins for CORS
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3002", // Add your local dev frontend port
    "https://ecommercestore-online.vercel.app",
    "https://kajol-ecommercestore-online.vercel.app", // Replace with your production frontend domain
];

const getCorsHeaders = (origin: string | null): Record<string, string> => {
    const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : "";
    return {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
};

export async function OPTIONS(req: Request): Promise<NextResponse> {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
): Promise<NextResponse> {
    try {
        const origin = req.headers.get("origin");
        const { userId } = auth();
        const body = await req.json();
        const { name, billboardId } = body;

        if (!userId) return new NextResponse("Unauthorized", { status: 401, headers: getCorsHeaders(origin) });
        if (!name) return new NextResponse("Name is required", { status: 400, headers: getCorsHeaders(origin) });
        if (!billboardId) return new NextResponse("Billboard Id is required", { status: 400, headers: getCorsHeaders(origin) });
        if (!params.storeId) return new NextResponse("Store ID is required", { status: 400, headers: getCorsHeaders(origin) });

        const storeByUserId = await prismadb.store.findFirst({
            where: { id: params.storeId, userId },
        });

        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403, headers: getCorsHeaders(origin) });

        const category = await prismadb.category.create({
            data: { name, billboardId, storeId: params.storeId },
        });

        return NextResponse.json(category, { headers: getCorsHeaders(origin) });
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal error", { status: 500, headers: getCorsHeaders(origin) });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
): Promise<NextResponse> {
    try {
        const origin = req.headers.get("origin");

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400, headers: getCorsHeaders(origin) });
        }

        const categories = await prismadb.category.findMany({
            where: { storeId: params.storeId },
        });

        return NextResponse.json(categories, { headers: getCorsHeaders(origin) });
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal error", { status: 500, headers: getCorsHeaders(origin) });
    }
}