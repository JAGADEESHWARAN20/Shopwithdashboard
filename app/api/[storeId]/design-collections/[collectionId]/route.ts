import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// OPTIONS
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

// GET SINGLE COLLECTION
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId } = await params;

    if (!storeId || !collectionId) {
      return errorResponse("Missing params", origin, 400);
    }

    const collection = await prismadb.designCollection.findFirst({
      where: { id: collectionId, storeId },
      include: {
        designs: {
          include: {
            variations: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
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

// PATCH
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const body = await req.json();
    const { label, coverImage, slug, isFeatured } = body;

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const updated = await prismadb.designCollection.update({
      where: { id: collectionId },
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
      },
    });

    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[COLLECTION_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    await prismadb.designCollection.delete({
      where: { id: collectionId },
    });

    return corsResponse({ success: true }, origin);
  } catch (error) {
    console.error("[COLLECTION_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}