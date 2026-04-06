import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
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
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
=======
  { params }: { params: { storeId: string; collectionId: string } }
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { storeId, collectionId } = await params;

    const designs = await prismadb.designItem.findMany({
      where: {
        collectionId,
        collection: { storeId },
      },
      include: {
        variations: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
=======
    if (!params.storeId || !params.collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const designs = await prismadb.designItem.findMany({
      where: {
        collectionId: params.collectionId,
        collection: {
          storeId: params.storeId,
        },
      },
      include: {
        variations: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
    });

    return corsResponse(designs, origin);
  } catch (error) {
<<<<<<< HEAD
    console.error("[DESIGNS_GET]", error);
=======
    console.error("[COLLECTION_DESIGNS_GET]", error);
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
    return errorResponse("Internal error", origin);
  }
}

export async function POST(
  req: NextRequest,
<<<<<<< HEAD
 { params }: { params: Promise<{ storeId: string; collectionId: string }> }
=======
  { params }: { params: { storeId: string; collectionId: string } }
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { storeId, collectionId } = await params; // ✅ FIX
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!storeId || !collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const { label, imageUrl, description, tags, values, variations } =
      await req.json();
=======
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.storeId || !params.collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const { label, imageUrl, description, tags, values, variations } = await req.json();
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
<<<<<<< HEAD
      where: { id: storeId, userId },
=======
      where: { id: params.storeId, userId },
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.findFirst({
      where: {
<<<<<<< HEAD
        id: collectionId,
        storeId,
=======
        id: params.collectionId,
        storeId: params.storeId,
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

<<<<<<< HEAD

=======
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
    const normalizedVariations = Array.isArray(variations)
      ? variations
          .filter((item: any) => item?.label && item?.imageUrl)
          .map((item: any, index: number) => ({
            label: String(item.label),
            imageUrl: String(item.imageUrl),
            value: item.value ? String(item.value) : null,
            sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : index,
            isActive: item.isActive !== false,
          }))
      : [];

    const design = await prismadb.designItem.create({
      data: {
<<<<<<< HEAD
        collectionId: collectionId,
=======
        collectionId: params.collectionId,
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
        title: label,
        imageUrl,
        description,
        tags: Array.isArray(values) ? values : Array.isArray(tags) ? tags : [],
        variations: normalizedVariations.length
          ? {
              createMany: {
                data: normalizedVariations,
              },
            }
          : undefined,
      },
      include: {
        variations: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return corsResponse(design, origin);
  } catch (error) {
    console.error("[COLLECTION_DESIGNS_POST]", error);
    return errorResponse("Internal error", origin);
  }
}
