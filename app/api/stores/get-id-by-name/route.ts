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

export async function GET(request: NextRequest) {
     try {
          const origin = request.headers.get("origin");
          console.log("[CORS_DEBUG] Handling GET request for origin:", origin);

          // Step 1: Extract the name from the query string
          const { searchParams } = new URL(request.url);
          const name = searchParams.get("name");

          // Step 2: Validate the input
          if (!name || typeof name !== "string") {
               return NextResponse.json(
                    { error: "Invalid or missing 'name' in query string" },
                    { status: 400, headers: corsHeaders(origin) }
               );
          }

          // Step 3: Query the database for a store with the matching name
          const store = await prisma.store.findFirst({
               where: {
                    name: {
                         equals: name,
                         mode: "insensitive", // Case-insensitive search
                    },
               },
               select: {
                    id: true, // Only select the store ID
               },
          });

          // Step 4: Check if a store was found
          if (!store) {
               return NextResponse.json(
                    { error: `No store found with name: ${name}` },
                    { status: 404, headers: corsHeaders(origin) }
               );
          }

          // Step 5: Return the store ID
          return NextResponse.json(
               { storeId: store.id },
               { status: 200, headers: corsHeaders(origin) }
          );
     } catch (error) {
          console.error("Error in /api/stores/get-id-by-name (GET):", error);
          const origin = request.headers.get("origin");
          return NextResponse.json(
               { error: "Internal server error" },
               { status: 500, headers: corsHeaders(origin) }
          );
     } finally {
          await prisma.$disconnect();
     }
}

// Keep the POST handler for backward compatibility (optional)
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
          console.error("Error in /api/stores/get-id-by-name (POST):", error);
          const origin = request.headers.get("origin");
          return NextResponse.json(
               { error: "Internal server error" },
               { status: 500, headers: corsHeaders(origin) }
          );
     } finally {
          await prisma.$disconnect();
     }
}