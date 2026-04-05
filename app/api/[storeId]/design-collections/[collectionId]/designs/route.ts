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
  { params }: { params: { storeId: string; collectionId: string } }
) {
  const origin = req.headers.get("origin");

  try {
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
    });

    return corsResponse(designs, origin);
  } catch (error) {
    console.error("[COLLECTION_DESIGNS_GET]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.storeId || !params.collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const { label, imageUrl, description, tags, values, variations } = await req.json();

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.findFirst({
      where: {
        id: params.collectionId,
        storeId: params.storeId,
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

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
        collectionId: params.collectionId,
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
