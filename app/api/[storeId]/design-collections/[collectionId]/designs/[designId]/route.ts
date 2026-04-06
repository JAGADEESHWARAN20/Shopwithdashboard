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
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const design = await prismadb.designItem.findFirst({
      where: {
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
      },
      include: {
        variations: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!design) return errorResponse("Design not found", origin, 404);

    return corsResponse(design, origin);
  } catch (error) {
    console.error("[COLLECTION_DESIGN_GET]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const { label, imageUrl, description, tags, values, variations } = await req.json();

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const existing = await prismadb.designItem.findFirst({
      where: {
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
      },
    });

    if (!existing) return errorResponse("Design not found", origin, 404);

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

    await prismadb.designItem.update({
      where: { id: params.designId },
      data: {
        title: label,
        imageUrl,
        description,
        tags: Array.isArray(values) ? values : Array.isArray(tags) ? tags : [],
        variations: {
          deleteMany: {},
        },
      },
    });

    const updated = await prismadb.designItem.update({
      where: { id: params.designId },
      data: {
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

    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[COLLECTION_DESIGN_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const deleted = await prismadb.designItem.deleteMany({
      where: {
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
      },
    });

    return corsResponse(deleted, origin);
  } catch (error) {
    console.error("[COLLECTION_DESIGN_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}
