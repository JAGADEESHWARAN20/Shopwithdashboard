// app/api/stores/get-id-by-name/route.ts (in the backend project: admindashboardecom.vercel.app)
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define allowed base domains and exact origins
const allowedBaseDomains = [
     "ecommercestore-online.vercel.app", // Allow any subdomain of this
];

const allowedExactOrigins = [
     "http://localhost:3000", // Local development (adjust port as needed)
];

// CORS middleware to set headers
const corsHeaders = (origin: string | null) => {
     const headers: Record<string, string> = {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
     };

     if (!origin) {
          // If no origin (e.g., server-to-server request), set a default or disallow
          headers["Access-Control-Allow-Origin"] = allowedExactOrigins[0];
          return headers;
     }

     // Check if the origin matches an exact origin (e.g., localhost)
     if (allowedExactOrigins.includes(origin)) {
          headers["Access-Control-Allow-Origin"] = origin;
          return headers;
     }

     // Check if the origin ends with an allowed base domain (e.g., *.ecommercestore-online.vercel.app)
     const isAllowedSubdomain = allowedBaseDomains.some((baseDomain) =>
          origin.endsWith(baseDomain)
     );

     if (isAllowedSubdomain) {
          headers["Access-Control-Allow-Origin"] = origin;
     } else {
          // Fallback to a default allowed origin if the origin doesn't match
          headers["Access-Control-Allow-Origin"] = allowedExactOrigins[0];
     }

     return headers;
};

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
     const origin = request.headers.get("origin");
     return new NextResponse(null, {
          status: 204,
          headers: corsHeaders(origin),
     });
}

export async function POST(request: NextRequest) {
     try {
          const origin = request.headers.get("origin");

          // Step 1: Parse the request body
          const body = await request.json();
          const { name } = body;

          // Step 2: Validate the input
          if (!name || typeof name !== "string") {
               return NextResponse.json(
                    { error: "Invalid or missing 'name' in request body" },
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