import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://nwtailormadestudio.vercel.app",
    "https://nwtailormadestudioadmin.vercel.app",
];

const getCorsHeaders = (origin: string | null): Record<string, string> => {
    const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : "";
    return {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
};

type StoreRouteParams = { storeId: string } | Promise<{ storeId: string }>;

async function resolveStoreParams(params: StoreRouteParams) {
    return await Promise.resolve(params);
}

export async function OPTIONS(req: Request): Promise<NextResponse> {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

export async function POST(
    req: Request,
    { params }: { params: StoreRouteParams }
): Promise<NextResponse> {
    try {
        const origin = req.headers.get("origin");
        const { storeId } = await resolveStoreParams(params);
        const { userId } = auth();
        const body = await req.json();
        const { name, value } = body;
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401, headers: getCorsHeaders(origin) });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400, headers: getCorsHeaders(origin) });
        }
        if (!value) {
            return new NextResponse("Value is required", { status: 400, headers: getCorsHeaders(origin) });
        }

        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400, headers: getCorsHeaders(origin) });
        }
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403, headers: getCorsHeaders(origin) })
        }

        const created = await prismadb.size.create({
            data: {
                name,
                value,
                storeId
            }
        });
        return NextResponse.json(created, { headers: getCorsHeaders(origin) });
    } catch (error) {
        console.error('[SIZES_POST]', error);
        return new NextResponse("Internal error", { status: 500, headers: getCorsHeaders(req.headers.get("origin")) });
    }
}


export async function GET(
    req: Request,
    { params }: { params: StoreRouteParams }
): Promise<NextResponse> {
    try {
        const origin = req.headers.get("origin");
        const { storeId } = await resolveStoreParams(params);

        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400, headers: getCorsHeaders(origin) });
        }

        const sizes = await prismadb.size.findMany({
            where: {
                storeId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(sizes, { headers: getCorsHeaders(origin) });
    } catch (error) {

        console.error('[SIZES_GET]', error);
        return new NextResponse("Internal error", { status: 500, headers: getCorsHeaders(req.headers.get("origin")) });
    }
}
