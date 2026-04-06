import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// ================= OPTIONS =================
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

// ================= GET SINGLE COLLECTION =================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");
<<<<<<< HEAD

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
>>>>>>> 95f3d2a (new update)

  try {
    const { storeId, collectionId } = await params;

    if (!storeId || !collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
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

// ================= PATCH =================
export async function PATCH(
  req: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ collectionId: string; storeId: string }> }

=======
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
>>>>>>> 95f3d2a (new update)
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { collectionId, storeId } = await params; // ✅ FIX
    const { userId } = await auth(); // ✅ FIX

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!collectionId || !storeId) {

=======
    const { storeId, collectionId } = await params;
>>>>>>> 95f3d2a (new update)
    const { userId } = await auth();

<<<<<<< HEAD
    if (!params.collectionId || !params.storeId) {

=======
    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!storeId || !collectionId) {
>>>>>>> 95f3d2a (new update)
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const { label, coverImage, slug, isFeatured } = await req.json();

    if (!label || !coverImage || !slug) {
      return errorResponse(
        "label, coverImage and slug are required",
        origin,
        400
      );
    }

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
>>>>>>> 95f3d2a (new update)
    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[COLLECTION_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!storeId || !collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const deleted = await prismadb.designCollection.deleteMany({
      where: {
        id: collectionId,
        storeId,
      },
    });

    return corsResponse(deleted, origin);
  } catch (error) {
    console.error("[COLLECTION_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}