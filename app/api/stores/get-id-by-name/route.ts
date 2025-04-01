// app/api/stores/get-id-by-name/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CORS Configuration
const allowedBaseDomains = ["ecommercestore-online.vercel.app"];
const allowedExactOrigins = ["http://localhost:3000"];

const getCorsHeaders = (origin: string | null) => {
     const headers: Record<string, string> = {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
     };

     if (origin && (allowedExactOrigins.includes(origin) || allowedBaseDomains.some(domain => origin.endsWith(domain)))) {
          headers["Access-Control-Allow-Origin"] = origin;
     } else {
          headers["Access-Control-Allow-Origin"] = allowedExactOrigins[0];
     }

     return headers;
};

// Handle OPTIONS Request
export async function OPTIONS(request: NextRequest) {
     return new NextResponse(null, {
          status: 204,
          headers: getCorsHeaders(request.headers.get("origin")),
     });
}

// Fetch Store ID by Name
async function fetchStoreId(name: string) {
     return prisma.store.findFirst({
          where: { name: { equals: name, mode: "insensitive" } },
          select: { id: true },
     });
}

// Common Handler for GET and POST
async function handleRequest(request: NextRequest, method: "GET" | "POST") {
     const origin = request.headers.get("origin");
     try {
          const name = method === "GET"
               ? new URL(request.url).searchParams.get("name")
               : (await request.json()).name;

          if (!name || typeof name !== "string") {
               return NextResponse.json({ error: "Invalid or missing 'name'" }, { status: 400, headers: getCorsHeaders(origin) });
          }

          const store = await fetchStoreId(name);
          if (!store) {
               return NextResponse.json({ error: `No store found with name: ${name}` }, { status: 404, headers: getCorsHeaders(origin) });
          }

          return NextResponse.json({ storeId: store.id }, { status: 200, headers: getCorsHeaders(origin) });
     } catch (error) {
          console.error(`[ERROR] in /api/stores/get-id-by-name (${method}):`, error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: getCorsHeaders(origin) });
     } finally {
          await prisma.$disconnect();
     }
}

// GET Request Handler
export async function GET(request: NextRequest) {
     return handleRequest(request, "GET");
}

// POST Request Handler
export async function POST(request: NextRequest) {
     return handleRequest(request, "POST");
}
