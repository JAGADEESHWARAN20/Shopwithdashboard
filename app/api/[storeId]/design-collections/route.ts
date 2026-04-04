import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// Handle Preflight OPTIONS request
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();

    const collection = await prismadb.designCollection.create({
      data: {
        ...body,
        storeId: params.storeId
      }
    });

    return corsResponse(collection, origin);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
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

    return corsResponse(collections, origin);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return errorResponse("Internal error", origin);
  }
}