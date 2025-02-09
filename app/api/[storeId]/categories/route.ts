// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import prismadb from "@/lib/prismadb";

// const allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"]; // Add your frontend domains

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*", // Change "*" to a specific domain if needed
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//     return new NextResponse(null, {
//         status: 204,
//         headers: corsHeaders,
//     });
// }

// export async function POST(
//     req: Request,
//     { params }: { params: { storeId: string } }
// ) {
//     try {
//         // Ensure user is authenticated
//         const { userId } = auth();
//         const body = await req.json();
//         const { name, billboardId } = body;
//         if (!userId) {
//             return new NextResponse("Unauthorized", { status: 401 });
//         }

//         if (!name) {
//             return new NextResponse("Name is required", { status: 400 });
//         }
//         if (!billboardId) {
//             return new NextResponse("Billboard Id is required", { status: 400 });
//         }

//         if (!params.storeId) {
//             return new NextResponse("Store ID is required", { status: 400 });
//         }
//         const storeByUserId = await prismadb.store.findFirst({
//             where: {
//                 id: params.storeId,
//                 userId
//             }
//         });

//         if (!storeByUserId) {
//             return new NextResponse("Unauthorized", { status: 403 })
//         }

//         const categories = await prismadb.category.create({
//             data: {
//                 name,
//                 billboardId,
//                 storeId: params.storeId
//             }
//         });
//         return NextResponse.json(categories);
//     } catch (error) {
//         console.error('[CATEGORIES_POST]', error);
//         return new NextResponse("Internal error", { status: 500 });
//     }
// }


// export async function GET(
//     req: Request,
//     { params }: { params: { storeId: string } }
// ) {
//     try {

//         if (!params.storeId) {
//             return new NextResponse("Store ID is required", { status: 400 });
//         }


//         const categories = await prismadb.category.findMany({
//             where: {
//                 storeId: params.storeId,
//             },
//         });
//         return NextResponse.json(categories);
//     } catch (error) {

//         console.error('[CATEGORIES_GET]', error);
//         return new NextResponse("Internal error", { status: 500 });
//     }
// }


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

const allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"]; // Define allowed domains

const getCorsHeaders = (origin) => ({
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "https://yourdomain.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export async function OPTIONS(req) {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

export async function POST(req, { params }) {
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
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        const origin = req.headers.get("origin");

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400, headers: getCorsHeaders(origin) });
        }

        const categories = await prismadb.category.findMany({ where: { storeId: params.storeId } });

        return NextResponse.json(categories, { headers: getCorsHeaders(origin) });
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
