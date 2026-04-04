import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest, { params }: { params: { collectionId: string } }) {
  const origin = req.headers.get("origin");
  try {
    const collection = await prismadb.designCollection.findUnique({
      where: { id: params.collectionId },
      include: { designs: true }
    });
    
    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

    return corsResponse(collection, origin);
  } catch (error) {
    console.error("[COLLECTION_GET]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { collectionId: string } }) {
  const origin = req.headers.get("origin");
  try {
    const body = await req.json();
    const updated = await prismadb.designCollection.update({
      where: { id: params.collectionId },
      data: body
    });
    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[COLLECTION_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}