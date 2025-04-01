// app/api/stores/get-id-by-name/route.ts (in the backend project: admindashboardecom.vercel.app)
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allowedBaseDomains = [
     "ecommercestore-online.vercel.app",
];

const allowedExactOrigins = [
     "http://localhost:3000",
];

const corsHeaders = (origin: string | null) => {
     const headers: Record<string, string> = {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
     };

     console.log("[CORS_DEBUG] Origin received:", origin);

     if (!origin) {
          console.log("[CORS_DEBUG] No origin provided, using default:", allowedExactOrigins[0]);
          headers["Access-Control-Allow-Origin"] = allowedExactOrigins[0];
          return headers;
     }

     if (allowedExactOrigins.includes(origin)) {
          console.log("[CORS_DEBUG] Exact origin match:", origin);
          headers["Access-Control-Allow-Origin"] = origin;
          return headers;
     }

     const isAllowedSubdomain = allowedBaseDomains.some((baseDomain) => {
          const matches = origin.endsWith(baseDomain);
          console.log(`[CORS_DEBUG] Checking if ${origin} ends with ${baseDomain}: ${matches}`);
          return matches;
     });

     if (isAllowedSubdomain) {
          console.log("[CORS_DEBUG] Subdomain allowed:", origin);
          headers["Access-Control-Allow-Origin"] = origin;
     } else {
          console.log("[CORS_DEBUG] Origin not allowed, using default:", allowedExactOrigins[0]);
          headers["Access-Control-Allow-Origin"] = allowedExactOrigins[0];
     }

     console.log("[CORS_DEBUG] Final headers:", headers);
     return headers;
};

export async function OPTIONS(request: NextRequest) {
     const origin = request.headers.get("origin");
     console.log("[CORS_DEBUG] Handling OPTIONS request for origin:", origin);
     return new NextResponse(null, {
          status: 204,
          headers: corsHeaders(origin),
     });
}

export async function POST(request: NextRequest) {
     try {
          const origin = request.headers.get("origin");
          console.log("[CORS_DEBUG] Handling POST request for origin:", origin);

          const body = await request.json();
          const { name } = body;

          if (!name || typeof name !== "string") {
               return NextResponse.json(
                    { error: "Invalid or missing 'name' in request body" },
                    { status: 400, headers: corsHeaders(origin) }
               );
          }

          const store = await prisma.store.findFirst({
               where: {
                    name: {
                         equals: name,
                         mode: "insensitive",
                    },
               },
               select: {
                    id: true,
               },
          });

          if (!store) {
               return NextResponse.json(
                    { error: `No store found with name: ${name}` },
                    { status: 404, headers: corsHeaders(origin) }
               );
          }

          return NextResponse.json(
               { storeId: store.id },
               { status: 200, headers: corsHeaders(origin) }
          );
     } catch (error) {
          console.error("Error in /api/stores/get-id-by-name:", error);
          const origin = request.headers.get("origin");
          return NextResponse.json(
               { error: "Internal server error" },
               { status: 500, headers: corsHeaders(origin) }
          );
     } finally {
          await prisma.$disconnect();
     }
}