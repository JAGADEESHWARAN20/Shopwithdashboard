import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";

// ✅ Your frontend domain
const ALLOWED_ORIGIN = "https://nwtailormadestudio.vercel.app";

// ✅ CORS headers
function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ✅ Handle preflight request (VERY IMPORTANT)
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

// ✅ POST
export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();

    const collection = await prismadb.designCollection.create({
      data: {
        ...body,
        storeId: params.storeId,
      },
    });

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);

    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }
}

// ✅ GET
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const collections = await prismadb.designCollection.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        designs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(collections), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);

    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }
}