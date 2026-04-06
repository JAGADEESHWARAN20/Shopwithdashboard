import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function GET(
  req: NextRequest,
<<<<<<< HEAD
  { params }: { params: { collectionId: string; storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.collectionId || !params.storeId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const collection = await prismadb.designCollection.findFirst({
      where: { id: params.collectionId, storeId: params.storeId },
      include: {
        designs: {
          include: {
            variations: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }
=======
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16

  try {
    const { storeId, collectionId } = await params;

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

    if (!collection) return errorResponse("Collection not found", origin, 404);

    return corsResponse(collection, origin); // ✅ SINGLE
  } catch (error) {
    return errorResponse("Internal error", origin);
  }
}

export async function PATCH(
  req: NextRequest,
<<<<<<< HEAD
  { params }: { params: { collectionId: string; storeId: string } }
=======
  { params }: { params: Promise<{ collectionId: string; storeId: string }> }
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.collectionId || !params.storeId) {
=======
    const { collectionId, storeId } = await params; // ✅ FIX
    const { userId } = await auth(); // ✅ FIX

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!collectionId || !storeId) {
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const { label, coverImage, slug, isFeatured } = await req.json();

    if (!label || !coverImage || !slug) {
      return errorResponse("label, coverImage and slug are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
<<<<<<< HEAD
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const updated = await prismadb.designCollection.update({
      where: { id: params.collectionId },
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
      },
    });

=======
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

>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[COLLECTION_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string; storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { userId } =await auth();
=======
    const { userId } = await auth();
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.collectionId || !params.storeId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const deleted = await prismadb.designCollection.deleteMany({
      where: {
        id: params.collectionId,
        storeId: params.storeId,
      },
    });

    return corsResponse(deleted, origin);
  } catch (error) {
    console.error("[COLLECTION_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}
